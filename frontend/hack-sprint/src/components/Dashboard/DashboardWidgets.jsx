import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Compass, Flame, Trophy, UsersRound, Sparkles } from "lucide-react";
import { HackathonAPI } from "../../api/hackathon.api.js";
import { DailyAPI } from "../../api/daily.api.js";
import { DAILY_ANSWERED_EVENT } from "../Daily/DailyChallenge.jsx";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const Panel = ({ children, className = "" }) => (
  <div
    className={`ud-card relative bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[4px] backdrop-blur-sm p-5 ${className}`}
  >
    {children}
  </div>
);

const Head = ({ icon: Icon, children }) => (
  <h3 className={`${syne} font-extrabold text-[var(--hk-text)] text-[0.92rem] tracking-tight mb-3 flex items-center`}>
    <Icon size={13} className="mr-1.5 text-[rgba(var(--hk-accent-rgb),0.8)] dark:text-[rgba(var(--hk-accent-rgb),0.5)]" />
    {children}
  </h3>
);

const muted = "text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.45)]";

const relative = (ms) => {
  const abs = Math.abs(ms);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h ${mins % 60}m`;
  return `${Math.max(mins, 1)}m`;
};

const ago = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days >= 30) return new Date(iso).toLocaleDateString();
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours}h ago`;
  return "just now";
};

// Nearest thing that needs the user's attention across their registered
// hackathons: a phase that's open and closing, or one that starts soon.
export const UpNextCard = ({ registrations }) => {
  const navigate = useNavigate();

  const next = useMemo(() => {
    const now = Date.now();
    let best = null;
    for (const reg of registrations) {
      const hack = reg.hackathon;
      if (!hack?.phases) continue;
      for (const phase of hack.phases) {
        if (phase.isActive === false) continue;
        const start = new Date(phase.startDate).getTime();
        const end = new Date(phase.endDate).getTime();
        if (end < now) continue;
        const open = start <= now;
        const when = open ? end : start;
        if (!best || when < best.when) {
          best = { when, open, phase: phase.phaseName || phase.phaseType, hack };
        }
      }
    }
    return best;
  }, [registrations]);

  return (
    <Panel>
      <Head icon={CalendarClock}>Up next</Head>
      {next ? (
        <button onClick={() => navigate(`/hackathon/${next.hack.slug}`)} className="w-full text-left cursor-pointer group">
          <div className={`${mono} text-[0.55rem] tracking-[0.12em] uppercase ${muted}`}>
            {next.open ? "Closes in" : "Starts in"}
          </div>
          <div className={`${syne} font-extrabold text-[1.35rem] leading-tight text-[var(--hk-accent-solid)]`}>
            {relative(next.when - Date.now())}
          </div>
          <div className={`${mono} mt-2 text-[0.66rem] leading-snug text-[var(--hk-text)] group-hover:text-[var(--hk-accent-solid)] transition-colors`}>
            {next.phase}
          </div>
          <div className={`${mono} text-[0.6rem] truncate ${muted}`}>{next.hack.title}</div>
        </button>
      ) : (
        <p className={`${mono} text-[0.62rem] leading-relaxed ${muted}`}>
          Nothing due. Register for an event and its next deadline shows up here.
        </p>
      )}
    </Panel>
  );
};

// Built from data the dashboard already has — registrations, teams and the
// daily challenge history — rather than a separate event log.
export const RecentActivity = ({ registrations }) => {
  const [daily, setDaily] = useState([]);

  useEffect(() => {
    const load = () =>
      DailyAPI.getActivity(60)
        .then((res) => setDaily(res.data.days || []))
        .catch(() => setDaily([]));
    load();
    window.addEventListener(DAILY_ANSWERED_EVENT, load);
    return () => window.removeEventListener(DAILY_ANSWERED_EVENT, load);
  }, []);

  const items = useMemo(() => {
    const out = [];
    for (const reg of registrations) {
      const when = reg.registeredAt || reg.createdAt;
      if (!reg.hackathon || !when) continue;
      out.push({ id: `r-${reg._id}`, icon: Trophy, when, text: `Registered for ${reg.hackathon.title}` });
      if (reg.team?.name) {
        out.push({ id: `t-${reg._id}`, icon: UsersRound, when: reg.updatedAt || when, text: `Team ${reg.team.name} · ${reg.hackathon.title}` });
      }
    }
    // Only the latest couple of daily results — otherwise a long streak
    // drowns out everything else in the feed.
    for (const d of daily.slice(-2)) {
      out.push({
        id: `d-${d.date}`,
        icon: Flame,
        when: `${d.date}T12:00:00Z`,
        text: d.correct ? "Solved the daily challenge" : "Attempted the daily challenge",
      });
    }
    return out.sort((a, b) => new Date(b.when) - new Date(a.when)).slice(0, 6);
  }, [registrations, daily]);

  return (
    <Panel>
      <Head icon={Sparkles}>Recent activity</Head>
      {items.length === 0 ? (
        <p className={`${mono} text-[0.62rem] leading-relaxed ${muted}`}>
          Your registrations and daily challenges will show up here.
        </p>
      ) : (
        <ol className="flex flex-col">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <li key={it.id} className="flex gap-3 relative pb-3 last:pb-0">
                {i < items.length - 1 && (
                  <span className="absolute left-[11px] top-6 bottom-0 w-px bg-[rgba(var(--hk-card-border-rgb),0.16)] dark:bg-[rgba(var(--hk-card-border-rgb),0.1)]" />
                )}
                <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-[rgba(var(--hk-accent-rgb),0.1)] border border-[rgba(var(--hk-accent-rgb),0.3)] z-[1]">
                  <Icon size={11} className="text-[var(--hk-accent-solid)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`${mono} text-[0.68rem] leading-snug text-[var(--hk-text)] truncate`}>{it.text}</div>
                  <div className={`${mono} text-[0.55rem] ${muted}`}>{ago(it.when)}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
};

const words = (text) => (text || "").toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);

// Ranks open hackathons by overlap with the user's skills (tech stacks, tags,
// categories and title words); with no skills yet it falls back to what the
// platform lists first.
export const Recommended = ({ skills, registrations }) => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState(null);

  useEffect(() => {
    let cancelled = false;
    HackathonAPI.getHackathons({ limit: 50 })
      .then((res) => !cancelled && setHackathons(res.data.data || []))
      .catch(() => !cancelled && setHackathons([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const picks = useMemo(() => {
    if (!hackathons) return [];
    const joined = new Set(registrations.map((r) => r.hackathon?._id).filter(Boolean));
    const mine = (skills || []).map((s) => s.toLowerCase());

    return hackathons
      .filter((h) => h.lifecycleStatus !== "COMPLETED" && !joined.has(h._id))
      .map((h) => {
        const hay = new Set([
          ...(h.techStacks || []).map((t) => t.toLowerCase()),
          ...(h.tags || []).map((t) => t.toLowerCase()),
          ...(h.category || []).map((t) => t.toLowerCase()),
          ...words(h.title),
        ]);
        const matched = (skills || []).filter((s) => hay.has(s.toLowerCase()) || [...hay].some((w) => w.includes(s.toLowerCase()) && s.length > 2));
        return { h, matched: mine.length ? matched : [], score: matched.length };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [hackathons, skills, registrations]);

  if (hackathons && picks.length === 0) return null;

  return (
    <Panel>
      <Head icon={Compass}>Recommended for you</Head>
      {!hackathons ? (
        <p className={`${mono} text-[0.62rem] ${muted}`}>Finding events…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {picks.map(({ h, matched }) => (
            <div
              key={h._id}
              onClick={() => navigate(`/hackathon/${h.slug}`)}
              className="flex gap-3 bg-[rgba(var(--hk-accent-rgb),0.03)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] rounded-[3px] p-3 cursor-pointer hover:border-[rgba(var(--hk-accent-rgb),0.28)] transition-all"
            >
              {h.image?.url && (
                <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-[2px] overflow-hidden flex-shrink-0">
                  <img src={h.image.url} alt={h.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className={`${syne} font-extrabold text-[var(--hk-text)] text-[0.82rem] tracking-tight truncate`}>{h.title}</h4>
                {h.subTitle && <p className={`${mono} text-[0.6rem] truncate mt-0.5 ${muted}`}>{h.subTitle}</p>}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {matched.length > 0 ? (
                    matched.slice(0, 3).map((m) => (
                      <span key={m} className={`${mono} text-[0.55rem] px-2 py-0.5 rounded-[2px] border border-[rgba(var(--hk-accent-rgb),0.3)] bg-[rgba(var(--hk-accent-rgb),0.07)] text-[var(--hk-accent-solid)]`}>
                        Matches {m}
                      </span>
                    ))
                  ) : (
                    <span className={`${mono} text-[0.55rem] ${muted}`}>
                      {h.lifecycleStatus === "ACTIVE" ? "Live now" : "Upcoming"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
