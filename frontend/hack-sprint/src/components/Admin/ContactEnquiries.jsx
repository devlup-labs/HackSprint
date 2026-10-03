import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Inbox, Mail, Phone, Building2, ChevronDown, ChevronUp, Loader2, CheckCircle2, Clock } from "lucide-react";
import { AdminAPI } from "../../api/admin.api.js";
import "../../pages/Styles/AllHackathons.css";
import "./AdminForms.css";

const TYPE = { PARTICIPATE: "Participate", ORGANISE: "Host an event", PARTNER: "Partnership", OTHER: "Other", FEEDBACK: "Feedback" };
const FACES = ["", "😣", "🙁", "😐", "😊", "🤩"];
const STATUS = { NEW: "New", IN_PROGRESS: "In progress", RESOLVED: "Resolved" };
const statusPill = (s) => (s === "NEW" ? "af-pill af-pill--wait" : s === "RESOLVED" ? "af-pill af-pill--ok" : "af-pill");

const ago = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d >= 1) return d === 1 ? "yesterday" : `${d}d ago`;
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  return h >= 1 ? `${h}h ago` : "just now";
};

const Row = ({ e, onChange }) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(e.internalNote || "");
  const [busy, setBusy] = useState(false);

  const save = async (patch) => {
    setBusy(true);
    try {
      const res = await AdminAPI.updateEnquiry(e._id, patch);
      onChange(res.data.enquiry);
      toast.success("Saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save that");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="af-row" style={{ alignItems: "stretch", flexDirection: "column", gap: "0.7rem" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "none", border: 0, cursor: "pointer", textAlign: "left", color: "inherit", width: "100%", fontFamily: "inherit" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: "var(--strong)", fontSize: "0.82rem" }}>{e.name}</span>
            <span className="af-pill">{TYPE[e.type]}</span>
            {e.rating ? <span className="af-pill">{FACES[e.rating]} {e.rating}/5</span> : null}
            <span className={statusPill(e.status)}>{STATUS[e.status]}</span>
          </div>
          <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {e.organization ? `${e.organization} · ` : ""}{e.message}
          </div>
        </div>
        <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", whiteSpace: "nowrap" }}>{ago(e.createdAt)}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", paddingTop: "0.2rem" }}>
          <dl className="af-kv">
            <dt>Email</dt><dd>{e.email ? <a href={`mailto:${e.email}`} style={{ color: "var(--green)" }}>{e.email}</a> : "Not given"}</dd>
            {e.feedbackAbout && <><dt>About</dt><dd>{e.feedbackAbout}</dd></>}
            {e.phone && <><dt>Phone</dt><dd>{e.phone}</dd></>}
            {e.organization && <><dt>Organisation</dt><dd>{e.organization}</dd></>}
            {e.role && <><dt>Role</dt><dd>{e.role}</dd></>}
            {e.eventName && <><dt>Event</dt><dd>{e.eventName}</dd></>}
            {e.expectedParticipants ? <><dt>Participants</dt><dd>{e.expectedParticipants.toLocaleString()}</dd></> : null}
            {e.preferredTimeline && <><dt>Timeline</dt><dd>{e.preferredTimeline}</dd></>}
            <dt>Received</dt><dd>{new Date(e.createdAt).toLocaleString("en-IN")}</dd>
            {e.handledBy && <><dt>Handled by</dt><dd>{e.handledBy.adminName}</dd></>}
          </dl>
          <p style={{ fontSize: "0.76rem", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>{e.message}</p>
          <div className="af-field">
            <label>Internal note</label>
            <textarea className="af-textarea" style={{ minHeight: "3.5rem" }} value={note} onChange={(ev) => setNote(ev.target.value)} maxLength={1000} placeholder="Only controllers see this" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "flex-end" }}>
            {e.email && <a className="af-btn af-btn--sm" href={`mailto:${e.email}?subject=${encodeURIComponent("Re: your HackSprint enquiry")}`}><Mail size={12} /> Reply by email</a>}
            {note !== (e.internalNote || "") && <button className="af-btn af-btn--sm" disabled={busy} onClick={() => save({ internalNote: note })}>Save note</button>}
            {e.status !== "IN_PROGRESS" && <button className="af-btn af-btn--sm" disabled={busy} onClick={() => save({ status: "IN_PROGRESS" })}><Clock size={12} /> In progress</button>}
            {e.status !== "RESOLVED" ? (
              <button className="af-btn af-btn--sm af-btn--primary" disabled={busy} onClick={() => save({ status: "RESOLVED" })}><CheckCircle2 size={12} /> Mark resolved</button>
            ) : (
              <button className="af-btn af-btn--sm" disabled={busy} onClick={() => save({ status: "NEW" })}>Reopen</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Controller-only inbox for messages from the public Contact page.
const ContactEnquiries = () => {
  const open = true;
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [newCount, setNewCount] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p = 1, replace = true) => {
    setLoading(true);
    try {
      const res = await AdminAPI.listEnquiries({ type, status, page: p, limit: 15 });
      setItems((prev) => (replace ? res.data.enquiries : [...prev, ...res.data.enquiries]));
      setTotal(res.data.total);
      setNewCount(res.data.newCount);
      setHasNext(res.data.pagination.hasNext);
      setPage(p);
    } catch {
      toast.error("Couldn't load enquiries");
    } finally {
      setLoading(false);
    }
  }, [type, status]);

  // Count of unread shows on the header even while the list is collapsed.
  useEffect(() => { load(1, true); }, [load]);

  const replaceOne = (u) => setItems((prev) => prev.map((x) => (x._id === u._id ? u : x)));

  const chip = (value, current, set, label) => (
    <button key={label} className={`af-btn af-btn--sm ${current === value ? "af-btn--primary" : ""}`} onClick={() => set(value)}>{label}</button>
  );

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="ad-section-title"><Inbox size={18} />Contact enquiries</div>
        {newCount > 0 && <span className="ad-chip ad-chip--amber">{newCount} new</span>}
      </div>
      <div className="ad-pending-note">Messages from the public Contact page and notes from the feedback form.</div>

      {open && (
        <div style={{ marginTop: "0.8rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.5rem" }}>
            {chip("", type, setType, "All types")}
            {Object.entries(TYPE).map(([v, l]) => chip(v, type, setType, l))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.8rem" }}>
            {chip("", status, setStatus, "Any status")}
            {Object.entries(STATUS).map(([v, l]) => chip(v, status, setStatus, l))}
          </div>
          <div className="af-panel">
            {loading && items.length === 0 ? (
              <div className="af-row" style={{ justifyContent: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}><Loader2 size={14} className="animate-spin" /> Loading…</div>
            ) : items.length === 0 ? (
              <div className="af-row" style={{ justifyContent: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}>No enquiries match.</div>
            ) : (
              items.map((e) => <Row key={e._id} e={e} onChange={replaceOne} />)
            )}
          </div>
          {hasNext && (
            <div style={{ textAlign: "center", marginTop: "0.8rem" }}>
              <button className="af-btn af-btn--sm" disabled={loading} onClick={() => load(page + 1, false)}>{loading ? "Loading…" : `Load more (${total - items.length} left)`}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactEnquiries;
