import React, { useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import { API } from "../backendApis/api";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function ResetPassword() {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.error("New password is required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post(
        `${backendUrl}/api/account/reset-password`,
        { token, newPassword }
      );

      if (data.success) {
        toast.success(data.message || "Password updated successfully");
        navigate("/account/login");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
          .rp-root { font-family: 'JetBrains Mono', monospace; }
          .rp-syne { font-family: 'Syne', sans-serif; }
          .rp-bg::before {
            content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image:
              linear-gradient(rgba(95,255,96,.033) 1px, transparent 1px),
              linear-gradient(90deg, rgba(95,255,96,.033) 1px, transparent 1px);
            background-size: 40px 40px;
          }
          .rp-bg::after {
            content: ''; position: fixed; z-index: 0; pointer-events: none;
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(95,255,96,.07) 0%, transparent 70%);
            top: 50%; left: 50%; transform: translate(-50%, -50%);
          }
          .rp-card::before, .rp-card::after {
            content: ''; position: absolute;
            width: 12px; height: 12px; border-style: solid;
            border-color: rgba(255,80,80,.6);
          }
          .rp-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
          .rp-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
        `}</style>
        <div className="rp-root rp-bg min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
          <div className="rp-card relative z-10 w-full max-w-[400px] bg-[rgba(10,12,10,0.93)] border border-[rgba(255,80,80,0.2)] rounded-[4px] p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(255,80,80,0.07)] flex flex-col items-center text-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ff5050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-5" style={{ filter: "drop-shadow(0 0 8px rgba(255,80,80,0.4))" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div className="rp-root inline-block text-[0.58rem] tracking-[0.18em] uppercase text-[#ff5050] border border-[rgba(255,80,80,0.25)] px-[0.65rem] py-[0.18rem] rounded-[2px] mb-4">
              invalid link
            </div>
            <h1 className="rp-syne font-extrabold text-white text-[2rem] leading-[1.05] mb-2">
              Link <span className="text-[#ff5050]">Expired.</span>
            </h1>
            <p className="rp-root text-[0.63rem] tracking-[0.05em] text-[rgba(180,220,180,0.4)] mb-6 leading-relaxed">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/account/forgot-password"
              className="rp-root text-[0.68rem] font-semibold tracking-[0.12em] uppercase bg-[#ff5050] text-[#0a0a0a] px-5 py-[0.6rem] rounded-[3px] hover:bg-[#ff7070] transition-all"
            >
              Request New Link →
            </Link>
            <p className="rp-root mt-6 text-[0.56rem] tracking-[0.06em] text-[rgba(95,255,96,0.35)] text-center">
              HACKSPRINT · ENCRYPTED · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .rp-root { font-family: 'JetBrains Mono', monospace; }
        .rp-syne { font-family: 'Syne', sans-serif; }
        .rp-bg::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(95,255,96,.033) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95,255,96,.033) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .rp-bg::after {
          content: ''; position: fixed; z-index: 0; pointer-events: none;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(95,255,96,.07) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .rp-card::before, .rp-card::after {
          content: ''; position: absolute;
          width: 12px; height: 12px; border-style: solid;
          border-color: rgba(95,255,96,.6);
        }
        .rp-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
        .rp-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

        .rp-input {
          width: 100%;
          background: rgba(95,255,96,0.03);
          border: 1px solid rgba(95,255,96,0.15);
          border-radius: 3px;
          padding: 0.55rem 2.2rem 0.55rem 0.75rem;
          color: rgba(220,255,220,0.85);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rp-input::placeholder { color: rgba(95,255,96,0.22); }
        .rp-input:focus {
          border-color: rgba(95,255,96,0.45);
          box-shadow: 0 0 0 2px rgba(95,255,96,0.06);
        }

        .rp-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(95,255,96,0.45);
          margin-bottom: 0.3rem;
        }

        .rp-btn {
          width: 100%;
          background: #5fff60;
          color: #0a0a0a;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          border-radius: 3px;
          padding: 0.65rem 1rem;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
        }
        .rp-btn:hover:not(:disabled) { background: #7fff80; transform: translateY(-1px); }
        .rp-btn:active:not(:disabled) { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rp-eye {
          position: absolute;
          right: 0.65rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: rgba(95,255,96,0.35);
          display: flex;
          align-items: center;
          transition: color 0.18s;
        }
        .rp-eye:hover { color: rgba(95,255,96,0.7); }

        @keyframes rp-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .rp-icon { animation: rp-float 3s ease-in-out infinite; }
      `}</style>

      <div className="rp-root rp-bg min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="rp-card relative z-10 w-full max-w-[400px] bg-[rgba(10,12,10,0.93)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(95,255,96,0.08)]">

          <div className="rp-root inline-block text-[0.58rem] tracking-[0.18em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.25)] px-[0.65rem] py-[0.18rem] rounded-[2px] mb-4">
            set new password
          </div>

          <h1
            className="rp-syne font-extrabold text-white leading-[1.05] tracking-tight mb-1"
            style={{ fontSize: "clamp(1.8rem,5vw,2.5rem)" }}
          >
            Reset
            <br />
            <span className="text-[#5fff60]">Password.</span>
          </h1>
          <p className="rp-root text-[0.62rem] tracking-[0.06em] text-[rgba(95,255,96,0.38)] mb-8 leading-relaxed">
            Choose a strong new password for your account.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">

              <div>
                <label htmlFor="rp-new" className="rp-label">New password</label>
                <div className="relative">
                  <input
                    id="rp-new"
                    className="rp-input"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowNew(v => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                    {showNew ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="rp-confirm" className="rp-label">Confirm password</label>
                <div className="relative">
                  <input
                    id="rp-confirm"
                    className="rp-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} aria-label="Toggle confirm password visibility">
                    {showConfirm ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className="rp-root text-[0.56rem] tracking-[0.08em] mt-1"
                    style={{ color: newPassword === confirmPassword ? "rgba(95,255,96,0.6)" : "rgba(255,80,80,0.7)" }}
                  >
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <button type="submit" className="rp-btn mt-1" disabled={loading}>
                {loading ? "Updating..." : "Update Password →"}
              </button>
            </div>
          </form>

          <p className="rp-root mt-6 text-[0.65rem] tracking-[0.04em] text-[rgba(180,220,180,0.4)] text-center">
            Remember it now?{" "}
            <Link
              to="/account/login"
              className="text-[#5fff60] hover:text-[#7fff80] transition-colors underline underline-offset-2"
            >
              Login
            </Link>
          </p>

          <p className="rp-root mt-5 text-[0.56rem] tracking-[0.06em] text-[rgba(95,255,96,0.35)] text-center">
            HACKSPRINT · ENCRYPTED · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;