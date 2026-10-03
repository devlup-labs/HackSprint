import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  Github,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Search,
  Gavel,
  UploadCloud,
  Plus,
  Minus,
  GitBranch,
  RefreshCw,
  X,
  Check,
} from "lucide-react";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
    .font-jb   { font-family: 'JetBrains Mono', monospace; }
    .font-syne { font-family: 'Syne', sans-serif; }

    /* fixed grid background */
    .sh-bg::before {
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background-image:
        linear-gradient(rgba(95,255,96,.028) 1px, transparent 1px),
        linear-gradient(90deg, rgba(95,255,96,.028) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .sh-bg::after {
      content:''; position:fixed; z-index:0; pointer-events:none;
      width:700px; height:700px;
      background: radial-gradient(circle, rgba(95,255,96,.06) 0%, transparent 65%);
      top:-80px; left:50%; transform:translateX(-50%);
    }

    /* corner bracket card */
    .sh-card::before,.sh-card::after {
      content:''; position:absolute;
      width:9px; height:9px; border-style:solid;
      border-color:rgba(95,255,96,.4);
      transition: border-color .2s;
    }
    .sh-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
    .sh-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
    .sh-card:hover::before,.sh-card:hover::after { border-color:rgba(95,255,96,.72); }

    /* hero word-by-word reveal */
    @keyframes sh-word {
      from { opacity:0; transform: translateY(28px) rotateX(-40deg); }
      to   { opacity:1; transform: translateY(0) rotateX(0); }
    }
    .sh-word { display:inline-block; opacity:0; animation: sh-word .8s cubic-bezier(.16,1,.3,1) forwards; transform-origin: bottom; }

    @keyframes sh-up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    .sh-a3{animation:sh-up .7s ease .55s both}
    .sh-a4{animation:sh-up .7s ease .7s both}

    /* scroll hint pulse */
    @keyframes sh-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    .sh-pulse { animation: sh-pulse 2.4s ease infinite; }

    /* scroll-triggered zoom reveal */
    .sh-zoom {
      opacity: 0;
      transform: scale(0.82);
      transition: opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1);
    }
    .sh-zoom-visible { opacity: 1; transform: scale(1); }

    /* slide-in from left/right */
    .sh-slide-l { opacity:0; transform: translateX(-40px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
    .sh-slide-r { opacity:0; transform: translateX(40px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
    .sh-slide-visible { opacity:1; transform: translateX(0); }

    /* flow-diagram data packets travelling along the connector */
    @keyframes sh-packet { 0%{left:-4%; opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{left:104%; opacity:0} }
    .sh-packet { animation: sh-packet 3.2s linear infinite; }

    /* mock table row "live" highlight sweep */
    @keyframes sh-row-glow { 0%,100%{ background-color: rgba(95,255,96,0.02);} 50%{ background-color: rgba(95,255,96,0.07);} }
    .sh-row-live { animation: sh-row-glow 2.4s ease-in-out infinite; }

    /* live indicator blink */
    @keyframes sh-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
    .sh-blink-dot { animation: sh-blink 1.4s ease-in-out infinite; }

    /* continuously orbiting packets around the journey loop */
    @keyframes sh-orbit { to { transform: rotate(360deg); } }
    .sh-orbit { animation: sh-orbit 9s linear infinite; }

    /* slow spinning ring */
    @keyframes sh-spin-slow { to { transform: rotate(360deg); } }
    .sh-ring { animation: sh-spin-slow 18s linear infinite; }

    /* detail panel pop-in on stage change */
    @keyframes sh-pop { from { opacity:0; transform: scale(0.92) translateY(6px); } to { opacity:1; transform: scale(1) translateY(0); } }
    .sh-pop { animation: sh-pop .4s cubic-bezier(.16,1,.3,1); }

    /* cta glow + animated gradient border */
    .sh-cta:hover { box-shadow: 0 0 28px rgba(95,255,96,.35); }
    @keyframes sh-border-spin { to { --sh-angle: 360deg; } }
    @property --sh-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
    .sh-gradient-border {
      position: relative;
      border: 1px solid transparent;
      background:
        linear-gradient(#0a0a0a,#0a0a0a) padding-box,
        conic-gradient(from var(--sh-angle), rgba(95,255,96,0.05), rgba(95,255,96,0.9), rgba(95,255,96,0.05) 40%) border-box;
      animation: sh-border-spin 4s linear infinite;
    }

    /* section nav dot */
    .sh-navdot { transition: all .3s ease; }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────
   Shared hooks
───────────────────────────────────────────────────────────────────────── */
const useZoomReveal = (selector, visibleClass = "sh-zoom-visible") => {
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

// Lightweight tilt-on-hover — perspective rotate following the cursor.
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
  { id: "flow-preview", label: "Journey" },
  { id: "breakdown", label: "Breakdown" },
  { id: "compare", label: "Compare" },
  { id: "skills", label: "Skills" },
];

const SectionNav = () => {
  const [active, setActive] = useState(sectionList[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
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
          className="sh-navdot group flex items-center gap-2.5 cursor-pointer"
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
   Flow-diagram "product mockup" of the student journey
───────────────────────────────────────────────────────────────────────── */
const flowNodes = [
  { icon: Search, label: "Discover", sub: "Browse events" },
  { icon: Calendar, label: "Register", sub: "Sign up in minutes" },
  { icon: Users, label: "Team Up", sub: "Solo or squad up" },
  { icon: UploadCloud, label: "Submit", sub: "Ship your project" },
  { icon: Gavel, label: "Get Scored", sub: "Judges & community vote" },
  { icon: Trophy, label: "Results", sub: "See where you rank" },
];

const mockRows = [
  { name: "HackSprint AI Challenge", tag: "Live", meta: "₹1,00,000 prize" },
  { name: "CampusCode Sprint", tag: "Upcoming", meta: "Registration open" },
  { name: "BuildathonX", tag: "Live", meta: "3 days left" },
];

const FlowDiagramMockup = () => {
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (wrapRef.current) wrapRef.current.classList.add("sh-zoom-visible");
  }, []);

  return (
    <section id="flow-preview" className="relative z-10 py-20 px-4 sm:px-5">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <div className="font-jb inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-1 rounded-[2px] mb-4">
            <GitBranch size={11} /> Live Preview
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
          >
            See Your Hackathon <span className="text-[#5fff60]">Journey</span>
          </h2>
          <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] mt-4 max-w-lg mx-auto leading-relaxed">
            Every event you join runs through this exact flow — this is
            what it looks like end to end.
          </p>
        </div>

        <div
          ref={wrapRef}
          className="sh-zoom relative rounded-[6px] border border-[rgba(95,255,96,0.15)] bg-[rgba(8,10,8,0.95)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
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
                student / hackathon-journey
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-jb inline-flex items-center gap-1.5 text-[0.55rem] tracking-[0.1em] uppercase text-[#5fff60]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] sh-blink-dot" /> Live
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
                    className="sh-packet absolute top-[1.5px] h-[3px] w-10 rounded-full bg-gradient-to-r from-transparent via-[#5fff60] to-transparent"
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

          {/* mock live listing table */}
          <div className="border-t border-[rgba(95,255,96,0.08)] bg-[rgba(95,255,96,0.015)]">
            <div className="grid grid-cols-3 gap-4 px-6 py-2.5 border-b border-[rgba(95,255,96,0.06)]">
              {["Event", "Status", "Details"].map((h) => (
                <span key={h} className="font-jb text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.3)]">
                  {h}
                </span>
              ))}
            </div>
            {mockRows.map((r, i) => (
              <div
                key={i}
                className={`sh-row-live grid grid-cols-3 gap-4 px-6 py-2.5 ${
                  i !== mockRows.length - 1 ? "border-b border-[rgba(95,255,96,0.04)]" : ""
                }`}
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <span className="font-jb text-[0.65rem] text-white truncate">{r.name}</span>
                <span
                  className={`font-jb text-[0.65rem] ${
                    r.tag === "Live" ? "text-[rgba(95,255,96,0.65)]" : "text-[rgba(96,200,255,0.65)]"
                  }`}
                >
                  {r.tag}
                </span>
                <span className="font-jb text-[0.65rem] text-[rgba(255,184,77,0.75)]">{r.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const withoutList = [
  "Hunting across socials for events worth joining",
  "No easy way to find teammates who match your skills",
  "No structured deadline pushing you to actually ship",
  "Work disappears after the event — nothing to show for it",
];
const withList = [
  "One place listing every live and upcoming event",
  "Invite-code teams — build a squad in seconds",
  "Real submission deadlines with a live countdown",
  "A public result and judge feedback to add to your portfolio",
];

const CompareCard = ({ title, tone, items }) => {
  const isBad = tone === "bad";
  return (
    <div
      className={`sh-card relative flex-1 rounded-[4px] p-7 backdrop-blur-sm ${
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
  useZoomReveal(".sh-slide-l", "sh-slide-visible");
  useZoomReveal(".sh-slide-r", "sh-slide-visible");

  return (
    <section id="compare" className="relative z-10 py-28 px-4 sm:px-5">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
          >
            Going Solo <span className="text-[#5fff60]">vs. With HackSprint</span>
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          <div className="sh-slide-l flex-1">
            <CompareCard title="Without HackSprint" tone="bad" items={withoutList} />
          </div>
          <div className="sh-slide-r flex-1">
            <CompareCard title="With HackSprint" tone="good" items={withList} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Skills — asymmetric bento grid with cursor-tilt cards
───────────────────────────────────────────────────────────────────────── */
const skills = [
  {
    icon: Target,
    title: "Problem Solving",
    desc: "Analyse complex challenges under real deadlines and develop innovative, effective solutions — the same muscle every technical interview tests.",
    highlight: "Real deadlines · real constraints",
    tag: "FOUNDATION",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
    accent: "rgba(96,200,255,0.7)",
    border: "rgba(96,200,255,0.18)",
    hoverBorder: "rgba(96,200,255,0.45)",
    tagBg: "rgba(96,200,255,0.08)",
    tagColor: "#60c8ff",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Master working with diverse teams, communication, and project coordination.",
    tag: "TEAMWORK",
    span: "",
    accent: "rgba(180,120,255,0.7)",
    border: "rgba(180,120,255,0.18)",
    hoverBorder: "rgba(180,120,255,0.45)",
    tagBg: "rgba(180,120,255,0.08)",
    tagColor: "#b478ff",
  },
  {
    icon: Clock,
    title: "Time Management",
    desc: "Plan, prioritise, and ship within a tight window.",
    tag: "EXECUTION",
    span: "",
    accent: "rgba(255,184,77,0.7)",
    border: "rgba(255,184,77,0.18)",
    hoverBorder: "rgba(255,184,77,0.45)",
    tagBg: "rgba(255,184,77,0.08)",
    tagColor: "#ffb84d",
  },
  {
    icon: Github,
    title: "Coding & Dev",
    desc: "Enhance programming skills with real-world projects using cutting-edge technologies, then walk away with a repo you actually shipped and judges actually reviewed.",
    highlight: "A real repo · real judge feedback",
    tag: "TECHNICAL",
    span: "md:col-span-2",
    accent: "rgba(95,255,96,0.7)",
    border: "rgba(95,255,96,0.18)",
    hoverBorder: "rgba(95,255,96,0.45)",
    tagBg: "rgba(95,255,96,0.08)",
    tagColor: "#5fff60",
  },
];

const SkillCard = ({ sk, i }) => {
  const Icon = sk.icon;
  const { ref, onMouseMove, onMouseLeave } = useTilt();

  return (
    <div
      className={`sh-zoom sh-skill-zoom relative group cursor-default ${sk.span}`}
      style={{ transitionDelay: `${i * 0.08}s` }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative overflow-hidden p-7 rounded-[4px] bg-[rgba(10,12,10,0.88)] backdrop-blur-sm h-full flex flex-col gap-4 transition-transform duration-150 will-change-transform"
        style={{ border: `1px solid ${sk.border}` }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = sk.hoverBorder)}
        onMouseLeaveCapture={(e) => (e.currentTarget.style.borderColor = sk.border)}
      >
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${sk.accent.replace("0.7", "0.12")} 0%, transparent 70%)` }}
        />

        <span
          className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px]"
          style={{ borderTop: `2px solid ${sk.accent}`, borderLeft: `2px solid ${sk.accent}` }}
        />
        <span
          className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px]"
          style={{ borderBottom: `2px solid ${sk.accent}`, borderRight: `2px solid ${sk.accent}` }}
        />

        <span
          className="font-jb self-start text-[0.55rem] tracking-[0.16em] uppercase px-[0.55rem] py-[0.2rem] rounded-[2px] relative"
          style={{ background: sk.tagBg, color: sk.tagColor }}
        >
          {sk.tag}
        </span>

        <div
          className={`relative rounded-[3px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            sk.featured ? "w-16 h-16" : "w-12 h-12"
          }`}
          style={{ background: sk.tagBg, border: `1px solid ${sk.border}` }}
        >
          <Icon size={sk.featured ? 30 : 22} style={{ color: sk.tagColor }} />
        </div>

        <h3
          className={`relative font-syne font-extrabold text-white tracking-tight ${
            sk.featured ? "text-[1.5rem]" : "text-[1.1rem]"
          }`}
        >
          {sk.title}
        </h3>
        <p
          className={`relative font-jb text-[rgba(180,220,180,0.48)] leading-relaxed flex-1 ${
            sk.featured ? "text-[0.78rem] max-w-md" : "text-[0.68rem]"
          }`}
        >
          {sk.desc}
        </p>

        {sk.highlight && (
          <div
            className="relative font-jb text-[0.6rem] tracking-[0.03em] flex items-center gap-2 pt-3 border-t border-[rgba(95,255,96,0.08)]"
            style={{ color: sk.tagColor }}
          >
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: sk.tagColor }} />
            {sk.highlight}
          </div>
        )}
      </div>
    </div>
  );
};

const Skills = () => {
  useZoomReveal(".sh-skill-zoom");

  return (
    <section id="skills" className="relative z-10 py-28 px-4 md:px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-15 md:mb-20">
          <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.75rem] py-[0.22rem] rounded-[2px] mb-4">
            Built For Growth
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
          >
            Skills You'll <span className="text-[#5fff60]">Gain.</span>
          </h2>
          <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] mt-4 tracking-[0.04em] max-w-md mx-auto">
            Develop essential skills that will accelerate your career in tech
          </p>
        </div>

        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5 md:auto-rows-[1fr]">
          {skills.map((sk, i) => (
            <SkillCard key={i} sk={sk} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────────────────── */
const heroWords = ["Events", "for", "Students"];

export default function StudentHome() {
  const heroGlowRef = useRef(null);
  const heroLayer1Ref = useRef(null);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const scrollState = useRef({ opacity: 1 });

  const applyHeroTransform = () => {
    if (!heroGlowRef.current) return;
    const { x, y } = mouseOffset.current;
    heroGlowRef.current.style.transform = `translate(${x}px, ${y}px)`;
    heroGlowRef.current.style.opacity = scrollState.current.opacity;
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      scrollState.current = { opacity: Math.max(1 - y / 500, 0) };
      applyHeroTransform();
      if (heroLayer1Ref.current) heroLayer1Ref.current.style.transform = `translateY(${y * 0.15}px)`;
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
      <div className="sh-bg font-jb min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-hidden">
        {/* ── Hero ── */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-10 py-20 overflow-hidden">
          <div ref={heroLayer1Ref} className="pointer-events-none">
            <div className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(95,255,96,0.07)_0%,transparent_70%)]" />
          </div>
          <div ref={heroGlowRef} className="pointer-events-none absolute inset-0">
            <div className="sh-ring pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[rgba(95,255,96,0.04)]" />
            <div
              className="sh-ring pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-[rgba(95,255,96,0.035)]"
              style={{ animationDuration: "25s", animationDirection: "reverse" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
            <div className="font-jb inline-flex items-center gap-[0.45rem] text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.25)] bg-[rgba(95,255,96,0.06)] px-[0.9rem] py-[0.35rem] rounded-[2px] mb-6">
              <Sparkles size={10} /> Join the Innovation
            </div>

            <h1
              className="font-syne font-extrabold leading-[1] tracking-[-0.03em] text-white mb-5
      text-[2.4rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] xl:text-[5rem]"
              style={{ perspective: "600px" }}
            >
              {heroWords.map((w, i) => (
                <span
                  key={i}
                  className={`sh-word ${w === "Students" ? "text-[#5fff60]" : ""}`}
                  style={{ animationDelay: `${0.15 + i * 0.12}s` }}
                >
                  {w}
                  {i < heroWords.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p
              className="sh-a3 font-jb text-[0.8rem] sm:text-[0.85rem] md:text-[0.9rem]
      text-[rgba(180,220,180,0.48)] leading-relaxed max-w-[520px] mx-auto mb-9 tracking-[0.02em] px-1"
            >
              Join events, learn new skills, collaborate with peers, and
              bring your ideas to life. Build real projects, gain mentorship,
              and grow your portfolio.
            </p>

            <div className="sh-a4 flex flex-wrap items-center justify-center gap-3">
              <div className="sh-gradient-border rounded-[4px]">
                <Link
                  to="/hackathons"
                  className="sh-cta font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-6 sm:px-7 py-[0.75rem] rounded-[3px] cursor-pointer transition-all duration-200 bg-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80]"
                >
                  Browse Hackathons <ArrowRight size={13} />
                </Link>
              </div>

              <button
                onClick={() => document.getElementById("flow-preview")?.scrollIntoView({ behavior: "smooth" })}
                className="font-jb inline-flex items-center gap-[0.4rem] text-[0.7rem] tracking-[0.12em] uppercase px-6 sm:px-7 py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:border-[rgba(95,255,96,0.42)] hover:text-[#5fff60]"
              >
                How it works
              </button>
            </div>

            <div className="sh-pulse mt-12 flex flex-col items-center gap-[0.4rem]">
              <span className="font-jb text-[0.5rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.7)]">
                Scroll to explore
              </span>
              <div className="w-px h-7 bg-gradient-to-b from-[rgba(95,255,96,0.7)] to-transparent" />
            </div>
          </div>
        </section>

        <FlowDiagramMockup />
        <CompareSection />
        <Skills />
      </div>
    </>
  );
}
