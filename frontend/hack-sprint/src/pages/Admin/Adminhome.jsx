import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  Target,
  Code,
  Sparkles,
  ArrowRight,
  Building,
  Megaphone,
  BarChart3,
  Menu,
  X,
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

    /* navbar scanline */
    .oh-nav::after {
      content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
      background: linear-gradient(90deg, transparent, rgba(95,255,96,.3), transparent);
    }

    /* hero title reveal */
    @keyframes oh-reveal {
      from { opacity:0; transform: translateY(22px); }
      to   { opacity:1; transform: translateY(0); }
    }
    .oh-reveal-1 { animation: oh-reveal .7s ease forwards; }
    .oh-reveal-2 { animation: oh-reveal .7s .15s ease forwards; opacity:0; }
    .oh-reveal-3 { animation: oh-reveal .7s .3s ease forwards; opacity:0; }
    .oh-reveal-4 { animation: oh-reveal .7s .45s ease forwards; opacity:0; }

    /* pipeline dot slide */
    @keyframes oh-slide { 0%{left:-5%} 100%{left:105%} }
    .oh-dot { animation: oh-slide 2.8s linear infinite; }

    /* step card hover lift */
    .oh-step:hover { transform: translateY(-4px); }

    /* benefit card hover */
    .oh-benefit:hover { transform: translateY(-3px); }

    /* stat counter pulse */
    @keyframes oh-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
    .oh-pulse { animation: oh-pulse 2.5s ease infinite; }

    /* spinning slow ring in hero */
    @keyframes oh-spin-slow { to { transform: rotate(360deg); } }
    .oh-ring { animation: oh-spin-slow 18s linear infinite; }

    /* cta glow */
    .oh-cta:hover { box-shadow: 0 0 28px rgba(95,255,96,.35); }

    /* mobile menu slide down */
    @keyframes oh-drop { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    .oh-mobile-menu { animation: oh-drop .18s ease forwards; }
  `}</style>
);

const Navbar = ({ navigate }) => {
  const [open, setOpen] = useState(false);
  const isAdmin = !!localStorage.getItem("adminToken");

  const NavBtn = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="font-jb inline-flex items-center gap-[0.4rem] text-[0.65rem] tracking-[0.1em] uppercase px-[0.9rem] py-[0.45rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.18)] hover:border-[rgba(95,255,96,0.55)] hover:shadow-[0_0_14px_rgba(95,255,96,0.15)]"
    >
      {children}
    </button>
  );

  return (
    <header className="oh-nav relative z-50 p-1 sticky top-0 font-jb bg-[rgba(8,10,8,0.93)] border-b border-[rgba(95,255,96,0.1)] backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto px-5 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-[0.6rem] bg-transparent border-none cursor-pointer"
        >
          <img
            src="hackSprint.webp"
            alt="HackSprint"
            className="w-7 h-7 object-contain"
          />
          <span className="font-syne font-extrabold text-[1.1rem] tracking-tight text-white">
            Hack<span className="text-[#5fff60]">Sprint</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-2">
          <NavBtn onClick={() => navigate(isAdmin ? "/admin" : "/adminlogin")}>
            {isAdmin ? "Dashboard" : "Organize Now"}
            <ArrowRight size={12} />
          </NavBtn>
        </nav>

        <button
          className="md:hidden flex items-center justify-center p-1.5 rounded-[3px] border border-[rgba(95,255,96,0.12)] text-[rgba(95,255,96,0.55)] hover:border-[rgba(95,255,96,0.35)] hover:text-[#5fff60] transition-all cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="oh-mobile-menu md:hidden flex flex-col gap-2 px-5 py-4 border-t border-[rgba(95,255,96,0.08)] bg-[rgba(8,10,8,0.97)]">
          <button
            onClick={() => {
              navigate(isAdmin ? "/admin" : "/adminlogin");
              setOpen(false);
            }}
            className="font-jb w-full inline-flex items-center justify-between text-[0.65rem] tracking-[0.1em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.18)] transition-all"
          >
            <span>{isAdmin ? "Dashboard" : "Organize Now"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </header>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: Calendar,
      n: "01",
      title: "Plan",
      desc: "Define your theme, challenges, and goals with our guided setup wizard.",
    },
    {
      icon: Megaphone,
      n: "02",
      title: "Promote",
      desc: "Broadcast to students and devs worldwide using built-in tools.",
    },
    {
      icon: Trophy,
      n: "03",
      title: "Manage",
      desc: "Review submissions, evaluate projects, and manage teams live.",
    },
    {
      icon: BarChart3,
      n: "04",
      title: "Showcase",
      desc: "Highlight winners, share outcomes, amplify your brand presence.",
    },
  ];

  return (
    <section className="relative z-10 py-28">
      <div className="max-w-[1200px] mx-auto">
        {/* heading */}
        <div className="text-center mb-20">
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
          >
            How It <span className="text-[#5fff60]">Works</span>
          </h2>
          <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] mt-4 tracking-[0.05em] max-w-md mx-auto">
            Four focused steps to launch your hackathon successfully
          </p>
        </div>

        {/* Desktop pipeline */}
        <div className="hidden lg:block relative">
          {/* connector line */}
          <div className="absolute top-[68px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-px bg-gradient-to-r from-[rgba(95,255,96,0.08)] via-[rgba(95,255,96,0.5)] to-[rgba(95,255,96,0.08)]" />
          {/* sliding dot */}
          <div className="absolute top-[61px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-[16px] overflow-hidden pointer-events-none">
            <div className="oh-dot absolute top-[5px] h-[3px] w-12 bg-gradient-to-r from-transparent via-[#5fff60] to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="oh-step flex flex-col items-center text-center group transition-transform duration-300"
                >
                  {/* node */}
                  <div className="relative mb-8 z-10">
                    <div className="w-[80px] h-[80px] rounded-full bg-[#0a0a0a] border-2 border-[rgba(95,255,96,0.22)] group-hover:border-[rgba(95,255,96,0.7)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(95,255,96,0.22)]">
                      <Icon size={28} className="text-[#5fff60]" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#5fff60] text-[#050905] text-[0.6rem] font-bold font-jb flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>

                  {/* card */}
                  <div className="oh-card relative w-full p-6 bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] backdrop-blur-sm group-hover:border-[rgba(95,255,96,0.3)] transition-all duration-300">
                    <div className="font-jb text-[0.58rem] tracking-[0.16em] text-[rgba(95,255,96,0.38)] mb-2">
                      {s.n}
                    </div>
                    <h3 className="font-syne text-[1.2rem] font-extrabold text-white mb-3 group-hover:text-[#5fff60] transition-colors">
                      {s.title}
                    </h3>
                    <p className="font-jb text-[0.7rem] text-[rgba(180,220,180,0.48)] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical */}
        <div className="lg:hidden relative px-8 ml-4 md:ml-0 md:px-0 md:pl-10">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(95,255,96,0.08)] via-[rgba(95,255,96,0.4)] to-[rgba(95,255,96,0.08)]" />
          <div className="flex flex-col gap-7">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative flex gap-5 group">
                  <div className="absolute -left-[30px] w-12 h-12 rounded-full bg-[#0a0a0a] border-2 border-[rgba(95,255,96,0.22)] group-hover:border-[rgba(95,255,96,0.6)] flex items-center justify-center flex-shrink-0 transition-all duration-300">
                    <Icon size={16} className="text-[#5fff60]" />
                  </div>
                  <div className="oh-card relative ml-4 p-6 w-full bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] group-hover:border-[rgba(95,255,96,0.28)] transition-all duration-300">
                    <div className="font-jb text-[0.58rem] tracking-[0.16em] text-[rgba(95,255,96,0.38)] mb-1">
                      {s.n}
                    </div>
                    <h3 className="font-syne text-[1.05rem] font-extrabold text-white mb-2">
                      {s.title}
                    </h3>
                    <p className="font-jb text-[0.7rem] text-[rgba(180,220,180,0.48)] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const Benefits = ({ navigate }) => {
  const benefits = [
    {
      icon: Users,
      title: "Global Reach",
      desc: "Connect with innovators across the globe and attract diverse, world-class talent to your event.",
      tag: "AUDIENCE",
      accent: "rgba(96,200,255,0.7)",
      border: "rgba(96,200,255,0.18)",
      hoverBorder: "rgba(96,200,255,0.45)",
      tagBg: "rgba(96,200,255,0.08)",
      tagColor: "#60c8ff",
    },
    {
      icon: Building,
      title: "Seamless Ops",
      desc: "Track registrations, teams, and project submissions with ease — all in one place.",
      tag: "OPERATIONS",
      accent: "rgba(180,120,255,0.7)",
      border: "rgba(180,120,255,0.18)",
      hoverBorder: "rgba(180,120,255,0.45)",
      tagBg: "rgba(180,120,255,0.08)",
      tagColor: "#b478ff",
    },
    {
      icon: Code,
      title: "Full Support",
      desc: "Get expert help setting up challenges, judging systems, and third-party integrations.",
      tag: "SUPPORT",
      accent: "rgba(95,255,96,0.7)",
      border: "rgba(95,255,96,0.18)",
      hoverBorder: "rgba(95,255,96,0.45)",
      tagBg: "rgba(95,255,96,0.08)",
      tagColor: "#5fff60",
    },
    {
      icon: Target,
      title: "Real Impact",
      desc: "Amplify your brand, foster lasting innovation, and showcase winning projects to the world.",
      tag: "IMPACT",
      accent: "rgba(255,184,77,0.7)",
      border: "rgba(255,184,77,0.18)",
      hoverBorder: "rgba(255,184,77,0.45)",
      tagBg: "rgba(255,184,77,0.08)",
      tagColor: "#ffb84d",
    },
  ];

  return (
    <section className="relative z-10 py-28 px-4 md:px-5">
      <div className="max-w-[1200px] mx-auto">
        {/* heading */}
        <div className="text-center mb-15 md:mb-20">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="oh-benefit relative group cursor-default transition-transform duration-300"
              >
                <div
                  className="relative p-7 rounded-[4px] bg-[rgba(10,12,10,0.88)] backdrop-blur-sm h-full flex flex-col gap-4 transition-all duration-300"
                  style={{ border: `1px solid ${b.border}` }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = b.hoverBorder)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = b.border)
                  }
                >
                  {/* corner brackets */}
                  <span
                    className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px]"
                    style={{
                      borderTop: `2px solid ${b.accent}`,
                      borderLeft: `2px solid ${b.accent}`,
                    }}
                  />
                  <span
                    className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px]"
                    style={{
                      borderBottom: `2px solid ${b.accent}`,
                      borderRight: `2px solid ${b.accent}`,
                    }}
                  />

                  {/* tag */}
                  <span
                    className="font-jb self-start text-[0.55rem] tracking-[0.16em] uppercase px-[0.55rem] py-[0.2rem] rounded-[2px]"
                    style={{ background: b.tagBg, color: b.tagColor }}
                  >
                    {b.tag}
                  </span>

                  {/* icon */}
                  <div
                    className="w-12 h-12 rounded-[3px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: b.tagBg,
                      border: `1px solid ${b.border}`,
                    }}
                  >
                    <Icon size={22} style={{ color: b.tagColor }} />
                  </div>

                  <h3 className="font-syne text-[1.1rem] font-extrabold text-white tracking-tight">
                    {b.title}
                  </h3>
                  <p className="font-jb text-[0.68rem] text-[rgba(180,220,180,0.48)] leading-relaxed flex-1">
                    {b.desc}
                  </p>

                  {/* progress dots */}
                  <div className="flex items-center gap-[4px] mt-1">
                    {benefits.map((_, j) => (
                      <div
                        key={j}
                        className="h-[3px] rounded-full transition-all duration-300"
                        style={{
                          flex: j === i ? 1 : undefined,
                          width: j === i ? undefined : 14,
                          background:
                            j === i ? b.tagColor : "rgba(95,255,96,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function OrganizerHome() {
  const navigate = useNavigate();

  return (
    <>
      <Styles />
      <div className="oh-bg font-jb min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-hidden">
        {/* Navbar */}
        <Navbar navigate={navigate} />

        {/* ── Hero ── */}
        <section className="relative z-10 pt-35 pb-20 text-center overflow-hidden">
          {/* large ambient glow blobs */}
          <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(95,255,96,0.09)_0%,transparent_70%)]" />
          <div className="pointer-events-none absolute top-[60px] left-[-10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(95,255,96,0.04)_0%,transparent_70%)]" />
          <div className="pointer-events-none absolute top-[60px] right-[-10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(95,255,96,0.04)_0%,transparent_70%)]" />

          {/* slow spinning rings — behind text */}
          <div className="oh-ring pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[rgba(95,255,96,0.04)]" />
          <div
            className="oh-ring pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[rgba(95,255,96,0.035)]"
            style={{ animationDuration: "25s", animationDirection: "reverse" }}
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <h1
              className="oh-reveal-2 font-syne font-extrabold leading-[0.95] tracking-[-0.04em] text-white mb-6
  text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[6rem]"
            >
              Organize
              <br />
              Hackathons
              <br />
              <span className="text-[#5fff60]">with Ease</span>
            </h1>

            <p
              className="oh-reveal-3 font-jb text-[0.7rem] sm:text-[0.75rem] md:text-[0.8rem] lg:text-[0.85rem]
  text-[rgba(180,220,180,0.5)] leading-relaxed mb-10 max-w-[680px] mx-auto tracking-[0.02em]"
            >
              Launch, manage, and scale your hackathons on our platform. Connect
              with innovators, showcase challenges, and drive impactful
              solutions effortlessly.
            </p>

            {/* CTA row */}
            <div className="oh-reveal-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() =>
                  navigate(
                    localStorage.getItem("adminToken")
                      ? "/admin"
                      : "/adminlogin"
                  )
                }
                className="oh-cta font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80]"
              >
                {localStorage.getItem("adminToken")
                  ? "Dashboard"
                  : "Get Started"}
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:border-[rgba(95,255,96,0.45)] hover:text-[#5fff60]"
              >
                How it works
              </button>
            </div>

            {/* bottom scroll hint */}
            <div className="oh-pulse mt-14 flex flex-col items-center gap-[0.4rem]">
              <span className="font-jb text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.25)]">
                Scroll to explore
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-[rgba(95,255,96,0.3)] to-transparent" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Benefits */}
        <Benefits navigate={navigate} />
      </div>
    </>
  );
}
