import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProfileAPI } from "../../api/profile.api.js";
import { AuthAPI } from "../../api/auth.api.js";
import { HackathonAPI } from "../../api/hackathon.api.js";
import { MediaAPI } from "../../api/media.api.js";
import { ConnectionsAPI } from "../../api/connections.api.js";
import SkillPicker from "../../components/SkillPicker.jsx";
import { UpNextCard, RecentActivity, Recommended } from "../../components/Dashboard/DashboardWidgets.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";
import {
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
  Code,
  Globe,
  BookOpen,
  Pencil,
  Trash2,
  Trophy,
  Users,
  Calendar,
  AlertCircle,
  Rocket,
  Upload,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import CameraCapture from "../../components/CameraCapture.jsx";
import StreakHeatmap from "../../components/Daily/StreakHeatmap.jsx";
import "../Styles/Dashboard.css";
import "../Styles/AllHackathons.css";

const inputCls = [
  "w-full bg-[rgba(var(--hk-input-bg),0.7)] border border-[rgba(var(--hk-card-border-rgb),0.19)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-[3px]",
  "px-3 py-2 text-[0.72rem] text-[var(--hk-text)] placeholder-[rgba(var(--hk-accent-rgb),0.52)] dark:placeholder-[rgba(var(--hk-accent-rgb),0.22)]",
  "font-[family-name:var(--font-mono,_'JetBrains_Mono',monospace)]",
  "focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.42)] focus:shadow-[0_0_0_2px_rgba(var(--hk-accent-rgb),0.05)]",
  "transition-all [color-scheme:light] dark:[color-scheme:dark]",
].join(" ");

const selectCls = inputCls + " cursor-pointer";

const Card = ({ children, amber, className = "" }) => (
  <div
    className={`ud-card${
      amber ? " ud-card-amber" : ""
    } relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px] backdrop-blur-sm p-5 ${className}`}
  >
    {children}
  </div>
);

const SectionHead = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[0.92rem] tracking-tight">
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
      "bg-[rgba(var(--hk-accent-rgb),0.08)] border-[rgba(var(--hk-card-border-rgb),0.4)] dark:border-[rgba(var(--hk-card-border-rgb),0.25)] text-[var(--hk-accent-solid)] hover:bg-[rgba(var(--hk-accent-rgb),0.15)]",
    red: "bg-[rgba(var(--hk-red-rgb),0.08)] border-[rgba(var(--hk-red-rgb),0.25)] text-[rgb(var(--hk-red-rgb))] hover:bg-[rgba(var(--hk-red-rgb),0.15)]",
    amber:
      "bg-[rgba(var(--hk-amber-rgb),0.08)] border-[rgba(var(--hk-amber-rgb),0.25)] text-[rgb(var(--hk-amber-rgb))] hover:bg-[rgba(var(--hk-amber-rgb),0.15)]",
    solid:
      "bg-[var(--hk-accent-solid)] border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] font-bold hover:brightness-110 hover:shadow-[0_0_14px_rgba(var(--hk-accent-rgb),0.28)]",
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
      ? "bg-[rgba(var(--hk-blue-rgb),0.07)] border-[rgba(var(--hk-blue-rgb),0.2)] text-[rgba(var(--hk-blue-rgb),0.75)]"
      : color === "amber"
      ? "bg-[rgba(var(--hk-amber-rgb),0.07)] border-[rgba(var(--hk-amber-rgb),0.2)] text-[rgba(var(--hk-amber-rgb),0.8)]"
      : "bg-[rgba(var(--hk-accent-rgb),0.07)] border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] text-[rgba(var(--hk-accent-rgb),1.0)] dark:text-[rgba(var(--hk-accent-rgb),0.75)]";
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

const errCls = "!border-[rgba(var(--hk-red-rgb),0.6)]";

const EditProfileModal = ({ data, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: data.name || "",
    userName: data.userName || "",
    gender: data.gender || "",
    bio: data.bio || "",
    location: data.location || "",
    contactNumber: data.contactNumber || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(data.image?.url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [nameStatus, setNameStatus] = useState("idle");
  const fileRef = useRef(null);
  const avatarMenuRef = useRef(null);

  // Live "is this username free?" check — skipped while the field still
  // holds the user's own current username.
  useEffect(() => {
    const candidate = form.userName;
    if (!candidate || candidate === data.userName) {
      setNameStatus("idle");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(candidate)) {
      setNameStatus("invalid");
      return;
    }
    setNameStatus("checking");
    let cancelled = false;
    const timer = setTimeout(() => {
      ProfileAPI.checkUserName(candidate)
        .then((res) => {
          if (!cancelled) setNameStatus(res.data.available ? "available" : "taken");
        })
        .catch(() => {
          if (!cancelled) setNameStatus("idle");
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.userName, data.userName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target))
        setShowAvatarMenu(false);
    };
    if (showAvatarMenu) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAvatarMenu]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAvatarSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Invalid image format.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSubmitted(true);
    const missing = [
      !form.name.trim() && "name",
      !form.userName.trim() && "username",
      !form.gender && "gender",
      !form.bio.trim() && "bio",
      !form.location.trim() && "location",
      !form.contactNumber.trim() && "contact number",
      !avatarPreview && "profile photo",
    ].filter(Boolean);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(form.contactNumber.trim())) {
      toast.error("Contact number must be 10-15 digits, optionally starting with +");
      return;
    }
    if (nameStatus === "invalid" || nameStatus === "taken") {
      toast.error(
        nameStatus === "taken" ? "That username is already taken." : "Username must be 3-20 letters, numbers or underscores."
      );
      return;
    }
    setIsSaving(true);
    try {
      let updated = { ...data };

      if (avatarFile) {
        const uploadRes = await MediaAPI.uploadFile(avatarFile, "avatar");
        const { url, key } = uploadRes.data.file;
        const avatarRes = await ProfileAPI.updateAvatar({ url, key });
        updated.image = avatarRes.data.image;
      }

      const profileRes = await ProfileAPI.updateProfile({
        name: form.name.trim(),
        userName: form.userName.trim(),
        gender: form.gender,
        bio: form.bio.trim(),
        location: form.location.trim(),
        contactNumber: form.contactNumber.trim(),
      });
      updated = { ...updated, ...profileRes.data.profile };

      toast.success("Profile updated!");
      onSaved(updated);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 font-[family-name:'JetBrains_Mono',monospace]">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[var(--hk-bg)] border border-[rgba(var(--hk-card-border-rgb),0.32)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] rounded-[4px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-lg">
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] hover:text-[var(--hk-text)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[0.62rem] leading-relaxed text-[rgba(var(--hk-text-rgb),0.9)] dark:text-[rgba(var(--hk-text-rgb),0.55)] mb-4">
          Every field is required — a complete profile is needed to register, join a team or
          submit in any event.
        </p>

        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="relative" ref={avatarMenuRef}>
            <img
              src={
                avatarPreview ||
                "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-[rgba(var(--hk-card-border-rgb),0.48)] dark:border-[rgba(var(--hk-card-border-rgb),0.3)] object-cover"
            />
            <button
              onClick={() => setShowAvatarMenu((v) => !v)}
              title="Change photo"
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--hk-accent-solid)] flex items-center justify-center text-[var(--hk-accent-solid-text)] hover:brightness-110 transition-colors cursor-pointer"
            >
              <Camera size={13} />
            </button>

            {showAvatarMenu && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-[rgba(var(--hk-card-bg),0.98)] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)] rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-10">
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    setShowCamera(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[0.65rem] tracking-[0.03em] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.75)] hover:bg-[rgba(var(--hk-accent-rgb),0.08)] hover:text-[var(--hk-accent-solid)] transition-colors cursor-pointer"
                >
                  <Camera size={13} /> Take Photo
                </button>
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    fileRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[0.65rem] tracking-[0.03em] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.75)] hover:bg-[rgba(var(--hk-accent-rgb),0.08)] hover:text-[var(--hk-accent-solid)] transition-colors cursor-pointer border-t border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)]"
                >
                  <Upload size={13} /> Upload from Computer
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleAvatarSelect(e.target.files[0])}
            />
          </div>
          <p
            className={`text-[0.58rem] ${
              submitted && !avatarPreview ? "text-[rgb(var(--hk-red-rgb))]" : "text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)]"
            }`}
          >
            {submitted && !avatarPreview ? "Profile photo is required · " : ""}JPEG, PNG, WEBP · Max 5MB
          </p>
        </div>

        {showCamera && (
          <CameraCapture
            onCapture={handleAvatarSelect}
            onClose={() => setShowCamera(false)}
          />
        )}

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[0.6rem] tracking-[0.06em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-1 block">
              Name *
            </label>
            <input
              className={`${inputCls} ${submitted && !form.name.trim() ? errCls : ""}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-[0.6rem] tracking-[0.06em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-1 block">
              Username *
            </label>
            <input
              className={`${inputCls} ${
                nameStatus === "taken" || nameStatus === "invalid" || (submitted && !form.userName.trim())
                  ? errCls
                  : ""
              }`}
              value={form.userName}
              onChange={(e) =>
                setForm({
                  ...form,
                  userName: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20),
                })
              }
              placeholder="e.g. jane_doe"
            />
            {nameStatus !== "idle" && (
              <p
                className={`mt-1 text-[0.58rem] ${
                  nameStatus === "available"
                    ? "text-[var(--hk-accent-solid)]"
                    : nameStatus === "checking"
                    ? "text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)]"
                    : "text-[rgb(var(--hk-red-rgb))]"
                }`}
              >
                {nameStatus === "checking" && "Checking availability…"}
                {nameStatus === "available" && "Username is available"}
                {nameStatus === "taken" && "That username is already taken"}
                {nameStatus === "invalid" && "3-20 characters: letters, numbers, underscores"}
              </p>
            )}
          </div>
          <div>
            <label className="text-[0.6rem] tracking-[0.06em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-1 block">
              Gender *
            </label>
            <select
              className={`${selectCls} ${submitted && !form.gender ? errCls : ""}`}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-[0.6rem] tracking-[0.06em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-1 block">
              Bio *
            </label>
            <textarea
              className={`${inputCls} ${submitted && !form.bio.trim() ? errCls : ""}`}
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
              placeholder="A short bio about yourself"
            />
          </div>
          <div>
            <label className="text-[0.6rem] tracking-[0.06em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-1 block">
              Location *
            </label>
            <input
              className={`${inputCls} ${submitted && !form.location.trim() ? errCls : ""}`}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="text-[0.6rem] tracking-[0.06em] uppercase text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-1 block">
              Contact Number *
            </label>
            <input
              className={`${inputCls} ${submitted && !form.contactNumber.trim() ? errCls : ""}`}
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="+91XXXXXXXXXX"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Btn onClick={onClose} color="red" className="flex-1 justify-center">
            Cancel
          </Btn>
          <Btn
            onClick={handleSave}
            color="solid"
            disabled={isSaving}
            className="flex-1 justify-center"
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editEducationIndex, setEditEducationIndex] = useState(undefined);
  const [educationForm, setEducationForm] = useState({
    institute: "",
    passOutYear: "",
    department: "",
    location: "",
  });
  const [editAppsIndex, setEditAppsIndex] = useState(undefined);
  const [tempAppName, setTempAppName] = useState("");
  const [tempAppUrl, setTempAppUrl] = useState("");
  const [likedHackathons, setLikedHackathons] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrationsError, setRegistrationsError] = useState(false);
  const [tab, setTab] = useState("overview");
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const navigate = useNavigate();
  const { logoutAndClear, login } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Sent here from a hackathon action that needs a complete profile — open
  // the edit form straight away instead of making them hunt for it.
  useEffect(() => {
    if (searchParams.get("completeProfile") !== "1" || !data) return;
    if (data.isProfileComplete === false) setShowEditProfile(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, data, setSearchParams]);

  const fetchData = async () => {
    try {
      const res = await ProfileAPI.getMyProfile();
      setData(res.data.profile);
    } catch (err) {
      if (err.response?.status === 401) {
        await logoutAndClear(false);
        navigate("/account/login", { replace: true });
        return;
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    fetchWishlist();
    fetchMyRegistrations();
    ConnectionsAPI.listFriends()
      .then((res) => setFriends(res.data.friends || []))
      .catch(() => setFriends([]))
      .finally(() => setLoadingFriends(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decoded = jwtDecode(token);
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          try {
            const res = await AuthAPI.refreshToken();
            localStorage.setItem("token", res.data.token);
          } catch {
            await logoutAndClear(false);
            toast.success("Session expired", { duration: 800 });
            setTimeout(() => {
              navigate("/account/login");
            }, 2000);
          }
        }
      } catch {
        // an undecodable token is handled by the 401 flow on the next request
      }
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingWishlist(true);
    try {
      const res = await HackathonAPI.getWishlist();
      if (res.data.success) setLikedHackathons(res.data.likedHackathons);
    } catch {
      // the Saved tab simply shows its empty state
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fetchMyRegistrations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingRegistrations(true);
    setRegistrationsError(false);
    try {
      const res = await HackathonAPI.getMyRegistrations();
      if (res.data.success) {
        setMyRegistrations(res.data.registrations || []);
      } else {
        setRegistrationsError(true);
      }
    } catch {
      setRegistrationsError(true);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleSaveEducation = async () => {
    if (!educationForm.institute || !educationForm.passOutYear) return;
    try {
      let res;
      if (editEducationIndex === "new") {
        res = await ProfileAPI.addEducation(educationForm);
      } else {
        const eduId = data.education[editEducationIndex]._id;
        res = await ProfileAPI.updateEducation(eduId, educationForm);
      }
      setData((p) => ({ ...p, education: res.data.education }));
      resetEducationForm();
      toast.success(
        editEducationIndex === "new" ? "Education added" : "Education updated"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save education");
      await fetchData();
    }
  };
  const handleDeleteEducation = async (idx) => {
    try {
      const eduId = data.education[idx]._id;
      setData((p) => ({
        ...p,
        education: p.education.filter((_, i) => i !== idx),
      }));
      await ProfileAPI.removeEducation(eduId);
      toast.success("Education removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove education");
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
      let res;
      if (editAppsIndex === "new") {
        res = await ProfileAPI.addConnectedApp({
          appName: tempAppName,
          appURL: tempAppUrl,
        });
      } else {
        const appId = data.connectedApps[editAppsIndex]._id;
        res = await ProfileAPI.updateConnectedApp(appId, {
          appName: tempAppName,
          appURL: tempAppUrl,
        });
      }
      setData((p) => ({ ...p, connectedApps: res.data.connectedApps }));
      resetForm();
      toast.success(
        editAppsIndex === "new" ? "App connected" : "App updated"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save app");
      await fetchData();
    }
  };
  const handleDeleteApp = async (idx) => {
    try {
      const appId = data.connectedApps[idx]._id;
      setData((p) => ({
        ...p,
        connectedApps: p.connectedApps.filter((_, i) => i !== idx),
      }));
      await ProfileAPI.removeConnectedApp(appId);
      toast.success("App removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove app");
      await fetchData();
    }
  };
  const resetForm = () => {
    setEditAppsIndex(undefined);
    setTempAppName("");
    setTempAppUrl("");
  };

  // The skill picker only ever hands back a catalog skill (typeahead over
  // the DB); the API re-validates the whole list against the catalog.
  const handleAddSkill = async (skillName) => {
    if (data.skills?.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      toast.error("Already added!");
      return;
    }
    try {
      const res = await ProfileAPI.updateSkills([...(data.skills || []), skillName]);
      setData((prev) => ({ ...prev, skills: res.data.skills }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add skill");
    }
  };
  const handleDeleteSkill = async (skillName) => {
    try {
      const updated = (data.skills || []).filter((s) => s !== skillName);
      const res = await ProfileAPI.updateSkills(updated);
      setData((prev) => ({ ...prev, skills: res.data.skills }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove skill");
    }
  };

  const handleTogglePeoplePage = async () => {
    const next = !(data.showOnPeoplePage !== false);
    try {
      const res = await ProfileAPI.updateProfile({ showOnPeoplePage: next });
      setData({ ...data, showOnPeoplePage: res.data.profile.showOnPeoplePage });
      toast.success(next ? "You're visible on the Community page" : "You're hidden from the Community page");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update visibility");
    }
  };

  const handleLogout = async () => {
    await logoutAndClear(false);
    toast.success("Logged out", { duration: 1000 });
    setTimeout(() => navigate("/"), 1700);
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--hk-bg)] gap-3 font-[family-name:'JetBrains_Mono',monospace]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div className="ud-spinner" />
        <span className="text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)]">
          Loading dashboard…
        </span>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--hk-bg)] text-[rgba(var(--hk-red-rgb),0.6)] font-[family-name:'JetBrains_Mono',monospace] text-[0.75rem] tracking-widest uppercase">
        Failed to load dashboard
      </div>
    );

  // Registrations whose linked hackathon still exists (defensive against deleted/unpopulated refs)
  const validRegistrations = myRegistrations.filter((reg) => reg?.hackathon);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <div className="ud-bg relative min-h-screen bg-[var(--hk-bg)] text-[var(--hk-text)] overflow-x-clip font-[family-name:'JetBrains_Mono',monospace]">
        <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-5">
          <aside className="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <img
                    src={
                      data.image?.url ||
                      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                    }
                    alt="Avatar"
                    className="w-20 h-20 rounded-full border-2 border-[rgba(var(--hk-card-border-rgb),0.48)] dark:border-[rgba(var(--hk-card-border-rgb),0.3)] object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[1.05rem] tracking-tight">
                    {data.name || "Unnamed"}
                  </h2>
                  {data.userName && (
                    <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.85)] dark:text-[rgba(var(--hk-text-rgb),0.5)] mt-0.5">
                      @{data.userName}
                    </p>
                  )}
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(var(--hk-accent-rgb),0.75)] dark:text-[rgba(var(--hk-accent-rgb),0.45)] tracking-[0.1em] uppercase mt-0.5">
                    Student
                  </p>
                </div>
                <Btn
                  onClick={() => setShowEditProfile(true)}
                  color="green"
                  className="w-full justify-center"
                >
                  <Pencil size={11} /> Edit Profile
                </Btn>
                <Btn
                  onClick={handleLogout}
                  color="red"
                  className="w-full justify-center"
                >
                  <LogOut size={11} /> Logout
                </Btn>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.showOnPeoplePage !== false}
                onClick={handleTogglePeoplePage}
                className="w-full flex items-center justify-between gap-3 mt-1 pt-3 border-t border-[rgba(var(--hk-card-border-rgb),0.14)] dark:border-[rgba(var(--hk-card-border-rgb),0.08)] cursor-pointer text-left"
              >
                <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] leading-snug text-[rgba(var(--hk-text-rgb),0.85)] dark:text-[rgba(var(--hk-text-rgb),0.55)]">
                  Show me on the Community page
                </span>
                <span className={`relative w-8 h-[18px] rounded-full flex-shrink-0 transition-colors ${data.showOnPeoplePage !== false ? "bg-[var(--hk-accent-solid)]" : "bg-[rgba(var(--hk-text-rgb),0.25)]"}`}>
                  <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${data.showOnPeoplePage !== false ? "left-[16px]" : "left-[2px]"}`} />
                </span>
              </button>
            </Card>

            {data.isProfileComplete === false && (
              <Card amber>
                <SectionHead>
                  <AlertCircle size={13} className="inline mr-1.5 text-[rgba(var(--hk-amber-rgb),0.8)]" />
                  Complete your profile
                </SectionHead>
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.6)] leading-relaxed mb-2">
                  You can&apos;t register, join a team or submit in any hackathon until every
                  field is filled. Still missing:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(data.missingProfileFields || []).map((f) => (
                    <Tag key={f.key} color="amber">
                      {f.label}
                    </Tag>
                  ))}
                </div>
                <Btn onClick={() => setShowEditProfile(true)} color="amber">
                  <Pencil size={9} /> Complete profile
                </Btn>
              </Card>
            )}

            <UpNextCard registrations={validRegistrations} />

            <Card className="z-20">
              <SectionHead>
                <BookOpen
                  size={13}
                  className="inline mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]"
                />
                Skills
              </SectionHead>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {data.skills?.length > 0 ? (
                  data.skills.map((s) => (
                    <Tag key={s} color="blue" onDelete={() => handleDeleteSkill(s)}>
                      {s}
                    </Tag>
                  ))
                ) : (
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)]">
                    None added yet.
                  </p>
                )}
              </div>
              <SkillPicker selected={data.skills || []} onAdd={handleAddSkill} />
            </Card>

            {friends.length > 0 && (
            <Card>
              <SectionHead>
                <Users size={13} className="inline mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]" />
                Friends ({friends.length})
              </SectionHead>
              {loadingFriends ? (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
                  Loading…
                </p>
              ) : friends.length === 0 ? (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] leading-relaxed">
                  No friends yet — connect with someone from the Community page.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.map(({ connectionId, friend }) => (
                    <button
                      key={connectionId}
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("hacksprint:open-friend-chat", {
                            detail: { friendId: friend._id, friend },
                          })
                        )
                      }
                      className="flex items-center gap-2.5 text-left cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-[rgba(var(--hk-accent-rgb),0.08)] border border-[rgba(var(--hk-card-border-rgb),0.24)] dark:border-[rgba(var(--hk-card-border-rgb),0.15)]">
                        {friend.image?.url ? (
                          <img src={friend.image.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-[family-name:'Syne',sans-serif] font-extrabold text-[0.6rem] text-[var(--hk-accent-solid)]">
                            {friend.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.95)] dark:text-[rgba(var(--hk-text-rgb),0.7)] group-hover:text-[var(--hk-accent-solid)] transition-colors truncate">
                        {friend.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
            )}
          </aside>

          <main className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Events", value: validRegistrations.length },
                { label: "In a team", value: validRegistrations.filter((r) => r.team?.name).length },
                { label: "Skills", value: (data.skills || []).length },
                { label: "Friends", value: friends.length },
              ].map((t) => (
                <div
                  key={t.label}
                  className="relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px] px-4 py-3"
                >
                  <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-[1.5rem] leading-none text-[var(--hk-text)]">
                    {t.value}
                  </div>
                  <div className="mt-1.5 font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.12em] uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.45)]">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>

            <Card>
              <StreakHeatmap />
            </Card>

            <div role="tablist" className="flex gap-1 border-b border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)]">
              {[
                { id: "overview", label: "Overview" },
                { id: "profile", label: "Profile" },
                { id: "saved", label: `Saved (${likedHackathons.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] tracking-[0.08em] uppercase px-4 py-2.5 -mb-px border-b-2 cursor-pointer transition-colors ${
                    tab === t.id
                      ? "border-[var(--hk-accent-solid)] text-[var(--hk-accent-solid)] font-semibold"
                      : "border-transparent text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)] hover:text-[var(--hk-text)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <>
            <Card>
              <SectionHead>
                <Trophy
                  size={13}
                  className="inline mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]"
                />
                My Events
              </SectionHead>

              {loadingRegistrations ? (
                <div className="flex items-center gap-2 py-2">
                  <RefreshCw
                    size={12}
                    className="animate-spin text-[rgba(var(--hk-accent-rgb),0.7)] dark:text-[rgba(var(--hk-accent-rgb),0.4)]"
                  />
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
                    Loading your events…
                  </p>
                </div>
              ) : registrationsError ? (
                <div className="flex flex-col items-start gap-2 bg-[rgba(var(--hk-red-rgb),0.04)] border border-[rgba(var(--hk-red-rgb),0.15)] rounded-[3px] p-3.5">
                  <div className="flex items-center gap-2 text-[rgba(var(--hk-red-rgb),0.9)]">
                    <AlertCircle size={13} />
                    <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem]">
                      Couldn't load your events. Check your connection and
                      try again.
                    </span>
                  </div>
                  <Btn onClick={fetchMyRegistrations} color="amber">
                    <RefreshCw size={10} /> Retry
                  </Btn>
                </div>
              ) : validRegistrations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {validRegistrations.map((reg, idx) => {
                    const hack = reg.hackathon;
                    const dateVal = reg.registeredAt || reg.createdAt;
                    return (
                      <div
                        key={reg._id || hack._id || idx}
                        className="flex gap-3 bg-[rgba(var(--hk-accent-rgb),0.03)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[3px] p-3 hover:border-[rgba(var(--hk-accent-rgb),0.28)] transition-all"
                      >
                        <div
                          onClick={() => navigate(`/hackathon/${hack.slug}`)}
                          className="flex gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          {hack.image && (
                            <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-[2px] overflow-hidden flex-shrink-0">
                              <img
                                src={
                                  typeof hack.image === "string"
                                    ? hack.image
                                    : hack.image?.url
                                }
                                alt={hack.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[0.82rem] tracking-tight truncate">
                                {hack.title || "Untitled event"}
                              </h4>
                              {reg.status && (
                                <Tag color="amber">{reg.status}</Tag>
                              )}
                            </div>
                            {hack.subTitle && (
                              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] truncate mt-0.5">
                                {hack.subTitle}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-1.5 items-center">
                              {reg.team?.name && (
                                <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] flex items-center gap-1">
                                  <Users size={10} />
                                  {reg.team.name}
                                </span>
                              )}
                              {dateVal && (
                                <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)] flex items-center gap-1">
                                  <Calendar size={10} />
                                  {new Date(dateVal).toLocaleDateString()}
                                </span>
                              )}
                              {hack.startDate && (
                                <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
                                  Starts{" "}
                                  {new Date(hack.startDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-3 py-8 px-4">
                  <div className="w-14 h-14 rounded-full bg-[rgba(var(--hk-accent-rgb),0.06)] border border-[rgba(var(--hk-card-border-rgb),0.29)] dark:border-[rgba(var(--hk-card-border-rgb),0.18)] flex items-center justify-center">
                    <Rocket size={22} className="text-[rgba(var(--hk-accent-rgb),0.9)] dark:text-[rgba(var(--hk-accent-rgb),0.6)]" />
                  </div>
                  <h4 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[1rem] tracking-tight">
                    You haven't joined an event yet
                  </h4>
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] leading-relaxed max-w-xs">
                    Build something real, team up with other developers, and
                    compete for prizes. Your first event is one click
                    away.
                  </p>
                  <Btn onClick={() => navigate("/hackathons")} color="solid">
                    <Trophy size={11} /> Browse Events
                  </Btn>
                </div>
              )}
            </Card>
                <RecentActivity registrations={validRegistrations} />
                <Recommended skills={data.skills || []} registrations={validRegistrations} />
              </>
            )}
            {tab === "profile" && (
              <>
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
                  className="inline mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]"
                />
                Education
              </SectionHead>

              {editEducationIndex === undefined ? (
                data.education?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data.education.map((edu, idx) => (
                      <div
                        key={edu._id || idx}
                        className="bg-[rgba(var(--hk-accent-rgb),0.03)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[3px] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <School
                              size={14}
                              className="text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] flex-shrink-0"
                            />
                            <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[0.88rem] tracking-tight">
                              {edu.institute || "N/A"}
                            </span>
                          </div>
                          {edu.passOutYear && (
                            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)] flex items-center gap-1">
                              <Clock size={10} />
                              {edu.passOutYear}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.45)] mb-3">
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
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
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
                  className="inline mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]"
                />
                Connected Apps
              </SectionHead>

              {editAppsIndex === undefined ? (
                data.connectedApps?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {data.connectedApps.map((app, idx) => (
                      <div
                        key={app._id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-[rgba(var(--hk-accent-rgb),0.03)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[3px] px-4 py-3"
                      >
                        <span className="font-[family-name:'Syne',sans-serif] font-bold text-[var(--hk-text)] text-[0.82rem]">
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
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
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
              </>
            )}
            {tab === "saved" && (
              <>
            <Card>
              <SectionHead>
                <Heart
                  size={13}
                  className="inline mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]"
                />
                Favourites
              </SectionHead>

              {loadingWishlist ? (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
                  Loading…
                </p>
              ) : likedHackathons.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {likedHackathons.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => navigate(`/hackathon/${h.slug}`)}
                      className="flex gap-3 bg-[rgba(var(--hk-accent-rgb),0.03)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[3px] p-3 cursor-pointer hover:border-[rgba(var(--hk-accent-rgb),0.28)] transition-all"
                    >
                      {h.image?.url && (
                        <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-[2px] overflow-hidden flex-shrink-0">
                          <img
                            src={h.image.url}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-[family-name:'Syne',sans-serif] font-extrabold text-[var(--hk-text)] text-[0.82rem] tracking-tight truncate">
                          {h.title}
                        </h4>
                        {h.subTitle && (
                          <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.4)] truncate mt-0.5">
                            {h.subTitle}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                          {h.phases?.length > 0 && (
                            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
                              {new Date(
                                Math.min(...h.phases.map((p) => new Date(p.startDate).getTime()))
                              ).toLocaleDateString()}
                            </span>
                          )}
                          {h.difficulty && <Tag>{h.difficulty}</Tag>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.3)] leading-relaxed">
                  No favourites yet. Click the heart icon on any event to
                  save it here.
                </p>
              )}
            </Card>
              </>
            )}
          </main>
        </div>

        {showEditProfile && (
          <EditProfileModal
            data={data}
            onClose={() => setShowEditProfile(false)}
            onSaved={(updated) => {
              setData(updated);
              login(updated, updated.role || "student");
            }}
          />
        )}
      </div>
    </>
  );
};

export default UserDashboard;
