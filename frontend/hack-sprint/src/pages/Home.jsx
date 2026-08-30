import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  ArrowRight,
  Code,
  Trophy,
  Zap,
  Rocket,
  Lightbulb,
  CheckCircle,
  Calendar,
  Star,
  Sparkles,
  BarChart3,
  Megaphone,
  Search,
  UploadCloud,
} from "lucide-react";
import SEO from "../components/SEO.jsx";
import "./Styles/Home.css";

const TypingText = ({ text, className = "" }) => {
  const [display, setDisplay] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < text.length) {
        setDisplay(text.slice(0, i + 1));
        i++;
      } else {
        setTyping(false);
        clearInterval(t);
      }
    }, 80);
    return () => clearInterval(t);
  }, [text]);

  return (
    <span className={className}>
      {display}
      {typing && <span className="hm-cursor text-[#5fff60]">|</span>}
    </span>
  );
};

const useScrollReveal = (selector = ".hm-fade", threshold = 0.12) => {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("hm-visible");
        }),
      { threshold }
    );
    document.querySelectorAll(selector).forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [selector, threshold]);
};

const QuoteBox = ({ icon: Icon, quote, floatClass, style }) => (
  <div
    className={`${floatClass} absolute bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] px-5 py-4 max-w-[230px] backdrop-blur-sm hover:border-[rgba(95,255,96,0.3)] transition-all duration-300 cursor-default`}
    style={style}
  >
    <div className="hm-card" />
    <div className="w-7 h-7 bg-[rgba(95,255,96,0.08)] border border-[rgba(95,255,96,0.15)] rounded-[2px] flex items-center justify-center mb-3">
      <Icon size={13} className="text-[#5fff60]" />
    </div>
    <p className="font-jb text-[0.62rem] text-[rgba(180,220,180,0.55)] leading-relaxed italic">
      {quote}
    </p>
    <div className="flex gap-[2px] mt-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={9} className="text-[#5fff60] fill-[#5fff60]" />
      ))}
    </div>
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  features,
  accentColor = "#5fff60",
  accentBorder = "rgba(95,255,96,0.18)",
}) => (
  <div
    className="hm-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-7 flex flex-col gap-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
    style={{}}
    onMouseEnter={(e) =>
      (e.currentTarget.style.borderColor = "rgba(95,255,96,0.28)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.borderColor = "rgba(95,255,96,0.1)")
    }
  >
    <div className="flex items-start justify-between">
      <div
        className="w-12 h-12 rounded-[3px] flex items-center justify-center border flex-shrink-0"
        style={{
          background: `rgba(95,255,96,0.07)`,
          borderColor: accentBorder,
        }}
      >
        <Icon size={22} style={{ color: accentColor }} />
      </div>
      <div className="text-right">
        <span className="font-jb text-[0.5rem] tracking-[0.16em] uppercase text-[rgba(95,255,96,0.45)]">
          Featured
        </span>
        <div className="flex justify-end gap-[2px] mt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={8} className="text-[#5fff60] fill-[#5fff60]" />
          ))}
        </div>
      </div>
    </div>

    <div>
      <h3 className="font-syne text-[1.05rem] font-extrabold text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="font-jb text-[0.67rem] text-[rgba(180,220,180,0.48)] leading-relaxed">
        {desc}
      </p>
    </div>

    <div className="flex flex-col gap-2 mt-auto">
      {features.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-2 font-jb text-[0.63rem] text-[rgba(180,220,180,0.45)]"
        >
          <div className="w-4 h-4 rounded-[2px] flex items-center justify-center flex-shrink-0 bg-[rgba(95,255,96,0.07)] border border-[rgba(95,255,96,0.15)]">
            <CheckCircle size={9} className="text-[#5fff60]" />
          </div>
          {f}
        </div>
      ))}
    </div>
  </div>
);

const DeveloperJourneySection = () => {
  const sectionRef = useRef(null);
  const [visibleCards, setVisibleCards] = useState(new Set());

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisibleCards((prev) => new Set([...prev, e.target.dataset.idx]));
        }),
      { threshold: 0.25, rootMargin: "-40px" }
    );
    document
      .querySelectorAll("[data-journey-card]")
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const journey = [
    {
      phase: "Phase 1",
      n: "01",
      title: "Discover & Register",
      icon: Search,
      desc: "Browse live and upcoming hackathons, check eligibility and timelines, and register solo or as a team in a few clicks.",
      skills: [
        "Live & Upcoming Events",
        "Solo or Team Entry",
        "Wishlist Hackathons",
        "Deadline Reminders",
      ],
      side: "left",
    },
    {
      phase: "Phase 2",
      n: "02",
      title: "Form Your Team",
      icon: Users,
      desc: "Create a team and share your invite code, or join one and get approved — manage every teammate from a single dashboard.",
      skills: [
        "Team Invite Codes",
        "Join Requests",
        "Member Management",
        "Individual Tracks Too",
      ],
      side: "right",
    },
    {
      phase: "Phase 3",
      n: "03",
      title: "Build & Submit",
      icon: UploadCloud,
      desc: "Work against a clear submission window, then upload your GitHub repo, live demo, and documentation directly through the platform.",
      skills: [
        "GitHub + Live Demo",
        "Document Uploads",
        "Fixed Submission Windows",
        "Editable Until It Closes",
      ],
      side: "left",
    },
    {
      phase: "Phase 4",
      n: "04",
      title: "Get Judged & Ranked",
      icon: Trophy,
      desc: "Assigned judges score your submission and leave feedback, and results land on a public leaderboard alongside the prize pool.",
      skills: [
        "Judge Scoring & Feedback",
        "Public Leaderboard",
        "Prize Pool Details",
        "Results Announcements",
      ],
      side: "right",
    },
  ];

  return (
    <section ref={sectionRef} className="hm-fade relative z-10 py-28 px-5">
      <div className="max-w-6xl mx-auto">
        {/* heading */}
        <div className="text-center mb-20">
          <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.75rem] py-[0.22rem] rounded-[2px] mb-4">
            Developer Journey
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none mb-4"
            style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}
          >
            Your Path to <span className="text-[#5fff60]">Excellence</span>
          </h2>
          <p className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.48)] max-w-[520px] mx-auto leading-relaxed tracking-[0.03em]">
            From finding your first hackathon to seeing your name on the
            leaderboard — here's exactly what happens at each step.
          </p>
        </div>

        {/* timeline */}
        <div className="relative">
          {/* vertical line — desktop only */}
          <div className="hm-timeline-bar hidden lg:block" />

          <div className="flex flex-col gap-12 lg:gap-16">
            {journey.map((j, i) => {
              const Icon = j.icon;
              const isLeft = j.side === "left";
              const vis = visibleCards.has(String(i));
              return (
                <div
                  key={i}
                  className={`flex flex-col lg:flex-row items-center ${
                    !isLeft ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* card */}
                  <div
                    className={`w-full lg:w-[calc(50%-2.5rem)] ${
                      isLeft ? "lg:pr-10" : "lg:pl-10"
                    }`}
                  >
                    <div
                      data-journey-card
                      data-idx={i}
                      className={`hm-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-7 backdrop-blur-sm transition-all duration-300 hover:border-[rgba(95,255,96,0.28)] ${
                        isLeft ? "hm-journey-left" : "hm-journey-right"
                      } ${vis ? "hm-visible" : ""}`}
                      style={{ transitionDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-[3px] bg-[rgba(95,255,96,0.07)] border border-[rgba(95,255,96,0.18)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                          <Icon size={20} className="text-[#5fff60]" />
                        </div>
                        <div>
                          <div className="font-jb text-[0.58rem] tracking-[0.16em] uppercase text-[#5fff60] mb-[2px]">
                            {j.phase}
                          </div>
                          <h3 className="font-syne text-[1.05rem] font-extrabold text-white tracking-tight">
                            {j.title}
                          </h3>
                        </div>
                      </div>

                      <p className="font-jb text-[0.67rem] text-[rgba(180,220,180,0.48)] leading-relaxed mb-5">
                        {j.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {j.skills.map((sk, si) => (
                          <div
                            key={si}
                            className="font-jb text-[0.6rem] tracking-[0.05em] px-3 py-2 rounded-[2px] border border-[rgba(95,255,96,0.15)] bg-[rgba(95,255,96,0.05)] text-[rgba(95,255,96,0.65)] text-center transition-all duration-200 hover:border-[rgba(95,255,96,0.35)] hover:bg-[rgba(95,255,96,0.1)]"
                            style={
                              vis
                                ? {
                                    animation: `hm-chip 0.5s ease ${
                                      0.6 + si * 0.08
                                    }s both`,
                                  }
                                : { opacity: 0 }
                            }
                          >
                            {sk}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* center dot — desktop */}
                  <div className="hidden lg:flex relative z-10 flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full bg-[#5fff60] border-4 border-[#0a0a0a] transition-all duration-500 ${
                        vis
                          ? "shadow-[0_0_20px_rgba(95,255,96,0.55)] scale-100"
                          : "scale-75 shadow-none"
                      }`}
                    >
                      {vis && (
                        <div className="absolute inset-0 rounded-full bg-[#5fff60] animate-ping opacity-50" />
                      )}
                    </div>
                  </div>

                  {/* spacer */}
                  <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const stories = [
    {
      name: "Kavya Bhanvadia",
      role: "Full-Stack Track, Web Dev Hackathon",
      initial: "K",
      quote:
        "Before this hackathon, I only knew the basics of web dev. Working with my team against a fixed deadline pushed me to learn fast, and I shipped my first real full-stack project here.",
    },
    {
      name: "Mohit Gupta",
      role: "Team Lead, 3-Member Team",
      initial: "M",
      quote:
        "HackSprint gave me more than coding practice — it gave me confidence. Presenting to judges and coordinating a team under a real deadline was a completely different experience from solo projects.",
    },
    {
      name: "Ridham Shah",
      role: "Solo Participant",
      initial: "R",
      quote:
        "The judge feedback on our submission was specific and actionable, not just a score. That's what pushed me to actually fix the gaps for the next hackathon instead of just moving on.",
    },
    {
      name: "Ananya Deshmukh",
      role: "Backend Developer, Team of 4",
      initial: "A",
      quote:
        "Finding teammates used to be the hardest part of joining a hackathon. Sharing a single invite code and approving requests from one dashboard made team formation genuinely painless.",
    },
    {
      name: "Devansh Rathi",
      role: "First-Time Participant",
      initial: "D",
      quote:
        "I registered without a team and wasn't sure I'd manage. The clear submission window and deadline reminders kept me on track, and I ended up placing on the public leaderboard.",
    },
    {
      name: "Priya Nair",
      role: "Judge & Mentor",
      initial: "P",
      quote:
        "As a judge, having every submission, repo link, and demo in one place made scoring and leaving feedback straightforward instead of chasing links across emails and chats.",
    },
  ];

  const track = [...stories, ...stories];

  return (
    <section className="hm-fade relative z-10 py-28 px-5">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.75rem] py-[0.22rem] rounded-[2px] mb-4">
            Success Stories
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-none"
            style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}
          >
            From Hackathon to <span className="text-[#5fff60]">Unicorn</span>
          </h2>
          <p className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.48)] mt-4 max-w-md mx-auto leading-relaxed">
            Real developers. Real impact. Discover how HackSprint launched
            careers.
          </p>
        </div>
      </div>

      <div className="hm-marquee-wrap max-w-[1400px] mx-auto">
        <div className="hm-marquee-track">
          {track.map((s, i) => (
            <div
              key={i}
              aria-hidden={i >= stories.length ? "true" : undefined}
              className="hm-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-7 backdrop-blur-sm flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 w-[320px] flex-shrink-0"
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(95,255,96,0.28)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(95,255,96,0.1)")
              }
            >
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-[rgba(95,255,96,0.08)] border-2 border-[rgba(95,255,96,0.2)] flex items-center justify-center flex-shrink-0">
                  <span className="font-syne font-extrabold text-[#5fff60] text-[0.95rem]">
                    {s.initial}
                  </span>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#5fff60] rounded-full flex items-center justify-center">
                    <CheckCircle size={9} style={{ color: "#050905" }} />
                  </div>
                </div>
                <div>
                  <p className="font-syne font-extrabold text-white text-[0.88rem] tracking-tight">
                    {s.name}
                  </p>
                  <p className="font-jb text-[0.58rem] text-[rgba(180,220,180,0.4)] mt-0.5">
                    {s.role}
                  </p>
                  <div className="flex gap-[2px] mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={9}
                        className="text-[#5fff60] fill-[#5fff60]"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="font-jb text-[0.67rem] text-[rgba(180,220,180,0.5)] leading-relaxed italic flex-1">
                "{s.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState("none");

  useEffect(() => {
    const s = localStorage.getItem("token");
    const a = localStorage.getItem("adminToken");
    setUserType(s ? "student" : a ? "admin" : "none");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    if (verified === "success") {
      toast.success("Email verified successfully! You can now log in.");
      navigate("/account/login", { replace: true });
    } else if (verified === "failed") {
      toast.error(
        "Verification link invalid or expired. Please sign up again or request a new link."
      );
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  useScrollReveal(".hm-fade");

  const features = [
    {
      icon: Calendar,
      title: "Event Schedule",
      desc: "Track every hackathon's registration and submission windows in one place, with reminders before each deadline closes.",
      features: [
        "Registration & Submission Phases",
        "Deadline Reminders",
        "Email + In-App Notifications",
        "Wishlist Hackathons",
      ],
    },
    {
      icon: Users,
      title: "Team Formation",
      desc: "Create a team and invite teammates with a shareable code, or join one and get approved — no spreadsheets or group chats needed to track who's in.",
      features: [
        "Invite-Code Team Creation",
        "Join Requests & Approval",
        "Member Management",
        "Solo or Team Participation",
      ],
    },
    {
      icon: Trophy,
      title: "Competition Hub",
      desc: "Run or join a hackathon end-to-end — from event setup to judge scoring to a public leaderboard.",
      features: [
        "Hackathon Creation & Approval",
        "Judge Scoring & Feedback",
        "Public Leaderboards",
        "Prize Pool Details",
      ],
    },
  ];

  return (
    <div className="hm-root overflow-hidden">
      <SEO />
      {/* bg grid */}
      <div className="hm-bg" />

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center py-20 text-center overflow-hidden">
        <div className="hm-ring w-[700px] h-[700px]" />
        <div className="hm-ring hm-ring-2 w-[480px] h-[480px]" />

        <div className="hidden 2xl:block">
          <QuoteBox
            icon={Code}
            floatClass="hm-float-1"
            quote='"Code is poetry written in logic — hackathons are where poets become legends."'
            style={{ top: "18%", left: "3%" }}
          />
          <QuoteBox
            icon={Zap}
            floatClass="hm-float-2"
            quote='"Innovation happens when brilliant minds collide with impossible deadlines."'
            style={{ top: "18%", right: "3%" }}
          />
          <QuoteBox
            icon={Lightbulb}
            floatClass="hm-float-3"
            quote='"Every great startup began with a crazy idea and a weekend hackathon."'
            style={{ bottom: "18%", left: "3%" }}
          />
          <QuoteBox
            icon={Rocket}
            floatClass="hm-float-4"
            quote='"Dream in code, build in teams, launch into the future."'
            style={{ bottom: "18%", right: "3%" }}
          />
        </div>

        <div className="relative z-10 max-w-[1000px] mx-auto">
          {/* eyebrow */}
          <div className="hm-a1 font-jb inline-flex items-center gap-[0.45rem] text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.25)] bg-[rgba(95,255,96,0.06)] px-[0.85rem] py-[0.32rem] rounded-[2px] mb-5 md:mb-8">
            <Sparkles size={11} /> Welcome to the Future of Innovation
          </div>

          {/* big title */}
          <h1
            className="hm-a2 font-syne font-extrabold leading-[0.92] tracking-[-0.04em] text-white mb-3
  text-[2.6rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            Hack<span className="text-[#5fff60]">Sprint</span>
          </h1>

          {/* typing subtitle */}
          <p className="hm-a3 font-syne font-bold text-[clamp(1rem,2.5vw,1.6rem)] text-[rgba(180,220,180,0.75)] tracking-tight mb-5">
            <TypingText text="Where Innovation Meets Opportunity" />
          </p>

          {/* body */}
          <p className="hm-a4 font-jb text-[clamp(0.68rem,1.2vw,0.82rem)] text-[rgba(180,220,180,0.48)] leading-relaxed max-w-[580px] mx-auto mb-10 tracking-[0.02em]">
            Join the developers building the future through collaborative
            hackathons, skill development, and industry connections.
          </p>

          {/* CTAs */}
          <div className="hm-a5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() =>
                navigate(
                  userType === "student" ? "/dashboard" : "/account/login"
                )
              }
              className="font-jb inline-flex items-center gap-[0.5rem] text-[0.68rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_28px_rgba(95,255,96,0.35)]"
            >
              {userType === "student" ? "My Dashboard" : "Join as Student"}{" "}
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/adminhome")}
              className="font-jb inline-flex items-center gap-[0.5rem] text-[0.68rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(95,255,96,0.22)] text-[rgba(95,255,96,0.65)] hover:border-[rgba(95,255,96,0.45)] hover:text-[#5fff60]"
            >
              Organize a Hackathon <ArrowRight size={14} />
            </button>
          </div>

          {/* scroll hint */}
          <div className="hm-pulse mt-14 flex flex-col items-center gap-[0.4rem]">
            <span className="font-jb text-[0.5rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.7)]">
              Scroll to explore
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[rgba(95,255,96,0.7)] to-transparent" />
          </div>
        </div>
      </section>

      <section className="hm-fade relative z-10 py-28 px-5">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.75rem] py-[0.22rem] rounded-[2px] mb-4">
              Platform Features
            </div>
            <h2
              className="font-syne font-extrabold text-white tracking-tight leading-none mb-4"
              style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}
            >
              Everything You Need to{" "}
              <span className="text-[#5fff60]">Innovate</span>
            </h2>
            <p className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.48)] max-w-[520px] mx-auto leading-relaxed">
              From ideation to deployment all the tools, resources, and
              community to bring your ideas to life.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      <DeveloperJourneySection />

      <Testimonials />

      <section className="hm-fade relative z-10 py-28 px-5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-[0.75rem] py-[0.22rem] rounded-[2px] mb-6">
            Start Today
          </div>
          <h2
            className="font-syne font-extrabold text-white tracking-tight leading-[1.05] mb-5"
            style={{ fontSize: "clamp(2rem,5.5vw,3.5rem)" }}
          >
            Ready to Transform{" "}
            <span className="text-[#5fff60]">Your Future?</span>
          </h2>
          <p className="font-jb text-[0.7rem] text-[rgba(180,220,180,0.48)] leading-relaxed mb-8 max-w-[480px] mx-auto">
            Join developers who have already accelerated their careers, built
            amazing products, and connected with the global tech community.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-10">
            {[
              "Free for all students",
              "No experience needed",
              "Team up or go solo",
            ].map((t, i) => (
              <span
                key={i}
                className="font-jb inline-flex items-center gap-2 text-[0.62rem] tracking-[0.05em] text-[rgba(180,220,180,0.45)] border border-[rgba(95,255,96,0.1)] bg-[rgba(95,255,96,0.04)] px-4 py-[0.4rem] rounded-[2px]"
              >
                <CheckCircle size={11} className="text-[#5fff60]" /> {t}
              </span>
            ))}
          </div>

          <button
            onClick={() =>
              navigate(
                userType === "student" ? "/studenthome" : "/account/login"
              )
            }
            className="font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-10 py-[0.9rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_28px_rgba(95,255,96,0.35)]"
          >
            Get Started Free <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
