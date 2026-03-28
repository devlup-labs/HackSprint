import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Code, Clock, Users, Calendar, ExternalLink } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { getDashboard } from "../backendApis/api";
import { API } from "../backendApis/api";

/* ── font ── */
const FontStyle = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
);

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

/* ── stat card ── */
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="relative bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.12)] rounded-[3px] p-4">
    <Icon size={13} className="text-[rgba(95,255,96,0.55)] mb-2" />
    <div
      className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(180,220,180,0.45)] mb-0.5`}
    >
      {label}
    </div>
    <div className={`${syne} font-extrabold text-white text-sm tracking-tight`}>
      {value}
    </div>
  </div>
);

/* ── link row ── */
const LinkRow = ({ href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={`${mono} inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(95,255,96,0.65)] hover:text-[#5fff60] transition-colors break-all`}
  >
    <ExternalLink size={11} className="flex-shrink-0" />
    {label}
  </a>
);

/* ══════════════════════════ SubmissionForms ══════════════════════════ */
const SubmissionForms = ({ isOpen, onClose, hackathonId }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [hackathon, setHackathon] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamId, setTeamId] = useState(null);

  /* ── fetch hackathon ── */
  useEffect(() => {
    if (!hackathonId || !isOpen) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hackathons/${hackathonId}`)
      .then((r) => r.json())
      .then(setHackathon)
      .catch(console.log("Error"));
  }, [hackathonId, isOpen]);

  /* ── fetch user + team ── */
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await getDashboard();
        const u = res.data.userData;
        setUserData(u);
        setIsLeader(
          u.leaderOfHackathons?.some(
            (id) => String(id) === String(hackathonId)
          ) || false
        );
        if (u.team) {
          setTeamId(u.team);
          const tr = await API.get(`/api/team/${u.team}`);
          const team = tr.data.team;
          if (
            team?.hackathon?._id &&
            String(team.hackathon._id) === String(hackathonId)
          )
            setIsTeamMember(
              team.members?.some((m) => String(m._id) === String(u._id)) ||
                false
            );
          else setIsTeamMember(false);
        } else setIsTeamMember(false);
      } catch {
        setUserData(null);
        setIsLeader(false);
        setIsTeamMember(false);
      }
    })();
  }, [hackathonId, isOpen]);

  /* ── fetch submission status ── */
  useEffect(() => {
    if (!hackathonId || !userData) return;

    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const p = new URLSearchParams({
          hackathonId,
          teamId: userData.team || "",
          userId: userData._id,
        });

        const res = await API.get(`/api/submit/status?${p}`);
        if (isMounted) setSubmissionStatus(res.data);
      } catch (err) {
        // console.error(err);
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [hackathonId, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLeader && isTeamMember) {
      toast.error("Only team leaders can submit!");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("repoUrl", repoUrl);
      fd.append("hackathonId", hackathonId);
      fd.append("userId", userData._id);
      if (teamId) fd.append("teamId", teamId);
      await API.post(`/api/submit`, fd);
      toast.success("Submission successful!");
      setRepoUrl("");
      onClose();
    } catch {
      toast.error("Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !hackathon || !userData) return null;

  const daysLeft = Math.ceil(
    (new Date(hackathon.endDate) - new Date()) / 86400000
  );
  const totalPrize =
    hackathon.rewards?.length > 0
      ? hackathon.rewards.reduce((s, r) => s + (r.amount || 0), 0)
      : (hackathon.prizeMoney1 || 0) +
        (hackathon.prizeMoney2 || 0) +
        (hackathon.prizeMoney3 || 0);
  const sub = submissionStatus?.submission;

  return createPortal(
    <>
      <FontStyle />
      <ToastContainer />
      <div
        className={`${mono} fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto`}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-xl bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* corner brackets */}
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.55)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.55)]" />
          {/* top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.3)] to-transparent" />

          {/* header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <h2
                className={`${syne} font-extrabold text-white text-xl tracking-tight leading-tight`}
              >
                {hackathon.title}
              </h2>
              {hackathon.subTitle && (
                <p
                  className={`${mono} text-[0.65rem] text-[rgba(180,220,180,0.55)] mt-0.5 tracking-[0.03em]`}
                >
                  {hackathon.subTitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.45)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] transition-all cursor-pointer flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <StatCard
              icon={Code}
              label="Prize Pool"
              value={`₹${totalPrize.toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={Clock}
              label="Days Left"
              value={`${daysLeft} Days`}
            />
            <StatCard
              icon={Users}
              label="Participants"
              value={hackathon.numParticipants || 0}
            />
            <StatCard
              icon={Calendar}
              label="Difficulty"
              value={hackathon.difficulty}
            />
          </div>

          {/* description */}
          <p
            className={`${mono} text-[0.68rem] text-[rgba(180,220,180,0.6)] leading-relaxed mb-6`}
          >
            {hackathon.description}
          </p>

          {/* already submitted */}
          {submissionStatus?.submitted ? (
            <div className="relative bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.2)] rounded-[3px] p-5 flex flex-col gap-3">
              <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
              <p
                className={`${syne} font-extrabold text-[#5fff60] text-sm tracking-tight`}
              >
                Already Submitted!
              </p>

              {sub?.repoUrl && (
                <div>
                  <div
                    className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.4)] mb-1`}
                  >
                    Repo URL
                  </div>
                  <LinkRow href={sub.repoUrl} label={sub.repoUrl} />
                </div>
              )}
              {sub?.docs?.length > 0 && (
                <div>
                  <div
                    className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.4)] mb-1.5`}
                  >
                    Documents
                  </div>
                  <div className="flex flex-col gap-1">
                    {sub.docs.map((d) => (
                      <div key={d._id} className="flex items-center gap-2">
                        <LinkRow
                          href={d.url}
                          label={d.original_filename || "Document"}
                        />
                        <span
                          className={`${mono} text-[0.52rem] text-[rgba(180,220,180,0.3)]`}
                        >
                          ({(d.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sub?.videos?.length > 0 && (
                <div>
                  <div
                    className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.4)] mb-1.5`}
                  >
                    Videos
                  </div>
                  <div className="flex flex-col gap-1">
                    {sub.videos.map((v) => (
                      <LinkRow
                        key={v._id}
                        href={v.url}
                        label={v.original_filename || "Video"}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* submission form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  className={`${mono} block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.5)] mb-1.5`}
                >
                  Submission URL <span className="text-[#ff9090]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your submission URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  required
                  className={`${mono} w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2.5 text-[0.7rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.25)] focus:outline-none focus:border-[rgba(95,255,96,0.42)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.06)] transition-all`}
                />
              </div>

              {!isLeader && isTeamMember && (
                <p
                  className={`${mono} text-[0.6rem] text-[rgba(255,184,77,0.7)] tracking-[0.04em]`}
                >
                  ⚠ Only team leaders can submit.
                </p>
              )}

              <button
                type="submit"
                disabled={loading || (!isLeader && isTeamMember)}
                className={`${mono} w-full inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] border cursor-pointer transition-all duration-150
                  bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
                  hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {loading ? "Submitting…" : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default SubmissionForms;
