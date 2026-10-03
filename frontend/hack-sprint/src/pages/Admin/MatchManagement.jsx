import { confirmAction, chooseOption } from "../../utils/dialogs.js";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Play,
  Check,
  Trash2,
  Swords,
  Clock,
} from "lucide-react";
import { MatchAPI } from "../../api/match.api.js";

const EmptyState = ({ message }) => (
  <div className="hu-empty">
    <Swords size={40} />
    <span>{message}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const cls =
    status === "LIVE"
      ? "mm-status-live"
      : status === "COMPLETED"
      ? "mm-status-completed"
      : "mm-status-scheduled";
  const label =
    status === "LIVE" ? "Live" : status === "COMPLETED" ? "Completed" : "Scheduled";

  return <span className={`hu-badge ${cls}`}>{label}</span>;
};

// datetime-local expects local wall-clock time, but ISO strings from the
// API are UTC — shift by the local timezone offset so the picker shows
// the actual saved moment.
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const MatchManagement = ({ hackathon, phases, teams, isJudgeViewer }) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState(phases[0]?._id || null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamA, setNewTeamA] = useState("");
  const [newTeamB, setNewTeamB] = useState("");
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [scoreDrafts, setScoreDrafts] = useState({});

  useEffect(() => {
    if (!selectedPhaseId && phases.length) {
      setSelectedPhaseId(phases[0]._id);
    }
  }, [phases, selectedPhaseId]);

  const loadMatches = async (phaseId) => {
    if (!phaseId) return;
    setLoading(true);
    try {
      const res = await MatchAPI.getRoundMatchesAdmin(hackathon._id, phaseId);
      setMatches(res.data.matches || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches(selectedPhaseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhaseId]);

  const teamsInUnresolvedMatch = useMemo(() => {
    const ids = new Set();
    matches.forEach((m) => {
      if (m.status !== "COMPLETED") {
        ids.add(m.teamA?._id);
        ids.add(m.teamB?._id);
      }
    });
    return ids;
  }, [matches]);

  const handleCreateMatch = async () => {
    if (!newTeamA || !newTeamB) {
      toast.error("Select both teams");
      return;
    }
    if (newTeamA === newTeamB) {
      toast.error("A team can't be matched against itself");
      return;
    }
    try {
      await MatchAPI.createMatch(hackathon._id, {
        phaseId: selectedPhaseId,
        teamA: newTeamA,
        teamB: newTeamB,
        order: matches.length,
        scheduledAt: newScheduledAt ? new Date(newScheduledAt).toISOString() : null,
      });
      toast.success("Match created");
      setNewTeamA("");
      setNewTeamB("");
      setNewScheduledAt("");
      setShowCreate(false);
      loadMatches(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create match");
    }
  };

  const handleGoLive = async (matchId) => {
    try {
      await MatchAPI.updateMatchStatus(hackathon._id, matchId, "LIVE");
      toast.success("Match is now live");
      loadMatches(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update match");
    }
  };

  const handleCompleteMatch = async (match) => {
    const draft = scoreDrafts[match._id] || {};
    const scoreA = Number(draft.scoreA ?? match.scoreA ?? "");
    const scoreB = Number(draft.scoreB ?? match.scoreB ?? "");

    if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) {
      toast.error("Enter both scores");
      return;
    }

    let winner;
    if (scoreA === scoreB) {
      winner = await chooseOption({
        title: `Tied ${scoreA}–${scoreB}`,
        message: "Pick the winner to complete this match.",
        options: [{ value: match.teamA._id, label: `${match.teamA.name} wins` }, { value: match.teamB._id, label: `${match.teamB.name} wins` }],
      });
      if (!winner) return;
    }

    try {
      await MatchAPI.updateMatchScore(hackathon._id, match._id, {
        scoreA,
        scoreB,
        ...(winner ? { winner } : {}),
      });
      toast.success("Match completed");
      loadMatches(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete match");
    }
  };

  const handleScheduleChange = async (matchId, value) => {
    try {
      await MatchAPI.updateMatchSchedule(
        hackathon._id,
        matchId,
        value ? new Date(value).toISOString() : null
      );
      toast.success("Schedule updated");
      loadMatches(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleReorder = async (index, direction) => {
    const newOrder = [...matches];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= newOrder.length) return;
    [newOrder[index], newOrder[swapWith]] = [newOrder[swapWith], newOrder[index]];
    setMatches(newOrder);
    try {
      await MatchAPI.reorderMatches(
        hackathon._id,
        selectedPhaseId,
        newOrder.map((m) => m._id)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reorder");
      loadMatches(selectedPhaseId);
    }
  };

  const handleDelete = async (matchId) => {
    if (!(await confirmAction({ title: "Delete this match?", message: "This can't be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      await MatchAPI.deleteMatch(hackathon._id, matchId);
      toast.success("Match deleted");
      loadMatches(selectedPhaseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete match");
    }
  };

  if (phases.length === 0) {
    return (
      <div className="hu-card">
        <EmptyState message="No rounds configured yet — add as many Match Round phases as this event needs from Edit Event." />
      </div>
    );
  }

  const availableTeams = teams.filter((t) => !teamsInUnresolvedMatch.has(t._id));

  return (
    <div className="hu-card">
      <div className="hu-filters" style={{ marginBottom: "0.75rem" }}>
        {phases.map((phase) => (
          <button
            key={phase._id}
            onClick={() => setSelectedPhaseId(phase._id)}
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

      {!isJudgeViewer && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "0.75rem",
          }}
        >
          <button className="hu-results-btn" onClick={() => setShowCreate((v) => !v)}>
            <Plus size={13} /> Create Match
          </button>
        </div>
      )}

      {showCreate && !isJudgeViewer && (
        <div className="mm-create-form">
          <div>
            <label className="hu-page-badge" style={{ marginBottom: "0.3rem", display: "block" }}>
              Team A
            </label>
            <select
              className="mm-select"
              value={newTeamA}
              onChange={(e) => setNewTeamA(e.target.value)}
            >
              <option value="">Select team…</option>
              {availableTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="hu-page-badge" style={{ marginBottom: "0.3rem", display: "block" }}>
              Team B
            </label>
            <select
              className="mm-select"
              value={newTeamB}
              onChange={(e) => setNewTeamB(e.target.value)}
            >
              <option value="">Select team…</option>
              {availableTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="hu-page-badge" style={{ marginBottom: "0.3rem", display: "block" }}>
              Scheduled Time (optional)
            </label>
            <input
              type="datetime-local"
              className="mm-input"
              value={newScheduledAt}
              onChange={(e) => setNewScheduledAt(e.target.value)}
            />
          </div>
          <button className="hu-results-btn" onClick={handleCreateMatch}>
            Create
          </button>
          <button
            className="hu-filter-btn hu-filter-btn--inactive"
            onClick={() => setShowCreate(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "1.5rem", textAlign: "center" }}>Loading…</div>
      ) : matches.length === 0 ? (
        <EmptyState message="No matches in this round yet." />
      ) : (
        <div className="hu-table-wrap">
          {matches.map((match, index) => (
            <div
              key={match._id}
              className={`mm-match-row ${
                match.status === "LIVE"
                  ? "mm-row-live"
                  : match.status === "COMPLETED"
                  ? "mm-row-completed"
                  : "mm-row-scheduled"
              }`}
            >
              <div className="mm-match-card">
                <div style={{ textAlign: "right", fontWeight: 600 }}>
                  {match.teamA?.name || "—"}
                </div>
                <input
                  className="mm-input mm-score-input"
                  type="number"
                  placeholder="—"
                  disabled={match.status === "COMPLETED" || isJudgeViewer}
                  defaultValue={match.scoreA ?? ""}
                  onChange={(e) =>
                    setScoreDrafts((prev) => ({
                      ...prev,
                      [match._id]: { ...prev[match._id], scoreA: e.target.value },
                    }))
                  }
                />
                <div className="mm-vs">VS</div>
                <input
                  className="mm-input mm-score-input"
                  type="number"
                  placeholder="—"
                  disabled={match.status === "COMPLETED" || isJudgeViewer}
                  defaultValue={match.scoreB ?? ""}
                  onChange={(e) =>
                    setScoreDrafts((prev) => ({
                      ...prev,
                      [match._id]: { ...prev[match._id], scoreB: e.target.value },
                    }))
                  }
                />
                <div style={{ fontWeight: 600 }}>{match.teamB?.name || "—"}</div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <StatusBadge status={match.status} />
                </div>

                {!isJudgeViewer && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="mm-action-group">
                      <button
                        className="mm-reorder-btn"
                        disabled={index === 0}
                        onClick={() => handleReorder(index, -1)}
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        className="mm-reorder-btn"
                        disabled={index === matches.length - 1}
                        onClick={() => handleReorder(index, 1)}
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="mm-action-group">
                      {match.status === "SCHEDULED" && (
                        <button
                          className="mm-reorder-btn"
                          onClick={() => handleGoLive(match._id)}
                          title="Mark live"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      {match.status !== "COMPLETED" && (
                        <button
                          className="mm-reorder-btn"
                          onClick={() => handleCompleteMatch(match)}
                          title="Complete with these scores"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {match.status !== "COMPLETED" && (
                        <button
                          className="mm-reorder-btn mm-reorder-btn--danger"
                          onClick={() => handleDelete(match._id)}
                          title="Delete match"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mm-schedule-row">
                <Clock size={12} className="mm-schedule-icon" />
                <span className="mm-schedule-label">Scheduled for teams to check:</span>
                <input
                  type="datetime-local"
                  className="mm-input mm-schedule-input"
                  disabled={match.status === "COMPLETED" || isJudgeViewer}
                  defaultValue={toLocalInput(match.scheduledAt)}
                  onBlur={(e) => handleScheduleChange(match._id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchManagement;
