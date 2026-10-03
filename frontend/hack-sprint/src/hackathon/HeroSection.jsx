import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  User,
  Trophy,
  Clock,
  ChevronRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { ProfileAPI } from "../api/profile.api.js";
import { HackathonAPI } from "../api/hackathon.api.js";
import SubmissionForm from "./SubmissionForm";
import "../pages/Styles/AllHackathons.css";

const dayMs = 1000 * 60 * 60 * 24;

const daysUntil = (date, now) =>
  Math.max(0, Math.ceil((new Date(date) - now) / dayMs));

const shortDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const HeroSection = ({
  title,
  subTitle,
  venue,
  participantCount = 0,
  prizes = [],
  imageUrl = "/assets/hackathon-banner.png",
  hackathonId,
  slug,
  phases = [],
  participationType = "INDIVIDUAL",
  maxTeamSize = 1,
  eventFormat = "SUBMISSION",
  extraAction = null,
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamCode, setTeamCode] = useState("");
  // Unknown until the profile loads — treated as complete so a slow/failed
  // fetch never hides the normal buttons (the server enforces this anyway).
  const [profileComplete, setProfileComplete] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const navigate = useNavigate();

  // Ticks the phase derivation forward on its own, so status/countdowns never
  // sit stale until an unrelated re-render happens to refresh them.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const sortedPhases = [...phases].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );
  const registrationPhase = phases.find((p) => p.phaseType === "REGISTRATION");
  const submissionPhases = phases.filter((p) => p.phaseType === "SUBMISSION");

  const currentPhase = sortedPhases.find(
    (p) => now >= new Date(p.startDate) && now <= new Date(p.endDate)
  );
  const nextPhase = sortedPhases.find((p) => new Date(p.startDate) > now);
  const earliestStart = sortedPhases[0] ? new Date(sortedPhases[0].startDate) : null;
  const latestEnd = sortedPhases.length
    ? new Date(Math.max(...sortedPhases.map((p) => new Date(p.endDate).getTime())))
    : null;

  const phaseState = !earliestStart
    ? "UNSCHEDULED"
    : now < earliestStart
    ? "UPCOMING"
    : now > latestEnd
    ? "COMPLETED"
    : "ACTIVE";

  const activeSubmissionPhase = submissionPhases.find(
    (p) => now >= new Date(p.startDate) && now <= new Date(p.endDate)
  );

  const isWithinRegistrationPeriod = () =>
    !!registrationPhase &&
    now >= new Date(registrationPhase.startDate) &&
    now <= new Date(registrationPhase.endDate);

  const isWithinSubmissionPeriod = () => !!activeSubmissionPhase;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);

    const load = async () => {
      setLoading(true);
      try {
        // getMyRegistration now returns the team (leader/members populated)
        // in-line, so a single parallel round trip replaces what used to be
        // a status check + registration fetch + separate team fetch.
        const [profileRes, regRes] = await Promise.all([
          ProfileAPI.getMyProfile(),
          HackathonAPI.getMyRegistration(hackathonId).catch((err) => {
            if (err.response?.status === 404) return null;
            throw err;
          }),
        ]);
        const myUserId = profileRes.data.profile._id;
        setProfileComplete(profileRes.data.profile.isProfileComplete !== false);

        if (!regRes) {
          setRegistered(false);
          setIsLeader(false);
          setIsTeamMember(false);
          return;
        }

        setRegistered(true);

        const team = regRes.data.registration?.team;

        if (!team) {
          setIsLeader(false);
          setIsTeamMember(false);
          return;
        }

        const leaderId = team.leader?._id || team.leader;
        const amLeader = String(leaderId) === String(myUserId);
        setIsLeader(amLeader);

        const memberIds = (team.members || []).map((m) => String(m._id || m));
        setIsTeamMember(memberIds.includes(String(myUserId)));
        setTeamCode(team.secretCode || "");
      } catch (err) {
        console.error("[HeroSection] failed to load registration:", err);
        setRegistered(false);
        setIsLeader(false);
        setIsTeamMember(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hackathonId]);

  const handleRegister = () => {
    navigate(`/hackathon/RegistrationForm/${slug}`);
  };

  const handleTeamDashboard = () => {
    if (!teamCode) return;
    navigate(`/hackathon/${slug}/team/${teamCode}`);
  };

  const handleSubmit = () => {
    setShowSubmissionModal(true);
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "TBD";
    const s = new Date(start),
      e = new Date(end),
      opt = { month: "long", day: "numeric" };
    if (s.getFullYear() === e.getFullYear())
      return `${s.toLocaleDateString("en-US", opt)} – ${e.toLocaleDateString(
        "en-US",
        { ...opt, year: "numeric" }
      )}`;
    return `${s.toLocaleDateString("en-US", {
      ...opt,
      year: "numeric",
    })} – ${e.toLocaleDateString("en-US", { ...opt, year: "numeric" })}`;
  };

  const actionCls = [
    "font-[family-name:'JetBrains_Mono',monospace]",
    "inline-flex items-center justify-center gap-2",
    "text-xs tracking-[0.1em] uppercase",
    "px-5 py-2.5 rounded-[3px] border cursor-pointer",
    "transition-all duration-150",
    "w-full sm:w-auto",
  ].join(" ");

  const renderActionButton = () => {
    if (loading) return null;

    if (!isAuthenticated)
      return (
        <Link to="/account/login">
          <button
            className={`${actionCls} bg-[rgba(var(--hk-accent-rgb),0.08)] border-[rgba(var(--hk-accent-rgb),0.25)] text-[rgba(var(--hk-accent-rgb),0.75)] hover:bg-[rgba(var(--hk-accent-rgb),0.14)]`}
          >
            Login
          </button>
        </Link>
      );

    if (phaseState === "COMPLETED" || phaseState === "UNSCHEDULED") return null;

    if (!profileComplete)
      return (
        <button
          onClick={() => navigate("/dashboard?completeProfile=1")}
          className={`${actionCls} bg-[rgba(var(--hk-amber-rgb),0.1)] border-[rgba(var(--hk-amber-rgb),0.4)] text-[rgb(var(--hk-amber-rgb))] font-bold hover:bg-[rgba(var(--hk-amber-rgb),0.18)]`}
        >
          Complete profile to participate <ChevronRight size={14} />
        </button>
      );

    if (!registered) {
      if (isWithinRegistrationPeriod())
        return (
          <button
            onClick={handleRegister}
            className={`${actionCls} bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] font-bold hover:opacity-90 hover:shadow-[0_0_20px_rgba(var(--hk-accent-rgb),0.3)]`}
          >
            Register Now <ChevronRight size={14} />
          </button>
        );
      return (
        <button
          disabled
          className={`${actionCls} bg-[rgba(var(--hk-accent-rgb),0.04)] border-[rgba(var(--hk-accent-rgb),0.1)] text-[rgba(var(--hk-accent-rgb),0.4)] cursor-not-allowed`}
        >
          {registrationPhase && now < new Date(registrationPhase.startDate)
            ? "Registration Opens Soon"
            : "Registration Closed"}
        </button>
      );
    }

    if (participationType === "TEAM" && !isLeader && !isTeamMember)
      return (
        <button
          onClick={handleRegister}
          className={`${actionCls} bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] font-bold hover:opacity-90 hover:shadow-[0_0_20px_rgba(var(--hk-accent-rgb),0.3)]`}
        >
          Create/Join Team <ChevronRight size={14} />
        </button>
      );

    // On-spot (bracket/match) events have nothing for a team to submit —
    // admins score matches directly — so there's no equivalent of the
    // submission CTA below once someone's registered/on a team.
    if (eventFormat === "ON_SPOT") return null;

    if (isTeamMember && !isLeader)
      return (
        <button
          disabled
          className={`${actionCls} bg-[rgba(var(--hk-accent-rgb),0.04)] border-[rgba(var(--hk-accent-rgb),0.1)] text-[rgba(var(--hk-accent-rgb),0.4)] cursor-not-allowed`}
        >
          Submit (Leader Only)
        </button>
      );

    return (
      <div className="relative group inline-block">
        <button
          onClick={handleSubmit}
          disabled={!isWithinSubmissionPeriod()}
          className={`${actionCls} ${
            isWithinSubmissionPeriod()
              ? "bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] hover:opacity-90"
              : "bg-[rgba(var(--hk-text-rgb),0.12)] border-[rgba(var(--hk-text-rgb),0.2)] text-[rgba(var(--hk-text-rgb),0.4)] cursor-not-allowed"
          }`}
        >
          Submit Project <ChevronRight size={14} />
        </button>
        {!isWithinSubmissionPeriod() && (
          <div className="absolute -bottom-6 left-0 text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.5)] whitespace-nowrap">
            Submission Not Open
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ value, label, icon: Icon }) => (
    <div className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.18)] dark:border-[rgba(var(--hk-accent-rgb),0.12)] rounded-[4px] p-4 backdrop-blur-sm hover:border-[rgba(var(--hk-accent-rgb),0.28)] transition-all">
      <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-accent-rgb),0.4)]" />
      <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(var(--hk-accent-rgb),0.4)]" />
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[rgba(var(--hk-accent-rgb),0.07)] rounded-[3px] flex items-center justify-center border border-[rgba(var(--hk-accent-rgb),0.18)] flex-shrink-0">
          <Icon size={16} className="text-[var(--hk-accent-solid)]" />
        </div>
        <div>
          <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-xl leading-tight">
            {value}
          </div>
          <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(var(--hk-text-rgb),0.55)] mt-0.5">
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  const PrizeStatCard = ({ prizes, icon: Icon }) => {
    const total = prizes.reduce((s, p) => s + (p.amount || 0), 0);
    return (
      <div className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.18)] dark:border-[rgba(var(--hk-accent-rgb),0.12)] rounded-[4px] p-4 backdrop-blur-sm hover:border-[rgba(var(--hk-accent-rgb),0.28)] transition-all">
        <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-accent-rgb),0.4)]" />
        <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(var(--hk-accent-rgb),0.4)]" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[rgba(var(--hk-accent-rgb),0.07)] rounded-[3px] flex items-center justify-center border border-[rgba(var(--hk-accent-rgb),0.18)] flex-shrink-0">
            <Icon size={16} className="text-[var(--hk-accent-solid)]" />
          </div>
          <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-xl leading-tight">
            Prize Pool
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {prizes.slice(0, 4).map((p, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.55)]">
                {p.title}
              </span>
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[var(--hk-accent-solid)] font-semibold">
                ₹{(p.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          {prizes.length > 4 && (
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.35)]">
              +{prizes.length - 4} more
            </p>
          )}
          {total > 0 && prizes.length > 1 && (
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-[rgba(var(--hk-accent-rgb),0.08)]">
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] tracking-[0.08em] uppercase text-[rgba(var(--hk-text-rgb),0.65)]">
                Total
              </span>
              <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-accent-solid)] text-sm">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const fallbackImage = `https://via.placeholder.com/1200x400/0a0f18/22c55e?text=${encodeURIComponent(
    title
  )}`;

  const statusBadge = {
    ACTIVE: {
      label: "Active",
      cls: "bg-[rgba(var(--hk-accent-rgb),0.08)] border-[rgba(var(--hk-accent-rgb),0.25)] text-[var(--hk-accent-solid)]",
      pulse: true,
    },
    UPCOMING: {
      label: "Upcoming",
      cls: "bg-[rgba(var(--hk-amber-rgb),0.1)] border-[rgba(var(--hk-amber-rgb),0.3)] text-[rgba(var(--hk-amber-rgb),0.9)]",
      pulse: false,
    },
    COMPLETED: {
      label: "Ended",
      cls: "bg-[rgba(var(--hk-text-rgb),0.07)] border-[rgba(var(--hk-text-rgb),0.2)] text-[rgba(var(--hk-text-rgb),0.6)]",
      pulse: false,
    },
    UNSCHEDULED: {
      label: "TBD",
      cls: "bg-[rgba(var(--hk-text-rgb),0.07)] border-[rgba(var(--hk-text-rgb),0.2)] text-[rgba(var(--hk-text-rgb),0.6)]",
      pulse: false,
    },
  }[phaseState];

  const timeStat = (() => {
    if (phaseState === "COMPLETED")
      return {
        value: "Concluded",
        label: `Ended ${shortDate(latestEnd)}`,
        icon: CheckCircle2,
      };
    if (phaseState === "UPCOMING")
      return {
        value: `${daysUntil(earliestStart, now)} Days`,
        label: `${sortedPhases[0].phaseName} Starts`,
        icon: Clock,
      };
    if (currentPhase)
      return {
        value: `${daysUntil(currentPhase.endDate, now)} Days`,
        label: `${currentPhase.phaseName} Ends`,
        icon: Clock,
      };
    if (nextPhase)
      return {
        value: `${daysUntil(nextPhase.startDate, now)} Days`,
        label: `${nextPhase.phaseName} Starts`,
        icon: Clock,
      };
    return { value: "TBD", label: "Time Left", icon: Clock };
  })();

  return (
    <>
      <div className="border-b border-[rgba(var(--hk-accent-rgb),0.1)] bg-[var(--hk-bg)] font-[family-name:'JetBrains_Mono',monospace] overflow-hidden">
        <div className="relative w-full h-[60vh] md:h-[60vh] lg:h-[75vh] overflow-hidden">
          <img
            src={imageError ? fallbackImage : imageUrl}
            alt="Event Banner"
            className="w-full h-full object-fill sm:object-fill"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--hk-bg-rgb,10,10,10),0.88)] via-[rgba(var(--hk-bg-rgb,10,10,10),0.15)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--hk-accent-rgb),0.22)] to-transparent" />
        </div>

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-7">
          <div className="flex flex-wrap items-start gap-3 mb-5">
            <span
              className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-[2px] border ${statusBadge.cls}`}
            >
              {statusBadge.pulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--hk-accent-solid)] animate-pulse" />
              )}
              {statusBadge.label}
            </span>

            <span
              className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-[2px] border ${
                participationType === "TEAM"
                  ? "bg-[rgba(var(--hk-purple-rgb),0.08)] border-[rgba(var(--hk-purple-rgb),0.25)] text-[rgba(var(--hk-purple-rgb),0.9)]"
                  : "bg-[rgba(var(--hk-text-rgb),0.06)] border-[rgba(var(--hk-text-rgb),0.18)] text-[rgba(var(--hk-text-rgb),0.75)]"
              }`}
            >
              {participationType === "TEAM" ? (
                <Users size={11} />
              ) : (
                <User size={11} />
              )}
              {participationType === "TEAM"
                ? `Team · up to ${maxTeamSize} members`
                : "Individual"}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
              {registrationPhase && (
                <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.6)]">
                  <Calendar
                    size={11}
                    className="text-[rgba(var(--hk-accent-rgb),0.6)] flex-shrink-0"
                  />
                  <span className="text-[rgba(var(--hk-text-rgb),0.8)]">
                    Registration:
                  </span>
                  <span>
                    {formatDateRange(
                      registrationPhase.startDate,
                      registrationPhase.endDate
                    )}
                  </span>
                </div>
              )}
              {submissionPhases.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.6)]"
                >
                  <Calendar
                    size={11}
                    className="text-[rgba(var(--hk-accent-rgb),0.6)] flex-shrink-0"
                  />
                  <span className="text-[rgba(var(--hk-text-rgb),0.8)]">
                    {p.phaseName}:
                  </span>
                  <span>{formatDateRange(p.startDate, p.endDate)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] leading-tight tracking-tight mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                {title}
              </h1>
              {subTitle && (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-sm text-[rgba(var(--hk-text-rgb),0.58)] tracking-[0.02em]">
                  {subTitle}
                </p>
              )}
              {venue && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin size={12} className="text-[rgba(var(--hk-accent-rgb),0.6)] flex-shrink-0" />
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[rgba(var(--hk-text-rgb),0.6)]">
                    {venue}
                  </span>
                </div>
              )}
              {registered && (
                <div className="mt-2 inline-flex items-center gap-1.5">
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.56rem] tracking-[0.1em] uppercase text-[rgba(var(--hk-accent-rgb),0.5)]">
                    Role:
                  </span>
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[var(--hk-accent-solid)]">
                    {isLeader
                      ? "Leader"
                      : isTeamMember
                      ? "Team Member"
                      : "Registered"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
              {(isLeader || isTeamMember) && teamCode && (
                <button
                  onClick={handleTeamDashboard}
                  className={`${actionCls} bg-[rgba(var(--hk-accent-rgb),0.1)] border-[rgba(var(--hk-accent-rgb),0.3)] text-[var(--hk-accent-solid)] hover:bg-[rgba(var(--hk-accent-rgb),0.18)]`}
                >
                  Team Dashboard <ChevronRight size={13} />
                </button>
              )}
              {renderActionButton()}
              {extraAction}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              value={participantCount.toLocaleString()}
              label="Participants"
              icon={Users}
            />
            <PrizeStatCard prizes={prizes} icon={Trophy} />
            <StatCard value={timeStat.value} label={timeStat.label} icon={timeStat.icon} />
          </div>
        </div>
      </div>

      {showSubmissionModal && (
        <SubmissionForm
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          hackathonId={hackathonId}
          activeSubmissionPhase={activeSubmissionPhase}
        />
      )}
    </>
  );
};
