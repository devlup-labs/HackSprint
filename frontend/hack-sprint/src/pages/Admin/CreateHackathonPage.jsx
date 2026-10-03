import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ShieldAlert, Clock, XCircle } from "lucide-react";
import { AdminAPI } from "../../api/admin.api.js";
import { HackathonAPI } from "../../api/hackathon.api.js";
import HackathonForm from "./HackathonForm.jsx";

const GuardCard = ({ icon: Icon, title, children }) => (
  <div className="max-w-lg mx-auto mt-16 bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-[4px] p-8 text-center backdrop-blur-sm">
    <div className="w-12 h-12 mx-auto mb-4 rounded-[3px] bg-[rgba(var(--hk-amber-rgb),0.08)] border border-[rgba(var(--hk-amber-rgb),0.2)] flex items-center justify-center">
      <Icon size={22} className="text-[rgb(var(--hk-amber-rgb))]" />
    </div>
    <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-lg mb-2">
      {title}
    </h2>
    <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.72rem] text-[rgba(var(--hk-text-rgb),0.85)] dark:text-[rgba(var(--hk-text-rgb),0.5)] leading-relaxed">
      {children}
    </p>
    <Link
      to="/admin"
      className="mt-6 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.08em] uppercase px-5 py-2.5 rounded-[3px] border border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] text-[var(--hk-accent-solid)] hover:bg-[rgba(var(--hk-accent-rgb),0.08)] transition-all font-[family-name:'JetBrains_Mono',monospace]"
    >
      <ArrowLeft size={13} /> Back to Dashboard
    </Link>
  </div>
);

export default function CreateHackathonPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AdminAPI.getProfile()
      .then((res) => setAdmin(res.data.admin))
      .catch(() => navigate("/adminlogin"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await HackathonAPI.createHackathon(payload);
      toast.success("Event created as a draft.");
      navigate(`/admin`, { state: { createdHackathonId: res.data.hackathon?._id } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--hk-bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] border-t-[var(--hk-accent-solid)] animate-spin" />
      </div>
    );

  if (!admin?.controller && !admin?.profileCompleted)
    return (
      <div className="min-h-screen bg-[var(--hk-bg)]">
        <GuardCard icon={ShieldAlert} title="Complete Your Profile First">
          Before you can create an event, we need your organization details —
          name, contact number, and country. Head to your dashboard to fill
          those in.
        </GuardCard>
      </div>
    );

  if (!admin.controller && admin.verificationStatus === "REJECTED")
    return (
      <div className="min-h-screen bg-[var(--hk-bg)]">
        <GuardCard icon={XCircle} title="Verification Rejected">
          Your organizer verification request was rejected
          {admin.verificationRemarks ? `: "${admin.verificationRemarks}"` : "."}
          {" "}Please resubmit from your dashboard.
        </GuardCard>
      </div>
    );

  if (!admin.controller && (!admin.isVerified || admin.verificationStatus !== "APPROVED" || !admin.verificationDocuments?.length))
    return (
      <div className="min-h-screen bg-[var(--hk-bg)]">
        <GuardCard icon={Clock} title="Verification Pending">
          Your organizer account needs to be verified before you can publish
          hackathons. Submit a verification request from your dashboard if
          you haven't already — this usually only needs to happen once.
        </GuardCard>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--hk-bg)] font-[family-name:'JetBrains_Mono',monospace]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[0.62rem] tracking-[0.08em] uppercase text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] hover:text-[var(--hk-accent-solid)] transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
        <div className="mb-6">
          <div className="inline-block font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.2em] uppercase text-[var(--hk-accent-solid)] border border-[rgba(var(--hk-card-border-rgb),0.48)] dark:border-[rgba(var(--hk-card-border-rgb),0.3)] px-2.5 py-1 rounded-[2px] mb-3">
            new event
          </div>
          <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-2xl sm:text-3xl tracking-tight">
            Create Event
          </h1>
          <p className="text-[0.7rem] text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mt-1">
            It'll be saved as a draft — submit it for approval whenever you're ready.
          </p>
        </div>
        <HackathonForm onSubmit={handleSubmit} submitLabel="Create Event" isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
