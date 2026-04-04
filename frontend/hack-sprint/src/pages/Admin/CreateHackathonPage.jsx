import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UploadCloud,
  ArrowLeft,
  Plus,
  X,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { getAdminDetails, createHackathon } from "../../backendApis/api";

/* ================= GLOBAL STYLES ================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

    .ch-root {
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Background ── */
    .ch-bg {
      position: fixed;
      inset: 0;
      background: #0a0a0a;
      z-index: 0;
    }
    .ch-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(95,255,96,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(95,255,96,0.035) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .ch-bg::after {
      content: '';
      position: absolute;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(95,255,96,0.055) 0%, transparent 65%);
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }

    /* ── Card / Section panels ── */
    .ch-card {
      position: relative;
      background: rgba(10,12,10,0.88);
      border: 1px solid rgba(95,255,96,0.14);
      border-radius: 4px;
      padding: 2rem 2rem;
      backdrop-filter: blur(14px);
      box-shadow: 0 0 30px rgba(95,255,96,0.05), inset 0 0 40px rgba(0,0,0,0.3);
    }
    .ch-card::before, .ch-card::after {
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      border-color: rgba(95,255,96,0.6);
      border-style: solid;
    }
    .ch-card::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
    .ch-card::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

    /* ── Section heading ── */
    .ch-section-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.6rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #5fff60;
      border: 1px solid rgba(95,255,96,0.25);
      padding: 0.2rem 0.65rem;
      border-radius: 2px;
      margin-bottom: 0.6rem;
    }
    .ch-section-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      margin-bottom: 1.5rem;
    }

    /* ── Inputs ── */
    .ch-input {
      width: 100%;
      background: rgba(20,22,20,0.7);
      border: 1px solid rgba(95,255,96,0.12);
      border-radius: 3px;
      padding: 0.6rem 0.85rem;
      color: #e8ffe8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .ch-input::placeholder { color: rgba(120,160,120,0.45); }
    .ch-input:focus {
      border-color: rgba(95,255,96,0.45);
      box-shadow: 0 0 0 2px rgba(95,255,96,0.06);
    }
    select.ch-input option { background: #111; color: #e8ffe8; }

    /* ── Label ── */
    .ch-label {
      display: block;
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(95,255,96,0.65);
      margin-bottom: 0.4rem;
    }

    /* ── Tag chip ── */
    .ch-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(95,255,96,0.08);
      border: 1px solid rgba(95,255,96,0.22);
      color: #9effa0;
      font-size: 0.7rem;
      padding: 0.2rem 0.6rem;
      border-radius: 2px;
      font-family: 'JetBrains Mono', monospace;
    }
    .ch-chip-remove {
      color: rgba(95,255,96,0.5);
      cursor: pointer;
      transition: color 0.15s;
      line-height: 1;
    }
    .ch-chip-remove:hover { color: #ff6060; }

    /* ── Add button (small) ── */
    .ch-btn-add {
      background: rgba(95,255,96,0.08);
      border: 1px solid rgba(95,255,96,0.2);
      color: #5fff60;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      padding: 0.45rem 0.85rem;
      border-radius: 3px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.15s, border-color 0.15s;
      flex-shrink: 0;
    }
    .ch-btn-add:hover {
      background: rgba(95,255,96,0.14);
      border-color: rgba(95,255,96,0.38);
    }

    /* ── Add block button (full-width) ── */
    .ch-btn-add-full {
      width: 100%;
      background: rgba(95,255,96,0.06);
      border: 1px dashed rgba(95,255,96,0.2);
      color: rgba(95,255,96,0.6);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.6rem;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.15s;
    }
    .ch-btn-add-full:hover {
      background: rgba(95,255,96,0.1);
      color: #5fff60;
      border-color: rgba(95,255,96,0.35);
    }

    /* ── FAQ / reward item ── */
    .ch-list-item {
      background: rgba(95,255,96,0.04);
      border: 1px solid rgba(95,255,96,0.1);
      border-radius: 3px;
      padding: 0.7rem 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .ch-list-item-remove {
      color: rgba(255,80,80,0.5);
      cursor: pointer;
      transition: color 0.15s;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .ch-list-item-remove:hover { color: #ff6060; }

    /* ── Total prize badge ── */
    .ch-prize-total {
      background: rgba(95,255,96,0.07);
      border: 1px solid rgba(95,255,96,0.2);
      border-radius: 3px;
      padding: 0.45rem 0.85rem;
      font-size: 0.72rem;
      color: #5fff60;
      letter-spacing: 0.06em;
    }

    /* ── Drop zone ── */
    .ch-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      height: 9rem;
      border: 1px dashed rgba(95,255,96,0.22);
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
      background: rgba(95,255,96,0.03);
    }
    .ch-dropzone:hover, .ch-dropzone--active {
      border-color: rgba(95,255,96,0.5);
      background: rgba(95,255,96,0.07);
    }

    /* ── Submit button ── */
    .ch-btn-submit {
      position: relative;
      background: #5fff60;
      color: #050905;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.75rem 2.5rem;
      border-radius: 3px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      box-shadow: 0 0 20px rgba(95,255,96,0.25);
    }
    .ch-btn-submit:hover {
      background: #7fff80;
      box-shadow: 0 0 30px rgba(95,255,96,0.4);
      transform: translateY(-1px);
    }
    .ch-btn-submit:disabled {
      background: rgba(95,255,96,0.2);
      color: rgba(95,255,96,0.4);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    /* ── Divider ── */
    .ch-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(95,255,96,0.15), transparent);
      margin: 0.75rem 0;
    }

    /* ── Back link ── */
    .ch-back {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(95,255,96,0.55);
      text-decoration: none;
      transition: color 0.15s;
      margin-bottom: 1.5rem;
    }
    .ch-back:hover { color: #5fff60; }
    .ch-back svg { transition: transform 0.15s; }
    .ch-back:hover svg { transform: translateX(-3px); }

    /* ── Page title ── */
    .ch-page-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin-bottom: 0.4rem;
    }
    .ch-page-title span { color: #5fff60; }
    .ch-page-sub {
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      color: rgba(95,255,96,0.4);
      text-transform: uppercase;
    }

    /* spin anim */
    @keyframes ch-spin {
      to { transform: rotate(360deg); }
    }
    .ch-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(5,9,5,0.3);
      border-top-color: #050905;
      border-radius: 50%;
      animation: ch-spin 0.7s linear infinite;
    }

    /* image preview overlay */
    .ch-img-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      border-radius: 3px;
    }
    .ch-img-wrap:hover .ch-img-overlay { opacity: 1; }
    .ch-img-overlay-btn {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.7rem;
      border-radius: 2px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border: 1px solid;
      transition: background 0.15s;
    }
    .ch-img-overlay-btn--replace {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
      color: #fff;
    }
    .ch-img-overlay-btn--replace:hover { background: rgba(255,255,255,0.18); }
    .ch-img-overlay-btn--remove {
      background: rgba(255,60,60,0.15);
      border-color: rgba(255,60,60,0.3);
      color: #ff9090;
    }
    .ch-img-overlay-btn--remove:hover { background: rgba(255,60,60,0.25); }
  `}</style>
);

/* ================= BACKGROUND ================= */
const GridBackground = () => <div className="ch-bg" />;

/* ================= IMAGE DROP ZONE ================= */
const ImageDropZone = ({
  preview,
  onFileSelect,
  onClear,
  label = "Upload Image",
  accept = "image/*",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div>
      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`ch-dropzone${isDragging ? " ch-dropzone--active" : ""}`}
        >
          <UploadCloud
            size={22}
            style={{ color: isDragging ? "#5fff60" : "rgba(95,255,96,0.35)" }}
          />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: isDragging ? "#5fff60" : "rgba(95,255,96,0.55)",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: "0.62rem",
                color: "rgba(95,255,96,0.25)",
                marginTop: "0.2rem",
                letterSpacing: "0.06em",
              }}
            >
              DRAG & DROP · CLICK TO BROWSE · MAX 5MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={accept}
            onChange={(e) =>
              e.target.files[0] && onFileSelect(e.target.files[0])
            }
          />
        </div>
      ) : (
        <div
          className="ch-img-wrap"
          style={{
            position: "relative",
            width: "100%",
            height: "9rem",
            borderRadius: "3px",
            overflow: "hidden",
            border: "1px solid rgba(95,255,96,0.18)",
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div className="ch-img-overlay">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ch-img-overlay-btn ch-img-overlay-btn--replace"
            >
              <ImagePlus size={12} /> Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="ch-img-overlay-btn ch-img-overlay-btn--remove"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={accept}
            onChange={(e) =>
              e.target.files[0] && onFileSelect(e.target.files[0])
            }
          />
        </div>
      )}
    </div>
  );
};

/* ================= DYNAMIC LIST INPUT ================= */
const DynamicListInput = ({ label, placeholder, values, onUpdate }) => {
  const [currentValue, setCurrentValue] = useState("");

  const handleAdd = () => {
    if (currentValue.trim() && !values.includes(currentValue.trim())) {
      onUpdate([...values, currentValue.trim()]);
      setCurrentValue("");
    }
  };

  return (
    <div>
      <label className="ch-label">{label}</label>
      {values.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginBottom: "0.6rem",
          }}
        >
          {values.map((item, index) => (
            <div key={index} className="ch-chip">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onUpdate(values.filter((_, i) => i !== index))}
                className="ch-chip-remove"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="ch-input"
        />
        <button type="button" onClick={handleAdd} className="ch-btn-add">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

/* ================= DYNAMIC FAQ INPUT ================= */
const DynamicFaqInput = ({ values, onUpdate }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAdd = () => {
    if (question.trim() && answer.trim()) {
      onUpdate([
        ...values,
        { question: question.trim(), answer: answer.trim() },
      ]);
      setQuestion("");
      setAnswer("");
    }
  };

  return (
    <div>
      <label className="ch-label">FAQs</label>
      {values.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          {values.map((faq, index) => (
            <div key={index} className="ch-list-item">
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#e8ffe8",
                    fontWeight: 600,
                    marginBottom: "0.2rem",
                  }}
                >
                  {faq.question}
                </p>
                <p
                  style={{ fontSize: "0.7rem", color: "rgba(95,255,96,0.45)" }}
                >
                  {faq.answer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdate(values.filter((_, i) => i !== index))}
                className="ch-list-item-remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="ch-divider" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginTop: "0.75rem",
        }}
      >
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="ch-input"
        />
        <textarea
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows="2"
          className="ch-input"
          style={{ resize: "none" }}
        />
        <button type="button" onClick={handleAdd} className="ch-btn-add-full">
          <Plus size={13} /> Add FAQ
        </button>
      </div>
    </div>
  );
};

/* ================= DYNAMIC REWARD INPUT ================= */
const DynamicRewardInput = ({ values, onUpdate }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (description.trim() && amount && Number(amount) > 0) {
      onUpdate([
        ...values,
        { description: description.trim(), amount: Number(amount) },
      ]);
      setDescription("");
      setAmount("");
    }
  };

  const totalPrize = values.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <label className="ch-label">Rewards</label>
      {values.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          {values.map((reward, index) => (
            <div key={index} className="ch-list-item">
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#e8ffe8",
                    fontWeight: 600,
                    marginBottom: "0.2rem",
                  }}
                >
                  {reward.description}
                </p>
                <p style={{ fontSize: "0.7rem", color: "#5fff60" }}>
                  ₹{reward.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdate(values.filter((_, i) => i !== index))}
                className="ch-list-item-remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {values.length > 0 && (
        <div className="ch-prize-total" style={{ marginBottom: "0.75rem" }}>
          TOTAL PRIZE POOL — ₹{totalPrize.toLocaleString("en-IN")}
        </div>
      )}
      <div className="ch-divider" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginTop: "0.75rem",
        }}
      >
        <input
          type="text"
          placeholder="Reward description (e.g. 1st Place)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="ch-input"
        />
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="ch-input"
        />
        <button type="button" onClick={handleAdd} className="ch-btn-add-full">
          <Plus size={13} /> Add Reward
        </button>
      </div>
    </div>
  );
};

const DynamicContactInput = ({ values, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (title.trim() && value.trim()) {
      onUpdate([...values, { title: title.trim(), value: value.trim() }]);
      setTitle("");
      setValue("");
    }
  };

  return (
    <div>
      <label className="ch-label">Contact Information</label>

      {values.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {values.map((item, index) => (
            <div key={index} className="ch-list-item">
              <div style={{ flex: 1 }}>
                <p className="text-[0.75rem] text-white font-semibold">
                  {item.title}
                </p>
                <p className="text-[0.7rem] text-[rgba(95,255,96,0.5)] break-all">
                  {item.value}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onUpdate(values.filter((_, i) => i !== index))}
                className="ch-list-item-remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="ch-divider" />

      <div className="flex flex-col gap-2 mt-3">
        <input
          type="text"
          placeholder="Title (e.g. Email, Phone, Discord)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="ch-input"
        />

        <input
          type="text"
          placeholder="Value (e.g. abc@gmail.com / link / number)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="ch-input"
        />

        <button type="button" onClick={handleAdd} className="ch-btn-add-full">
          <Plus size={13} /> Add Contact
        </button>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */
const toISOString = (datetimeLocalValue) => {
  if (!datetimeLocalValue) return null;
  const d = new Date(datetimeLocalValue);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

const debugFormData = (fd) => {
  if (import.meta.env.DEV) {
    console.group("[FormData entries]");
    for (const [key, value] of fd.entries()) {
      // console.log(
      //   key,
      //   "→",
      //   value instanceof File ? `File(${value.name}, ${value.size}B)` : value
      // );
    }
    console.groupEnd();
  }
};

/* ================= SECTION WRAPPER ================= */
const Section = ({ badge, title, children }) => (
  <div className="ch-card" style={{ marginBottom: "1.5rem" }}>
    <div className="ch-section-badge">{badge}</div>
    <div className="ch-section-title">{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {children}
    </div>
  </div>
);

/* ================= MAIN PAGE ================= */
const CreateHackathonPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    description: "",
    overview: "",
    startDate: "",
    endDate: "",
    submissionStartDate: "",
    submissionEndDate: "",
    rewards: [],
    difficulty: "Beginner",
    techStackUsed: [],
    category: [],
    themes: [],
    problems: [],
    contact: [],
    TandCforHackathon: [],
    evaluationCriteria: [],
    projectSubmission: [],
    FAQs: [],
    refMaterial: [],
    aboutUs: "",
  });

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await getAdminDetails();
        const admin = res.data.admin;
        // console.log("[Admin Data]", admin);
        setAdminData(admin);
      } catch {
        toast.error("You must be logged in to create a hackathon.");
        navigate("/adminlogin");
      }
    };
    fetchAdmin();
  }, [navigate]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBannerSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid image format.");
      return;
    }
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBannerClear = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminData) {
      toast.error("Admin details not found. Please log in again.");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Hackathon title is required.");
      return;
    }
    const dateFields = [
      "startDate",
      "endDate",
      "submissionStartDate",
      "submissionEndDate",
    ];
    for (const field of dateFields) {
      if (formData[field] && isNaN(new Date(formData[field]).getTime())) {
        toast.error(`Invalid date for "${field}". Please re-select.`);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      [
        "title",
        "subTitle",
        "description",
        "overview",
        "difficulty",
        "aboutUs",
      ].forEach((field) => {
        if (formData[field] !== "" && formData[field] !== undefined)
          fd.append(field, formData[field]);
      });
      dateFields.forEach((field) => {
        const iso = toISOString(formData[field]);
        if (iso) fd.append(field, iso);
      });
      [
        "techStackUsed",
        "category",
        "themes",
        "problems",
        "refMaterial",
        "TandCforHackathon",
        "evaluationCriteria",
        "projectSubmission",
      ].forEach((field) =>
        fd.append(field, JSON.stringify(formData[field] || []))
      );
      fd.append("FAQs", JSON.stringify(formData.FAQs || []));
      const validRewards = (formData.rewards || []).filter(
        (r) =>
          r && r.description && typeof r.amount === "number" && r.amount > 0
      );
      fd.append("rewards", JSON.stringify(validRewards));
      fd.append("contact", JSON.stringify(formData.contact || []));
      const adminId = adminData._id ?? adminData.id ?? null;
      if (!adminId) {
        toast.error("Admin ID missing — please log out and log in again.");
        setIsSubmitting(false);
        return;
      }
      // console.log(
      //   "[Admin ID being sent]",
      //   adminId,
      //   "| Full adminData keys:",
      //   Object.keys(adminData)
      // );
      fd.append("adminId", String(adminId));
      if (bannerFile) fd.append("image", bannerFile);
      debugFormData(fd);
      const res = await createHackathon(fd);
      toast.success("Hackathon submitted for approval!");
      const createdHackathon =
        res.data?.hackathon ?? res.data?.pendingHackathon ?? null;
      const hackathonId = createdHackathon?._id;
      navigate("/admin");
    } catch (err) {
      console.error("[CreateHackathon] Submit error:", err);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create hackathon."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="ch-root"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      <GlobalStyles />
      <GridBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "860px",
          margin: "0 auto",
          padding: "clamp(1.5rem, 4vw, 3rem) 1.25rem 4rem",
        }}
      >
        {/* ── Header ── */}
        <header style={{ marginBottom: "2.5rem", paddingTop: "1rem" }}>
          <Link to="/admin" className="ch-back">
            <ArrowLeft size={13} /> Back to Dashboard
          </Link>
          <h1 className="ch-page-title">
            Create a<br />
            <span>Hackathon.</span>
          </h1>
          <p className="ch-page-sub">
            Fill in the details to launch your event
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* ── Basic Information ── */}
          <Section badge="01 / basics" title="Basic Information">
            <input
              type="text"
              name="title"
              placeholder="Hackathon Title *"
              value={formData.title}
              onChange={handleChange}
              required
              className="ch-input"
            />
            <input
              type="text"
              name="subTitle"
              placeholder="Subtitle / Tagline"
              value={formData.subTitle}
              onChange={handleChange}
              className="ch-input"
            />
            <textarea
              name="description"
              placeholder="Short Description (for cards) *"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              className="ch-input"
              style={{ resize: "none" }}
            />
            <textarea
              name="overview"
              placeholder="Detailed Overview"
              value={formData.overview}
              onChange={handleChange}
              rows="5"
              className="ch-input"
              style={{ resize: "none" }}
            />
            <div>
              <label className="ch-label">Banner Image</label>
              <ImageDropZone
                preview={bannerPreview}
                onFileSelect={handleBannerSelect}
                onClear={handleBannerClear}
                label="Upload Banner Image"
              />
            </div>
          </Section>

          {/* ── Event Details ── */}
          <Section badge="02 / details" title="Event Details">
            <DynamicRewardInput
              values={formData.rewards}
              onUpdate={(v) => setFormData((p) => ({ ...p, rewards: v }))}
            />
            <div>
              <label className="ch-label">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="ch-input"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
            </div>
            <DynamicListInput
              label="Tech Stack"
              placeholder="e.g., React"
              values={formData.techStackUsed}
              onUpdate={(v) => setFormData((p) => ({ ...p, techStackUsed: v }))}
            />
            <DynamicListInput
              label="Categories"
              placeholder="e.g., AI"
              values={formData.category}
              onUpdate={(v) => setFormData((p) => ({ ...p, category: v }))}
            />
            <DynamicListInput
              label="Themes"
              placeholder="e.g., Sustainability"
              values={formData.themes}
              onUpdate={(v) => setFormData((p) => ({ ...p, themes: v }))}
            />
          </Section>

          {/* ── Rules & Other Details ── */}
          <Section badge="03 / rules" title="Rules & Other Details">
            <DynamicListInput
              label="Problem Statements"
              placeholder="Add a problem statement"
              values={formData.problems}
              onUpdate={(v) => setFormData((p) => ({ ...p, problems: v }))}
            />
            <DynamicListInput
              label="Terms & Conditions"
              placeholder="Add a term/condition"
              values={formData.TandCforHackathon}
              onUpdate={(v) =>
                setFormData((p) => ({ ...p, TandCforHackathon: v }))
              }
            />
            <DynamicListInput
              label="Evaluation Criteria"
              placeholder="Add a criterion"
              values={formData.evaluationCriteria}
              onUpdate={(v) =>
                setFormData((p) => ({ ...p, evaluationCriteria: v }))
              }
            />
            <DynamicListInput
              label="Project Submission Guidelines"
              placeholder="Add a guideline"
              values={formData.projectSubmission}
              onUpdate={(v) =>
                setFormData((p) => ({ ...p, projectSubmission: v }))
              }
            />
          </Section>

          {/* ── Additional Content ── */}
          <Section badge="04 / content" title="Additional Content">
            <DynamicListInput
              label="Reference Material URLs"
              placeholder="https://…"
              values={formData.refMaterial}
              onUpdate={(v) => setFormData((p) => ({ ...p, refMaterial: v }))}
            />
            <textarea
              name="aboutUs"
              placeholder="About the Organizer"
              value={formData.aboutUs}
              onChange={handleChange}
              rows="4"
              className="ch-input"
              style={{ resize: "none" }}
            />
            <DynamicFaqInput
              values={formData.FAQs}
              onUpdate={(v) => setFormData((p) => ({ ...p, FAQs: v }))}
            />
          </Section>

          <Section badge="06 / contact" title="Contact Information">
            <DynamicContactInput
              values={formData.contact}
              onUpdate={(v) => setFormData((p) => ({ ...p, contact: v }))}
            />
          </Section>

          {/* ── Timeline ── */}
          <Section badge="05 / timeline" title="Timeline">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                {
                  label: "Registration Start Date *",
                  name: "startDate",
                  required: true,
                },
                {
                  label: "Registration End Date *",
                  name: "endDate",
                  required: true,
                },
                {
                  label: "Submission Start Date *",
                  name: "submissionStartDate",
                  required: true,
                },
                {
                  label: "Submission End Date *",
                  name: "submissionEndDate",
                  required: true,
                },
              ].map(({ label, name, required }) => (
                <div key={name}>
                  <label className="ch-label">{label}</label>
                  <input
                    type="datetime-local"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    className="ch-input"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* ── Submit ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "0.5rem",
            }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="ch-btn-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="ch-spinner" /> Submitting...
                </>
              ) : (
                "Submit for Approval"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHackathonPage;
