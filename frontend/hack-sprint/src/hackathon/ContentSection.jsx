import React, { useState, useEffect } from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Trophy,
  Download,
  Mail,
  Phone as PhoneIcon,
} from "lucide-react";
import DOMPurify from "dompurify";
import ChatInterface from "../components/Chat/ChatInterface";
import { OnSpotMatchesSection } from "./OnSpotMatchesSection.jsx";
import Upvote from "./Upvote";
import Gallery from "./Gallery";
import { HackathonAPI } from "../api/hackathon.api.js";
import { getFileMeta, formatBytes } from "../utils/fileType.js";

const FontStyle = () => (
  <style>{`
    .hk-details h1,
    .hk-details h2,
    .hk-details h3,
    .hk-details h4 {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }
    .hk-details h1:first-child,
    .hk-details h2:first-child,
    .hk-details h3:first-child {
      margin-top: 0;
    }
    .hk-details h2 { font-size: 1.35rem; line-height: 1.3; }
    .hk-details h3 { font-size: 1.05rem; line-height: 1.35; }
    .hk-details h4 { font-size: 0.9rem; }

    .hk-details p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      line-height: 1.75;
      color: rgba(180,220,180,0.62);
      margin-bottom: 1rem;
    }

    .hk-details ul,
    .hk-details ol {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      line-height: 1.75;
      color: rgba(180,220,180,0.62);
      margin: 0 0 1.25rem 0;
      padding-left: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .hk-details ul { list-style: none; }
    .hk-details ul > li { position: relative; padding-left: 1rem; }
    .hk-details ul > li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.65em;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #5fff60;
    }
    .hk-details ol {
      list-style: none;
      counter-reset: hk-ol;
    }
    .hk-details ol > li {
      position: relative;
      padding-left: 1.6rem;
      counter-increment: hk-ol;
    }
    .hk-details ol > li::before {
      content: counter(hk-ol, decimal-leading-zero) ".";
      position: absolute;
      left: 0;
      top: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      color: #5fff60;
      font-weight: 600;
    }
    .hk-details li > ul,
    .hk-details li > ol {
      margin-top: 0.4rem;
      margin-bottom: 0;
    }

    .hk-details strong {
      color: #ffffff;
      font-weight: 600;
    }
    .hk-details em {
      font-style: italic;
      color: rgba(180,220,180,0.45);
    }

    .hk-details a {
      color: #5fff60;
      text-decoration: underline;
      text-underline-offset: 2px;
      text-decoration-color: rgba(95,255,96,0.4);
      transition: color 0.15s;
    }
    .hk-details a:hover {
      color: #7fff80;
      text-decoration-color: #7fff80;
    }

    .hk-details blockquote {
      margin: 1.5rem 0;
      padding: 0.9rem 1.2rem;
      border-left: 2px solid #5fff60;
      background: rgba(95,255,96,0.04);
      border-radius: 0 3px 3px 0;
    }
    .hk-details blockquote p {
      font-style: italic;
      color: rgba(180,220,180,0.75);
      margin-bottom: 0;
    }

    .hk-details hr {
      border: none;
      border-top: 1px solid rgba(95,255,96,0.1);
      margin: 2rem 0;
    }

    .hk-details table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      margin-bottom: 1.25rem;
    }
    .hk-details th,
    .hk-details td {
      border: 1px solid rgba(95,255,96,0.1);
      padding: 0.5rem 0.75rem;
      text-align: left;
      color: rgba(180,220,180,0.6);
    }
    .hk-details th {
      color: #5fff60;
      font-weight: 600;
      background: rgba(95,255,96,0.03);
    }
  `}</style>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] backdrop-blur-sm p-5 hover:border-[rgba(95,255,96,0.24)] transition-all ${className}`}
  >
    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.35)]" />
    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.35)]" />
    {children}
  </div>
);

const SectionHead = ({ children }) => (
  <h3 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-2xl sm:text-3xl tracking-tight mb-5">
    {children}
  </h3>
);

const SubHead = ({ icon: Icon, children }) => (
  <h4 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-lg tracking-tight mb-3 flex items-center gap-2">
    {Icon && <Icon size={16} className="text-[#5fff60] flex-shrink-0" />}
    {children}
  </h4>
);

const Empty = ({ label }) => (
  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.35)] tracking-[0.04em]">
    No {label} information provided.
  </p>
);

const fmtDate = (d) =>
  new Date(d).toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const fmtDateRange = (start, end) =>
  `${fmtDate(start)} → ${fmtDate(end)}`;

const ResultsSection = ({ hackathonId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    HackathonAPI.getResults(hackathonId)
      .then((res) => setResults(res.data || []))
      .catch(() => setError("Results not announced yet or failed to load."))
      .finally(() => setLoading(false));
  }, [hackathonId]);

  if (loading)
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-[4px] bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.08)] overflow-hidden relative animate-pulse"
          />
        ))}
      </div>
    );

  if (error || results.length === 0)
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-12 h-12 rounded-[3px] bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.1)] flex items-center justify-center">
            <Trophy size={20} className="text-[rgba(95,255,96,0.2)]" />
          </div>
          <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.35)] tracking-[0.06em] uppercase">
            {error || "No results announced yet."}
          </p>
          <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(180,220,180,0.22)]">
            Check back once judging is complete.
          </p>
        </div>
      </Card>
    );

  const podium = [
    {
      label: "1st Place",
      emoji: "🥇",
      border: "border-[rgba(255,196,0,0.3)]",
      bg: "bg-[rgba(255,196,0,0.07)]",
      pt: "text-[#ffd700]",
      badgeCls:
        "bg-[rgba(255,196,0,0.1)] text-[rgba(255,196,0,0.8)] border-[rgba(255,196,0,0.3)]",
      bar: "bg-[#ffd700]",
    },
    {
      label: "2nd Place",
      emoji: "🥈",
      border: "border-[rgba(192,192,192,0.25)]",
      bg: "bg-[rgba(192,192,192,0.06)]",
      pt: "text-[#c0c0c0]",
      badgeCls:
        "bg-[rgba(192,192,192,0.08)] text-[rgba(192,192,192,0.7)] border-[rgba(192,192,192,0.25)]",
      bar: "bg-[#c0c0c0]",
    },
    {
      label: "3rd Place",
      emoji: "🥉",
      border: "border-[rgba(205,127,50,0.25)]",
      bg: "bg-[rgba(205,127,50,0.06)]",
      pt: "text-[#cd7f32]",
      badgeCls:
        "bg-[rgba(205,127,50,0.08)] text-[rgba(205,127,50,0.7)] border-[rgba(205,127,50,0.25)]",
      bar: "bg-[#cd7f32]",
    },
  ];
  const maxPts = Math.max(...results.map((r) => r.finalScore || 0), 1);

  return (
    <div>
      <SectionHead>Hackathon Results</SectionHead>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {results.slice(0, 3).map((sub, i) => {
            const p = podium[i];
            const name = sub.team
              ? sub.team.name
              : sub.participant?.name || "Unknown";
            const pct = ((sub.finalScore / maxPts) * 100).toFixed(1);
            return (
              <div
                key={sub._id}
                className={`relative rounded-[4px] border ${p.border} ${p.bg} p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all`}
              >
                <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.25)]" />
                <div className="flex items-center justify-between">
                  <span
                    className={`font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.12em] uppercase px-2 py-[3px] rounded-[2px] border ${p.badgeCls}`}
                  >
                    {p.label}
                  </span>
                  <span className="text-xl">{p.emoji}</span>
                </div>
                <div>
                  <h4 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm tracking-tight">
                    {name}
                  </h4>
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(180,220,180,0.3)] mt-0.5">
                    {sub.team ? "Team" : "Individual"}
                  </p>
                </div>
                <div>
                  <div className="flex items-end justify-between mb-1">
                    <span
                      className={`font-[family-name:'Syne',sans-serif] font-extrabold text-xl ${p.pt}`}
                    >
                      {sub.finalScore?.toFixed?.(1) ?? sub.finalScore}
                    </span>
                    <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.5rem] text-[rgba(180,220,180,0.28)] uppercase tracking-[0.1em]">
                      pts
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.bar} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results.length > 3 && (
        <div className="bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_auto] gap-4 px-5 py-3 border-b border-[rgba(95,255,96,0.07)]">
            {["#", "Participant", "Score"].map((h) => (
              <span
                key={h}
                className="font-[family-name:'JetBrains_Mono',monospace] text-[0.5rem] tracking-[0.16em] uppercase text-[rgba(95,255,96,0.3)]"
              >
                {h}
              </span>
            ))}
          </div>
          {results.slice(3).map((sub, i) => {
            const rank = i + 4;
            const name = sub.team
              ? sub.team.name
              : sub.participant?.name || "Unknown";
            return (
              <div
                key={sub._id}
                className="grid grid-cols-[2rem_1fr_auto] gap-4 items-center px-5 py-3 border-b border-[rgba(95,255,96,0.05)] last:border-b-0 hover:bg-[rgba(95,255,96,0.03)] transition-colors"
              >
                <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(95,255,96,0.3)]">
                  {String(rank).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[2px] bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.12)] flex items-center justify-center flex-shrink-0">
                    <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[0.65rem] text-[rgba(95,255,96,0.5)]">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm truncate">
                      {name}
                    </p>
                    <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(180,220,180,0.28)]">
                      {sub.team ? "Team" : "Individual"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[#5fff60] text-sm">
                    {sub.finalScore?.toFixed?.(1) ?? sub.finalScore}
                  </span>
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.5rem] text-[rgba(95,255,96,0.3)] ml-1">
                    pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="font-[family-name:'JetBrains_Mono',monospace] text-center text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(95,255,96,0.2)] mt-4">
        Final standings · Ranked by judge score
      </p>
    </div>
  );
};

export const ContentSection = ({ activeSection, hackathon }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const TimelineRow = ({ label, range, last }) => (
    <div
      className={`flex gap-4 pb-5 ${
        !last ? "border-b border-[rgba(95,255,96,0.06)]" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#5fff60] mt-1" />
        {!last && <div className="w-px flex-1 bg-[rgba(95,255,96,0.15)]" />}
      </div>
      <div className="pb-1">
        <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm tracking-tight">
          {label}
        </div>
        <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.45)] mt-0.5">
          {range}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview": {
        const sortedPhases = [...(hackathon.phases || [])].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
        return (
          <div className="flex flex-col gap-5">
            <Card>
              <SubHead>Description</SubHead>
              <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.72rem] text-[rgba(180,220,180,0.6)] leading-relaxed">
                {hackathon.description}
              </p>
            </Card>

            <Card>
              <SubHead icon={Clock}>Event Timeline</SubHead>
              {sortedPhases.length > 0 ? (
                <div className="flex flex-col gap-0">
                  {sortedPhases.map((p, i) => (
                    <TimelineRow
                      key={p._id}
                      label={p.phaseName}
                      range={fmtDateRange(p.startDate, p.endDate)}
                      last={i === sortedPhases.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <Empty label="timeline" />
              )}
            </Card>
          </div>
        );
      }

      case "details": {
        const html = hackathon.detailsContent
          ? DOMPurify.sanitize(hackathon.detailsContent)
          : "";
        return (
          <div>
            <SectionHead>Details</SectionHead>
            <Card>
              {html ? (
                <div
                  className="hk-details"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <Empty label="details" />
              )}
            </Card>
          </div>
        );
      }

      case "prizes": {
        const prizes = hackathon.prizes || [];
        const total = prizes.reduce((s, p) => s + (p.amount || 0), 0);
        return (
          <div>
            <SectionHead>Prizes</SectionHead>
            <Card>
              {prizes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {total > 0 && (
                    <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.55)]">
                      Total prize pool:{" "}
                      <span className="text-[#5fff60] font-semibold">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    {prizes.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-4 py-1.5 border-b border-[rgba(95,255,96,0.06)] last:border-b-0"
                      >
                        <div>
                          <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm">
                            {p.title}
                          </p>
                          {p.description && (
                            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(180,220,180,0.4)] mt-0.5">
                              {p.description}
                            </p>
                          )}
                        </div>
                        <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[#5fff60] text-sm flex-shrink-0">
                          ₹{(p.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty label="prize" />
              )}
            </Card>
          </div>
        );
      }

      case "judging": {
        const jc = hackathon.judgingConfig;
        return (
          <div>
            <SectionHead>Judging</SectionHead>
            <Card>
              {jc && (jc.minScore != null || jc.maxScore != null) ? (
                <div className="flex items-center gap-3">
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.72rem] text-[rgba(180,220,180,0.6)]">
                    Submissions are scored on a scale of{" "}
                    <span className="text-[#5fff60] font-semibold">
                      {jc.minScore}
                    </span>{" "}
                    to{" "}
                    <span className="text-[#5fff60] font-semibold">
                      {jc.maxScore}
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <Empty label="judging" />
              )}
            </Card>
          </div>
        );
      }

      case "faqs": {
        const faqs = hackathon.faqs || [];
        return (
          <div>
            <SectionHead>Frequently Asked Questions</SectionHead>
            {faqs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {faqs.map((faq, idx) => {
                  const open = expandedFAQ === idx;
                  return (
                    <div
                      key={idx}
                      className={`relative border rounded-[4px] overflow-hidden transition-all ${
                        open
                          ? "border-[rgba(95,255,96,0.28)] bg-[rgba(95,255,96,0.04)]"
                          : "border-[rgba(95,255,96,0.1)] bg-[rgba(10,12,10,0.88)]"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedFAQ(open ? null : idx)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-left group"
                      >
                        <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm tracking-tight group-hover:text-[rgba(255,255,255,0.85)]">
                          {faq.question}
                        </span>
                        {open ? (
                          <ChevronUp
                            size={14}
                            className="text-[#5fff60] flex-shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={14}
                            className="text-[rgba(95,255,96,0.45)] flex-shrink-0"
                          />
                        )}
                      </button>
                      {open && (
                        <div className="px-5 pb-4 border-t border-[rgba(95,255,96,0.08)]">
                          <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.55)] leading-relaxed pt-3">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <Empty label="faqs" />
              </Card>
            )}
          </div>
        );
      }

      case "resources": {
        const resources = hackathon.resources || [];
        return (
          <div>
            <SectionHead>Resources</SectionHead>
            {resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resources.map((r, i) => {
                  const { icon: Icon, color, label } = getFileMeta(r.format);
                  return (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={r.title || undefined}
                      className="group relative flex items-center gap-3 bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-4 hover:border-[rgba(95,255,96,0.3)] hover:-translate-y-0.5 transition-all"
                    >
                      <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.3)]" />
                      <div
                        className="w-10 h-10 rounded-[3px] flex items-center justify-center flex-shrink-0 border"
                        style={{
                          backgroundColor: `${color}14`,
                          borderColor: `${color}33`,
                        }}
                      >
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm truncate">
                          {r.title || label}
                        </p>
                        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[rgba(180,220,180,0.4)] tracking-[0.04em] mt-0.5">
                          {label}
                          {r.size ? ` · ${formatBytes(r.size)}` : ""}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-[3px] flex items-center justify-center flex-shrink-0 border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.5)] group-hover:bg-[rgba(95,255,96,0.1)] group-hover:border-[rgba(95,255,96,0.35)] group-hover:text-[#5fff60] transition-all">
                        <Download size={14} />
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <Card>
                <Empty label="resource" />
              </Card>
            )}
          </div>
        );
      }

      case "discussion":
        return <ChatInterface hackathonId={hackathon._id} />;

      case "matches":
        return <OnSpotMatchesSection hackathon={hackathon} />;

      case "contact": {
        const contacts = hackathon.contacts || [];
        return (
          <div>
            <SectionHead>Contact</SectionHead>
            <Card>
              {contacts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {contacts.map((item, i) => {
                    const { label, type, value } = item;
                    let content;
                    if (type === "EMAIL")
                      content = (
                        <a
                          href={`mailto:${value}`}
                          className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[#5fff60] hover:underline break-all flex items-center gap-1.5"
                        >
                          <Mail size={12} /> {value}
                        </a>
                      );
                    else if (type === "PHONE")
                      content = (
                        <a
                          href={`tel:${value}`}
                          className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[#5fff60] hover:underline break-all flex items-center gap-1.5"
                        >
                          <PhoneIcon size={12} /> {value}
                        </a>
                      );
                    else if (
                      ["WEBSITE", "LINKEDIN", "DISCORD"].includes(type)
                    )
                      content = (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[#5fff60] hover:underline break-all"
                        >
                          {value}
                        </a>
                      );
                    else
                      content = (
                        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[rgba(180,220,180,0.6)] break-all">
                          {value}
                        </p>
                      );

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3"
                      >
                        <p className="text-[0.6rem] text-[#5fff60] uppercase tracking-wider">
                          {label}
                        </p>
                        {content}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty label="contact" />
              )}
            </Card>
          </div>
        );
      }

      case "upvote":
        return <Upvote hackathonId={hackathon._id} phases={hackathon.phases} />;

      case "gallery":
        return (
          <div>
            <SectionHead>Event Gallery</SectionHead>
            <Gallery hackathonId={hackathon._id} />
          </div>
        );

      case "results":
        return <ResultsSection hackathonId={hackathon._id} />;

      default:
        return (
          <div className="text-center py-12">
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.35)] tracking-[0.06em] uppercase">
              Section not found.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <FontStyle />
      <main className="flex-1 px-4 py-6 md:px-7 md:py-8 font-[family-name:'JetBrains_Mono',monospace] overflow-hidden">
        <div className="max-w-3xl mx-auto">{renderContent()}</div>
      </main>
    </>
  );
};