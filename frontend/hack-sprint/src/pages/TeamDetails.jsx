import React, { useState, useEffect, useCallback } from "react";
import { confirmAction } from "../utils/dialogs.js";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ProfileAPI } from "../api/profile.api.js";
import { TeamAPI } from "../api/team.api.js";
import { SubmissionAPI } from "../api/submission.api.js";
import "./Styles/AllHackathons.css";
import {
  Users,
  Crown,
  Mail,
  Check,
  X,
  Copy,
  User,
  Clock,
  KeyRound,
  Pencil,
  Save,
  LogOut,
  Trash2,
  UserMinus,
  FileText,
  Lock,
  ExternalLink,
  Loader2,
  Eye,
  Trophy,
} from "lucide-react";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const IconBtn = ({ onClick, disabled, color = "green", title, children }) => {
  const c = {
    green:
      "border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] bg-[rgba(var(--hk-accent-rgb),0.07)] text-[rgba(var(--hk-accent-rgb),0.95)] dark:text-[rgba(var(--hk-accent-rgb),0.65)] hover:bg-[rgba(var(--hk-accent-rgb),0.14)] hover:text-[var(--hk-accent-solid)]",
    red: "border-[rgba(var(--hk-red-rgb),0.2)] bg-[rgba(var(--hk-red-rgb),0.07)] text-[rgba(var(--hk-red-rgb),0.65)] hover:bg-[rgba(var(--hk-red-rgb),0.14)] hover:text-[rgb(var(--hk-red-rgb))]",
  }[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${mono} w-8 h-8 flex items-center justify-center rounded-[3px] border cursor-pointer transition-all disabled:opacity-35 disabled:cursor-not-allowed ${c}`}
    >
      {children}
    </button>
  );
};

const CopyRow = ({ label, value, copyKey, copiedItem, onCopy }) => (
  <div>
    <div
      className={`${mono} text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] mb-1.5`}
    >
      {label}
    </div>
    <div className="flex items-center gap-2 px-3 py-2.5 bg-[rgba(var(--hk-accent-rgb),0.04)] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] rounded-[3px]">
      <span
        className={`${mono} flex-1 text-[var(--hk-accent-solid)] text-[0.68rem] truncate`}
        title={value}
      >
        {value}
      </span>
      <IconBtn onClick={() => onCopy(value, copyKey)}>
        {copiedItem === copyKey ? <Check size={12} /> : <Copy size={12} />}
      </IconBtn>
    </div>
  </div>
);

const MemberCard = ({ member, isLeader, canRemove, onRemove, removing }) => (
  <div className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px] p-4 hover:border-[rgba(var(--hk-accent-rgb),0.25)] transition-all">
    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-card-border-rgb),0.56)] dark:border-[rgba(var(--hk-card-border-rgb),0.35)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(var(--hk-card-border-rgb),0.56)] dark:border-[rgba(var(--hk-card-border-rgb),0.35)]" />
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0 ${
            isLeader
              ? "bg-[rgba(var(--hk-amber-rgb),0.1)] border-[rgba(var(--hk-amber-rgb),0.3)]"
              : "bg-[rgba(var(--hk-accent-rgb),0.07)] border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)]"
          }`}
        >
          {isLeader ? (
            <Crown size={14} className="text-[rgb(var(--hk-amber-rgb))]" />
          ) : (
            <User size={14} className="text-[rgba(var(--hk-accent-rgb),0.9)] dark:text-[rgba(var(--hk-accent-rgb),0.6)]" />
          )}
        </div>
        <div className="min-w-0">
          <h3
            className={`${syne} font-extrabold text-[var(--hk-text)] text-sm tracking-tight truncate`}
          >
            {member.name}
          </h3>
          <p
            className={`${mono} text-[0.55rem] tracking-[0.08em] ${
              isLeader
                ? "text-[rgba(var(--hk-amber-rgb),0.6)]"
                : "text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)]"
            }`}
          >
            {isLeader ? "Team Leader" : "Member"}
          </p>
        </div>
      </div>
      {canRemove && (
        <IconBtn
          color="red"
          title="Remove from team"
          disabled={removing}
          onClick={() => onRemove(member._id, member.name)}
        >
          <UserMinus size={13} />
        </IconBtn>
      )}
    </div>
    <div
      className={`${mono} flex items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.9)] dark:text-[rgba(var(--hk-text-rgb),0.55)]`}
    >
      <Mail size={11} className="text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] flex-shrink-0" />
      <span className="truncate">{member.email}</span>
    </div>
  </div>
);

const PendingCard = ({ request, onAction, actionLoading, formatDate }) => (
  <div className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-amber-rgb),0.15)] rounded-[4px] p-4 hover:border-[rgba(var(--hk-amber-rgb),0.28)] transition-all">
    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(var(--hk-amber-rgb),0.4)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(var(--hk-amber-rgb),0.4)]" />
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center border bg-[rgba(var(--hk-amber-rgb),0.08)] border-[rgba(var(--hk-amber-rgb),0.25)] flex-shrink-0">
          <Clock size={13} className="text-[rgb(var(--hk-amber-rgb))]" />
        </div>
        <div className="min-w-0">
          <h3
            className={`${syne} font-extrabold text-[var(--hk-text)] text-sm tracking-tight truncate`}
          >
            {request.name}
          </h3>
          <p className={`${mono} text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)]`}>
            Requested {formatDate(request.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <IconBtn
          color="green"
          onClick={() => onAction(request._id, "accept")}
          disabled={actionLoading}
        >
          <Check size={12} />
        </IconBtn>
        <IconBtn
          color="red"
          onClick={() => onAction(request._id, "reject")}
          disabled={actionLoading}
        >
          <X size={12} />
        </IconBtn>
      </div>
    </div>
    <div
      className={`${mono} flex items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.9)] dark:text-[rgba(var(--hk-text-rgb),0.55)]`}
    >
      <Mail size={11} className="text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] flex-shrink-0" />
      <span className="truncate">{request.email}</span>
    </div>
  </div>
);

const TeamDetails = () => {
  const { slug, teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeader, setIsLeader] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);

  const [renaming, setRenaming] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [submissionPhases, setSubmissionPhases] = useState([]);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const getCode = useCallback(
    () => teamId || localStorage.getItem("teamDetails_code"),
    [teamId]
  );

  const fetchTeam = useCallback(async () => {
    const code = getCode();
    if (!code) {
      setLoading(false);
      return;
    }
    try {
      const searchRes = await TeamAPI.searchTeam(code);
      const teamRes = await TeamAPI.getTeam(searchRes.data.team.id);
      setTeamData(teamRes.data.team);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching team data.");
    } finally {
      setLoading(false);
    }
  }, [getCode]);

  useEffect(() => {
    if (location.state?.secretCode)
      localStorage.setItem("teamDetails_code", location.state.secretCode);
    ProfileAPI.getMyProfile()
      .then((res) => {
        setCurrentUser(res.data.profile);
        fetchTeam();
      })
      .catch(() => {
        toast.error("You must be logged in.");
        navigate("/account/login");
      });
  }, [slug, teamId, navigate, fetchTeam, location.state]);

  useEffect(() => {
    if (currentUser && teamData)
      setIsLeader(currentUser._id === teamData.leader._id);
  }, [currentUser, teamData]);

  useEffect(() => {
    const hackathonId = teamData?.hackathon?._id;
    if (!hackathonId) return;
    SubmissionAPI.getMySubmission(hackathonId)
      .then((res) => setSubmissionPhases(res.data.phases || []))
      .catch(() => setSubmissionPhases([]));
  }, [teamData?.hackathon?._id]);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    });
  };

  const handleRequestAction = async (userId, action) => {
    setActionLoading(true);
    try {
      const r = await TeamAPI.handleRequest(teamData._id, { userId, action });
      toast.success(r.data.message);
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || `Error ${action}ing request.`);
    } finally {
      setActionLoading(false);
    }
  };

  const startRename = () => {
    setNewTeamName(teamData.name);
    setRenaming(true);
  };

  const handleSaveName = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name cannot be empty.");
      return;
    }
    setSavingName(true);
    try {
      await TeamAPI.updateTeam(teamData._id, { teamName: newTeamName.trim() });
      toast.success("Team renamed.");
      setRenaming(false);
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to rename team.");
    } finally {
      setSavingName(false);
    }
  };

  const handleRemoveMember = async (userId, name) => {
    if (!(await confirmAction({ title: `Remove ${name}?`, message: "They'll be taken off your team.", confirmLabel: "Remove", danger: true }))) return;
    setRemovingId(userId);
    try {
      await TeamAPI.removeMember(teamData._id, userId);
      toast.success(`${name} was removed from the team.`);
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!(await confirmAction({ title: "Leave this team?", message: "You can request to join again later with the team code.", confirmLabel: "Leave team", danger: true }))) return;
    setLeaving(true);
    try {
      await TeamAPI.leaveTeam(teamData._id);
      toast.success("You left the team.");
      navigate(`/hackathon/${slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave team.");
      setLeaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!(await confirmAction({ title: "Delete this team?", message: "Every member is removed and the team is gone for good. This can't be undone.", confirmLabel: "Delete team", danger: true }))) return;
    setDeleting(true);
    try {
      await TeamAPI.deleteTeam(teamData._id);
      toast.success("Team deleted.");
      navigate(`/hackathon/${slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team.");
      setDeleting(false);
    }
  };

  const handleViewSubmission = async (submissionId) => {
    if (!submissionId) return;
    setLoadingSubmission(true);
    try {
      const res = await SubmissionAPI.getSubmission(submissionId);
      setViewingSubmission(res.data.submission);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load submission details"
      );
    } finally {
      setLoadingSubmission(false);
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  if (loading || !teamData)
    return (
      <div className="min-h-screen bg-[var(--hk-bg)] flex flex-col items-center justify-center gap-3">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] border-t-[var(--hk-accent-solid)] animate-spin" />
        <p
          className={`${mono} text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)]`}
        >
          Loading team details…
        </p>
      </div>
    );

  const allMembers = [teamData.leader, ...teamData.members];
  const spotsLeft = teamData.maxTeamSize - allMembers.length;

  const registrationPhase = (teamData.hackathon?.phases || []).find(
    (p) => p.phaseType === "REGISTRATION"
  );
  const isRegistrationOpen =
    !!registrationPhase &&
    new Date() >= new Date(registrationPhase.startDate) &&
    new Date() <= new Date(registrationPhase.endDate);
  const lockedReason = "Registration is closed — team changes are locked";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <div
        className={`${mono} min-h-screen bg-[var(--hk-bg)] text-[var(--hk-text)] relative overflow-x-hidden`}
      >
        {/* grid bg */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(var(--hk-accent-rgb),.026) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--hk-accent-rgb),.026) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none z-0 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse,rgba(var(--hk-accent-rgb),.06) 0%,transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div
                className={`${mono} text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)] mb-2`}
              >
                Team Dashboard
              </div>
              {renaming ? (
                <div className="flex items-center gap-2 mb-1.5">
                  <input
                    autoFocus
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className={`${mono} bg-[rgba(var(--hk-input-bg),0.7)] border border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] rounded-[3px] px-3 py-1.5 text-[var(--hk-text)] text-xl sm:text-2xl focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.5)]`}
                  />
                  <IconBtn onClick={handleSaveName} disabled={savingName} title="Save">
                    <Save size={13} />
                  </IconBtn>
                  <IconBtn color="red" onClick={() => setRenaming(false)} title="Cancel">
                    <X size={13} />
                  </IconBtn>
                </div>
              ) : (
                <h1
                  className={`${syne} font-extrabold text-[var(--hk-text)] text-3xl sm:text-4xl tracking-tight mb-1.5 flex items-center gap-3`}
                >
                  {teamData.name}
                  {isLeader && (
                    <button
                      onClick={startRename}
                      title="Rename team"
                      className="text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)] hover:text-[var(--hk-accent-solid)] transition-colors cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </h1>
              )}
              <p
                className={`${mono} text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.85)] dark:text-[rgba(var(--hk-text-rgb),0.5)] tracking-[0.04em]`}
              >
                Created {formatDate(teamData.createdAt)} · {allMembers.length}/
                {teamData.maxTeamSize} members
              </p>
            </div>

            {isLeader ? (
              <button
                onClick={handleDeleteTeam}
                disabled={deleting || !isRegistrationOpen}
                title={!isRegistrationOpen ? lockedReason : undefined}
                className={`${mono} inline-flex items-center gap-2 text-[0.62rem] tracking-[0.08em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer transition-all border-[rgba(var(--hk-red-rgb),0.25)] bg-[rgba(var(--hk-red-rgb),0.06)] text-[rgba(var(--hk-red-rgb),0.75)] hover:bg-[rgba(var(--hk-red-rgb),0.12)] hover:text-[rgb(var(--hk-red-rgb))] disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isRegistrationOpen ? <Trash2 size={13} /> : <Lock size={13} />}{" "}
                {deleting ? "Deleting…" : "Delete Team"}
              </button>
            ) : (
              <button
                onClick={handleLeaveTeam}
                disabled={leaving || !isRegistrationOpen}
                title={!isRegistrationOpen ? lockedReason : undefined}
                className={`${mono} inline-flex items-center gap-2 text-[0.62rem] tracking-[0.08em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer transition-all border-[rgba(var(--hk-red-rgb),0.25)] bg-[rgba(var(--hk-red-rgb),0.06)] text-[rgba(var(--hk-red-rgb),0.75)] hover:bg-[rgba(var(--hk-red-rgb),0.12)] hover:text-[rgb(var(--hk-red-rgb))] disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isRegistrationOpen ? <LogOut size={13} /> : <Lock size={13} />}{" "}
                {leaving ? "Leaving…" : "Leave Team"}
              </button>
            )}
          </div>
          {!isRegistrationOpen && (
            <p
              className={`${mono} text-[0.58rem] text-[rgba(var(--hk-amber-rgb),0.6)] -mt-6 mb-6 flex items-center gap-1.5`}
            >
              <Lock size={10} /> {lockedReason}
            </p>
          )}

          {isLeader && (
            <>
              {spotsLeft > 0 && (
                <div className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-[4px] p-6 mb-7">
                  <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(var(--hk-card-border-rgb),0.72)] dark:border-[rgba(var(--hk-card-border-rgb),0.45)]" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(var(--hk-card-border-rgb),0.72)] dark:border-[rgba(var(--hk-card-border-rgb),0.45)]" />
                  <div className="flex items-center gap-2 mb-5">
                    <KeyRound
                      size={14}
                      className="text-[rgba(var(--hk-accent-rgb),0.85)] dark:text-[rgba(var(--hk-accent-rgb),0.55)]"
                    />
                    <h2
                      className={`${syne} font-extrabold text-[var(--hk-text)] text-base tracking-tight`}
                    >
                      Invite Team Members
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CopyRow
                      label="Invite Code"
                      value={teamData.secretCode}
                      copyKey="code"
                      copiedItem={copiedItem}
                      onCopy={handleCopy}
                    />
                  </div>
                </div>
              )}

              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={15} className="text-[rgb(var(--hk-amber-rgb))]" />
                  <h2
                    className={`${syne} font-extrabold text-[var(--hk-text)] text-lg tracking-tight`}
                  >
                    Join Requests
                  </h2>
                  <span
                    className={`${mono} text-[0.55rem] tracking-[0.1em] uppercase px-2 py-[3px] rounded-[2px] border bg-[rgba(var(--hk-amber-rgb),0.08)] border-[rgba(var(--hk-amber-rgb),0.25)] text-[rgb(var(--hk-amber-rgb))]`}
                  >
                    {teamData.pendingMembers.length}
                  </span>
                </div>
                {teamData.pendingMembers.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamData.pendingMembers.map((r) => (
                      <PendingCard
                        key={r._id}
                        request={r}
                        onAction={handleRequestAction}
                        actionLoading={actionLoading}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="relative bg-[rgba(var(--hk-card-bg),0.6)] border border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.08)] rounded-[4px] p-6 text-center">
                    <p
                      className={`${mono} text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)] tracking-[0.04em]`}
                    >
                      No pending requests.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <div className="flex items-center gap-2 mb-5">
              <Users size={15} className="text-[rgba(var(--hk-accent-rgb),0.9)] dark:text-[rgba(var(--hk-accent-rgb),0.6)]" />
              <h2
                className={`${syne} font-extrabold text-[var(--hk-text)] text-lg tracking-tight`}
              >
                Team Members
              </h2>
              <span
                className={`${mono} text-[0.55rem] tracking-[0.1em] uppercase px-2 py-[3px] rounded-[2px] border bg-[rgba(var(--hk-accent-rgb),0.07)] border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] text-[rgba(var(--hk-accent-rgb),0.95)] dark:text-[rgba(var(--hk-accent-rgb),0.65)]`}
              >
                {allMembers.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MemberCard member={teamData.leader} isLeader />
              {teamData.members.map((m) => (
                <MemberCard
                  key={m._id}
                  member={m}
                  isLeader={false}
                  canRemove={isLeader && isRegistrationOpen}
                  onRemove={handleRemoveMember}
                  removing={removingId === m._id}
                />
              ))}
              {spotsLeft > 0 && (
                <div className="border border-dashed border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] rounded-[4px] p-6 flex flex-col items-center justify-center gap-1">
                  <span
                    className={`${mono} text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)] tracking-[0.04em]`}
                  >
                    {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} remaining
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={15} className="text-[rgba(var(--hk-accent-rgb),0.9)] dark:text-[rgba(var(--hk-accent-rgb),0.6)]" />
              <h2
                className={`${syne} font-extrabold text-[var(--hk-text)] text-lg tracking-tight`}
              >
                Team Submission
              </h2>
            </div>
            {submissionPhases.length === 0 ? (
              <div className="relative bg-[rgba(var(--hk-card-bg),0.6)] border border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.08)] rounded-[4px] p-6 text-center">
                <p
                  className={`${mono} text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)] tracking-[0.04em]`}
                >
                  No submission phases yet for this event.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {submissionPhases.map((phase, index) => {
                  const prevPhase = submissionPhases[index - 1];
                  const blockedByPrevRound =
                    prevPhase?.qualificationStatus === "ELIMINATED";

                  return (
                    <div
                      key={phase.phaseId}
                      className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px] p-4"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3
                          className={`${syne} font-extrabold text-[var(--hk-text)] text-sm tracking-tight truncate`}
                        >
                          {phase.phaseName}
                        </h3>
                        <span
                          className={`${mono} text-[0.52rem] tracking-[0.1em] uppercase px-2 py-[3px] rounded-[2px] border flex-shrink-0 ${
                            phase.submitted
                              ? "bg-[rgba(var(--hk-accent-rgb),0.08)] border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] text-[var(--hk-accent-solid)]"
                              : "bg-[rgba(var(--hk-amber-rgb),0.08)] border-[rgba(var(--hk-amber-rgb),0.25)] text-[rgb(var(--hk-amber-rgb))]"
                          }`}
                        >
                          {phase.submitted ? "Submitted" : "Not Submitted"}
                        </span>
                      </div>

                      {phase.qualificationStatus &&
                        phase.qualificationStatus !== "PENDING" && (
                          <span
                            className={`${mono} inline-block text-[0.5rem] tracking-[0.1em] uppercase px-2 py-[2px] rounded-[2px] border mb-2 ${
                              phase.qualificationStatus === "QUALIFIED"
                                ? "bg-[rgba(var(--hk-accent-rgb),0.06)] border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] text-[rgba(var(--hk-accent-rgb),1.0)] dark:text-[rgba(var(--hk-accent-rgb),0.75)]"
                                : "bg-[rgba(var(--hk-red-rgb),0.06)] border-[rgba(var(--hk-red-rgb),0.2)] text-[rgba(var(--hk-red-rgb),0.75)]"
                            }`}
                          >
                            {phase.qualificationStatus === "QUALIFIED"
                              ? "Qualified"
                              : "Not Advancing"}
                          </span>
                        )}

                      {phase.submitted && phase.submittedAt && (
                        <p className={`${mono} text-[0.6rem] text-[rgba(var(--hk-text-rgb),0.85)] dark:text-[rgba(var(--hk-text-rgb),0.5)] mb-3`}>
                          Submitted {formatDate(phase.submittedAt)}
                        </p>
                      )}
                      {phase.submitted ? (
                        <button
                          onClick={() => handleViewSubmission(phase.submissionId)}
                          disabled={loadingSubmission}
                          className={`${mono} inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.08em] uppercase px-3 py-1.5 rounded-[3px] border cursor-pointer transition-all border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] bg-[rgba(var(--hk-accent-rgb),0.06)] text-[rgba(var(--hk-accent-rgb),0.95)] dark:text-[rgba(var(--hk-accent-rgb),0.65)] hover:bg-[rgba(var(--hk-accent-rgb),0.12)] hover:text-[var(--hk-accent-solid)] disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {loadingSubmission ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Eye size={11} />
                          )}
                          View Submission
                        </button>
                      ) : blockedByPrevRound ? (
                        <p className={`${mono} text-[0.6rem] text-[rgba(var(--hk-red-rgb),0.55)]`}>
                          You didn't qualify for this round.
                        </p>
                      ) : (
                        <p className={`${mono} text-[0.6rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]`}>
                          {phase.canSubmit
                            ? "Submission window is open"
                            : "Submission window is not open"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingSubmission &&
        createPortal(
          <div
            className={`${mono} fixed inset-0 bg-black/55 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4`}
            onClick={() => setViewingSubmission(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-[rgba(var(--hk-card-bg),0.98)] border border-[rgba(var(--hk-card-border-rgb),0.29)] dark:border-[rgba(var(--hk-card-border-rgb),0.18)] rounded-[4px] p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.22)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto overflow-x-hidden max-h-[90vh] [scrollbar-width:thin] [scrollbar-color:rgba(var(--hk-accent-rgb),0.2)_transparent]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <h2 className={`${syne} font-extrabold text-[var(--hk-text)] text-xl tracking-tight`}>
                  {viewingSubmission.title}
                </h2>
                <button
                  onClick={() => setViewingSubmission(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] hover:text-[var(--hk-accent-solid)] hover:border-[rgba(var(--hk-accent-rgb),0.35)] transition-all cursor-pointer flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <div
                    className={`${mono} text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] mb-1.5`}
                  >
                    Description
                  </div>
                  <p className="text-[0.72rem] text-[var(--hk-text)] whitespace-pre-wrap">
                    {viewingSubmission.description}
                  </p>
                </div>

                {viewingSubmission.averageScore != null && (
                  <div className="border border-[rgba(var(--hk-card-border-rgb),0.29)] dark:border-[rgba(var(--hk-card-border-rgb),0.18)] bg-[rgba(var(--hk-accent-rgb),0.04)] rounded-[3px] p-3.5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Trophy size={13} className="text-[var(--hk-accent-solid)] flex-shrink-0" />
                      <span
                        className={`${mono} text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),1.0)] dark:text-[rgba(var(--hk-accent-rgb),0.7)]`}
                      >
                        Results
                      </span>
                      <span className="ml-auto text-[0.9rem] font-bold text-[var(--hk-accent-solid)]">
                        {viewingSubmission.averageScore.toFixed(1)}
                      </span>
                    </div>

                    {viewingSubmission.reviews?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div
                          className={`${mono} text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)]`}
                        >
                          Judge Feedback
                        </div>
                        {viewingSubmission.reviews.map((review, i) => (
                          <p
                            key={i}
                            className="text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.9)] leading-relaxed italic border-l-2 border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] pl-2.5"
                          >
                            "{review.feedback || "No written feedback."}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {viewingSubmission.averageScore == null &&
                  viewingSubmission.reviewCount > 0 && (
                    <div className="border border-[rgba(var(--hk-amber-rgb),0.18)] bg-[rgba(var(--hk-amber-rgb),0.04)] rounded-[3px] p-3.5 flex items-center gap-2">
                      <Loader2 size={13} className="text-[rgb(var(--hk-amber-rgb))] flex-shrink-0" />
                      <span className="text-[0.68rem] text-[rgba(var(--hk-amber-rgb),0.8)]">
                        Being reviewed — your score will appear here once every judge has scored it.
                      </span>
                    </div>
                  )}

                {(() => {
                  const phase = (teamData.hackathon?.phases || []).find(
                    (p) => String(p._id) === String(viewingSubmission.phaseId)
                  );
                  const fields = phase?.submissionForm || [];
                  const submissionData = viewingSubmission.submissionData || {};

                  return fields.map((field) => {
                    const value = submissionData[field.fieldName];
                    if (value === undefined || value === null || value === "")
                      return null;

                    const isMulti = Array.isArray(value);
                    const files = isMulti ? value : [value];
                    const isFileField = field.fieldType !== "TEXT" &&
                      field.fieldType !== "TEXTAREA" &&
                      field.fieldType !== "URL";

                    return (
                      <div key={field.fieldName}>
                        <div
                          className={`${mono} text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] mb-1.5`}
                        >
                          {field.label}
                        </div>
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
                          <p className="text-[0.72rem] text-[var(--hk-text)] whitespace-pre-wrap break-words">
                            {value}
                          </p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default TeamDetails;
