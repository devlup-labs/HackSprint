import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Minimize2, Bot } from "lucide-react";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-2.5">
    {[0,150,300].map(d => (
      <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#5fff60] inline-block animate-bounce opacity-70"
        style={{ animationDelay:`${d}ms` }} />
    ))}
  </div>
);

const TEASER = "🚀 Something crazy is coming stay tuned.\n\n— HackSprint Bot 🤖";

const Chatbot = () => {
  const [open,    setOpen]    = useState(false);
  const [mini,    setMini]    = useState(false);
  const [started, setStarted] = useState(false);
  const [typed,   setTyped]   = useState("");
  const [done,    setDone]    = useState(false);
  const [pulse,   setPulse]   = useState(true);
  const endRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => setPulse(false), 6000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!open || started) return;
    setStarted(true);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(TEASER.slice(0, i));
      if (i >= TEASER.length) { clearInterval(t); setDone(true); }
    }, 30);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (open && !mini) endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [typed, open, mini]);

  const handleOpen = () => { setMini(false); setOpen(true); };

  return (
    <>
      <style>{`
        @keyframes cb-in  { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes cb-out { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(.92) translateY(12px)} }
        .cb-open  { animation: cb-in  .22s cubic-bezier(.25,.46,.45,.94) forwards; }
        .cb-scan::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(95,255,96,0.35),transparent);
        }
      `}</style>

      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 cursor-pointer md:bottom-6 right-4 md:right-6 z-[9999] w-14 h-14 rounded-full bg-[#5fff60] border-2 border-[#5fff60] flex items-center justify-center shadow-[0_0_24px_rgba(95,255,96,0.45)] hover:bg-[#7fff80] hover:shadow-[0_0_32px_rgba(95,255,96,0.6)] transition-all cursor-pointer"
        >
          <Bot size={22} className="text-[#050905]" />
          {pulse && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6060] border-2 border-[#0a0a0a] animate-pulse" />
          )}
        </button>
      )}

      {open && (
        <div className={`cb-open fixed bottom-6 right-6 z-[9999] w-[340px] sm:w-[380px] ${mono}`}>
          <div className="cb-scan relative bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.22)] rounded-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">

            <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.6)]" />
            <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.6)]" />

            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(95,255,96,0.1)] bg-[rgba(6,8,6,0.8)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[rgba(95,255,96,0.12)] border border-[rgba(95,255,96,0.28)] flex items-center justify-center">
                  <Bot size={14} className="text-[#5fff60]" />
                </div>
                <div>
                  <div className={`${syne} font-extrabold text-white text-[0.8rem] tracking-tight leading-none`}>HackSprint Bot</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-pulse" />
                    <span className="text-[0.5rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.5)]">online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMini(m => !m)}
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.32)] transition-all cursor-pointer"
                >
                  <Minimize2 size={11} />
                </button>
                <button
                  onClick={() => { setOpen(false); setPulse(false); }}
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.4)] hover:text-[#ff9090] hover:border-[rgba(255,96,96,0.3)] transition-all cursor-pointer"
                >
                  <X size={11} />
                </button>
              </div>
            </div>

            {!mini && (
              <div className="cb-scroll overflow-y-auto h-[260px] px-4 py-4 flex flex-col gap-4">

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[rgba(95,255,96,0.1)] border border-[rgba(95,255,96,0.22)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={11} className="text-[#5fff60]" />
                  </div>
                  <div className="bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.14)] rounded-[3px] rounded-tl-none px-3 py-2.5 max-w-[85%]">
                    <p className="text-[0.68rem] text-[rgba(232,255,232,0.85)] leading-relaxed whitespace-pre-line">
                      {typed}
                      {!done && <span className="inline-block w-[2px] h-[0.75em] bg-[#5fff60] ml-0.5 animate-pulse align-middle" />}
                    </p>
                  </div>
                </div>

                {done && (
                  <div className="flex items-center justify-center">
                    <span className="text-[0.5rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.28)] px-3 py-1 rounded-[2px] border border-[rgba(95,255,96,0.1)]">
                      more soon…
                    </span>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            )}

            {!mini && (
              <div className="px-4 py-3 border-t border-[rgba(95,255,96,0.08)] bg-[rgba(6,8,6,0.6)]">
                <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.1)] rounded-[3px] opacity-50 cursor-not-allowed">
                  <span className="text-[0.62rem] text-[rgba(95,255,96,0.35)] flex-1">Chat coming soon…</span>
                  <MessageSquare size={11} className="text-[rgba(95,255,96,0.3)]" />
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