import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  ArrowRight,
  CheckCircle,
  Shield,
  Star,
  Calendar,
  Gavel,
  Trophy,
} from "lucide-react";
import SEO from "../components/SEO.jsx";
import "./Styles/Home.css";

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

const PlatformOverview = () => {
  const items = [
    {
      icon: Calendar,
      title: "Event Schedule",
      desc: "Track every event's registration and submission windows in one place, with reminders before each deadline closes.",
    },
    {
      icon: Users,
      title: "Team Formation",
      desc: "Create a team and invite teammates with a shareable code, or join one and get approved. No spreadsheets or group chats needed.",
    },
    {
      icon: Gavel,
      title: "Judging & Leaderboard",
      desc: "Assign judges to rounds, collect weighted scores with feedback, and release a public leaderboard on your schedule.",
    },
    {
      icon: Trophy,
      title: "Live On-Spot Events",
      desc: "Run a head-to-head elimination bracket for in-person formats, with live match scoring teams can follow in real time.",
    },
  ];

  return (
    <section className="hm-fade relative z-10 py-24 px-5">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <h2
          className="font-display font-extrabold text-foreground leading-snug mb-5"
          style={{ fontSize: "clamp(1.9rem,4vw,2.9rem)" }}
        >
          Everything you need to <span className="text-primary">run an event</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
          From ideation to results, with all the tools organizers and
          participants need, whether it's a submission-based event or a
          live on-spot bracket.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4">
              <it.icon size={20} className="text-primary" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground tracking-tight mb-2">
              {it.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const AudienceSplit = () => {
  const navigate = useNavigate();
  return (
    <section className="hm-fade relative z-10 py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="font-display font-extrabold text-foreground leading-snug"
            style={{ fontSize: "clamp(1.9rem,4vw,2.9rem)" }}
          >
            Built for participants <span className="text-primary">and organizers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-8 flex flex-col shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5">
              <Users size={22} className="text-primary" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground tracking-tight mb-2">
              For Participants
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Find an event, bring your team, and ship, with every step
              tracked in one place.
            </p>
            <div className="flex flex-col gap-2.5 mb-8">
              {[
                "Discover live & upcoming events",
                "Form a team with a shareable invite code",
                "Submit repos, demos & docs before the deadline",
                "Get judge feedback and climb the leaderboard",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} className="text-primary flex-shrink-0" /> {t}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/hackathons")}
              className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl cursor-pointer bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
              Explore Hackathons <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 flex flex-col shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5">
              <Shield size={22} className="text-primary" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground tracking-tight mb-2">
              For Organizers
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Run an event end-to-end, submission-based or a live bracket
              format, without stitching together forms, spreadsheets, and
              email.
            </p>
            <div className="flex flex-col gap-2.5 mb-8">
              {[
                "Build custom registration & submission forms",
                "Configure multi-round judging with weighted scores",
                "Run live bracket (on-spot) elimination events",
                "Automated email & push notifications at every phase",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} className="text-primary flex-shrink-0" /> {t}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/adminhome")}
              className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl cursor-pointer bg-transparent border border-border text-foreground hover:bg-secondary transition-all"
            >
              Organize a Hackathon <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

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
      title: "Discover & Register",
      desc: "Browse live and upcoming events, check eligibility and timelines, and register solo or as a team in a few clicks.",
      skills: ["Live & Upcoming Events", "Solo or Team Entry", "Wishlist Events", "Deadline Reminders"],
      side: "left",
    },
    {
      phase: "Phase 2",
      title: "Form Your Team",
      desc: "Create a team and share your invite code, or join one and get approved, then manage every teammate from a single dashboard.",
      skills: ["Team Invite Codes", "Join Requests", "Member Management", "Individual Tracks Too"],
      side: "right",
    },
    {
      phase: "Phase 3",
      title: "Build & Submit",
      desc: "Work against a clear submission window, then upload your GitHub repo, live demo, and documentation directly through the platform.",
      skills: ["GitHub + Live Demo", "Document Uploads", "Fixed Submission Windows", "Editable Until It Closes"],
      side: "left",
    },
    {
      phase: "Phase 4",
      title: "Get Judged & Ranked",
      desc: "Assigned judges score your submission and leave feedback, and results land on a public leaderboard alongside the prize pool.",
      skills: ["Judge Scoring & Feedback", "Public Leaderboard", "Prize Pool Details", "Results Announcements"],
      side: "right",
    },
  ];

  return (
    <section ref={sectionRef} className="hm-fade relative z-10 py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="font-display font-extrabold text-foreground leading-snug mb-4"
            style={{ fontSize: "clamp(1.9rem,4vw,2.9rem)" }}
          >
            Your path to <span className="text-primary">excellence</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            From finding your first event to seeing your name on the
            leaderboard, here's exactly what happens at each step.
          </p>
        </div>

        <div className="relative">
          <div className="hm-timeline-bar hidden lg:block" />

          <div className="flex flex-col gap-10 lg:gap-14">
            {journey.map((j, i) => {
              const isLeft = j.side === "left";
              const vis = visibleCards.has(String(i));
              return (
                <div
                  key={i}
                  className={`flex flex-col lg:flex-row items-center ${
                    !isLeft ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-full lg:w-[calc(50%-2.5rem)] ${
                      isLeft ? "lg:pr-10" : "lg:pl-10"
                    }`}
                  >
                    <div
                      data-journey-card
                      data-idx={i}
                      className={`bg-card border border-border rounded-lg p-7 shadow-sm transition-all duration-300 ${
                        isLeft ? "hm-journey-left" : "hm-journey-right"
                      } ${vis ? "hm-visible" : ""}`}
                    >
                      <div className="mb-5">
                        <div className="text-xs font-semibold tracking-wide uppercase text-primary mb-0.5">
                          {j.phase}
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground tracking-tight">
                          {j.title}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        {j.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {j.skills.map((sk, si) => (
                          <div
                            key={si}
                            className="text-xs font-medium px-3 py-2 rounded-lg border border-border bg-secondary text-muted-foreground text-center"
                            style={
                              vis
                                ? { animation: `hm-chip 0.5s ease ${0.5 + si * 0.08}s both` }
                                : { opacity: 0 }
                            }
                          >
                            {sk}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex relative z-10 flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full bg-primary border-4 border-background transition-transform duration-500 ${
                        vis ? "scale-100" : "scale-75"
                      }`}
                    />
                  </div>

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
      role: "Full-Stack Track, Web Dev Event",
      initial: "K",
      quote:
        "Before this event, I only knew the basics of web dev. Working with my team against a fixed deadline pushed me to learn fast, and I shipped my first real full-stack project here.",
    },
    {
      name: "Mohit Gupta",
      role: "Team Lead, 3-Member Team",
      initial: "M",
      quote:
        "HackSprint gave me more than coding practice. It gave me confidence. Presenting to judges and coordinating a team under a real deadline was a completely different experience from solo projects.",
    },
    {
      name: "Ridham Shah",
      role: "Solo Participant",
      initial: "R",
      quote:
        "The judge feedback on our submission was specific and actionable, not just a score. That's what pushed me to actually fix the gaps for the next event instead of just moving on.",
    },
    {
      name: "Ananya Deshmukh",
      role: "Backend Developer, Team of 4",
      initial: "A",
      quote:
        "Finding teammates used to be the hardest part of joining an event. Sharing a single invite code and approving requests from one dashboard made team formation genuinely painless.",
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
    <section className="hm-fade relative z-10 py-24 px-5 overflow-hidden">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <h2
            className="font-display font-extrabold text-foreground leading-snug"
            style={{ fontSize: "clamp(1.9rem,4vw,2.9rem)" }}
          >
            What our participants <span className="text-primary">are saying</span>
          </h2>
        </div>
      </div>

      <div className="hm-marquee-wrap max-w-[1400px] mx-auto">
        <div className="hm-marquee-track">
          {track.map((s, i) => (
            <div
              key={i}
              aria-hidden={i >= stories.length ? "true" : undefined}
              className="bg-card border border-border rounded-lg p-7 shadow-sm flex flex-col gap-4 w-[320px] flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-extrabold text-primary text-base">{s.initial}</span>
                </div>
                <div>
                  <p className="font-display font-bold text-foreground text-sm tracking-tight">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.role}</p>
                  <div className="flex gap-[2px] mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={11} className="text-primary fill-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1">
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

  return (
    <div className="hm-root">
      <SEO />
      <div className="hm-bg" />

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center py-20 text-center overflow-hidden">
        <div className="hm-bracket relative z-10 max-w-[860px] mx-auto">
          <h1
            className="hm-a2 font-display font-extrabold leading-[1.05] tracking-tight text-foreground mb-4
  text-[2.8rem] sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Hack<span className="hm-gradient-text">Sprint</span>
          </h1>

          <p className="hm-a4 text-[clamp(0.9rem,1.2vw,1.05rem)] text-muted-foreground leading-relaxed max-w-[600px] mx-auto mb-10">
            HackSprint is where organizers launch an event in minutes and
            participants take it from registration to the leaderboard,
            covering teams, submissions, judging, and live bracket events,
            all in one platform.
          </p>

          <div className="hm-a5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/hackathons")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-xl cursor-pointer transition-all duration-200 bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
            >
              Explore Hackathons <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/adminhome")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-xl cursor-pointer transition-all duration-150 bg-transparent border border-border text-foreground hover:bg-secondary"
            >
              Organize a Hackathon <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <PlatformOverview />

      <AudienceSplit />

      <DeveloperJourneySection />

      <Testimonials />
    </div>
  );
};

export default Home;
