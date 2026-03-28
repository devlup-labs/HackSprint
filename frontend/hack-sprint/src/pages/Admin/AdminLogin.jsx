import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminGoogleLogin from "../../components/Admin/AdminGoogleAuth";

const GoogleAuthWrapper = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AdminGoogleLogin />
  </GoogleOAuthProvider>
);

function AdminLogin() {
  return (
    <div className="admin-login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

        .admin-login-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          overflow: hidden;
          position: relative;
        }

        /* subtle grid bg */
        .admin-login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(95,255,96,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95,255,96,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* glowing orb */
        .admin-login-root::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(95,255,96,0.07) 0%, transparent 70%);
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
          border: 1px solid rgba(95,255,96,0.18);
          border-radius: 4px;
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 0 40px rgba(95,255,96,0.08), inset 0 0 40px rgba(0,0,0,0.4);
        }

        /* corner accents */
        .card::before, .card::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: #5fff60;
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
          color: #5fff60;
          border: 1px solid rgba(95,255,96,0.3);
          padding: 0.2rem 0.6rem;
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }

        .title span {
          color: #5fff60;
        }

        .subtitle {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.05em;
          margin-bottom: 2.5rem;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(95,255,96,0.2), transparent);
          margin-bottom: 2rem;
        }

        .footer-note {
          margin-top: 1.8rem;
          font-size: 0.62rem;
          color: rgba(255,255,255,0.2);
          text-align: center;
          letter-spacing: 0.08em;
        }

        .footer-note span {
          color: rgba(95,255,96,0.5);
        }
      `}</style>

      <div className="card">
        <div className="badge">secure access</div>

        <h1 className="title">
          Admin
          <br />
          <span>Portal.</span>
        </h1>
        <p className="subtitle">AUTHORIZED PERSONNEL ONLY</p>

        <div className="divider" />

        <GoogleAuthWrapper />

        <p className="footer-note">
          HACKSPRINT &nbsp;·&nbsp; <span>ENCRYPTED</span> &nbsp;·&nbsp;  {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
