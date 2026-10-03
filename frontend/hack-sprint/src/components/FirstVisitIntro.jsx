import React, { useEffect, useRef, useState } from "react";

// A short, quiet brand reveal — logo mark and wordmark settle in, a thin
// progress bar fills, then it fades out into the app underneath (which has
// been rendering the whole time). No boot-sequence typing, no terminal
// tropes — this is the first thing anyone sees, including a funding pitch.
const HOLD_MS = 900;
const FADE_MS = 350;

export default function FirstVisitIntro() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const timeouts = useRef([]);

  const finish = () => {
    timeouts.current.forEach(clearTimeout);
    setLeaving(true);
    timeouts.current.push(setTimeout(() => setVisible(false), FADE_MS));
  };

  useEffect(() => {
    const pending = timeouts.current;
    pending.push(setTimeout(finish, HOLD_MS));
    return () => pending.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-background transition-opacity ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="flex flex-col items-center gap-4 hs-intro-in">
        <img src="/hackSprint.webp" alt="" className="w-14 h-14 object-contain" />
        <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-foreground text-2xl sm:text-3xl tracking-tight">
          Hack<span className="text-primary">Sprint</span>
        </h1>
        <div className="w-32 h-[3px] rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary rounded-full hs-intro-bar" />
        </div>
      </div>

      {!leaving && (
        <button
          onClick={finish}
          className="absolute bottom-6 right-6 z-10 text-xs font-medium text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Skip
        </button>
      )}

      <style>{`
        @keyframes hs-intro-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hs-intro-in { animation: hs-intro-in 0.4s ease-out both; }

        @keyframes hs-intro-bar {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .hs-intro-bar { animation: hs-intro-bar ${HOLD_MS}ms ease-out both; }
      `}</style>
    </div>
  );
}
