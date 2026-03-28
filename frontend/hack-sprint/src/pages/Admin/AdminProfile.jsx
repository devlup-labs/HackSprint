import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  Check,
  X,
  User,
  Shield,
  Clock,
  CheckCircle,
  Trophy,
  ArrowRight,
  Users,
  Calendar,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  HelpCircle,
  Star,
  Layers,
  AlertCircle,
  BookOpen,
  Link2,
  Info,
  Gift,
  Zap,
  XCircle,
  MessageSquare,
  Pencil,
  UploadCloud,
  ImagePlus,
  Trash2,
  Save,
} from "lucide-react";
import {
  getAdminDetails,
  getAdminHackathons,
  getPendingHackathons,
  approveHackathon,
  rejectHackathon,
  deleteHackathon,
  editHackathon,
} from "../../backendApis/api";
import { createPortal } from "react-dom";
import "./AdminProfile.css";

/* ── Background ── */
const GridBackground = () => <div className="ad-bg" />;

/* ── Status pill ── */
const StatusPill = ({ status }) => {
  if (status === "approved")
    return (
      <span className="ad-status-pill ad-status-pill--approved">
        <CheckCircle size={10} /> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="ad-status-pill ad-status-pill--rejected">
        <XCircle size={10} /> Rejected
      </span>
    );
  return (
    <span className="ad-status-pill ad-status-pill--pending">
      <Clock size={10} /> Pending
    </span>
  );
};

const Chip = ({ children, color = "green" }) => (
  <span className={`ad-chip ad-chip--${color}`}>{children}</span>
);

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="ad-detail-row">
      <Icon size={12} />
      <span className="ad-detail-key">{label}</span>
      <span className="ad-detail-val">{value}</span>
    </div>
  );
};

/* ── Reject modal ── */
const RejectModal = ({ hackathon, onConfirm, onCancel, isLoading }) => {
  const [reason, setReason] = useState("");
  const textareaRef = useRef(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal-backdrop" onClick={onCancel} />
      <div className="ad-modal">
        <div className="ad-modal-topline" />
        <div className="ad-modal-header">
          <div className="ad-modal-icon">
            <XCircle size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ad-modal-title">Reject Hackathon</div>
            <div className="ad-modal-sub">
              Rejecting{" "}
              <strong style={{ color: "#fff" }}>"{hackathon.title}"</strong>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="ad-modal-body">
          <div>
            <label
              className="ad-label"
              style={{ color: "rgba(255,96,96,0.6)" }}
            >
              <MessageSquare
                size={10}
                style={{ display: "inline", marginRight: 4 }}
              />
              Rejection Reason <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Explain why this hackathon is being rejected…"
              rows={4}
              className="ad-modal-input"
            />
            <div className="ad-char-count" style={{ marginTop: "0.3rem" }}>
              <span
                className={reason.length > 450 ? "ad-char-count--warn" : ""}
              >
                {reason.length}/500
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="ad-action-btn ad-action-btn--cancel"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!reason.trim()) {
                  toast.error("Please provide a reason.");
                  return;
                }
                onConfirm(reason.trim());
              }}
              disabled={isLoading || !reason.trim()}
              className="ad-action-btn ad-action-btn--reject"
              style={{ flex: 1, justifyContent: "center" }}
            >
              {isLoading ? (
                <>
                  <div className="ad-spinner ad-spinner--sm" /> Rejecting…
                </>
              ) : (
                <>
                  <XCircle size={13} /> Confirm Reject
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Edit modal ── */
const EditSection = ({ badge, children }) => (
  <div className="ad-edit-section">
    <div className="ad-edit-section-title">{badge}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {children}
    </div>
  </div>
);

const ListEditor = ({
  field,
  label,
  placeholder,
  values,
  listInputs,
  setListInputs,
  onAdd,
  onRemove,
}) => (
  <div>
    <label className="ad-label">{label}</label>
    {values.length > 0 && (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.35rem",
          marginBottom: "0.5rem",
        }}
      >
        {values.map((v, i) => (
          <span
            key={i}
            className="ad-chip ad-chip--green"
            style={{ gap: "0.35rem" }}
          >
            {v}
            <button
              type="button"
              onClick={() => onRemove(field, i)}
              className="ad-list-remove"
              style={{ display: "flex" }}
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    )}
    <div style={{ display: "flex", gap: "0.4rem" }}>
      <input
        value={listInputs[field] || ""}
        onChange={(e) =>
          setListInputs((p) => ({ ...p, [field]: e.target.value }))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(field);
          }
        }}
        placeholder={placeholder}
        className="ad-input"
      />
      <button
        type="button"
        onClick={() => onAdd(field)}
        className="ad-add-icon-btn"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

const EditModal = ({ hackathon, adminData, onClose, onSaved }) => {
  const toLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 16);
  };
  const [form, setForm] = useState({
    title: hackathon.title || "",
    subTitle: hackathon.subTitle || "",
    description: hackathon.description || "",
    overview: hackathon.overview || "",
    difficulty: hackathon.difficulty || "Beginner",
    refMaterial: Array.isArray(hackathon.refMaterial)
      ? hackathon.refMaterial
      : hackathon.refMaterial
      ? [hackathon.refMaterial]
      : [],
    aboutUs: hackathon.aboutUs || "",
    startDate: toLocal(hackathon.startDate),
    endDate: toLocal(hackathon.endDate),
    submissionStartDate: toLocal(hackathon.submissionStartDate),
    submissionEndDate: toLocal(hackathon.submissionEndDate),
    techStackUsed: [...(hackathon.techStackUsed || [])],
    category: [...(hackathon.category || [])],
    themes: [...(hackathon.themes || [])],
    problems: [...(hackathon.problems || [])],
    TandCforHackathon: [...(hackathon.TandCforHackathon || [])],
    evaluationCriteria: [...(hackathon.evaluationCriteria || [])],
    projectSubmission: [...(hackathon.projectSubmission || [])],
    FAQs: [...(hackathon.FAQs || [])],
    rewards: [...(hackathon.rewards || [])],
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(hackathon.image || "");
  const bannerRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [listInputs, setListInputs] = useState({});
  const [faqInput, setFaqInput] = useState({ question: "", answer: "" });
  const [rewardInput, setRewardInput] = useState({
    description: "",
    amount: "",
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const addToList = (field) => {
    const v = (listInputs[field] || "").trim();
    if (!v || form[field].includes(v)) return;
    set(field, [...form[field], v]);
    setListInputs((p) => ({ ...p, [field]: "" }));
  };
  const removeFromList = (field, idx) =>
    set(
      field,
      form[field].filter((_, i) => i !== idx)
    );
  const addFaq = () => {
    if (!faqInput.question.trim() || !faqInput.answer.trim()) return;
    set("FAQs", [
      ...form.FAQs,
      { question: faqInput.question.trim(), answer: faqInput.answer.trim() },
    ]);
    setFaqInput({ question: "", answer: "" });
  };
  const addReward = () => {
    const amt = Number(rewardInput.amount);
    if (!rewardInput.description.trim() || !amt || amt <= 0) return;
    set("rewards", [
      ...form.rewards,
      { description: rewardInput.description.trim(), amount: amt },
    ]);
    setRewardInput({ description: "", amount: "" });
  };
  const handleBanner = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Invalid image format.");
      return;
    }
    if (bannerPreview && bannerPreview.startsWith("blob:"))
      URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      const adminId = adminData._id ?? adminData.id;
      fd.append("hackathonId", hackathon._id);
      fd.append("adminId", adminId);
      [
        "title",
        "subTitle",
        "description",
        "overview",
        "difficulty",
        "aboutUs",
      ].forEach((f) => fd.append(f, form[f]));
      [
        "startDate",
        "endDate",
        "submissionStartDate",
        "submissionEndDate",
      ].forEach((f) => {
        if (form[f]) {
          const d = new Date(form[f]);
          if (!isNaN(d)) fd.append(f, d.toISOString());
        }
      });
      [
        "techStackUsed",
        "category",
        "themes",
        "problems",
        "TandCforHackathon",
        "evaluationCriteria",
        "projectSubmission",
        "refMaterial",
      ].forEach((f) => fd.append(f, JSON.stringify(form[f])));
      fd.append("FAQs", JSON.stringify(form.FAQs));
      fd.append(
        "rewards",
        JSON.stringify(
          form.rewards.filter((r) => r.description && r.amount > 0)
        )
      );
      if (bannerFile) fd.append("image", bannerFile);
      const res = await editHackathon(fd);
      toast.success("Hackathon updated successfully!");
      onSaved(res.data.hackathon);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div className="ad-edit-root">
      <div className="ad-edit-topbar">
        <div className="ad-edit-topbar-left">
          <div className="ad-edit-topbar-icon">
            <Pencil size={16} />
          </div>
          <div>
            <div className="ad-edit-topbar-title">Edit Hackathon</div>
            <div
              className="ad-edit-topbar-sub"
              style={{
                maxWidth: 240,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {hackathon.title}
            </div>
          </div>
        </div>
        <div className="ad-edit-topbar-right">
          <button
            onClick={onClose}
            className="ad-action-btn ad-action-btn--cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ad-action-btn ad-action-btn--approve"
          >
            {isSaving ? (
              <>
                <div className="ad-spinner ad-spinner--sm" /> Saving…
              </>
            ) : (
              <>
                <Save size={13} /> Save
              </>
            )}
          </button>
        </div>
      </div>
      <div className="ad-edit-body">
        <div className="ad-edit-inner">
          <EditSection badge="01 / basic information">
            <div>
              <label className="ad-label">Title *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Hackathon Title"
                className="ad-input"
              />
            </div>
            <div>
              <label className="ad-label">Subtitle</label>
              <input
                value={form.subTitle}
                onChange={(e) => set("subTitle", e.target.value)}
                placeholder="Subtitle"
                className="ad-input"
              />
            </div>
            <div>
              <label className="ad-label">Short Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Short description"
                className="ad-input"
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label className="ad-label">Detailed Overview</label>
              <textarea
                value={form.overview}
                onChange={(e) => set("overview", e.target.value)}
                rows={5}
                placeholder="Detailed overview"
                className="ad-input"
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label className="ad-label">Banner Image</label>
              {bannerPreview ? (
                <div className="ad-banner-wrap">
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="ad-banner-overlay">
                    <button
                      type="button"
                      onClick={() => bannerRef.current?.click()}
                      className="ad-banner-overlay-btn ad-banner-overlay-btn--replace"
                    >
                      <ImagePlus size={11} /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview("");
                      }}
                      className="ad-banner-overlay-btn ad-banner-overlay-btn--remove"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                  <input
                    ref={bannerRef}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] && handleBanner(e.target.files[0])
                    }
                  />
                </div>
              ) : (
                <div
                  className="ad-dropzone"
                  onClick={() => bannerRef.current?.click()}
                >
                  <UploadCloud
                    size={20}
                    style={{ color: "rgba(95,255,96,0.3)" }}
                  />
                  <div className="ad-dropzone-text">
                    Click to upload banner · JPEG, PNG, WEBP · Max 5MB
                  </div>
                  <input
                    ref={bannerRef}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] && handleBanner(e.target.files[0])
                    }
                  />
                </div>
              )}
            </div>
          </EditSection>
          <EditSection badge="02 / timeline">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Registration Start *", field: "startDate" },
                { label: "Registration End *", field: "endDate" },
                { label: "Submission Start *", field: "submissionStartDate" },
                { label: "Submission End *", field: "submissionEndDate" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="ad-label">{label}</label>
                  <input
                    type="datetime-local"
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    className="ad-input"
                  />
                </div>
              ))}
            </div>
          </EditSection>
          <EditSection badge="03 / event details">
            <div>
              <label className="ad-label">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
                className="ad-input"
              >
                {["Beginner", "Intermediate", "Advanced", "Expert"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <ListEditor
              field="techStackUsed"
              label="Tech Stack"
              placeholder="e.g. React"
              values={form.techStackUsed}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <ListEditor
              field="category"
              label="Categories"
              placeholder="e.g. AI"
              values={form.category}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <ListEditor
              field="themes"
              label="Themes"
              placeholder="e.g. Sustainability"
              values={form.themes}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <div>
              <label className="ad-label">Rewards</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginBottom: "0.5rem",
                }}
              >
                {form.rewards.map((r, i) => (
                  <div key={i} className="ad-list-item">
                    <div style={{ flex: 1 }}>
                      <div className="ad-list-item-title">{r.description}</div>
                      <div className="ad-list-item-sub">
                        ₹{(r.amount || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "rewards",
                          form.rewards.filter((_, j) => j !== i)
                        )
                      }
                      className="ad-list-remove"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={rewardInput.description}
                  onChange={(e) =>
                    setRewardInput((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Reward description"
                  className="ad-input"
                />
                <input
                  type="number"
                  value={rewardInput.amount}
                  onChange={(e) =>
                    setRewardInput((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="₹ Amount"
                  className="ad-input sm:w-32"
                />
                <button
                  type="button"
                  onClick={addReward}
                  className="ad-add-icon-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </EditSection>
          <EditSection badge="04 / rules & guidelines">
            <ListEditor
              field="problems"
              label="Problem Statements"
              placeholder="Add a problem statement"
              values={form.problems}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <ListEditor
              field="TandCforHackathon"
              label="Terms & Conditions"
              placeholder="Add a term"
              values={form.TandCforHackathon}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <ListEditor
              field="evaluationCriteria"
              label="Evaluation Criteria"
              placeholder="Add a criterion"
              values={form.evaluationCriteria}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <ListEditor
              field="projectSubmission"
              label="Project Submission Guidelines"
              placeholder="Add a guideline"
              values={form.projectSubmission}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
          </EditSection>
          <EditSection badge="05 / additional content">
            <ListEditor
              field="refMaterial"
              label="Reference Material URLs"
              placeholder="https://…"
              values={form.refMaterial}
              listInputs={listInputs}
              setListInputs={setListInputs}
              onAdd={addToList}
              onRemove={removeFromList}
            />
            <div>
              <label className="ad-label">About the Organiser</label>
              <textarea
                value={form.aboutUs}
                onChange={(e) => set("aboutUs", e.target.value)}
                rows={4}
                placeholder="About organiser"
                className="ad-input"
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label className="ad-label">FAQs</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginBottom: "0.5rem",
                }}
              >
                {form.FAQs.map((f, i) => (
                  <div key={i} className="ad-list-item">
                    <div style={{ flex: 1 }}>
                      <div className="ad-list-item-title">{f.question}</div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          color: "var(--text-muted)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {f.answer}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "FAQs",
                          form.FAQs.filter((_, j) => j !== i)
                        )
                      }
                      className="ad-list-remove"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="ad-divider" />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  marginTop: "0.5rem",
                }}
              >
                <input
                  value={faqInput.question}
                  onChange={(e) =>
                    setFaqInput((p) => ({ ...p, question: e.target.value }))
                  }
                  placeholder="Question"
                  className="ad-input"
                />
                <textarea
                  value={faqInput.answer}
                  onChange={(e) =>
                    setFaqInput((p) => ({ ...p, answer: e.target.value }))
                  }
                  rows={2}
                  placeholder="Answer"
                  className="ad-input"
                  style={{ resize: "none" }}
                />
                <button type="button" onClick={addFaq} className="ad-add-full">
                  <Plus size={12} /> Add FAQ
                </button>
              </div>
            </div>
          </EditSection>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── Hackathon card ── */
const HackathonCard = ({ hackathon, adminData, onEdited }) => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const totalPrize =
    hackathon.rewards?.reduce((s, r) => s + (r.amount || 0), 0) ||
    (hackathon.prizeMoney1 || 0) +
      (hackathon.prizeMoney2 || 0) +
      (hackathon.prizeMoney3 || 0);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this hackathon?"))
      return;
    try {
      await deleteHackathon({
        hackathonId: hackathon._id,
        adminId: adminData.id,
      });
      toast.success("Hackathon deleted successfully");
      onEdited({ _id: hackathon._id, deleted: true });
    } catch {
      toast.error("Failed to delete hackathon");
    }
  };

  return (
    <>
      {showEdit && (
        <EditModal
          hackathon={hackathon}
          adminData={adminData}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            onEdited(updated);
            setShowEdit(false);
          }}
        />
      )}
      <div className="ad-hack-card">
        {/* Action buttons — always visible on small screens, hover on desktop */}
        <div className="ad-hack-card-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEdit(true);
            }}
            className="ad-hack-action-btn ad-hack-action-btn--edit"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="ad-hack-action-btn ad-hack-action-btn--delete"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>

        <div
          onClick={() => navigate(`/admin/${hackathon._id}/usersubmissions`)}
          className="flex flex-col sm:flex-row cursor-pointer"
        >
          {/* Image */}
          <div className="w-full sm:w-[220px] lg:w-[260px] h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
            <img
              src={
                hackathon.image ||
                "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop"
              }
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,10,10,0.1), rgba(10,10,10,0.4))",
              }}
            />
          </div>
          {/* Content — add top padding on mobile to clear the action buttons */}
          <div className="flex-1 p-4 pt-12 sm:pt-4 flex flex-col justify-center">
            <div className="ad-hack-title">{hackathon.title}</div>
            {hackathon.subTitle && (
              <div className="ad-hack-subtitle">{hackathon.subTitle}</div>
            )}
            <div className="ad-hack-desc line-clamp-2">
              {hackathon.description}
            </div>
            <div className="ad-hack-meta">
              <span>
                <Users size={12} style={{ color: "var(--green)" }} />
                {hackathon.numParticipants || 0}
              </span>
              {totalPrize > 0 && (
                <span>
                  <Trophy size={12} style={{ color: "var(--amber)" }} />₹
                  {totalPrize.toLocaleString("en-IN")}
                </span>
              )}
              <span>
                <Calendar size={12} style={{ color: "var(--green)" }} />
                {new Date(hackathon.startDate).toLocaleDateString()}
              </span>
            </div>
            {hackathon.techStackUsed?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hackathon.techStackUsed.slice(0, 5).map((tech, i) => (
                  <span key={i} className="ad-tech-chip">
                    {tech}
                  </span>
                ))}
                {hackathon.techStackUsed.length > 5 && (
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "var(--text-muted)",
                      alignSelf: "center",
                    }}
                  >
                    +{hackathon.techStackUsed.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Hackathon section ── */
const HackathonSection = ({
  title,
  hackathons,
  setHackathons,
  viewMoreLink,
  icon: Icon,
  adminData,
}) => {
  const navigate = useNavigate();
  const handleEdited = (updated) => {
    if (updated.deleted)
      setHackathons((prev) => prev.filter((h) => h._id !== updated._id));
    else
      setHackathons((prev) =>
        prev.map((h) => (h._id === updated._id ? updated : h))
      );
  };
  return (
    <div className="mb-10">
      <div className="ad-section-title mb-4">
        {Icon && <Icon size={18} />}
        {title}
        <span className="ad-section-count">({hackathons.length})</span>
      </div>
      {hackathons.length > 0 ? (
        <div className="flex flex-col gap-3">
          {hackathons.slice(0, 3).map((hackathon, index) => {
            const isOverlay = index === 2 && hackathons.length > 3;
            return (
              <div key={hackathon._id} className={isOverlay ? "relative" : ""}>
                <div style={{ pointerEvents: isOverlay ? "none" : undefined }}>
                  <HackathonCard
                    hackathon={hackathon}
                    adminData={adminData}
                    onEdited={handleEdited}
                  />
                </div>
                {isOverlay && (
                  <>
                    <div
                      className="absolute inset-0 rounded-[4px]"
                      style={{
                        background:
                          "linear-gradient(to top, #0a0a0a, rgba(10,10,10,0.7), transparent)",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => navigate(viewMoreLink)}
                        className="ad-viewall-btn"
                      >
                        View All {hackathons.length} <ArrowRight size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ad-empty">
          <AlertCircle size={14} /> No hackathons in this category.
        </div>
      )}
    </div>
  );
};

/* ── Pending hackathon card ── */
const PendingHackathonCard = ({
  hackathon: initialHackathon,
  onApprove,
  onReject,
  isReadOnly,
}) => {
  const [hackathon, setHackathon] = useState(initialHackathon);
  const [expanded, setExpanded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const status = hackathon.approvalStatus || "pending";
  const isPending = status === "pending",
    isApproved = status === "approved",
    isRejected = status === "rejected";
  const handleApprove = async () => {
    if (isApproving || isReadOnly || (!isPending && !isRejected)) return;
    setIsApproving(true);
    try {
      await onApprove(hackathon._id);
      setHackathon((h) => ({ ...h, approvalStatus: "approved" }));
    } catch {
    } finally {
      setIsApproving(false);
    }
  };
  const handleRejectConfirm = async (reason) => {
    if (isReadOnly) return;
    setIsRejecting(true);
    try {
      const result = await onReject(hackathon._id, reason);
      setHackathon((h) => ({
        ...h,
        approvalStatus: "rejected",
        rejectionDetails: result?.rejectionDetails || {
          reason,
          rejectedAt: new Date().toISOString(),
        },
      }));
      setShowRejectModal(false);
    } catch {
    } finally {
      setIsRejecting(false);
    }
  };
  const totalPrize =
    hackathon.rewards?.reduce((s, r) => s + (r.amount || 0), 0) ||
    (hackathon.prizeMoney1 || 0) +
      (hackathon.prizeMoney2 || 0) +
      (hackathon.prizeMoney3 || 0);
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
  const cardMod = isRejected
    ? "ad-pending-card--rejected"
    : isApproved
    ? "ad-pending-card--approved"
    : expanded
    ? "ad-pending-card--expanded"
    : "ad-pending-card--pending";

  return (
    <>
      {!isReadOnly && showRejectModal && (
        <RejectModal
          hackathon={hackathon}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
          isLoading={isRejecting}
        />
      )}
      <div className={`ad-pending-card ${cardMod}`}>
        <div className="ad-pending-header">
          <div className="ad-pending-thumb">
            {hackathon.image ? (
              <img
                src={hackathon.image}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Zap size={16} style={{ color: "var(--text-muted)" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="ad-pending-title"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {hackathon.title}
            </div>
            <div className="ad-pending-meta flex flex-wrap gap-2 mt-1">
              <span>
                Submitted{" "}
                {new Date(hackathon.createdAt).toLocaleDateString("en-IN")}
              </span>
              {hackathon.difficulty && (
                <Chip color="blue">{hackathon.difficulty}</Chip>
              )}
              {totalPrize > 0 && (
                <Chip color="amber">₹{totalPrize.toLocaleString("en-IN")}</Chip>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isApproved && <StatusPill status="approved" />}
            {isRejected && <StatusPill status="rejected" />}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="ad-expand-btn"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {isRejected && !expanded && hackathon.rejectionDetails?.reason && (
          <div className="ad-rejection-strip">
            <span style={{ fontWeight: 600 }}>Reason:</span>{" "}
            {hackathon.rejectionDetails.reason}
          </div>
        )}

        {expanded && (
          <div className="ad-pending-body">
            {isRejected && hackathon.rejectionDetails && (
              <div className="ad-rejection-block">
                <div
                  className="ad-sub-label"
                  style={{ color: "rgba(255,100,100,0.6)" }}
                >
                  <XCircle size={11} /> Rejection Details
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#ff9090",
                    lineHeight: 1.6,
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Reason: </span>
                  {hackathon.rejectionDetails.reason}
                </div>
                <div
                  className="flex flex-wrap gap-3 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {hackathon.rejectionDetails.rejectedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {fmtDate(hackathon.rejectionDetails.rejectedAt)}
                    </span>
                  )}
                  {hackathon.rejectionDetails.rejectedBy?.name && (
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      {hackathon.rejectionDetails.rejectedBy.name}
                    </span>
                  )}
                </div>
              </div>
            )}
            {hackathon.image && (
              <div
                style={{
                  width: "100%",
                  height: "8rem",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid rgba(95,255,96,0.12)",
                }}
              >
                <img
                  src={hackathon.image}
                  alt="Banner"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            {hackathon.description && (
              <div>
                <div className="ad-sub-label">
                  <FileText size={11} /> Description
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text)",
                    lineHeight: 1.6,
                  }}
                >
                  {hackathon.description}
                </p>
              </div>
            )}
            {hackathon.overview && (
              <div>
                <div className="ad-sub-label">
                  <BookOpen size={11} /> Overview
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {hackathon.overview}
                </p>
              </div>
            )}

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-4"
              style={{
                background: "rgba(95,255,96,0.03)",
                border: "1px solid rgba(95,255,96,0.08)",
                borderRadius: 3,
                padding: "0.6rem 0.75rem",
              }}
            >
              <DetailRow
                icon={Calendar}
                label="Reg. Start"
                value={fmtDate(hackathon.startDate)}
              />
              <DetailRow
                icon={Calendar}
                label="Reg. End"
                value={fmtDate(hackathon.endDate)}
              />
              <DetailRow
                icon={Calendar}
                label="Sub. Start"
                value={fmtDate(hackathon.submissionStartDate)}
              />
              <DetailRow
                icon={Calendar}
                label="Sub. End"
                value={fmtDate(hackathon.submissionEndDate)}
              />
              <DetailRow
                icon={Star}
                label="Difficulty"
                value={hackathon.difficulty}
              />
              <DetailRow
                icon={Trophy}
                label="Total Prize"
                value={
                  totalPrize > 0
                    ? `₹${totalPrize.toLocaleString("en-IN")}`
                    : null
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hackathon.techStackUsed?.length > 0 && (
                <div>
                  <div className="ad-sub-label">
                    <Layers size={11} /> Tech Stack
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hackathon.techStackUsed.map((t, i) => (
                      <Chip key={i} color="blue">
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              {hackathon.themes?.length > 0 && (
                <div>
                  <div className="ad-sub-label">
                    <Tag size={11} /> Themes
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hackathon.themes.map((t, i) => (
                      <Chip key={i} color="green">
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              {hackathon.category?.length > 0 && (
                <div>
                  <div className="ad-sub-label">
                    <Tag size={11} /> Categories
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hackathon.category.map((c, i) => (
                      <Chip key={i} color="amber">
                        {c}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {hackathon.rewards?.length > 0 && (
              <div>
                <div className="ad-sub-label">
                  <Gift size={11} /> Rewards
                </div>
                <div className="flex flex-col gap-1">
                  {hackathon.rewards.map((r, i) => (
                    <div key={i} className="ad-list-item">
                      <span className="ad-list-item-title">
                        {r.description}
                      </span>
                      <span className="ad-list-item-sub">
                        ₹{(r.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hackathon.problems?.length > 0 && (
              <div>
                <div className="ad-sub-label">
                  <AlertCircle size={11} /> Problem Statements
                </div>
                <ul className="flex flex-col gap-1">
                  {hackathon.problems.map((p, i) => (
                    <li
                      key={i}
                      className="flex gap-2"
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--green)",
                          fontSize: "0.6rem",
                          marginTop: 2,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hackathon.FAQs?.length > 0 && (
              <div>
                <div className="ad-sub-label">
                  <HelpCircle size={11} /> FAQs
                </div>
                <div className="flex flex-col gap-2">
                  {hackathon.FAQs.map((f, i) => (
                    <div key={i} className="ad-list-item flex-col">
                      <div className="ad-list-item-title">{f.question}</div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          color: "var(--text-muted)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {f.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hackathon.aboutUs && (
              <div>
                <div className="ad-sub-label">
                  <Info size={11} /> About Organiser
                </div>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {hackathon.aboutUs}
                </p>
              </div>
            )}

            {/* Action footer */}
            {isReadOnly && (
              <div
                style={{
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(95,255,96,0.07)",
                }}
              >
                {isPending && (
                  <div className="ad-info-banner ad-info-banner--pending">
                    <Clock size={12} />
                    Your hackathon is under review.
                  </div>
                )}
                {isApproved && (
                  <div className="ad-info-banner ad-info-banner--approved">
                    <CheckCircle size={12} />
                    This hackathon has been approved and is now live.
                  </div>
                )}
                {isRejected && (
                  <div className="ad-info-banner ad-info-banner--rejected">
                    <XCircle size={12} />
                    This hackathon was rejected. Contact admin if needed.
                  </div>
                )}
              </div>
            )}
            {!isReadOnly && isRejected && (
              <div
                className="flex justify-end pt-3"
                style={{ borderTop: "1px solid rgba(95,255,96,0.07)" }}
              >
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="ad-action-btn ad-action-btn--approve"
                >
                  {isApproving ? (
                    <>
                      <div className="ad-spinner ad-spinner--sm" /> Approving…
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Approve Anyway
                    </>
                  )}
                </button>
              </div>
            )}
            {!isReadOnly && isPending && (
              <div
                className="flex flex-col sm:flex-row justify-end gap-2 pt-3"
                style={{ borderTop: "1px solid rgba(95,255,96,0.07)" }}
              >
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="ad-action-btn ad-action-btn--reject"
                >
                  <XCircle size={13} /> Reject with Reason
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="ad-action-btn ad-action-btn--approve"
                >
                  {isApproving ? (
                    <>
                      <div className="ad-spinner ad-spinner--sm" /> Approving…
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Approve Hackathon
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

/* ── Stat card ── */
const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "green",
  description,
}) => (
  <div className={`ad-stat ad-stat--${color}`}>
    <div className={`ad-stat-bar ad-stat-bar--${color}`} />
    <div className="ad-stat-top">
      <div className={`ad-stat-icon ad-stat-icon--${color}`}>
        <Icon size={20} />
      </div>
      <div className={`ad-stat-value ad-stat-value--${color}`}>{value}</div>
    </div>
    <div className="ad-stat-label">{label}</div>
    {description && <div className="ad-stat-desc">{description}</div>}
  </div>
);

/* ── Main page ── */
const AdminProfile = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveHackathons, setLiveHackathons] = useState([]);
  const [expiredHackathons, setExpiredHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [pendingHackathons, setPendingHackathons] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAdminDetails();
        setAdminData(res.data.admin);
        // console.log("Admin details:", res.data.admin);
      } catch {
        navigate("/adminlogin");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [navigate]);

  useEffect(() => {
    if (!adminData) return;
    const run = async () => {
      try {
        setHackathonsLoading(true);
        const adminId = adminData._id ?? adminData.id;
        const res = await getAdminHackathons();
        const now = new Date(),
          live = [],
          expired = [];
        res.data.forEach((h) => {
          const start = new Date(h.startDate),
            subEnd = new Date(h.submissionEndDate);
          if (now >= start && now <= subEnd) live.push(h);
          else if (now > subEnd) expired.push(h);
        });
        setLiveHackathons(live);
        setExpiredHackathons(expired);
      } catch (err) {
        console.error(err);
      } finally {
        setHackathonsLoading(false);
      }
    };
    run();
  }, [adminData]);

  useEffect(() => {
    if (!adminData) return;
    const run = async () => {
      try {
        setPendingLoading(true);
        const res = await getPendingHackathons(adminData?.id);
        setPendingHackathons(res.data.pendingHackathonsData || []);
      } catch {
        toast.error("Could not load pending hackathons.");
      } finally {
        setPendingLoading(false);
      }
    };
    run();
  }, [adminData]);

  const handleApprove = async (id) => {
    const adminId = adminData._id ?? adminData.id;
    const res = await approveHackathon({ pendingHackathonId: id, adminId });
    toast.success(res.data.message || "Hackathon approved!");
    if (res.data.success && res.data.hackathon)
      setPendingHackathons((prev) => prev.filter((h) => h._id !== id));
    return res.data;
  };

  const handleReject = async (id, rejectionReason) => {
    try {
      const adminId = adminData._id ?? adminData.id;
      const res = await rejectHackathon({
        pendingHackathonId: id,
        adminId,
        rejectionReason,
      });
      toast.success(res.data.message || "Hackathon rejected successfully.");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed.");
      throw err;
    }
  };

  if (loading || !adminData)
    return (
      <div className="ad-loading-page">
        <div className="ad-spinner" />
        Loading admin profile…
      </div>
    );

  const totalHackathons = liveHackathons.length + expiredHackathons.length;
  const pendingCount = pendingHackathons.filter(
    (h) => (h.approvalStatus || "pending") === "pending"
  ).length;

  return (
    <div className="ad-root">
      <GridBackground />
      <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="ad-badge">Admin Dashboard</div>
          <h1 className="ad-page-title">Administrator.</h1>
          <p className="ad-page-sub">
            Manage platform · monitor hackathons · oversee community
          </p>
        </div>

        {/* ── Profile + Create — stacks on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 mb-6">
          {/* Profile card */}
          <div className="ad-card p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="ad-profile-avatar">
                <User size={22} style={{ color: "var(--green)" }} />
                <div className="ad-profile-avatar-badge">
                  <Shield size={9} style={{ color: "#050905" }} />
                </div>
              </div>
              <div>
                <div className="ad-profile-name">{adminData.name}</div>
                <div className="ad-profile-role">
                  {adminData.controller ? "Platform Controller" : "Admin"}
                </div>
                <div className="ad-profile-email">{adminData.email}</div>
              </div>
            </div>
            <div className="ad-sub-label mb-2">
              <Shield size={11} /> Access Permissions
            </div>
            <div className="flex flex-wrap gap-2">
              {["Full Access", "User Management", "Event Creation"].map((p) => (
                <div key={p} className="ad-permission-chip">
                  <CheckCircle size={10} />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Create card */}
          <div className="ad-card p-5 flex flex-col gap-3">
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                Create Hackathon
              </div>
              <p
                style={{
                  fontSize: "0.62rem",
                  color: "var(--text-muted)",
                  marginTop: "0.3rem",
                  lineHeight: 1.5,
                }}
              >
                Start a new hackathon and invite participants.
              </p>
            </div>
            <button
              onClick={() => navigate("/createHackathon")}
              className="ad-create-btn"
            >
              <Plus size={14} /> Create New Event
            </button>
          </div>
        </div>

        {/* ── Stats — 2-col on mobile, 4-col on lg ── */}
        {!hackathonsLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard
              label="Total Events"
              value={totalHackathons}
              icon={Layers}
              color="blue"
              description="All time"
            />
            <StatCard
              label="Live Now"
              value={liveHackathons.length}
              icon={Zap}
              color="green"
              description="Open now"
            />
            <StatCard
              label="Awaiting Review"
              value={pendingCount}
              icon={Clock}
              color="amber"
              description="Needs approval"
            />
            <StatCard
              label="Concluded"
              value={expiredHackathons.length}
              icon={BadgeCheck}
              color="gray"
              description="Closed"
            />
          </div>
        )}

        {/* ── Pending Approvals ── */}
        {pendingHackathons.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="ad-section-title">
                <Clock size={18} style={{ color: "var(--amber)" }} />
                {adminData.controller
                  ? "Pending Approvals"
                  : "Given for Approval"}
              </div>
              {pendingCount > 0 && (
                <span className="ad-chip ad-chip--amber">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div className="ad-pending-note">
              {adminData.controller
                ? "Expand any card to review full details. Rejecting requires a written reason."
                : "These are hackathons you submitted for approval."}
            </div>
            {pendingLoading ? (
              <div className="ad-empty">
                <div className="ad-spinner" /> Loading hackathons…
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingHackathons.map((h) => (
                  <PendingHackathonCard
                    key={h._id}
                    hackathon={h}
                    onApprove={adminData.controller ? handleApprove : null}
                    onReject={adminData.controller ? handleReject : null}
                    isReadOnly={!adminData.controller}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Hackathon sections ── */}
        {hackathonsLoading ? (
          <div className="ad-empty p-6">
            <div className="ad-spinner" /> Loading your hackathons…
          </div>
        ) : (
          <>
            <HackathonSection
              title="Live Hackathons"
              hackathons={liveHackathons}
              setHackathons={setLiveHackathons}
              viewMoreLink="/admin/livehackathons"
              icon={Zap}
              adminData={adminData}
            />
            <HackathonSection
              title="Expired Hackathons"
              hackathons={expiredHackathons}
              setHackathons={setExpiredHackathons}
              viewMoreLink="/admin/endedhackathons"
              icon={Calendar}
              adminData={adminData}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
