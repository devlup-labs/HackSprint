import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  AlertTriangle,
  Star,
  GitFork,
  FileText,
  Image,
  Video,
  Save,
} from "lucide-react";
import {
  getAdminDetails,
  getAdminHackathonDetail,
  updateSubmissionPoints,
} from "../backendApis/api";
import { toast } from "react-toastify";

/* ── Fonts + pseudo-element helpers (can't do in Tailwind) ── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
    .font-jb   { font-family: 'JetBrains Mono', monospace; }
    .font-syne { font-family: 'Syne', sans-serif; }

    /* grid bg */
    .usd-bg::before {
      content:''; position:absolute; inset:0;
      background-image:
        linear-gradient(rgba(95,255,96,.033) 1px, transparent 1px),
        linear-gradient(90deg, rgba(95,255,96,.033) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .usd-bg::after {
      content:''; position:absolute;
      width:600px; height:600px;
      background: radial-gradient(circle, rgba(95,255,96,.05) 0%, transparent 65%);
      top:8%; left:50%; transform:translateX(-50%);
    }

    /* corner bracket cards */
    .usd-card::before, .usd-card::after {
      content:''; position:absolute;
      width:9px; height:9px; border-style:solid;
      border-color: rgba(95,255,96,.45);
    }
    .usd-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
    .usd-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

    /* red card corners (not-found) */
    .usd-card-red::before, .usd-card-red::after {
      content:''; position:absolute;
      width:9px; height:9px; border-style:solid;
      border-color: rgba(255,60,60,.5);
    }
    .usd-card-red::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
    .usd-card-red::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

    @keyframes usd-spin { to { transform:rotate(360deg); } }
    .usd-spin { animation: usd-spin .7s linear infinite; }
  `}</style>
);

/* ── Background ── */
const GridBackground = () => (
  <div className="usd-bg fixed inset-0 z-0 pointer-events-none" />
);

/* ── Shared section card ── */
const Card = ({ children, className = "" }) => (
  <div
    className={`usd-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] backdrop-blur-[14px] shadow-[0_0_28px_rgba(95,255,96,0.04)] p-6 sm:p-8 ${className}`}
  >
    {children}
  </div>
);

/* ── Section title ── */
const SectionTitle = ({ children }) => (
  <div className="font-syne text-[1.1rem] font-extrabold text-white tracking-tight mb-[1.25rem] flex items-center gap-[0.5rem]">
    {children}
  </div>
);

/* ── Link row (repo / doc) ── */
const LinkRow = ({ href, icon: Icon, title, subtitle }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-jb flex items-center gap-[0.85rem] p-[0.85rem_1rem] bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.1)] rounded-[3px] hover:bg-[rgba(95,255,96,0.08)] hover:border-[rgba(95,255,96,0.25)] transition-all duration-150 group"
  >
    <Icon size={18} className="text-[#5fff60] flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-[0.75rem] text-[#e8ffe8] font-semibold tracking-[0.02em] mb-[0.1rem]">
        {title}
      </p>
      <p className="text-[0.62rem] text-[rgba(180,220,180,0.48)] break-all">
        {subtitle}
      </p>
    </div>
    <ExternalLink
      size={12}
      className="text-[rgba(95,255,96,0.3)] group-hover:text-[#5fff60] flex-shrink-0 transition-colors"
    />
  </a>
);

/* ── Sub-section label ── */
const SubLabel = ({ icon: Icon, children }) => (
  <div className="font-jb flex items-center gap-[0.4rem] text-[0.6rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.55)] mb-[0.75rem]">
    <Icon size={12} />
    {children}
  </div>
);

const UserSubmissionDetailPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submitter, setSubmitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [points, setPoints] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await getAdminDetails();
        setAdminData(response.data.admin);
      } catch {
        navigate("/adminlogin");
      }
    };
    fetchAdminData();
  }, [navigate]);

  useEffect(() => {
    if (adminData && slug && id) {
      const fetchData = async () => {
        try {
          const response = await getAdminHackathonDetail({
            adminId: adminData.id,
            hackathonId: slug,
          });
          const { hackathon, participantsWithoutTeam, teams } = response.data;
          setHackathon(hackathon);

          let foundTeam = teams.find((t) => t._id.toString() === id);
          if (foundTeam && foundTeam.submission) {
            setSubmitter(foundTeam);
            setSubmission(foundTeam.submission);
            setPoints(foundTeam.submission.hackathonPoints || 0);
          } else {
            let participant = participantsWithoutTeam.find(
              (p) => p.user._id.toString() === id
            );
            if (participant && participant.submission) {
              setSubmitter(participant.user);
              setSubmission(participant.submission);
              setPoints(participant.submission.hackathonPoints || 0);
            }
          }
        } catch (error) {
          // console.error("Failed to fetch submission details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [adminData, slug, id]);

  const handlePointsUpdate = async (e) => {
    e.preventDefault();
    if (!adminData || !submission) return;
    setIsUpdating(true);
    try {
      const response = await updateSubmissionPoints({
        adminId: adminData.id,
        submissionId: submission._id,
        points: Number(points),
      });
      if (response.data.success) {
        setSubmission(response.data.submission);
        toast.success("Points updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update points.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <FontStyle />
        <div className="font-jb relative min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-[0.75rem]">
          <GridBackground />
          <div className="usd-spin relative z-10 w-7 h-7 border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] rounded-full" />
          <p className="relative z-10 text-[0.68rem] text-[rgba(180,220,180,0.48)] tracking-[0.1em] uppercase">
            Loading submission…
          </p>
        </div>
      </>
    );
  }

  /* ── Not found ── */
  if (!hackathon || !submitter || !submission) {
    return (
      <>
        <FontStyle />
        <div className="font-jb relative min-h-screen bg-[#0a0a0a] text-[#e8ffe8] flex items-center justify-center p-4">
          <GridBackground />
          <div className="usd-card-red relative z-10 bg-[rgba(10,12,10,0.92)] border border-[rgba(255,60,60,0.3)] rounded-[4px] p-8 text-center max-w-md w-full">
            <AlertTriangle className="mx-auto mb-4 text-[#ff6060]" size={40} />
            <h1 className="font-syne text-[1.6rem] font-extrabold text-[#ff9090] tracking-tight mb-[0.5rem]">
              Submission Not Found
            </h1>
            <p className="font-jb text-[0.68rem] text-[rgba(180,220,180,0.48)] leading-relaxed mb-[1.5rem]">
              The participant has not submitted or the submission could not be
              found.
            </p>
            <Link
              to={`/hackathon/${slug}/usersubmissions`}
              className="font-jb inline-flex items-center gap-[0.4rem] text-[0.65rem] tracking-[0.1em] uppercase px-[1rem] py-[0.5rem] rounded-[3px] border bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.25)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.15)] transition-all"
            >
              <ArrowLeft size={13} /> Return to Participants List
            </Link>
          </div>
        </div>
      </>
    );
  }

  const formattedDate = new Date(submission.submittedAt).toLocaleString(
    "en-US",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  );

  return (
    <>
      <FontStyle />
      <div className="font-jb relative min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-x-hidden">
        <GridBackground />

        <div className="relative z-10 max-w-[860px] mx-auto px-5 py-[clamp(1.5rem,4vw,3rem)]">
          {/* ── Header ── */}
          <header className="mb-[2.5rem]">
            <Link
              to={`/admin/${slug}/usersubmissions`}
              className="font-jb inline-flex items-center gap-[0.4rem] text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.5)] hover:text-[#5fff60] transition-colors mb-[1.5rem] group"
            >
              <ArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-[3px]"
              />
              Back to Participants List
            </Link>

            {/* main title */}
            <h1 className="font-syne text-[clamp(1.8rem,5vw,3rem)] font-extrabold text-[#5fff60] tracking-tight leading-[1.05] mb-[0.75rem]">
              Submission by <span className="text-white">{submitter.name}</span>
            </h1>

            <div className="flex flex-col gap-[0.2rem]">
              {submitter.email && (
                <p className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.8)] tracking-[0.04em]">
                  {submitter.email}
                </p>
              )}
              {!submitter.email && (
                <p className="font-jb text-[0.7rem] text-[rgba(180,220,180,0.8)] tracking-[0.04em]">
                  Team Submission
                </p>
              )}
              <p className="font-jb text-[0.62rem] text-[rgba(120,160,120,0.8)] tracking-[0.06em] uppercase">
                Submitted on {formattedDate}
              </p>
            </div>
          </header>

          {/* ── Content ── */}
          <main className="flex flex-col gap-[1.25rem]">
            {/* Project Links */}
            <Card>
              <SectionTitle>
                <Github size={16} className="text-[#5fff60]" /> Project Links
              </SectionTitle>
              <div className="flex flex-col gap-[0.6rem]">
                {submission.repoUrl?.length > 0 &&
                  submission.repoUrl.map((url, index) => (
                    <LinkRow
                      key={index}
                      href={url}
                      icon={Github}
                      title={`GitHub Repository${
                        submission.repoUrl.length > 1 ? ` ${index + 1}` : ""
                      }`}
                      subtitle={url}
                    />
                  ))}
                {submission.docs?.length > 0 && (
                  <LinkRow
                    href={submission.docs[0]}
                    icon={FileText}
                    title="Documentation"
                    subtitle={submission.docs[0]}
                  />
                )}
                {!submission.repoUrl?.length && !submission.docs?.length && (
                  <p className="font-jb text-[0.65rem] text-[rgba(180,220,180,0.35)] italic">
                    No links provided.
                  </p>
                )}
              </div>
            </Card>

            {/* Project Media */}
            {(submission.images?.length > 0 ||
              submission.videos?.length > 0) && (
              <Card>
                <SectionTitle>Project Media</SectionTitle>

                {submission.images?.length > 0 && (
                  <div className="mb-[1.25rem]">
                    <SubLabel icon={Image}>Images</SubLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-[0.75rem]">
                      {submission.images.map((imageUrl, index) => (
                        <a
                          key={index}
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-[3px] overflow-hidden border border-[rgba(95,255,96,0.1)] hover:border-[rgba(95,255,96,0.3)] transition-all"
                        >
                          <img
                            src={imageUrl}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full object-cover aspect-video hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {submission.videos?.length > 0 && (
                  <div>
                    <SubLabel icon={Video}>Videos</SubLabel>
                    <div className="flex flex-col gap-[0.4rem]">
                      {submission.videos.map((videoUrl, index) => (
                        <a
                          key={index}
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-jb flex items-center gap-[0.4rem] text-[0.65rem] text-[#5fff60] hover:underline break-all"
                        >
                          <ExternalLink
                            size={11}
                            className="flex-shrink-0 opacity-60"
                          />
                          {videoUrl}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Admin Evaluation */}
            <Card>
              <SectionTitle>
                <Star size={15} className="text-[#ffb84d]" />
                Admin Evaluation
              </SectionTitle>

              <form
                onSubmit={handlePointsUpdate}
                className="flex flex-col gap-[1rem]"
              >
                <div>
                  <label
                    htmlFor="points"
                    className="font-jb block text-[0.58rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.55)] mb-[0.5rem]"
                  >
                    Award Points
                  </label>

                  {/* big centered points input */}
                  <div className="relative">
                    <input
                      type="number"
                      id="points"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      min="0"
                      className="font-syne w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] p-[0.85rem] text-[#5fff60] text-[2.5rem] font-extrabold text-center tracking-tight focus:outline-none focus:border-[rgba(95,255,96,0.45)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.07)] transition-all [color-scheme:dark]"
                    />
                    <span className="font-jb absolute right-[1rem] bottom-[0.85rem] text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.35)]">
                      pts
                    </span>
                  </div>

                  {/* current saved points */}
                  <p className="font-jb text-[0.6rem] text-[rgba(180,220,180,0.35)] tracking-[0.06em] mt-[0.4rem]">
                    Currently saved:{" "}
                    <span className="text-[rgba(95,255,96,0.55)]">
                      {submission.hackathonPoints ?? 0} pts
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="font-jb w-full flex items-center justify-center gap-[0.45rem] text-[0.65rem] tracking-[0.1em] uppercase py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-150
                    bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
                    hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]
                    disabled:bg-[rgba(95,255,96,0.2)] disabled:border-[rgba(95,255,96,0.2)] disabled:text-[rgba(95,255,96,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isUpdating ? (
                    <>
                      <div className="usd-spin w-[13px] h-[13px] border-2 border-[rgba(5,9,5,0.25)] border-t-[#050905] rounded-full" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={13} /> Save Points
                    </>
                  )}
                </button>
              </form>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
};

export default UserSubmissionDetailPage;
