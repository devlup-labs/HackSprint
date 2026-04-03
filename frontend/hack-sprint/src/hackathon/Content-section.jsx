import React, { useState, useEffect } from "react";
import {
  Clock,
  Code,
  Users,
  ChevronDown,
  ChevronUp,
  Trophy,
  Link2,
} from "lucide-react";
import ChatInterface from "../components/Chat/ChatInterface";
import Upvote from "./Upvote";
import Gallery from "./Gallery";

const FontStyle = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
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

const Tag = ({ children, color = "green" }) => {
  const c =
    color === "blue"
      ? "bg-[rgba(96,200,255,0.07)] border-[rgba(96,200,255,0.2)] text-[rgba(96,200,255,0.75)]"
      : "bg-[rgba(95,255,96,0.07)] border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.75)]";
  return (
    <span
      className={`font-[family-name:'JetBrains_Mono',monospace] inline-block text-[0.6rem] tracking-[0.07em] px-2 py-1 rounded-[2px] border ${c}`}
    >
      {children}
    </span>
  );
};

const Label = ({ children }) => (
  <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.4)] mb-1">
    {children}
  </div>
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

export const ContentSection = ({ activeSection, hackathon }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const SimpleSection = ({ title, content }) => (
    <div>
      <SectionHead>{title}</SectionHead>
      <Card>
        {content ? (
          <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.72rem] text-[rgba(180,220,180,0.65)] leading-relaxed whitespace-pre-line">
            {content}
          </div>
        ) : (
          <Empty label={title.toLowerCase()} />
        )}
      </Card>
    </div>
  );

  const RefSection = ({ title, content }) => {
    const urls = Array.isArray(content) ? content : content ? [content] : [];
    return (
      <div>
        <SectionHead>{title}</SectionHead>
        <Card>
          {urls.length > 0 ? (
            <div className="flex flex-col gap-2">
              {urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] flex items-center gap-1.5 break-all transition-colors"
                >
                  <Link2 size={11} className="flex-shrink-0 opacity-60" />
                  {url}
                </a>
              ))}
            </div>
          ) : (
            <Empty label={title.toLowerCase()} />
          )}
        </Card>
      </div>
    );
  };

  const ListSection = ({ title, content }) => {
    const isLink = (t) => typeof t === "string" && t.startsWith("http");
    const ok = Array.isArray(content) && content.length > 0;
    return (
      <div>
        <SectionHead>{title}</SectionHead>
        <Card>
          {ok ? (
            <ul className="flex flex-col gap-2">
              {content.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] text-[rgba(95,255,96,0.5)] mt-[3px] flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  {isLink(item) ? (
                    <a
                      href={item}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] underline transition-colors"
                    >
                      Rule Book
                    </a>
                  ) : (
                    <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.6)] leading-relaxed">
                      {item}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty label={title.toLowerCase()} />
          )}
        </Card>
      </div>
    );
  };

  const TimelineRow = ({ label, date, last }) => (
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
          {fmtDate(date)}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
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
              <div className="flex flex-col gap-0">
                {[
                  ["Registration Opens", hackathon.startDate],
                  ["Registration Closes", hackathon.endDate],
                  ["Submission Opens", hackathon.submissionStartDate],
                  ["Submission Deadline", hackathon.submissionEndDate],
                ].map(([label, date], i, arr) => (
                  <TimelineRow
                    key={label}
                    label={label}
                    date={date}
                    last={i === arr.length - 1}
                  />
                ))}
              </div>
            </Card>

            {/* <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <SubHead icon={Code}>Difficulty</SubHead>
                <Tag>{hackathon.difficulty}</Tag>
              </Card>
              <Card>
                <SubHead icon={Users}>Categories</SubHead>
                <div className="flex flex-wrap gap-1.5">
                  {hackathon.category?.map((cat, i) => (
                    <Tag key={i} color="blue">
                      {cat}
                    </Tag>
                  ))}
                </div>
              </Card>
            </div> */}

            {/* <Card>
              <SubHead>Recommended Tech Stack</SubHead>
              <div className="flex flex-wrap gap-1.5">
                {hackathon.techStackUsed?.map((tech, i) => (
                  <Tag key={i}>{tech}</Tag>
                ))}
              </div>
            </Card> */}
          </div>
        );

      case "prizes": {
        const rewards =
          hackathon.rewards?.length > 0
            ? hackathon.rewards
            : [
                hackathon.prizeMoney1 > 0
                  ? { description: "1st Prize", amount: hackathon.prizeMoney1 }
                  : null,
                hackathon.prizeMoney2 > 0
                  ? { description: "2nd Prize", amount: hackathon.prizeMoney2 }
                  : null,
                hackathon.prizeMoney3 > 0
                  ? { description: "3rd Prize", amount: hackathon.prizeMoney3 }
                  : null,
              ].filter(Boolean);
        const total = rewards.reduce((s, r) => s + (r.amount || 0), 0);
        return (
          <div>
            <SectionHead>Prizes</SectionHead>
            <Card>
              {total > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.55)]">
                    Total prize pool:{" "}
                    <span className="text-[#5fff60] font-semibold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {rewards.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-[rgba(95,255,96,0.06)] last:border-b-0"
                      >
                        <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.5)]">
                          {r.description}
                        </span>
                        <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[#5fff60] text-sm">
                          ₹{r.amount.toLocaleString("en-IN")}
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

      case "themes":
        return <ListSection title="Themes" content={hackathon.themes} />;
      case "submission-guide":
        return (
          <ListSection
            title="Submission Guide"
            content={hackathon.projectSubmission}
          />
        );
      case "judging":
        return (
          <ListSection
            title="Judging Criteria"
            content={hackathon.evaluationCriteria}
          />
        );
      case "rules":
        return (
          <ListSection
            title="Rules & Guidelines"
            content={hackathon.TandCforHackathon}
          />
        );
      case "about":
        return <SimpleSection title="About" content={hackathon.aboutUs} />;
      case "refMaterial":
        return (
          <RefSection
            title="Reference Material"
            content={hackathon.refMaterial}
          />
        );

      case "faqs": {
        const faqs = hackathon.FAQs || [];
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

      case "discussion":
        return <ChatInterface hackathonId={hackathon._id} />;
      case "upvote":
        return <Upvote />;
      case "gallery":
        return (
          <div>
            <SectionHead>Event Gallery</SectionHead>
            <Gallery />
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

  const ResultsSection = ({ hackathonId }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/hackathons/${hackathonId}/results`
      )
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(setResults)
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
    const maxPts = Math.max(...results.map((r) => r.hackathonPoints || 0), 1);

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
              const pct = ((sub.hackathonPoints / maxPts) * 100).toFixed(1);
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
                        {sub.hackathonPoints}
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
                      {sub.hackathonPoints}
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

  return (
    <>
      <FontStyle />
      <main className="flex-1 px-4 py-6 md:px-7 md:py-8 font-[family-name:'JetBrains_Mono',monospace] overflow-hidden">
        <div className="max-w-3xl mx-auto">{renderContent()}</div>
      </main>
    </>
  );
};
