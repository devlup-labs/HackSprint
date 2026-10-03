import { useState, useRef, useEffect, useCallback } from "react";
import { MessagesAPI } from "../api/messages.api.js";

// Messages are saved on the device before they are sent, so a dropped
// connection never loses them. Each one carries a clientId the server uses to
// ignore duplicates, which makes retrying always safe: if a send timed out
// after the server had already stored it, the retry just gets the original back.

const BACKOFF_MS = [2000, 5000, 15000, 30000, 60000];
const MAX_ATTEMPTS = 8;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const RETRYABLE_STATUS = [408, 425, 429, 500, 502, 503, 504];

const storageKey = (userId) => `hs_outbox_${userId}`;

const load = (userId) => {
  try {
    const list = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
    const cutoff = Date.now() - MAX_AGE_MS;
    return Array.isArray(list) ? list.filter((m) => m?.clientId && m.createdAt > cutoff) : [];
  } catch {
    return [];
  }
};

const save = (userId, list) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
  } catch {
    // Storage full or blocked: the queue still works for this session.
  }
};

// Network failures and server-side hiccups are worth retrying; a 4xx such as
// "you're not connected with this person" will never succeed.
const isRetryable = (err) => !err.response || RETRYABLE_STATUS.includes(err.response.status);

const newClientId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`).replace(/[^A-Za-z0-9_-]/g, "");

export const useMessageOutbox = ({ userId, enabled, onDelivered }) => {
  const [queue, setQueue] = useState(() => (userId ? load(userId) : []));
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const queueRef = useRef(queue);
  const flushing = useRef(false);
  const timer = useRef(null);
  const onDeliveredRef = useRef(onDelivered);
  onDeliveredRef.current = onDelivered;
  const flushRef = useRef(() => {});

  const update = useCallback(
    (fn) => {
      const next = fn(queueRef.current);
      queueRef.current = next;
      setQueue(next);
      if (userId) save(userId, next);
    },
    [userId]
  );

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    const waiting = queueRef.current.filter((m) => m.status === "sending");
    if (!waiting.length) return;
    const next = Math.min(...waiting.map((m) => m.nextAt || 0));
    timer.current = setTimeout(() => flushRef.current(), Math.max(0, next - Date.now()));
  }, []);

  const flush = useCallback(async () => {
    if (flushing.current || !enabled || !userId) return;
    flushing.current = true;
    try {
      // Oldest first, and a friend's thread waits behind its own stuck message
      // so conversations never arrive out of order.
      const blocked = new Set();
      const ordered = [...queueRef.current].sort((a, b) => a.createdAt - b.createdAt);

      for (const item of ordered) {
        if (item.status !== "sending" || blocked.has(item.friendId)) continue;
        if (Date.now() < (item.nextAt || 0)) {
          blocked.add(item.friendId);
          continue;
        }

        try {
          const res = await MessagesAPI.send(item.friendId, item.content, item.clientId);
          update((q) => q.filter((m) => m.clientId !== item.clientId));
          onDeliveredRef.current?.(item, res.data.message);
        } catch (err) {
          if (isRetryable(err)) {
            const attempts = (item.attempts || 0) + 1;
            update((q) =>
              q.map((m) =>
                m.clientId === item.clientId
                  ? {
                      ...m,
                      attempts,
                      nextAt: Date.now() + BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)],
                      status: attempts >= MAX_ATTEMPTS ? "failed" : "sending",
                    }
                  : m
              )
            );
            blocked.add(item.friendId);
          } else {
            update((q) =>
              q.map((m) =>
                m.clientId === item.clientId
                  ? { ...m, status: "failed", error: err.response?.data?.message || "Couldn't send" }
                  : m
              )
            );
          }
        }
      }
    } finally {
      flushing.current = false;
      schedule();
    }
  }, [enabled, userId, update, schedule]);

  flushRef.current = flush;

  // Pick up anything left from an earlier session, and when the account changes.
  useEffect(() => {
    const initial = userId ? load(userId) : [];
    queueRef.current = initial;
    setQueue(initial);
    if (initial.length) flush();
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, enabled]);

  // Try again right away when the connection returns or the tab comes back.
  useEffect(() => {
    const retryNow = () => {
      update((q) => q.map((m) => (m.status === "sending" ? { ...m, nextAt: 0 } : m)));
      flush();
    };
    const goOnline = () => {
      setOnline(true);
      retryNow();
    };
    const goOffline = () => setOnline(false);
    const onVisible = () => {
      if (document.visibilityState === "visible" && queueRef.current.length) retryNow();
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [flush, update]);

  const enqueue = useCallback(
    (friendId, content) => {
      const item = {
        clientId: newClientId(),
        friendId,
        content,
        createdAt: Date.now(),
        attempts: 0,
        nextAt: 0,
        status: "sending",
      };
      update((q) => [...q, item]);
      flush();
      return item;
    },
    [update, flush]
  );

  const retry = useCallback(
    (clientId) => {
      update((q) => q.map((m) => (m.clientId === clientId ? { ...m, status: "sending", attempts: 0, nextAt: 0, error: undefined } : m)));
      flush();
    },
    [update, flush]
  );

  const discard = useCallback((clientId) => update((q) => q.filter((m) => m.clientId !== clientId)), [update]);

  return { queue, online, enqueue, retry, discard };
};
