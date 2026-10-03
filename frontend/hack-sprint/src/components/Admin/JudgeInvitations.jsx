import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Gavel, Check, X } from "lucide-react";
import { JudgeAPI } from "../../api/judge.api.js";
import "../../pages/Styles/AllHackathons.css";
import "./AdminForms.css";

// Being named a judge is an invitation: nothing applies until it's accepted.
// Shown on the dashboard whenever an organiser has invited this admin.
const JudgeInvitations = ({ onAccepted }) => {
  const [invites, setInvites] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    JudgeAPI.getMyInvitations()
      .then((res) => setInvites(res.data.invitations || []))
      .catch(() => setInvites([]));
  }, []);

  useEffect(load, [load]);

  const respond = async (inv, accept) => {
    setBusy(inv._id);
    try {
      const res = accept ? await JudgeAPI.acceptInvitation(inv._id) : await JudgeAPI.declineInvitation(inv._id);
      toast.success(res.data.message);
      setInvites((prev) => prev.filter((i) => i._id !== inv._id));
      if (accept) onAccepted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your reply");
      load();
    } finally {
      setBusy(null);
    }
  };

  if (!invites || invites.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="ad-section-title mb-4">
        <Gavel size={18} style={{ color: "var(--amber)" }} />
        Judge invitations
        <span className="ad-section-count">({invites.length})</span>
      </div>
      <div className="af-panel" style={{ fontFamily: "var(--font-mono)" }}>
        {invites.map((inv) => {
          const h = inv.hackathon;
          const by = inv.assignedBy;
          return (
            <div key={inv._id} className="af-row" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, color: "var(--strong)", fontSize: "0.82rem" }}>{h?.title || "An event"}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>
                  {by?.adminName || "An organiser"}{by?.organizationName ? ` · ${by.organizationName}` : ""} invited you to be a judge.
                  You only become one if you accept.
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="af-btn af-btn--sm af-btn--ghost-danger" disabled={busy === inv._id} onClick={() => respond(inv, false)}>
                  <X size={12} /> Decline
                </button>
                <button className="af-btn af-btn--sm af-btn--primary" disabled={busy === inv._id} onClick={() => respond(inv, true)}>
                  <Check size={12} /> Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JudgeInvitations;
