import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, ChevronLeft, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { ConnectionsAPI } from "../../api/connections.api.js";
import { MessagesAPI } from "../../api/messages.api.js";
import FriendMessageBubble from "./FriendMessageBubble.jsx";
import { useMessageOutbox } from "../../hooks/useMessageOutbox.js";

const THREAD_POLL_MS = 6000;
const LIST_POLL_MS = 15000;
const NEAR_BOTTOM_PX = 120;

const FriendsChat = () => {
  const { user, isAuthenticated: loggedIn, role } = useAuth();
  // Organiser / admin accounts don't have friends or direct messages.
  const isAuthenticated = loggedIn && role !== "admin";
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const outbox = useMessageOutbox({
    userId: user?._id,
    enabled: isAuthenticated,
    onDelivered: (item, message) => {
      if (selectedRef.current?._id === item.friendId) {
        setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      }
    },
  });

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

  const loadFriends = useCallback(() => {
    if (!isAuthenticated) return;
    ConnectionsAPI.listFriends()
      .then((res) => setFriends(res.data.friends || []))
      .catch(() => {})
      .finally(() => setLoadingFriends(false));
  }, [isAuthenticated]);

  // Ambient list refresh so the floating bubble's unread dot and each
  // friend's last-message preview stay current even while the panel is
  // closed — there's no push channel for ongoing chat, just this.
  useEffect(() => {
    if (!isAuthenticated) return;
    loadFriends();
    const interval = setInterval(loadFriends, LIST_POLL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadFriends]);

  const openThread = useCallback(
    (friend) => {
      setSelected(friend);
      setMessages([]);
      setLoadingMessages(true);
      MessagesAPI.list(friend._id)
        .then((res) => {
          setMessages([...(res.data.messages || [])].reverse());
          scrollToBottom();
        })
        .catch(() => toast.error("Couldn't load that conversation"))
        .finally(() => setLoadingMessages(false));
    },
    []
  );

  // Jumping straight into the thread from a notification — fired both when
  // the original sender clicks "X accepted your connection" and right after
  // the recipient's own reply-to-accept, so neither side is left staring at
  // a toast instead of the conversation that just opened.
  useEffect(() => {
    const handleOpenFriendChat = (e) => {
      const { friendId, friend } = e.detail || {};
      if (!friendId && !friend) return;
      setOpen(true);
      const known = friends.find((f) => f.friend._id === friendId);
      if (known) {
        openThread(known.friend);
      } else if (friend) {
        openThread(friend);
      }
      loadFriends();
    };
    window.addEventListener("hacksprint:open-friend-chat", handleOpenFriendChat);
    return () =>
      window.removeEventListener("hacksprint:open-friend-chat", handleOpenFriendChat);
  }, [friends, openThread, loadFriends]);

  // Polling stand-in for real-time, same convention as the hackathon
  // discussion chat — merges by id, only auto-scrolls if already near the
  // bottom.
  useEffect(() => {
    if (!open || !selected) return;
    const interval = setInterval(async () => {
      try {
        const wasNearBottom = isNearBottom();
        const res = await MessagesAPI.list(selected._id);
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
      } catch {
        // Silent — a missed poll tick isn't worth surfacing.
      }
    }, THREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [open, selected]);

  // Saved on the device first and sent in the background, so the draft clears
  // at once and a dropped connection just delays delivery instead of losing it.
  const handleSend = () => {
    const content = draft.trim();
    if (!content || !selected) return;
    outbox.enqueue(selected._id, content);
    setDraft("");
    scrollToBottom();
  };

  const goBack = () => {
    setSelected(null);
    setMessages([]);
    loadFriends();
  };

  if (!isAuthenticated) return null;

  const pending = selected
    ? outbox.queue.filter(
        (p) => p.friendId === selected._id && !messages.some((m) => m.clientId === p.clientId)
      )
    : [];

  const hasUnread = friends.some(
    (f) => f.lastMessage && String(f.lastMessage.sender) === String(f.friend._id)
  );

  return (
    <>
      <style>{`
        @keyframes fc-in { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .fc-open { animation: fc-in .22s cubic-bezier(.25,.46,.45,.94) forwards; }
      `}</style>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Friends chat"
          className="fixed bottom-4 md:bottom-6 left-4 md:left-6 z-[9999] w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:opacity-90 transition-all cursor-pointer"
        >
          <MessageCircle size={22} className="text-primary-foreground" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive border-2 border-background" />
          )}
        </button>
      )}

      {open && (
        <div className="fc-open fixed bottom-6 left-6 z-[9999] w-[340px] sm:w-[390px]">
          <div className="relative bg-card border border-border rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-2.5">
                {selected ? (
                  <button
                    onClick={goBack}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Users size={15} className="text-primary" />
                  </div>
                )}
                <div className="font-display font-bold text-foreground text-sm leading-none">
                  {selected ? selected.name : "Friends"}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-all cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            {selected ? (
              <>
                <div
                  ref={scrollRef}
                  className="overflow-y-auto h-[360px] px-4 py-4 flex flex-col gap-1"
                >
                  {loadingMessages ? (
                    <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
                      Loading…
                    </div>
                  ) : messages.length === 0 && pending.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <MessageCircle size={28} className="opacity-40" />
                      <p className="text-xs">Say hi to {selected.name}!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((m) => (
                        <FriendMessageBubble
                          key={m._id}
                          message={m}
                          friend={selected}
                          isMe={String(m.sender?._id || m.sender) === String(user?._id)}
                        />
                      ))}
                      {pending.map((p) => (
                        <FriendMessageBubble
                          key={p.clientId}
                          message={{ content: p.content, createdAt: p.createdAt }}
                          friend={selected}
                          isMe
                          status={p.status}
                          waiting={p.attempts > 0 || !outbox.online}
                          onRetry={() => outbox.retry(p.clientId)}
                          onDiscard={() => outbox.discard(p.clientId)}
                        />
                      ))}
                    </>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-border">
                  {!outbox.online && (
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      You're offline. Messages will send when you're back online.
                    </p>
                  )}
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-secondary border border-border rounded-full focus-within:border-primary/40 transition-colors">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Message…"
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!draft.trim()}
                      className="w-6 h-6 flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="overflow-y-auto h-[360px]">
                {loadingFriends ? (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Loading…
                  </div>
                ) : friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground px-6 text-center">
                    <Users size={28} className="opacity-40" />
                    <p className="text-xs">
                      No friends yet — connect with someone from the Community page.
                    </p>
                  </div>
                ) : (
                  friends.map(({ connectionId, friend, lastMessage }) => (
                    <button
                      key={connectionId}
                      onClick={() => openThread(friend)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-accent">
                        {friend.image?.url ? (
                          <img src={friend.image.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-primary">
                            {friend.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-foreground text-sm truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage ? lastMessage.content : "Say hi!"}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FriendsChat;
