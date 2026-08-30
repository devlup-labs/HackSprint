import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ShieldAlert, Clock, XCircle } from "lucide-react";
import { AdminAPI } from "../../api/admin.api.js";
import { HackathonAPI } from "../../api/hackathon.api.js";
import HackathonForm from "./HackathonForm.jsx";

const GuardCard = ({ icon: Icon, title, children }) => (
  <div className="max-w-lg mx-auto mt-16 bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-8 text-center backdrop-blur-sm">
    <div className="w-12 h-12 mx-auto mb-4 rounded-[3px] bg-[rgba(255,184,77,0.08)] border border-[rgba(255,184,77,0.2)] flex items-center justify-center">
      <Icon size={22} className="text-[#ffb84d]" />
    </div>
    <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-lg mb-2">
      {title}
    </h2>
    <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.72rem] text-[rgba(180,220,180,0.5)] leading-relaxed">
      {children}
    </p>
    <Link
      to="/admin"
      className="mt-6 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.08em] uppercase px-5 py-2.5 rounded-[3px] border border-[rgba(95,255,96,0.25)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.08)] transition-all font-[family-name:'JetBrains_Mono',monospace]"
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
      toast.success("Hackathon created as a draft.");
      navigate(`/admin`, { state: { createdHackathonId: res.data.hackathon?._id } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create hackathon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] animate-spin" />
      </div>
    );

  if (!admin?.profileCompleted)
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <GuardCard icon={ShieldAlert} title="Complete Your Profile First">
          Before you can create a hackathon, we need your organization details —
          name, contact number, and country. Head to your dashboard to fill
          those in.
        </GuardCard>
      </div>
    );

  if (admin.verificationStatus === "REJECTED")
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <GuardCard icon={XCircle} title="Verification Rejected">
          Your organizer verification request was rejected
          {admin.verificationRemarks ? `: "${admin.verificationRemarks}"` : "."}
          {" "}Please resubmit from your dashboard.
        </GuardCard>
      </div>
    );

  if (!admin.isVerified || admin.verificationStatus !== "APPROVED")
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <GuardCard icon={Clock} title="Verification Pending">
          Your organizer account needs to be verified before you can publish
          hackathons. Submit a verification request from your dashboard if
          you haven't already — this usually only needs to happen once.
        </GuardCard>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-[family-name:'JetBrains_Mono',monospace]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[0.62rem] tracking-[0.08em] uppercase text-[rgba(95,255,96,0.5)] hover:text-[#5fff60] transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
        <div className="mb-6">
          <div className="inline-block font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.3)] px-2.5 py-1 rounded-[2px] mb-3">
            new event
          </div>
          <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-2xl sm:text-3xl tracking-tight">
            Create Hackathon
          </h1>
          <p className="text-[0.7rem] text-[rgba(180,220,180,0.45)] mt-1">
            It'll be saved as a draft — submit it for approval whenever you're ready.
          </p>
        </div>
        <HackathonForm onSubmit={handleSubmit} submitLabel="Create Hackathon" isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
