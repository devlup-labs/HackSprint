import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { API } from "../backendApis/api.js";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  const [status, setStatus] = useState("checking"); 

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setStatus("failed");
      toast.error("Verification failed. Invalid or expired link.");
      return;
    }

    API
      .get(`${backendUrl}/api/account/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        toast.success("Account verified successfully!");
        setTimeout(() => navigate("/account/login"), 2500);
      })
      .catch(() => {
        setStatus("failed");
        toast.error("Verification failed. Invalid or expired link.");
      });
  }, [location, navigate, backendUrl]);

  const states = {
    checking: {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="ve-icon ve-spin">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(95,255,96,0.15)"
            strokeWidth="3"
          />
          <path
            d="M24 4 a20 20 0 0 1 20 20"
            stroke="#5fff60"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ),
      badge: "verifying",
      headline: "Checking your\nlink…",
      sub: "Hang tight while we verify your email address.",
      accent: "#5fff60",
    },
    success: {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="ve-icon">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(95,255,96,0.25)"
            strokeWidth="2"
          />
          <path
            d="M14 24.5 L21 31.5 L34 17"
            stroke="#5fff60"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      badge: "success",
      headline: "Email\nVerified.",
      sub: "Your account is active. Redirecting to login…",
      accent: "#5fff60",
    },
    failed: {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="ve-icon">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(255,80,80,0.25)"
            strokeWidth="2"
          />
          <path
            d="M17 17 L31 31 M31 17 L17 31"
            stroke="#ff5050"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      badge: "failed",
      headline: "Verification\nFailed.",
      sub: "This link is invalid or has expired. Please request a new one.",
      accent: "#ff5050",
    },
  };

  const current = states[status];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .ve-root { font-family: 'JetBrains Mono', monospace; }
        .ve-syne { font-family: 'Syne', sans-serif; }

        .ve-bg::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(95,255,96,.033) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95,255,96,.033) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .ve-bg::after {
          content: ''; position: fixed; z-index: 0; pointer-events: none;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(95,255,96,.07) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }

        .ve-card::before, .ve-card::after {
          content: ''; position: absolute;
          width: 12px; height: 12px; border-style: solid;
          border-color: rgba(95,255,96,.6);
        }
        .ve-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
        .ve-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

        .ve-icon {
          width: 56px; height: 56px;
          filter: drop-shadow(0 0 10px rgba(95,255,96,0.3));
        }

        @keyframes ve-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ve-spin { animation: ve-rotate 1.1s linear infinite; }

        @keyframes ve-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ve-fadein { animation: ve-fadein 0.45s ease forwards; }

        .ve-pulse {
          animation: ve-pulse-kf 2s ease-in-out infinite;
        }
        @keyframes ve-pulse-kf {
          0%, 100% { box-shadow: 0 0 0 0 rgba(95,255,96,0.12); }
          50%       { box-shadow: 0 0 0 8px rgba(95,255,96,0.0); }
        }

        .ve-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 3px;
          padding: 0.6rem 1.4rem;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          border: none;
        }
        .ve-btn:hover { transform: translateY(-1px); }
        .ve-btn:active { transform: translateY(0); }
      `}</style>

      <div className="ve-root ve-bg min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div
          key={status}
          className="ve-card ve-fadein relative z-10 w-full max-w-[400px] bg-[rgba(10,12,10,0.93)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(95,255,96,0.08)] flex flex-col items-center text-center"
        >
          <div
            className="ve-root inline-block text-[0.58rem] tracking-[0.18em] uppercase border px-[0.65rem] py-[0.18rem] rounded-[2px] mb-6"
            style={{
              color: current.accent,
              borderColor: `${current.accent}40`,
            }}
          >
            {current.badge}
          </div>

          <div className="ve-pulse mb-6 rounded-full p-3 border border-[rgba(95,255,96,0.1)]">
            {current.icon}
          </div>

          <h1
            className="ve-syne font-extrabold text-white leading-[1.05] tracking-tight mb-3 whitespace-pre-line"
            style={{ fontSize: "clamp(1.9rem,5vw,2.6rem)" }}
          >
            {current.headline.split("\n")[0]}
            <br />
            <span style={{ color: current.accent }}>
              {current.headline.split("\n")[1]}
            </span>
          </h1>

          <p className="ve-root text-[0.65rem] tracking-[0.05em] text-[rgba(180,220,180,0.45)] leading-relaxed mb-8 max-w-[280px]">
            {current.sub}
          </p>

          {status === "checking" && (
            <div className="w-full h-[2px] bg-[rgba(95,255,96,0.08)] rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#5fff60] rounded-full"
                style={{ animation: "ve-progress 2s ease-in-out infinite" }}
              />
              <style>{`
                @keyframes ve-progress {
                  0%   { width: 0%;   margin-left: 0%; }
                  50%  { width: 60%;  margin-left: 20%; }
                  100% { width: 0%;   margin-left: 100%; }
                }
              `}</style>
            </div>
          )}

          {status === "success" && (
            <button
              className="ve-btn"
              style={{ background: "#5fff60", color: "#0a0a0a" }}
              onClick={() => navigate("/account/login")}
            >
              Go to Login →
            </button>
          )}

          {status === "failed" && (
            <div className="flex flex-col gap-3 w-full">
              <button
                className="ve-btn w-full"
                style={{ background: "#ff5050", color: "#0a0a0a" }}
                onClick={() => navigate("/account/signup")}
              >
                Back to Signup →
              </button>
              <button
                className="ve-btn w-full"
                style={{
                  background: "transparent",
                  color: "rgba(95,255,96,0.5)",
                  border: "1px solid rgba(95,255,96,0.15)",
                }}
                onClick={() => navigate("/account/login")}
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="ve-root mt-8 text-[0.56rem] tracking-[0.06em] text-[rgba(95,255,96,0.35)] text-center">
            HACKSPRINT · ENCRYPTED · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
