import React, { useEffect, useRef } from "react";
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
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import "../Styles/AllHackathons.css";
import "../Styles/Home.css";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    .font-jb   { font-family: 'JetBrains Mono', monospace; }
    .font-syne { font-family: 'Syne', sans-serif; }

    /* animated grid bg */
    .oh-bg::before {
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background-image:
        linear-gradient(rgba(var(--hk-accent-rgb),.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(var(--hk-accent-rgb),.03) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .oh-bg::after {
      content:''; position:fixed; pointer-events:none; z-index:0;
      width:700px; height:700px;
      background: radial-gradient(circle, rgba(var(--hk-accent-rgb),.07) 0%, transparent 65%);
      top: -100px; left: 50%; transform: translateX(-50%);
    }

    /* corner bracket card */
    .oh-card::before, .oh-card::after {
      content:''; position:absolute;
      width:10px; height:10px; border-style:solid;
      border-color: rgba(var(--hk-accent-rgb),.4);
      transition: border-color .2s;
    }
    .oh-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
    .oh-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
    .oh-card:hover::before,
    .oh-card:hover::after { border-color: rgba(var(--hk-accent-rgb),.75); }

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
    .oh-cta:hover { box-shadow: 0 0 28px rgba(var(--hk-accent-rgb),.35); }
    @keyframes oh-border-spin { to { --oh-angle: 360deg; } }
    @property --oh-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
    .oh-gradient-border {
      position: relative;
      border: 1px solid transparent;
      background:
        linear-gradient(var(--hk-bg),var(--hk-bg)) padding-box,
        conic-gradient(from var(--oh-angle), rgba(var(--hk-accent-rgb),0.05), rgba(var(--hk-accent-rgb),0.9), rgba(var(--hk-accent-rgb),0.05) 40%) border-box;
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
    @keyframes oh-row-glow { 0%,100%{ background-color: rgba(var(--hk-accent-rgb),0.02);} 50%{ background-color: rgba(var(--hk-accent-rgb),0.07);} }
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
      "Approved events go public and open registration",
    ],
  },
  {
    icon: Users,
    title: "Registration & Teams",
    desc: "Students register and form teams with invite codes — tracked live.",
    details: [
      "Solo or team participation, your call per event",
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
  useZoomReveal(".oh-loop-zoom");

  return (
    <section id="breakdown" className="relative z-10 py-20">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2
            className="font-syne font-extrabold text-[var(--hk-text)] tracking-tight leading-none"
            style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
          >
            From Draft to <span className="text-[var(--hk-accent-solid)]">Results</span>
          </h2>
          <p className="font-jb text-[0.75rem] text-[rgba(var(--hk-text-rgb),0.83)] dark:text-[rgba(var(--hk-text-rgb),0.48)] mt-4 tracking-[0.05em] max-w-lg mx-auto">
            Every event runs this exact loop, from first draft to
            published results.
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
                stroke="rgba(var(--hk-accent-rgb),0.12)"
                strokeWidth="0.4"
              />
            </svg>

            {/* packets continuously orbiting the loop */}
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="absolute inset-0 oh-orbit" style={{ animationDelay: `${i * -2.25}s` }}>
                <span
                  className="absolute w-2.5 h-2.5 rounded-full bg-[var(--hk-accent-solid)] shadow-[0_0_10px_rgba(var(--hk-accent-rgb),0.8)]"
                  style={{ left: "50%", top: `${50 - LOOP_RADIUS}%`, transform: "translate(-50%,-50%)" }}
                />
              </div>
            ))}

            {/* center hub */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-2 max-w-[38%] text-center">
                <RefreshCw size={20} className="oh-ring text-[rgba(var(--hk-accent-rgb),0.65)] dark:text-[rgba(var(--hk-accent-rgb),0.35)]" style={{ animationDuration: "6s" }} />
                <span className="font-jb text-[0.5rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)] leading-relaxed">
                  Repeats every event
                </span>
              </div>
            </div>

            {/* nodes on the ring */}
            {workflowSteps.map((s, i) => {
              const Icon = s.icon;
              const pos = nodePositions[i];
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center text-center"
                  style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: "translate(-50%,-50%)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--hk-bg)] border-2 border-[rgba(var(--hk-accent-rgb),0.4)] flex items-center justify-center">
                    <Icon size={22} className="text-[var(--hk-accent-solid)]" />
                  </div>
                  <span className="font-syne font-extrabold text-[0.72rem] tracking-tight mt-2 whitespace-nowrap text-[var(--hk-text)]">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical list that loops back at the end */}
        <div className="md:hidden relative pl-8">
          <div className="absolute left-3 top-0 bottom-6 w-px bg-[rgba(var(--hk-accent-rgb),0.1)]" />
          <div className="flex flex-col gap-7">
            {workflowSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="oh-zoom oh-loop-zoom relative" style={{ transitionDelay: `${i * 0.06}s` }}>
                  <div className="flex gap-5">
                    <div className="absolute -left-8 w-8 h-8 rounded-full bg-[var(--hk-bg)] border-2 border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[var(--hk-accent-solid)]" />
                    </div>
                    <div className="relative ml-4 p-5 w-full bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px]">
                      <h3 className="font-syne text-[1.05rem] font-extrabold text-[var(--hk-text)] mb-2">{s.title}</h3>
                      <p className="font-jb text-[0.7rem] text-[rgba(var(--hk-text-rgb),0.83)] dark:text-[rgba(var(--hk-text-rgb),0.48)] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="relative flex items-center gap-3 pl-4">
              <RefreshCw size={14} className="text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)] flex-shrink-0" />
              <span className="font-jb text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] italic">
                …and loops back to Configure for the next event.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
          ? "bg-[rgba(var(--hk-red-rgb),0.03)] border border-[rgba(var(--hk-red-rgb),0.15)]"
          : "bg-[rgba(var(--hk-accent-rgb),0.03)] border border-[rgba(var(--hk-card-border-rgb),0.29)] dark:border-[rgba(var(--hk-card-border-rgb),0.18)]"
      }`}
    >
      <div
        className={`font-jb inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.14em] uppercase mb-5 px-2.5 py-1 rounded-[2px] ${
          isBad ? "bg-[rgba(var(--hk-red-rgb),0.08)] text-[rgb(var(--hk-red-rgb))]" : "bg-[rgba(var(--hk-accent-rgb),0.08)] text-[var(--hk-accent-solid)]"
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
              <Check size={14} className="text-[var(--hk-accent-solid)] mt-0.5 flex-shrink-0" />
            )}
            <span className="font-jb text-[0.72rem] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.6)] leading-relaxed">{it}</span>
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
    <section id="compare" className="relative z-10 py-20 px-5">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <h2
            className="font-syne font-extrabold text-[var(--hk-text)] tracking-tight leading-none"
            style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
          >
            Running It <span className="text-[var(--hk-accent-solid)]">vs. Winging It</span>
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

const benefits = [
  {
    icon: Users,
    title: "Global Reach",
    desc: "Connect with innovators across the globe and attract diverse, world-class talent to your event. A public listing, shareable links, and wishlisting make it easy for the right people to find you.",
    highlight: "Public listing · shareable pages · wishlisting",
    tag: "AUDIENCE",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
    accent: "rgba(var(--hk-blue-rgb),0.7)",
    border: "rgba(var(--hk-blue-rgb),0.18)",
    hoverBorder: "rgba(var(--hk-blue-rgb),0.45)",
    tagBg: "rgba(var(--hk-blue-rgb),0.08)",
    tagColor: "rgb(var(--hk-blue-rgb))",
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
    tagColor: "rgb(var(--hk-purple-rgb))",
  },
  {
    icon: Target,
    title: "Real Impact",
    desc: "Amplify your brand and showcase winning projects to the world.",
    tag: "IMPACT",
    span: "",
    accent: "rgba(var(--hk-amber-rgb),0.7)",
    border: "rgba(var(--hk-amber-rgb),0.18)",
    hoverBorder: "rgba(var(--hk-amber-rgb),0.45)",
    tagBg: "rgba(var(--hk-amber-rgb),0.08)",
    tagColor: "rgb(var(--hk-amber-rgb))",
  },
  {
    icon: Code,
    title: "Full Support",
    desc: "Assign judges, configure weighted scoring, and manage the whole event lifecycle — registration through results — from one dashboard, without duct-taping together forms and spreadsheets.",
    highlight: "Judge assignment · weighted scoring · one dashboard",
    tag: "SUPPORT",
    span: "md:col-span-2",
    accent: "rgba(var(--hk-accent-rgb),0.7)",
    border: "rgba(var(--hk-accent-rgb),0.18)",
    hoverBorder: "rgba(var(--hk-accent-rgb),0.45)",
    tagBg: "rgba(var(--hk-accent-rgb),0.08)",
    tagColor: "var(--hk-accent-solid)",
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
        className="relative overflow-hidden p-7 rounded-[4px] bg-[rgba(var(--hk-card-bg),0.88)] backdrop-blur-sm h-full flex flex-col gap-4 transition-transform duration-150 will-change-transform"
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
          className={`relative font-syne font-extrabold text-[var(--hk-text)] tracking-tight ${
            b.featured ? "text-[1.5rem]" : "text-[1.1rem]"
          }`}
        >
          {b.title}
        </h3>
        <p
          className={`relative font-jb text-[rgba(var(--hk-text-rgb),0.83)] dark:text-[rgba(var(--hk-text-rgb),0.48)] leading-relaxed flex-1 ${
            b.featured ? "text-[0.78rem] max-w-md" : "text-[0.68rem]"
          }`}
        >
          {b.desc}
        </p>

        {b.highlight && (
          <div className="relative font-jb text-[0.6rem] tracking-[0.03em] flex items-center gap-2 pt-3 border-t border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.08)]" style={{ color: b.tagColor }}>
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
    <section id="why-organize" className="relative z-10 py-20 px-4 md:px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-15 md:mb-20">
          <h2
            className="font-syne font-extrabold text-[var(--hk-text)] tracking-tight leading-none
    text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]"
          >
            Why Organize <span className="text-[var(--hk-accent-solid)]">Here?</span>
          </h2>
          <p
            className="font-jb text-[0.75rem] sm:text-[0.8rem] md:text-[0.85rem]
    text-[rgba(var(--hk-text-rgb),0.83)] dark:text-[rgba(var(--hk-text-rgb),0.48)] mt-4 tracking-[0.05em] max-w-md mx-auto"
          >
            Powerful tools to maximise your event's impact
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
export default function OrganizerHome() {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("adminToken");

  return (
    <>
      <Styles />
      <div className="oh-bg font-jb min-h-screen bg-[var(--hk-bg)] text-[var(--hk-text)] overflow-hidden">
        {/* ── Hero ── */}
        <section className="relative z-10 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center py-20 px-5 text-center overflow-hidden">
          <div className="hm-bracket relative z-10 max-w-[1000px] mx-auto">
            <h1 className="hm-a2 font-syne font-extrabold leading-[1.05] tracking-tight text-[var(--hk-text)] mb-4 text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl">
              Organize<span className="hm-gradient-text"> here</span>
            </h1>

            <p className="hm-a4 font-sans text-[clamp(0.9rem,1.2vw,1.05rem)] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.6)] leading-relaxed max-w-[600px] mx-auto mb-10">
              Launch, manage, and scale your events on HackSprint: phases,
              teams, submissions, judging, and results, all in one place.
            </p>

            <div className="hm-a5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate(isAdmin ? "/admin" : "/adminlogin")}
                className="inline-flex items-center gap-2 font-sans text-sm font-semibold px-7 py-3 rounded-xl cursor-pointer transition-all duration-200 bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] hover:opacity-90 shadow-sm"
              >
                {isAdmin ? "Dashboard" : "Get Started"} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => document.getElementById("breakdown")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 font-sans text-sm font-semibold px-7 py-3 rounded-xl cursor-pointer transition-all duration-150 bg-transparent border border-[rgba(var(--hk-card-border-rgb),0.25)] text-[var(--hk-text)] hover:bg-[rgba(var(--hk-accent-rgb),0.08)]"
              >
                See how it works
              </button>
            </div>
          </div>
        </section>

        <WorkflowPipeline />
        <CompareSection />
        <Benefits />
      </div>
    </>
  );
}
