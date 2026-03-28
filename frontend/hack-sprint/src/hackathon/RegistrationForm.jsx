import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDashboard } from "../backendApis/api";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChevronRight,
  User,
  Users,
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react";
import { API } from "../backendApis/api";

const inp = [
  "font-[family-name:'JetBrains_Mono',monospace]",
  "w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)]",
  "rounded-[3px] px-3 py-2.5 text-[0.72rem] text-[#e8ffe8]",
  "placeholder-[rgba(95,255,96,0.28)]",
  "focus:outline-none focus:border-[rgba(95,255,96,0.45)]",
  "focus:shadow-[0_0_0_2px_rgba(95,255,96,0.07)]",
  "transition-all [color-scheme:dark]",
  "read-only:opacity-50 read-only:cursor-not-allowed",
].join(" ");

const sel =
  inp +
  " cursor-pointer appearance-none pr-8 bg-no-repeat bg-right bg-[length:1.1rem_1.1rem] bg-[url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'><path stroke='%235fff60' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/></svg>\")]";

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

const TabBtn = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`font-[family-name:'JetBrains_Mono',monospace] flex-1 inline-flex items-center justify-center gap-2
      text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer transition-all duration-150
      ${
        active
          ? "bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold"
          : "bg-transparent border-[rgba(95,255,96,0.18)] text-[rgba(95,255,96,0.55)] hover:bg-[rgba(95,255,96,0.07)] hover:text-[rgba(95,255,96,0.8)]"
      }`}
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

const TeamInfoModal = ({ details, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-md bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.22)] rounded-[4px] p-8 shadow-[0_0_40px_rgba(95,255,96,0.08)]">
        {/* corner brackets */}
        <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.55)]" />
        <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.55)]" />
        {/* top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.35)] to-transparent" />

        <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl tracking-tight mb-1">
          Team Created!
        </h2>
        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.55)] mb-6 leading-relaxed">
          Share the code or link below so teammates can join.
        </p>

        <div className="flex flex-col gap-4 mb-7">
          {[
            {
              label: "Invite Code",
              value: details.code,
              type: "code",
              copied: copiedCode,
              mono: true,
            },
            {
              label: "Invite Link",
              value: details.link,
              type: "link",
              copied: copiedLink,
              mono: false,
            },
          ].map(({ label, value, type, copied, mono }) => (
            <div key={type}>
              <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mb-1.5">
                {label}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex-1 bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2 text-[#5fff60] truncate ${
                    mono
                      ? "font-[family-name:'JetBrains_Mono',monospace] text-sm tracking-widest"
                      : "font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem]"
                  }`}
                >
                  {value}
                </div>
                <button
                  onClick={() => copy(value, type)}
                  className="w-9 h-9 flex items-center justify-center rounded-[3px] border border-[rgba(95,255,96,0.2)] bg-[rgba(95,255,96,0.06)] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.38)] transition-all cursor-pointer flex-shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={onClose} className="w-full">
          Proceed to Team Page <ChevronRight size={14} />
        </PrimaryBtn>
      </div>
    </div>
  );
};

export const RegistrationForm = ({ onSubmit = () => {} }) => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState("team");
  const [teamOption, setTeamOption] = useState("create");
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [teamDetails, setTeamDetails] = useState({
    code: "",
    link: "",
    id: "",
  });

  const [indForm, setIndForm] = useState({
    fullName: "",
    email: "",
    city: "",
    state: "",
    contactNumber: "",
    experience: "",
    workEmail: "",
    gender: "",
  });
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    teamLead: "",
    teamLeadEmail: "",
    contactNumber: "",
    experience: "",
    workEmail: "",
    city: "",
    state: "",
    gender: "",
  });
  const [joinForm, setJoinForm] = useState({ code: "", link: "" });

  useEffect(() => {
    getDashboard()
      .then((res) => {
        const u = res.data.userData;
        setUserData(u);
        if (u) {
          setIndForm((p) => ({
            ...p,
            fullName: u.name || "",
            email: u.email || "",
          }));
          setTeamForm((p) => ({
            ...p,
            teamLead: u.name || "",
            teamLeadEmail: u.email || "",
          }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chg = (e, setter) => {
    const { name, value } = e.target;
    setter((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === "individual") {
        const r = await API.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/register/${hackathonId}`,
          {
            userId: userData?._id,
            name: indForm.fullName,
            contactNumber: indForm.contactNumber,
            email: indForm.email,
            city: indForm.city,
            state: indForm.state,
            yearsOfExperience: indForm.experience,
            workEmailAddress: indForm.workEmail,
            gender: indForm.gender,
          }
        );
        toast.success(r.data.message || "Registration successful!");
        onSubmit(indForm);
        navigate(`/hackathon/${hackathonId}`);
      } else if (type === "team-create") {
        const r = await API.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/team/create`,
          {
            name: teamForm.teamName,
            leader: userData?._id,
            leaderName: teamForm.teamLead,
            leaderEmail: teamForm.teamLeadEmail,
            hackathon: hackathonId,
            contactNumber: teamForm.contactNumber,
            workEmailAddress: teamForm.workEmail,
            yearsOfExperience: teamForm.experience,
            city: teamForm.city,
            state: teamForm.state,
            gender: teamForm.gender,
          }
        );
        if (r.data?.team) {
          toast.success(r.data.message || "Team created!");
          onSubmit(teamForm);
          setTeamDetails({
            code: r.data.secretCode,
            link: r.data.team.secretLink,
            id: r.data.team._id,
          });
          setShowTeamInfo(true);
        } else {
          toast.error(r.data.message || "Team creation failed");
        }
      } else if (type === "team-join") {
        let code = joinForm.code;
        if (!code && joinForm.link) {
          const m = joinForm.link.match(/\/join\/([^\/\?]+)/);
          if (m) code = m[1];
        }
        const r = await API.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/team/join`,
          { userId: userData?._id, code, hackathon: hackathonId }
        );
        toast.success(r.data.message || "Joined team!");
        onSubmit(joinForm);
        navigate(`/hackathon/${hackathonId}`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const expOpts = [
    ["0-1", "0–1 Years"],
    ["1-3", "1–3 Years"],
    ["3-5", "3–5 Years"],
    ["5+", "5+ Years"],
  ];

  const genOpts = [
    ["male", "Male"],
    ["female", "Female"],
    ["other", "Other"],
  ];

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
              navigate(`/hackathon/${hackathonId}/team/${teamDetails.code}`, {
                state: { secretCode: teamDetails.code },
              });
            }}
          />
        )}

        {/* card */}
        <div className="relative z-10 w-full max-w-3xl bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] px-6 sm:px-10 py-9 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />

          {/* heading */}
          <div className="text-center mb-7 pb-6 border-b border-[rgba(95,255,96,0.08)]">
            <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.45)] mb-2">
              HackSprint
            </div>
            <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-2xl sm:text-3xl md:text-4xl tracking-tight">
              Hackathon Registration
            </h1>
          </div>

          {/* Individual / Team tabs */}
          <div className="flex gap-2 mb-7">
            <TabBtn
              active={formType === "individual"}
              onClick={() => setFormType("individual")}
            >
              <User size={12} /> Individual
            </TabBtn>
            <TabBtn
              active={formType === "team"}
              onClick={() => setFormType("team")}
            >
              <Users size={12} /> Team
            </TabBtn>
          </div>

          {/* ── INDIVIDUAL ── */}
          {formType === "individual" && (
            <form onSubmit={(e) => handleSubmit(e, "individual")}>
              <div className="grid sm:grid-cols-2 gap-x-6">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    name="fullName"
                    value={indForm.fullName}
                    onChange={(e) => chg(e, setIndForm)}
                    className={inp}
                    required
                    readOnly={!!userData?.name}
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    name="email"
                    value={indForm.email}
                    onChange={(e) => chg(e, setIndForm)}
                    className={inp}
                    required
                    readOnly={!!userData?.email}
                  />
                </Field>
                <Field label="City" required>
                  <input
                    type="text"
                    name="city"
                    value={indForm.city}
                    onChange={(e) => chg(e, setIndForm)}
                    className={inp}
                    required
                  />
                </Field>
                <Field label="State" required>
                  <input
                    type="text"
                    name="state"
                    value={indForm.state}
                    onChange={(e) => chg(e, setIndForm)}
                    className={inp}
                    required
                  />
                </Field>
                <Field label="Contact Number" required>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={indForm.contactNumber}
                    onChange={(e) => chg(e, setIndForm)}
                    className={inp}
                    required
                  />
                </Field>
                <Field label="Gender" required>
                  <select
                    name="gender"
                    value={indForm.gender}
                    onChange={(e) => chg(e, setIndForm)}
                    className={sel}
                    required
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    {genOpts.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Years of Experience" required>
                  <select
                    name="experience"
                    value={indForm.experience}
                    onChange={(e) => chg(e, setIndForm)}
                    className={sel}
                    required
                  >
                    <option value="" disabled>
                      Select experience
                    </option>
                    {expOpts.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Work Email (Optional)">
                  <input
                    type="email"
                    name="workEmail"
                    value={indForm.workEmail}
                    onChange={(e) => chg(e, setIndForm)}
                    className={inp}
                  />
                </Field>
              </div>
              <div className="mt-6 flex justify-center sm:justify-end">
                <PrimaryBtn type="submit" disabled={loading}>
                  {loading ? (
                    "Submitting…"
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </form>
          )}

          {/* ── TEAM ── */}
          {formType === "team" && (
            <div>
              {/* create / join sub-tabs */}
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
                  <LinkIcon size={11} /> Join with Code
                </SubTabBtn>
              </div>

              {/* create form */}
              {teamOption === "create" && (
                <form onSubmit={(e) => handleSubmit(e, "team-create")}>
                  <div className="grid sm:grid-cols-2 gap-x-6">
                    <Field label="Team Name" required>
                      <input
                        type="text"
                        name="teamName"
                        value={teamForm.teamName}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                        required
                      />
                    </Field>
                    <Field label="Team Lead Name" required>
                      <input
                        type="text"
                        name="teamLead"
                        value={teamForm.teamLead}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                        required
                        readOnly={!!userData?.name}
                      />
                    </Field>
                    <Field label="Team Lead Email" required>
                      <input
                        type="email"
                        name="teamLeadEmail"
                        value={teamForm.teamLeadEmail}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                        required
                        readOnly={!!userData?.email}
                      />
                    </Field>
                    <Field label="Contact Number" required>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={teamForm.contactNumber}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                        required
                      />
                    </Field>
                    <Field label="Gender" required>
                      <select
                        name="gender"
                        value={teamForm.gender}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={sel}
                        required
                      >
                        <option value="" disabled>
                          Select gender
                        </option>
                        {genOpts.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="City" required>
                      <input
                        type="text"
                        name="city"
                        value={teamForm.city}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                        required
                      />
                    </Field>
                    <Field label="State" required>
                      <input
                        type="text"
                        name="state"
                        value={teamForm.state}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                        required
                      />
                    </Field>
                    <Field label="Years of Experience" required>
                      <select
                        name="experience"
                        value={teamForm.experience}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={sel}
                        required
                      >
                        <option value="" disabled>
                          Select experience
                        </option>
                        {expOpts.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Work Email (Optional)">
                      <input
                        type="email"
                        name="workEmail"
                        value={teamForm.workEmail}
                        onChange={(e) => chg(e, setTeamForm)}
                        className={inp}
                      />
                    </Field>
                  </div>
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <PrimaryBtn type="submit" disabled={loading}>
                      {loading ? (
                        "Creating…"
                      ) : (
                        <>
                          <span>Create Team & Register</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </PrimaryBtn>
                  </div>
                </form>
              )}

              {/* join form */}
              {teamOption === "join" && (
                <form onSubmit={(e) => handleSubmit(e, "team-join")}>
                  <div className="max-w-md mx-auto">
                    <Field label="Team Invite Code">
                      <input
                        type="text"
                        name="code"
                        placeholder="Enter team code (e.g. ABC123XY)"
                        value={joinForm.code}
                        onChange={(e) => chg(e, setJoinForm)}
                        className={inp}
                      />
                    </Field>
                    <div className="flex items-center gap-3 my-2 mb-5">
                      <div className="flex-1 h-px bg-[rgba(95,255,96,0.1)]" />
                      <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.3)]">
                        or
                      </span>
                      <div className="flex-1 h-px bg-[rgba(95,255,96,0.1)]" />
                    </div>
                    <Field label="Team Invite Link">
                      <input
                        type="url"
                        name="link"
                        placeholder="Paste team invite link"
                        value={joinForm.link}
                        onChange={(e) => chg(e, setJoinForm)}
                        className={inp}
                      />
                    </Field>
                  </div>
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <PrimaryBtn
                      type="submit"
                      disabled={loading || (!joinForm.code && !joinForm.link)}
                    >
                      {loading ? (
                        "Joining…"
                      ) : (
                        <>
                          <span>Join Team & Register</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </PrimaryBtn>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
