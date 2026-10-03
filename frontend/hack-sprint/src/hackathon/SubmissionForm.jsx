import React, { useState, useEffect } from "react";
import "../pages/Styles/AllHackathons.css";
import { createPortal } from "react-dom";
import { X, Clock, Users, Code } from "lucide-react";
import toast from "react-hot-toast";
import { HackathonAPI } from "../api/hackathon.api.js";
import { SubmissionAPI } from "../api/submission.api.js";
import DynamicFieldsForm from "../components/DynamicFieldsForm.jsx";
import {
  normalizeFields,
  buildInitialValues,
  validateFields,
} from "../utils/dynamicFields.js";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const inp = `${mono} w-full bg-[rgba(var(--hk-input-bg),0.7)] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] rounded-[4px] px-3.5 py-3 text-[0.78rem] text-[var(--hk-text)] placeholder-[rgba(var(--hk-accent-rgb),0.55)] dark:placeholder-[rgba(var(--hk-accent-rgb),0.25)] focus:outline-none focus:border-[rgba(var(--hk-card-border-rgb),0.67)] dark:focus:border-[rgba(var(--hk-card-border-rgb),0.42)] focus:shadow-[0_0_0_2px_rgba(var(--hk-accent-rgb),0.06)] transition-all`;

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="relative bg-[rgba(var(--hk-accent-rgb),0.04)] border border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-[3px] p-3 sm:p-4 min-w-0">
    <Icon size={13} className="text-[rgba(var(--hk-accent-rgb),0.85)] dark:text-[rgba(var(--hk-accent-rgb),0.55)] mb-2" />
    <div
      className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-0.5`}
    >
      {label}
    </div>
    <div
      className={`${syne} font-extrabold text-[var(--hk-text)] text-sm tracking-tight break-words`}
    >
      {value}
    </div>
  </div>
);

const PrimaryBtn = ({
  children,
  disabled,
  type = "submit",
  color = "green",
}) => {
  const c =
    color === "amber"
      ? "bg-[rgb(var(--hk-amber-rgb))] border-[rgb(var(--hk-amber-rgb))] hover:brightness-110"
      : color === "gray"
      ? "bg-[rgba(var(--hk-accent-rgb),0.04)] border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] text-[rgba(var(--hk-accent-rgb),0.55)] dark:text-[rgba(var(--hk-accent-rgb),0.25)] cursor-not-allowed"
      : "bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] hover:brightness-110 hover:shadow-[0_6px_20px_rgba(var(--hk-accent-rgb),0.3)]";
  const textColor = color === "gray" ? "" : "text-[var(--hk-accent-solid-text)]";
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${mono} w-full inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] border cursor-pointer transition-all duration-150 font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${c} ${textColor}`}
    >
      {children}
    </button>
  );
};

const SubmissionForm = ({ isOpen, onClose, hackathonId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState(null);
  const [submissionPhase, setSubmissionPhase] = useState(null);
  const [existingSubmissionId, setExistingSubmissionId] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);

  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!hackathonId || !isOpen) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const hackRes = await HackathonAPI.getHackathon(hackathonId);
        const h = hackRes.data;
        if (cancelled) return;
        setHackathon(h);

        const statusRes = await SubmissionAPI.getMySubmission(hackathonId);
        const submissionPhases = statusRes.data.phases || [];

        // Prefer whichever phase is actually open for submission right now;
        // otherwise fall back to one already submitted (so past work is still
        // viewable), then finally just the last phase in the list.
        const current =
          submissionPhases.find((p) => p.canSubmit) ||
          [...submissionPhases].reverse().find((p) => p.submitted) ||
          submissionPhases[submissionPhases.length - 1] ||
          null;

        // Fields must come from the SAME phase as `current` — matching by
        // phaseId, not just "the first SUBMISSION-type phase" — otherwise a
        // hackathon with multiple submission rounds shows the wrong round's
        // fields.
        const phase = current
          ? h.phases?.find((p) => p._id?.toString() === current.phaseId?.toString())
          : h.phases?.find((p) => p.phaseType === "SUBMISSION");
        setSubmissionPhase(phase || null);

        const normalized = normalizeFields(phase?.submissionForm || [], "submission");
        setFields(normalized);

        if (current?.submitted) {
          setExistingSubmissionId(current.submissionId);
          setCanSubmit(current.canSubmit);

          const subRes = await SubmissionAPI.getSubmission(current.submissionId);
          const sub = subRes.data.submission;
          if (!cancelled) {
            setTitle(sub.title || "");
            setDescription(sub.description || "");
            setValues(buildInitialValues(normalized, sub.submissionData || {}));
          }
        } else {
          setExistingSubmissionId(null);
          setCanSubmit(current?.canSubmit ?? true);
          setValues(buildInitialValues(normalized));
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load submission details"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hackathonId, isOpen]);

  const handleFieldChange = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = validateFields(fields, values);
    if (!title.trim() || !description.trim() || Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      if (!title.trim() || !description.trim()) {
        toast.error("Title and description are required");
      }
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, description, submissionData: values };
      if (existingSubmissionId) {
        await SubmissionAPI.updateSubmission(
          hackathonId,
          existingSubmissionId,
          payload
        );
        toast.success("Submission updated!", { duration: 1000 });
      } else {
        await SubmissionAPI.createSubmission(hackathonId, payload);
        toast.success("Submission successful!", { duration: 1000 });
      }
      setTimeout(onClose, 1200);
    } catch (err) {
      if (err.response?.status === 429)
        toast.error("Too many requests. Please try again later.");
      else
        toast.error(
          err.response?.data?.message || err.message || "Submission failed."
        );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || loading || !hackathon) return null;

  const totalPrize =
    hackathon.prizes?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
  const daysLeft = submissionPhase
    ? Math.ceil((new Date(submissionPhase.endDate) - new Date()) / 86400000)
    : null;
  const isDeadlineOver = submissionPhase
    ? new Date() > new Date(submissionPhase.endDate)
    : false;

  return createPortal(
    <>
      <div
        className={`${mono} fixed inset-0 bg-black/55 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4`}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl bg-[rgba(var(--hk-bg-rgb),0.98)] border border-[rgba(var(--hk-card-border-rgb),0.29)] dark:border-[rgba(var(--hk-card-border-rgb),0.18)] rounded-[4px] p-4 sm:p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-y-auto overflow-x-hidden max-h-[90vh] [scrollbar-width:thin] [scrollbar-color:rgba(var(--hk-accent-rgb),0.2)_transparent]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(var(--hk-card-border-rgb),0.88)] dark:border-[rgba(var(--hk-card-border-rgb),0.55)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(var(--hk-card-border-rgb),0.88)] dark:border-[rgba(var(--hk-card-border-rgb),0.55)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--hk-accent-rgb),0.3)] to-transparent" />

          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className={`${syne} font-extrabold text-[var(--hk-text)] text-xl tracking-tight`}>
              {hackathon.title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] hover:text-[var(--hk-accent-solid)] hover:border-[rgba(var(--hk-card-border-rgb),0.56)] dark:hover:border-[rgba(var(--hk-card-border-rgb),0.35)] transition-all cursor-pointer flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
            <StatCard
              icon={Code}
              label="Prize Pool"
              value={`₹${totalPrize.toLocaleString("en-IN")}`}
            />
            {daysLeft !== null && (
              <StatCard icon={Clock} label="Days Left" value={`${Math.max(daysLeft, 0)} Days`} />
            )}
            <StatCard
              icon={Users}
              label="Participants"
              value={hackathon.numParticipants || 0}
            />
          </div>

          {existingSubmissionId && (
            <div className="relative bg-[rgba(var(--hk-accent-rgb),0.05)] border border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] rounded-[3px] p-4 mb-5">
              <p className={`${syne} font-extrabold text-[var(--hk-accent-solid)] text-sm tracking-tight`}>
                Already Submitted — you can update before the deadline.
              </p>
            </div>
          )}

          {!canSubmit && !existingSubmissionId ? (
            <p className={`${mono} text-[0.68rem] text-[rgba(var(--hk-amber-rgb),0.95)] dark:text-[rgba(var(--hk-amber-rgb),0.7)]`}>
              Submissions are not open for this event right now.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className={`${mono} block text-[0.6rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.6)] mb-1.5`}>
                  Title <span className="text-[rgb(var(--hk-red-rgb))]">*</span>
                </label>
                <input
                  type="text"
                  className={inp}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={`${mono} block text-[0.6rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.6)] mb-1.5`}>
                  Description <span className="text-[rgb(var(--hk-red-rgb))]">*</span>
                </label>
                <textarea
                  rows={3}
                  className={inp}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {fields.length > 0 && (
                <DynamicFieldsForm
                  fields={fields}
                  values={values}
                  onChange={handleFieldChange}
                  errors={errors}
                  resourceType="submission"
                  hackathonId={hackathonId}
                />
              )}

              {isDeadlineOver ? (
                <PrimaryBtn disabled color="gray">
                  Submission Closed
                </PrimaryBtn>
              ) : (
                <PrimaryBtn disabled={submitting} color={existingSubmissionId ? "amber" : "green"}>
                  {submitting
                    ? existingSubmissionId
                      ? "Updating…"
                      : "Submitting…"
                    : existingSubmissionId
                    ? "Update Submission"
                    : "Submit Project"}
                </PrimaryBtn>
              )}
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default SubmissionForm;
