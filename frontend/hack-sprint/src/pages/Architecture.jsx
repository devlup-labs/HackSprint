import React from "react";
import SEO from "../components/SEO.jsx";

const LEGEND = [
  { color: "#60c8ff", label: "Client (Vercel)" },
  { color: "#5fff60", label: "Edge (Nginx + Gateway)" },
  { color: "#ffb84d", label: "Core services" },
  { color: "#b478ff", label: "Data layer" },
  { color: "#ff6060", label: "Observability" },
  { color: "#ff6bcb", label: "External APIs" },
  { color: "#9aa7b8", label: "CI/CD & hosting" },
];

// Small dots traveling along each connector's own path — the same "d"/line
// coordinates already drawn for the arrow, so direction always matches what
// the arrowhead shows. Durations vary and `begin` is staggered with negative
// offsets so motion starts already "mid-flight" and never looks synchronized
// — meant to read as constant, ambient circulation rather than a loop firing
// in unison.
const FLOWS = [
  { d: "M670,91 L705,91", color: "#60c8ff", dur: "1.4s", begin: "0s" },
  { d: "M700,176 L700,235", color: "#60c8ff", dur: "1.7s", begin: "-0.6s" },
  { d: "M700,436 L700,466", color: "#5fff60", dur: "1.4s", begin: "-0.2s" },
  { d: "M 197,592 C 197,616 382,616 382,592", color: "#ff6bcb", dur: "2.6s", begin: "-1.1s" },
  { d: "M 197,592 C 197,660 240,660 240,744", color: "#b478ff", dur: "2.2s", begin: "0s" },
  { d: "M 567,592 C 567,660 415,660 415,744", color: "#b478ff", dur: "2.3s", begin: "-1.4s" },
  { d: "M 382,592 C 382,660 300,660 300,744", color: "#b478ff", dur: "2.4s", begin: "-0.7s" },
  { d: "M 752,592 C 752,660 595,660 595,744", color: "#b478ff", dur: "2.1s", begin: "-1.8s" },
  { d: "M905,773 L935,773", color: "#ff6060", dur: "1s", begin: "0s" },
  { d: "M 832,744 C 832,650 700,610 700,592", color: "#ff6060", dur: "2s", begin: "-0.9s" },
  { d: "M 1020,554 C 1180,554 1180,547 1315,547", color: "#ff6bcb", dur: "2s", begin: "-0.4s" },
  { d: "M660,1160 L660,1076", color: "#9aa7b8", dur: "1.8s", begin: "-0.3s" },
];

const NOTES = [
  {
    title: "One of five services is fully stateless.",
    body: "Chatbot holds no database connection at all — it's a thin, cacheable wrapper around Gemini, scoped so it can never see a user's account data.",
  },
  {
    title: "Two async hops exist, both queue-backed.",
    body: "Auth enqueues transactional email onto a BullMQ/Redis queue for Notification's worker to send. Notification also queues every browser push notification the same way — so a slow push provider can never delay a request or another job.",
  },
  {
    title: "The gateway does no business logic.",
    body: "Helmet, CORS, rate-limiting, and prefix-based routing only — auth, DB access, and validation all live inside the five services themselves.",
  },
  {
    title: "One push, one deploy.",
    body: "There's no staging environment — a merge to main is SSH'd into the single EC2 host, which rebuilds every container via Docker Compose.",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="hk-bg font-jb min-h-screen bg-[#050505] text-[#e8ffe8] relative overflow-hidden py-20 px-5">
      <SEO
        title="System Architecture"
        description="How HackSprint's backend is actually built — the API gateway, five services, data layer, external APIs, observability, and deployment pipeline."
        path="/architecture"
      />
      <div className="relative z-10 max-w-[1240px] mx-auto">
        <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-[0.22rem] rounded-[2px] mb-4">
          System Design
        </div>
        <h1
          className="font-syne font-extrabold text-white tracking-tight leading-[1.05] mb-4"
          style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}
        >
          Hack<span className="text-[#5fff60]">Sprint</span> — Current Architecture
        </h1>
        <p className="font-jb text-[0.78rem] text-[rgba(180,220,180,0.55)] leading-relaxed max-w-2xl mb-10">
          Five independent backend services behind one API gateway, a separately deployed
          frontend, and a single EC2 host running the whole backend under Docker Compose.
          This reflects the system as it's actually implemented today not a target state.
        </p>

        <figure className="m-0 mb-8">
          <div className="bg-[rgba(255,255,255,0.015)] border border-[rgba(95,255,96,0.16)] rounded-[8px] p-5 overflow-x-auto">
            <svg
              viewBox="0 0 1680 1420"
              role="img"
              className="block w-full h-auto"
              style={{ minWidth: 980 }}
              aria-label="HackSprint request flow: browser talks to the React SPA on Vercel, which sends HTTPS requests to Nginx and the API Gateway on a single EC2 host; the gateway routes to five services (Auth, Notification, Hackathon, Media, Chatbot); four of those five read and write MongoDB, two of those four also use Redis, Media alone writes to S3; Auth hands transactional email to Notification via a BullMQ/Redis queue, and Notification queues its own browser push notifications the same way; Chatbot calls the Gemini API outside the host; Prometheus scrapes every service and Grafana visualizes it; GitHub Actions deploys to the host by SSH on every push to main."
            >
              <defs>
                <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
                <filter id="arch-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="2.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* CLIENT ZONE */}
              <rect x="500" y="26" width="400" height="150" rx="10" fill="rgba(96,200,255,0.06)" stroke="#60c8ff" strokeWidth="1.5" />
              <text x="520" y="52" fontSize="12" fontWeight="700" letterSpacing="0.12em" fill="#60c8ff">CLIENT</text>

              <rect x="520" y="66" width="150" height="50" rx="6" fill="rgba(96,200,255,0.12)" stroke="#60c8ff" />
              <text x="595" y="87" textAnchor="middle" fontSize="12" fill="#fff">Customer</text>
              <text x="595" y="103" textAnchor="middle" fontSize="10" fill="rgba(180,220,180,0.62)">(browser)</text>

              <line x1="670" y1="91" x2="705" y2="91" stroke="#60c8ff" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              <rect x="710" y="66" width="170" height="50" rx="6" fill="rgba(96,200,255,0.12)" stroke="#60c8ff" />
              <text x="795" y="87" textAnchor="middle" fontSize="12" fill="#fff">React SPA (Vite)</text>
              <text x="795" y="103" textAnchor="middle" fontSize="10" fill="rgba(180,220,180,0.62)">deployed on Vercel</text>

              <line x1="700" y1="176" x2="700" y2="235" stroke="rgba(180,220,180,0.62)" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
              <text x="712" y="210" fontSize="10.5" fill="rgba(180,220,180,0.62)">HTTPS · single origin (VITE_API_URL)</text>

              {/* EC2 HOST BOUNDARY */}
              <rect x="60" y="240" width="1200" height="940" rx="12" fill="none" stroke="rgba(150,190,150,0.45)" strokeWidth="1.5" strokeDasharray="6 5" />
              <text x="84" y="266" fontSize="12" fontWeight="700" letterSpacing="0.08em" fill="rgba(180,220,180,0.62)">AWS EC2 — DOCKER COMPOSE (SINGLE HOST)</text>

              {/* EDGE ZONE */}
              <rect x="500" y="286" width="400" height="150" rx="10" fill="rgba(95,255,96,0.055)" stroke="#5fff60" strokeWidth="1.5" />
              <text x="520" y="312" fontSize="12" fontWeight="700" letterSpacing="0.12em" fill="#5fff60">EDGE</text>

              <rect x="520" y="324" width="360" height="46" rx="6" fill="rgba(95,255,96,0.1)" stroke="#5fff60" />
              <text x="700" y="352" textAnchor="middle" fontSize="12" fill="#fff">Nginx — HTTPS termination (Let's Encrypt)</text>

              <line x1="700" y1="370" x2="700" y2="380" stroke="#5fff60" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              <rect x="520" y="382" width="360" height="46" rx="6" fill="rgba(95,255,96,0.1)" stroke="#5fff60" />
              <text x="700" y="405" textAnchor="middle" fontSize="12" fill="#fff">API Gateway :5000</text>
              <text x="700" y="420" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">CORS · rate-limit · routing only, no business logic</text>

              <line x1="700" y1="436" x2="700" y2="466" stroke="rgba(180,220,180,0.62)" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
              <text x="712" y="456" fontSize="10.5" fill="rgba(180,220,180,0.62)">routes /api/* by prefix</text>

              {/* CORE SERVICES ZONE */}
              <rect x="100" y="470" width="935" height="196" rx="10" fill="rgba(255,184,77,0.055)" stroke="#ffb84d" strokeWidth="1.5" />
              <text x="120" y="496" fontSize="12" fontWeight="700" letterSpacing="0.12em" fill="#ffb84d">CORE SERVICES</text>

              <rect x="115" y="516" width="165" height="76" rx="6" fill="rgba(255,184,77,0.12)" stroke="#ffb84d" />
              <text x="197" y="546" textAnchor="middle" fontSize="12" fill="#fff">Auth</text>
              <text x="197" y="562" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">:5001 · OAuth, JWT</text>
              <text x="197" y="576" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">refresh tokens</text>

              <rect x="300" y="516" width="165" height="76" rx="6" fill="rgba(255,184,77,0.12)" stroke="#ffb84d" />
              <text x="382" y="541" textAnchor="middle" fontSize="12" fill="#fff">Notification</text>
              <text x="382" y="557" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">:5004 · in-app +</text>
              <text x="382" y="570" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">email (Brevo) +</text>
              <text x="382" y="583" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">web push (VAPID)</text>

              <path d="M 197,592 C 197,616 382,616 382,592" fill="none" stroke="#ff6bcb" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
              <text x="290" y="622" textAnchor="middle" fontSize="9.5" fill="#ff6bcb">email + push jobs · BullMQ/Redis</text>

              <rect x="485" y="516" width="165" height="76" rx="6" fill="rgba(255,184,77,0.12)" stroke="#ffb84d" />
              <text x="567" y="541" textAnchor="middle" fontSize="12" fill="#fff">Hackathon</text>
              <text x="567" y="557" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">:5002 · teams, judging,</text>
              <text x="567" y="570" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">on-spot matches,</text>
              <text x="567" y="583" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">discussions + 2 crons</text>

              <rect x="670" y="516" width="165" height="76" rx="6" fill="rgba(255,184,77,0.12)" stroke="#ffb84d" />
              <text x="752" y="546" textAnchor="middle" fontSize="12" fill="#fff">Media</text>
              <text x="752" y="562" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">:5003 · uploads</text>
              <text x="752" y="576" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">→ S3 (IAM role)</text>

              <rect x="855" y="516" width="165" height="76" rx="6" fill="rgba(255,184,77,0.12)" stroke="#ffb84d" />
              <text x="937" y="546" textAnchor="middle" fontSize="12" fill="#fff">Chatbot</text>
              <text x="937" y="562" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">:5005 · FAQ only</text>
              <text x="937" y="576" textAnchor="middle" fontSize="9.5" fill="#ff6bcb">no database</text>

              {/* DATA LAYER ZONE */}
              <rect x="140" y="706" width="560" height="160" rx="10" fill="rgba(180,120,255,0.055)" stroke="#b478ff" strokeWidth="1.5" />
              <text x="160" y="732" fontSize="12" fontWeight="700" letterSpacing="0.12em" fill="#b478ff">DATA LAYER</text>

              <rect x="160" y="744" width="160" height="58" rx="6" fill="rgba(180,120,255,0.12)" stroke="#b478ff" />
              <text x="240" y="768" textAnchor="middle" fontSize="12" fill="#fff">MongoDB</text>
              <text x="240" y="784" textAnchor="middle" fontSize="9" fill="rgba(180,220,180,0.62)">Auth·Notif·Hack·Media</text>

              <rect x="340" y="744" width="150" height="58" rx="6" fill="rgba(180,120,255,0.12)" stroke="#b478ff" />
              <text x="415" y="768" textAnchor="middle" fontSize="12" fill="#fff">Redis</text>
              <text x="415" y="784" textAnchor="middle" fontSize="9" fill="rgba(180,220,180,0.62)">Auth·Hackathon</text>

              <rect x="510" y="744" width="170" height="58" rx="6" fill="rgba(180,120,255,0.12)" stroke="#b478ff" />
              <text x="595" y="768" textAnchor="middle" fontSize="12" fill="#fff">S3</text>
              <text x="595" y="784" textAnchor="middle" fontSize="9" fill="rgba(180,220,180,0.62)">Media only · IAM role</text>

              <path d="M 197,592 C 197,660 240,660 240,744" fill="none" stroke="rgba(150,190,150,0.45)" strokeWidth="1.2" markerEnd="url(#arch-arrow)" />
              <path d="M 567,592 C 567,660 415,660 415,744" fill="none" stroke="rgba(150,190,150,0.45)" strokeWidth="1.2" markerEnd="url(#arch-arrow)" />
              <path d="M 382,592 C 382,660 300,660 300,744" fill="none" stroke="rgba(150,190,150,0.45)" strokeWidth="1.2" markerEnd="url(#arch-arrow)" />
              <path d="M 752,592 C 752,660 595,660 595,744" fill="none" stroke="rgba(150,190,150,0.45)" strokeWidth="1.2" markerEnd="url(#arch-arrow)" />
              <text x="420" y="700" textAnchor="middle" fontSize="10" fill="rgba(180,220,180,0.62)">reads / writes — Chatbot touches neither store</text>

              {/* OBSERVABILITY ZONE */}
              <rect x="740" y="706" width="340" height="160" rx="10" fill="rgba(255,96,96,0.055)" stroke="#ff6060" strokeWidth="1.5" />
              <text x="760" y="732" fontSize="12" fontWeight="700" letterSpacing="0.12em" fill="#ff6060">OBSERVABILITY</text>

              <rect x="760" y="744" width="145" height="58" rx="6" fill="rgba(255,96,96,0.12)" stroke="#ff6060" />
              <text x="832" y="768" textAnchor="middle" fontSize="12" fill="#fff">Prometheus</text>
              <text x="832" y="784" textAnchor="middle" fontSize="9" fill="rgba(180,220,180,0.62)">scrapes every 5s</text>

              <line x1="905" y1="773" x2="935" y2="773" stroke="#ff6060" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              <rect x="940" y="744" width="120" height="58" rx="6" fill="rgba(255,96,96,0.12)" stroke="#ff6060" />
              <text x="1000" y="768" textAnchor="middle" fontSize="12" fill="#fff">Grafana</text>
              <text x="1000" y="784" textAnchor="middle" fontSize="9" fill="rgba(180,220,180,0.62)">loopback-only</text>

              <path d="M 832,744 C 832,650 700,610 700,592" fill="none" stroke="#ff6060" strokeWidth="1" strokeDasharray="4 4" markerEnd="url(#arch-arrow)" />
              <text x="1000" y="700" fontSize="9.5" fill="#ff6060">scrapes /metrics on all 5 services + gateway</text>

              {/* CI/CD (compose file, inside host) */}
              <rect x="460" y="1000" width="400" height="70" rx="8" fill="rgba(154,167,184,0.08)" stroke="#9aa7b8" strokeWidth="1.5" />
              <text x="660" y="1030" textAnchor="middle" fontSize="12" fill="#fff">docker-compose.prod.yml</text>
              <text x="660" y="1047" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">every service above, one process each</text>

              <line x1="660" y1="866" x2="660" y2="996" stroke="rgba(150,190,150,0.45)" strokeWidth="1" strokeDasharray="3 4" />

              {/* EXTERNAL APIs ZONE */}
              <rect x="1300" y="470" width="340" height="115" rx="10" fill="rgba(255,107,203,0.055)" stroke="#ff6bcb" strokeWidth="1.5" />
              <text x="1320" y="496" fontSize="12" fontWeight="700" letterSpacing="0.12em" fill="#ff6bcb">EXTERNAL APIs</text>
              <text x="1320" y="512" fontSize="9.5" fill="rgba(150,190,150,0.45)">third-party — not on the host</text>

              <rect x="1320" y="524" width="300" height="46" rx="6" fill="rgba(255,107,203,0.12)" stroke="#ff6bcb" />
              <text x="1470" y="546" textAnchor="middle" fontSize="12" fill="#fff">Gemini API</text>
              <text x="1470" y="561" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">generateContent()</text>

              <path d="M 1020,554 C 1180,554 1180,547 1315,547" fill="none" stroke="#ff6bcb" strokeWidth="1.3" markerEnd="url(#arch-arrow)" />

              {/* GitHub Actions, outside host */}
              <rect x="480" y="1160" width="360" height="70" rx="8" fill="rgba(154,167,184,0.08)" stroke="#9aa7b8" strokeWidth="1.5" />
              <text x="660" y="1190" textAnchor="middle" fontSize="12" fill="#fff">GitHub Actions</text>
              <text x="660" y="1206" textAnchor="middle" fontSize="9.5" fill="rgba(180,220,180,0.62)">on push to main</text>

              <line x1="660" y1="1160" x2="660" y2="1076" stroke="#9aa7b8" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
              <text x="674" y="1120" fontSize="9.5" fill="#9aa7b8">SSH → git reset --hard → docker compose up -d --build</text>

              {/* Flow — small dots circulating along the request/data paths above */}
              {FLOWS.map((flow, i) => (
                <circle key={i} r="3.2" fill={flow.color} filter="url(#arch-glow)">
                  <animateMotion dur={flow.dur} begin={flow.begin} repeatCount="indefinite" path={flow.d} />
                </circle>
              ))}
            </svg>
          </div>
          <figcaption className="font-jb text-[0.7rem] text-[rgba(150,190,150,0.5)] leading-relaxed mt-3">
            Request flow top to bottom: browser → React SPA (Vercel) → Nginx → API Gateway → one of
            five services. Four services share MongoDB; two of those also use Redis; only Media
            writes to S3. Chatbot is the one stateless service, calling out to a third-party API
            instead of a database. Prometheus/Grafana and the CI/CD pipeline sit alongside, not in
            the request path.
          </figcaption>
        </figure>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2.5 mb-8 p-5 border border-[rgba(95,255,96,0.16)] rounded-[8px] bg-[rgba(255,255,255,0.015)]">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 font-jb text-[0.68rem] text-[rgba(180,220,180,0.62)]">
              <span className="w-[11px] h-[11px] rounded-[2px] flex-shrink-0" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {NOTES.map(({ title, body }) => (
            <div
              key={title}
              className="bg-[rgba(255,184,77,0.05)] border border-[rgba(255,184,77,0.28)] border-l-[3px] border-l-[#ffb84d] rounded-[4px] px-4 py-3.5"
            >
              <p className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.62)] leading-relaxed">
                <span className="text-white font-semibold">{title}</span> {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
