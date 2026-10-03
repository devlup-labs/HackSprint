import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../pages/Styles/AllHackathons.css";
import { Trophy, Clock, MapPin, Users, Swords, Radio, CheckCircle2, LayoutList, GitFork } from "lucide-react";
import { MatchAPI } from "../api/match.api.js";

const POLL_INTERVAL_MS = 8000;

// Data (names, scores, ranks) deliberately uses the site's body face with
// tabular numerals — the display face is reserved for headings.
const num = "tabular-nums";

const formatScheduled = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const PulseDot = ({ size = 8 }) => (
  <span
    className="inline-block rounded-full flex-shrink-0"
    style={{
      width: size,
      height: size,
      background: "var(--hk-accent-solid)",
      animation: "onspot-pulse 1.6s ease-out infinite",
    }}
  />
);

const Panel = ({ children, className = "" }) => (
  <div
    className={`bg-[rgba(var(--hk-card-bg),0.92)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
  >
    {children}
  </div>
);

const Kpi = ({ icon: Icon, label, value, hint }) => (
  <Panel className="px-5 py-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(var(--hk-accent-rgb),0.1)] text-[var(--hk-accent-solid)] flex-shrink-0">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <div className="text-[0.68rem] font-medium tracking-wide uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold leading-tight text-[var(--hk-text)] ${num} truncate`}>{value}</span>
      </div>
      {hint && <div className="text-xs text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)] truncate">{hint}</div>}
    </div>
  </Panel>
);

// One team line inside a match card. Winners get an accent bar and bold
// weight; losers fade; before a result both read normally.
const TeamRow = ({ team, score, state, compact }) => {
  const winner = state === "winner";
  const loser = state === "loser";
  return (
    <div
      className={`flex items-center justify-between gap-3 ${compact ? "px-3 py-1.5" : "px-4 py-2.5"} relative ${
        winner ? "bg-[rgba(var(--hk-accent-rgb),0.07)]" : ""
      }`}
    >
      {winner && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--hk-accent-solid)]" />}
      <span
        className={`truncate ${compact ? "text-[0.8rem]" : "text-[0.92rem]"} ${
          winner
            ? "font-bold text-[var(--hk-text)]"
            : loser
            ? "font-medium text-[rgba(var(--hk-text-rgb),0.6)] dark:text-[rgba(var(--hk-text-rgb),0.4)]"
            : "font-semibold text-[var(--hk-text)]"
        }`}
      >
        {team?.name || "TBD"}
      </span>
      <span
        className={`${num} flex-shrink-0 ${compact ? "text-[0.85rem]" : "text-lg"} font-bold ${
          winner
            ? "text-[var(--hk-accent-solid)]"
            : loser
            ? "text-[rgba(var(--hk-text-rgb),0.55)] dark:text-[rgba(var(--hk-text-rgb),0.35)]"
            : "text-[var(--hk-text)]"
        }`}
      >
        {score ?? "–"}
      </span>
    </div>
  );
};

const MatchCard = ({ match, number, compact = false }) => {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const winnerId = match.winner?._id;
  const stateOf = (team) => (!isCompleted ? "idle" : winnerId === team?._id ? "winner" : "loser");
  const showScore = isCompleted || isLive;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-[rgba(var(--hk-card-bg),0.95)] ${
        isLive
          ? "border-[rgba(var(--hk-accent-rgb),0.7)] shadow-[0_0_0_3px_rgba(var(--hk-accent-rgb),0.1)]"
          : "border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)]"
      }`}
    >
      {compact && number != null && (
        <div className="px-3 pt-1.5 pb-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)] bg-[rgba(var(--hk-text-rgb),0.03)]">
          Match {number}
        </div>
      )}
      {!compact && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[rgba(var(--hk-card-border-rgb),0.1)] dark:border-[rgba(var(--hk-card-border-rgb),0.07)] bg-[rgba(var(--hk-text-rgb),0.03)]">
          <span className="text-[0.72rem] font-bold uppercase tracking-wide text-[var(--hk-text)]">Match {number}</span>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-wide uppercase text-[var(--hk-accent-solid)]">
              <PulseDot size={6} /> Live now
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-wide uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)]">
              <CheckCircle2 size={12} /> Final
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-wide uppercase text-[rgb(var(--hk-blue-rgb))]">
              <Clock size={12} /> {formatScheduled(match.scheduledAt) || "Scheduled"}
            </span>
          )}
        </div>
      )}
      <TeamRow team={match.teamA} score={showScore ? match.scoreA : null} state={stateOf(match.teamA)} compact={compact} />
      <div className="h-px bg-[rgba(var(--hk-card-border-rgb),0.08)]" />
      <TeamRow team={match.teamB} score={showScore ? match.scoreB : null} state={stateOf(match.teamB)} compact={compact} />
    </div>
  );
};

const StandingsTable = ({ standings }) => (
  <Panel className="overflow-hidden">
    <div className="px-5 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-[var(--hk-accent-solid)]" />
        <h3 className="font-bold text-[1rem] text-[var(--hk-text)]">Standings</h3>
      </div>
      <span className="text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)]">Updates after every match</span>
    </div>
    {standings.length === 0 ? (
      <div className="px-5 pb-6 text-sm text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)]">No teams yet.</div>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[0.64rem] uppercase tracking-wide text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)] border-y border-[rgba(var(--hk-card-border-rgb),0.1)] dark:border-[rgba(var(--hk-card-border-rgb),0.07)] bg-[rgba(var(--hk-text-rgb),0.03)]">
            <th className="text-left font-medium pl-5 pr-2 py-2 w-10">#</th>
            <th className="text-left font-medium px-2 py-2">Team</th>
            <th className="text-right font-medium px-2 py-2">P</th>
            <th className="text-right font-medium pl-2 pr-5 py-2">Stage</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr key={row.team._id} className="border-b border-[rgba(var(--hk-card-border-rgb),0.08)] dark:border-[rgba(var(--hk-card-border-rgb),0.06)] last:border-b-0">
              <td className={`pl-5 pr-2 py-3 ${num} font-bold ${row.rank === 1 ? "text-[var(--hk-accent-solid)]" : "text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)]"}`}>
                {row.rank === 1 && !row.eliminated ? <Trophy size={14} /> : row.rank}
              </td>
              <td className={`px-2 py-3 font-semibold truncate max-w-[140px] ${row.eliminated ? "text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.45)]" : "text-[var(--hk-text)]"}`}>
                {row.team.name}
              </td>
              <td className={`px-2 py-3 text-right ${num} text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.55)]`}>{row.matchesPlayed}</td>
              <td className="pl-2 pr-5 py-3 text-right">
                <span
                  className={`inline-block text-[0.62rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    row.eliminated
                      ? "text-[rgb(var(--hk-red-rgb))] bg-[rgba(var(--hk-red-rgb),0.08)] border-[rgba(var(--hk-red-rgb),0.25)]"
                      : row.matchesPlayed > 0
                      ? "text-[var(--hk-accent-solid)] bg-[rgba(var(--hk-accent-rgb),0.08)] border-[rgba(var(--hk-accent-rgb),0.3)]"
                      : "text-[rgba(var(--hk-text-rgb),0.7)] border-[rgba(var(--hk-card-border-rgb),0.2)]"
                  }`}
                >
                  {row.eliminated ? `Out · ${row.furthestRoundName}` : row.matchesPlayed > 0 ? row.furthestRoundName : "Not started"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </Panel>
);

const BracketView = ({ phases, matchesByPhase }) => (
  <div className="overflow-x-auto pb-2">
    <div className="flex gap-8 min-w-max">
      {phases.map((phase) => {
        const list = matchesByPhase[phase._id] || [];
        return (
          <div key={phase._id} className="w-[250px] flex flex-col">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)] mb-3">
              {phase.phaseName}
            </div>
            <div className="flex flex-col justify-around gap-4 flex-1">
              {list.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[rgba(var(--hk-card-border-rgb),0.25)] px-3 py-6 text-center text-xs text-[rgba(var(--hk-text-rgb),0.65)]">
                  To be decided
                </div>
              ) : (
                list.map((m, i) => <MatchCard key={m._id} match={m} number={i + 1} compact />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const OnSpotMatchesSection = ({ hackathon }) => {
  const matchPhases = useMemo(
    () => (hackathon.phases || []).filter((p) => p.phaseType === "MATCH_ROUND"),
    [hackathon.phases]
  );

  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [view, setView] = useState("matches");
  const [matchesByPhase, setMatchesByPhase] = useState({});
  const [standings, setStandings] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const [standingsRes, ...roundRes] = await Promise.all([
        MatchAPI.getStandings(hackathon._id),
        ...matchPhases.map((p) => MatchAPI.getRoundMatchesPublic(hackathon._id, p._id).catch(() => ({ data: { matches: [] } }))),
      ]);
      const next = {};
      matchPhases.forEach((p, i) => {
        next[p._id] = roundRes[i].data.matches || [];
      });
      setMatchesByPhase(next);
      setStandings(standingsRes.data.standings || []);
      setUpdatedAt(new Date());
    } catch {
      // best-effort — a transient poll failure shouldn't clear the page
    }
  }, [hackathon._id, matchPhases]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const allMatches = useMemo(() => Object.values(matchesByPhase).flat(), [matchesByPhase]);
  const liveCount = allMatches.filter((m) => m.status === "LIVE").length;
  const playedCount = allMatches.filter((m) => m.status === "COMPLETED").length;

  // Default the selected round to the one with action: live first, then the
  // first round with anything unfinished, then the last round.
  const currentPhase = useMemo(() => {
    const withLive = matchPhases.find((p) => (matchesByPhase[p._id] || []).some((m) => m.status === "LIVE"));
    if (withLive) return withLive;
    const pending = matchPhases.find((p) => (matchesByPhase[p._id] || []).some((m) => m.status !== "COMPLETED"));
    return pending || matchPhases[matchPhases.length - 1] || null;
  }, [matchPhases, matchesByPhase]);

  const activePhaseId = selectedPhaseId || currentPhase?._id || null;
  const matches = (activePhaseId && matchesByPhase[activePhaseId]) || [];

  const phaseState = (p) => {
    const list = matchesByPhase[p._id] || [];
    if (list.some((m) => m.status === "LIVE")) return "live";
    if (list.length > 0 && list.every((m) => m.status === "COMPLETED")) return "done";
    return "upcoming";
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-[1100px] mx-auto">
      <style>{`
        @keyframes onspot-pulse {
          0% { box-shadow: 0 0 0 0 rgba(var(--hk-accent-rgb),0.55); }
          70% { box-shadow: 0 0 0 8px rgba(var(--hk-accent-rgb),0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--hk-accent-rgb),0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {liveCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[rgba(var(--hk-accent-rgb),0.1)] border border-[rgba(var(--hk-accent-rgb),0.35)] text-[var(--hk-accent-solid)]">
                <PulseDot size={6} /> Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border border-[rgba(var(--hk-card-border-rgb),0.2)] text-[rgba(var(--hk-text-rgb),0.75)]">
                <Radio size={11} /> Tournament
              </span>
            )}
            {updatedAt && (
              <span className="text-[0.68rem] text-[rgba(var(--hk-text-rgb),0.65)] dark:text-[rgba(var(--hk-text-rgb),0.4)]">
                Auto-refreshing · updated {updatedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
          <h1 className="font-display font-extrabold text-[var(--hk-text)] text-3xl sm:text-4xl tracking-tight leading-tight">
            {hackathon.title}
          </h1>
          {hackathon.venue && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-[rgba(var(--hk-text-rgb),0.8)] dark:text-[rgba(var(--hk-text-rgb),0.55)]">
              <MapPin size={14} className="text-[var(--hk-accent-solid)] flex-shrink-0" />
              {hackathon.venue}
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi icon={Users} label="Teams" value={standings.length} hint={`${standings.filter((s) => !s.eliminated).length} still in`} />
        <Kpi icon={Swords} label="Matches played" value={playedCount} hint={`of ${allMatches.length} scheduled`} />
        <Kpi icon={Radio} label="Live now" value={liveCount} hint={liveCount > 0 ? "In progress" : "Nothing live"} />
        <Kpi icon={Trophy} label="Current round" value={currentPhase?.phaseName || "–"} hint={`${matchPhases.length} rounds total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="min-w-0 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex flex-wrap gap-1.5 p-1 rounded-lg bg-[rgba(var(--hk-text-rgb),0.05)]">
              {matchPhases.map((phase) => {
                const st = phaseState(phase);
                const active = activePhaseId === phase._id;
                return (
                  <button
                    key={phase._id}
                    onClick={() => {
                      setSelectedPhaseId(phase._id);
                      setView("matches");
                    }}
                    className={`inline-flex items-center gap-2 text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      active && view === "matches"
                        ? "bg-[rgba(var(--hk-card-bg),1)] text-[var(--hk-text)] shadow-sm"
                        : "text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)] hover:text-[var(--hk-text)]"
                    }`}
                  >
                    {st === "live" ? (
                      <PulseDot size={6} />
                    ) : st === "done" ? (
                      <CheckCircle2 size={13} className="text-[var(--hk-accent-solid)]" />
                    ) : (
                      <Clock size={13} className="opacity-60" />
                    )}
                    {phase.phaseName}
                  </button>
                );
              })}
            </div>

            <div className="inline-flex p-1 rounded-lg bg-[rgba(var(--hk-text-rgb),0.05)]">
              {[
                { id: "matches", label: "Matches", icon: LayoutList },
                { id: "bracket", label: "Bracket", icon: GitFork },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`inline-flex items-center gap-1.5 text-[0.8rem] font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    view === id
                      ? "bg-[rgba(var(--hk-card-bg),1)] text-[var(--hk-text)] shadow-sm"
                      : "text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)] hover:text-[var(--hk-text)]"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {view === "bracket" ? (
            <Panel className="p-5">
              <BracketView phases={matchPhases} matchesByPhase={matchesByPhase} />
            </Panel>
          ) : matches.length === 0 ? (
            <Panel className="p-10 text-center text-sm text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.45)]">
              No matches scheduled for this round yet.
            </Panel>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matches.map((match, i) => (
                <MatchCard key={match._id} match={match} number={i + 1} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          <StandingsTable standings={standings} />
        </div>
      </div>
    </div>
  );
};
