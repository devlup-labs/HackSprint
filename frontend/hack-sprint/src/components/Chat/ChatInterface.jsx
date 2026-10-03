import React, { useState, useEffect, useCallback, useRef } from "react";
import { Send, MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import MessageBubble from "./MessageBubble";
import { DiscussionAPI } from "../../api/discussion.api.js";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 20;
const POLL_MS = 6000;
const NEAR_BOTTOM_PX = 120;

// Replies own their own delete handling entirely — this was the source of
// the "deleted reply doesn't disappear" bug: the old code routed reply
// deletes through the parent's message-list updater, which only ever
// searched the top-level messages array (replies live here, in this
// component's own local state, not there).
const Replies = ({ messageId, currentUserId, refreshKey }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    DiscussionAPI.getReplies(messageId)
      .then((res) => {
        if (active) setReplies(res.data.replies || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [messageId, refreshKey]);

  const handleDeleteReply = async (replyId) => {
    try {
      await DiscussionAPI.deleteMessage(replyId);
      setReplies((prev) =>
        prev.map((r) => (r._id === replyId ? { ...r, content: "[deleted]", isDeleted: true } : r))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete reply");
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 pl-9 py-2 text-muted-foreground">
        <Loader2 size={12} className="animate-spin" />
        <span className="text-xs">Loading replies…</span>
      </div>
    );

  if (replies.length === 0)
    return <p className="pl-9 py-2 text-xs text-muted-foreground">No replies yet.</p>;

  return (
    <div className="pl-6 border-l border-border flex flex-col gap-1">
      {replies.map((r) => (
        <MessageBubble
          key={r._id}
          message={r}
          isMe={String(r.sender?._id || r.sender) === String(currentUserId)}
          onDelete={handleDeleteReply}
        />
      ))}
    </div>
  );
};

const ChatInterface = ({ hackathonId }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyRefresh, setReplyRefresh] = useState({});
  const scrollRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  };

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  // Backend returns newest-first pages; page 1 is reversed into chronological
  // order and older pages are prepended above it, preserving scroll offset.
  const loadMessages = useCallback(
    async (pageNum) => {
      if (!hackathonId) return;
      const prevScrollHeight = scrollRef.current?.scrollHeight || 0;
      try {
        setIsLoading(true);
        const res = await DiscussionAPI.getMessages(hackathonId, {
          page: pageNum,
          limit: PAGE_SIZE,
        });
        const raw = res.data.messages || [];
        const chronological = [...raw].reverse();
        setMessages((prev) =>
          pageNum === 1 ? chronological : [...chronological, ...prev]
        );
        setHasMore(raw.length === PAGE_SIZE);
        setPage(pageNum);

        if (pageNum === 1) {
          scrollToBottom();
        } else {
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight - prevScrollHeight;
            }
          });
        }
      } catch {
        toast.error("Failed to load discussion");
      } finally {
        setIsLoading(false);
      }
    },
    [hackathonId]
  );

  useEffect(() => {
    loadMessages(1);
  }, [loadMessages]);

  // Polling stand-in for real-time — there's no WebSocket/SSE layer in this
  // app yet, so this is what makes new messages (and deletes) from other
  // people show up without a manual refresh. Merges by id instead of
  // replacing wholesale, and only auto-scrolls if the viewer was already
  // near the bottom, so it never yanks someone away from history they're
  // reading.
  useEffect(() => {
    if (!hackathonId) return;
    const interval = setInterval(async () => {
      try {
        const wasNearBottom = isNearBottom();
        const res = await DiscussionAPI.getMessages(hackathonId, {
          page: 1,
          limit: PAGE_SIZE,
        });
        const fresh = [...(res.data.messages || [])].reverse();
        const freshById = new Map(fresh.map((m) => [m._id, m]));
        const current = messagesRef.current;
        const currentIds = new Set(current.map((m) => m._id));

        const merged = current.map((m) => freshById.get(m._id) || m);
        const appended = fresh.filter((m) => !currentIds.has(m._id));

        if (appended.length > 0 || merged.some((m, i) => m !== current[i])) {
          setMessages([...merged, ...appended]);
          if (appended.length > 0 && wasNearBottom) scrollToBottom();
        }

        // Nudge any open reply threads to refetch too, same "feels live"
        // idea applied to replies.
        if (expandedRef.current.size > 0) {
          setReplyRefresh((prev) => {
            const next = { ...prev };
            expandedRef.current.forEach((id) => {
              next[id] = (next[id] || 0) + 1;
            });
            return next;
          });
        }
      } catch {
        // Silent — a missed poll tick isn't worth surfacing to the user.
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [hackathonId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to join the discussion");
      return;
    }
    if (!newMessage.trim()) return;
    setPosting(true);
    try {
      const res = await DiscussionAPI.createMessage(hackathonId, {
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post message");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (messageId) => {
    const content = (replyDrafts[messageId] || "").trim();
    if (!content) return;
    try {
      await DiscussionAPI.createMessage(hackathonId, {
        content,
        parentMessage: messageId,
      });
      setReplyDrafts((prev) => ({ ...prev, [messageId]: "" }));
      setReplyRefresh((prev) => ({ ...prev, [messageId]: (prev[messageId] || 0) + 1 }));
      setExpanded((prev) => new Set(prev).add(messageId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await DiscussionAPI.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, content: "[deleted]", isDeleted: true } : m
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border flex-shrink-0">
          <MessageSquare size={16} className="text-primary" />
          <span className="font-display font-bold text-foreground text-sm">Discussion</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1 h-[65vh]">
          {isLoading && messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs">Loading…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageSquare size={32} className="opacity-40" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {hasMore && (
                <button
                  onClick={() => loadMessages(page + 1)}
                  disabled={isLoading}
                  className="self-center mb-2 text-xs font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
                >
                  {isLoading ? "Loading…" : "Load earlier messages"}
                </button>
              )}

              {messages.map((msg) => {
                const isOpen = expanded.has(msg._id);
                const isMe = String(msg.sender?._id || msg.sender) === String(user?._id);
                return (
                  <div key={msg._id} className="mb-2">
                    <MessageBubble message={msg} isMe={isMe} onDelete={handleDelete} />
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"} pl-9 -mt-1`}>
                      <button
                        onClick={() => toggleExpanded(msg._id)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Replies
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-2 pl-9 flex flex-col gap-2">
                        <Replies
                          messageId={msg._id}
                          currentUserId={user?._id}
                          refreshKey={replyRefresh[msg._id] || 0}
                        />
                        {isAuthenticated && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyDrafts[msg._id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [msg._id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleReply(msg._id);
                                }
                              }}
                              placeholder="Write a reply…"
                              className="flex-1 bg-secondary border border-border rounded-full px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                            />
                            <button
                              onClick={() => handleReply(msg._id)}
                              disabled={!(replyDrafts[msg._id] || "").trim()}
                              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Send size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <form onSubmit={handlePost} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAuthenticated ? "Share your thoughts…" : "Login to join the discussion"}
              disabled={!isAuthenticated || posting}
              className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isAuthenticated || !newMessage.trim() || posting}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
