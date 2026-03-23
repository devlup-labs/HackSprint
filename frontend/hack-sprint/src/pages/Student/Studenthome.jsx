import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  Github,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
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

    /* navbar bottom scanline */
    .sh-nav::after {
      content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
      background: linear-gradient(90deg,transparent,rgba(95,255,96,.28),transparent);
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

    /* hero stagger */
    @keyframes sh-up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    .sh-a1{animation:sh-up .7s ease .1s both}
    .sh-a2{animation:sh-up .7s ease .25s both}
    .sh-a3{animation:sh-up .7s ease .4s both}
    .sh-a4{animation:sh-up .7s ease .55s both}

    /* pipeline dot slide */
    @keyframes sh-slide { 0%{left:-5%} 100%{left:105%} }
    .sh-dot { animation: sh-slide 2.8s linear infinite; }

    /* scroll reveal */
    .sh-fade { opacity:0; transform:translateY(24px); transition: opacity .8s ease, transform .8s ease; }
    .sh-fade.sh-vis { opacity:1; transform:translateY(0); }

    /* scroll hint pulse */
    @keyframes sh-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    .sh-pulse { animation: sh-pulse 2.4s ease infinite; }

    /* step card hover lift */
    .sh-step:hover { transform: translateY(-4px); }
  `}</style>
);

const useReveal = () => {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("sh-vis");
        }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".sh-fade").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

const HowItWorks = () => {
  const steps = [
    {
      icon: Calendar,
      n: "01",
      title: "Find Hackathons",
      desc: "Explore upcoming hackathons that match your interests and skill level.",
    },
    {
      icon: Users,
      n: "02",
      title: "Join or Form Team",
      desc: "Work alone or team up with friends or other participants to tackle challenges.",
    },
    {
      icon: Github,
      n: "03",
      title: "Build & Submit",
      desc: "Develop your project during the event and submit it before the deadline.",
    },
    {
      icon: Trophy,
      n: "04",
      title: "Learn & Improve",
      desc: "Gain practical experience, learn new technologies, and grow your skills.",
    },
  ];

  return (
    <section className="sh-fade relative z-10 py-24 px-4 sm:px-6 md:px-10">
      <div className="max-w-5xl lg:max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-15 md:mb-20 flex flex-col items-center">
          <div className="font-jb inline-block text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.85rem] py-[0.25rem] rounded-[2px] mb-4">
            Process
          </div>

          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none
            text-[2.2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] xl:text-[4rem]"
          >
            How It <span className="text-[#5fff60]">Works.</span>
          </h2>

          <p
            className="font-jb text-[0.8rem] sm:text-[0.85rem] md:text-[0.9rem]
            text-[rgba(180,220,180,0.48)] mt-4 tracking-[0.04em] max-w-md mx-auto px-2"
          >
            Four steps to kick off your hackathon journey
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block relative">
          {/* line */}
          <div className="absolute top-[68px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-px bg-gradient-to-r from-[rgba(95,255,96,0.08)] via-[rgba(95,255,96,0.5)] to-[rgba(95,255,96,0.08)]" />

          {/* animated dot */}
          <div className="absolute top-[61px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-[16px] overflow-hidden pointer-events-none">
            <div className="sh-dot absolute top-[5px] h-[3px] w-12 bg-gradient-to-r from-transparent via-[#5fff60] to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="sh-step flex flex-col items-center text-center group"
                >
                  {/* icon */}
                  <div className="relative mb-8 z-10">
                    <div className="w-[80px] h-[80px] rounded-full bg-[#0a0a0a] border-2 border-[rgba(95,255,96,0.22)] group-hover:border-[rgba(95,255,96,0.7)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(95,255,96,0.22)]">
                      <Icon size={28} className="text-[#5fff60]" />
                    </div>

                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#5fff60] text-[#050905] text-[0.6rem] font-bold font-jb flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>

                  {/* card */}
                  <div className="sh-card w-full p-6 bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] backdrop-blur-sm group-hover:border-[rgba(95,255,96,0.3)] transition-all duration-300">
                    <div className="font-jb text-[0.6rem] tracking-[0.16em] text-[rgba(95,255,96,0.38)] mb-2">
                      {s.n}
                    </div>

                    <h3 className="font-syne text-[1.1rem] font-extrabold text-white mb-3 group-hover:text-[#5fff60] transition-colors">
                      {s.title}
                    </h3>

                    <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden relative mt-6">
          {/* vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(95,255,96,0.08)] via-[rgba(95,255,96,0.4)] to-[rgba(95,255,96,0.08)]" />

          <div className="flex flex-col gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative flex gap-4">
                  {/* icon */}
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-[#0a0a0a] border-2 border-[rgba(95,255,96,0.22)] flex items-center justify-center">
                    <Icon size={16} className="text-[#5fff60]" />
                  </div>

                  {/* card */}
                  <div className="ml-14 p-5 w-full bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px]">
                    <div className="font-jb text-[0.6rem] tracking-[0.16em] text-[rgba(95,255,96,0.38)] mb-1">
                      {s.n}
                    </div>

                    <h3 className="font-syne text-[1rem] font-extrabold text-white mb-2">
                      {s.title}
                    </h3>

                    <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.48)] leading-relaxed">
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

const Skills = () => {
  const skills = [
    {
      icon: Target,
      title: "Problem Solving",
      desc: "Analyse complex challenges and develop innovative, effective solutions.",
      tag: "FOUNDATION",
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
      accent: "rgba(180,120,255,0.7)",
      border: "rgba(180,120,255,0.18)",
      hoverBorder: "rgba(180,120,255,0.45)",
      tagBg: "rgba(180,120,255,0.08)",
      tagColor: "#b478ff",
    },
    {
      icon: Github,
      title: "Coding & Dev",
      desc: "Enhance programming skills with real-world projects using cutting-edge technologies.",
      tag: "TECHNICAL",
      accent: "rgba(95,255,96,0.7)",
      border: "rgba(95,255,96,0.18)",
      hoverBorder: "rgba(95,255,96,0.45)",
      tagBg: "rgba(95,255,96,0.08)",
      tagColor: "#5fff60",
    },
    {
      icon: Clock,
      title: "Project Management",
      desc: "Plan, organise, and execute complex projects within tight deadlines.",
      tag: "EXECUTION",
      accent: "rgba(255,184,77,0.7)",
      border: "rgba(255,184,77,0.18)",
      hoverBorder: "rgba(255,184,77,0.45)",
      tagBg: "rgba(255,184,77,0.08)",
      tagColor: "#ffb84d",
    },
  ];

  return (
    <section className="sh-fade relative z-10 py-28 px-1 md:px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-15 md:mb-20">
          <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.75rem] py-[0.22rem] rounded-[2px] mb-4">
            Skills
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 px-4 md:px-0">
          {skills.map((sk, i) => {
            const Icon = sk.icon;
            return (
              <div
                key={i}
                className="group relative transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className="relative p-7 rounded-[4px] bg-[rgba(10,12,10,0.88)] backdrop-blur-sm h-full flex flex-col gap-4 transition-all duration-300"
                  style={{ border: `1px solid ${sk.border}` }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = sk.hoverBorder)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = sk.border)
                  }
                >
                  {/* corner brackets */}
                  <span
                    className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px]"
                    style={{
                      borderTop: `2px solid ${sk.accent}`,
                      borderLeft: `2px solid ${sk.accent}`,
                    }}
                  />
                  <span
                    className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px]"
                    style={{
                      borderBottom: `2px solid ${sk.accent}`,
                      borderRight: `2px solid ${sk.accent}`,
                    }}
                  />

                  <span
                    className="font-jb self-start text-[0.55rem] tracking-[0.16em] uppercase px-[0.55rem] py-[0.2rem] rounded-[2px]"
                    style={{ background: sk.tagBg, color: sk.tagColor }}
                  >
                    {sk.tag}
                  </span>

                  <div
                    className="w-12 h-12 rounded-[3px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: sk.tagBg,
                      border: `1px solid ${sk.border}`,
                    }}
                  >
                    <Icon size={22} style={{ color: sk.tagColor }} />
                  </div>

                  <h3 className="font-syne text-[1.1rem] font-extrabold text-white tracking-tight">
                    {sk.title}
                  </h3>
                  <p className="font-jb text-[0.68rem] text-[rgba(180,220,180,0.48)] leading-relaxed flex-1">
                    {sk.desc}
                  </p>

                  <div className="flex items-center gap-[4px] mt-1">
                    {skills.map((_, j) => (
                      <div
                        key={j}
                        className="h-[3px] rounded-full transition-all duration-300"
                        style={{
                          flex: j === i ? 1 : undefined,
                          width: j === i ? undefined : 14,
                          background:
                            j === i ? sk.tagColor : "rgba(95,255,96,0.1)",
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

export default function StudentHome() {
  useReveal();

  return (
    <>
      <Styles />
      <div className="sh-bg font-jb min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-hidden">
        {/* ── Hero ── */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-10 py-20 overflow-hidden">
          {/* ambient glow */}
          <div className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(95,255,96,0.07)_0%,transparent_70%)]" />

          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* eyebrow */}
            <div className="sh-a1 font-jb inline-flex items-center gap-[0.45rem] text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.25)] bg-[rgba(95,255,96,0.06)] px-[0.9rem] py-[0.35rem] rounded-[2px] mb-6">
              <Sparkles size={10} /> Join the Innovation
            </div>

            {/* heading */}
            <h1
              className="sh-a2 font-syne font-extrabold leading-[1] tracking-[-0.03em] text-white mb-5
      text-[2.4rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] xl:text-[5rem]"
            >
              Hackathons for <span className="text-[#5fff60]">Students</span>
            </h1>

            {/* body */}
            <p
              className="sh-a3 font-jb text-[0.8rem] sm:text-[0.85rem] md:text-[0.9rem]
      text-[rgba(180,220,180,0.48)] leading-relaxed max-w-[520px] mx-auto mb-9 tracking-[0.02em] px-1"
            >
              Join hackathons, learn new skills, collaborate with peers, and
              bring your ideas to life. Build real projects, gain mentorship,
              and grow your portfolio.
            </p>

            {/* CTAs */}
            <div className="sh-a4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/hackathons"
                className="font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-6 sm:px-7 py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_24px_rgba(95,255,96,0.32)]"
              >
                Browse Hackathons <ArrowRight size={13} />
              </Link>

              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-jb inline-flex items-center gap-[0.4rem] text-[0.7rem] tracking-[0.12em] uppercase px-6 sm:px-7 py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:border-[rgba(95,255,96,0.42)] hover:text-[#5fff60]"
              >
                How it works
              </button>
            </div>

            {/* scroll hint */}
            <div className="sh-pulse mt-12 flex flex-col items-center gap-[0.4rem]">
              <span className="font-jb text-[0.5rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.7)]">
                Scroll to explore
              </span>
              <div className="w-px h-7 bg-gradient-to-b from-[rgba(95,255,96,0.7)] to-transparent" />
            </div>
          </div>
        </section>

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <Skills />
      </div>
    </>
  );
}
