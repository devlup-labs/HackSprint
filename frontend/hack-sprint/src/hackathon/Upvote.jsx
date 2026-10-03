import React, { useState, useEffect } from "react";
import {
  ThumbsUp,
  FileText,
  ClipboardList,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { VotingAPI } from "../api/voting.api.js";

const PAGE_SIZE = 5;

const MEDALS = {
  1: {
    emoji: "🥇",
    cls: "bg-[rgba(255,196,0,0.12)] text-[#a16207] dark:text-[#ffd700] border-[rgba(255,196,0,0.3)]",
  },
  2: {
    emoji: "🥈",
    cls: "bg-[rgba(192,192,192,0.1)] text-[#52525b] dark:text-[#c0c0c0] border-[rgba(192,192,192,0.3)]",
  },
  3: {
    emoji: "🥉",
    cls: "bg-[rgba(205,127,50,0.1)] text-[#9a3412] dark:text-[#cd7f32] border-[rgba(205,127,50,0.3)]",
  },
};

const AssetGroup = ({ icon: Icon, label, color, children }) => {
  const c = {
    blue: "text-[rgba(var(--hk-blue-rgb),0.7)]",
    violet: "text-[rgb(109,40,217)] dark:text-[rgba(167,139,250,0.7)]",
    amber: "text-[rgba(var(--hk-amber-rgb),0.7)]",
    pink: "text-[rgb(190,24,93)] dark:text-[rgba(255,100,150,0.7)]",
  }[color];
  return (
    <div>
      <div
        className={`font-[family-name:'JetBrains_Mono',monospace] flex items-center gap-1.5 text-[0.55rem] tracking-[0.14em] uppercase mb-2.5 ${c}`}
      >
        <Icon size={11} />
        {label}
      </div>
      {children}
    </div>
  );
};

const SubmissionCard = ({
  submission,
  isLiked,
  onLike,
  rank,
  isVotingClosed,
  onOpenSubmission,
  canVote,
  phases,
  fullData,
  loadingFull,
}) => {
  const [expanded, setExpanded] = useState(false);
  const name =
    submission.team?.name || submission.participant?.name || "Anonymous";
  const isTeam = !!submission.team;
  const medal = MEDALS[rank];

  const phase = fullData
    ? phases.find((p) => String(p._id) === String(fullData.phaseId))
    : null;
  const fields = phase?.submissionForm || [];
  const submissionData = fullData?.submissionData || {};

  const handleVote = () => {
    if (isVotingClosed) {
      toast("Voting period has ended.", { icon: "ℹ️" });
      return;
    }
    if (!localStorage.getItem("token")) {
      toast("Please log in to vote.", { icon: "ℹ️", duration: 1300 });
      return;
    }
    if (!isLiked && !canVote) {
      toast("Open the submission first to vote for it.", {
        icon: "ℹ️",
        duration: 1300,
      });
      return;
    }
    onLike(submission._id);
  };

  return (
    <div className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px] overflow-hidden hover:border-[rgba(var(--hk-accent-rgb),0.28)] transition-all">
      <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-card-border-rgb),0.56)] dark:border-[rgba(var(--hk-card-border-rgb),0.35)]" />
      <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(var(--hk-card-border-rgb),0.56)] dark:border-[rgba(var(--hk-card-border-rgb),0.35)]" />

      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.07)]">
        <div className="flex items-start gap-3">
          <div
            className={`font-[family-name:'JetBrains_Mono',monospace] w-9 h-9 rounded-[3px] border flex items-center justify-center text-sm flex-shrink-0 ${
              medal?.cls ||
              "bg-[rgba(var(--hk-accent-rgb),0.05)] text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)]"
            }`}
          >
            {medal ? medal.emoji : `#${rank}`}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {isTeam ? (
                <Users
                  size={12}
                  className="text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] flex-shrink-0"
                />
              ) : (
                <User
                  size={12}
                  className="text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] flex-shrink-0"
                />
              )}
              <h3 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-base tracking-tight">
                {name}
              </h3>
            </div>
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.07em] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
              {isTeam ? "Team Submission" : "Individual Submission"}
            </p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-accent-solid)] text-base">
                {submission.voteCount || 0}
              </span>
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.5rem] tracking-[0.1em] uppercase text-[rgba(var(--hk-accent-rgb),0.65)] dark:text-[rgba(var(--hk-accent-rgb),0.35)]">
                {submission.voteCount === 1 ? "vote" : "votes"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={isVotingClosed}
          className={`
            font-[family-name:'JetBrains_Mono',monospace]
            inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.08em] uppercase
            px-3 py-2 rounded-[3px] border transition-all duration-150
            ${
              isVotingClosed
                ? "bg-transparent border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.07)] text-[rgba(var(--hk-accent-rgb),0.5)] dark:text-[rgba(var(--hk-accent-rgb),0.2)] cursor-not-allowed"
                : isLiked
                ? "bg-[rgba(var(--hk-accent-rgb),0.12)] border-[rgba(var(--hk-card-border-rgb),0.56)] dark:border-[rgba(var(--hk-card-border-rgb),0.35)] text-[var(--hk-accent-solid)] cursor-pointer"
                : "bg-transparent border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] cursor-pointer hover:bg-[rgba(var(--hk-accent-rgb),0.08)] hover:border-[rgba(var(--hk-accent-rgb),0.3)] hover:text-[var(--hk-accent-solid)]"
            }
          `}
        >
          <ThumbsUp size={12} className={isLiked ? "fill-current" : ""} />
          {isLiked ? "Liked" : "Like"}
        </button>
      </div>

      <button
        onClick={() => {
          setExpanded((v) => !v);
          onOpenSubmission(submission._id);
        }}
        className="w-full flex items-center justify-between px-5 py-3 cursor-pointer group hover:bg-[rgba(var(--hk-accent-rgb),0.03)] transition-colors"
      >
        <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)] tracking-[0.04em]">
          View submission
        </span>
        {expanded ? (
          <ChevronUp
            size={13}
            className="text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)] group-hover:text-[var(--hk-accent-solid)] transition-colors"
          />
        ) : (
          <ChevronDown
            size={13}
            className="text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)] group-hover:text-[var(--hk-accent-solid)] transition-colors"
          />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-4 flex flex-col gap-4 border-t border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.07)]">
          {submission.description && (
            <AssetGroup icon={ClipboardList} label="Description" color="blue">
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.6)] leading-relaxed whitespace-pre-wrap">
                {submission.description}
              </p>
            </AssetGroup>
          )}

          {loadingFull ? (
            <div className="flex items-center gap-2 text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
              <Loader2 size={13} className="animate-spin" />
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem]">
                Loading submission details…
              </span>
            </div>
          ) : (
            fields.map((field) => {
              const value = submissionData[field.fieldName];
              if (value === undefined || value === null || value === "")
                return null;

              const isFileField =
                field.fieldType !== "TEXT" &&
                field.fieldType !== "TEXTAREA" &&
                field.fieldType !== "URL";
              const files = isFileField
                ? Array.isArray(value)
                  ? value
                  : [value]
                : [];

              return (
                <AssetGroup
                  key={field.fieldName}
                  icon={FileText}
                  label={field.label}
                  color="violet"
                >
                  {isFileField ? (
                    <div className="flex flex-col gap-1.5">
                      {files.map((f, i) => (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[0.68rem] text-[var(--hk-accent-solid)] hover:underline"
                        >
                          <ExternalLink size={11} className="flex-shrink-0" />
                          <span className="truncate">
                            {f.originalName || "View file"}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : field.fieldType === "URL" ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[0.68rem] text-[var(--hk-accent-solid)] hover:underline break-all"
                    >
                      <ExternalLink size={11} className="flex-shrink-0" />
                      {value}
                    </a>
                  ) : (
                    <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.6)] leading-relaxed whitespace-pre-wrap break-words">
                      {value}
                    </p>
                  )}
                </AssetGroup>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const btnBase =
    "font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] tracking-[0.06em] uppercase border rounded-[3px] transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} flex items-center gap-1 px-3 py-2 border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] hover:border-[rgba(var(--hk-accent-rgb),0.35)] hover:text-[var(--hk-accent-solid)]`}
      >
        <ChevronDown size={11} className="rotate-90" /> Prev
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`e-${i}`}
            className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(var(--hk-accent-rgb),0.55)] dark:text-[rgba(var(--hk-accent-rgb),0.25)] px-1"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${btnBase} w-8 h-8 flex items-center justify-center
              ${
                page === currentPage
                  ? "bg-[rgba(var(--hk-accent-rgb),0.12)] border-[rgba(var(--hk-card-border-rgb),0.56)] dark:border-[rgba(var(--hk-card-border-rgb),0.35)] text-[var(--hk-accent-solid)]"
                  : "border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)] hover:border-[rgba(var(--hk-accent-rgb),0.28)] hover:text-[var(--hk-accent-solid)]"
              }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} flex items-center gap-1 px-3 py-2 border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] hover:border-[rgba(var(--hk-accent-rgb),0.35)] hover:text-[var(--hk-accent-solid)]`}
      >
        Next <ChevronDown size={11} className="-rotate-90" />
      </button>
    </div>
  );
};

const Upvote = ({ hackathonId, phases = [] }) => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [likedSubmissions, setLikedSubmissions] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [openedSubmissions, setOpenedSubmissions] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isVotingClosed, setIsVotingClosed] = useState(false);
  const [fullSubmissions, setFullSubmissions] = useState({});
  const [loadingFullIds, setLoadingFullIds] = useState(new Set());

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchSubmissions();
  }, [hackathonId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await VotingAPI.getVotingSubmissions(hackathonId);
      setSubmissions(res.data.submissions || []);
      setIsVotingClosed(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsVotingClosed(true);
        setSubmissions([]);
      } else {
        toast.error("Failed to load submissions");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmission = async (submissionId) => {
    setOpenedSubmissions((prev) => new Set(prev).add(submissionId));
    if (fullSubmissions[submissionId] || loadingFullIds.has(submissionId))
      return;
    setLoadingFullIds((prev) => new Set(prev).add(submissionId));
    try {
      const res = await VotingAPI.getVotingSubmission(submissionId);
      setFullSubmissions((prev) => ({
        ...prev,
        [submissionId]: res.data.submission,
      }));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load submission details"
      );
    } finally {
      setLoadingFullIds((prev) => {
        const n = new Set(prev);
        n.delete(submissionId);
        return n;
      });
    }
  };

  const handleLike = async (submissionId) => {
    if (!isLoggedIn) {
      toast("Please log in to vote.", { icon: "ℹ️" });
      return;
    }
    try {
      const res = await VotingAPI.toggleVote(submissionId);
      const { voted, voteCount } = res.data;
      setLikedSubmissions((prev) => {
        const n = new Set(prev);
        voted ? n.add(submissionId) : n.delete(submissionId);
        return n;
      });
      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? { ...s, voteCount } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update vote.");
    }
  };

  const sorted = [...submissions]
    .filter((s) =>
      (s.team?.name || s.participant?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] border-t-[var(--hk-accent-solid)] animate-spin" />
        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] tracking-[0.08em] uppercase text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
          Loading submissions…
        </p>
      </div>
    );

  if (submissions.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="relative w-12 h-12 rounded-[3px] bg-[rgba(var(--hk-accent-rgb),0.05)] border border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] flex items-center justify-center">
          <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-card-border-rgb),0.48)] dark:border-[rgba(var(--hk-card-border-rgb),0.3)]" />
          <FileText size={20} className="text-[rgba(var(--hk-accent-rgb),0.5)] dark:text-[rgba(var(--hk-accent-rgb),0.2)]" />
        </div>
        <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-sm tracking-tight">
          No submissions yet
        </p>
        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
          Check back once the event is underway.
        </p>
      </div>
    );

  return (
    <>
      <div className="font-[family-name:'JetBrains_Mono',monospace]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-2xl tracking-tight">
              Community Submissions
            </h2>
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] mt-1 tracking-[0.04em]">
              {submissions.length}{" "}
              {submissions.length === 1 ? "submission" : "submissions"} ·{" "}
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate("/account/login")}
                  className="text-[var(--hk-accent-solid)] hover:text-[var(--hk-accent-solid)] underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Log in to vote
                </button>
              ) : (
                "Vote for your favourites"
              )}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[0.55rem] tracking-[0.08em] uppercase text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--hk-accent-solid)]" />
              Liked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--hk-accent-rgb),0.2)]" />
              Not voted
            </span>
          </div>
        </div>

        {isVotingClosed && (
          <div className="mb-5 relative bg-[rgba(var(--hk-red-rgb),0.06)] border border-[rgba(var(--hk-red-rgb),0.25)] rounded-[4px] px-5 py-4 flex items-center justify-between">
            <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-red-rgb),0.4)]" />
            <div>
              <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-[rgb(var(--hk-red-rgb))] text-sm">
                Voting has ended
              </p>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(255,150,150,0.45)] mt-0.5">
                The community voting period is now closed.
              </p>
            </div>
            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.1em] uppercase px-2 py-1 rounded-[2px] bg-[rgba(var(--hk-red-rgb),0.1)] border border-[rgba(var(--hk-red-rgb),0.25)] text-[rgba(255,100,100,0.7)]">
              Closed
            </span>
          </div>
        )}

        <div className="mb-5">
          <div className="relative max-w-sm">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(var(--hk-accent-rgb),0.65)] dark:text-[rgba(var(--hk-accent-rgb),0.35)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by team or name…"
              className="font-[family-name:'JetBrains_Mono',monospace] w-full pl-9 pr-9 py-2 text-[0.65rem] tracking-[0.03em] bg-[rgba(var(--hk-card-bg),0.7)] border border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-[3px] text-[var(--hk-text)] placeholder-[rgba(var(--hk-accent-rgb),0.52)] dark:placeholder-[rgba(var(--hk-accent-rgb),0.22)] focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.38)] focus:shadow-[0_0_0_2px_rgba(var(--hk-accent-rgb),0.05)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(var(--hk-accent-rgb),0.65)] dark:text-[rgba(var(--hk-accent-rgb),0.35)] hover:text-[var(--hk-accent-solid)] transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)] mt-1.5">
              <span className="text-[var(--hk-accent-solid)]">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "result" : "results"} for "{searchQuery}"
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-4">
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
              Showing{" "}
              <span className="text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.65)]">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, sorted.length)}
              </span>{" "}
              of{" "}
              <span className="text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.65)]">
                {sorted.length}
              </span>
            </p>
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
              Page{" "}
              <span className="text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.65)]">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.65)]">
                {totalPages}
              </span>
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {paginated.map((sub, i) => (
            <SubmissionCard
              key={sub._id}
              submission={sub}
              isVotingClosed={isVotingClosed}
              canVote={openedSubmissions.has(sub._id)}
              onOpenSubmission={handleOpenSubmission}
              phases={phases}
              fullData={fullSubmissions[sub._id]}
              loadingFull={loadingFullIds.has(sub._id)}
              isLiked={likedSubmissions.has(sub._id)}
              onLike={handleLike}
              rank={(currentPage - 1) * PAGE_SIZE + i + 1}
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
};

export default Upvote;
