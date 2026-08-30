import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  Target,
  Code,
  ArrowRight,
  Building,
  ShieldCheck,
  UploadCloud,
  Gavel,
  Sparkles,
  Plus,
  Minus,
  GitBranch,
  X,
  Check,
  RefreshCw,
} from "lucide-react";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    .font-jb   { font-family: 'JetBrains Mono', monospace; }
    .font-syne { font-family: 'Syne', sans-serif; }

    /* animated grid bg */
    .oh-bg::before {
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background-image:
        linear-gradient(rgba(95,255,96,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(95,255,96,.03) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .oh-bg::after {
      content:''; position:fixed; pointer-events:none; z-index:0;
      width:700px; height:700px;
      background: radial-gradient(circle, rgba(95,255,96,.07) 0%, transparent 65%);
      top: -100px; left: 50%; transform: translateX(-50%);
    }

    /* corner bracket card */
    .oh-card::before, .oh-card::after {
      content:''; position:absolute;
      width:10px; height:10px; border-style:solid;
      border-color: rgba(95,255,96,.4);
      transition: border-color .2s;
    }
    .oh-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
    .oh-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
    .oh-card:hover::before,
    .oh-card:hover::after { border-color: rgba(95,255,96,.75); }

    /* hero word-by-word reveal */
    @keyframes oh-word {
      from { opacity:0; transform: translateY(28px) rotateX(-40deg); }
      to   { opacity:1; transform: translateY(0) rotateX(0); }
    }
    .oh-word { display:inline-block; opacity:0; animation: oh-word .8s cubic-bezier(.16,1,.3,1) forwards; transform-origin: bottom; }

    @keyframes oh-reveal {
      from { opacity:0; transform: translateY(22px); }
      to   { opacity:1; transform: translateY(0); }
    }
    .oh-reveal-3 { animation: oh-reveal .7s .55s ease forwards; opacity:0; }
    .oh-reveal-4 { animation: oh-reveal .7s .7s ease forwards; opacity:0; }

    /* benefit card hover */
    .oh-benefit:hover { transform: translateY(-3px); }

    /* stat/scroll pulse */
    @keyframes oh-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
    .oh-pulse { animation: oh-pulse 2.5s ease infinite; }

    /* spinning slow ring in hero */
    @keyframes oh-spin-slow { to { transform: rotate(360deg); } }
    .oh-ring { animation: oh-spin-slow 18s linear infinite; }

    /* cta glow + animated gradient border */
    .oh-cta:hover { box-shadow: 0 0 28px rgba(95,255,96,.35); }
    @keyframes oh-border-spin { to { --oh-angle: 360deg; } }
    @property --oh-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
    .oh-gradient-border {
      position: relative;
      border: 1px solid transparent;
      background:
        linear-gradient(#0a0a0a,#0a0a0a) padding-box,
        conic-gradient(from var(--oh-angle), rgba(95,255,96,0.05), rgba(95,255,96,0.9), rgba(95,255,96,0.05) 40%) border-box;
      animation: oh-border-spin 4s linear infinite;
    }

    /* scroll-triggered zoom reveal */
    .oh-zoom {
      opacity: 0;
      transform: scale(0.82);
      transition: opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1);
    }
    .oh-zoom-visible { opacity: 1; transform: scale(1); }

    /* slide-in from left/right for before/after columns */
    .oh-slide-l { opacity:0; transform: translateX(-40px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
    .oh-slide-r { opacity:0; transform: translateX(40px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
    .oh-slide-visible { opacity:1; transform: translateX(0); }

    /* flow-diagram data packets travelling along the connector */
    @keyframes oh-packet { 0%{left:-4%; opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{left:104%; opacity:0} }
    .oh-packet { animation: oh-packet 3.2s linear infinite; }

    /* mock table row "live" highlight sweep */
    @keyframes oh-row-glow { 0%,100%{ background-color: rgba(95,255,96,0.02);} 50%{ background-color: rgba(95,255,96,0.07);} }
    .oh-row-live { animation: oh-row-glow 2.4s ease-in-out infinite; }

    /* live indicator blink */
    @keyframes oh-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
    .oh-blink-dot { animation: oh-blink 1.4s ease-in-out infinite; }

    /* section nav dot */
    .oh-navdot { transition: all .3s ease; }

    /* continuously orbiting packets around the lifecycle loop */
    @keyframes oh-orbit { to { transform: rotate(360deg); } }
    .oh-orbit { animation: oh-orbit 9s linear infinite; }

    /* detail panel pop-in on stage change */
    @keyframes oh-pop { from { opacity:0; transform: scale(0.92) translateY(6px); } to { opacity:1; transform: scale(1) translateY(0); } }
    .oh-pop { animation: oh-pop .4s cubic-bezier(.16,1,.3,1); }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────
   Shared hooks
───────────────────────────────────────────────────────────────────────── */
const useZoomReveal = (selector, visibleClass = "oh-zoom-visible") => {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add(visibleClass);
        }),
      { threshold: 0.2 }
    );
    document.querySelectorAll(selector).forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [selector, visibleClass]);
};

// Lightweight tilt-on-hover — perspective rotate following the cursor,
// snapping back to flat on leave. Pure inline-style, no extra deps.
const useTilt = () => {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateY(-3px)`;
  };
  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
  };
  return { ref, onMouseMove, onMouseLeave };
};

/* ─────────────────────────────────────────────────────────────────────────
   Sticky in-page section nav (desktop only)
───────────────────────────────────────────────────────────────────────── */
const sectionList = [
  { id: "flow-preview", label: "Flow" },
  { id: "breakdown", label: "Breakdown" },
  { id: "compare", label: "Compare" },
  { id: "why-organize", label: "Why Us" },
];

const SectionNav = () => {
  const [active, setActive] = useState(sectionList[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.5 }
    );
    sectionList.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4">
      {sectionList.map((s) => (
        <button
          key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
          className="oh-navdot group flex items-center gap-2.5 cursor-pointer"
        >
          <span
            className={`font-jb text-[0.55rem] tracking-[0.12em] uppercase transition-all duration-300 ${
              active === s.id
                ? "text-[#5fff60] opacity-100"
                : "text-[rgba(180,220,180,0.35)] opacity-0 group-hover:opacity-100"
            }`}
          >
            {s.label}
          </span>
          <span
            className={`rounded-full transition-all duration-300 ${
              active === s.id
                ? "w-2.5 h-2.5 bg-[#5fff60] shadow-[0_0_10px_rgba(95,255,96,0.7)]"
                : "w-1.5 h-1.5 bg-[rgba(95,255,96,0.25)] group-hover:bg-[rgba(95,255,96,0.5)]"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Flow-diagram "product mockup" — styled like a real tool screenshot:
   window chrome, working zoom controls, animated data-flow connector, and
   a small live-feeling table underneath.
───────────────────────────────────────────────────────────────────────── */
const flowNodes = [
  { icon: Sparkles, label: "Draft", sub: "New hackathon" },
  { icon: ShieldCheck, label: "Approve", sub: "Controller review" },
  { icon: Users, label: "Register", sub: "Teams form up" },
  { icon: UploadCloud, label: "Submit", sub: "Projects come in" },
  { icon: Gavel, label: "Judge", sub: "Score & vote" },
  { icon: Trophy, label: "Results", sub: "Leaderboard live" },
];

const mockRows = [
  { team: "Prompt Engineers", phase: "Judging", status: "Scored", pts: "812" },
  { team: "CipherKins", phase: "Submission", status: "Submitted", pts: "—" },
  { team: "VoidSet", phase: "Judging", status: "Scored", pts: "764" },
];

const FlowDiagramMockup = () => {
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (wrapRef.current) wrapRef.current.classList.add("oh-zoom-visible");
  }, []);

  return (
    <section id="flow-preview" className="relative z-10 py-20 px-5">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <div className="font-jb inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-1 rounded-[2px] mb-4">
            <GitBranch size={11} /> Live Preview
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
          >
            See Your Hackathon <span className="text-[#5fff60]">Flow</span>
          </h2>
          <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] mt-4 max-w-lg mx-auto leading-relaxed">
            Every hackathon runs through this exact pipeline — this is what it
            looks like end to end.
          </p>
        </div>

        <div
          ref={wrapRef}
          className="oh-zoom relative rounded-[6px] border border-[rgba(95,255,96,0.15)] bg-[rgba(8,10,8,0.95)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(95,255,96,0.08)] bg-[rgba(95,255,96,0.02)]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,100,100,0.5)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,184,77,0.5)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[rgba(95,255,96,0.5)]" />
              </div>
              <span className="font-jb text-[0.62rem] text-[rgba(180,220,180,0.4)] tracking-[0.04em]">
                organizer / hackathon-flow
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-jb inline-flex items-center gap-1.5 text-[0.55rem] tracking-[0.1em] uppercase text-[#5fff60]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] oh-blink-dot" /> Live
              </span>
              <div className="flex items-center gap-1 border border-[rgba(95,255,96,0.15)] rounded-[3px] overflow-hidden">
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
                  className="w-6 h-6 flex items-center justify-center text-[rgba(95,255,96,0.55)] hover:bg-[rgba(95,255,96,0.1)] hover:text-[#5fff60] transition-colors cursor-pointer"
                  aria-label="Zoom out"
                >
                  <Minus size={11} />
                </button>
                <span className="font-jb text-[0.55rem] text-[rgba(180,220,180,0.4)] w-9 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 1.3))}
                  className="w-6 h-6 flex items-center justify-center text-[rgba(95,255,96,0.55)] hover:bg-[rgba(95,255,96,0.1)] hover:text-[#5fff60] transition-colors cursor-pointer"
                  aria-label="Zoom in"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* canvas */}
          <div className="relative px-6 sm:px-10 py-16 overflow-x-auto">
            <div
              className="relative min-w-[720px] transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              <div className="absolute top-[27px] left-[8%] right-[8%] h-px bg-[rgba(95,255,96,0.12)]" />
              <div className="absolute top-[24px] left-[8%] right-[8%] h-[6px] overflow-hidden pointer-events-none">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="oh-packet absolute top-[1.5px] h-[3px] w-10 rounded-full bg-gradient-to-r from-transparent via-[#5fff60] to-transparent"
                    style={{ animationDelay: `${i * 1.05}s` }}
                  />
                ))}
              </div>

              <div className="relative grid grid-cols-6 gap-3">
                {flowNodes.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-[3px] bg-[#0a0a0a] border-2 border-[rgba(95,255,96,0.25)] flex items-center justify-center mb-3 shadow-[0_0_16px_rgba(95,255,96,0.1)]">
                        <Icon size={20} className="text-[#5fff60]" />
                      </div>
                      <div className="font-syne font-extrabold text-white text-[0.75rem] tracking-tight">
                        {n.label}
                      </div>
                      <div className="font-jb text-[0.55rem] text-[rgba(180,220,180,0.4)] mt-0.5">
                        {n.sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* mock live data table */}
          <div className="border-t border-[rgba(95,255,96,0.08)] bg-[rgba(95,255,96,0.015)]">
            <div className="grid grid-cols-4 gap-4 px-6 py-2.5 border-b border-[rgba(95,255,96,0.06)]">
              {["Team", "Phase", "Status", "Score"].map((h) => (
                <span key={h} className="font-jb text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.3)]">
                  {h}
                </span>
              ))}
            </div>
            {mockRows.map((r, i) => (
              <div
                key={i}
                className={`oh-row-live grid grid-cols-4 gap-4 px-6 py-2.5 ${
                  i !== mockRows.length - 1 ? "border-b border-[rgba(95,255,96,0.04)]" : ""
                }`}
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <span className="font-jb text-[0.65rem] text-white truncate">{r.team}</span>
                <span className="font-jb text-[0.65rem] text-[rgba(180,220,180,0.5)]">{r.phase}</span>
                <span className="font-jb text-[0.65rem] text-[rgba(95,255,96,0.65)]">{r.status}</span>
                <span className="font-jb text-[0.65rem] text-[rgba(255,184,77,0.75)]">{r.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Detailed interactive pipeline breakdown
───────────────────────────────────────────────────────────────────────── */
const workflowSteps = [
  {
    icon: Calendar,
    title: "Configure",
    desc: "Set up phases, forms, prizes, and scoring rules before anything goes live.",
    details: [
      "Registration → Submission → Judging → Results phases with real dates",
      "Custom registration & submission form fields, including file uploads",
      "Prize pool, judging scale, and community-vote weighting",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Get Approved",
    desc: "Submit for review — a platform controller signs off before it's public.",
    details: [
      "Drafts stay private until you submit for approval",
      "Controllers approve or reject with a reason",
      "Approved hackathons go public and open registration",
    ],
  },
  {
    icon: Users,
    title: "Registration & Teams",
    desc: "Students register and form teams with invite codes — tracked live.",
    details: [
      "Solo or team participation, your call per hackathon",
      "Invite-code team joining with leader & member roles",
      "Live participant and team overview dashboard",
    ],
  },
  {
    icon: UploadCloud,
    title: "Submissions",
    desc: "Teams submit GitHub links, docs, videos, or files — per phase.",
    details: [
      "Multi-file uploads with admin-configurable file types",
      "Per-phase submission tracking across every team",
      "Editable submissions right up until the deadline",
    ],
  },
  {
    icon: Gavel,
    title: "Judge & Vote",
    desc: "Assigned judges score submissions while the community votes in parallel.",
    details: [
      "Assign judges and score on your own custom scale",
      "Public voting with a configurable weight against judge scores",
      "Self-vote protection built in",
    ],
  },
  {
    icon: Trophy,
    title: "Results",
    desc: "A weighted leaderboard computes automatically — preview it, then publish.",
    details: [
      "Judge scores + votes blend into one final ranking",
      "Preview the scoreboard before making it public",
      "Control how many top submissions the public sees",
    ],
  },
];

// 6 nodes evenly spaced around a circle, starting at the top and going
// clockwise, so the layout reads as a continuous loop rather than a line.
const LOOP_RADIUS = 40;
const nodePositions = workflowSteps.map((_, i) => {
  const angle = (i * (360 / workflowSteps.length) - 90) * (Math.PI / 180);
  return {
    left: 50 + LOOP_RADIUS * Math.cos(angle),
    top: 50 + LOOP_RADIUS * Math.sin(angle),
  };
});

const WorkflowPipeline = () => {
  const [selected, setSelected] = useState(0);
  const [expandedMobile, setExpandedMobile] = useState(null);

  useZoomReveal(".oh-loop-zoom");

  const step = workflowSteps[selected];
  const StepIcon = step.icon;
  const toggleMobile = (i) => setExpandedMobile((prev) => (prev === i ? null : i));

  return (
    <section id="breakdown" className="relative z-10 py-28">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="text-center mb-14">
          <div className="font-jb inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-1 rounded-[2px] mb-4">
            <RefreshCw size={11} /> A Repeating Cycle
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
          >
            From Draft to <span className="text-[#5fff60]">Results</span>
          </h2>
          <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] mt-4 tracking-[0.05em] max-w-lg mx-auto">
            Every hackathon runs this exact loop — click a stage to see what
            happens there.
          </p>
        </div>

        {/* Desktop: circular, continuously-looping pipeline */}
        <div className="hidden md:block oh-loop-zoom oh-zoom">
          <div className="relative mx-auto aspect-square w-full max-w-[540px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={LOOP_RADIUS}
                fill="none"
                stroke="rgba(95,255,96,0.12)"
                strokeWidth="0.4"
              />
            </svg>

            {/* packets continuously orbiting the loop */}
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="absolute inset-0 oh-orbit" style={{ animationDelay: `${i * -2.25}s` }}>
                <span
                  className="absolute w-2.5 h-2.5 rounded-full bg-[#5fff60] shadow-[0_0_10px_rgba(95,255,96,0.8)]"
                  style={{ left: "50%", top: `${50 - LOOP_RADIUS}%`, transform: "translate(-50%,-50%)" }}
                />
              </div>
            ))}

            {/* center hub */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-2 max-w-[38%] text-center">
                <RefreshCw size={20} className="oh-ring text-[rgba(95,255,96,0.35)]" style={{ animationDuration: "6s" }} />
                <span className="font-jb text-[0.5rem] tracking-[0.12em] uppercase text-[rgba(180,220,180,0.35)] leading-relaxed">
                  Repeats every hackathon
                </span>
              </div>
            </div>

            {/* nodes on the ring */}
            {workflowSteps.map((s, i) => {
              const Icon = s.icon;
              const pos = nodePositions[i];
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="absolute flex flex-col items-center text-center cursor-pointer group"
                  style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: "translate(-50%,-50%)" }}
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-[#0a0a0a] border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "border-[#5fff60] shadow-[0_0_24px_rgba(95,255,96,0.4)] scale-110"
                        : "border-[rgba(95,255,96,0.22)] group-hover:border-[rgba(95,255,96,0.5)]"
                    }`}
                  >
                    <Icon size={22} className={isSelected ? "text-[#5fff60]" : "text-[rgba(95,255,96,0.45)]"} />
                  </div>
                  <span
                    className={`font-syne font-extrabold text-[0.72rem] tracking-tight mt-2 transition-colors whitespace-nowrap ${
                      isSelected ? "text-[#5fff60]" : "text-white"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* detail panel for the selected stage */}
          <div className="oh-pop max-w-xl mx-auto mt-10" key={selected}>
            <div className="oh-card relative bg-[rgba(10,12,10,0.9)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-7 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-[3px] bg-[rgba(95,255,96,0.08)] border border-[rgba(95,255,96,0.2)] flex items-center justify-center flex-shrink-0">
                  <StepIcon size={16} className="text-[#5fff60]" />
                </div>
                <h3 className="font-syne font-extrabold text-white text-[1.1rem] tracking-tight">{step.title}</h3>
              </div>
              <p className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.5)] leading-relaxed mb-5">{step.desc}</p>
              <div className="flex flex-col gap-2 text-left max-w-sm mx-auto">
                {step.details.map((d, di) => (
                  <div key={di} className="font-jb text-[0.64rem] text-[rgba(180,220,180,0.55)] leading-snug flex gap-2">
                    <span className="text-[#5fff60] flex-shrink-0">›</span>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: vertical list that loops back at the end */}
        <div className="md:hidden relative pl-8">
          <div className="absolute left-3 top-0 bottom-6 w-px bg-[rgba(95,255,96,0.1)]" />
          <div className="flex flex-col gap-7">
            {workflowSteps.map((s, i) => {
              const Icon = s.icon;
              const isExpanded = expandedMobile === i;
              return (
                <div key={i} className="oh-zoom oh-loop-zoom relative" style={{ transitionDelay: `${i * 0.06}s` }}>
                  <div className="flex gap-5 cursor-pointer" onClick={() => toggleMobile(i)}>
                    <div className="absolute -left-8 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-[rgba(95,255,96,0.25)] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[#5fff60]" />
                    </div>
                    <div className="oh-card relative ml-4 p-5 w-full bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px]">
                      <h3 className="font-syne text-[1.05rem] font-extrabold text-white mb-2">{s.title}</h3>
                      <p className="font-jb text-[0.7rem] text-[rgba(180,220,180,0.48)] leading-relaxed">{s.desc}</p>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isExpanded ? "max-h-48 opacity-100 mt-3" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="flex flex-col gap-1.5 pt-3 border-t border-[rgba(95,255,96,0.08)]">
                          {s.details.map((d, di) => (
                            <div key={di} className="font-jb text-[0.62rem] text-[rgba(180,220,180,0.55)] leading-snug flex gap-1.5">
                              <span className="text-[#5fff60] flex-shrink-0">›</span>
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="relative flex items-center gap-3 pl-4">
              <RefreshCw size={14} className="text-[rgba(95,255,96,0.4)] flex-shrink-0" />
              <span className="font-jb text-[0.62rem] text-[rgba(180,220,180,0.4)] italic">
                …and loops back to Configure for the next hackathon.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Before / After comparison — storytelling contrast section
───────────────────────────────────────────────────────────────────────── */
const withoutList = [
  "Registrations scattered across Google Forms",
  "Team formation happening over DMs and group chats",
  "Judging done manually in a spreadsheet",
  "No live view of who's submitted and who hasn't",
];
const withList = [
  "One structured registration & team-formation flow",
  "Invite-code teams with leader/member roles built in",
  "Judge scoring blended with community votes automatically",
  "A live participant, team, and submission dashboard",
];

const CompareCard = ({ title, tone, items }) => {
  const isBad = tone === "bad";
  return (
    <div
      className={`oh-card relative flex-1 rounded-[4px] p-7 backdrop-blur-sm ${
        isBad
          ? "bg-[rgba(255,60,60,0.03)] border border-[rgba(255,96,96,0.15)]"
          : "bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.18)]"
      }`}
    >
      <div
        className={`font-jb inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.14em] uppercase mb-5 px-2.5 py-1 rounded-[2px] ${
          isBad ? "bg-[rgba(255,96,96,0.08)] text-[#ff9090]" : "bg-[rgba(95,255,96,0.08)] text-[#5fff60]"
        }`}
      >
        {title}
      </div>
      <div className="flex flex-col gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-3">
            {isBad ? (
              <X size={14} className="text-[rgba(255,120,120,0.6)] mt-0.5 flex-shrink-0" />
            ) : (
              <Check size={14} className="text-[#5fff60] mt-0.5 flex-shrink-0" />
            )}
            <span className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.6)] leading-relaxed">{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompareSection = () => {
  useZoomReveal(".oh-slide-l", "oh-slide-visible");
  useZoomReveal(".oh-slide-r", "oh-slide-visible");

  return (
    <section id="compare" className="relative z-10 py-28 px-5">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
          >
            Running It <span className="text-[#5fff60]">vs. Winging It</span>
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          <div className="oh-slide-l flex-1">
            <CompareCard title="Without HackSprint" tone="bad" items={withoutList} />
          </div>
          <div className="oh-slide-r flex-1">
            <CompareCard title="With HackSprint" tone="good" items={withList} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Benefits — now with cursor-tilt cards
───────────────────────────────────────────────────────────────────────── */
const benefits = [
  {
    icon: Users,
    title: "Global Reach",
    desc: "Connect with innovators across the globe and attract diverse, world-class talent to your event. A public listing, shareable links, and wishlisting make it easy for the right people to find you.",
    highlight: "Public listing · shareable pages · wishlisting",
    tag: "AUDIENCE",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
    accent: "rgba(96,200,255,0.7)",
    border: "rgba(96,200,255,0.18)",
    hoverBorder: "rgba(96,200,255,0.45)",
    tagBg: "rgba(96,200,255,0.08)",
    tagColor: "#60c8ff",
  },
  {
    icon: Building,
    title: "Seamless Ops",
    desc: "Track registrations, teams, and submissions with ease — all in one live dashboard.",
    tag: "OPERATIONS",
    span: "",
    accent: "rgba(180,120,255,0.7)",
    border: "rgba(180,120,255,0.18)",
    hoverBorder: "rgba(180,120,255,0.45)",
    tagBg: "rgba(180,120,255,0.08)",
    tagColor: "#b478ff",
  },
  {
    icon: Target,
    title: "Real Impact",
    desc: "Amplify your brand and showcase winning projects to the world.",
    tag: "IMPACT",
    span: "",
    accent: "rgba(255,184,77,0.7)",
    border: "rgba(255,184,77,0.18)",
    hoverBorder: "rgba(255,184,77,0.45)",
    tagBg: "rgba(255,184,77,0.08)",
    tagColor: "#ffb84d",
  },
  {
    icon: Code,
    title: "Full Support",
    desc: "Assign judges, configure weighted scoring, and manage the whole event lifecycle — registration through results — from one dashboard, without duct-taping together forms and spreadsheets.",
    highlight: "Judge assignment · weighted scoring · one dashboard",
    tag: "SUPPORT",
    span: "md:col-span-2",
    accent: "rgba(95,255,96,0.7)",
    border: "rgba(95,255,96,0.18)",
    hoverBorder: "rgba(95,255,96,0.45)",
    tagBg: "rgba(95,255,96,0.08)",
    tagColor: "#5fff60",
  },
];

const BenefitCard = ({ b, i }) => {
  const Icon = b.icon;
  const { ref, onMouseMove, onMouseLeave } = useTilt();

  return (
    <div
      className={`oh-benefit oh-zoom oh-benefit-zoom relative group cursor-default ${b.span}`}
      style={{ transitionDelay: `${i * 0.08}s` }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative overflow-hidden p-7 rounded-[4px] bg-[rgba(10,12,10,0.88)] backdrop-blur-sm h-full flex flex-col gap-4 transition-transform duration-150 will-change-transform"
        style={{ border: `1px solid ${b.border}` }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = b.hoverBorder)}
        onMouseLeaveCapture={(e) => (e.currentTarget.style.borderColor = b.border)}
      >
        {/* accent glow */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${b.accent.replace("0.7", "0.12")} 0%, transparent 70%)` }}
        />

        <span
          className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px]"
          style={{ borderTop: `2px solid ${b.accent}`, borderLeft: `2px solid ${b.accent}` }}
        />
        <span
          className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px]"
          style={{ borderBottom: `2px solid ${b.accent}`, borderRight: `2px solid ${b.accent}` }}
        />

        <span
          className="font-jb self-start text-[0.55rem] tracking-[0.16em] uppercase px-[0.55rem] py-[0.2rem] rounded-[2px] relative"
          style={{ background: b.tagBg, color: b.tagColor }}
        >
          {b.tag}
        </span>

        <div
          className={`relative rounded-[3px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            b.featured ? "w-16 h-16" : "w-12 h-12"
          }`}
          style={{ background: b.tagBg, border: `1px solid ${b.border}` }}
        >
          <Icon size={b.featured ? 30 : 22} style={{ color: b.tagColor }} />
        </div>

        <h3
          className={`relative font-syne font-extrabold text-white tracking-tight ${
            b.featured ? "text-[1.5rem]" : "text-[1.1rem]"
          }`}
        >
          {b.title}
        </h3>
        <p
          className={`relative font-jb text-[rgba(180,220,180,0.48)] leading-relaxed flex-1 ${
            b.featured ? "text-[0.78rem] max-w-md" : "text-[0.68rem]"
          }`}
        >
          {b.desc}
        </p>

        {b.highlight && (
          <div className="relative font-jb text-[0.6rem] tracking-[0.03em] flex items-center gap-2 pt-3 border-t border-[rgba(95,255,96,0.08)]" style={{ color: b.tagColor }}>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: b.tagColor }} />
            {b.highlight}
          </div>
        )}
      </div>
    </div>
  );
};

const Benefits = () => {
  useZoomReveal(".oh-benefit-zoom");

  return (
    <section id="why-organize" className="relative z-10 py-28 px-4 md:px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-15 md:mb-20">
          <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-1 rounded-[2px] mb-4">
            Built For Organizers
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none
    text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]"
          >
            Why Organize <span className="text-[#5fff60]">Here?</span>
          </h2>
          <p
            className="font-jb text-[0.75rem] sm:text-[0.8rem] md:text-[0.85rem]
    text-[rgba(180,220,180,0.48)] mt-4 tracking-[0.05em] max-w-md mx-auto"
          >
            Powerful tools to maximise your hackathon's impact
          </p>
        </div>

        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5 md:auto-rows-[1fr]">
          {benefits.map((b, i) => (
            <BenefitCard key={i} b={b} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────────────────── */
const heroWords = ["Organize", "Hackathons", "with", "Ease"];

export default function OrganizerHome() {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("adminToken");

  const heroGlowRef = useRef(null);
  const heroLayer1Ref = useRef(null);
  const heroLayer2Ref = useRef(null);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const scrollState = useRef({ scale: 1, opacity: 1 });

  const applyHeroTransform = () => {
    if (!heroGlowRef.current) return;
    const { x, y } = mouseOffset.current;
    const { scale, opacity } = scrollState.current;
    heroGlowRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    heroGlowRef.current.style.opacity = opacity;
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      scrollState.current = {
        scale: 1 + Math.min(y / 900, 0.6),
        opacity: Math.max(1 - y / 500, 0),
      };
      applyHeroTransform();

      if (heroLayer1Ref.current) heroLayer1Ref.current.style.transform = `translateY(${y * 0.15}px)`;
      if (heroLayer2Ref.current) heroLayer2Ref.current.style.transform = `translateY(${y * 0.3}px)`;
    };

    const onMouseMove = (e) => {
      mouseOffset.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 24,
        y: (e.clientY / window.innerHeight - 0.5) * 24,
      };
      applyHeroTransform();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      <Styles />
      <SectionNav />
      <div className="oh-bg font-jb min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-hidden">
        {/* ── Hero ── */}
        <section className="relative z-10 pt-35 pb-14 text-center overflow-hidden">
          <div ref={heroLayer1Ref} className="pointer-events-none">
            <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(95,255,96,0.09)_0%,transparent_70%)]" />
          </div>
          <div ref={heroLayer2Ref} className="pointer-events-none">
            <div className="pointer-events-none absolute top-[60px] left-[-10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(95,255,96,0.04)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-[60px] right-[-10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(95,255,96,0.04)_0%,transparent_70%)]" />
          </div>

          <div ref={heroGlowRef} className="absolute inset-0 pointer-events-none" style={{ transformOrigin: "center" }}>
            <div className="oh-ring pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[rgba(95,255,96,0.04)]" />
            <div
              className="oh-ring pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[rgba(95,255,96,0.035)]"
              style={{ animationDuration: "25s", animationDirection: "reverse" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <h1
              className="font-syne font-extrabold leading-[0.95] tracking-[-0.04em] text-white mb-6
  text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[6rem]"
              style={{ perspective: "600px" }}
            >
              {heroWords.map((w, i) => (
                <React.Fragment key={i}>
                  <span
                    className={`oh-word ${w === "Ease" ? "text-[#5fff60]" : ""}`}
                    style={{ animationDelay: `${0.15 + i * 0.12}s` }}
                  >
                    {w}
                  </span>
                  {i < heroWords.length - 1 ? " " : ""}
                  {(i === 0 || i === 2) && <br />}
                </React.Fragment>
              ))}
            </h1>

            <p
              className="oh-reveal-3 font-jb text-[0.7rem] sm:text-[0.75rem] md:text-[0.8rem] lg:text-[0.85rem]
  text-[rgba(180,220,180,0.5)] leading-relaxed mb-10 max-w-[680px] mx-auto tracking-[0.02em]"
            >
              Launch, manage, and scale your hackathons on our platform. Connect
              with innovators, showcase challenges, and drive impactful
              solutions effortlessly.
            </p>

            <div className="oh-reveal-4 flex flex-wrap items-center justify-center gap-3">
              <div className="oh-gradient-border rounded-[4px]">
                <button
                  onClick={() => navigate(isAdmin ? "/admin" : "/adminlogin")}
                  className="oh-cta font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] cursor-pointer transition-all duration-200 bg-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80]"
                >
                  {isAdmin ? "Dashboard" : "Get Started"}
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                onClick={() => document.getElementById("flow-preview")?.scrollIntoView({ behavior: "smooth" })}
                className="font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:border-[rgba(95,255,96,0.45)] hover:text-[#5fff60]"
              >
                See the flow
              </button>
            </div>

            <div className="oh-pulse mt-14 flex flex-col items-center gap-[0.4rem]">
              <span className="font-jb text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.25)]">
                Scroll to explore
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-[rgba(95,255,96,0.3)] to-transparent" />
            </div>
          </div>
        </section>

        <FlowDiagramMockup />
        <WorkflowPipeline />
        <CompareSection />
        <Benefits />
      </div>
    </>
  );
}
