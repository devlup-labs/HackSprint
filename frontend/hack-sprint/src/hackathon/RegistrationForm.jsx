import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Users,
  Plus,
  KeyRound,
  Copy,
  Check,
  X,
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

const inp = [
  "font-[family-name:'JetBrains_Mono',monospace]",
  "w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)]",
  "rounded-[3px] px-3 py-2.5 text-[0.72rem] text-[#e8ffe8]",
  "placeholder-[rgba(95,255,96,0.28)]",
  "focus:outline-none focus:border-[rgba(95,255,96,0.45)]",
  "focus:shadow-[0_0_0_2px_rgba(95,255,96,0.07)]",
  "transition-all [color-scheme:dark]",
].join(" ");

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5 mb-5">
    <label className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.55)]">
      {label}
      {required && <span className="text-[#ff9090] ml-1">*</span>}
    </label>
    {children}
  </div>
);

const PrimaryBtn = ({
  children,
  disabled,
  type = "button",
  onClick,
  className = "",
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center justify-center gap-2
      text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] border cursor-pointer
      transition-all duration-150
      bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
      hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]
      disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

const SubTabBtn = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`font-[family-name:'JetBrains_Mono',monospace] flex-1 inline-flex items-center justify-center gap-1.5
      text-[0.6rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[2px] cursor-pointer transition-all duration-150
      ${
        active
          ? "bg-[rgba(95,255,96,0.12)] text-[#5fff60] border border-[rgba(95,255,96,0.3)]"
          : "text-[rgba(95,255,96,0.45)] hover:text-[rgba(95,255,96,0.7)]"
      }`}
  >
    {children}
  </button>
);

const StepIndicator = ({ steps, current }) => {
  const currentIndex = steps.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              i <= currentIndex ? "bg-[#5fff60]" : "bg-[rgba(95,255,96,0.15)]"
            }`}
          />
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px transition-all ${
                i < currentIndex ? "bg-[#5fff60]" : "bg-[rgba(95,255,96,0.15)]"
              }`}
            />
          )}
        </React.Fragment>
      ))}
      <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.4)] ml-2">
        Step {currentIndex + 1} of {steps.length}
      </span>
    </div>
  );
};

const TeamInfoModal = ({ details, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(details.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-md bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.22)] rounded-[4px] p-8 shadow-[0_0_40px_rgba(95,255,96,0.08)]">
        <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.55)]" />
        <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.55)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.35)] to-transparent" />

        <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl tracking-tight mb-1">
          Team Created!
        </h2>
        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.55)] mb-6 leading-relaxed">
          Share the code below so teammates can join.
        </p>

        <div className="flex flex-col gap-4 mb-7">
          <div>
            <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mb-1.5">
              Invite Code
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2 text-[#5fff60] truncate font-[family-name:'JetBrains_Mono',monospace] text-sm tracking-widest">
                {details.code}
              </div>
              <button
                onClick={copy}
                className="w-9 h-9 flex items-center justify-center rounded-[3px] border border-[rgba(95,255,96,0.2)] bg-[rgba(95,255,96,0.06)] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.38)] transition-all cursor-pointer flex-shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <PrimaryBtn onClick={onClose} className="w-full">
          Proceed to Team Page <ChevronRight size={14} />
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
          // not registered yet — stay on the register step
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load hackathon details"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-10 relative overflow-hidden font-[family-name:'JetBrains_Mono',monospace]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(95,255,96,.026) 1px,transparent 1px),linear-gradient(90deg,rgba(95,255,96,.026) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse,rgba(95,255,96,.06) 0%,transparent 65%)",
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

        <div className="relative z-10 w-full max-w-3xl bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] px-6 sm:px-10 py-9 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />

          <div className="text-center mb-7 pb-6 border-b border-[rgba(95,255,96,0.08)]">
            <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.45)] mb-2">
              HackSprint
            </div>
            <StepIndicator
              steps={hackathon.participationType === "TEAM" ? ["register", "team", "done"] : ["register", "done"]}
              current={step}
            />
            <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-2xl sm:text-3xl md:text-4xl tracking-tight">
              {step === "register"
                ? "Hackathon Registration"
                : step === "team"
                ? "Join or Create a Team"
                : "You're All Set"}
            </h1>
          </div>

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
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[rgba(180,220,180,0.55)] mb-2">
                  No additional details are required — just confirm your
                  registration to continue.
                </p>
              )}
              <div className="mt-6 flex justify-center sm:justify-end">
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    "Registering…"
                  ) : (
                    <>
                      <span>Register</span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </form>
          )}

          {step === "team" && (
            <div>
              <div className="flex gap-1 mb-7 p-1 bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.1)] rounded-[3px]">
                <SubTabBtn
                  active={teamOption === "create"}
                  onClick={() => setTeamOption("create")}
                >
                  <Plus size={11} /> Create Team
                </SubTabBtn>
                <SubTabBtn
                  active={teamOption === "join"}
                  onClick={() => setTeamOption("join")}
                >
                  <KeyRound size={11} /> Join with Code
                </SubTabBtn>
              </div>

              {teamOption === "create" && (
                <form onSubmit={handleCreateTeam}>
                  <Field label="Team Name" required>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className={inp}
                      required
                    />
                  </Field>
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <PrimaryBtn type="submit" disabled={submitting}>
                      {submitting ? (
                        "Creating…"
                      ) : (
                        <>
                          <Users size={13} />
                          <span>Create Team</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </PrimaryBtn>
                  </div>
                </form>
              )}

              {teamOption === "join" && (
                <form onSubmit={handleJoinTeam}>
                  <div className="max-w-md mx-auto">
                    <Field label="Team Invite Code" required>
                      <input
                        type="text"
                        placeholder="Enter team code (e.g. ABC123XY)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className={inp}
                        required
                      />
                    </Field>
                  </div>
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <PrimaryBtn
                      type="submit"
                      disabled={submitting || !joinCode.trim()}
                    >
                      {submitting ? (
                        "Sending…"
                      ) : (
                        <>
                          <span>Request to Join</span>
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
            <div className="text-center py-6">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[rgba(255,184,77,0.1)] border border-[rgba(255,184,77,0.3)] flex items-center justify-center">
                <KeyRound size={24} className="text-[#ffb84d]" />
              </div>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.75rem] text-[rgba(220,240,220,0.85)] mb-1">
                Request sent{pendingTeam.name ? ` to "${pendingTeam.name}"` : ""}.
              </p>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.5)] mb-6">
                Waiting for the team leader to respond.
              </p>
              <div className="flex items-center justify-center gap-3">
                {pendingTeam.id && (
                  <button
                    onClick={handleCancelRequest}
                    disabled={cancelling}
                    className="font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-5 py-3 rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(255,100,100,0.3)] text-[rgba(255,140,140,0.85)] hover:bg-[rgba(255,60,60,0.08)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X size={13} /> {cancelling ? "Cancelling…" : "Cancel Request"}
                  </button>
                )}
                <PrimaryBtn onClick={() => navigate(`/hackathon/${slug}`)}>
                  Back to Hackathon <ChevronRight size={14} />
                </PrimaryBtn>
              </div>
            </div>
          )}

          {step === "done" && !pendingTeam && (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[rgba(95,255,96,0.1)] border border-[rgba(95,255,96,0.3)] flex items-center justify-center">
                <Check size={24} className="text-[#5fff60]" />
              </div>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.75rem] text-[rgba(220,240,220,0.85)] mb-6">
                {hackathon.participationType === "TEAM"
                  ? "You're registered and part of a team for this hackathon."
                  : "You're registered for this hackathon."}
              </p>
              <PrimaryBtn onClick={() => navigate(`/hackathon/${slug}`)}>
                Back to Hackathon <ChevronRight size={14} />
              </PrimaryBtn>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
