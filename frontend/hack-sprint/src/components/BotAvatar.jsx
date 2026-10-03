import React from "react";

// The assistant's face: a sleek visor-and-headset robot. Deliberately more
// "support engineer" than the playful Sparky used for the daily challenge.
const BotAvatar = ({ size = 32, className = "" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
    <defs>
      <linearGradient id="ba-head" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b3a35" />
        <stop offset="1" stopColor="#101a16" />
      </linearGradient>
      <linearGradient id="ba-edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6ee7b7" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
    </defs>

    <style>{`
      @keyframes ba-blink { 0%,90%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.1)} }
      @keyframes ba-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
      .ba-eye { transform-box: fill-box; transform-origin: center; animation: ba-blink 5s infinite; }
      .ba-node { animation: ba-pulse 2s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce){ .ba-eye,.ba-node{animation:none} }
    `}</style>

    <line x1="32" y1="14" x2="32" y2="8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
    <circle className="ba-node" cx="32" cy="6.5" r="3" fill="#6ee7b7" />

    <path d="M13 32a19 19 0 0 1 38 0" fill="none" stroke="url(#ba-edge)" strokeWidth="3" strokeLinecap="round" />
    <rect x="6.5" y="30" width="8" height="15" rx="4" fill="url(#ba-edge)" />
    <rect x="49.5" y="30" width="8" height="15" rx="4" fill="url(#ba-edge)" />
    <path d="M53.5 45v5a6 6 0 0 1-6 6H42" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
    <rect x="37.5" y="53.5" width="6" height="5" rx="2.5" fill="#6ee7b7" />

    <rect x="14" y="14" width="36" height="34" rx="13" fill="url(#ba-head)" stroke="url(#ba-edge)" strokeWidth="1.2" />
    <ellipse cx="25" cy="18.5" rx="8" ry="2.4" fill="#fff" opacity="0.14" />

    <rect x="19" y="24" width="26" height="15" rx="7.5" fill="#04140c" stroke="#6ee7b7" strokeOpacity="0.35" />
    <rect className="ba-eye" x="23.5" y="27.5" width="6.5" height="8" rx="3.25" fill="#6ee7b7" />
    <rect className="ba-eye" x="34" y="27.5" width="6.5" height="8" rx="3.25" fill="#6ee7b7" />
    <circle cx="26" cy="30" r="1.1" fill="#fff" opacity="0.85" />
    <circle cx="36.5" cy="30" r="1.1" fill="#fff" opacity="0.85" />

    <path d="M27 43.5h10" stroke="#6ee7b7" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default BotAvatar;
