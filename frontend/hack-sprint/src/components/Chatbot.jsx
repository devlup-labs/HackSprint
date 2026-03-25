import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  Minimize2,
  Bot,
  ChevronRight,
  AlertCircle,
  ListChecks,
  Zap,
} from "lucide-react";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const sendMessageToChatbot = async (message) => {
  const res = await fetch(`${import.meta.env.VITE_CHATBOT_API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
};

export const parseResponse = (text) => {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input");
    }

    const clean = text.replace(/\*\*/g, "").trim();
    const sectionRegex = (name) =>
      new RegExp(
        `${name}:?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*[A-Za-z][^\\n]*:|$)`,
        "i"
      );

    const extractList = (block, type = "number") => {
      if (!block) return [];

      return block
        .split("\n")
        .map((l) =>
          l
            .replace(/^\s*\d+[.)]\s*/, "")
            .replace(/^\s*[-*•]\s*/, "")
            .trim()
        )
        .filter(Boolean);
    };

    const titleMatch = clean.match(/Title:\s*(.+)/i);

    const stepsMatch = clean.match(sectionRegex("Steps"));
    const notesMatch = clean.match(sectionRegex("Important Notes"));
    const actionsMatch = clean.match(sectionRegex("Next Actions"));

    const result = {
      type: "structured",
      title: titleMatch?.[1]?.trim() || null,
      steps: extractList(stepsMatch?.[1]),
      notes: extractList(notesMatch?.[1]),
      actions: extractList(actionsMatch?.[1]),
    };

    if (
      !result.title &&
      !result.steps.length &&
      !result.notes.length &&
      !result.actions.length
    ) {
      return { type: "plain", text: clean };
    }

    return result;
  } catch {
    return {
      type: "plain",
      text:
        typeof text === "string" ? text.trim() : "Could not parse response.",
    };
  }
};

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2.5">
    {[0, 150, 300].map((d) => (
      <span
        key={d}
        className="w-1.5 h-1.5 rounded-full bg-[#5fff60] inline-block animate-bounce opacity-70"
        style={{ animationDelay: `${d}ms` }}
      />
    ))}
  </div>
);

const StructuredMessage = ({ parsed, onActionClick }) => {
  const { title, steps, notes, actions, raw } = parsed;

  return (
    <div className="flex flex-col gap-2.5 text-[0.67rem] leading-relaxed">
      {/* Title */}
      {title && (
        <p
          className={`${syne} font-extrabold text-[#5fff60] text-[0.72rem] tracking-tight leading-snug`}
        >
          {title}
        </p>
      )}

      {/* Divider */}
      {title &&
        (steps.length > 0 || notes.length > 0 || actions.length > 0) && (
          <div className="w-full h-px bg-[rgba(95,255,96,0.1)]" />
        )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="flex flex-col gap-1">
          <ol className="flex flex-col gap-1.5 pl-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-[2px] bg-[rgba(95,255,96,0.1)] border border-[rgba(95,255,96,0.2)] text-[#5fff60] text-[0.55rem] flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[rgba(232,255,232,0.85)] whitespace-pre-line">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Fallback: always show raw text if no sections parsed */}
      {!title && !steps.length && !notes.length && !actions.length && (
        <p className="text-[rgba(232,255,232,0.85)] whitespace-pre-line">
          {raw}
        </p>
      )}
    </div>
  );
};

const BotBubble = ({ msg, onActionClick }) => {
  const parsed = parseResponse(msg.text);

  return (
    <div className="msg-in flex items-end gap-2 flex-row">
      <div className="w-6 h-6 rounded-full bg-[rgba(95,255,96,0.1)] border border-[rgba(95,255,96,0.22)] flex items-center justify-center flex-shrink-0 mb-4">
        <Bot size={11} className="text-[#5fff60]" />
      </div>
      <div className="flex flex-col gap-0.5 items-start max-w-[85%]">
        <div className="bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.14)] rounded-[3px] rounded-tl-none px-3 py-2.5">
          {parsed.type === "structured" ? (
            <StructuredMessage parsed={parsed} onActionClick={onActionClick} />
          ) : (
            <p className="text-[0.68rem] text-[rgba(232,255,232,0.85)] leading-relaxed whitespace-pre-line">
              {parsed.text}
            </p>
          )}
        </div>
        <span className="text-[0.47rem] tracking-[0.06em] text-[rgba(95,255,96,0.25)] px-0.5">
          {formatTime(msg.time)}
        </span>
      </div>
    </div>
  );
};

const UserBubble = ({ msg }) => (
  <div className="msg-in flex items-end gap-2 flex-row-reverse">
    <div className="flex flex-col gap-0.5 items-end max-w-[80%]">
      <div className="bg-[rgba(95,255,96,0.15)] border border-[rgba(95,255,96,0.28)] rounded-[3px] rounded-tr-none px-3 py-2">
        <p className="text-[0.68rem] text-[rgba(232,255,232,0.9)] leading-relaxed whitespace-pre-line">
          {msg.text}
        </p>
      </div>
      <span className="text-[0.47rem] tracking-[0.06em] text-[rgba(95,255,96,0.25)] px-0.5">
        {formatTime(msg.time)}
      </span>
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
      text: "👋 Hey! I'm HackSprint Bot. Ask me anything about the hackathon!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

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
    if (!msg || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg, time: new Date() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessageToChatbot(msg);
      const reply =
        data?.success && data?.reply
          ? data.reply
          : "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply, time: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Something went wrong. Please check your connection and try again.",
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    // console.log("[HackSprint] Action clicked:", action);
    sendMessage(action);
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
        .cb-scan::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(95,255,96,0.35),transparent);
        }
      `}</style>

      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-[9999] w-14 h-14 rounded-full bg-[#5fff60] border-2 border-[#5fff60] flex items-center justify-center shadow-[0_0_24px_rgba(95,255,96,0.45)] hover:bg-[#7fff80] hover:shadow-[0_0_32px_rgba(95,255,96,0.6)] transition-all cursor-pointer"
        >
          <Bot size={22} className="text-[#050905]" />
          {pulse && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6060] border-2 border-[#0a0a0a] animate-pulse" />
          )}
        </button>
      )}

      {open && (
        <div
          className={`cb-open fixed bottom-6 right-6 z-[9999] w-[340px] sm:w-[390px] ${mono}`}
        >
          <div className="cb-scan relative bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.22)] rounded-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.6)]" />
            <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.6)]" />

            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(95,255,96,0.1)] bg-[rgba(6,8,6,0.8)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[rgba(95,255,96,0.12)] border border-[rgba(95,255,96,0.28)] flex items-center justify-center">
                  <Bot size={14} className="text-[#5fff60]" />
                </div>
                <div>
                  <div
                    className={`${syne} font-extrabold text-white text-[0.8rem] tracking-tight leading-none`}
                  >
                    HackSprint Bot
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-pulse" />
                    <span className="text-[0.5rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.5)]">
                      online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMini((m) => !m)}
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.32)] transition-all cursor-pointer"
                >
                  <Minimize2 size={11} />
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setPulse(false);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.4)] hover:text-[#ff9090] hover:border-[rgba(255,96,96,0.3)] transition-all cursor-pointer"
                >
                  <X size={11} />
                </button>
              </div>
            </div>

            {!mini && (
              <div className="cb-scroll overflow-y-auto h-[320px] px-4 py-4 flex flex-col gap-3">
                {messages.map((msg, i) =>
                  msg.role === "bot" ? (
                    <BotBubble
                      key={i}
                      msg={msg}
                      onActionClick={handleActionClick}
                    />
                  ) : (
                    <UserBubble key={i} msg={msg} />
                  )
                )}

                {loading && (
                  <div className="msg-in flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-[rgba(95,255,96,0.1)] border border-[rgba(95,255,96,0.22)] flex items-center justify-center flex-shrink-0">
                      <Bot size={11} className="text-[#5fff60]" />
                    </div>
                    <div className="bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.14)] rounded-[3px] rounded-tl-none">
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            )}

            {!mini && (
              <div className="px-4 py-3 border-t border-[rgba(95,255,96,0.08)] bg-[rgba(6,8,6,0.6)]">
                <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] focus-within:border-[rgba(95,255,96,0.35)] transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={loading}
                    className="flex-1 bg-transparent text-[0.65rem] text-[rgba(232,255,232,0.85)] placeholder-[rgba(95,255,96,0.25)] outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-5 h-5 flex items-center justify-center text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Send size={11} />
                  </button>
                </div>
                <p className="text-[0.48rem] tracking-[0.08em] uppercase text-[rgba(95,255,96,0.2)] text-center mt-2">
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
