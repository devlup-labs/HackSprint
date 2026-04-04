import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { API } from "../backendApis/api";
import { toast } from "react-toastify";

function ForgotPassword() {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post(
        `${backendUrl}/api/account/send-reset-link`,
        { email: email.trim().toLowerCase() }
      );

      if (data.success) {
        toast.success("Reset link has been sent to your email");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .fp-root { font-family: 'JetBrains Mono', monospace; }
        .fp-syne { font-family: 'Syne', sans-serif; }

        .fp-bg::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(95,255,96,.033) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95,255,96,.033) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .fp-bg::after {
          content: ''; position: fixed; z-index: 0; pointer-events: none;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(95,255,96,.07) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }

        .fp-card::before, .fp-card::after {
          content: ''; position: absolute;
          width: 12px; height: 12px; border-style: solid;
          border-color: rgba(95,255,96,.6);
        }
        .fp-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
        .fp-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

        .fp-input {
          width: 100%;
          background: rgba(95,255,96,0.03);
          border: 1px solid rgba(95,255,96,0.15);
          border-radius: 3px;
          padding: 0.55rem 0.75rem;
          color: rgba(220,255,220,0.85);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .fp-input::placeholder { color: rgba(95,255,96,0.22); }
        .fp-input:focus {
          border-color: rgba(95,255,96,0.45);
          box-shadow: 0 0 0 2px rgba(95,255,96,0.06);
        }

        .fp-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(95,255,96,0.45);
          margin-bottom: 0.3rem;
        }

        .fp-btn {
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
        .fp-btn:hover:not(:disabled) { background: #7fff80; transform: translateY(-1px); }
        .fp-btn:active:not(:disabled) { transform: translateY(0); }
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* envelope icon animation */
        @keyframes fp-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .fp-icon { animation: fp-float 3s ease-in-out infinite; }
      `}</style>

      <div className="fp-root fp-bg min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="fp-card relative z-10 w-full max-w-[400px] bg-[rgba(10,12,10,0.93)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(95,255,96,0.08)]">

          <div className="fp-root inline-block text-[0.58rem] tracking-[0.18em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.25)] px-[0.65rem] py-[0.18rem] rounded-[2px] mb-4">
            password reset
          </div>

          <h1
            className="fp-syne font-extrabold text-white leading-[1.05] tracking-tight mb-1"
            style={{ fontSize: "clamp(1.8rem,5vw,2.5rem)" }}
          >
            Forgot
            <br />
            <span className="text-[#5fff60]">Password?</span>
          </h1>
          <p className="fp-root text-[0.62rem] tracking-[0.06em] text-[rgba(95,255,96,0.38)] mb-8 leading-relaxed">
            Enter your email and we'll send you a secure reset link.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="fp-email" className="fp-label">Email address</label>
                <input
                  id="fp-email"
                  className="fp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  spellCheck={false}
                />
              </div>

              <button type="submit" className="fp-btn mt-1" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(95,255,96,0.08)]" />
          </div>

          <div className="flex flex-col gap-2 text-center">
            <p className="fp-root text-[0.65rem] tracking-[0.04em] text-[rgba(180,220,180,0.4)]">
              Remember your password?{" "}
              <Link
                to="/account/login"
                className="text-[#5fff60] hover:text-[#7fff80] transition-colors underline underline-offset-2"
              >
                Login
              </Link>
            </p>
            <p className="fp-root text-[0.65rem] tracking-[0.04em] text-[rgba(180,220,180,0.4)]">
              Don't have an account?{" "}
              <Link
                to="/account/signup"
                className="text-[#5fff60] hover:text-[#7fff80] transition-colors underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>

          <p className="fp-root mt-6 text-[0.56rem] tracking-[0.06em] text-[rgba(95,255,96,0.35)] text-center">
            HACKSPRINT · ENCRYPTED · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
