import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ProfileAPI } from "../api/profile.api.js";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  User,
  Plus,
  KeyRound,
  Copy,
  Check,
  X,
  Calendar,
  Trophy,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { HackathonAPI } from "../api/hackathon.api.js";
import { RegistrationAPI } from "../api/registration.api.js";
import { TeamAPI } from "../api/team.api.js";
import DynamicFieldsForm from "../components/DynamicFieldsForm.jsx";
import {
  normalizeFields,
  buildInitialValues,
  validateFields,
} from "../utils/dynamicFields.js";
import "../pages/Styles/AllHackathons.css";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const inp = [
  mono,
  "w-full bg-[rgba(var(--hk-input-bg),0.7)]",
  "border border-[rgba(var(--hk-card-border-rgb),0.2)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)]",
  "rounded-[4px] px-3.5 py-3 text-[0.78rem] text-[var(--hk-text)]",
  "placeholder-[rgba(var(--hk-text-rgb),0.45)] dark:placeholder-[rgba(var(--hk-accent-rgb),0.28)]",
  "focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.6)]",
  "focus:shadow-[0_0_0_3px_rgba(var(--hk-accent-rgb),0.1)]",
  "transition-all [color-scheme:light] dark:[color-scheme:dark]",
].join(" ");

const Field = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label
      className={`${mono} text-[0.6rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.6)]`}
    >
      {label}
      {required && <span className="text-[rgb(var(--hk-red-rgb))] ml-1">*</span>}
    </label>
    {children}
    {hint && (
      <p className={`${mono} text-[0.6rem] leading-relaxed text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.4)]`}>
        {hint}
      </p>
    )}
  </div>
);

const PrimaryBtn = ({ children, disabled, type = "button", onClick, className = "" }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`${mono} inline-flex items-center justify-center gap-2
      text-[0.68rem] tracking-[0.1em] uppercase px-7 py-3.5 rounded-[4px] border cursor-pointer
      transition-all duration-150
      bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] font-bold
      hover:brightness-110 hover:shadow-[0_6px_24px_rgba(var(--hk-accent-rgb),0.3)]
      disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, disabled, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`${mono} inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-5 py-3.5 rounded-[4px] border cursor-pointer transition-all duration-150
      bg-transparent border-[rgba(var(--hk-card-border-rgb),0.3)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] text-[rgba(var(--hk-text-rgb),0.85)] dark:text-[rgba(var(--hk-text-rgb),0.7)]
      hover:border-[rgba(var(--hk-accent-rgb),0.5)] hover:text-[var(--hk-accent-solid)] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Corners = () => (
  <>
    <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(var(--hk-accent-rgb),0.5)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(var(--hk-accent-rgb),0.5)]" />
  </>
);

// One clear choice per card instead of a pair of small tabs — "create" and
// "join" are genuinely different decisions, so each gets room to explain
// itself.
const ChoiceCard = ({ active, onClick, icon: Icon, title, description }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative text-left rounded-[4px] border p-4 cursor-pointer transition-all duration-150 ${
      active
        ? "border-[rgba(var(--hk-accent-rgb),0.7)] bg-[rgba(var(--hk-accent-rgb),0.08)] shadow-[0_0_0_3px_rgba(var(--hk-accent-rgb),0.08)]"
        : "border-[rgba(var(--hk-card-border-rgb),0.2)] dark:border-[rgba(var(--hk-card-border-rgb),0.14)] bg-[rgba(var(--hk-card-bg),0.6)] hover:border-[rgba(var(--hk-accent-rgb),0.4)]"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-[4px] border flex items-center justify-center flex-shrink-0 ${
          active
            ? "bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)]"
            : "bg-[rgba(var(--hk-accent-rgb),0.07)] border-[rgba(var(--hk-accent-rgb),0.25)] text-[var(--hk-accent-solid)]"
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`${syne} font-extrabold text-[var(--hk-text)] text-sm tracking-tight mb-0.5`}>
          {title}
        </div>
        <p className={`${mono} text-[0.62rem] leading-relaxed text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.5)]`}>
          {description}
        </p>
      </div>
      {active && <Check size={15} className="text-[var(--hk-accent-solid)] flex-shrink-0 mt-0.5" />}
    </div>
  </button>
);

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="w-7 h-7 rounded-[3px] bg-[rgba(var(--hk-accent-rgb),0.08)] border border-[rgba(var(--hk-accent-rgb),0.2)] flex items-center justify-center flex-shrink-0">
      <Icon size={13} className="text-[var(--hk-accent-solid)]" />
    </div>
    <div className="min-w-0">
      <div className={`${mono} text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-text-rgb),0.6)] dark:text-[rgba(var(--hk-text-rgb),0.38)]`}>
        {label}
      </div>
      <div className={`${mono} text-[0.72rem] text-[var(--hk-text)] leading-snug`}>{children}</div>
    </div>
  </div>
);

const shortDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const TeamInfoModal = ({ details, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(details.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-md bg-[rgb(var(--hk-card-bg))] border border-[rgba(var(--hk-card-border-rgb),0.3)] dark:border-[rgba(var(--hk-accent-rgb),0.22)] rounded-[4px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_0_40px_rgba(var(--hk-accent-rgb),0.08)]">
        <Corners />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--hk-accent-rgb),0.5)] to-transparent" />

        <h2 className={`${syne} font-extrabold text-[var(--hk-text)] text-2xl tracking-tight mb-1`}>
          Team created
        </h2>
        <p className={`${mono} text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.55)] mb-6 leading-relaxed`}>
          Share this code with your teammates — they&apos;ll enter it to request to join, and you approve them from your team page.
        </p>

        <div className={`${mono} text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] mb-1.5`}>
          Invite code
        </div>
        <div className="flex items-stretch gap-2 mb-7">
          <div className={`${mono} flex-1 bg-[rgba(var(--hk-accent-rgb),0.07)] border border-[rgba(var(--hk-accent-rgb),0.3)] rounded-[4px] px-4 py-3 text-[var(--hk-accent-solid)] truncate text-lg tracking-[0.25em] text-center font-semibold`}>
            {details.code}
          </div>
          <button
            onClick={copy}
            title="Copy code"
            className="w-12 flex items-center justify-center rounded-[4px] border border-[rgba(var(--hk-accent-rgb),0.3)] bg-[rgba(var(--hk-accent-rgb),0.07)] text-[var(--hk-accent-solid)] hover:bg-[rgba(var(--hk-accent-rgb),0.14)] transition-all cursor-pointer flex-shrink-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <PrimaryBtn onClick={onClose} className="w-full">
          Go to team page <ChevronRight size={14} />
        </PrimaryBtn>
      </div>
    </div>
  );
};

export const RegistrationForm = ({ onSubmit = () => {} }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState(null);
  const [step, setStep] = useState("register");

  const [regFields, setRegFields] = useState([]);
  const [regValues, setRegValues] = useState({});
  const [regErrors, setRegErrors] = useState({});

  const [teamOption, setTeamOption] = useState("create");
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [teamDetails, setTeamDetails] = useState({ code: "" });
  const [pendingTeam, setPendingTeam] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await HackathonAPI.getHackathonBySlug(slug);
        const h = res.data.hackathon;
        if (cancelled) return;
        setHackathon(h);

        const fields = normalizeFields(h.registrationForm || [], "registration");
        setRegFields(fields);
        setRegValues(buildInitialValues(fields));

        try {
          const regRes = await RegistrationAPI.getMyRegistration(h._id);
          if (cancelled) return;
          const registration = regRes.data.registration;
          if (h.participationType === "TEAM" && !registration.team) {
            setStep("team");
          } else {
            setStep("done");
          }
        } catch (err) {
          if (err.response?.status !== 404) throw err;
          // Not registered yet. Registering needs a complete profile, so send
          // people to fill it in now rather than after they've typed the form.
          try {
            const profileRes = await ProfileAPI.getMyProfile();
            if (!cancelled && profileRes.data.profile.isProfileComplete === false) {
              toast.error("Complete your profile to register for events", {
                id: "profile-incomplete",
              });
              navigate("/dashboard?completeProfile=1", { replace: true });
              return;
            }
          } catch {
            // The server enforces this on submit, so a failed check here is fine.
          }
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load event details"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const handleFieldChange = (fieldName, value) => {
    setRegValues((prev) => ({ ...prev, [fieldName]: value }));
    setRegErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateFields(regFields, regValues);
    if (Object.keys(errors).length) {
      setRegErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await RegistrationAPI.register(hackathon._id, regValues);
      toast.success("Registered successfully!");
      onSubmit(regValues);
      setStep(hackathon.participationType === "TEAM" ? "team" : "done");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await TeamAPI.createTeam(hackathon._id, { teamName });
      toast.success(res.data.message || "Team created!");
      setTeamDetails({ code: res.data.team.secretCode });
      setShowTeamInfo(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Team creation failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const code = joinCode.trim();
      await TeamAPI.joinTeam({ secretCode: code });

      try {
        const searchRes = await TeamAPI.searchTeam(code);
        setPendingTeam({ id: searchRes.data.team.id, name: searchRes.data.team.name });
      } catch {
        setPendingTeam({ id: null, name: null });
      }

      toast.success("Join request sent to the team leader!");
      setStep("done");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to join team"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingTeam?.id) return;
    setCancelling(true);
    try {
      await TeamAPI.cancelJoinRequest(pendingTeam.id);
      toast.success("Join request cancelled.");
      setPendingTeam(null);
      setJoinCode("");
      setStep("team");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to cancel request"
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return null;
  if (!hackathon) return null;

  const isTeamEvent = hackathon.participationType === "TEAM";
  const registrationPhase = (hackathon.phases || []).find(
    (p) => p.phaseType === "REGISTRATION"
  );
  const prizeTotal = (hackathon.prizes || []).reduce((s, p) => s + (p.amount || 0), 0);

  const heading = {
    register: {
      eyebrow: "Registration",
      title: "Register for this event",
      sub: "Fill in the details below to secure your spot.",
    },
    team: {
      eyebrow: "Team setup",
      title: "Join or create a team",
      sub: "This event is team-based — start your own team or join one with an invite code.",
    },
    done: {
      eyebrow: pendingTeam ? "Request sent" : "Confirmed",
      title: pendingTeam ? "Waiting for the team leader" : "You're all set",
      sub: "",
    },
  }[step];

  return (
    <>
      <div className="min-h-screen bg-[var(--hk-bg)] px-4 py-10 sm:py-14 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(var(--hk-accent-rgb),.03) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--hk-accent-rgb),.03) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse,rgba(var(--hk-accent-rgb),.09) 0%,transparent 65%)",
          }}
        />

        {showTeamInfo && (
          <TeamInfoModal
            details={teamDetails}
            onClose={() => {
              setShowTeamInfo(false);
              navigate(`/hackathon/${slug}/team/${teamDetails.code}`, {
                state: { secretCode: teamDetails.code },
              });
            }}
          />
        )}

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-5 items-start">
            {/* ── Hackathon summary ── */}
            <aside className="relative lg:sticky lg:top-0 bg-[rgba(var(--hk-card-bg),0.92)] border border-[rgba(var(--hk-card-border-rgb),0.2)] dark:border-[rgba(var(--hk-card-border-rgb),0.14)] rounded-[4px] overflow-hidden backdrop-blur-sm">
              <Corners />
              {hackathon.image?.url && (
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={hackathon.image.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--hk-card-bg),0.95)] via-transparent to-transparent" />
                </div>
              )}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <div className={`${mono} text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(var(--hk-accent-rgb),0.85)] dark:text-[rgba(var(--hk-accent-rgb),0.6)] mb-1.5`}>
                    HackSprint
                  </div>
                  <h2 className={`${syne} font-extrabold text-[var(--hk-text)] text-lg leading-tight tracking-tight`}>
                    {hackathon.title}
                  </h2>
                  {hackathon.subTitle && (
                    <p className={`${mono} text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.5)] mt-1.5 leading-relaxed`}>
                      {hackathon.subTitle}
                    </p>
                  )}
                </div>

                <div className="h-px bg-[rgba(var(--hk-card-border-rgb),0.15)] dark:bg-[rgba(var(--hk-accent-rgb),0.08)]" />

                <InfoRow icon={isTeamEvent ? Users : User} label="Format">
                  {isTeamEvent
                    ? `Team · up to ${hackathon.maxTeamSize || "N"} members`
                    : "Individual"}
                </InfoRow>
                {registrationPhase && (
                  <InfoRow icon={Calendar} label="Registration closes">
                    {shortDate(registrationPhase.endDate)}
                  </InfoRow>
                )}
                {prizeTotal > 0 && (
                  <InfoRow icon={Trophy} label="Prize pool">
                    ₹{prizeTotal.toLocaleString("en-IN")}
                  </InfoRow>
                )}
                {hackathon.venue && (
                  <InfoRow icon={MapPin} label="Venue">
                    {hackathon.venue}
                  </InfoRow>
                )}
              </div>
            </aside>

            {/* ── Main card ── */}
            <main className="relative bg-[rgba(var(--hk-card-bg),0.92)] border border-[rgba(var(--hk-card-border-rgb),0.2)] dark:border-[rgba(var(--hk-card-border-rgb),0.14)] rounded-[4px] px-6 sm:px-9 py-8 backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Corners />

              <header className="mb-7 pb-6 border-b border-[rgba(var(--hk-card-border-rgb),0.15)] dark:border-[rgba(var(--hk-accent-rgb),0.08)]">
                <div className={`${mono} text-[0.58rem] tracking-[0.2em] uppercase text-[rgba(var(--hk-accent-rgb),0.9)] dark:text-[rgba(var(--hk-accent-rgb),0.6)] mb-2`}>
                  {heading.eyebrow}
                </div>
                <h1 className={`${syne} font-extrabold text-[var(--hk-text)] text-2xl sm:text-3xl tracking-tight leading-tight`}>
                  {heading.title}
                </h1>
                {heading.sub && (
                  <p className={`${mono} text-[0.72rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)] mt-2 leading-relaxed`}>
                    {heading.sub}
                  </p>
                )}
              </header>

              {step === "register" && (
                <form onSubmit={handleRegister}>
                  {regFields.length > 0 ? (
                    <DynamicFieldsForm
                      fields={regFields}
                      values={regValues}
                      onChange={handleFieldChange}
                      errors={regErrors}
                      resourceType="resource"
                      hackathonId={hackathon._id}
                    />
                  ) : (
                    <div className="flex items-start gap-3 p-4 rounded-[4px] border border-[rgba(var(--hk-accent-rgb),0.25)] bg-[rgba(var(--hk-accent-rgb),0.06)]">
                      <ShieldCheck size={18} className="text-[var(--hk-accent-solid)] flex-shrink-0 mt-0.5" />
                      <p className={`${mono} text-[0.72rem] text-[var(--hk-text)] leading-relaxed`}>
                        No extra details are needed for this event — confirm below to complete your registration.
                      </p>
                    </div>
                  )}
                  <div className="mt-8 pt-6 border-t border-[rgba(var(--hk-card-border-rgb),0.15)] dark:border-[rgba(var(--hk-accent-rgb),0.08)] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                    <GhostBtn onClick={() => navigate(`/hackathon/${slug}`)} className="w-full sm:w-auto">
                      Cancel
                    </GhostBtn>
                    <PrimaryBtn type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? (
                        "Registering…"
                      ) : (
                        <>
                          <span>{isTeamEvent ? "Register & continue" : "Complete registration"}</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </PrimaryBtn>
                  </div>
                </form>
              )}

              {step === "team" && (
                <div className="flex flex-col gap-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ChoiceCard
                      active={teamOption === "create"}
                      onClick={() => setTeamOption("create")}
                      icon={Plus}
                      title="Create a team"
                      description={`Start a new team and invite up to ${
                        hackathon.maxTeamSize ? hackathon.maxTeamSize - 1 : "your"
                      } teammates with a code. You'll be the leader.`}
                    />
                    <ChoiceCard
                      active={teamOption === "join"}
                      onClick={() => setTeamOption("join")}
                      icon={KeyRound}
                      title="Join with a code"
                      description="Got an invite code from a teammate? Request to join — the leader approves you."
                    />
                  </div>

                  {teamOption === "create" && (
                    <form onSubmit={handleCreateTeam} className="flex flex-col gap-6">
                      <Field
                        label="Team name"
                        required
                        hint="Pick something your teammates will recognise — this is what judges and organizers see."
                      >
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Byte Builders"
                          maxLength={40}
                          className={inp}
                          required
                        />
                      </Field>
                      <div className="flex justify-end">
                        <PrimaryBtn type="submit" disabled={submitting || !teamName.trim()} className="w-full sm:w-auto">
                          {submitting ? (
                            "Creating…"
                          ) : (
                            <>
                              <Users size={14} />
                              <span>Create team</span>
                              <ChevronRight size={14} />
                            </>
                          )}
                        </PrimaryBtn>
                      </div>
                    </form>
                  )}

                  {teamOption === "join" && (
                    <form onSubmit={handleJoinTeam} className="flex flex-col gap-6">
                      <Field
                        label="Team invite code"
                        required
                        hint="Ask your team leader for the code. They'll get a notification and need to approve your request."
                      >
                        <input
                          type="text"
                          placeholder="ABC123XY"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          className={`${inp} text-center text-lg tracking-[0.3em] font-semibold py-4`}
                          required
                        />
                      </Field>
                      <div className="flex justify-end">
                        <PrimaryBtn type="submit" disabled={submitting || !joinCode.trim()} className="w-full sm:w-auto">
                          {submitting ? (
                            "Sending…"
                          ) : (
                            <>
                              <span>Request to join</span>
                              <ChevronRight size={14} />
                            </>
                          )}
                        </PrimaryBtn>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {step === "done" && pendingTeam && (
                <div className="text-center py-4">
                  <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[rgba(var(--hk-amber-rgb),0.12)] border border-[rgba(var(--hk-amber-rgb),0.4)] flex items-center justify-center">
                    <KeyRound size={26} className="text-[rgb(var(--hk-amber-rgb))]" />
                  </div>
                  <p className={`${mono} text-[0.82rem] text-[var(--hk-text)] mb-1.5`}>
                    Request sent{pendingTeam.name ? ` to "${pendingTeam.name}"` : ""}.
                  </p>
                  <p className={`${mono} text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)] mb-7`}>
                    You&apos;ll be notified as soon as the team leader responds.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {pendingTeam.id && (
                      <button
                        onClick={handleCancelRequest}
                        disabled={cancelling}
                        className={`${mono} inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-5 py-3.5 rounded-[4px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(var(--hk-red-rgb),0.4)] text-[rgb(var(--hk-red-rgb))] hover:bg-[rgba(var(--hk-red-rgb),0.08)] disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto`}
                      >
                        <X size={13} /> {cancelling ? "Cancelling…" : "Cancel request"}
                      </button>
                    )}
                    <PrimaryBtn onClick={() => navigate(`/hackathon/${slug}`)} className="w-full sm:w-auto">
                      Back to hackathon <ChevronRight size={14} />
                    </PrimaryBtn>
                  </div>
                </div>
              )}

              {step === "done" && !pendingTeam && (
                <div className="text-center py-4">
                  <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[rgba(var(--hk-accent-rgb),0.12)] border border-[rgba(var(--hk-accent-rgb),0.4)] flex items-center justify-center">
                    <Check size={28} className="text-[var(--hk-accent-solid)]" />
                  </div>
                  <p className={`${mono} text-[0.82rem] text-[var(--hk-text)] mb-7 max-w-md mx-auto leading-relaxed`}>
                    {isTeamEvent
                      ? "You're registered and part of a team for this event."
                      : "You're registered for this event. Good luck!"}
                  </p>
                  <PrimaryBtn onClick={() => navigate(`/hackathon/${slug}`)} className="w-full sm:w-auto">
                    Back to hackathon <ChevronRight size={14} />
                  </PrimaryBtn>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
