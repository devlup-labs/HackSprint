import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, TriangleAlert, Users, Loader2 } from "lucide-react";
import { AdminAPI } from "../../api/admin.api.js";
import "../../pages/Styles/AllHackathons.css";
import "./AdminForms.css";

const initials = (u) => (u.name || u.email || "?")[0].toUpperCase();

const RemoveDialog = ({ user, onClose, onDone }) => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = email.trim().toLowerCase() === user.email && reason.trim().length >= 5;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await AdminAPI.deleteUser(user._id, { confirmEmail: email.trim(), reason: reason.trim() });
      toast.success(res.data.message);
      onDone(user._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't remove that user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="af-overlay" role="dialog" aria-modal="true">
      <div className="af-backdrop" onClick={busy ? undefined : onClose} />
      <div className="af-modal af-modal--narrow" style={{ marginTop: "10vh" }}>
        <div className="af-head">
          <div style={{ color: "var(--red)", paddingTop: 2 }}><TriangleAlert size={20} /></div>
          <div>
            <div className="af-head-title">Remove {user.name || user.email}?</div>
            <div className="af-head-sub">This permanently deletes the account and what it owns: registrations, votes, messages and connections. Teams they led pass to a teammate or are disbanded if empty. It can't be undone.</div>
          </div>
        </div>
        <div className="af-body" style={{ gap: "1rem" }}>
          <div className="af-field">
            <label>Reason <b>*</b></label>
            <textarea className="af-textarea" style={{ minHeight: "4rem" }} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="e.g. Fake identity, repeated abuse in discussions" />
            <div className="af-hint">Kept in the server log with your account.</div>
          </div>
          <div className="af-field">
            <label>Type <span style={{ textTransform: "none", color: "var(--strong)" }}>{user.email}</span> to confirm <b>*</b></label>
            <input className="af-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </div>
        </div>
        <div className="af-foot">
          <button className="af-btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="af-btn af-btn--danger" onClick={submit} disabled={!ready || busy}>
            {busy ? <><Loader2 size={13} className="animate-spin" /> Removing…</> : <><Trash2 size={13} /> Remove user</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Controller-only: find a student account and remove it from the platform.
const PlatformUsers = () => {
  const open = true;
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      AdminAPI.searchUsers({ q: q.trim(), limit: 12 }, { signal: controller.signal })
        .then((res) => setUsers(res.data.users || []))
        .catch((err) => { if (err.code !== "ERR_CANCELED") toast.error("Couldn't load users"); })
        .finally(() => !controller.signal.aborted && setLoading(false));
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [q, open]);

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="ad-section-title"><Users size={18} />Platform users</div>
      </div>
      <div className="ad-pending-note">Find a student account by name, username or email and remove it if it's abusive or fake.</div>

      {open && (
        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="af-input" style={{ paddingLeft: "2.2rem" }} placeholder="Search by name, @username or email" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="af-panel">
            {loading && users.length === 0 ? (
              <div className="af-row" style={{ justifyContent: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}><Loader2 size={14} className="animate-spin" /> Loading…</div>
            ) : users.length === 0 ? (
              <div className="af-row" style={{ justifyContent: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}>No users match.</div>
            ) : (
              users.map((u) => (
                <div key={u._id} className="af-row">
                  <div className="af-avatar">{u.image?.url ? <img src={u.image.url} alt="" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.replaceWith(document.createTextNode(initials(u))); }} /> : initials(u)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--strong)", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || "—"}{u.userName && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> · @{u.userName}</span>}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email} · {u.registrations} registration{u.registrations === 1 ? "" : "s"}</div>
                  </div>
                  <button className="af-btn af-btn--sm af-btn--ghost-danger" onClick={() => setTarget(u)}><Trash2 size={12} /> Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {target && <RemoveDialog user={target} onClose={() => setTarget(null)} onDone={(id) => { setUsers((p) => p.filter((u) => u._id !== id)); setTarget(null); }} />}
    </div>
  );
};

export default PlatformUsers;
