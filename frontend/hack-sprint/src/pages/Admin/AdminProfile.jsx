import React, { useState, useEffect, useRef } from "react";
import { confirmAction } from "../../utils/dialogs.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  Layers,
  AlertCircle,
  Link2,
  Gift,
  Zap,
  XCircle,
  Pencil,
  UploadCloud,
  Save,
  Building2,
  Globe,
  Phone,
  Linkedin,
  Trash2,
  Gavel,
  Inbox,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { AdminAPI } from "../../api/admin.api.js";
import { HackathonAPI } from "../../api/hackathon.api.js";
import { JudgeAPI } from "../../api/judge.api.js";
import { MediaAPI } from "../../api/media.api.js";
import { useAuth } from "../../hooks/useAuth.js";
import HackathonForm from "./HackathonForm.jsx";
import VerificationForm from "../../components/Admin/VerificationForm.jsx";
import VerificationDetails from "../../components/Admin/VerificationDetails.jsx";
import JudgeInvitations from "../../components/Admin/JudgeInvitations.jsx";
import PlatformUsers from "../../components/Admin/PlatformUsers.jsx";
import ContactEnquiries from "../../components/Admin/ContactEnquiries.jsx";
import { getFileMeta, formatBytes } from "../../utils/fileType.js";
import { createPortal } from "react-dom";
import "./AdminProfile.css";
import "../Styles/AllHackathons.css";

// Mirrors the backend's hackathonSchema virtual("lifecycleStatus") exactly,
// computed live from phases[] instead of trusting the virtual to have
// survived whatever lean()/populate() combination a given list endpoint used.
const derivePhaseLifecycle = (phases) => {
  if (!phases || phases.length === 0) return "UPCOMING";
  const now = Date.now();
  const starts = phases.map((p) => new Date(p.startDate).getTime());
  const ends = phases.map((p) => new Date(p.endDate).getTime());
  const earliest = Math.min(...starts);
  const latest = Math.max(...ends);
  if (now < earliest) return "UPCOMING";
  if (now <= latest) return "ACTIVE";
  return "COMPLETED";
};

/* ── Background ── */
const GridBackground = () => <div className="ad-bg" />;

/* ── Status pill (hackathon lifecycle) ── */
const StatusPill = ({ status }) => {
  const map = {
    DRAFT: { cls: "ad-chip--gray", icon: FileText, label: "Draft" },
    PENDING_APPROVAL: { cls: "ad-status-pill--pending", icon: Clock, label: "Pending" },
    APPROVED: { cls: "ad-status-pill--approved", icon: CheckCircle, label: "Approved" },
    REJECTED: { cls: "ad-status-pill--rejected", icon: XCircle, label: "Rejected" },
  };
  const s = map[status] || map.DRAFT;
  const Icon = s.icon;
  return (
    <span className={`ad-status-pill ${s.cls}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

const LifecyclePill = ({ status }) => {
  if (!status) return null;
  const map = {
    ACTIVE: { color: "green", label: "Live" },
    UPCOMING: { color: "blue", label: "Upcoming" },
    COMPLETED: { color: "gray", label: "Concluded" },
  };
  const s = map[status];
  if (!s) return null;
  return <Chip color={s.color}>{s.label}</Chip>;
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

/* ── Reject modal (generic — hackathon reject or verification reject) ── */
const ReasonModal = ({ title, subject, label, onConfirm, onCancel, isLoading, confirmLabel = "Confirm Reject" }) => {
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
            <div className="ad-modal-title">{title}</div>
            <div className="ad-modal-sub">
              {label} <strong style={{ color: "var(--strong)" }}>"{subject}"</strong>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
            <X size={16} />
          </button>
        </div>
        <div className="ad-modal-body">
          <div>
            <textarea
              ref={textareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Explain the reason…"
              rows={4}
              className="ad-modal-input"
            />
            <div className="ad-char-count" style={{ marginTop: "0.3rem" }}>
              <span className={reason.length > 450 ? "ad-char-count--warn" : ""}>{reason.length}/500</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={onCancel} disabled={isLoading} className="ad-action-btn ad-action-btn--cancel" style={{ flex: 1, justifyContent: "center" }}>
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
              {isLoading ? <><div className="ad-spinner ad-spinner--sm" /> Submitting…</> : <><XCircle size={13} /> {confirmLabel}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Edit hackathon modal — wraps the shared HackathonForm ── */
const EditHackathonModal = ({ hackathon, onClose, onSaved }) => {
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (payload) => {
    setIsSaving(true);
    try {
      const res = await HackathonAPI.updateHackathon(hackathon._id, payload);
      toast.success("Event updated successfully!");
      onSaved(res.data.hackathon);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="ad-edit-root">
      <div className="ad-edit-topbar">
        <div className="ad-edit-topbar-left">
          <div className="ad-edit-topbar-icon">
            <Pencil size={16} />
          </div>
          <div>
            <div className="ad-edit-topbar-title">Edit Event</div>
            <div className="ad-edit-topbar-sub" style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {hackathon.title}
            </div>
          </div>
        </div>
        <div className="ad-edit-topbar-right">
          <button onClick={onClose} className="ad-action-btn ad-action-btn--cancel">Cancel</button>
        </div>
      </div>
      <div className="ad-edit-body">
        <div className="ad-edit-inner">
          <HackathonForm initialValues={hackathon} onSubmit={handleSubmit} submitLabel="Save Changes" isSubmitting={isSaving} />
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── Hackathon card ── */
const HackathonCard = ({ hackathon, onEdited, onSubmitForApproval }) => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const totalPrize = hackathon.prizes?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!(await confirmAction({ title: "Delete this event?", message: "It will be permanently removed.", confirmLabel: "Delete", danger: true }))) return;
    try {
      await HackathonAPI.deleteHackathon(hackathon._id);
      toast.success("Event deleted successfully");
      onEdited({ _id: hackathon._id, deleted: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  const canSubmit = hackathon.status === "DRAFT" || hackathon.status === "REJECTED";

  return (
    <>
      {showEdit && (
        <EditHackathonModal
          hackathon={hackathon}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { onEdited(updated); setShowEdit(false); }}
        />
      )}
      <div className="ad-hack-card">
        <div className="ad-hack-card-actions">
          {canSubmit && (
            <button
              onClick={(e) => { e.stopPropagation(); onSubmitForApproval(hackathon._id); }}
              className="ad-hack-action-btn ad-hack-action-btn--edit"
            >
              <ArrowRight size={11} /> Submit
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setShowEdit(true); }} className="ad-hack-action-btn ad-hack-action-btn--edit">
            <Pencil size={11} /> Edit
          </button>
          <button onClick={handleDelete} className="ad-hack-action-btn ad-hack-action-btn--delete">
            <Trash2 size={11} /> Delete
          </button>
        </div>

        <div onClick={() => navigate(`/admin/${hackathon._id}/usersubmissions`)} className="flex flex-col sm:flex-row cursor-pointer">
          <div className="w-full sm:w-[220px] lg:w-[260px] h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
            <img
              src={hackathon.image?.url || "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop"}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.1), rgba(10,10,10,0.4))" }} />
          </div>
          <div className="flex-1 p-4 pt-12 sm:pt-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusPill status={hackathon.status} />
              {hackathon.status === "APPROVED" && <LifecyclePill status={derivePhaseLifecycle(hackathon.phases)} />}
              {hackathon.eventFormat === "ON_SPOT" && <Chip color="amber">On-Spot</Chip>}
            </div>
            <div className="ad-hack-title">{hackathon.title}</div>
            {hackathon.subTitle && <div className="ad-hack-subtitle">{hackathon.subTitle}</div>}
            <div className="ad-hack-desc line-clamp-2">{hackathon.description}</div>
            {hackathon.status === "REJECTED" && hackathon.rejectionReason && (
              <div className="ad-rejection-strip">
                <span style={{ fontWeight: 600 }}>Reason:</span> {hackathon.rejectionReason}
              </div>
            )}
            <div className="ad-hack-meta">
              <span>
                {hackathon.participationType === "TEAM" ? (
                  <Users size={12} style={{ color: "var(--green)" }} />
                ) : (
                  <User size={12} style={{ color: "var(--green)" }} />
                )}
                {hackathon.participationType === "TEAM"
                  ? `Team · up to ${hackathon.maxTeamSize || "N"}`
                  : "Individual"}
              </span>
              <span><Users size={12} style={{ color: "var(--green)" }} />{hackathon.numParticipants || 0}</span>
              {totalPrize > 0 && <span><Trophy size={12} style={{ color: "var(--amber)" }} />₹{totalPrize.toLocaleString("en-IN")}</span>}
              {hackathon.phases?.[0]?.startDate && (
                <span><Calendar size={12} style={{ color: "var(--green)" }} />{new Date(hackathon.phases[0].startDate).toLocaleDateString()}</span>
              )}
            </div>
            {hackathon.techStacks?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hackathon.techStacks.slice(0, 5).map((tech, i) => <span key={i} className="ad-tech-chip">{tech}</span>)}
                {hackathon.techStacks.length > 5 && (
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", alignSelf: "center" }}>+{hackathon.techStacks.length - 5}</span>
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
const HackathonSection = ({ title, hackathons, setHackathons, icon: Icon, onSubmitForApproval }) => {
  const [expanded, setExpanded] = useState(false);
  const handleEdited = (updated) => {
    if (updated.deleted) setHackathons((prev) => prev.filter((h) => h._id !== updated._id));
    else setHackathons((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
  };
  if (hackathons.length === 0) return null;
  const visible = expanded ? hackathons : hackathons.slice(0, 3);
  return (
    <div className="mb-10">
      <div className="ad-section-title mb-4">
        {Icon && <Icon size={18} />}
        {title}
        <span className="ad-section-count">({hackathons.length})</span>
      </div>
      <div className="flex flex-col gap-3">
        {visible.map((hackathon, index) => {
          const isOverlay = !expanded && index === 2 && hackathons.length > 3;
          return (
            <div key={hackathon._id} className={isOverlay ? "relative" : ""}>
              <div style={{ pointerEvents: isOverlay ? "none" : undefined }}>
                <HackathonCard hackathon={hackathon} onEdited={handleEdited} onSubmitForApproval={onSubmitForApproval} />
              </div>
              {isOverlay && (
                <>
                  <div className="absolute inset-0 rounded-[4px]" style={{ background: "linear-gradient(to top, #0a0a0a, rgba(10,10,10,0.7), transparent)" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={() => setExpanded(true)} className="ad-viewall-btn">
                      View All {hackathons.length} <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {expanded && hackathons.length > 3 && (
        <button onClick={() => setExpanded(false)} className="ad-viewall-btn mt-3">
          Show Less
        </button>
      )}
    </div>
  );
};

/* ── Pending hackathon (controller approval queue) card ── */
const PendingHackathonCard = ({ hackathon: initialHackathon, onApprove, onReject }) => {
  const [hackathon, setHackathon] = useState(initialHackathon);
  const [expanded, setExpanded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const totalPrize = hackathon.prizes?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  const handleApprove = async () => {
    if (isApproving) return;
    setIsApproving(true);
    try {
      await onApprove(hackathon._id);
      setHackathon((h) => ({ ...h, status: "APPROVED" }));
    } catch {
      // toast already shown by caller
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setIsRejecting(true);
    try {
      await onReject(hackathon._id, reason);
      setHackathon((h) => ({ ...h, status: "REJECTED", rejectionReason: reason }));
      setShowRejectModal(false);
    } catch {
      // toast already shown by caller
    } finally {
      setIsRejecting(false);
    }
  };

  const cardMod = hackathon.status === "REJECTED" ? "ad-pending-card--rejected"
    : hackathon.status === "APPROVED" ? "ad-pending-card--approved"
    : expanded ? "ad-pending-card--expanded" : "ad-pending-card--pending";

  return (
    <>
      {showRejectModal && (
        <ReasonModal
          title="Reject Event"
          subject={hackathon.title}
          label="Rejecting"
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
          isLoading={isRejecting}
        />
      )}
      <div className={`ad-pending-card ${cardMod}`}>
        <div className="ad-pending-header">
          <div className="ad-pending-thumb">
            {hackathon.image?.url ? (
              <img src={hackathon.image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Zap size={16} style={{ color: "var(--text-muted)" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ad-pending-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {hackathon.title}
            </div>
            <div className="ad-pending-meta flex flex-wrap gap-2 mt-1">
              <span>By {hackathon.createdBy?.adminName || "Unknown"} {hackathon.createdBy?.organizationName ? `· ${hackathon.createdBy.organizationName}` : ""}</span>
              <Chip color="gray">
                {hackathon.participationType === "TEAM"
                  ? `Team · up to ${hackathon.maxTeamSize || "N"}`
                  : "Individual"}
              </Chip>
              {hackathon.difficulty && <Chip color="blue">{hackathon.difficulty}</Chip>}
              {totalPrize > 0 && <Chip color="amber">₹{totalPrize.toLocaleString("en-IN")}</Chip>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hackathon.status === "APPROVED" && <StatusPill status="APPROVED" />}
            {hackathon.status === "REJECTED" && <StatusPill status="REJECTED" />}
            <button onClick={() => setExpanded((v) => !v)} className="ad-expand-btn">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {hackathon.status === "REJECTED" && !expanded && hackathon.rejectionReason && (
          <div className="ad-rejection-strip"><span style={{ fontWeight: 600 }}>Reason:</span> {hackathon.rejectionReason}</div>
        )}

        {expanded && (
          <div className="ad-pending-body">
            {hackathon.status === "REJECTED" && hackathon.rejectionReason && (
              <div className="ad-rejection-block">
                <div className="ad-sub-label" style={{ color: "rgba(255,100,100,0.6)" }}><XCircle size={11} /> Rejection Reason</div>
                <div style={{ fontSize: "0.7rem", color: "var(--rd-text)", lineHeight: 1.6 }}>{hackathon.rejectionReason}</div>
              </div>
            )}
            {hackathon.image?.url && (
              <div style={{ width: "100%", height: "8rem", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(95,255,96,0.12)" }}>
                <img src={hackathon.image.url} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            {hackathon.description && (
              <div>
                <div className="ad-sub-label"><FileText size={11} /> Description</div>
                <p style={{ fontSize: "0.7rem", color: "var(--text)", lineHeight: 1.6 }}>{hackathon.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4" style={{ background: "rgba(95,255,96,0.03)", border: "1px solid rgba(95,255,96,0.08)", borderRadius: 3, padding: "0.6rem 0.75rem" }}>
              {hackathon.phases?.map((p) => (
                <DetailRow key={p._id || p.phaseName} icon={Calendar} label={p.phaseName} value={p.startDate ? `${new Date(p.startDate).toLocaleDateString("en-IN")} → ${new Date(p.endDate).toLocaleDateString("en-IN")}` : null} />
              ))}
              <DetailRow icon={Layers} label="Difficulty" value={hackathon.difficulty} />
              <DetailRow icon={Trophy} label="Total Prize" value={totalPrize > 0 ? `₹${totalPrize.toLocaleString("en-IN")}` : null} />
              <DetailRow
                icon={hackathon.participationType === "TEAM" ? Users : User}
                label="Participation"
                value={hackathon.participationType === "TEAM" ? `Team (up to ${hackathon.maxTeamSize || "N"})` : "Individual"}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hackathon.techStacks?.length > 0 && (
                <div>
                  <div className="ad-sub-label"><Layers size={11} /> Tech Stack</div>
                  <div className="flex flex-wrap gap-1">{hackathon.techStacks.map((t, i) => <Chip key={i} color="blue">{t}</Chip>)}</div>
                </div>
              )}
              {hackathon.tags?.length > 0 && (
                <div>
                  <div className="ad-sub-label"><Tag size={11} /> Tags</div>
                  <div className="flex flex-wrap gap-1">{hackathon.tags.map((t, i) => <Chip key={i} color="green">{t}</Chip>)}</div>
                </div>
              )}
              {hackathon.category?.length > 0 && (
                <div>
                  <div className="ad-sub-label"><Tag size={11} /> Categories</div>
                  <div className="flex flex-wrap gap-1">{hackathon.category.map((c, i) => <Chip key={i} color="amber">{c}</Chip>)}</div>
                </div>
              )}
            </div>
            {hackathon.prizes?.length > 0 && (
              <div>
                <div className="ad-sub-label"><Gift size={11} /> Prizes</div>
                <div className="flex flex-col gap-1">
                  {hackathon.prizes.map((p, i) => (
                    <div key={i} className="ad-list-item">
                      <span className="ad-list-item-title">{p.title}</span>
                      <span className="ad-list-item-sub">₹{(p.amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hackathon.resources?.length > 0 && (
              <div>
                <div className="ad-sub-label"><FileText size={11} /> Resources</div>
                <div className="flex flex-col gap-1">
                  {hackathon.resources.map((r, i) => {
                    const { icon: Icon, color, label } = getFileMeta(r.format);
                    return (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-list-item"
                        style={{ textDecoration: "none" }}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={13} style={{ color }} />
                          <span className="ad-list-item-title">{r.title}</span>
                        </span>
                        <span className="ad-list-item-sub">
                          {label}
                          {r.size ? ` · ${formatBytes(r.size)}` : ""}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            {hackathon.faqs?.length > 0 && (
              <div>
                <div className="ad-sub-label"><HelpCircle size={11} /> FAQs</div>
                <div className="flex flex-col gap-2">
                  {hackathon.faqs.map((f, i) => (
                    <div key={i} className="ad-list-item flex-col">
                      <div className="ad-list-item-title">{f.question}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{f.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3" style={{ borderTop: "1px solid rgba(95,255,96,0.07)" }}>
              {hackathon.status !== "REJECTED" && (
                <button onClick={() => setShowRejectModal(true)} className="ad-action-btn ad-action-btn--reject">
                  <XCircle size={13} /> Reject with Reason
                </button>
              )}
              {hackathon.status !== "APPROVED" && (
                <button onClick={handleApprove} disabled={isApproving} className="ad-action-btn ad-action-btn--approve">
                  {isApproving ? <><div className="ad-spinner ad-spinner--sm" /> Approving…</> : <><Check size={13} /> {hackathon.status === "REJECTED" ? "Approve Anyway" : "Approve Event"}</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Stat card ── */
const StatCard = ({ label, value, icon: Icon, color = "green", description }) => (
  <div className={`ad-stat ad-stat--${color}`}>
    <div className={`ad-stat-bar ad-stat-bar--${color}`} />
    <div className="ad-stat-top">
      <div className={`ad-stat-icon ad-stat-icon--${color}`}><Icon size={20} /></div>
      <div className={`ad-stat-value ad-stat-value--${color}`}>{value}</div>
    </div>
    <div className="ad-stat-label">{label}</div>
    {description && <div className="ad-stat-desc">{description}</div>}
  </div>
);

/* ── Profile edit modal ── */
const ORGANIZER_TYPES = ["INDIVIDUAL", "COLLEGE", "COMPANY", "STARTUP", "STUDIO", "COMMUNITY"];

const ProfileEditModal = ({ admin, onClose, onSaved }) => {
  const [form, setForm] = useState({
    organizationName: admin.organizationName || "",
    organizerType: admin.organizerType || "INDIVIDUAL",
    contactNumber: admin.contactNumber || "",
    country: admin.country || "",
    website: admin.website || "",
    linkedin: admin.linkedin || "",
    bio: admin.bio || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!form.organizationName.trim() || !form.contactNumber.trim() || !form.country.trim()) {
      toast.error("Organization name, contact number and country are required.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await AdminAPI.updateProfile(form);
      toast.success("Profile updated!");
      onSaved(res.data.admin);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal-backdrop" onClick={onClose} />
      <div className="ad-modal">
        <div className="ad-modal-topline" />
        <div className="ad-modal-header">
          <div className="ad-modal-icon"><Building2 size={20} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ad-modal-title">Organization Profile</div>
            <div className="ad-modal-sub">Required before you can create events</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}><X size={16} /></button>
        </div>
        <div className="ad-modal-body">
          <div>
            <label className="ad-label">Organization Name *</label>
            <input className="ad-input" value={form.organizationName} onChange={(e) => set("organizationName", e.target.value)} placeholder="e.g. Devlup Labs" />
          </div>
          <div>
            <label className="ad-label">Organizer Type</label>
            <select className="ad-input" value={form.organizerType} onChange={(e) => set("organizerType", e.target.value)}>
              {ORGANIZER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ad-label">Contact Number *</label>
              <input className="ad-input" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} placeholder="+91XXXXXXXXXX" />
            </div>
            <div>
              <label className="ad-label">Country *</label>
              <input className="ad-input" value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="India" />
            </div>
          </div>
          <div>
            <label className="ad-label">Website</label>
            <input className="ad-input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="ad-label">LinkedIn</label>
            <input className="ad-input" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/…" />
          </div>
          <div>
            <label className="ad-label">Bio</label>
            <textarea className="ad-modal-input" rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value.slice(0, 1000))} placeholder="Tell us about your organization…" />
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={onClose} disabled={isSaving} className="ad-action-btn ad-action-btn--cancel" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="ad-action-btn ad-action-btn--approve" style={{ flex: 1, justifyContent: "center" }}>
              {isSaving ? <><div className="ad-spinner ad-spinner--sm" /> Saving…</> : <><Save size={13} /> Save Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Pending verification (controller review) card ── */
const PendingVerificationCard = ({ admin, onApprove, onReject }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [resolved, setResolved] = useState(null);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(admin._id);
      setResolved("approved");
    } catch {
      // handled upstream
    } finally {
      setIsApproving(false);
    }
  };
  const handleReject = async (remarks) => {
    setIsRejecting(true);
    try {
      await onReject(admin._id, remarks);
      setResolved("rejected");
      setShowReject(false);
    } catch {
      // handled upstream
    } finally {
      setIsRejecting(false);
    }
  };

  if (resolved) return null;

  return (
    <>
      {showReject && (
        <ReasonModal
          title="Reject Verification"
          subject={admin.organizationName || admin.adminName}
          label="Rejecting"
          confirmLabel="Confirm Reject"
          onConfirm={handleReject}
          onCancel={() => setShowReject(false)}
          isLoading={isRejecting}
        />
      )}
      <div className="ad-pending-card ad-pending-card--pending">
        <div className="ad-pending-header">
          <div className="ad-pending-thumb">
            {admin.avatar ? <img src={admin.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={16} style={{ color: "var(--text-muted)" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ad-pending-title">{admin.organizationName || admin.adminName}</div>
            <div className="ad-pending-meta flex flex-wrap gap-2 mt-1">
              <span>{admin.adminName} · {admin.email}</span>
              {admin.organizerType && <Chip color="blue">{admin.organizerType}</Chip>}
            </div>
          </div>
        </div>
        <div className="ad-pending-body" style={{ display: "flex" }}>
          <DetailRow icon={Phone} label="Contact" value={admin.contactNumber} />
          <DetailRow icon={Globe} label="Country" value={admin.country} />
          {admin.linkedin && <DetailRow icon={Linkedin} label="LinkedIn" value={admin.linkedin} />}
          {admin.bio && (
            <div>
              <div className="ad-sub-label">About</div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{admin.bio}</p>
            </div>
          )}
          <VerificationDetails admin={admin} />
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3" style={{ borderTop: "1px solid rgba(95,255,96,0.07)" }}>
            <button onClick={() => setShowReject(true)} className="ad-action-btn ad-action-btn--reject">
              <XCircle size={13} /> Reject
            </button>
            <button onClick={handleApprove} disabled={isApproving} className="ad-action-btn ad-action-btn--approve">
              {isApproving ? <><div className="ad-spinner ad-spinner--sm" /> Approving…</> : <><Check size={13} /> Approve</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Verification status card ── */
const VerificationCard = ({ admin, onSubmit }) => {
  const status = admin.verificationStatus;
  if (status === "APPROVED" && !(admin.verificationDocuments?.length > 0))
    return (
      <div className="ad-info-banner ad-info-banner--pending">
        <span>
          <AlertCircle size={13} style={{ display: "inline", marginRight: 4 }} />
          Verification now needs your organisation details and documents. <button onClick={onSubmit} className="ad-inline-link">Submit them</button> to keep creating events — your existing events are unaffected.
        </span>
      </div>
    );
  if (status === "APPROVED")
    return (
      <div className="ad-info-banner ad-info-banner--approved">
        <BadgeCheck size={13} /> Your organizer account is verified.
      </div>
    );
  return (
    <div className={status === "REJECTED" ? "ad-info-banner ad-info-banner--rejected" : "ad-info-banner ad-info-banner--pending"}>
      {status === "PENDING" && <><Clock size={13} /> Verification request pending review.</>}
      {status === "REJECTED" && (
        <span>
          <XCircle size={13} style={{ display: "inline", marginRight: 4 }} />
          Verification rejected{admin.verificationRemarks ? `: "${admin.verificationRemarks}"` : "."}{" "}
          <button onClick={onSubmit} className="ad-inline-link">Resubmit</button>
        </span>
      )}
      {status === "NOT_SUBMITTED" && admin.profileCompleted && (
        <span>
          <AlertCircle size={13} style={{ display: "inline", marginRight: 4 }} />
          Not verified yet. <button onClick={onSubmit} className="ad-inline-link">Submit for verification</button> to start creating events.
        </span>
      )}
      {status === "NOT_SUBMITTED" && !admin.profileCompleted && (
        <span><AlertCircle size={13} style={{ display: "inline", marginRight: 4 }} />Complete your profile, then submit for verification.</span>
      )}
    </div>
  );
};

/* ── Main page ── */
const AdminProfile = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myHackathons, setMyHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [assignedHackathons, setAssignedHackathons] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [assignedVersion, setAssignedVersion] = useState(0);
  const [pendingHackathons, setPendingHackathons] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [allHackathonsPlatform, setAllHackathonsPlatform] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [tab, setTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("adminSidebarCollapsed") === "1"; } catch { return false; }
  });
  const toggleCollapsed = () => setCollapsed((c) => {
    try { localStorage.setItem("adminSidebarCollapsed", c ? "0" : "1"); } catch { /* storage unavailable */ }
    return !c;
  });
  const [newEnquiries, setNewEnquiries] = useState(0);

  useEffect(() => {
    if (!adminData?.controller) return;
    AdminAPI.listEnquiries({ status: "NEW", limit: 1 }).then((res) => setNewEnquiries(res.data.newCount || 0)).catch(() => {});
  }, [adminData?.controller, tab]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await AdminAPI.getProfile({ signal: controller.signal });
        setAdminData(res.data.admin);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        navigate("/adminlogin");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [navigate]);

  useEffect(() => {
    if (!adminData) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        setHackathonsLoading(true);
        const res = await HackathonAPI.getMyHackathons({ signal: controller.signal });
        setMyHackathons(res.data.hackathons || []);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        toast.error("Could not load your events.");
      } finally {
        if (!controller.signal.aborted) setHackathonsLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [adminData]);

  useEffect(() => {
    if (!adminData) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        setAssignedLoading(true);
        const res = await JudgeAPI.getAssignedHackathons({ signal: controller.signal });
        setAssignedHackathons(res.data.hackathons || []);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        // Not every admin has judge assignments — fail quietly.
      } finally {
        if (!controller.signal.aborted) setAssignedLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [adminData, assignedVersion]);

  useEffect(() => {
    if (!adminData?.controller) {
      setPendingLoading(false);
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      try {
        setPendingLoading(true);
        const { signal } = controller;
        const [hackRes, verifyRes, adminsRes, allHackRes] = await Promise.all([
          HackathonAPI.getPendingHackathons({ signal }),
          AdminAPI.getPendingVerificationRequests({ signal }),
          AdminAPI.getAllAdmins({ signal }),
          HackathonAPI.getAllHackathonsForController({ signal }),
        ]);
        setPendingHackathons(hackRes.data.hackathons || []);
        setPendingVerifications(verifyRes.data.requests || []);
        setAllAdmins(adminsRes.data.admins || []);
        setAllHackathonsPlatform(allHackRes.data.hackathons || []);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        toast.error("Could not load pending approvals.");
      } finally {
        if (!controller.signal.aborted) setPendingLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [adminData]);

  const handleApproveHackathon = async (id) => {
    try {
      await HackathonAPI.approveHackathon(id);
      toast.success("Event approved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed.");
      throw err;
    }
  };

  const handleRejectHackathon = async (id, reason) => {
    try {
      await HackathonAPI.rejectHackathon(id, { reason });
      toast.success("Event rejected.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed.");
      throw err;
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await HackathonAPI.submitForApproval(id);
      toast.success("Submitted for approval!");
      setMyHackathons((prev) => prev.map((h) => (h._id === id ? { ...h, status: "PENDING_APPROVAL" } : h)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit for approval.");
    }
  };

  const handleApproveVerification = async (adminId) => {
    try {
      await AdminAPI.approveVerification(adminId);
      toast.success("Organizer verified!");
      setPendingVerifications((prev) => prev.filter((a) => a._id !== adminId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed.");
      throw err;
    }
  };

  const handleRejectVerification = async (adminId, remarks) => {
    try {
      await AdminAPI.rejectVerification(adminId, { remarks });
      toast.success("Verification rejected.");
      setPendingVerifications((prev) => prev.filter((a) => a._id !== adminId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed.");
      throw err;
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!(await confirmAction({ title: `Delete ${admin.organizationName || admin.adminName}?`, message: "The organiser account is removed permanently. This can't be undone.", confirmLabel: "Delete account", danger: true }))) return;
    try {
      await AdminAPI.deleteAdmin(admin._id);
      toast.success("Admin deleted.");
      setAllAdmins((prev) => prev.filter((a) => a._id !== admin._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin.");
    }
  };

  if (loading || !adminData)
    return (
      <div className="ad-loading-page">
        <div className="ad-spinner" />
        Loading admin profile…
      </div>
    );

  const drafts = myHackathons.filter((h) => h.status === "DRAFT");
  const pendingApproval = myHackathons.filter((h) => h.status === "PENDING_APPROVAL");
  const rejected = myHackathons.filter((h) => h.status === "REJECTED");
  const published = myHackathons.filter((h) => h.status === "APPROVED");
  const liveCount = published.filter((h) => derivePhaseLifecycle(h.phases) === "ACTIVE").length;
  const concludedCount = published.filter((h) => derivePhaseLifecycle(h.phases) === "COMPLETED").length;

  // Controllers see platform-wide totals in the stat cards instead of just
  // their own hackathons — same shape, sourced from allHackathonsPlatform.
  const platformPublished = allHackathonsPlatform.filter((h) => h.status === "APPROVED");
  const platformPendingApproval = allHackathonsPlatform.filter((h) => h.status === "PENDING_APPROVAL");
  const platformLiveCount = platformPublished.filter((h) => derivePhaseLifecycle(h.phases) === "ACTIVE").length;
  const platformConcludedCount = platformPublished.filter((h) => derivePhaseLifecycle(h.phases) === "COMPLETED").length;

  const statTotalEvents = adminData.controller ? allHackathonsPlatform.length : myHackathons.length;
  const statLiveNow = adminData.controller ? platformLiveCount : liveCount;
  const statAwaitingReview = adminData.controller ? platformPendingApproval.length : pendingApproval.length;
  const statConcluded = adminData.controller ? platformConcludedCount : concludedCount;

  const hasDocs = (adminData.verificationDocuments?.length || 0) > 0;
  const canCreate = adminData.controller || (adminData.profileCompleted && adminData.isVerified && adminData.verificationStatus === "APPROVED" && hasDocs);

  const handleCreateClick = () => {
    if (canCreate) {
      navigate("/createHackathon");
      return;
    }

    if (!adminData.profileCompleted) {
      toast.error("Complete your profile before creating an event.");
      setShowProfileModal(true);
      return;
    }

    if (adminData.verificationStatus === "PENDING") {
      toast.error("Your verification is still under review. You can create events once approved.");
      return;
    }

    if (adminData.verificationStatus === "REJECTED") {
      toast.error("Your verification was rejected. Please resubmit for verification.");
      return;
    }

    if (adminData.verificationStatus === "APPROVED" && !hasDocs) {
      toast.error("Submit your organiser details and documents to keep creating events.");
      setShowVerificationModal(true);
      return;
    }

    toast.error("Submit your verification request before creating an event.");
  };

  const navGroups = [
    {
      label: "Workspace",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "events", label: "My events", icon: Calendar },
      ],
    },
    ...(adminData.controller
      ? [{
          label: "Platform",
          items: [
            { id: "verification", label: "Verification", icon: BadgeCheck, count: pendingVerifications.length },
            { id: "approvals", label: "Event approvals", icon: Clock, count: pendingHackathons.length },
            { id: "enquiries", label: "Enquiries", icon: Inbox, count: newEnquiries },
            { id: "users", label: "Platform users", icon: Users },
            { id: "admins", label: "Admins", icon: Shield },
            { id: "platform", label: "All events", icon: Globe },
          ],
        }]
      : []),
  ];

  return (
    <div className="ad-root">
      <GridBackground />
      {showProfileModal && (
        <ProfileEditModal
          admin={adminData}
          onClose={() => setShowProfileModal(false)}
          onSaved={(updated) => { setAdminData(updated); login(updated, "admin"); }}
        />
      )}
      {showVerificationModal && (
        <VerificationForm
          admin={adminData}
          onClose={() => setShowVerificationModal(false)}
          onSubmitted={() => setAdminData((a) => ({ ...a, verificationStatus: "PENDING" }))}
        />
      )}
      <div className={`relative z-10 ad-shell ${collapsed ? "is-collapsed" : ""}`}>
        <aside className="ad-side" aria-label="Admin sections">
          <div className="ad-side-head">
            <span className="ad-side-title">Admin</span>
            <button className="ad-side-toggle" onClick={toggleCollapsed} aria-label={collapsed ? "Open sidebar" : "Close sidebar"} title={collapsed ? "Open sidebar" : "Close sidebar"}>
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
          <nav className="ad-side-nav">
            {navGroups.map((g) => (
              <div key={g.label} className="ad-side-group">
                <div className="ad-side-label">{g.label}</div>
                {g.items.map(({ id, label, icon, count }) => (
                  <button key={id} onClick={() => setTab(id)} title={collapsed ? label : undefined} className={`ad-side-item ${tab === id ? "is-active" : ""}`} aria-current={tab === id ? "page" : undefined}>
                    {React.createElement(icon, { size: 17 })}
                    <span className="ad-side-text">{label}</span>
                    {count > 0 && <span className="ad-side-count">{count}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <div className="ad-main">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {tab === "overview" && (<>
        <div className="mb-7 font-sans">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight dark:text-[var(--hk-accent-solid)]">Overview</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">Manage the platform, monitor events and oversee the community.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4 mb-6 font-sans">
          <div className="ad-panel">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                <div className="ad-panel-avatar">
                  {adminData.avatar ? <img src={adminData.avatar} alt="" /> : <User size={24} />}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{adminData.organizationName || adminData.adminName}</div>
                  <div className="text-sm text-[var(--text-muted)] truncate">{adminData.email}</div>
                  <span className="ad-panel-role">{adminData.controller ? "Platform controller" : "Organizer"}</span>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="ad-panel-btn">
                <Pencil size={14} /> {adminData.profileCompleted ? "Edit profile" : "Complete profile"}
              </button>
            </div>
            {!adminData.controller && <div className="mt-4"><VerificationCard admin={adminData} onSubmit={() => setShowVerificationModal(true)} /></div>}
          </div>

          <div className="ad-panel flex flex-col justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Create an event</div>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {canCreate ? "Set up a new event and invite participants." : "Complete and verify your profile first."}
              </p>
            </div>
            <button onClick={handleCreateClick} className={`ad-panel-btn ad-panel-btn--primary ${!canCreate ? "is-locked" : ""}`}>
              <Plus size={16} /> New event
            </button>
          </div>
        </div>

        {!hackathonsLoading && !(adminData.controller && pendingLoading) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total Events" value={statTotalEvents} icon={Layers} color="blue" description={adminData.controller ? "Platform-wide" : "All time"} />
            <StatCard label="Live Now" value={statLiveNow} icon={Zap} color="green" description="Open now" />
            <StatCard label="Awaiting Review" value={statAwaitingReview} icon={Clock} color="amber" description={adminData.controller ? "Platform-wide" : "Your submissions"} />
            <StatCard label="Concluded" value={statConcluded} icon={BadgeCheck} color="gray" description="Closed" />
          </div>
        )}

        <JudgeInvitations onAccepted={() => setAssignedVersion((v) => v + 1)} />

        {(assignedLoading || assignedHackathons.length > 0) && (
          <div className="mb-10">
            <div className="ad-section-title mb-4">
              <Gavel size={18} />
              Assigned as Judge
              <span className="ad-section-count">({assignedHackathons.length})</span>
            </div>
            {assignedLoading ? (
              <div className="ad-empty"><div className="ad-spinner" /> Loading…</div>
            ) : (
              <div className="flex flex-col gap-3">
                {assignedHackathons.map((a) => {
                  const h = a.hackathon;
                  if (!h) return null;
                  const lifecycle = derivePhaseLifecycle(h.phases);
                  return (
                    <div
                      key={a._id}
                      onClick={() => navigate(`/admin/${h._id}/usersubmissions`)}
                      className="ad-hack-card"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-[220px] lg:w-[260px] h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
                          <img
                            src={h.image?.url || "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop"}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.1), rgba(10,10,10,0.4))" }} />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-center">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Chip color="blue"><Gavel size={9} style={{ display: "inline", marginRight: 4 }} />Judge</Chip>
                            {h.status === "APPROVED" && <LifecyclePill status={lifecycle} />}
                          </div>
                          <div className="ad-hack-title">{h.title}</div>
                          {h.subTitle && <div className="ad-hack-subtitle">{h.subTitle}</div>}
                          <div className="ad-hack-meta">
                            <span><Users size={12} style={{ color: "var(--green)" }} />{h.numParticipants || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        </>)}

        {adminData.controller && tab === "verification" && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="ad-section-title"><Clock size={18} style={{ color: "var(--amber)" }} />Pending Verification Requests</div>
              {pendingVerifications.length > 0 && <span className="ad-chip ad-chip--amber">{pendingVerifications.length} pending</span>}
            </div>
            {pendingLoading ? (
              <div className="ad-empty"><div className="ad-spinner" /> Loading…</div>
            ) : pendingVerifications.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingVerifications.map((a) => (
                  <PendingVerificationCard key={a._id} admin={a} onApprove={handleApproveVerification} onReject={handleRejectVerification} />
                ))}
              </div>
            ) : (
              <div className="ad-empty"><AlertCircle size={14} /> No pending verification requests.</div>
            )}
          </div>
        )}

        {adminData.controller && tab === "enquiries" && <ContactEnquiries />}

        {adminData.controller && tab === "users" && <PlatformUsers />}

        {adminData.controller && tab === "approvals" && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="ad-section-title"><Clock size={18} style={{ color: "var(--amber)" }} />Pending Event Approvals</div>
              {pendingHackathons.length > 0 && <span className="ad-chip ad-chip--amber">{pendingHackathons.length} pending</span>}
            </div>
            <div className="ad-pending-note">Expand any card to review full details. Rejecting requires a written reason.</div>
            {pendingLoading ? (
              <div className="ad-empty"><div className="ad-spinner" /> Loading events…</div>
            ) : pendingHackathons.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingHackathons.map((h) => (
                  <PendingHackathonCard key={h._id} hackathon={h} onApprove={handleApproveHackathon} onReject={handleRejectHackathon} />
                ))}
              </div>
            ) : (
              <div className="ad-empty"><AlertCircle size={14} /> Nothing waiting on review.</div>
            )}
          </div>
        )}

        {adminData.controller && tab === "admins" && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="ad-section-title"><Users size={18} style={{ color: "var(--blue)" }} />All Admins</div>
              <span className="ad-chip ad-chip--blue">{allAdmins.length}</span>
            </div>
            {(
              pendingLoading ? (
                <div className="ad-empty"><div className="ad-spinner" /> Loading…</div>
              ) : allAdmins.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {allAdmins.map((a) => (
                    <div key={a._id} className="ad-list-item">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="ad-profile-avatar" style={{ width: "2.2rem", height: "2.2rem" }}>
                          {a.avatar ? <img src={a.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <User size={14} style={{ color: "var(--green)" }} />}
                        </div>
                        <div className="min-w-0">
                          <div className="ad-list-item-title truncate">
                            {a.organizationName || a.adminName}
                            {a.controller && <span className="hf-tag-inline" style={{ marginLeft: 6 }}>CONTROLLER</span>}
                          </div>
                          <div className="ad-list-item-sub truncate">{a.adminName} · {a.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {a.role && <Chip color="blue">{a.role}</Chip>}
                        {a.verificationStatus === "APPROVED" && <Chip color="green">Verified</Chip>}
                        {a.verificationStatus === "PENDING" && <Chip color="amber">Pending</Chip>}
                        {a.verificationStatus === "REJECTED" && <Chip color="red">Rejected</Chip>}
                        {a.verificationStatus === "NOT_SUBMITTED" && <Chip color="gray">Unverified</Chip>}
                        {!a.controller && a._id !== adminData._id && (
                          <button
                            onClick={() => handleDeleteAdmin(a)}
                            title="Permanently delete this admin"
                            className="ad-hack-action-btn ad-hack-action-btn--delete"
                            style={{ position: "static" }}
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ad-empty"><AlertCircle size={14} /> No admins found.</div>
              )
            )}
          </div>
        )}

        {adminData.controller && tab === "platform" && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="ad-section-title"><Globe size={18} style={{ color: "var(--blue)" }} />All Events (Platform)</div>
              <span className="ad-chip ad-chip--blue">{allHackathonsPlatform.length}</span>
            </div>
            <div className="ad-pending-note">As a controller, you can edit or delete any event on the platform, regardless of who created it.</div>
            {(
              pendingLoading ? (
                <div className="ad-empty"><div className="ad-spinner" /> Loading…</div>
              ) : allHackathonsPlatform.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {allHackathonsPlatform.map((h) => (
                    <HackathonCard
                      key={h._id}
                      hackathon={h}
                      onEdited={(updated) => {
                        if (updated.deleted) setAllHackathonsPlatform((prev) => prev.filter((x) => x._id !== updated._id));
                        else setAllHackathonsPlatform((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
                      }}
                      onSubmitForApproval={handleSubmitForApproval}
                    />
                  ))}
                </div>
              ) : (
                <div className="ad-empty"><AlertCircle size={14} /> No events on the platform yet.</div>
              )
            )}
          </div>
        )}

        {tab === "events" && (hackathonsLoading ? (
          <div className="ad-empty p-6"><div className="ad-spinner" /> Loading your events…</div>
        ) : myHackathons.length === 0 ? (
          <div className="ad-empty p-6"><AlertCircle size={14} /> You haven't created any events yet.</div>
        ) : (
          <>
            <HackathonSection title="Drafts" hackathons={drafts} setHackathons={setMyHackathons} icon={FileText} onSubmitForApproval={handleSubmitForApproval} />
            <HackathonSection title="Awaiting Approval" hackathons={pendingApproval} setHackathons={setMyHackathons} icon={Clock} onSubmitForApproval={handleSubmitForApproval} />
            <HackathonSection title="Rejected" hackathons={rejected} setHackathons={setMyHackathons} icon={XCircle} onSubmitForApproval={handleSubmitForApproval} />
            <HackathonSection title="Published" hackathons={published} setHackathons={setMyHackathons} icon={CheckCircle} onSubmitForApproval={handleSubmitForApproval} />
          </>
        ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
