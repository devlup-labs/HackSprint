import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Bell, Trash2, BellOff, BellRing, BellPlus, Check, X } from "lucide-react";
import { NotificationAPI } from "../api/notification.api.js";
import { ConnectionsAPI } from "../api/connections.api.js";
import "../pages/Styles/AllHackathons.css";
import {
  isPushSupported,
  getExistingSubscription,
  registerExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "../utils/pushNotifications.js";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationBell = ({ asAdmin = false }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [resolved, setResolved] = useState({});
  const [actingId, setActingId] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!isPushSupported()) return;

    getExistingSubscription().then((sub) => {
      if (sub) {
        // Re-registers the existing browser subscription against whichever
        // account is signed in right now — see registerExistingSubscription
        // for why this can't just trust the local subscription object.
        registerExistingSubscription(asAdmin).catch(() => {});
        setPushEnabled(true);
        return;
      }

      // Auto-enable rather than waiting on the user to find and click a
      // toggle — silently skipped if they've already said no, so this
      // never re-nags someone who denied it.
      if (Notification.permission === "denied") return;

      subscribeToPush(asAdmin)
        .then(() => setPushEnabled(true))
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePush = async (e) => {
    e.stopPropagation();
    if (pushBusy || !isPushSupported()) return;

    setPushBusy(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(asAdmin);
        setPushEnabled(false);
        toast.success("Browser notifications turned off");
      } else {
        await subscribeToPush(asAdmin);
        setPushEnabled(true);
        toast.success("Browser notifications enabled");
      }
    } catch (err) {
      if (err.message === "denied") {
        toast.error(
          "Notifications are blocked for this site — enable them in your browser's site settings."
        );
      } else if (err.message !== "dismissed") {
        toast.error("Couldn't update browser notifications");
      }
    } finally {
      setPushBusy(false);
    }
  };

  const loadUnreadCount = () => {
    NotificationAPI.getUnreadCount(asAdmin)
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    loadUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      NotificationAPI.getNotifications({ limit: 20 }, asAdmin)
        .then((res) => {
          const list = res.data.notifications || [];
          setNotifications(list);
          // A request that's already been answered (here or on another
          // device) is just a plain notification, never an input.
          const ids = list.map((n) => n.metadata?.connectionId).filter(Boolean);
          if (ids.length > 0 && !asAdmin) {
            ConnectionsAPI.statuses(ids)
              .then((r) => {
                const byConn = r.data.statuses || {};
                setResolved((prev) => {
                  const next = { ...prev };
                  list.forEach((n) => {
                    const st = byConn[n.metadata?.connectionId];
                    if (st === "accepted" || st === "declined") next[n._id] = st;
                  });
                  return next;
                });
              })
              .catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  const handleNotificationClick = async (n) => {
    if (n.metadata?.friendId) {
      window.dispatchEvent(
        new CustomEvent("hacksprint:open-friend-chat", {
          detail: { friendId: n.metadata.friendId },
        })
      );
      setOpen(false);
    }

    if (n.isRead) return;

    try {
      await NotificationAPI.markAsRead(n._id, asAdmin);
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // best-effort
    }
  };

  const markReadLocally = (id) => {
    setNotifications((prev) =>
      prev.map((x) => (x._id === id ? { ...x, isRead: true } : x))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleAcceptReply = async (n) => {
    const connectionId = n.metadata?.connectionId;
    const reply = (replyDrafts[n._id] || "").trim();
    if (!connectionId || !reply || actingId) return;

    setActingId(n._id);
    try {
      await ConnectionsAPI.accept(connectionId, reply);
      setResolved((prev) => ({ ...prev, [n._id]: "accepted" }));
      if (!n.isRead) {
        NotificationAPI.markAsRead(n._id, asAdmin).catch(() => {});
        markReadLocally(n._id);
      }
      if (n.metadata?.senderId) {
        window.dispatchEvent(
          new CustomEvent("hacksprint:open-friend-chat", {
            detail: { friendId: n.metadata.senderId },
          })
        );
        setOpen(false);
      }
      toast.success("You're connected!");
    } catch (err) {
      if (err.response?.status === 409) {
        setResolved((prev) => ({ ...prev, [n._id]: "accepted" }));
        toast.error("This request was already resolved");
      } else {
        toast.error("Couldn't send that reply — try again");
      }
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (n) => {
    const connectionId = n.metadata?.connectionId;
    if (!connectionId || actingId) return;

    setActingId(n._id);
    try {
      await ConnectionsAPI.decline(connectionId);
      setResolved((prev) => ({ ...prev, [n._id]: "declined" }));
      if (!n.isRead) {
        NotificationAPI.markAsRead(n._id, asAdmin).catch(() => {});
        markReadLocally(n._id);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setResolved((prev) => ({ ...prev, [n._id]: "declined" }));
      } else {
        toast.error("Couldn't decline — try again");
      }
    } finally {
      setActingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.clearAll(asAdmin);
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // best-effort
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative w-8 h-8 flex items-center justify-center text-[rgba(var(--hk-accent-rgb),0.85)] dark:text-[rgba(var(--hk-accent-rgb),0.55)] hover:text-[var(--hk-accent-solid)] rounded-[3px] transition-all duration-200 cursor-pointer"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[rgb(var(--hk-red-rgb))] text-[var(--hk-text)] text-[0.55rem] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-[rgba(var(--hk-card-bg),0.98)] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          <span className="absolute top-[-1px] left-[-1px] w-[8px] h-[8px] border-t-2 border-l-2 border-[rgba(var(--hk-card-border-rgb),0.72)] dark:border-[rgba(var(--hk-card-border-rgb),0.45)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-[8px] h-[8px] border-b-2 border-r-2 border-[rgba(var(--hk-card-border-rgb),0.72)] dark:border-[rgba(var(--hk-card-border-rgb),0.45)]" />

          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.08)] bg-[rgba(var(--hk-accent-rgb),0.04)]">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--hk-text)]">
              Notifications
            </span>
            <div className="flex items-center gap-3">
              {isPushSupported() && (
                <button
                  onClick={handleTogglePush}
                  disabled={pushBusy}
                  title={
                    pushEnabled
                      ? "Browser notifications on — click to turn off"
                      : "Turn on browser notifications"
                  }
                  className={`flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.06em] cursor-pointer disabled:opacity-40 disabled:cursor-wait ${
                    pushEnabled
                      ? "text-[var(--hk-accent-solid)]"
                      : "text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] hover:text-[var(--hk-accent-solid)]"
                  }`}
                >
                  {pushEnabled ? <BellRing size={11} /> : <BellPlus size={11} />}
                  {pushEnabled ? "On" : "Enable"}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.06em] text-[rgba(var(--hk-accent-rgb),0.9)] dark:text-[rgba(var(--hk-accent-rgb),0.6)] hover:text-[var(--hk-accent-solid)] cursor-pointer"
                >
                  <Trash2 size={11} /> Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)]">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)]">
                <BellOff size={22} className="opacity-40" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => {
                const connectionId = n.metadata?.connectionId;
                const resolution = resolved[n._id];
                const isPendingConnection = connectionId && !resolution;

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 border-b border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.06)] cursor-pointer transition-colors hover:bg-[rgba(var(--hk-accent-rgb),0.05)] ${
                      n.isRead ? "" : "bg-[rgba(var(--hk-accent-rgb),0.03)]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--hk-accent-solid)] flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.68rem] font-semibold text-[var(--hk-text)] truncate">{n.title}</p>
                        <p className="text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.9)] dark:text-[rgba(var(--hk-text-rgb),0.55)] mt-0.5 leading-snug">
                          {n.message}
                        </p>
                        <p className="text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)] mt-1 uppercase tracking-[0.05em]">
                          {timeAgo(n.createdAt)}
                        </p>

                        {isPendingConnection && (
                          <div
                            className="mt-2 flex flex-col gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <textarea
                              value={replyDrafts[n._id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({ ...prev, [n._id]: e.target.value }))
                              }
                              placeholder="Reply to connect…"
                              rows={2}
                              maxLength={2000}
                              className="w-full bg-[rgba(var(--hk-input-bg),0.8)] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] rounded-[3px] px-2 py-1.5 text-[0.62rem] text-[var(--hk-text)] placeholder:text-[rgba(var(--hk-text-rgb),0.65)] dark:placeholder:text-[rgba(var(--hk-text-rgb),0.3)] outline-none focus:border-[rgba(var(--hk-accent-rgb),0.4)] resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptReply(n)}
                                disabled={!replyDrafts[n._id]?.trim() || actingId === n._id}
                                className="flex-1 inline-flex items-center justify-center gap-1 text-[0.58rem] tracking-[0.05em] uppercase px-2.5 py-1.5 rounded-[3px] bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:brightness-110 transition-colors"
                              >
                                <Check size={11} /> Reply &amp; connect
                              </button>
                              <button
                                onClick={() => handleDecline(n)}
                                disabled={actingId === n._id}
                                className="inline-flex items-center justify-center gap-1 text-[0.58rem] tracking-[0.05em] uppercase px-2.5 py-1.5 rounded-[3px] border border-[rgba(var(--hk-red-rgb),0.3)] text-[rgba(var(--hk-red-rgb),0.8)] hover:bg-[rgba(var(--hk-red-rgb),0.1)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
