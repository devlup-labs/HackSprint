import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from "../../components/GoogleLogin.jsx";
import { API } from "../../backendApis/api.js";
import { toast } from "react-toastify";

const GoogleAuthWrapper = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <GoogleLogin />
  </GoogleOAuthProvider>
);

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

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "success") {
      toast.success("Email verified successfully, please login");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/account/login`,
        { email: email.trim().toLowerCase(), password }
      );

      localStorage.setItem("token", res.data.token);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .lg-root { font-family: 'JetBrains Mono', monospace; }
        .lg-syne { font-family: 'Syne', sans-serif; }
        .lg-bg::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(95,255,96,.033) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95,255,96,.033) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .lg-bg::after {
          content: ''; position: fixed; z-index: 0; pointer-events: none;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(95,255,96,.07) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .lg-card::before, .lg-card::after {
          content: ''; position: absolute;
          width: 12px; height: 12px; border-style: solid;
          border-color: rgba(95,255,96,.6);
        }
        .lg-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
        .lg-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

        .lg-input {
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
        .lg-input::placeholder { color: rgba(95,255,96,0.22); }
        .lg-input:focus {
          border-color: rgba(95,255,96,0.45);
          box-shadow: 0 0 0 2px rgba(95,255,96,0.06);
        }

        .lg-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(95,255,96,0.45);
          margin-bottom: 0.3rem;
        }

        .lg-btn {
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
          transition: background 0.18s, opacity 0.18s, transform 0.12s;
        }
        .lg-btn:hover:not(:disabled) { background: #7fff80; transform: translateY(-1px); }
        .lg-btn:active:not(:disabled) { transform: translateY(0); }
        .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .lg-eye {
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
        .lg-eye:hover { color: rgba(95,255,96,0.7); }
      `}</style>

      <div className="lg-root lg-bg min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="lg-card relative z-10 w-full max-w-[400px] bg-[rgba(10,12,10,0.93)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(95,255,96,0.08)]">

          <div className="lg-root inline-block text-[0.58rem] tracking-[0.18em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.25)] px-[0.65rem] py-[0.18rem] rounded-[2px] mb-4">
            secure access
          </div>

          <h1
            className="lg-syne font-extrabold text-white leading-[1.05] tracking-tight mb-1"
            style={{ fontSize: "clamp(1.8rem,5vw,2.5rem)" }}
          >
            Student
            <br />
            <span className="text-[#5fff60]">Login.</span>
          </h1>
          <p className="lg-root text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.38)] mb-8">
            authorized students only
          </p>

          <GoogleAuthWrapper />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(95,255,96,0.1)]" />
            <span className="lg-root text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.3)]">
              or
            </span>
            <div className="flex-1 h-px bg-[rgba(95,255,96,0.1)]" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="login-email" className="lg-label">Email</label>
                <input
                  id="login-email"
                  className="lg-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  spellCheck={false}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-[0.3rem]">
                  <label htmlFor="login-password" className="lg-label" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <Link
                    to="/account/forgot-password"
                    className="lg-root text-[0.56rem] tracking-[0.08em] text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    className="lg-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: "2.2rem" }}
                  />
                  <button
                    type="button"
                    className="lg-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lg-btn mt-1" disabled={loading}>
                {loading ? "Logging in..." : "Login →"}
              </button>
            </div>
          </form>

          <p className="lg-root mt-6 text-[0.65rem] tracking-[0.04em] text-[rgba(180,220,180,0.4)] text-center">
            Don't have an account?{" "}
            <Link
              to="/account/signup"
              className="text-[#5fff60] hover:text-[#7fff80] transition-colors underline underline-offset-2"
            >
              Sign up
            </Link>
          </p>

          <p className="lg-root mt-5 text-[0.56rem] tracking-[0.06em] text-[rgba(95,255,96,0.6)] text-center">
            HACKSPRINT · ENCRYPTED · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;