import React, { useState, useEffect, useCallback } from "react";
import { X, Flame, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { DailyAPI } from "../../api/daily.api.js";
import "../../pages/Styles/AllHackathons.css";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

export const DAILY_OPEN_EVENT = "daily:open";
export const DAILY_ANSWERED_EVENT = "daily:answered";

// Sparky: a round little robot with a glowing antenna. Eyes blink and look
// around while a question is waiting, turn into happy arcs after a correct
// answer, and soften after a miss.
const Sparky = ({ mood = "idle", size = 46 }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    <defs>
      <linearGradient id="sp-head" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4ade80" />
        <stop offset="1" stopColor="#16a34a" />
      </linearGradient>
      <radialGradient id="sp-bulb" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#fff3c4" />
        <stop offset="1" stopColor="#f59e0b" />
      </radialGradient>
    </defs>

    <g className="sp-antenna">
      <line x1="40" y1="17" x2="40" y2="9" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <circle className="sp-bulb" cx="40" cy="7" r="5" fill="url(#sp-bulb)" />
    </g>

    <rect x="6" y="38" width="8" height="16" rx="4" fill="#15803d" />
    <rect x="66" y="38" width="8" height="16" rx="4" fill="#15803d" />

    <rect x="11" y="16" width="58" height="52" rx="24" fill="url(#sp-head)" />
    <ellipse cx="29" cy="22" rx="11" ry="4" fill="#fff" opacity="0.28" />

    <rect x="17" y="26" width="46" height="34" rx="16" fill="#0b2b1a" />
    <rect x="17" y="26" width="46" height="34" rx="16" fill="none" stroke="#86efac" strokeOpacity="0.25" />

    {mood === "happy" ? (
      <g stroke="#86efac" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M25 42q5-8 10 0" />
        <path d="M45 42q5-8 10 0" />
      </g>
    ) : (
      <g className="sp-eyes">
        <ellipse cx="30" cy="40" rx="5" ry="6.5" fill="#86efac" />
        <ellipse cx="50" cy="40" rx="5" ry="6.5" fill="#86efac" />
        <g className="sp-pupils">
          <circle cx="31" cy="41" r="2.6" fill="#0b2b1a" />
          <circle cx="51" cy="41" r="2.6" fill="#0b2b1a" />
        </g>
        <circle cx="28.6" cy="37.6" r="1.6" fill="#fff" />
        <circle cx="48.6" cy="37.6" r="1.6" fill="#fff" />
      </g>
    )}

    <circle cx="22" cy="52" r="3.4" fill="#fb7185" opacity="0.55" />
    <circle cx="58" cy="52" r="3.4" fill="#fb7185" opacity="0.55" />

    {mood === "sad" ? (
      <path d="M35 55q5-4 10 0" stroke="#86efac" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    ) : (
      <path d="M34 51q6 6 12 0" stroke="#86efac" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    )}
  </svg>
);

const DailyChallenge = () => {
  const { isAuthenticated, role } = useAuth();
  const [state, setState] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await DailyAPI.getToday();
      setState(res.data);
    } catch {
      setState(null);
    }
  }, []);

  const enabled = isAuthenticated && role !== "admin";

  useEffect(() => {
    if (enabled) load();
    else setState(null);
  }, [enabled, load]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(DAILY_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(DAILY_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!enabled || !state) return null;

  const { question, answered, result, streak } = state;

  const submit = async () => {
    if (selected === null || submitting) return;
    setSubmitting(true);
    try {
      const res = await DailyAPI.answer(question.id, selected);
      setState(res.data);
      window.dispatchEvent(new Event(DAILY_ANSWERED_EVENT));
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit your answer");
      if (err.response?.status === 409) load();
    } finally {
      setSubmitting(false);
    }
  };

  const optionState = (i) => {
    if (!answered) return selected === i ? "picked" : "idle";
    if (i === result.correctIndex) return "right";
    if (i === result.selectedIndex) return "wrong";
    return "dim";
  };

  const optionCls = {
    idle: "border-[rgba(var(--hk-card-border-rgb),0.2)] dark:border-[rgba(var(--hk-card-border-rgb),0.14)] hover:border-[rgba(var(--hk-accent-rgb),0.5)] cursor-pointer",
    picked: "border-[rgba(var(--hk-accent-rgb),0.8)] bg-[rgba(var(--hk-accent-rgb),0.1)] cursor-pointer",
    right: "border-[rgba(var(--hk-accent-rgb),0.9)] bg-[rgba(var(--hk-accent-rgb),0.14)]",
    wrong: "border-[rgba(var(--hk-red-rgb),0.8)] bg-[rgba(var(--hk-red-rgb),0.1)]",
    dim: "border-[rgba(var(--hk-card-border-rgb),0.12)] opacity-55",
  };

  return (
    <>
      <style>{`
        @keyframes sp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes sp-blink { 0%,92%,100%{transform:scaleY(1)} 96%{transform:scaleY(0.12)} }
        @keyframes sp-look { 0%,38%,100%{transform:translateX(0)} 46%,64%{transform:translateX(-2px)} 72%,90%{transform:translateX(2px)} }
        @keyframes sp-glow { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes sp-wiggle { 0%,100%{transform:rotate(0)} 30%{transform:rotate(-7deg)} 60%{transform:rotate(6deg)} }
        .sp-wrap.sp-wait { animation: sp-bounce 2s ease-in-out infinite; }
        .sp-eyes { transform-origin: 40px 40px; animation: sp-blink 4.2s infinite; }
        .sp-pupils { animation: sp-look 6s ease-in-out infinite; }
        .sp-bulb { animation: sp-glow 1.6s ease-in-out infinite; }
        .sp-antenna { transform-origin: 40px 17px; }
        .sp-wait .sp-antenna { animation: sp-wiggle 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .sp-wrap.sp-wait,.sp-eyes,.sp-pupils,.sp-bulb,.sp-wait .sp-antenna{animation:none} }
      `}</style>

      <button
        onClick={() => setOpen(true)}
        title={answered ? `${streak.current} day streak` : "Today's challenge"}
        aria-label="Open daily challenge"
        className={`sp-wrap ${answered ? "" : "sp-wait"} fixed bottom-[88px] md:bottom-[96px] right-4 md:right-6 z-[9998] w-14 h-14 rounded-full bg-[rgb(var(--hk-card-bg))] border border-[rgba(var(--hk-accent-rgb),0.45)] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
      >
        <Sparky mood={answered ? (result?.correct ? "happy" : "sad") : "idle"} />
        {answered && streak.current > 0 && (
          <span className={`${mono} absolute -bottom-1 -right-1 px-1.5 h-5 rounded-full bg-[rgb(var(--hk-amber-rgb))] text-white text-[0.6rem] font-bold flex items-center gap-0.5`}>
            <Flame size={9} /> {streak.current}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[rgb(var(--hk-card-bg))] border border-[rgba(var(--hk-card-border-rgb),0.25)] dark:border-[rgba(var(--hk-accent-rgb),0.22)] rounded-[6px] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.3)] text-[var(--hk-text)]">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-[4px] text-[rgba(var(--hk-text-rgb),0.7)] hover:text-[var(--hk-text)] cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Sparky mood={answered ? (result?.correct ? "happy" : "sad") : "idle"} />
              <div>
                <div className={`${mono} text-[0.55rem] tracking-[0.16em] uppercase text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-accent-rgb),0.55)]`}>
                  Daily challenge
                </div>
                <div className={`${syne} font-extrabold text-lg tracking-tight leading-tight`}>
                  {answered ? (result.correct ? "Nailed it!" : "Not this time") : "Solve today's question"}
                </div>
              </div>
              <div className={`${mono} ml-auto mr-8 flex items-center gap-1 text-[0.7rem] font-semibold text-[rgb(var(--hk-amber-rgb))]`}>
                <Flame size={14} /> {streak.current}
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <span className={`${mono} text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-[3px] border border-[rgba(var(--hk-accent-rgb),0.35)] text-[var(--hk-accent-solid)]`}>
                {question.field}
              </span>
              <span className={`${mono} text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-[3px] border border-[rgba(var(--hk-card-border-rgb),0.25)] text-[rgba(var(--hk-text-rgb),0.75)]`}>
                {question.difficulty}
              </span>
            </div>

            <p className={`${syne} font-bold text-[1.02rem] leading-snug mb-4`}>{question.prompt}</p>

            <div className="flex flex-col gap-2 mb-4">
              {question.options.map((opt, i) => {
                const st = optionState(i);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected(i)}
                    className={`${mono} text-left text-[0.74rem] leading-snug px-3.5 py-3 rounded-[4px] border transition-all flex items-start gap-3 ${optionCls[st]}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-[0.6rem] opacity-80">
                      {st === "right" ? <Check size={11} /> : st === "wrong" ? <X size={11} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="min-w-0 break-words">{opt}</span>
                  </button>
                );
              })}
            </div>

            {answered ? (
              <div className="rounded-[4px] border border-[rgba(var(--hk-accent-rgb),0.3)] bg-[rgba(var(--hk-accent-rgb),0.06)] p-3.5">
                <div className={`${mono} text-[0.74rem] leading-relaxed text-[rgba(var(--hk-text-rgb),0.9)] dark:text-[rgba(var(--hk-text-rgb),0.8)]`}>
                  <Sparkles size={12} className="inline mr-1.5 text-[var(--hk-accent-solid)]" />
                  {result.explanation}
                </div>
                <div className={`${mono} mt-3 text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.8)]`}>
                  {result.correct
                    ? `🔥 ${streak.current} day streak — come back tomorrow to keep it going.`
                    : `Streak reset. Longest so far: ${streak.longest} days. A new one starts tomorrow.`}
                </div>
              </div>
            ) : (
              <button
                onClick={submit}
                disabled={selected === null || submitting}
                className={`${mono} w-full text-[0.7rem] tracking-[0.1em] uppercase py-3 rounded-[4px] font-bold bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] border border-[var(--hk-accent-solid)] cursor-pointer hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {submitting ? "Checking…" : "Submit answer"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DailyChallenge;
