import React, { useState, useEffect, useRef } from "react";
import SEO from "../components/SEO.jsx";
import "./Styles/NotFound.css"

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: ((i * 47 + 13) % 97),
  y: ((i * 31 + 7)  % 93),
  size: (i % 3) + 1.5,
  color: ["rgba(95,255,96,.6)","rgba(255,96,96,.5)","rgba(96,200,255,.4)","rgba(255,184,77,.4)"][i % 4],
  dur: 4 + (i % 5),
  delay: (i * 0.3) % 2.5,
}));

const NotFound = () => {
  const handleReturnHome = () => { window.location.href = "/"; };

  return (
    <div className="nf-root">
      <SEO title="Page Not Found" noindex />

      <div className="nf-scanlines" />

      <div className="nf-ring" style={{
        top:"18%", left:"10%", width:200, height:200,
        borderColor:"rgba(95,255,96,.12)",
        animation:"nf-ring-pulse 4s ease-in-out infinite",
      }} />
      <div className="nf-ring" style={{
        bottom:"18%", right:"10%", width:150, height:150,
        borderColor:"rgba(255,96,96,.1)",
        animation:"nf-ring-pulse 3.5s ease-in-out infinite reverse",
      }} />

      {PARTICLES.map(p => (
        <div key={p.id} className="nf-particle" style={{
          top:`${p.y}%`, left:`${p.x}%`,
          width:p.size, height:p.size,
          background:p.color,
          animation:`nf-particle-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}

      <div style={{ position:"relative", zIndex:2, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>

        <div className="nf-error-label">// error · page not found</div>
        
        <div className="nf-display">
          <span className="nf-number" data-text="4" style={{ color:"transparent" }}>4</span>

          <span className="nf-number" data-text="0" style={{ color:"transparent" }}>0</span>

          <span className="nf-number" data-text="4" style={{ color:"transparent" }}>4</span>
        </div>

        <div className="nf-msg">
          <span style={{ color:"rgba(95,255,96,.55)", letterSpacing:"0.12em" }}>KERNEL PANIC</span>
          <br />
          <span style={{ fontSize:"0.65rem" }}>
            The page you requested could not be located.<br />
            It may have been moved, deleted, or never existed.
          </span>
        </div>

        <div style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"0.58rem",
          color:"rgba(95,255,96,.5)",
          letterSpacing:"0.06em",
          marginBottom:"1.75rem",
          lineHeight:1.8,
          textAlign:"left",
        }}>
          <span style={{ color:"rgba(96,200,255,.5)" }}>GET</span> <span style={{ color:"rgba(255,184,77,.5)" }}>/??</span> HTTP/1.1<br />
          {"<"} 404 Not Found<br />
          {"<"} Content-Type: text/void
        </div>

        <button onClick={handleReturnHome} className="nf-btn">
          ← Return Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;