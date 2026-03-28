import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Shield,
  Images,
  Trophy,
  X,
} from "lucide-react";
import { getAdminDetails, getAdminHackathonDetail } from "../backendApis/api";
import axios from "axios";
import AdminGalleryManager from "./AdminGalleryManager";
import "./Userlist.css"
import { API } from "../backendApis/api";

/* ── Background ── */
const GridBackground = () => <div className="hu-bg" />;

/* ── Filter buttons ── */
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

/* ── Empty state ── */
const EmptyState = ({ message }) => (
  <div className="hu-empty">
    <Users size={40} />
    <span>{message}</span>
  </div>
);

/* ── Submission badge ── */
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

/* ── Main page ── */
const HackathonUsersPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [individualParticipants, setIndividualParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [result, setResult] = useState(null);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [teamFilter, setTeamFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");

  const hasTeamSubmitted = (team) => !!team.submission;
  const hasUserSubmitted = (participant) => !!participant.submission;

  const filteredTeams = teams.filter((team) => {
    const submitted = hasTeamSubmitted(team);
    if (teamFilter === "submitted") return submitted;
    if (teamFilter === "not_submitted") return !submitted;
    return true;
  });

  const filteredParticipants = individualParticipants.filter((p) => {
    const submitted = hasUserSubmitted(p);
    if (participantFilter === "submitted") return submitted;
    if (participantFilter === "not_submitted") return !submitted;
    return true;
  });

  const navigateToSubmission = (hasSubmitted, path) => {
    if (hasSubmitted) navigate(path);
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await API(
          `${import.meta.env.VITE_API_BASE_URL}/api/submit/hackathon/${slug}`
        );
        setResult(response.data);
      } catch {
        /* silent */
      }
    };
    fetchResult();
  }, [slug]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await getAdminDetails();
        setAdminData(response.data.admin);
      } catch (error) {
        // console.error("Auth error, redirecting...", error);
        navigate("/adminlogin");
      }
    };
    fetchAdminData();
  }, [navigate]);

  useEffect(() => {
    if (!adminData || !slug) return;
    const fetchHackathonData = async () => {
      try {
        const response = await getAdminHackathonDetail({
          adminId: adminData.id,
          hackathonId: slug,
        });
        const { hackathon, participantsWithoutTeam, teams } = response.data;
        setHackathon(hackathon);
        setIndividualParticipants(participantsWithoutTeam);
        setTeams(teams);
      } catch (error) {
        // console.error("Failed to fetch hackathon details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathonData();
  }, [adminData, slug]);

  if (loading) {
    return (
      <div className="hu-loading">
        <div className="hu-spinner" />
        <p>Loading participants…</p>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="hu-notfound">
        <div>
          <h1>Hackathon Not Found</h1>
          <Link to="/admin">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  /* scoreboard rank helpers */
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
        {/* ── Header ── */}
        <header style={{ marginBottom: "1.75rem" }}>
          <Link to="/admin" className="hu-back">
            <ArrowLeft size={13} /> Back to Dashboard
          </Link>
          
          <h1 className="hu-page-title">{hackathon.title}</h1>

          {/* Tabs */}
          <div className="hu-tabs">
            <button
              onClick={() => setActiveTab("participants")}
              className={`hu-tab ${
                activeTab === "participants"
                  ? "hu-tab--active"
                  : "hu-tab--inactive"
              }`}
            >
              <Users size={13} /> Participants
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`hu-tab ${
                activeTab === "gallery" ? "hu-tab--active" : "hu-tab--inactive"
              }`}
            >
              <Images size={13} /> Gallery
            </button>
          </div>

          {activeTab === "participants" && (
            <button
              onClick={() => setShowScoreboard(true)}
              className="hu-results-btn"
            >
              <Trophy size={13} /> View Results
            </button>
          )}
        </header>

        {/* ── Main content ── */}
        <main
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {activeTab === "participants" ? (
            <>
              {/* Teams */}
              <div className="hu-card">
                <div className="hu-section-title">
                  <Shield size={16} />
                  Teams
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      fontWeight: 400,
                    }}
                  >
                    ({teams.length})
                  </span>
                </div>
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
                        {filteredTeams.map((team) => {
                          const submitted = hasTeamSubmitted(team);
                          return (
                            <tr
                              key={team._id}
                              onClick={() =>
                                navigateToSubmission(
                                  submitted,
                                  `/hackathon/${slug}/submission/${team._id}`
                                )
                              }
                              className={submitted ? "clickable" : ""}
                            >
                              <td className="hu-td-name">{team.name}</td>
                              <td>
                                {team.leader && (
                                  <div className="hu-leader">
                                    <Shield
                                      size={11}
                                      style={{ color: "var(--amber)" }}
                                    />
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
                                {team.members.map((member) => (
                                  <div key={member._id} className="hu-member">
                                    {member.name}
                                  </div>
                                ))}
                              </td>
                              <td className="hu-td-center">
                                <SubmissionBadge submitted={submitted} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredTeams.length === 0 && (
                      <EmptyState message="No teams match this filter." />
                    )}
                  </div>
                </div>
              </div>

              {/* Individual Participants */}
              <div className="hu-card">
                <div className="hu-section-title">
                  <Users size={16} />
                  Individual Participants
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      fontWeight: 400,
                    }}
                  >
                    ({individualParticipants.length})
                  </span>
                </div>
                <FilterButtons
                  value={participantFilter}
                  onChange={setParticipantFilter}
                />
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
                        {filteredParticipants.map((participant) => {
                          const submitted = hasUserSubmitted(participant);
                          return (
                            <tr
                              key={participant._id}
                              onClick={() =>
                                navigateToSubmission(
                                  submitted,
                                  `/hackathon/${slug}/submission/${participant.user?._id}`
                                )
                              }
                              className={submitted ? "clickable" : ""}
                            >
                              <td className="hu-td-name">
                                {participant.user?.name || "N/A"}
                              </td>
                              <td className="hu-td-muted">
                                {participant.user?.email || "N/A"}
                              </td>
                              <td className="hu-td-center">
                                <SubmissionBadge submitted={submitted} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredParticipants.length === 0 && (
                      <EmptyState message="No participants match this filter." />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="hu-gallery-wrap">
              <AdminGalleryManager hackathonId={slug} />
            </div>
          )}
        </main>
      </div>

      {/* ── Scoreboard Modal ── */}
      {showScoreboard && (
        <div
          className="hu-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowScoreboard(false)
          }
        >
          <div className="hu-modal">
            <div className="hu-modal-topline" />

            <div className="hu-modal-header">
              <Trophy
                size={18}
                style={{ color: "var(--amber)", flexShrink: 0 }}
              />
              <div className="hu-modal-title">Scoreboard</div>
              <button
                onClick={() => setShowScoreboard(false)}
                className="hu-modal-close"
              >
                <X size={15} />
              </button>
            </div>

            {result?.totalSubmissions > 0 ? (
              <div className="hu-modal-list">
                {result.submissions?.map((sub, idx) => {
                  const name =
                    sub.team?.name || sub.participant?.name || "Unknown";
                  const points = sub.hackathonPoints || 0;
                  const { row, rank } = rankClass(idx);
                  return (
                    <div key={sub._id || idx} className={`hu-score-row ${row}`}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        <span className={`hu-score-rank ${rank}`}>
                          #{idx + 1}
                        </span>
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
                <span>No submissions yet.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonUsersPage;
