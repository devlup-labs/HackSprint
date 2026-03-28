import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  ThumbsUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../backendApis/api";
import SubmissionForm from "./SubmissionForm";
import { API } from "../backendApis/api";

const FontStyle = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
);

export const HeroSection = ({
  title,
  subTitle,
  isActive,
  startDate,
  endDate,
  participantCount = 0,
  rewards = [],
  prizeMoney1 = 0,
  prizeMoney2 = 0,
  prizeMoney3 = 0,
  imageUrl = "/assets/hackathon-banner.png",
  hackathonId,
  submissionStartDate,
  submissionEndDate,
  onSectionChange,
}) => {
  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(false);
  const [leaderButton, setLeaderButton] = useState(false);
  const [leaderValue, setLeaderValue] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const navigate = useNavigate();

  const isWithinRegistrationPeriod = () => {
    const now = new Date();
    return (
      startDate &&
      endDate &&
      now >= new Date(startDate) &&
      now <= new Date(endDate)
    );
  };

  const isWithinSubmissionPeriod = () => {
    const now = new Date();
    return (
      submissionStartDate &&
      submissionEndDate &&
      now >= new Date(submissionStartDate) &&
      now <= new Date(submissionEndDate)
    );
  };

  useEffect(() => {
    const fetchTeamData = async (teamId, currentUserId) => {
      try {
        if (!teamId) return;
  
        const res = await API.get(`/api/team/${teamId}`);
        const team = res.data.team;
  
        setTeamData(team);
  
        setIsTeamMember(
          team.members?.some(
            (m) => String(m._id) === String(currentUserId)
          ) || false
        );
  
      } catch (err) {
        setIsTeamMember(false);
      }
    };
  
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await getDashboard();
        const u = res.data.userData;
  
        setUserData(u);
        setIsVerified(u?.isVerified || false);
  
        const registered = Array.isArray(u.registeredHackathons)
          ? u.registeredHackathons.some(
              (o) => String(o?._id) === String(hackathonId)
            )
          : false;
  
        setRegistrationInfo(registered);
  
        const leader = u.leaderOfHackathons?.some(
          (o) => String(o?._id) === String(hackathonId)
        );
  
        setIsLeader(!!leader);
        setLeaderButton(!!leader);
  
        // ✅ CORRECT TEAM FETCH
        const teamEntry = u?.teams?.find(
          (t) => String(t.hackathon) === String(hackathonId)
        );
  
        if (teamEntry?.team) {
          await fetchTeamData(teamEntry.team, u._id);
        } else {
          setIsTeamMember(false);
          setTeamData(null); // 🔥 important
        }
  
      } catch (err) {
        setUserData(null);
        setIsVerified(false);
        setRegistrationInfo(false);
        setIsLeader(false);
        setIsTeamMember(false);
        setTeamData(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  
  }, [hackathonId]);
  
  useEffect(() => {
    if (teamData?.code) {
      setLeaderValue(teamData.code);
    } else {
      setLeaderValue("");
    }
  }, [teamData]);

  const handleRegister = () => {
    if (isVerified) navigate(`/hackathon/RegistrationForm/${hackathonId}`);
    else navigate("/account/login");
  };

  const handleLeader = () => {
    if (!leaderValue) return;
    navigate(`/hackathon/${hackathonId}/team/${leaderValue}`);
  };

  const handleSubmit = () => {
    setShowSubmissionModal(true);
  };

  const formatDateRange = (start, end) => {
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

  const getDaysRemaining = () => {
    const diff = new Date(submissionEndDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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
    if (loading || !userData)
      return (
        <Link to="/account/login">
          <button
            className={`${actionCls} bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.25)] text-[rgba(95,255,96,0.55)] hover:bg-[rgba(95,255,96,0.14)]`}
          >
            Login
          </button>
        </Link>
      );
    if (!isActive) return null;
    if (!registrationInfo) {
      if (isWithinRegistrationPeriod())
        return (
          <button
            onClick={handleRegister}
            className={`${actionCls} bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]`}
          >
            Register Now <ChevronRight size={14} />
          </button>
        );
      return (
        <button
          disabled
          className={`${actionCls} bg-[rgba(95,255,96,0.04)] border-[rgba(95,255,96,0.1)] text-[rgba(95,255,96,0.28)] cursor-not-allowed`}
        >
          Registration Closed
        </button>
      );
    }
    if (isLeader)
      return (
        <div className="relative group inline-block">
          <button
            onClick={handleSubmit}
            disabled={!isWithinSubmissionPeriod()}
            className={`${actionCls} ${
              isWithinSubmissionPeriod()
                ? "bg-[#5fff60] border-[#5fff60] text-[#050905] hover:bg-[#7fff80]"
                : "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit <ChevronRight size={14} />
          </button>

          {!isWithinSubmissionPeriod() && (
            <div
              className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
                    whitespace-nowrap text-xs bg-[#111] text-[#5fff60] 
                    px-3 py-1 rounded opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 shadow-lg"
            >
              Submission Not Open
            </div>
          )}
        </div>
      );
    if (isTeamMember)
      return (
        <button
          disabled
          className={`${actionCls} bg-[rgba(95,255,96,0.04)] border-[rgba(95,255,96,0.1)] text-[rgba(95,255,96,0.28)] cursor-not-allowed`}
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
              ? "bg-[#5fff60] border-[#5fff60] text-[#050905] hover:bg-[#7fff80]"
              : "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit <ChevronRight size={14} />
        </button>

        {!isWithinSubmissionPeriod() && (
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
                whitespace-nowrap text-xs bg-[#111] text-[#5fff60] 
                px-3 py-1 rounded opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 shadow-lg"
          >
            Submission Not Open
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ value, label, icon: Icon }) => (
    <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-4 backdrop-blur-sm hover:border-[rgba(95,255,96,0.28)] transition-all">
      <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
      <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[rgba(95,255,96,0.07)] rounded-[3px] flex items-center justify-center border border-[rgba(95,255,96,0.18)] flex-shrink-0">
          <Icon size={16} className="text-[#5fff60]" />
        </div>
        <div>
          <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl leading-tight">
            {value}
          </div>
          <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(180,220,180,0.45)] mt-0.5">
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  const PrizeStatCard = ({ rewards, prize1, prize2, prize3, icon: Icon }) => {
    const dr =
      rewards?.length > 0
        ? rewards
        : [
            prize1 > 0 ? { description: "1st", amount: prize1 } : null,
            prize2 > 0 ? { description: "2nd", amount: prize2 } : null,
            prize3 > 0 ? { description: "3rd", amount: prize3 } : null,
          ].filter(Boolean);
    const total = dr.reduce((s, r) => s + r.amount, 0);
    return (
      <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-4 backdrop-blur-sm hover:border-[rgba(95,255,96,0.28)] transition-all">
        <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
        <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[rgba(95,255,96,0.07)] rounded-[3px] flex items-center justify-center border border-[rgba(95,255,96,0.18)] flex-shrink-0">
            <Icon size={16} className="text-[#5fff60]" />
          </div>
          <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl leading-tight">
            Prize Pool
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {dr.slice(0, 4).map((r, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.45)]">
                {r.description}
              </span>
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[#5fff60] font-semibold">
                ₹{r.amount.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          {dr.length > 4 && (
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(180,220,180,0.28)]">
              +{dr.length - 4} more
            </p>
          )}
          {total > 0 && dr.length > 1 && (
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-[rgba(95,255,96,0.08)]">
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] tracking-[0.08em] uppercase text-[rgba(180,220,180,0.55)]">
                Total
              </span>
              <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[#5fff60] text-sm">
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

  return (
    <>
      <FontStyle />

      <div className="border-b border-[rgba(95,255,96,0.1)] bg-[#0a0a0a] font-[family-name:'JetBrains_Mono',monospace] overflow-hidden">
        <div className="relative w-full h-[60vh] md:h-[60vh] lg:h-[75vh] overflow-hidden">
          <img
            src={imageError ? fallbackImage : imageUrl}
            alt="Hackathon Banner"
            className="w-full h-full object-fill sm:object-fill"
            onError={() => setImageError(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.88)] via-[rgba(10,10,10,0.15)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.22)] to-transparent" />
        </div>

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-7">
          <div className="flex flex-wrap items-start gap-3 mb-5">
            <span
              className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-[2px] border ${
                isActive
                  ? "bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.25)] text-[#5fff60]"
                  : "bg-[rgba(120,120,120,0.07)] border-[rgba(120,120,120,0.2)] text-[rgba(180,180,180,0.5)]"
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-pulse" />
              )}
              {isActive ? "Active" : "Ended"}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
              {[
                ["Registration", startDate, endDate],
                ["Submission", submissionStartDate, submissionEndDate],
              ].map(([label, s, e]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.5)]"
                >
                  <Calendar
                    size={11}
                    className="text-[rgba(95,255,96,0.5)] flex-shrink-0"
                  />
                  <span className="text-[rgba(180,220,180,0.7)]">{label}:</span>
                  <span>{formatDateRange(s, e)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white leading-tight tracking-tight mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                {title}
              </h1>
              {subTitle && (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-sm text-[rgba(180,220,180,0.48)] tracking-[0.02em]">
                  {subTitle}
                </p>
              )}
              {userData && registrationInfo && (
                <div className="mt-2 inline-flex items-center gap-1.5">
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.56rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.38)]">
                    Role:
                  </span>
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[#5fff60]">
                    {isLeader
                      ? "Leader"
                      : isTeamMember
                      ? "Team Member"
                      : "Individual"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
              {leaderButton && (
                <button
                  onClick={handleLeader}
                  className={`${actionCls} bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.18)]`}
                >
                  Leader Dashboard <ChevronRight size={13} />
                </button>
              )}
              {/* {onSectionChange && (
                <button
                  onClick={() => {
                    onSectionChange("upvote");
                    setTimeout(() => {
                      document
                        .getElementById("content-section")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }, 100);
                  }}
                  className={`${actionCls} bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.18)]`}
                >
                  View Voting <ThumbsUp size={13} />
                </button>
              )} */}
              {renderActionButton()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              value={participantCount.toLocaleString()}
              label="Participants"
              icon={Users}
            />
            <PrizeStatCard
              rewards={rewards}
              prize1={prizeMoney1}
              prize2={prizeMoney2}
              prize3={prizeMoney3}
              icon={Trophy}
            />
            <StatCard
              value={isActive ? `${getDaysRemaining()} Days` : "Ended"}
              label="Time Left"
              icon={Clock}
            />
          </div>
        </div>
      </div>

      {showSubmissionModal && (
        <SubmissionForm
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
        />
      )}
    </>
  );
};
