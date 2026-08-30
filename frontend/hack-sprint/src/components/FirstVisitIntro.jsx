import React, { useEffect, useRef, useState } from "react";

// Boot-sequence lines — deliberately generic, no real site numbers (hackathon
// counts, user counts, etc.) baked into decorative flavor text that would go
// stale the moment those numbers change.
const LINES = [
  { text: "BOOTING HACKSPRINT", tag: null },
  { text: "> mounting filesystem", tag: "[OK]" },
  { text: "> initializing neural handshake", tag: "[OK]" },
  { text: "> calibrating live bracket engine", tag: "[OK]" },
  { text: "> decrypting community graph", tag: "[OK]" },
  { text: "> synchronizing notification grid", tag: "[OK]" },
  { text: "> compiling event registry", tag: "[OK]" },
  { text: "> establishing secure uplink", tag: "[ENCRYPTED]" },
];

const CHAR_MS = 42;
const LINE_PAUSE_MS = 420;
const TAG_DELAY_MS = 180;
const GATE_MS = 1200;

const useMatrixRain = (canvasRef, active) => {
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(null).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = "rgba(5,7,5,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#5fff60";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 45);
    window.addEventListener("resize", resize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, [active, canvasRef]);
};

export default function FirstVisitIntro() {
  const [visible, setVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [typedLines, setTypedLines] = useState([]);
  const [phase, setPhase] = useState("boot"); // boot -> granted -> welcome -> opening -> done
  const canvasRef = useRef(null);
  const timeouts = useRef([]);

  useMatrixRain(canvasRef, visible && phase !== "opening");

  // The gate-open reveal: content fades fast, then two panels physically
  // slide apart off-screen — the actual homepage has been rendering behind
  // this the whole time, so opening the gate is all that's left to do.
  const finish = () => {
    timeouts.current.forEach(clearTimeout);
    setPhase("opening");
    timeouts.current.push(setTimeout(() => setVisible(false), GATE_MS + 150));
  };

  useEffect(() => {
    if (!visible || phase !== "boot") return;

    if (lineIndex >= LINES.length) {
      timeouts.current.push(setTimeout(() => setPhase("granted"), 500));
      return;
    }

    const { text, tag } = LINES[lineIndex];
    let charPos = 0;

    const typeChar = () => {
      charPos++;
      setTypedLines((prev) => {
        const next = [...prev];
        next[lineIndex] = { text: text.slice(0, charPos), tag: null };
        return next;
      });

      if (charPos < text.length) {
        timeouts.current.push(setTimeout(typeChar, CHAR_MS));
      } else if (tag) {
        timeouts.current.push(
          setTimeout(() => {
            setTypedLines((prev) => {
              const next = [...prev];
              next[lineIndex] = { text, tag };
              return next;
            });
            timeouts.current.push(setTimeout(() => setLineIndex((i) => i + 1), LINE_PAUSE_MS));
          }, TAG_DELAY_MS)
        );
      } else {
        timeouts.current.push(setTimeout(() => setLineIndex((i) => i + 1), LINE_PAUSE_MS));
      }
    };

    timeouts.current.push(setTimeout(typeChar, CHAR_MS));
  }, [visible, phase, lineIndex]);

  useEffect(() => {
    if (phase === "granted") {
      timeouts.current.push(setTimeout(() => setPhase("welcome"), 1400));
    } else if (phase === "welcome") {
      timeouts.current.push(setTimeout(finish, 3200));
    }
  }, [phase]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  if (!visible) return null;

  const opening = phase === "opening";

  return (
    <div className="fixed inset-0 z-[999999]">
      {/* Left gate panel */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-[#050705] border-r border-[rgba(95,255,96,0.15)] ${
          opening ? "transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]" : ""
        }`}
        style={{
          transitionDuration: opening ? `${GATE_MS}ms` : "0ms",
          transform: opening ? "translateX(-100%)" : "translateX(0)",
        }}
      />
      {/* Right gate panel */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-[#050705] border-l border-[rgba(95,255,96,0.15)] ${
          opening ? "transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]" : ""
        }`}
        style={{
          transitionDuration: opening ? `${GATE_MS}ms` : "0ms",
          transform: opening ? "translateX(100%)" : "translateX(0)",
        }}
      />

      {/* Seam flash — light bursting through the crack the instant it opens */}
      {opening && (
        <div
          className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[#aaffab]"
          style={{
            boxShadow: "0 0 120px 40px rgba(95,255,96,0.85)",
            animation: "hs-seam-flash 550ms ease-out forwards",
          }}
        />
      )}

      {/* Content — matrix rain + typed lines / welcome — fades out fast the
          instant the gate starts opening */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-[0.22]" />

        <div className="relative z-10 w-full max-w-xl px-6 font-[family-name:'JetBrains_Mono',monospace]">
          {(phase === "boot" || phase === "granted") && (
            <div className="flex flex-col gap-1.5">
              {LINES.map((_, i) => {
                const line = typedLines[i];
                if (!line) return null;
                return (
                  <div key={i} className="text-[0.8rem] sm:text-[0.9rem] text-[#5fff60] flex gap-2">
                    <span>{line.text}</span>
                    {line.tag && <span className="text-[rgba(180,220,180,0.55)]">{line.tag}</span>}
                    {i === lineIndex && phase === "boot" && (
                      <span className="inline-block w-2 h-4 bg-[#5fff60] animate-pulse ml-0.5" />
                    )}
                  </div>
                );
              })}
              {phase === "granted" && (
                <div className="mt-4 text-[1.3rem] sm:text-[1.6rem] text-white font-bold tracking-[0.15em] hs-glitch" data-text="ACCESS GRANTED">
                  ACCESS GRANTED
                </div>
              )}
            </div>
          )}

          {phase === "welcome" && (
            <div className="text-center animate-[hs-fade-in_0.6s_ease]">
              <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-4xl sm:text-6xl tracking-tight mb-3">
                Hack<span className="text-[#5fff60]">Sprint</span>
              </h1>
              <p className="text-[0.75rem] tracking-[0.2em] uppercase text-[rgba(180,220,180,0.5)]">
                Welcome, builder.
              </p>
            </div>
          )}
        </div>
      </div>

      {!opening && (
        <button
          onClick={finish}
          className="absolute bottom-6 right-6 z-10 font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(180,220,180,0.35)] hover:text-[#5fff60] border border-[rgba(95,255,96,0.15)] hover:border-[rgba(95,255,96,0.4)] px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer"
        >
          Skip Intro →
        </button>
      )}

      <style>{`
        @keyframes hs-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hs-seam-flash {
          0% { opacity: 0; }
          25% { opacity: 1; }
          100% { opacity: 0; }
        }
        .hs-glitch { position: relative; }
        .hs-glitch::before, .hs-glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          overflow: hidden;
        }
        .hs-glitch::before {
          color: #ff6b6b;
          animation: hs-glitch-1 420ms linear 2;
          clip-path: inset(0 0 60% 0);
        }
        .hs-glitch::after {
          color: #60c8ff;
          animation: hs-glitch-2 420ms linear 2;
          clip-path: inset(60% 0 0 0);
        }
        @keyframes hs-glitch-1 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          20% { transform: translate(-3px, -1px); opacity: 0.8; }
          40% { transform: translate(2px, 1px); opacity: 0; }
          60% { transform: translate(-2px, 0); opacity: 0.6; }
          80% { transform: translate(1px, -1px); opacity: 0; }
        }
        @keyframes hs-glitch-2 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          25% { transform: translate(3px, 1px); opacity: 0.7; }
          50% { transform: translate(-2px, -1px); opacity: 0; }
          75% { transform: translate(2px, 0); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
