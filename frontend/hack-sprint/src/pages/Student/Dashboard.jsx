import React, { useEffect, useState } from "react";
import {
  getDashboard,
  addEducation,
  editEducation as editEdu,
  deleteEducation,
  deleteConnectedApp,
  addConnectedApp,
  editConnectedApp,
  addLanguages,
  deleteLanguages,
  addSkills,
  deleteSkills,
} from "../../backendApis/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  CheckCircle,
  MessageSquare,
  Star,
  Coins,
  Heart,
  RefreshCw,
  School,
  Clock,
  Laptop,
  MapPin,
  Plus,
  X,
  ExternalLink,
  LogOut,
  Zap,
  Code,
  Globe,
  BookOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import SubmissionForms from "../../hackathon/DashboardSubmission";
import "../Styles/Dashboard.css";
import { API } from "../../backendApis/api";

const inputCls = [
  "w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.12)] rounded-[3px]",
  "px-3 py-2 text-[0.72rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.22)]",
  "font-[family-name:var(--font-mono,_'JetBrains_Mono',monospace)]",
  "focus:outline-none focus:border-[rgba(95,255,96,0.42)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.05)]",
  "transition-all [color-scheme:dark]",
].join(" ");

const selectCls = inputCls + " cursor-pointer";

const Card = ({ children, amber, className = "" }) => (
  <div
    className={`ud-card${
      amber ? " ud-card-amber" : ""
    } relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] backdrop-blur-sm p-5 ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.45)] mb-3">
    {children}
  </div>
);

const SectionHead = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-[0.92rem] tracking-tight">
      {children}
    </h3>
    {action}
  </div>
);

const Btn = ({
  onClick,
  color = "green",
  children,
  disabled,
  className = "",
}) => {
  const colors = {
    green:
      "bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.25)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.15)]",
    red: "bg-[rgba(255,60,60,0.08)] border-[rgba(255,60,60,0.25)] text-[#ff9090] hover:bg-[rgba(255,60,60,0.15)]",
    amber:
      "bg-[rgba(255,184,77,0.08)] border-[rgba(255,184,77,0.25)] text-[#ffb84d] hover:bg-[rgba(255,184,77,0.15)]",
    solid:
      "bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_14px_rgba(95,255,96,0.28)]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1.5 rounded-[3px] border cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]} ${className}`}
    >
      {children}
    </button>
  );
};

const Tag = ({ children, onDelete, color = "green" }) => {
  const c =
    color === "blue"
      ? "bg-[rgba(96,200,255,0.07)] border-[rgba(96,200,255,0.2)] text-[rgba(96,200,255,0.75)]"
      : "bg-[rgba(95,255,96,0.07)] border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.75)]";
  return (
    <span
      className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.05em] px-2.5 py-1 rounded-[2px] border ${c}`}
    >
      {children}
      {onDelete && (
        <button
          onClick={onDelete}
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={9} />
        </button>
      )}
    </span>
  );
};

const StatRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-[rgba(95,255,96,0.05)] last:border-b-0">
    <span className="flex items-center gap-2 font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.5)]">
      <Icon size={12} className="text-[rgba(95,255,96,0.5)]" />
      {label}
    </span>
    <span className="font-[family-name:'Syne',sans-serif] font-bold text-[0.78rem] text-[#5fff60]">
      {value}
    </span>
  </div>
);

export const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [editEducationIndex, setEditEducationIndex] = useState(undefined);
  const [educationForm, setEducationForm] = useState({
    institute: "",
    passOutYear: "",
    department: "",
    location: "",
  });
  const [userId, setUserId] = useState("");
  const [editAppsIndex, setEditAppsIndex] = useState(undefined);
  const [tempAppName, setTempAppName] = useState("");
  const [tempAppUrl, setTempAppUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const [likedHackathons, setLikedHackathons] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const navigate = useNavigate();

  const availableLanguages = [
    "C++",
    "C",
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "Go",
    "Rust",
  ];
  const availableSkills = [
    "Frontend",
    "Backend",
    "DevOps",
    "Websockets",
    "Machine Learning",
    "DSA",
    "Cybersecurity",
    "Operating Systems",
  ];

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("lastVisit");
    const storedCoins = parseInt(localStorage.getItem("coins") || "0", 10);
    const storedStreak = parseInt(localStorage.getItem("streak") || "0", 10);
    let newCoins = storedCoins,
      newStreak = storedStreak;
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      newStreak = lastVisit === yesterday.toDateString() ? storedStreak + 1 : 1;
      newCoins += 10 + Math.floor(newStreak / 5) * 5;
      localStorage.setItem("coins", newCoins.toString());
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastVisit", today);
      setShowReward(true);
    }
    setCoins(newCoins);
    setStreak(newStreak);
  }, []);

  const fetchData = async () => {
    try {
      const res = await getDashboard();
      setData(res.data.userData);
      setUserId(res.data.userData._id);
    } catch (err) {
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const check = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decoded = jwtDecode(token);
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          toast.success("Session expired", { autoClose: 800 });
          setTimeout(() => {
            navigate("/account/login");
            window.location.reload();
          }, 2000);
        }
      } catch {}
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingWishlist(true);
    try {
      const res = await API.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/hackathons/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setLikedHackathons(res.data.likedHackathons);
    } catch {
    } finally {
      setLoadingWishlist(false);
    }
  };
  useEffect(() => {
    if (data) fetchWishlist();
  }, [data]);

  const handleSaveEducation = async () => {
    if (!educationForm.institute || !educationForm.passOutYear) return;
    try {
      if (editEducationIndex === "new")
        await addEducation({ userId, ...educationForm });
      else
        await editEdu({
          userId,
          eduId: data.education[editEducationIndex]._id,
          ...educationForm,
        });
      await fetchData();
      resetEducationForm();
    } catch (err) {
      // console.error(err);
    }
  };
  const handleDeleteEducation = async (idx) => {
    try {
      const eduId = data.education[idx]._id;
      setData((p) => ({
        ...p,
        education: p.education.filter((_, i) => i !== idx),
      }));
      await deleteEducation({ userId, eduId });
    } catch {
      await fetchData();
    }
  };
  const resetEducationForm = () => {
    setEditEducationIndex(undefined);
    setEducationForm({
      institute: "",
      passOutYear: "",
      department: "",
      location: "",
    });
  };

  const handleSaveApp = async () => {
    if (!tempAppName || !tempAppUrl) return;
    try {
      if (editAppsIndex === "new")
        await addConnectedApp({
          userId,
          appName: tempAppName,
          appURL: tempAppUrl,
        });
      else
        await editConnectedApp({
          userId,
          appId: data.connectedApps[editAppsIndex]._id,
          appName: tempAppName,
          appURL: tempAppUrl,
        });
      await fetchData();
      resetForm();
    } catch (err) {
      // console.error(err);
    }
  };
  const handleDeleteApp = async (idx) => {
    try {
      const appId = data.connectedApps[idx]._id;
      setData((p) => ({
        ...p,
        connectedApps: p.connectedApps.filter((_, i) => i !== idx),
      }));
      await deleteConnectedApp({ userId, appId });
    } catch {
      await fetchData();
    }
  };
  const resetForm = () => {
    setEditAppsIndex(undefined);
    setTempAppName("");
    setTempAppUrl("");
  };

  const handleSaveLanguage = async () => {
    if (
      !selectedLanguage ||
      data.languages.some((l) => l.name === selectedLanguage)
    )
      return;
    try {
      await addLanguages({ userId, language: selectedLanguage });
      setData({
        ...data,
        languages: [...(data.languages || []), { name: selectedLanguage }],
      });
      setSelectedLanguage("");
      setIsAddingLanguage(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };
  const handleDeleteLanguage = async (langName) => {
    try {
      await deleteLanguages({ userId, language: langName });
      setData({
        ...data,
        languages: data.languages.filter((l) => l.language !== langName),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleSaveSkill = async () => {
    if (!selectedSkill) return;
    if (data.skills.some((s) => s.name === selectedSkill)) {
      toast.error("Already added!");
      return;
    }
    try {
      await addSkills({ userId, skill: selectedSkill });
      setData({
        ...data,
        skills: [...(data.skills || []), { name: selectedSkill }],
      });
      setSelectedSkill("");
      setIsAddingSkill(false);
    } catch (err) {
      // console.error(err);
    }
  };
  const handleDeleteSkill = async (skillName) => {
    setData({
      ...data,
      skills: data.skills.filter((s) => s.skill !== skillName),
    });
    try {
      await deleteSkills({ userId, skill: skillName });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    toast.success("Logged out", { autoClose: 1000 });
    setTimeout(() => navigate("/"), 1700);
  };

  /* ── Loading / error states ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-3 font-[family-name:'JetBrains_Mono',monospace]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div className="ud-spinner" />
        <span className="text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.4)]">
          Loading dashboard…
        </span>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[rgba(255,96,96,0.6)] font-[family-name:'JetBrains_Mono',monospace] text-[0.75rem] tracking-widest uppercase">
        Failed to load dashboard
      </div>
    );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <div className="ud-bg relative min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-x-hidden font-[family-name:'JetBrains_Mono',monospace]">
        <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-5">
          <aside className="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-4">
            <Card>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <img
                    src={
                      data.avatar_url ||
                      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                    }
                    alt="Avatar"
                    className="w-20 h-20 rounded-full border-2 border-[rgba(95,255,96,0.3)] object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-[1.05rem] tracking-tight">
                    {data.name || "Unnamed"}
                  </h2>
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(95,255,96,0.45)] tracking-[0.1em] uppercase mt-0.5">
                    Student
                  </p>
                </div>
                <Btn
                  onClick={handleLogout}
                  color="red"
                  className="w-full justify-center"
                >
                  <LogOut size={11} /> Logout
                </Btn>
              </div>
            </Card>

            {/* Coins + Streak */}
            <Card amber>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-[#ffb84d]" />
                  <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[#ffb84d] text-[1rem]">
                    {coins}
                  </span>
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(255,184,77,0.5)]">
                    coins
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-[#ffb84d]" />
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(255,184,77,0.7)]">
                    {streak}d streak
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(255,184,77,0.1)] overflow-hidden">
                <div
                  className="h-full bg-[#ffb84d] rounded-full transition-all"
                  style={{ width: `${Math.min((streak % 5) * 20, 100)}%` }}
                />
              </div>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(255,184,77,0.35)] mt-1.5 tracking-[0.05em]">
                {5 - (streak % 5)} more days for bonus coins
              </p>
            </Card>

            {/* Community Stats */}
            <Card>
              <SectionLabel>Community Stats</SectionLabel>
              <StatRow
                icon={Eye}
                label="Views"
                value={data.stats?.views || 0}
              />
              <StatRow
                icon={CheckCircle}
                label="Solutions"
                value={data.stats?.solutions || 0}
              />
              <StatRow
                icon={MessageSquare}
                label="Discussions"
                value={data.stats?.discussions || 0}
              />
              <StatRow
                icon={Star}
                label="Reputation"
                value={data.stats?.reputation || 0}
              />
            </Card>

            {/* Languages */}
            <Card>
              <SectionHead
                action={
                  !isAddingLanguage && (
                    <Btn onClick={() => setIsAddingLanguage(true)}>
                      <Plus size={9} /> Add
                    </Btn>
                  )
                }
              >
                <Code
                  size={13}
                  className="inline mr-1.5 text-[rgba(95,255,96,0.5)]"
                />
                Languages
              </SectionHead>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.languages?.length > 0 ? (
                  data.languages.map((l, i) => (
                    <Tag
                      key={i}
                      onDelete={() => handleDeleteLanguage(l.language)}
                    >
                      {l.language || l.name}
                    </Tag>
                  ))
                ) : (
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.3)]">
                    None added yet.
                  </p>
                )}
              </div>
              {isAddingLanguage && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[rgba(95,255,96,0.07)]">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select language</option>
                    {availableLanguages
                      .filter((l) => !data.languages?.some((x) => x.name === l))
                      .map((l, i) => (
                        <option key={i} value={l}>
                          {l}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <Btn onClick={handleSaveLanguage} color="solid">
                      Save
                    </Btn>
                    <Btn
                      onClick={() => {
                        setSelectedLanguage("");
                        setIsAddingLanguage(false);
                      }}
                      color="red"
                    >
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
            </Card>

            {/* Skills */}
            <Card>
              <SectionHead
                action={
                  !isAddingSkill && (
                    <Btn onClick={() => setIsAddingSkill(true)}>
                      <Plus size={9} /> Add
                    </Btn>
                  )
                }
              >
                <BookOpen
                  size={13}
                  className="inline mr-1.5 text-[rgba(95,255,96,0.5)]"
                />
                Skills
              </SectionHead>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.skills?.length > 0 ? (
                  data.skills.map((s, i) => (
                    <Tag
                      key={i}
                      color="blue"
                      onDelete={() => handleDeleteSkill(s.skill)}
                    >
                      {s.skill || s.name}
                    </Tag>
                  ))
                ) : (
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.3)]">
                    None added yet.
                  </p>
                )}
              </div>
              {isAddingSkill && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[rgba(95,255,96,0.07)]">
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select skill</option>
                    {availableSkills.map((s, i) => (
                      <option key={i} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Btn onClick={handleSaveSkill} color="solid">
                      Save
                    </Btn>
                    <Btn
                      onClick={() => {
                        setSelectedSkill("");
                        setIsAddingSkill(false);
                      }}
                      color="red"
                    >
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
            </Card>
          </aside>

          {/* ═══════ MAIN CONTENT ═══════ */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Education */}
            <Card>
              <SectionHead
                action={
                  editEducationIndex === undefined && (
                    <Btn
                      onClick={() => {
                        setEditEducationIndex("new");
                        setEducationForm({
                          institute: "",
                          passOutYear: "",
                          department: "",
                          location: "",
                        });
                      }}
                    >
                      <Plus size={9} /> Add
                    </Btn>
                  )
                }
              >
                <School
                  size={13}
                  className="inline mr-1.5 text-[rgba(95,255,96,0.5)]"
                />
                Education
              </SectionHead>

              {editEducationIndex === undefined ? (
                data.education?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data.education.map((edu, idx) => (
                      <div
                        key={edu._id || idx}
                        className="bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <School
                              size={14}
                              className="text-[rgba(95,255,96,0.5)] flex-shrink-0"
                            />
                            <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-[0.88rem] tracking-tight">
                              {edu.institute || "N/A"}
                            </span>
                          </div>
                          {edu.passOutYear && (
                            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(95,255,96,0.5)] flex items-center gap-1">
                              <Clock size={10} />
                              {edu.passOutYear}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[0.62rem] text-[rgba(180,220,180,0.45)] mb-3">
                          {edu.department && (
                            <span className="flex items-center gap-1">
                              <Laptop size={10} />
                              {edu.department}
                            </span>
                          )}
                          {edu.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {edu.location}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Btn
                            color="amber"
                            onClick={() => {
                              setEditEducationIndex(idx);
                              setEducationForm(edu);
                            }}
                          >
                            <Pencil size={10} /> Edit
                          </Btn>
                          <Btn
                            color="red"
                            onClick={() => handleDeleteEducation(idx)}
                          >
                            <Trash2 size={10} /> Delete
                          </Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.35)]">
                    No education added yet.
                  </p>
                )
              ) : (
                <div className="flex flex-col gap-2.5">
                  {["institute", "department", "passOutYear", "location"].map(
                    (field, i) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={
                          [
                            "Institute *",
                            "Department",
                            "Expected Year (e.g. 2024–2028)",
                            "Location",
                          ][i]
                        }
                        value={educationForm[field]}
                        onChange={(e) =>
                          setEducationForm({
                            ...educationForm,
                            [field]: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    )
                  )}
                  <div className="flex gap-2 mt-1">
                    <Btn onClick={handleSaveEducation} color="solid">
                      Save
                    </Btn>
                    <Btn onClick={resetEducationForm} color="red">
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
            </Card>

            {/* Connected Apps */}
            <Card>
              <SectionHead
                action={
                  editAppsIndex === undefined && (
                    <Btn
                      onClick={() => {
                        setEditAppsIndex("new");
                        setTempAppName("");
                        setTempAppUrl("");
                      }}
                    >
                      <Plus size={9} /> Add
                    </Btn>
                  )
                }
              >
                <Globe
                  size={13}
                  className="inline mr-1.5 text-[rgba(95,255,96,0.5)]"
                />
                Connected Apps
              </SectionHead>

              {editAppsIndex === undefined ? (
                data.connectedApps?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {data.connectedApps.map((app, idx) => (
                      <div
                        key={app._id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] px-4 py-3"
                      >
                        <span className="font-[family-name:'Syne',sans-serif] font-bold text-white text-[0.82rem]">
                          {app.appName}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          <a
                            href={app.appURL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Btn>
                              <ExternalLink size={10} /> Visit
                            </Btn>
                          </a>
                          <Btn
                            color="amber"
                            onClick={() => {
                              setEditAppsIndex(idx);
                              setTempAppName(app.appName);
                              setTempAppUrl(app.appURL);
                            }}
                          >
                            <Pencil size={10} /> Edit
                          </Btn>
                          <Btn color="red" onClick={() => handleDeleteApp(idx)}>
                            <Trash2 size={10} /> Delete
                          </Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.35)]">
                    No connected apps yet.
                  </p>
                )
              ) : (
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    placeholder="App Name (e.g. GitHub, LinkedIn)"
                    value={tempAppName}
                    onChange={(e) => setTempAppName(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="url"
                    placeholder="App URL (https://…)"
                    value={tempAppUrl}
                    onChange={(e) => setTempAppUrl(e.target.value)}
                    className={inputCls}
                  />
                  <div className="flex gap-2 mt-1">
                    <Btn onClick={handleSaveApp} color="solid">
                      Save
                    </Btn>
                    <Btn onClick={resetForm} color="red">
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
            </Card>

            {/* Favourites / Wishlist */}
            <Card>
              <SectionHead
                action={
                  <Btn onClick={fetchWishlist} disabled={loadingWishlist}>
                    <RefreshCw
                      size={10}
                      className={loadingWishlist ? "animate-spin" : ""}
                    />{" "}
                    Refresh
                  </Btn>
                }
              >
                <Heart
                  size={13}
                  className="inline mr-1.5 text-[rgba(95,255,96,0.5)]"
                />
                Favourites
              </SectionHead>

              {loadingWishlist ? (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.35)]">
                  Loading…
                </p>
              ) : likedHackathons.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {likedHackathons.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => navigate(`/hackathon/${h._id}`)}
                      className="flex gap-3 bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] p-3 cursor-pointer hover:border-[rgba(95,255,96,0.28)] transition-all"
                    >
                      {h.image && (
                        <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-[2px] overflow-hidden flex-shrink-0">
                          <img
                            src={h.image}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-[0.82rem] tracking-tight truncate">
                          {h.title}
                        </h4>
                        {h.subTitle && (
                          <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(180,220,180,0.4)] truncate mt-0.5">
                            {h.subTitle}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                          {h.startDate && (
                            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(180,220,180,0.35)]">
                              {new Date(h.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {h.difficulty && <Tag>{h.difficulty}</Tag>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.3)] leading-relaxed">
                  No favourites yet. Click the heart icon on any hackathon to
                  save it here.
                </p>
              )}
            </Card>
          </main>
        </div>

        {/* ── Daily Reward Modal ── */}
        {showReward && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50 px-4">
            <div className="ud-reward-modal ud-card relative bg-[rgba(8,10,8,0.98)] border border-[rgba(255,184,77,0.3)] rounded-[4px] p-7 max-w-xs w-full text-center shadow-[0_0_40px_rgba(255,184,77,0.1)]">
              {/* amber top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[rgba(255,184,77,0.4)] rounded-t-[4px]" />
              <div className="text-3xl mb-3">🎉</div>
              <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-[1.1rem] tracking-tight mb-2">
                Daily Reward!
              </h2>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.55)] mb-1">
                You earned{" "}
                <span className="text-[#ffb84d] font-bold">
                  +{10 + Math.floor(streak / 5) * 5} coins
                </span>{" "}
                today.
              </p>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(255,184,77,0.5)] mb-5">
                🔥 Streak: {streak} days
              </p>
              <Btn
                onClick={() => setShowReward(false)}
                color="solid"
                className="w-full justify-center text-[0.68rem]"
              >
                Awesome!
              </Btn>
            </div>
          </div>
        )}

        {/* ── Submission Modal ── */}
        {isSubmissionOpen && (
          <SubmissionForms
            isOpen={isSubmissionOpen}
            onClose={() => {
              setSelectedHackathonId(null);
              setIsSubmissionOpen(false);
            }}
            hackathonId={selectedHackathonId}
          />
        )}
      </div>
    </>
  );
};

export default UserDashboard;
