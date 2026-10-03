import React from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminGoogleLogin from "../../components/auth/AdminGoogleAuth";

import "../Styles/AllHackathons.css";
const GoogleAuthWrapper = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AdminGoogleLogin />
  </GoogleOAuthProvider>
);

function AdminSignup() {
  return (
    <div className="admin-login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

        .admin-login-root {
          min-height: 100vh;
          background: var(--hk-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          overflow: hidden;
          position: relative;
        }

        .admin-login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(var(--hk-accent-rgb),0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--hk-accent-rgb),0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .admin-login-root::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(var(--hk-accent-rgb),0.07) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          margin: 1rem;
          padding: 2.5rem 2rem;
          border: 1px solid rgba(var(--hk-accent-rgb),0.18);
          border-radius: 4px;
          background: rgba(var(--hk-card-bg),0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 0 40px rgba(var(--hk-accent-rgb),0.08), inset 0 0 40px rgba(var(--hk-accent-rgb),0.03);
        }

        .card::before, .card::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: var(--hk-accent-solid);
          border-style: solid;
        }
        .card::before {
          top: -1px; left: -1px;
          border-width: 2px 0 0 2px;
        }
        .card::after {
          bottom: -1px; right: -1px;
          border-width: 0 2px 2px 0;
        }

        .badge {
          display: inline-block;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--hk-accent-solid);
          border: 1px solid rgba(var(--hk-accent-rgb),0.3);
          padding: 0.2rem 0.6rem;
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--hk-text);
          line-height: 1.1;
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }

        .title span {
          color: var(--hk-accent-solid);
        }

        .subtitle {
          font-size: 0.7rem;
          color: rgba(var(--hk-text-rgb),calc(0.6 + var(--hk-fade-boost)));
          letter-spacing: 0.05em;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(var(--hk-accent-rgb),0.2), transparent);
          margin-bottom: 2rem;
        }

        .footer-note {
          margin-top: 1.8rem;
          font-size: 0.62rem;
          color: rgba(var(--hk-text-rgb),calc(0.45 + var(--hk-fade-boost)));
          text-align: center;
          letter-spacing: 0.08em;
        }

        .footer-note a {
          color: rgba(var(--hk-accent-rgb),calc(0.6 + var(--hk-fade-boost)));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .footer-note a:hover {
          color: var(--hk-accent-solid);
        }
      `}</style>

      <div className="card">
        <div className="badge">organizer signup</div>

        <h1 className="title">
          Create your
          <br />
          <span>Organizer account.</span>
        </h1>
        <p className="subtitle">
          There's no separate signup form — signing in with Google below
          creates your organizer account automatically on first use.
        </p>

        <div className="divider" />

        <GoogleAuthWrapper />

        <p className="footer-note">
          Already have an account? <Link to="/adminlogin">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminSignup;
