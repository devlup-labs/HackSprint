import React, { useEffect, useRef, useState } from "react";
import SEO from "../components/SEO.jsx";
import "./Styles/AllHackathons.css";

// 4 · magnifier · 4, joined by a cable that has come unplugged. Everything is
// drawn with the site's own tokens so it sits on the grid background in both
// themes. Drag the loose plug to its socket to reconnect it.
const FourShape = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M200 74 L74 248 H292 M214 120 V338" fill="none" stroke="var(--hk-text)" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M200 74 L74 248 H292 M214 120 V338" fill="none" stroke="var(--hk-accent-solid)" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M196 96 L96 236 M214 140 V318" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="9" strokeLinecap="round" />
  </g>
);

const REST = { x: 541, y: 317 };
const SOCKET = { x: 592, y: 248 };

const Scene = ({ linked, onLinked }) => {
  const svgRef = useRef(null);
  const raf = useRef(0);
  const [pos, setPos] = useState(REST);
  const [dragging, setDragging] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const toSvg = (e) => {
    const svg = svgRef.current, pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: Math.max(-40, Math.min(940, p.x)), y: Math.max(40, Math.min(440, p.y)) };
  };

  const springBack = (from) => {
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - k, 3);
      setPos({ x: from.x + (REST.x - from.x) * e, y: from.y + (REST.y - from.y) * e });
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const onDown = (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setPos(toSvg(e));
  };
  const onMove = (e) => {
    if (!dragging) return;
    const p = toSvg(e);
    setPos(p);
    setNear(Math.hypot(p.x - SOCKET.x, p.y + 16 - SOCKET.y) < 60);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.hypot(pos.x - SOCKET.x, pos.y + 16 - SOCKET.y) < 60) { setNear(false); onLinked(); }
    else { setNear(false); springBack(pos); }
  };

  const end = { x: pos.x - 1, y: pos.y + 13 };
  const wire = linked
    ? "M292 248 C 330 330 380 372 450 372 C 520 372 560 330 592 248"
    : `M292 248 C 330 330 380 372 450 372 C ${450 + (end.x - 450) * 0.55} 372 ${end.x} ${end.y + 30} ${end.x} ${end.y}`;
  return (
    <svg ref={svgRef} viewBox="0 0 900 420" className="nf-scene" role="img" aria-label="404: the cable between the two fours is unplugged">
      <style>{`
        .nf-scene { width: min(900px, 94vw); height: auto; overflow: visible; }
        .nf-search { animation: nf-search 6s ease-in-out infinite; transform-origin: 450px 330px; }
        @keyframes nf-search { 0%,100% { transform: rotate(-5deg) translateX(-10px); } 50% { transform: rotate(5deg) translateX(10px); } }
        .nf-legL { animation: nf-step 1.1s ease-in-out infinite; transform-origin: 438px 300px; }
        .nf-legR { animation: nf-step 1.1s ease-in-out infinite reverse; transform-origin: 462px 300px; }
        @keyframes nf-step { 0%,100% { transform: rotate(-14deg); } 50% { transform: rotate(14deg); } }
        .nf-swing { animation: nf-swing 2.4s ease-in-out infinite; transform-origin: 540px 330px; }
        @keyframes nf-swing { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(9deg); } }
        .nf-spark { animation: nf-spark 0.9s steps(1) infinite; }
        @keyframes nf-spark { 0%,100% { opacity: 1; } 35% { opacity: 0; } 60% { opacity: .9; } 80% { opacity: 0; } }
        .nf-pulse { animation: nf-pulse 1.4s ease-in-out infinite; }
        @keyframes nf-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        .nf-plug { cursor: grab; touch-action: none; outline: none; -webkit-tap-highlight-color: transparent; }
        .nf-plug.drag { cursor: grabbing; }
        .nf-scene *:focus { outline: none; }
        @media (prefers-reduced-motion: reduce) { .nf-search,.nf-legL,.nf-legR,.nf-swing,.nf-spark,.nf-pulse { animation: none; } }
      `}</style>

      <ellipse cx="450" cy="392" rx="300" ry="12" fill="var(--hk-text)" opacity=".08" />

      <FourShape x={0} />
      <FourShape x={520} />

      {/* sockets on each 4 */}
      <g>
        <circle cx="292" cy="248" r="13" fill="var(--hk-bg)" stroke="var(--hk-text)" strokeWidth="5" />
        <circle cx="1034" cy="0" r="0" />
        <circle cx="592" cy="248" r="13" fill="var(--hk-bg)" stroke="var(--hk-text)" strokeWidth="5" />
        <path d="M586 243 v10 M598 243 v10" stroke="var(--hk-text)" strokeWidth="3" strokeLinecap="round" />
        <path d="M286 243 v10 M298 243 v10" stroke="var(--hk-text)" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* cable */}
      <path d={wire} fill="none" stroke="var(--hk-text)" strokeWidth="13" strokeLinecap="round" style={linked ? { transition: "d .4s ease" } : undefined} />
      <path d={wire} fill="none" stroke="var(--hk-accent-solid)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 12" style={linked ? { transition: "d .4s ease" } : undefined} />

      {/* loose plug */}
      {!linked && (
        <g transform={`translate(${pos.x - REST.x} ${pos.y - REST.y})`}>
          <g
            className={`${dragging ? "" : "nf-swing"} nf-plug ${dragging ? "drag" : ""}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="img"
            aria-label="Loose plug — drag it onto the socket"
          >
            <rect x="520" y="300" width="42" height="34" rx="7" fill="var(--hk-text)" />
            <rect x="530" y="282" width="6" height="22" rx="3" fill="var(--hk-text)" />
            <rect x="546" y="282" width="6" height="22" rx="3" fill="var(--hk-text)" />
            <rect x="526" y="308" width="30" height="8" rx="4" fill="var(--hk-accent-solid)" />
            <rect x="494" y="268" width="94" height="94" fill="transparent" />
          </g>
        </g>
      )}
      {linked && (
        <g>
          <rect x="570" y="232" width="30" height="32" rx="7" fill="var(--hk-text)" />
          <rect x="574" y="240" width="22" height="7" rx="3.5" fill="var(--hk-accent-solid)" />
        </g>
      )}

      {/* sparks across the gap */}
      {!linked ? (
        <g className={near ? "nf-pulse" : "nf-spark"} stroke="var(--hk-accent-solid)" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M562 262 l8 -14 l-8 -4 l10 -16" /><path d="M548 262 l-10 -10 M580 270 l12 6" />
        </g>
      ) : (
        <g className="nf-pulse" stroke="var(--hk-accent-solid)" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M330 300 C 370 352 420 360 450 360 C 480 360 530 352 560 300" strokeDasharray="1 16" />
        </g>
      )}

      {/* the searching 0 */}
      <g className="nf-search">
        {/* legs */}
        <g stroke="var(--hk-text)" strokeWidth="11" strokeLinecap="round" fill="none">
          <path className="nf-legL" d="M438 300 V 356" />
          <path className="nf-legR" d="M462 300 V 356" />
        </g>
        <ellipse cx="438" cy="360" rx="14" ry="7" fill="var(--hk-text)" />
        <ellipse cx="462" cy="360" rx="14" ry="7" fill="var(--hk-text)" />
        {/* handle */}
        <path d="M394 262 L 352 318" stroke="var(--hk-text)" strokeWidth="26" strokeLinecap="round" />
        <path d="M394 262 L 352 318" stroke="var(--hk-accent-solid)" strokeWidth="11" strokeLinecap="round" opacity=".9" />
        {/* lens */}
        <circle cx="450" cy="190" r="104" fill="var(--hk-text)" />
        <circle cx="450" cy="190" r="88" fill="var(--hk-accent-solid)" />
        <circle cx="450" cy="190" r="74" fill="var(--hk-bg)" />
        <circle cx="450" cy="190" r="74" fill="rgba(var(--hk-accent-rgb),.1)" />
        <path d="M398 168 A 60 60 0 0 1 440 130" fill="none" stroke="var(--hk-text)" strokeOpacity=".25" strokeWidth="8" strokeLinecap="round" />
        {/* plug character peeking through the lens */}
        <rect x="414" y="168" width="72" height="70" rx="18" fill="var(--hk-text)" />
        <rect x="430" y="140" width="9" height="30" rx="4" fill="var(--hk-text)" />
        <rect x="461" y="140" width="9" height="30" rx="4" fill="var(--hk-text)" />
        <circle cx="433" cy="198" r="7.5" fill="var(--hk-bg)" /><circle cx="467" cy="198" r="7.5" fill="var(--hk-bg)" />
        <circle cx="435" cy="199" r="3.6" fill="var(--hk-text)" /><circle cx="469" cy="199" r="3.6" fill="var(--hk-text)" />
        <path d="M440 218 Q 450 226 460 218" fill="none" stroke="var(--hk-bg)" strokeWidth="3.5" strokeLinecap="round" />
        {/* arms */}
        <path d="M414 206 L 396 250" stroke="var(--hk-text)" strokeWidth="10" strokeLinecap="round" />
        <path d="M486 206 L 504 236" stroke="var(--hk-text)" strokeWidth="10" strokeLinecap="round" />
        <circle cx="396" cy="252" r="9" fill="var(--hk-bg)" stroke="var(--hk-text)" strokeWidth="4" />
      </g>
    </svg>
  );
};

const NotFound = () => {
  const [linked, setLinked] = useState(false);

  return (
    <div className="hk-bg min-h-[calc(100vh-56px)] bg-[var(--hk-bg)] text-[var(--hk-text)] flex items-center justify-center px-5 py-14 relative overflow-hidden">
      <SEO title="Page Not Found" noindex />
      <div className="relative z-10 flex flex-col items-center text-center">
        <Scene linked={linked} onLinked={() => setLinked(true)} />

        <h1 className="mt-4 font-[family-name:'Syne',sans-serif] font-extrabold text-2xl sm:text-3xl tracking-tight">
          {linked ? "Connected — but there's still no page here" : "Connection lost"}
        </h1>
        <p className="mt-2 text-sm sm:text-base max-w-md text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.6)]" aria-live="polite">
          {linked
            ? "We plugged it back in, but the page you wanted isn't on the other end."
            : "The page you're looking for isn't wired up. Drag the loose plug onto the socket, or head somewhere that works."}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href="/" className="inline-flex items-center text-sm font-semibold px-6 py-3 rounded-xl bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] hover:brightness-110 transition">Back to home</a>
          <a href="/hackathons" className="inline-flex items-center text-sm font-semibold px-6 py-3 rounded-xl border border-[rgba(var(--hk-card-border-rgb),0.25)] hover:bg-[rgba(var(--hk-accent-rgb),0.08)] transition">Browse hackathons</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
