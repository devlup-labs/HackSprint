import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Github,
  ExternalLink,
  FileText,
  File,
  Image as ImageIcon,
  Video,
  Award,
  Gavel,
} from "lucide-react";
import { HackathonAPI } from "../../api/hackathon.api.js";
import { JudgeAPI } from "../../api/judge.api.js";
import { AdminAPI } from "../../api/admin.api.js";
import "./UserList.css";

const GridBackground = () => <div className="hu-bg" />;

const EmptyState = ({ message }) => (
  <div className="hu-empty">
    <FileText size={40} />
    <span>{message}</span>
  </div>
);

const typeLabel = (fieldType) => {
  switch (fieldType) {
    case "DOCUMENT":
    case "MULTI_DOCUMENT":
      return "Document";
    case "IMAGE":
    case "MULTI_IMAGE":
      return "Image";
    case "VIDEO":
    case "MULTI_VIDEO":
      return "Video";
    default:
      return "Open Link";
  }
};

const iconFor = (fieldType, url) => {
  if (/github\.com/i.test(url || "")) return Github;
  switch (fieldType) {
    case "URL":
      return ExternalLink;
    case "DOCUMENT":
    case "MULTI_DOCUMENT":
      return FileText;
    case "IMAGE":
    case "MULTI_IMAGE":
      return ImageIcon;
    case "VIDEO":
    case "MULTI_VIDEO":
      return Video;
    default:
      return File;
  }
};

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const MetaCard = ({ value }) => (
  <div className="sd-meta-card">
    {Object.entries(value).map(([k, v]) => (
      <div key={k} className="sd-meta-row">
        <span className="sd-meta-key">{k.replace(/_/g, " ")}</span>
        <span className="sd-meta-val">
          {isPlainObject(v) || Array.isArray(v) ? JSON.stringify(v) : String(v)}
        </span>
      </div>
    ))}
  </div>
);

const SubmissionField = ({ field, value }) => {
  if (value === undefined || value === null || value === "") return null;

  if (field.fieldType === "TEXT" || field.fieldType === "TEXTAREA") {
    return (
      <div className="sd-field">
        <div className="sd-field-label">{field.label}</div>
        {typeof value === "string" || typeof value === "number" ? (
          <div className="sd-field-text">{value}</div>
        ) : isPlainObject(value) ? (
          <MetaCard value={value} />
        ) : null}
      </div>
    );
  }

  const isMulti = field.fieldType.startsWith("MULTI_");
  const items = isMulti ? (Array.isArray(value) ? value : []) : [value];
  if (items.length === 0) return null;

  return (
    <div className="sd-field">
      <div className="sd-field-label">{field.label}</div>
      <div className="sd-field-links">
        {items.map((item, i) => {
          const url = typeof item === "string" ? item : item?.url;

          if (!url) {
            return isPlainObject(item) ? <MetaCard key={i} value={item} /> : null;
          }

          const isImage = field.fieldType === "IMAGE" || field.fieldType === "MULTI_IMAGE";
          const isGithub = /github\.com/i.test(url);
          const Icon = iconFor(field.fieldType, url);
          const filename = typeof item === "object" ? item.original_filename : null;

          if (isImage) {
            return (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="sd-image-chip">
                <img src={url} alt={field.label} />
              </a>
            );
          }

          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="sd-link-chip">
              <Icon size={13} />
              <span>{isGithub ? "GitHub Repository" : filename || typeLabel(field.fieldType)}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

const ScorePanel = ({
  submissionId,
  judgingConfig,
  averageScore,
  reviewCount,
  reviews,
  canScore,
  myAdminId,
  onReviewed,
}) => {
  const isJudge = canScore;
  const myReview = isJudge ? reviews.find((r) => r.judge?._id === myAdminId) : null;
  const otherReviews = isJudge ? reviews.filter((r) => r.judge?._id !== myAdminId) : reviews;

  const [score, setScore] = useState(myReview ? String(myReview.score) : "");
  const [feedback, setFeedback] = useState(myReview?.feedback || "");
  const [submitting, setSubmitting] = useState(false);

  const minScore = judgingConfig?.minScore ?? 0;
  const maxScore = judgingConfig?.maxScore ?? 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numScore = Number(score);
    if (Number.isNaN(numScore) || numScore < minScore || numScore > maxScore) {
      toast.error(`Score must be between ${minScore} and ${maxScore}.`);
      return;
    }
    setSubmitting(true);
    try {
      await JudgeAPI.reviewSubmission(submissionId, { score: numScore, feedback });
      toast.success("Review submitted.");
      onReviewed();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sd-score-panel">
      <div className="sd-score-title">
        <Gavel size={14} /> Judges' Scores
        <span className="sd-score-summary">
          {reviewCount > 0
            ? `Avg ${averageScore?.toFixed?.(1) ?? averageScore} pts across ${reviewCount} judge${
                reviewCount === 1 ? "" : "s"
              }`
            : "No scores yet"}
        </span>
      </div>

      {isJudge && (
        <form onSubmit={handleSubmit} className="sd-score-form">
          <div className="sd-score-row">
            <label htmlFor={`score-${submissionId}`}>
              Your Score ({minScore}–{maxScore})
            </label>
            <input
              id={`score-${submissionId}`}
              type="number"
              min={minScore}
              max={maxScore}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>
          <textarea
            className="sd-score-feedback"
            placeholder="Feedback for the team / participant…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
          <button type="submit" disabled={submitting} className="sd-score-submit">
            {myReview
              ? submitting
                ? "Updating…"
                : "Update Review"
              : submitting
              ? "Submitting…"
              : "Submit Review"}
          </button>
        </form>
      )}

      {otherReviews.length > 0 ? (
        <div className="sd-other-reviews">
          {isJudge && <div className="sd-score-subtitle">Other Judges</div>}
          {otherReviews.map((r) => (
            <div key={r._id} className="sd-review-row">
              <div className="sd-review-top">
                <span className="sd-review-judge">{r.judge?.adminName || "Judge"}</span>
                <span className="sd-review-score">
                  <Award size={11} /> {r.score} pts
                </span>
              </div>
              {r.feedback && <p className="sd-review-feedback">{r.feedback}</p>}
            </div>
          ))}
        </div>
      ) : (
        !isJudge && <div className="sd-score-subtitle">No judges have scored this yet.</div>
      )}
    </div>
  );
};

const AdminSubmissionDetail = () => {
  const { hackathonId, entityType, entityId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [myAdminId, setMyAdminId] = useState(null);

  const load = async () => {
    try {
      const res = await HackathonAPI.getEntitySubmissions(hackathonId, entityType, entityId);
      setData(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [hackathonId, entityType, entityId]);

  useEffect(() => {
    if (!data?.canScore) return;
    AdminAPI.getProfile()
      .then((res) => setMyAdminId(res.data.admin?._id))
      .catch(() => {});
  }, [data?.canScore]);

  if (loading) {
    return (
      <div className="hu-loading">
        <div className="hu-spinner" />
        <p>Loading submission…</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="hu-notfound">
        <div>
          <h1>Submission Not Found</h1>
          <Link to={`/admin/${hackathonId}/usersubmissions`}>← Back to Participants</Link>
        </div>
      </div>
    );
  }

  const { hackathon, entity, phases } = data;

  return (
    <div className="hu-root">
      <GridBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "clamp(1.25rem, 4vw, 2.5rem)",
        }}
      >
        <header style={{ marginBottom: "1.75rem" }}>
          <Link to={`/admin/${hackathon._id}/usersubmissions`} className="hu-back">
            <ArrowLeft size={13} /> Back to Participants
          </Link>

          <h1 className="hu-page-title">{entity.name || "Unknown"}</h1>

          <div className="hu-stats-row">
            <span className="hu-page-badge">
              {entity.type === "team" ? <Shield size={11} /> : <Users size={11} />}
              {entity.type === "team" ? "Team" : "Participant"}
            </span>
            {entity.email && <span className="hu-page-badge">{entity.email}</span>}
            <span className="hu-page-badge">{hackathon.title}</span>
          </div>

          {entity.type === "team" && (entity.members?.length > 0 || entity.leader) && (
            <div className="sd-team-members">
              {entity.leader && (
                <span className="sd-member-chip sd-member-chip--leader">
                  <Shield size={11} />
                  {entity.leader.name}
                  <em>Leader</em>
                </span>
              )}
              {(entity.members || [])
                .filter((m) => m._id !== entity.leader?._id)
                .map((m) => (
                  <span key={m._id} className="sd-member-chip">
                    <Users size={11} />
                    {m.name}
                  </span>
                ))}
            </div>
          )}
        </header>

        <main style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {phases.length === 0 && (
            <div className="hu-card">
              <EmptyState message="No submission phases configured for this event." />
            </div>
          )}

          {phases.map((phase) => (
            <div key={phase.phaseId || phase.submission?._id} className="hu-card">
              <div className="sd-phase-header">
                <div className="hu-section-title" style={{ marginBottom: 0 }}>
                  <Calendar size={16} />
                  {phase.phaseName}
                </div>
                {phase.submission ? (
                  <span className="hu-badge hu-badge--submitted">
                    <CheckCircle size={11} /> Submitted
                  </span>
                ) : (
                  <span className="hu-badge hu-badge--not">
                    <XCircle size={11} /> Not Submitted
                  </span>
                )}
              </div>
              {phase.phaseId && (
                <div className="sd-phase-dates">
                  {new Date(phase.startDate).toLocaleDateString("en-IN")} –{" "}
                  {new Date(phase.endDate).toLocaleDateString("en-IN")}
                  {phase.weight > 0 && ` · Weight: ${phase.weight}%`}
                  {phase.qualificationRule?.type === "TOP_N" &&
                    ` · Top ${phase.qualificationRule.value} advance`}
                  {phase.qualificationRule?.type === "THRESHOLD" &&
                    ` · Score ≥ ${phase.qualificationRule.value} advances`}
                </div>
              )}

              {phase.submission ? (
                <>
                  <div className="sd-submission-meta">
                    <div className="sd-submission-title">{phase.submission.title}</div>
                    {phase.submission.description && (
                      <p className="sd-submission-desc">{phase.submission.description}</p>
                    )}
                    <div className="sd-submission-badges">
                      {phase.submission.resultStatus !== "NONE" && (
                        <span className="hu-badge hu-badge--submitted">
                          <Award size={11} /> {phase.submission.resultStatus.replace("_", " ")}
                        </span>
                      )}
                      {phase.submission.qualificationStatus &&
                        phase.submission.qualificationStatus !== "PENDING" && (
                          <span
                            className={`hu-badge ${
                              phase.submission.qualificationStatus === "QUALIFIED"
                                ? "hu-badge--submitted"
                                : "hu-badge--not"
                            }`}
                          >
                            {phase.submission.qualificationStatus === "QUALIFIED" ? (
                              <CheckCircle size={11} />
                            ) : (
                              <XCircle size={11} />
                            )}{" "}
                            {phase.submission.qualificationStatus === "QUALIFIED"
                              ? "Qualified"
                              : "Not Advancing"}
                          </span>
                        )}
                      <span className="sd-points">
                        <Award size={11} /> {phase.submission.hackathonPoints || 0} pts
                      </span>
                      {phase.submission.submittedAt && (
                        <span className="sd-submitted-at">
                          Submitted {new Date(phase.submission.submittedAt).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sd-fields">
                    {phase.submissionForm.map((field) => (
                      <SubmissionField
                        key={field._id || field.fieldName}
                        field={field}
                        value={phase.submission.submissionData?.[field.fieldName]}
                      />
                    ))}
                  </div>

                  <ScorePanel
                    submissionId={phase.submission._id}
                    judgingConfig={hackathon.judgingConfig}
                    averageScore={phase.submission.averageScore}
                    reviewCount={phase.submission.reviewCount}
                    reviews={phase.submission.reviews || []}
                    canScore={data.canScore}
                    myAdminId={myAdminId}
                    onReviewed={load}
                  />
                </>
              ) : (
                <EmptyState message="No submission for this phase yet." />
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default AdminSubmissionDetail;
