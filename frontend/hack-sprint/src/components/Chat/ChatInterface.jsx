import React, { useState, useEffect, useCallback, useRef } from "react";
import { Send, MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import MessageBubble from "./MessageBubble";
import { DiscussionAPI } from "../../api/discussion.api.js";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 20;

const Replies = ({ messageId, currentUserId, onDelete, refreshKey }) => {
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

  if (loading)
    return (
      <div className="flex items-center gap-2 pl-9 py-2 text-[rgba(95,255,96,0.35)]">
        <Loader2 size={12} className="animate-spin" />
        <span className="text-[0.55rem] tracking-[0.08em] uppercase">Loading replies…</span>
      </div>
    );

  if (replies.length === 0)
    return (
      <p className="pl-9 py-2 text-[0.58rem] text-[rgba(180,220,180,0.3)]">
        No replies yet.
      </p>
    );

  return (
    <div className="pl-6 border-l border-[rgba(95,255,96,0.08)] flex flex-col gap-1">
      {replies.map((r) => (
        <MessageBubble
          key={r._id}
          message={r}
          isMe={String(r.sender?._id || r.sender) === String(currentUserId)}
          onDelete={onDelete}
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

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
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
    <div className="w-full max-w-2xl mx-auto font-[family-name:'JetBrains_Mono',monospace]">
      <div className="relative bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] backdrop-blur-sm flex flex-col overflow-hidden">
        <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)] z-10" />
        <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)] z-10" />

        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[rgba(95,255,96,0.08)] bg-[rgba(8,10,8,0.7)] flex-shrink-0">
          <MessageSquare size={14} className="text-[rgba(95,255,96,0.55)]" />
          <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm tracking-tight">
            Discussion
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1 h-[65vh]"
        >
          {isLoading && messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-[rgba(95,255,96,0.35)]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[0.6rem] tracking-[0.1em] uppercase">Loading…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[rgba(95,255,96,0.25)]">
              <MessageSquare size={32} />
              <p className="text-[0.6rem] tracking-[0.08em] uppercase">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {hasMore && (
                <button
                  onClick={() => loadMessages(page + 1)}
                  disabled={isLoading}
                  className="self-center mb-2 text-[0.58rem] tracking-[0.08em] uppercase text-[rgba(95,255,96,0.45)] hover:text-[#5fff60] transition-colors cursor-pointer disabled:opacity-40"
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
                        className="flex items-center gap-1 text-[0.55rem] tracking-[0.08em] uppercase text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] transition-colors cursor-pointer"
                      >
                        {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        Replies
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-2 pl-9 flex flex-col gap-2">
                        <Replies
                          messageId={msg._id}
                          currentUserId={user?._id}
                          onDelete={handleDelete}
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
                              className="flex-1 bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.1)] rounded-[3px] px-3 py-2 text-[0.65rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.2)] focus:outline-none focus:border-[rgba(95,255,96,0.32)] [color-scheme:dark]"
                            />
                            <button
                              onClick={() => handleReply(msg._id)}
                              disabled={!(replyDrafts[msg._id] || "").trim()}
                              className="px-3 py-2 rounded-[3px] border border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.4)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Send size={11} />
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

        <div className="px-4 py-3 border-t border-[rgba(95,255,96,0.08)] flex-shrink-0">
          <form onSubmit={handlePost} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                isAuthenticated ? "Share your thoughts…" : "Login to join the discussion"
              }
              disabled={!isAuthenticated || posting}
              className="flex-1 bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.12)] rounded-[3px] px-3 py-2.5 text-[0.7rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.22)] focus:outline-none focus:border-[rgba(95,255,96,0.38)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.05)] transition-all [color-scheme:dark] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isAuthenticated || !newMessage.trim() || posting}
              className="font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer transition-all duration-150 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_16px_rgba(95,255,96,0.28)] disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send size={12} />
              <span className="hidden sm:inline">Post</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
