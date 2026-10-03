import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  UploadCloud,
  ImagePlus,
  Trash2,
  Calendar,
  ListChecks,
  Gavel,
  ThumbsUp,
  Users,
  Image as ImageIcon,
  FileText,
  Swords,
} from "lucide-react";
import { MediaAPI } from "../../api/media.api.js";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import { getFileMeta, formatBytes } from "../../utils/fileType.js";
import "./HackathonForm.css";
import "../Styles/AllHackathons.css";

/* ─────────────────────────────────────────────────────────────────────────
   Shared primitives
───────────────────────────────────────────────────────────────────────── */

const Section = ({ badge, title, children }) => (
  <div className="hf-section">
    <div className="hf-section-badge">{badge}</div>
    {title && <div className="hf-section-title">{title}</div>}
    <div className="hf-section-body">{children}</div>
  </div>
);

const Field = ({ label, required, children, hint }) => (
  <div className="hf-field">
    <label className="hf-label">
      {label} {required && <span className="hf-required">*</span>}
    </label>
    {children}
    {hint && <p className="hf-hint">{hint}</p>}
  </div>
);

const ChipInput = ({ values, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="hf-chip-row">
          {values.map((v, i) => (
            <span key={i} className="hf-chip">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="hf-inline-add">
        <input
          className="hf-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className="hf-add-btn" onClick={add}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

const ImageBox = ({ preview, onSelect, onClear, label }) => {
  const ref = useRef(null);
  return preview ? (
    <div className="hf-image-preview">
      <img src={preview} alt="" />
      <div className="hf-image-overlay">
        <button type="button" onClick={() => ref.current?.click()}>
          <ImagePlus size={12} /> Replace
        </button>
        <button type="button" onClick={onClear}>
          <Trash2 size={12} /> Remove
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        className="hf-sr-only"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files[0] && onSelect(e.target.files[0])}
      />
    </div>
  ) : (
    <div className="hf-dropzone" onClick={() => ref.current?.click()}>
      <UploadCloud size={20} />
      <span>{label}</span>
      <input
        ref={ref}
        type="file"
        className="hf-sr-only"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files[0] && onSelect(e.target.files[0])}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Prizes / Resources / Contacts / FAQs — small object-list editors
───────────────────────────────────────────────────────────────────────── */

const PrizesEditor = ({ values, onChange }) => {
  const [draft, setDraft] = useState({ title: "", description: "", amount: "" });
  const add = () => {
    const amt = Number(draft.amount);
    if (!draft.title.trim() || !amt || amt <= 0) return;
    onChange([...values, { title: draft.title.trim(), description: draft.description.trim(), amount: amt }]);
    setDraft({ title: "", description: "", amount: "" });
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="hf-list">
          {values.map((p, i) => (
            <div key={i} className="hf-list-item">
              <div>
                <div className="hf-list-item-title">{p.title}</div>
                {p.description && <div className="hf-list-item-sub">{p.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                <span className="hf-amount">₹{p.amount.toLocaleString("en-IN")}</span>
                <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="hf-row-3">
        <input className="hf-input" placeholder="Title (e.g. 1st Place)" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input className="hf-input" placeholder="Description (optional)" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input className="hf-input" type="number" placeholder="₹ Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
      </div>
      <button type="button" className="hf-add-full" onClick={add}>
        <Plus size={12} /> Add Prize
      </button>
    </div>
  );
};

const RESOURCE_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.zip";

const ResourcesEditor = ({ values, onChange }) => {
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await MediaAPI.uploadFile(file, "resource", undefined, undefined, true);
      const { url, key, format, size, originalName } = res.data.file;
      onChange([
        ...values,
        { title: title.trim() || originalName, url, key, format, size },
      ]);
      setTitle("");
      toast.success("Resource uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      {values.length > 0 && (
        <div className="hf-list">
          {values.map((r, i) => {
            const { icon: Icon, color, label } = getFileMeta(r.format);
            return (
              <div key={i} className="hf-list-item">
                <div className="hf-file-row">
                  <span className="hf-file-icon" style={{ color }}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <div className="hf-list-item-title">{r.title}</div>
                    <div className="hf-list-item-sub">
                      {label}
                      {r.size ? ` · ${formatBytes(r.size)}` : ""}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="hf-row-2">
        <input
          className="hf-input"
          placeholder="Display name (optional — defaults to filename)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          className="hf-add-full"
          style={{ marginTop: 0 }}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            "Uploading…"
          ) : (
            <>
              <UploadCloud size={12} /> Upload File
            </>
          )}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        className="hf-sr-only"
        accept={RESOURCE_ACCEPT}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />
      <p className="hf-hint" style={{ marginTop: "0.4rem" }}>
        PDF, DOC, DOCX, PPT, PPTX, ZIP · Max 50MB
      </p>
    </div>
  );
};

const CONTACT_TYPES = ["EMAIL", "PHONE", "LINKEDIN", "DISCORD", "WEBSITE", "OTHER"];

const ContactsEditor = ({ values, onChange }) => {
  const [draft, setDraft] = useState({ label: "", type: "EMAIL", value: "" });
  const add = () => {
    if (!draft.label.trim() || !draft.value.trim()) return;
    onChange([...values, { ...draft, label: draft.label.trim(), value: draft.value.trim() }]);
    setDraft({ label: "", type: "EMAIL", value: "" });
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="hf-list">
          {values.map((c, i) => (
            <div key={i} className="hf-list-item">
              <div>
                <div className="hf-list-item-title">{c.label} <span className="hf-tag-inline">{c.type}</span></div>
                <div className="hf-list-item-sub break-all">{c.value}</div>
              </div>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="hf-row-3">
        <input className="hf-input" placeholder="Label (e.g. Support Email)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        <select className="hf-input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
          {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="hf-input" placeholder="Value" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
      </div>
      <button type="button" className="hf-add-full" onClick={add}>
        <Plus size={12} /> Add Contact
      </button>
    </div>
  );
};

const FaqsEditor = ({ values, onChange }) => {
  const [draft, setDraft] = useState({ question: "", answer: "" });
  const add = () => {
    if (!draft.question.trim() || !draft.answer.trim()) return;
    onChange([...values, { question: draft.question.trim(), answer: draft.answer.trim() }]);
    setDraft({ question: "", answer: "" });
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="hf-list">
          {values.map((f, i) => (
            <div key={i} className="hf-list-item">
              <div>
                <div className="hf-list-item-title">{f.question}</div>
                <div className="hf-list-item-sub">{f.answer}</div>
              </div>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="hf-row-2">
        <input className="hf-input" placeholder="Question" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
        <input className="hf-input" placeholder="Answer" value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
      </div>
      <button type="button" className="hf-add-full" onClick={add}>
        <Plus size={12} /> Add FAQ
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Registration form field builder (top-level registrationForm[])
───────────────────────────────────────────────────────────────────────── */

const REG_FIELD_TYPES = ["text", "email", "number", "textarea", "select", "checkbox", "url"];

const RegistrationFormEditor = ({ values, onChange }) => {
  const [draft, setDraft] = useState({ fieldName: "", label: "", type: "text", required: true, options: "" });
  const add = () => {
    if (!draft.fieldName.trim() || !draft.label.trim()) return;
    const field = {
      fieldName: draft.fieldName.trim().replace(/\s+/g, "_"),
      label: draft.label.trim(),
      type: draft.type,
      required: draft.required,
      editable: true,
    };
    if (draft.type === "select") {
      field.options = draft.options.split(",").map((o) => o.trim()).filter(Boolean);
    }
    onChange([...values, field]);
    setDraft({ fieldName: "", label: "", type: "text", required: true, options: "" });
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="hf-list">
          {values.map((f, i) => (
            <div key={i} className="hf-list-item">
              <div>
                <div className="hf-list-item-title">{f.label} <span className="hf-tag-inline">{f.type}</span> {f.required && <span className="hf-tag-inline hf-tag-inline--req">required</span>}</div>
                <div className="hf-list-item-sub">{f.fieldName}{f.options?.length ? ` · ${f.options.join(", ")}` : ""}</div>
              </div>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="hf-row-3">
        <input className="hf-input" placeholder="Field key (e.g. college_name)" value={draft.fieldName} onChange={(e) => setDraft({ ...draft, fieldName: e.target.value })} />
        <input className="hf-input" placeholder="Label shown to user" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        <select className="hf-input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
          {REG_FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {draft.type === "select" && (
        <input className="hf-input mt-2" placeholder="Comma-separated options" value={draft.options} onChange={(e) => setDraft({ ...draft, options: e.target.value })} />
      )}
      <label className="hf-checkbox-row mt-2">
        <input type="checkbox" checked={draft.required} onChange={(e) => setDraft({ ...draft, required: e.target.checked })} />
        Required field
      </label>
      <button type="button" className="hf-add-full" onClick={add}>
        <Plus size={12} /> Add Registration Field
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Submission form field builder (per-phase submissionForm[])
───────────────────────────────────────────────────────────────────────── */

const SUB_FIELD_TYPES = ["TEXT", "TEXTAREA", "URL", "DOCUMENT", "IMAGE", "VIDEO", "MULTI_DOCUMENT", "MULTI_IMAGE", "MULTI_VIDEO"];
const isFileType = (t) => t !== "TEXT" && t !== "TEXTAREA" && t !== "URL";

const DEFAULT_DRAFT = { fieldName: "", label: "", fieldType: "TEXT", required: true, maxFiles: 1, maxSizeMB: 50, allowedExtensions: "" };

const parseExtensions = (raw) =>
  raw
    .split(",")
    .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);

const SubmissionFormEditor = ({ values, onChange }) => {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const add = () => {
    if (!draft.fieldName.trim() || !draft.label.trim()) return;
    const field = {
      fieldName: draft.fieldName.trim().replace(/\s+/g, "_"),
      label: draft.label.trim(),
      fieldType: draft.fieldType,
      required: draft.required,
      editable: true,
    };
    if (isFileType(draft.fieldType)) {
      field.maxFiles = Number(draft.maxFiles) || 1;
      field.maxSizeMB = Number(draft.maxSizeMB) || 50;
      const extensions = parseExtensions(draft.allowedExtensions);
      if (extensions.length) field.allowedExtensions = extensions;
    }
    onChange([...values, field]);
    setDraft(DEFAULT_DRAFT);
  };
  return (
    <div className="hf-nested">
      {values.length > 0 && (
        <div className="hf-list">
          {values.map((f, i) => (
            <div key={i} className="hf-list-item">
              <div>
                <div className="hf-list-item-title">{f.label} <span className="hf-tag-inline">{f.fieldType}</span> {f.required && <span className="hf-tag-inline hf-tag-inline--req">required</span>}</div>
                <div className="hf-list-item-sub">
                  {f.fieldName}
                  {isFileType(f.fieldType) ? ` · max ${f.maxFiles} file(s) · ${f.maxSizeMB}MB` : ""}
                  {isFileType(f.fieldType) && f.allowedExtensions?.length
                    ? ` · ${f.allowedExtensions.map((e) => `.${e}`).join(", ")}`
                    : ""}
                </div>
              </div>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="hf-row-3">
        <input className="hf-input" placeholder="Field key (e.g. github_link)" value={draft.fieldName} onChange={(e) => setDraft({ ...draft, fieldName: e.target.value })} />
        <input className="hf-input" placeholder="Label shown to user" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        <select className="hf-input" value={draft.fieldType} onChange={(e) => setDraft({ ...draft, fieldType: e.target.value })}>
          {SUB_FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {isFileType(draft.fieldType) && (
        <>
          <div className="hf-row-2 mt-2">
            <input className="hf-input" type="number" placeholder="Max files" value={draft.maxFiles} onChange={(e) => setDraft({ ...draft, maxFiles: e.target.value })} />
            <input className="hf-input" type="number" placeholder="Max size (MB)" value={draft.maxSizeMB} onChange={(e) => setDraft({ ...draft, maxSizeMB: e.target.value })} />
          </div>
          <input
            className="hf-input mt-2"
            placeholder="Allowed file types (e.g. pdf, zip, docx) — leave blank to allow any supported type"
            value={draft.allowedExtensions}
            onChange={(e) => setDraft({ ...draft, allowedExtensions: e.target.value })}
          />
        </>
      )}
      <label className="hf-checkbox-row mt-2">
        <input type="checkbox" checked={draft.required} onChange={(e) => setDraft({ ...draft, required: e.target.checked })} />
        Required field
      </label>
      <button type="button" className="hf-add-full" onClick={add}>
        <Plus size={12} /> Add Submission Field
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Phases builder
───────────────────────────────────────────────────────────────────────── */

const PHASE_TYPES = ["REGISTRATION", "SUBMISSION", "REVIEW", "ANNOUNCEMENT", "MATCH_ROUND"];
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  // toISOString() always renders UTC, but <input type="datetime-local">
  // expects the browser's local wall-clock time — shift by the local
  // timezone offset first so the picker shows the actual saved moment.
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const PhaseCard = ({ phase, onChange, onRemove, eventFormat }) => {
  const set = (field, val) => onChange({ ...phase, [field]: val });
  const availableTypes =
    eventFormat === "ON_SPOT"
      ? PHASE_TYPES.filter((t) => t !== "SUBMISSION" && t !== "REVIEW")
      : PHASE_TYPES.filter((t) => t !== "MATCH_ROUND");
  return (
    <div className="hf-phase-card">
      <div className="hf-phase-head">
        <input
          className="hf-input hf-phase-name"
          placeholder="Phase name (e.g. Round 1 Submissions)"
          value={phase.phaseName}
          onChange={(e) => set("phaseName", e.target.value)}
        />
        <select className="hf-input hf-phase-type" value={phase.phaseType} onChange={(e) => set("phaseType", e.target.value)}>
          {availableTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="button" className="hf-icon-btn hf-icon-btn--danger" onClick={onRemove}>
          <Trash2 size={13} />
        </button>
      </div>
      <div className="hf-row-2">
        <div>
          <label className="hf-label hf-label--sm">Start</label>
          <input type="datetime-local" className="hf-input" value={toLocalInput(phase.startDate)} onChange={(e) => set("startDate", e.target.value)} />
        </div>
        <div>
          <label className="hf-label hf-label--sm">End</label>
          <input type="datetime-local" className="hf-input" value={toLocalInput(phase.endDate)} onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>
      <label className="hf-checkbox-row mt-2">
        <input type="checkbox" checked={phase.isActive !== false} onChange={(e) => set("isActive", e.target.checked)} />
        Active
      </label>

      {phase.phaseType === "SUBMISSION" && (
        <div className="mt-3">
          <label className="hf-label hf-label--sm">Submission form fields</label>
          <SubmissionFormEditor values={phase.submissionForm || []} onChange={(v) => set("submissionForm", v)} />

          <label className="hf-label hf-label--sm mt-3">
            Weight in final score (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            className="hf-input"
            value={phase.weight ?? 0}
            onChange={(e) => set("weight", Number(e.target.value))}
          />

          <div className="hf-row-2 mt-2">
            <div>
              <label className="hf-label hf-label--sm">Qualification rule</label>
              <select
                className="hf-input"
                value={phase.qualificationRule?.type || "NONE"}
                onChange={(e) =>
                  set("qualificationRule", {
                    ...(phase.qualificationRule || {}),
                    type: e.target.value,
                  })
                }
              >
                <option value="NONE">None — everyone advances</option>
                <option value="TOP_N">Top N teams advance</option>
                <option value="THRESHOLD">Minimum score to advance</option>
              </select>
            </div>
            {phase.qualificationRule?.type && phase.qualificationRule.type !== "NONE" && (
              <div>
                <label className="hf-label hf-label--sm">
                  {phase.qualificationRule.type === "TOP_N" ? "Top N" : "Minimum score"}
                </label>
                <input
                  type="number"
                  className="hf-input"
                  value={phase.qualificationRule?.value ?? ""}
                  onChange={(e) =>
                    set("qualificationRule", {
                      ...(phase.qualificationRule || {}),
                      value: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>

          <details className="mt-2">
            <summary className="hf-label hf-label--sm" style={{ cursor: "pointer" }}>
              Override judging scale for this round
            </summary>
            <div className="hf-row-2 mt-2">
              <div>
                <label className="hf-label hf-label--sm">Min Score</label>
                <input
                  type="number"
                  className="hf-input"
                  value={phase.judgingConfig?.minScore ?? ""}
                  onChange={(e) =>
                    set("judgingConfig", {
                      ...(phase.judgingConfig || {}),
                      minScore: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="hf-label hf-label--sm">Max Score</label>
                <input
                  type="number"
                  className="hf-input"
                  value={phase.judgingConfig?.maxScore ?? ""}
                  onChange={(e) =>
                    set("judgingConfig", {
                      ...(phase.judgingConfig || {}),
                      maxScore: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

const PhasesEditor = ({ values, onChange, eventFormat }) => {
  const addPhase = () =>
    onChange([
      ...values,
      {
        phaseName: "",
        phaseType: eventFormat === "ON_SPOT" ? "MATCH_ROUND" : "REGISTRATION",
        startDate: "",
        endDate: "",
        isActive: true,
        submissionForm: [],
        weight: 0,
        qualificationRule: { type: "NONE", value: null },
      },
    ]);
  return (
    <div>
      {values.map((p, i) => (
        <PhaseCard
          key={i}
          phase={p}
          eventFormat={eventFormat}
          onChange={(updated) => onChange(values.map((v, j) => (j === i ? updated : v)))}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        />
      ))}
      <button type="button" className="hf-add-full" onClick={addPhase}>
        <Plus size={12} /> Add Phase
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main form
───────────────────────────────────────────────────────────────────────── */

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert", "Tough"];

export const buildDefaultHackathonForm = () => ({
  eventFormat: "SUBMISSION",
  title: "",
  subTitle: "",
  venue: "",
  description: "",
  detailsContent: "",
  difficulty: "Beginner",
  category: [],
  techStacks: [],
  tags: [],
  participationType: "INDIVIDUAL",
  maxTeamSize: 1,
  phases: [],
  registrationForm: [],
  prizes: [],
  resources: [],
  faqs: [],
  contacts: [],
  votingConfig: { enabled: false, allowSelfVote: false, onlyParticipantsCanVote: true, voteWeight: 20 },
  judgingConfig: { minScore: 0, maxScore: 100 },
  showResult: true,
  publicLeaderboardLimit: 1,
  image: null,
  gallery: [],
});

export default function HackathonForm({ initialValues, onSubmit, submitLabel = "Save", isSubmitting = false }) {
  const [form, setForm] = useState({ ...buildDefaultHackathonForm(), ...initialValues });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialValues?.image?.url || "");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState(initialValues?.gallery || []);
  const [uploading, setUploading] = useState(false);
  const galleryRef = useRef(null);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setNested = (parent, field, val) =>
    setForm((f) => ({ ...f, [parent]: { ...f[parent], [field]: val } }));

  const handleBannerSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner must be under 5MB.");
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleGalleryAdd = (files) => {
    const arr = Array.from(files).slice(0, 10 - existingGallery.length - galleryFiles.length);
    setGalleryFiles((prev) => [...prev, ...arr]);
    setGalleryPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.description.trim()) return toast.error("Description is required.");
    if (form.phases.length === 0) return toast.error("At least one phase is required.");
    if (form.participationType === "TEAM" && Number(form.maxTeamSize) < 2)
      return toast.error("Team events need maxTeamSize of at least 2.");

    setUploading(true);
    try {
      let image = form.image;
      if (bannerFile) {
        const res = await MediaAPI.uploadFile(bannerFile, "banner", undefined, undefined, true);
        image = { url: res.data.file.url, key: res.data.file.key };
      }

      let gallery = [...existingGallery];
      if (galleryFiles.length > 0) {
        const uploaded = await Promise.all(
          galleryFiles.map((f) => MediaAPI.uploadFile(f, "gallery", undefined, undefined, true))
        );
        gallery = [...gallery, ...uploaded.map((r) => ({ url: r.data.file.url, key: r.data.file.key }))];
      }

      const phases = form.phases.map((p) => ({
        ...p,
        startDate: p.startDate ? new Date(p.startDate).toISOString() : p.startDate,
        endDate: p.endDate ? new Date(p.endDate).toISOString() : p.endDate,
      }));

      const payload = {
        ...form,
        image,
        gallery,
        phases,
        maxTeamSize: Number(form.maxTeamSize) || 1,
        judgingConfig: {
          minScore: Number(form.judgingConfig.minScore) || 0,
          maxScore: Number(form.judgingConfig.maxScore) || 100,
        },
        votingConfig: {
          ...form.votingConfig,
          voteWeight: Number(form.votingConfig.voteWeight) || 0,
        },
        publicLeaderboardLimit: Number(form.publicLeaderboardLimit) || 1,
      };

      await onSubmit(payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const busy = isSubmitting || uploading;

  return (
    <form onSubmit={handleSubmit} className="hf-root">
      <Section badge="01 / basic information">
        <Field label="Event Format" hint="Submission-based events are judged from uploaded work. On-Spot events are live, in-person, bracket-style competitions (Team vs Team matches).">
          <div className="hf-radio-row">
            {[
              { value: "SUBMISSION", label: "Submission-Based", icon: FileText },
              { value: "ON_SPOT", label: "On-Spot Event", icon: Swords },
            ].map(({ value, label, icon: Icon }) => (
              <label key={value} className={`hf-radio-pill ${form.eventFormat === value ? "hf-radio-pill--active" : ""}`}>
                <input type="radio" name="eventFormat" checked={form.eventFormat === value} onChange={() => set("eventFormat", value)} />
                <Icon size={12} />
                {label}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Title" required>
          <input className="hf-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Event title" />
        </Field>
        <Field label="Subtitle">
          <input className="hf-input" value={form.subTitle} onChange={(e) => set("subTitle", e.target.value)} placeholder="Short tagline" />
        </Field>
        <Field label="Venue" hint="Physical location, or 'Online' / 'Hybrid'">
          <input className="hf-input" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Devlup Labs Campus, or Online" />
        </Field>
        <Field label="Description" required>
          <textarea className="hf-input hf-textarea" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short summary shown on listing cards" />
        </Field>
        <Field label="Details Content" hint="Long-form content shown on the event's Details tab.">
          <RichTextEditor
            value={form.detailsContent}
            onChange={(html) => set("detailsContent", html)}
            placeholder="Full write-up: rules, guidelines, about the organiser…"
          />
        </Field>
        <Field label="Banner Image">
          <ImageBox preview={bannerPreview} onSelect={handleBannerSelect} onClear={() => { setBannerFile(null); setBannerPreview(""); set("image", null); }} label="Click to upload banner · JPEG/PNG/WEBP · Max 5MB" />
        </Field>
        <Field label="Gallery Images" hint={`${existingGallery.length + galleryFiles.length}/10 used`}>
          <div className="hf-gallery-grid">
            {existingGallery.map((g, i) => (
              <div key={`e-${i}`} className="hf-gallery-item">
                <img src={g.url} alt="" />
                <button type="button" onClick={() => setExistingGallery(existingGallery.filter((_, j) => j !== i))}>
                  <X size={11} />
                </button>
              </div>
            ))}
            {galleryPreviews.map((url, i) => (
              <div key={`n-${i}`} className="hf-gallery-item">
                <img src={url} alt="" />
                <button type="button" onClick={() => {
                  setGalleryFiles(galleryFiles.filter((_, j) => j !== i));
                  setGalleryPreviews(galleryPreviews.filter((_, j) => j !== i));
                }}>
                  <X size={11} />
                </button>
              </div>
            ))}
            {existingGallery.length + galleryFiles.length < 10 && (
              <div className="hf-gallery-add" onClick={() => galleryRef.current?.click()}>
                <ImageIcon size={16} />
                <input ref={galleryRef} type="file" multiple className="hf-sr-only" accept="image/*" onChange={(e) => e.target.files.length && handleGalleryAdd(e.target.files)} />
              </div>
            )}
          </div>
        </Field>
      </Section>

      <Section badge="02 / classification">
        <Field label="Difficulty">
          <select className="hf-input" value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Categories" hint="Freeform — e.g. Web Dev, AI/ML, Fintech">
          <ChipInput values={form.category} onChange={(v) => set("category", v)} placeholder="Add a category and press Enter" />
        </Field>
        <Field label="Tech Stacks">
          <ChipInput values={form.techStacks} onChange={(v) => set("techStacks", v)} placeholder="Add a tech stack and press Enter" />
        </Field>
        <Field label="Tags" hint="Used for search & filtering on the listing page">
          <ChipInput values={form.tags} onChange={(v) => set("tags", v)} placeholder="Add a tag and press Enter" />
        </Field>
      </Section>

      <Section badge="03 / participation">
        <Field label="Participation Type">
          <div className="hf-radio-row">
            {["INDIVIDUAL", "TEAM"].map((t) => (
              <label key={t} className={`hf-radio-pill ${form.participationType === t ? "hf-radio-pill--active" : ""}`}>
                <input type="radio" name="participationType" checked={form.participationType === t} onChange={() => set("participationType", t)} />
                {t === "INDIVIDUAL" ? <Users size={12} /> : <Users size={12} />}
                {t}
              </label>
            ))}
          </div>
        </Field>
        {form.participationType === "TEAM" && (
          <Field label="Max Team Size" required>
            <input type="number" min={2} className="hf-input" value={form.maxTeamSize} onChange={(e) => set("maxTeamSize", e.target.value)} />
          </Field>
        )}
      </Section>

      <Section badge="04 / phases" title="Event Timeline">
        <p className="hf-hint mb-2">
          <Calendar size={11} style={{ display: "inline", marginRight: 4 }} />
          Define each stage of the event. Submission-type phases get their own dynamic submission form.
        </p>
        <PhasesEditor values={form.phases} onChange={(v) => set("phases", v)} eventFormat={form.eventFormat} />
      </Section>

      <Section badge="05 / registration form">
        <p className="hf-hint mb-2">
          <ListChecks size={11} style={{ display: "inline", marginRight: 4 }} />
          Extra fields collected when a participant registers, beyond their basic profile.
        </p>
        <RegistrationFormEditor values={form.registrationForm} onChange={(v) => set("registrationForm", v)} />
      </Section>

      <Section badge="06 / prizes" title="Prizes">
        <Field label="">
          <PrizesEditor values={form.prizes} onChange={(v) => set("prizes", v)} />
        </Field>
      </Section>

      {form.eventFormat !== "ON_SPOT" && (
      <Section badge="07 / judging & voting">
        <div className="hf-row-2">
          <Field label="Min Score">
            <input type="number" className="hf-input" value={form.judgingConfig.minScore} onChange={(e) => setNested("judgingConfig", "minScore", e.target.value)} />
          </Field>
          <Field label="Max Score">
            <input type="number" className="hf-input" value={form.judgingConfig.maxScore} onChange={(e) => setNested("judgingConfig", "maxScore", e.target.value)} />
          </Field>
        </div>
        <label className="hf-toggle-row">
          <div>
            <div className="hf-toggle-title"><ThumbsUp size={12} /> Community Voting</div>
            <div className="hf-toggle-desc">Let participants vote on submissions</div>
          </div>
          <div className="hf-switch">
            <input type="checkbox" checked={form.votingConfig.enabled} onChange={(e) => setNested("votingConfig", "enabled", e.target.checked)} />
            <span className="hf-slider" />
          </div>
        </label>
        {form.votingConfig.enabled && (
          <>
            <label className="hf-toggle-row">
              <div>
                <div className="hf-toggle-title">Allow Self-Vote</div>
              </div>
              <div className="hf-switch">
                <input type="checkbox" checked={form.votingConfig.allowSelfVote} onChange={(e) => setNested("votingConfig", "allowSelfVote", e.target.checked)} />
                <span className="hf-slider" />
              </div>
            </label>
            <label className="hf-toggle-row">
              <div>
                <div className="hf-toggle-title">Only Participants Can Vote</div>
              </div>
              <div className="hf-switch">
                <input type="checkbox" checked={form.votingConfig.onlyParticipantsCanVote} onChange={(e) => setNested("votingConfig", "onlyParticipantsCanVote", e.target.checked)} />
                <span className="hf-slider" />
              </div>
            </label>
            <Field label="Vote Weight %" hint="How much community votes count toward the final score, vs judge scores">
              <input type="number" min={0} max={100} className="hf-input" value={form.votingConfig.voteWeight} onChange={(e) => setNested("votingConfig", "voteWeight", e.target.value)} />
            </Field>
          </>
        )}
        <label className="hf-toggle-row">
          <div>
            <div className="hf-toggle-title"><Gavel size={12} /> Show Results Publicly</div>
          </div>
          <div className="hf-switch">
            <input type="checkbox" checked={form.showResult} onChange={(e) => set("showResult", e.target.checked)} />
            <span className="hf-slider" />
          </div>
        </label>
        {form.showResult && (
          <Field label="Public Leaderboard Limit" hint="How many top submissions are shown publicly">
            <input type="number" min={1} className="hf-input" value={form.publicLeaderboardLimit} onChange={(e) => set("publicLeaderboardLimit", e.target.value)} />
          </Field>
        )}
      </Section>
      )}

      <Section badge="08 / resources & faqs">
        <Field label="Resources" hint="Reference material links for participants">
          <ResourcesEditor values={form.resources} onChange={(v) => set("resources", v)} />
        </Field>
        <Field label="FAQs">
          <FaqsEditor values={form.faqs} onChange={(v) => set("faqs", v)} />
        </Field>
      </Section>

      <Section badge="09 / contact">
        <Field label="">
          <ContactsEditor values={form.contacts} onChange={(v) => set("contacts", v)} />
        </Field>
      </Section>

      <button type="submit" disabled={busy} className="hf-submit-btn">
        {busy ? <span className="hf-spinner" /> : <Plus size={15} />}
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
