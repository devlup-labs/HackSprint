import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  Minimize2,
  ChevronRight,
  AlertCircle,
  ListChecks,
  Zap,
} from "lucide-react";
import { ChatbotAPI } from "../api/chatbot.api.js";
import BotAvatar from "./BotAvatar.jsx";
import ChatMarkdown from "./ChatMarkdown.jsx";

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2.5">
    {[0, 150, 300].map((d) => (
      <span
        key={d}
        className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-bounce opacity-70"
        style={{ animationDelay: `${d}ms` }}
      />
    ))}
  </div>
);

const BOT_NAME = "Byte";

const STARTER_PROMPTS = [
  { icon: ListChecks, label: "How do teams work?" },
  { icon: Zap, label: "How does judging work?" },
  { icon: AlertCircle, label: "What can I submit?" },
];

const BotBubble = ({ msg, onSuggestionClick }) => {
  return (
    <div className="msg-in flex flex-col gap-2 items-start">
      <div className="flex items-end gap-2 flex-row w-full">
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#13211b] to-[#08110d] ring-1 ring-primary/45 flex items-center justify-center flex-shrink-0 mb-4">
          <BotAvatar size={17} />
        </div>
        <div className="flex flex-col gap-0.5 items-start max-w-[85%]">
          <div className="bg-secondary rounded-2xl rounded-tl-md px-3 py-2.5">
            <div className="text-foreground">
              <ChatMarkdown text={msg.text} />
              {msg.streaming && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-primary/70 animate-pulse" />}
            </div>
          </div>
          <span className="text-xs text-muted-foreground px-0.5">{formatTime(msg.time)}</span>
        </div>
      </div>

      {msg.suggestions && (
        <div className="flex flex-col gap-1.5 pl-8 w-full">
          {STARTER_PROMPTS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => onSuggestionClick(label)}
              className="msg-in flex items-center justify-between gap-2 text-left px-3 py-2 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Icon size={13} className="text-primary flex-shrink-0" />
                {label}
              </span>
              <ChevronRight size={13} className="flex-shrink-0 opacity-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UserBubble = ({ msg }) => (
  <div className="msg-in flex items-end gap-2 flex-row-reverse">
    <div className="flex flex-col gap-0.5 items-end max-w-[80%]">
      <div className="bg-primary rounded-2xl rounded-tr-md px-3 py-2">
        <p className="text-sm text-primary-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
      </div>
      <span className="text-xs text-muted-foreground px-0.5">{formatTime(msg.time)}</span>
    </div>
  </div>
);

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [mini, setMini] = useState(false);
  const [pulse, setPulse] = useState(true);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `👋 Hey! I'm ${BOT_NAME}, HackSprint's assistant. Ask me anything about the platform, or try one of these:`,
      time: new Date(),
      suggestions: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Both this widget and InstallPrompt float bottom-right — let it know
  // when the chat panel is open so it can get out of the way instead of
  // overlapping it.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("hacksprint:chatbot-toggle", { detail: { open } })
    );
  }, [open]);

  useEffect(() => {
    if (open && !mini) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open, mini]);

  useEffect(() => {
    if (open && !mini) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, mini]);

  const handleOpen = () => {
    setMini(false);
    setOpen(true);
    setPulse(false);
  };

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || busy) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg, time: new Date() },
    ]);
    setInput("");
    setLoading(true);
    setBusy(true);

    // History is the conversation so far; the new user message is sent
    // separately, so it is not duplicated here.
    const history = messages.filter((m) => !m.error);
    let started = false;

    try {
      await ChatbotAPI.streamMessage(msg, history, {
        onDelta: (delta) => {
          if (!started) {
            started = true;
            // First chunk: swap the typing dots for a growing bot bubble.
            setLoading(false);
            setMessages((prev) => [...prev, { role: "bot", text: delta, time: new Date(), streaming: true }]);
          } else {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, text: last.text + delta };
              return next;
            });
          }
        },
      });
      if (!started) throw new Error("Empty reply");
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], streaming: false };
        return next;
      });
    } catch (err) {
      // Logged rather than swallowed — a generic user-facing message can
      // mean a bad API key, a 429 from the chat rate limit, a CORS/network
      // failure, or the gateway being unreachable, and there's no way to
      // tell which from the UI alone otherwise.
      console.error("[Chatbot] sendMessage failed:", err);

      const status = err?.status;
      const text =
        status === 429
          ? "⚠️ I'm getting a lot of messages right now, try again in a minute."
          : status
          ? "⚠️ Something went wrong on my end. Please try again shortly."
          : "⚠️ Couldn't reach the server. Check your connection and try again.";

      setMessages((prev) => {
        // A reply that broke off mid-stream keeps what arrived and gets the
        // error note appended; otherwise the error is its own message.
        const last = prev[prev.length - 1];
        if (started && last?.streaming) {
          return [...prev.slice(0, -1), { ...last, streaming: false, text: `${last.text}\n\n${text}` }];
        }
        return [...prev, { role: "bot", text, time: new Date(), error: true }];
      });
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes cb-in  { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .cb-open { animation: cb-in  .22s cubic-bezier(.25,.46,.45,.94) forwards; }
        .msg-in  { animation: msg-in .18s cubic-bezier(.25,.46,.45,.94) forwards; }
      `}</style>

      {!open && (
        <button
          onClick={handleOpen}
          title={`Chat with ${BOT_NAME}`}
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-b from-[#13211b] to-[#08110d] ring-2 ring-primary/70 flex items-center justify-center shadow-lg hover:scale-105 hover:ring-primary transition-all cursor-pointer"
        >
          <BotAvatar size={38} />
          {pulse && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive border-2 border-background animate-pulse" />
          )}
        </button>
      )}

      {open && (
        <div className="cb-open fixed bottom-6 right-6 z-[9999] w-[340px] sm:w-[390px]">
          <div className="relative bg-card border border-border rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#13211b] to-[#08110d] ring-1 ring-primary/55 flex items-center justify-center">
                  <BotAvatar size={26} />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground text-sm leading-none">
                    {BOT_NAME}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">AI assistant, online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMini((m) => !m)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <Minimize2 size={13} />
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setPulse(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-all cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {!mini && (
              <div className="overflow-y-auto h-[320px] px-4 py-4 flex flex-col gap-3">
                {messages.map((msg, i) =>
                  msg.role === "bot" ? (
                    <BotBubble key={i} msg={msg} onSuggestionClick={sendMessage} />
                  ) : (
                    <UserBubble key={i} msg={msg} />
                  )
                )}

                {loading && (
                  <div className="msg-in flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#13211b] to-[#08110d] ring-1 ring-primary/45 flex items-center justify-center flex-shrink-0">
                      <BotAvatar size={17} />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-md">
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            )}

            {!mini && (
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-secondary border border-border rounded-full focus-within:border-primary/40 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={loading || busy}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading || busy}
                    className="w-6 h-6 flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Powered by HackSprint · DevLup Labs
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
