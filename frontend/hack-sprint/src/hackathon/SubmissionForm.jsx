import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  X, Clock, Calendar, Users, Code,
  FileVideo, FileText, Plus, ExternalLink,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { getDashboard } from "../backendApis/api";
import { API } from "../backendApis/api";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const inp = `${mono} w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2.5 text-[0.7rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.25)] focus:outline-none focus:border-[rgba(95,255,96,0.42)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.06)] transition-all`;

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="relative bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.12)] rounded-[3px] p-4">
    <Icon size={13} className="text-[rgba(95,255,96,0.55)] mb-2" />
    <div className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(180,220,180,0.45)] mb-0.5`}>
      {label}
    </div>
    <div className={`${syne} font-extrabold text-white text-sm tracking-tight break-words`}>
      {value}
    </div>
  </div>
);

const FieldLabel = ({ children, required }) => (
  <div className={`${mono} text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.5)] mb-1.5`}>
    {children}
    {required && <span className="text-[#ff9090] ml-1">*</span>}
  </div>
);

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

const RemoveBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-[2px] bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.25)] text-[rgba(255,100,100,0.7)] hover:bg-[rgba(255,60,60,0.2)] hover:text-[#ff9090] transition-all cursor-pointer"
  >
    <X size={11} />
  </button>
);

const DropZone = ({ label, icon: Icon, accept, file, onFileChange, onRemove, preview }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-[rgba(95,255,96,0.2)] rounded-[3px] cursor-pointer hover:border-[rgba(95,255,96,0.38)] hover:bg-[rgba(95,255,96,0.03)] transition-all">
        <input type="file" accept={accept} onChange={onFileChange} className="hidden" />
        {file ? (
          <div className="flex flex-col items-center gap-1.5">
            {preview}
            <span className={`${mono} text-[0.62rem] text-[rgba(180,220,180,0.6)] truncate max-w-[200px]`}>
              {file.name}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-[rgba(95,255,96,0.3)]">
            <Icon size={22} />
            <span className={`${mono} text-[0.58rem] tracking-[0.04em]`}>
              Click to upload or drag and drop
            </span>
          </div>
        )}
      </label>
      {file && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-[2px] bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.25)] text-[rgba(255,100,100,0.7)] hover:bg-[rgba(255,60,60,0.2)] hover:text-[#ff9090] transition-all cursor-pointer"
        >
          <X size={11} />
        </button>
      )}
    </div>
  </div>
);

const PrimaryBtn = ({ children, disabled, type = "submit", color = "green" }) => {
  const c =
    color === "amber"
      ? "bg-[#ffb84d] border-[#ffb84d] hover:bg-[#ffc96e] hover:shadow-[0_0_18px_rgba(255,184,77,0.3)]"
      : color === "gray"
      ? "bg-[rgba(95,255,96,0.04)] border-[rgba(95,255,96,0.1)] text-[rgba(95,255,96,0.25)] cursor-not-allowed"
      : "bg-[#5fff60] border-[#5fff60] hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]";
  const textColor = color === "gray" ? "" : "text-[#050905]";
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${mono} w-full inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] border cursor-pointer transition-all duration-150 font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${c} ${textColor}`}
    >
      {children}
    </button>
  );
};


const SubmissionForm = ({ isOpen, onClose }) => {
  const { id: hackathonId } = useParams();

  const [repoUrls,       setRepoUrls]       = useState([""]);
  const [loading,        setLoading]         = useState(false);
  const [hackathon,      setHackathon]       = useState(null);
  const [videoFile,      setVideoFile]       = useState(null);
  const [pdfFile,        setPdfFile]         = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [userData,       setUserData]        = useState(null);
  const [isLeader,       setIsLeader]        = useState(false);
  const [isTeamMember,   setIsTeamMember]    = useState(false);
  const [teamId,         setTeamId]          = useState(null);
  const [existingDocs,   setExistingDocs]   = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (!hackathonId || !isOpen) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hackathons/${hackathonId}`)
      .then((r) => r.json())
      .then(setHackathon)
      .catch(() => setHackathon(null));
  }, [hackathonId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await getDashboard();
        const u = res.data.userData;
        setUserData(u);

        const currentTeamObj = u.teams?.find(
          (t) => String(t.hackathon) === String(hackathonId)
        );

        if (currentTeamObj?.team) {
          setTeamId(currentTeamObj.team);
          const tr   = await API.get(`/api/team/${currentTeamObj.team}`);
          const team = tr.data.team;
          setIsLeader(String(team.leader) === String(u._id));
          setIsTeamMember(
            team.members?.some((m) => String(m._id) === String(u._id)) || false
          );
        } else {
          setIsLeader(
            u.leaderOfHackathons?.some((id) => String(id) === String(hackathonId)) || false
          );
          setIsTeamMember(false);
          setTeamId(null);
        }
      } catch {
        setUserData(null);
        setIsLeader(false);
        setIsTeamMember(false);
      }
    })();
  }, [hackathonId, isOpen]);

  useEffect(() => {
    if (!hackathonId || !userData) return;
    (async () => {
      try {
        const currentTeamObj = userData.teams?.find(
          (t) => String(t.hackathon) === String(hackathonId)
        );
        const p = new URLSearchParams({
          hackathonId,
          teamId: currentTeamObj?.team || "",
          userId: userData._id,
        });
        const res = await API.get(`/api/submit/status?${p}`);
        setSubmissionStatus(res.data);
      } catch {
      }
    })();
  }, [hackathonId, userData]);

  useEffect(() => {
    if (!isOpen) return;
    if (submissionStatus?.submitted) {
      const sub = submissionStatus.submission;
      // repo URLs
      const urls = Array.isArray(sub.repoUrl)
        ? sub.repoUrl
        : sub.repoUrl ? [sub.repoUrl] : [];
      setRepoUrls(urls.length ? urls : [""]);
      // existing files — shown with remove buttons
      setExistingDocs(sub.docs     || []);
      setExistingVideos(sub.videos || []);
      setExistingImages(sub.images || []);
    } else {
      setRepoUrls([""]);
      setExistingDocs([]);
      setExistingVideos([]);
      setExistingImages([]);
    }
  }, [submissionStatus, isOpen]);

  useEffect(
    () => () => { if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl); },
    [videoPreviewUrl]
  );

  const handleVideoChange = (e) => {
    const f = e.target.files[0];
    if (f) { setVideoFile(f); setVideoPreviewUrl(URL.createObjectURL(f)); }
  };
  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };
  const removePdf = () => setPdfFile(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLeader && isTeamMember) {
      toast.error("Only team leaders can submit!");
      return;
    }

    const valid = repoUrls.filter((u) => u.trim());
    // if (!valid.length) {
    //   toast.error("Please provide at least one valid URL.");
    //   return;
    // }

    setLoading(true);
    try {
      const fd = new FormData();
      if (valid.length > 0) {
        fd.append("repoUrl", JSON.stringify(valid));
      }
      fd.append("hackathonId",    hackathonId);
      fd.append("userId",         userData._id);
      fd.append("existingDocs",   JSON.stringify(existingDocs));
      fd.append("existingVideos", JSON.stringify(existingVideos));
      fd.append("existingImages", JSON.stringify(existingImages));

      if (teamId)    fd.append("teamId", teamId);
      if (videoFile) fd.append("videos", videoFile);
      if (pdfFile)   fd.append("docs",   pdfFile);

      const isUpdating = submissionStatus?.submitted;
      const res = isUpdating
        ? await API.put(`/api/submit/${submissionStatus.submission._id}`, fd)
        : await API.post(`/api/submit`, fd);

      toast.success(res.data.message || "Submission successful!", { autoClose: 1000 });
      setTimeout(() => {
        setRepoUrls([""]);
        setVideoFile(null);
        setPdfFile(null);
        onClose();
      }, 1200);
    } catch (err) {
      if (err.response?.status === 429)
        toast.error("Too many requests. Please try again later.");
      else
        toast.error(err.response?.data?.message || err.message || "Submission failed.");
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
  const isDeadlineOver =
    hackathon.submissionEndDate && new Date() > new Date(hackathon.submissionEndDate);

  const already = submissionStatus?.submitted;
  const sub     = submissionStatus?.submission;

  return createPortal(
    <>
      <ToastContainer toastClassName="!z-[100000]" style={{ zIndex: 100000 }} />
      <div
        className={`${mono} fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto`}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh] [scrollbar-width:thin] [scrollbar-color:rgba(95,255,96,0.2)_transparent]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.55)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.55)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.3)] to-transparent" />

          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <h2 className={`${syne} font-extrabold text-white text-xl tracking-tight`}>
                {hackathon.title}
              </h2>
              {hackathon.subTitle && (
                <p className={`${mono} text-[0.65rem] text-[rgba(180,220,180,0.55)] mt-0.5`}>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
            <StatCard icon={Code}     label="Prize Pool"    value={`₹${totalPrize.toLocaleString("en-IN")}`} />
            <StatCard icon={Clock}    label="Days Left"     value={`${daysLeft} Days`} />
            <StatCard icon={Users}    label="Participants"  value={hackathon.numParticipants || 0} />
            {/* <StatCard icon={Calendar} label="Difficulty"    value={hackathon.difficulty} /> */}
          </div>

          <p className={`${mono} text-[0.68rem] text-[rgba(180,220,180,0.6)] leading-relaxed mb-5`}>
            {hackathon.description}
          </p>

          {already && (
            <div className="relative bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.2)] rounded-[3px] p-4 mb-5 flex flex-col gap-3">
              <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
              <p className={`${syne} font-extrabold text-[#5fff60] text-sm tracking-tight`}>
                Already Submitted — you can update before deadline.
              </p>
              {Array.isArray(sub.repoUrl) && sub.repoUrl.length > 0 && (
                <div>
                  <div className={`${mono} text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.4)] mb-1.5`}>
                    URLs
                  </div>
                  <div className="flex flex-col gap-1">
                    {sub.repoUrl.map((url, i) => <LinkRow key={i} href={url} label={url} />)}
                  </div>
                </div>
              )}

              {existingDocs.length > 0 && (
                <div>
                  <div className={`${mono} text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.4)] mb-1.5`}>
                    Documents
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {existingDocs.map((d) => (
                      <div key={d._id} className="flex items-center justify-between gap-2">
                        <LinkRow href={d.url} label={d.original_filename || "Document"} />
                        <div className="flex items-center gap-1.5">
                          <span className={`${mono} text-[0.52rem] text-[rgba(180,220,180,0.3)]`}>
                            ({(d.size / 1024).toFixed(1)} KB)
                          </span>
                          <RemoveBtn
                            onClick={() =>
                              setExistingDocs((prev) => prev.filter((x) => x._id !== d._id))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingVideos.length > 0 && (
                <div>
                  <div className={`${mono} text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.4)] mb-1.5`}>
                    Videos
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {existingVideos.map((v) => (
                      <div key={v._id} className="flex items-center justify-between gap-2">
                        <LinkRow href={v.url} label={v.original_filename || "Video"} />
                        <RemoveBtn
                          onClick={() =>
                            setExistingVideos((prev) => prev.filter((x) => x._id !== v._id))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing images with remove */}
              {existingImages.length > 0 && (
                <div>
                  <div className={`${mono} text-[0.5rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.4)] mb-1.5`}>
                    Images
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {existingImages.map((img) => (
                      <div key={img._id} className="flex items-center justify-between gap-2">
                        <LinkRow href={img.url} label={img.original_filename || "Image"} />
                        <RemoveBtn
                          onClick={() =>
                            setExistingImages((prev) => prev.filter((x) => x._id !== img._id))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* <div>
              <FieldLabel required>Submission URL(s)</FieldLabel>
              <div className="flex flex-col gap-2">
                {repoUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={inp + " flex-1"}
                      placeholder="https://github.com/your-repo"
                      value={url}
                      onChange={(e) => {
                        const a = [...repoUrls];
                        a[i] = e.target.value;
                        setRepoUrls(a);
                      }}
                    />
                    {repoUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRepoUrls(repoUrls.filter((_, j) => j !== i))}
                        className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.07)] text-[rgba(255,100,100,0.6)] hover:text-[#ff9090] transition-all cursor-pointer flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRepoUrls([...repoUrls, ""])}
                  className={`${mono} inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border cursor-pointer transition-all border-[rgba(95,255,96,0.18)] text-[rgba(95,255,96,0.55)] hover:border-[rgba(95,255,96,0.32)] hover:text-[#5fff60] w-full sm:w-auto justify-center`}
                >
                  <Plus size={11} /> Add another URL
                </button>
              </div>
            </div>

            <DropZone
              label={already && existingVideos.length > 0 ? "Upload Additional Video" : "Demo Video"}
              icon={FileVideo}
              accept="video/*"
              file={videoFile}
              onFileChange={handleVideoChange}
              onRemove={removeVideo}
              preview={
                videoFile && (
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="rounded-[2px] w-full max-h-20 object-contain"
                  />
                )
              }
            /> */}

            <DropZone
              label={already && existingDocs.length > 0 ? "Upload Additional Document" : "Documentation (PDF)"}
              icon={FileText}
              accept="application/pdf"
              file={pdfFile}
              onFileChange={(e) => e.target.files[0] && setPdfFile(e.target.files[0])}
              onRemove={removePdf}
              preview={<FileText size={22} className="text-[rgba(95,255,96,0.5)]" />}
            />

            {!isLeader && isTeamMember && (
              <p className={`${mono} text-[0.6rem] text-[rgba(255,184,77,0.7)] tracking-[0.04em]`}>
                ⚠ Only team leaders can submit.
              </p>
            )}

            {already ? (
              isDeadlineOver ? (
                <PrimaryBtn disabled color="gray">Submission Closed</PrimaryBtn>
              ) : (
                <PrimaryBtn disabled={loading || (!isLeader && isTeamMember)} color="amber">
                  {loading ? "Updating…" : "Update Submission"}
                </PrimaryBtn>
              )
            ) : (
              <PrimaryBtn disabled={loading || (!isLeader && isTeamMember) || isDeadlineOver}>
                {loading ? "Submitting…" : "Submit Project"}
              </PrimaryBtn>
            )}
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default SubmissionForm;
