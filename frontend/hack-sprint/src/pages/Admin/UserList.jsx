import React, { useState, useEffect, useMemo } from "react";
import { confirmAction } from "../../utils/dialogs.js";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Shield,
  Trophy,
  X,
  Gavel,
  Plus,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
  Send,
  Layers,
  Clock,
  Swords,
} from "lucide-react";
import { HackathonAPI } from "../../api/hackathon.api.js";
import { JudgeAPI } from "../../api/judge.api.js";
import { AdminAPI } from "../../api/admin.api.js";
import MatchManagement from "./MatchManagement.jsx";
import "./UserList.css";
import "../Styles/AllHackathons.css";

const PAGE_SIZE = 10;

const GridBackground = () => <div className="hu-bg" />;

const FilterButtons = ({ value, onChange }) => (
  <div className="hu-filters">
    {["all", "submitted", "not_submitted"].map((type) => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`hu-filter-btn ${
          value === type ? "hu-filter-btn--active" : "hu-filter-btn--inactive"
        }`}
      >
        {type.replace("_", " ")}
      </button>
    ))}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="hu-empty">
    <Users size={40} />
    <span>{message}</span>
  </div>
);

const SubmissionBadge = ({ submitted }) =>
  submitted ? (
    <span className="hu-badge hu-badge--submitted">
      <CheckCircle size={11} /> Submitted
    </span>
  ) : (
    <span className="hu-badge hu-badge--not">
      <XCircle size={11} /> Not Submitted
    </span>
  );

// The judge's own progress on a team / participant / single submission, so it
// is obvious what they've already scored without opening each one.
const ReviewBadge = ({ review, hasSubmitted = true }) => {
  if (!review || !hasSubmitted) return null;
  const total = review.total ?? 1;
  const done = review.total !== undefined ? review.reviewed : review.reviewed ? 1 : 0;
  if (total === 0) return null;
  if (done >= total)
    return (
      <span className="hu-badge hu-badge--reviewed">
        <CheckCircle size={11} /> You reviewed{review.score !== undefined ? ` · ${review.score}` : ""}
      </span>
    );
  if (done > 0)
    return <span className="hu-badge hu-badge--partial">Reviewed {done}/{total}</span>;
  return <span className="hu-badge hu-badge--todo">To review</span>;
};

const QualificationBadge = ({ status }) => {
  if (status === "QUALIFIED") {
    return (
      <span className="hu-badge hu-badge--submitted">
        <CheckCircle size={11} /> Qualified
      </span>
    );
  }
  if (status === "ELIMINATED") {
    return (
      <span className="hu-badge hu-badge--not">
        <XCircle size={11} /> Not Advancing
      </span>
    );
  }
  return (
    <span className="hu-badge">
      <Clock size={11} /> Pending
    </span>
  );
};

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="hu-pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="hu-page-btn"
      >
        <ChevronLeft size={13} />
      </button>
      <span className="hu-page-label">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="hu-page-btn"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  );
};

/* ── Excel export ── */
const exportParticipantsToExcel = (hackathon, teams, individualParticipants) => {
  const title = hackathon.title || "Event";
  const wb = XLSX.utils.book_new();

  if (teams.length > 0) {
    const rows = teams.map((team, i) => ({
      "#": i + 1,
      "Team Name": team.name,
      Leader: team.leader?.name || "",
      "Leader Email": team.leader?.email || "",
      Members: (team.members || []).map((m) => m.name).join(", "),
      "Member Count": (team.members || []).length,
      Submission: team.hasSubmitted ? "Submitted" : "Not Submitted",
      "Registered At": team.createdAt
        ? new Date(team.createdAt).toLocaleString("en-IN")
        : "",
    }));
    const ws = XLSX.utils.aoa_to_sheet([[`${title} — Teams`], []]);
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A3" });
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    ws["!cols"] = [
      { wch: 4 }, { wch: 24 }, { wch: 20 }, { wch: 26 },
      { wch: 34 }, { wch: 12 }, { wch: 14 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Teams");
  }

  if (individualParticipants.length > 0) {
    const rows = individualParticipants.map((p, i) => ({
      "#": i + 1,
      Name: p.user?.name || "",
      Email: p.user?.email || "",
      Submission: p.hasSubmitted ? "Submitted" : "Not Submitted",
      "Registered At": p.createdAt
        ? new Date(p.createdAt).toLocaleString("en-IN")
        : "",
    }));
    const ws = XLSX.utils.aoa_to_sheet([[`${title} — Individual Participants`], []]);
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A3" });
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    ws["!cols"] = [{ wch: 4 }, { wch: 24 }, { wch: 28 }, { wch: 14 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Individual Participants");
  }

  if (wb.SheetNames.length === 0) {
    toast.error("No participants to export yet.");
    return;
  }

  const safeName = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  XLSX.writeFile(wb, `${safeName || "hackathon"}-participants.xlsx`);
  toast.success("Exported to Excel.");
};

// One row per team/participant, ranked by final score, with one column per
// submission round — not just the overall total — since organizers usually
// want to see round-by-round performance, not just who won.
const exportResultsToExcel = (hackathon, results) => {
  if (!results || results.length === 0) {
    toast.error("No results to export yet.");
    return;
  }

  const title = hackathon.title || "Event";

  // Canonical round order/names come from the hackathon's own phase list,
  // not from whatever order happens to show up in the results — otherwise
  // column order could vary depending on who submitted what.
  const roundNames = (hackathon.phases || [])
    .filter((p) => p.phaseType === "SUBMISSION")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map((p) => p.phaseName);

  const rows = results.map((entity, i) => {
    const name = entity.team?.name || entity.participant?.name || "Unknown";
    const email = entity.participant?.email || "";

    const row = {
      Rank: i + 1,
      Name: name,
      Email: email,
      "Final Score": entity.finalScore != null ? Number(entity.finalScore.toFixed(2)) : 0,
    };

    roundNames.forEach((roundName) => {
      const roundScore = entity.phaseScores?.find((ps) => ps.phaseName === roundName);
      row[roundName] = roundScore?.averageScore != null
        ? Number(roundScore.averageScore.toFixed(2))
        : roundScore
        ? "Not scored"
        : "—";
    });

    row["Submitted At"] = entity.submittedAt
      ? new Date(entity.submittedAt).toLocaleString("en-IN")
      : "";

    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([[`${title} — Results & Scores`], []]);
  XLSX.utils.sheet_add_json(ws, rows, { origin: "A3" });
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 + roundNames.length } }];
  ws["!cols"] = [
    { wch: 6 }, { wch: 24 }, { wch: 28 }, { wch: 12 },
    ...roundNames.map(() => ({ wch: 16 })),
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Results");

  const safeName = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  XLSX.writeFile(wb, `${safeName || "hackathon"}-results.xlsx`);
  toast.success("Exported to Excel.");
};

const JudgesSection = ({ hackathonId }) => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  const loadJudges = async () => {
    try {
      setLoading(true);
      const res = await JudgeAPI.getHackathonJudges(hackathonId);
      setJudges(res.data.judges || []);
    } catch {
      toast.error("Could not load judges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJudges();
  }, [hackathonId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAssigning(true);
    try {
      const lookupRes = await AdminAPI.lookupAdminByEmail(email.trim());
      const judge = lookupRes.data.admin;
      await JudgeAPI.assignJudge(hackathonId, { judgeId: judge._id });
      toast.success(`Invitation sent to ${judge.adminName}. They become a judge once they accept.`);
      setEmail("");
      loadJudges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send the invitation.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (judgeId, name) => {
    if (!judgeId) { toast.error("This judge's account no longer exists."); return; }
    if (!(await confirmAction({ title: `Remove ${name || "this judge"}?`, message: "They're removed from this event's judges, and any pending invitation is cancelled.", confirmLabel: "Remove", danger: true }))) return;
    try {
      await JudgeAPI.removeJudge(hackathonId, judgeId);
      toast.success("Judge removed.");
      setJudges((prev) => prev.filter((j) => j.judge?._id !== judgeId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove judge.");
    }
  };

  return (
    <div className="hu-card">
      <div className="hu-section-title">
        <Gavel size={16} />
        Judges
        <span className="hu-section-count">({judges.filter((j) => j.status === "ACCEPTED").length} active)</span>
      </div>

      <form onSubmit={handleAssign} className="hu-assign-row">
        <div className="hu-assign-input-wrap">
          <Mail size={13} className="hu-assign-input-icon" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin's email address"
            className="hu-assign-input"
          />
        </div>
        <button type="submit" disabled={assigning || !email.trim()} className="hu-assign-btn">
          <Plus size={13} /> {assigning ? "Sending…" : "Invite as judge"}
        </button>
      </form>

      {loading ? (
        <div className="hu-empty">
          <div className="hu-spinner" />
          <span>Loading judges…</span>
        </div>
      ) : judges.length > 0 ? (
        <div className="hu-judge-list">
          {judges.map((j) => (
            <div key={j._id} className="hu-judge-row">
              <div className="hu-judge-avatar">
                {j.judge?.avatar ? (
                  <img src={j.judge.avatar} alt="" />
                ) : (
                  <Gavel size={14} />
                )}
              </div>
              <div className="hu-judge-info">
                <div className="hu-judge-name">{j.judge?.adminName || "Unknown"}</div>
                <div className="hu-judge-email">{j.judge?.email}</div>
              </div>
              <div className="hu-judge-meta">
                <span
                  style={{
                    display: "inline-block", marginRight: 8, padding: "1px 8px", borderRadius: 99, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid currentColor",
                    color: j.status === "ACCEPTED" ? "var(--green)" : j.status === "DECLINED" ? "var(--red)" : "var(--amber)",
                  }}
                >
                  {j.status === "ACCEPTED" ? "Accepted" : j.status === "DECLINED" ? "Declined" : "Awaiting reply"}
                </span>
                Invited by {j.assignedBy?.adminName || "—"}
                {j.createdAt ? ` · ${new Date(j.createdAt).toLocaleDateString("en-IN")}` : ""}
              </div>
              <button
                onClick={() => handleRemove(j.judge?._id, j.judge?.adminName)}
                className="hu-judge-remove"
                title="Remove judge"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No judges yet. Invite an admin by email — they'll get a notification and become a judge only if they accept." />
      )}
    </div>
  );
};

const HackathonUsersPage = () => {
  const { slug: hackathonId } = useParams();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState(null);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [releasingResults, setReleasingResults] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");

  const [teamFilter, setTeamFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [teamSearch, setTeamSearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [teamPage, setTeamPage] = useState(1);
  const [participantPage, setParticipantPage] = useState(1);

  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [phaseData, setPhaseData] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(false);
  const [concluding, setConcluding] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await HackathonAPI.getHackathonAdminOverview(hackathonId);
        setOverview(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/adminlogin");
          return;
        }
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hackathonId, navigate]);

  const isJudgeViewer = overview?.viewerRole === "judge";
  const hackathon = overview?.hackathon;
  const teams = useMemo(() => overview?.teams || [], [overview]);
  const individualParticipants = useMemo(
    () => overview?.individualParticipants || [],
    [overview]
  );

  const goToTeamSubmission = (teamId) => {
    navigate(`/admin/hackathon/${hackathon._id}/submission/team/${teamId}`);
  };

  const goToParticipantSubmission = (userId) => {
    if (!userId) return;
    navigate(`/admin/hackathon/${hackathon._id}/submission/participant/${userId}`);
  };

  const submissionPhases = useMemo(
    () => (hackathon?.phases || []).filter((p) => p.phaseType === "SUBMISSION"),
    [hackathon]
  );

  const isOnSpot = hackathon?.eventFormat === "ON_SPOT";

  const matchPhases = useMemo(
    () => (hackathon?.phases || []).filter((p) => p.phaseType === "MATCH_ROUND"),
    [hackathon]
  );

  useEffect(() => {
    if (isOnSpot && activeTab === "participants") {
      setActiveTab("matches");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnSpot]);

  const loadPhaseSubmissions = async (phaseId) => {
    setSelectedPhaseId(phaseId);
    setLoadingPhase(true);
    try {
      const res = await HackathonAPI.getPhaseSubmissions(hackathon._id, phaseId);
      setPhaseData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load round submissions");
      setPhaseData(null);
    } finally {
      setLoadingPhase(false);
    }
  };

  useEffect(() => {
    if (activeTab === "rounds" && submissionPhases.length && !selectedPhaseId) {
      loadPhaseSubmissions(submissionPhases[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, submissionPhases]);

  const handleConcludeRound = async () => {
    if (!selectedPhaseId) return;
    if (!(await confirmAction({ title: "Conclude this round?", message: "This applies the round's qualification rule and notifies everyone whose status changes. You can still override individual results afterwards.", confirmLabel: "Conclude round" }))) return;

    setConcluding(true);
    try {
      const res = await HackathonAPI.concludeRound(hackathon._id, selectedPhaseId);
      toast.success(
        `Round concluded — ${res.data.qualifiedCount} qualified, ${res.data.eliminatedCount} not advancing.` +
          (res.data.manualCount
            ? ` ${res.data.manualCount} set by hand were left as you set them.`
            : "") +
          (res.data.unreviewedCount
            ? ` (${res.data.unreviewedCount} submission(s) had no reviews.)`
            : "")
      );
      loadPhaseSubmissions(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to conclude round");
    } finally {
      setConcluding(false);
    }
  };

  const handleOverrideQualification = async (submissionId, status) => {
    try {
      await HackathonAPI.overrideQualification(hackathon._id, submissionId, status);
      toast.success("Qualification status updated");
      loadPhaseSubmissions(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      if (teamFilter === "submitted" && !team.hasSubmitted) return false;
      if (teamFilter === "not_submitted" && team.hasSubmitted) return false;
      if (teamSearch.trim()) {
        const q = teamSearch.toLowerCase();
        const nameMatch = team.name?.toLowerCase().includes(q);
        const leaderMatch = team.leader?.name?.toLowerCase().includes(q);
        const memberMatch = team.members?.some((m) => m.name?.toLowerCase().includes(q));
        if (!nameMatch && !leaderMatch && !memberMatch) return false;
      }
      return true;
    });
  }, [teams, teamFilter, teamSearch]);

  const filteredParticipants = useMemo(() => {
    return individualParticipants.filter((p) => {
      if (participantFilter === "submitted" && !p.hasSubmitted) return false;
      if (participantFilter === "not_submitted" && p.hasSubmitted) return false;
      if (participantSearch.trim()) {
        const q = participantSearch.toLowerCase();
        const nameMatch = p.user?.name?.toLowerCase().includes(q);
        const emailMatch = p.user?.email?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }
      return true;
    });
  }, [individualParticipants, participantFilter, participantSearch]);

  useEffect(() => setTeamPage(1), [teamSearch, teamFilter]);
  useEffect(() => setParticipantPage(1), [participantSearch, participantFilter]);

  const teamTotalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));
  const participantTotalPages = Math.max(1, Math.ceil(filteredParticipants.length / PAGE_SIZE));
  const pagedTeams = filteredTeams.slice((teamPage - 1) * PAGE_SIZE, teamPage * PAGE_SIZE);
  const pagedParticipants = filteredParticipants.slice(
    (participantPage - 1) * PAGE_SIZE,
    participantPage * PAGE_SIZE
  );

  const openScoreboard = async () => {
    setShowScoreboard(true);
    try {
      const res = await HackathonAPI.getAdminResults(hackathon._id);
      setResult(res.data.results || []);
    } catch {
      setResult([]);
    }
  };

  const handleReleaseResults = async () => {
    if (!(await confirmAction({ title: "Release results now?", message: "Every reviewed team or participant will immediately see their score and feedback, and be notified. This can't be undone.", confirmLabel: "Release results", danger: true }))) return;

    setReleasingResults(true);
    try {
      const res = await HackathonAPI.releaseResults(hackathon._id);
      toast.success(
        `Results released — ${res.data.notifiedCount ?? 0} people notified.`
      );
      setOverview((prev) =>
        prev ? { ...prev, hackathon: { ...prev.hackathon, showResult: true } } : prev
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to release results."
      );
    } finally {
      setReleasingResults(false);
    }
  };

  if (loading) {
    return (
      <div className="hu-loading">
        <div className="hu-spinner" />
        <p>Loading participants…</p>
      </div>
    );
  }

  if (notFound || !hackathon) {
    return (
      <div className="hu-notfound">
        <div>
          <h1>Event Not Found</h1>
          <Link to="/admin">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const rankClass = (idx) => {
    if (idx === 0) return { row: "hu-score-row--1", rank: "hu-score-rank--1" };
    if (idx === 1) return { row: "hu-score-row--2", rank: "hu-score-rank--2" };
    if (idx === 2) return { row: "hu-score-row--3", rank: "hu-score-rank--3" };
    return { row: "hu-score-row--rest", rank: "hu-score-rank--rest" };
  };

  return (
    <div className="hu-root">
      <GridBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(1.25rem, 4vw, 2.5rem)",
        }}
      >
        <header style={{ marginBottom: "1.75rem" }}>
          <Link to="/admin" className="hu-back">
            <ArrowLeft size={13} /> Back to Dashboard
          </Link>

          <h1 className="hu-page-title">{hackathon.title}</h1>

          <div className="hu-stats-row">
            <span className="hu-page-badge">
              <Users size={11} /> {overview.totalRegistrations} registered
            </span>
            <span className="hu-page-badge">
              <Shield size={11} /> {overview.totalTeams} teams
            </span>
            {!isOnSpot && (
              <span className="hu-page-badge">
                <Trophy size={11} /> {overview.totalSubmissions} submissions
              </span>
            )}
          </div>

          <div className="hu-tabs">
            {!isOnSpot && (
              <button
                onClick={() => setActiveTab("participants")}
                className={`hu-tab ${
                  activeTab === "participants" ? "hu-tab--active" : "hu-tab--inactive"
                }`}
              >
                <Users size={13} /> Participants
              </button>
            )}
            {!isJudgeViewer && (
              <button
                onClick={() => setActiveTab("judges")}
                className={`hu-tab ${
                  activeTab === "judges" ? "hu-tab--active" : "hu-tab--inactive"
                }`}
              >
                <Gavel size={13} /> Judges
              </button>
            )}
            {!isOnSpot && submissionPhases.length > 1 && (
              <button
                onClick={() => setActiveTab("rounds")}
                className={`hu-tab ${
                  activeTab === "rounds" ? "hu-tab--active" : "hu-tab--inactive"
                }`}
              >
                <Layers size={13} /> Rounds
              </button>
            )}
            {isOnSpot && (
              <button
                onClick={() => setActiveTab("matches")}
                className={`hu-tab ${
                  activeTab === "matches" ? "hu-tab--active" : "hu-tab--inactive"
                }`}
              >
                <Swords size={13} /> Matches
              </button>
            )}
          </div>

          {activeTab === "participants" && (
            <div className="hu-header-actions">
              <button onClick={openScoreboard} className="hu-results-btn">
                <Trophy size={13} /> View Results
              </button>
              <button
                onClick={() =>
                  exportParticipantsToExcel(hackathon, teams, individualParticipants)
                }
                className="hu-export-btn"
              >
                <Download size={13} /> Export to Excel
              </button>
            </div>
          )}
        </header>

        <main style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {activeTab === "participants" && (
            <>
              <div className="hu-card">
                <div className="hu-section-title">
                  <Shield size={16} />
                  Teams
                  <span className="hu-section-count">
                    ({filteredTeams.length}
                    {teamSearch.trim() || teamFilter !== "all" ? ` of ${teams.length}` : ""})
                  </span>
                </div>

                <input
                  className="hu-search"
                  placeholder="Search by team name or member…"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                />
                <FilterButtons value={teamFilter} onChange={setTeamFilter} />

                <div className="hu-table-wrap">
                  <div className="hu-table-scroll">
                    <table className="hu-table">
                      <thead>
                        <tr>
                          <th>Team Name</th>
                          <th>Members</th>
                          <th className="center">Submission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedTeams.map((team) => (
                          <tr
                            key={team._id}
                            onClick={() => goToTeamSubmission(team._id)}
                            className="clickable"
                          >
                            <td className="hu-td-name">{team.name}</td>
                            <td>
                              {team.leader && (
                                <div className="hu-leader">
                                  <Shield size={11} style={{ color: "var(--amber)" }} />
                                  {team.leader.name}
                                  <span
                                    style={{
                                      fontSize: "0.58rem",
                                      color: "var(--amber)",
                                      opacity: 0.7,
                                    }}
                                  >
                                    (Leader)
                                  </span>
                                </div>
                              )}
                              {(team.members || [])
                                .filter((m) => m._id !== team.leader?._id)
                                .map((member) => (
                                  <div key={member._id} className="hu-member">
                                    {member.name}
                                  </div>
                                ))}
                            </td>
                            <td className="hu-td-center">
                              <div className="hu-badge-stack">
                                <SubmissionBadge submitted={team.hasSubmitted} />
                                <ReviewBadge review={team.myReview} hasSubmitted={team.hasSubmitted} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredTeams.length === 0 && (
                      <EmptyState
                        message={
                          teamSearch.trim()
                            ? `No teams match "${teamSearch}".`
                            : "No teams match this filter."
                        }
                      />
                    )}
                  </div>
                </div>
                <Pagination page={teamPage} totalPages={teamTotalPages} onChange={setTeamPage} />
              </div>

              <div className="hu-card">
                <div className="hu-section-title">
                  <Users size={16} />
                  Individual Participants
                  <span className="hu-section-count">
                    ({filteredParticipants.length}
                    {participantSearch.trim() || participantFilter !== "all"
                      ? ` of ${individualParticipants.length}`
                      : ""}
                    )
                  </span>
                </div>

                <input
                  className="hu-search"
                  placeholder="Search by name or email…"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                />
                <FilterButtons value={participantFilter} onChange={setParticipantFilter} />

                <div className="hu-table-wrap">
                  <div className="hu-table-scroll">
                    <table className="hu-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th className="center">Submission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedParticipants.map((participant) => (
                          <tr
                            key={participant._id}
                            onClick={() => goToParticipantSubmission(participant.user?._id)}
                            className="clickable"
                          >
                            <td className="hu-td-name">{participant.user?.name || "N/A"}</td>
                            <td className="hu-td-muted">{participant.user?.email || "N/A"}</td>
                            <td className="hu-td-center">
                              <div className="hu-badge-stack">
                                <SubmissionBadge submitted={participant.hasSubmitted} />
                                <ReviewBadge review={participant.myReview} hasSubmitted={participant.hasSubmitted} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredParticipants.length === 0 && (
                      <EmptyState
                        message={
                          participantSearch.trim()
                            ? `No participants match "${participantSearch}".`
                            : "No participants match this filter."
                        }
                      />
                    )}
                  </div>
                </div>
                <Pagination
                  page={participantPage}
                  totalPages={participantTotalPages}
                  onChange={setParticipantPage}
                />
              </div>
            </>
          )}

          {activeTab === "judges" && !isJudgeViewer && (
            <JudgesSection hackathonId={hackathon._id} canManage={overview.viewerRole !== "judge"} />
          )}

          {activeTab === "rounds" && (
            <div className="hu-card">
              <div className="hu-filters" style={{ marginBottom: "0.75rem" }}>
                {submissionPhases.map((phase) => (
                  <button
                    key={phase._id}
                    onClick={() => loadPhaseSubmissions(phase._id)}
                    className={`hu-filter-btn ${
                      selectedPhaseId === phase._id
                        ? "hu-filter-btn--active"
                        : "hu-filter-btn--inactive"
                    }`}
                  >
                    {phase.phaseName}
                  </button>
                ))}
              </div>

              {loadingPhase ? (
                <div style={{ padding: "1.5rem", textAlign: "center" }}>Loading…</div>
              ) : !phaseData ? (
                <EmptyState message="Select a round to view its submissions." />
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span className="hu-page-badge">
                      Rule:{" "}
                      {phaseData.phase.qualificationRule?.type === "TOP_N"
                        ? `Top ${phaseData.phase.qualificationRule.value} advance`
                        : phaseData.phase.qualificationRule?.type === "THRESHOLD"
                        ? `Score ≥ ${phaseData.phase.qualificationRule.value} advances`
                        : "None configured — everyone advances"}
                    </span>
                    {!isJudgeViewer && (
                      <button
                        onClick={handleConcludeRound}
                        disabled={concluding}
                        className="hu-results-btn"
                      >
                        <Layers size={13} />{" "}
                        {phaseData.phase.concludedAt
                          ? concluding
                            ? "Re-running…"
                            : "Re-run Conclude Round"
                          : concluding
                          ? "Concluding…"
                          : "Conclude Round"}
                      </button>
                    )}
                  </div>

                  <div className="hu-table-wrap">
                    <div className="hu-table-scroll">
                      <table className="hu-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th className="center">Score</th>
                            {phaseData.canScore && <th className="center">Your review</th>}
                            <th className="center">Status</th>
                            {!isJudgeViewer && <th className="center">Override</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {phaseData.submissions.map((submission) => (
                            <tr key={submission._id}>
                              <td className="hu-td-name">
                                {submission.team?.name || submission.participant?.name || "N/A"}
                              </td>
                              <td className="hu-td-center">
                                {submission.reviewCount > 0
                                  ? submission.averageScore?.toFixed?.(1) ?? submission.averageScore
                                  : "—"}
                              </td>
                              {phaseData.canScore && (
                                <td className="hu-td-center">
                                  <ReviewBadge review={submission.myReview} />
                                </td>
                              )}
                              <td className="hu-td-center">
                                <QualificationBadge status={submission.qualificationStatus} />
                              </td>
                              {!isJudgeViewer && (
                                <td className="hu-td-center">
                                  <select
                                    value=""
                                    onChange={(e) =>
                                      e.target.value &&
                                      handleOverrideQualification(submission._id, e.target.value)
                                    }
                                    className="hf-input"
                                    style={{ fontSize: "0.65rem", padding: "0.25rem 0.4rem" }}
                                  >
                                    <option value="">Set status…</option>
                                    <option value="QUALIFIED">Mark Qualified</option>
                                    <option value="ELIMINATED">Mark Not Advancing</option>
                                  </select>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {phaseData.submissions.length === 0 && (
                        <EmptyState message="No submissions for this round yet." />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "matches" && (
            <MatchManagement
              hackathon={hackathon}
              phases={matchPhases}
              teams={teams}
              isJudgeViewer={isJudgeViewer}
            />
          )}
        </main>
      </div>

      {showScoreboard && (
        <div
          className="hu-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowScoreboard(false)}
        >
          <div className="hu-modal">
            <div className="hu-modal-topline" />

            <div className="hu-modal-header">
              <Trophy size={18} style={{ color: "var(--amber)", flexShrink: 0 }} />
              <div className="hu-modal-title">Scoreboard</div>

              <button onClick={() => setShowScoreboard(false)} className="hu-modal-close">
                <X size={15} />
              </button>
            </div>

            <div className="hu-modal-actions">
                {result && result.length > 0 && (
                  <button
                    onClick={() => exportResultsToExcel(hackathon, result)}
                    className="hu-export-btn"
                  >
                    <Download size={12} /> Export to Excel
                  </button>
                )}

                {!isJudgeViewer &&
                  (hackathon.showResult ? (
                    <span className="hu-released">
                      <CheckCircle size={12} /> Results released
                    </span>
                  ) : (
                    <button
                      onClick={handleReleaseResults}
                      disabled={releasingResults}
                      className="hu-results-btn"
                    >
                      <Send size={12} />
                      {releasingResults ? "Releasing…" : "Release Results"}
                    </button>
                  ))}
              </div>

            {result === null ? (
              <div className="hu-modal-empty">
                <div className="hu-spinner" />
              </div>
            ) : result.length > 0 ? (
              <div className="hu-modal-list">
                {result.map((sub, idx) => {
                  const name = sub.team?.name || sub.participant?.name || "Unknown";
                  const points = sub.finalScore?.toFixed?.(1) ?? sub.finalScore ?? 0;
                  const { row, rank } = rankClass(idx);
                  return (
                    <div key={sub._id || idx} className={`hu-score-row ${row}`}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span className={`hu-score-rank ${rank}`}>#{idx + 1}</span>
                        <span className="hu-score-name">{name}</span>
                      </div>
                      <span className="hu-score-pts">{points} pts</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="hu-modal-empty">
                <Trophy size={36} />
                <span>No submissions yet, or results aren't public.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonUsersPage;
