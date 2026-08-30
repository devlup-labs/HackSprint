import React, { useEffect, useMemo, useState } from "react";
import { Trophy, Clock } from "lucide-react";
import { MatchAPI } from "../api/match.api.js";

const POLL_INTERVAL_MS = 8000;

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const PulseDot = ({ size = 8, color = "#5fff60" }) => (
  <span
    className="relative inline-block rounded-full"
    style={{
      width: size,
      height: size,
      background: color,
      boxShadow: `0 0 0 0 ${color}88`,
      animation: "onspot-pulse 1.6s ease-out infinite",
    }}
  />
);

const StatusPill = ({ children, tone }) => {
  const tones = {
    live: "bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.4)] text-[#5fff60]",
    scheduled: "bg-[rgba(96,200,255,0.06)] border-[rgba(96,200,255,0.2)] text-[rgba(96,200,255,0.7)]",
    completed: "bg-[rgba(255,96,96,0.06)] border-[rgba(255,96,96,0.2)] text-[rgba(255,150,150,0.65)]",
  };
  return (
    <span
      className={`${mono} inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-[2px] border font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

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

const MatchCard = ({ match }) => {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const winnerId = match.winner?._id;
  const scheduledLabel = formatScheduled(match.scheduledAt);

  return (
    <div
      className={`relative bg-[rgba(10,12,10,0.88)] border rounded-[4px] px-4 py-3 ${
        isLive
          ? "border-[rgba(95,255,96,0.4)] shadow-[0_0_20px_rgba(95,255,96,0.08)]"
          : isCompleted
          ? "border-[rgba(255,96,96,0.14)]"
          : "border-[rgba(95,255,96,0.1)]"
      }`}
    >
      <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
        {isLive ? (
          <StatusPill tone="live">
            <PulseDot size={6} />
            Live Now
          </StatusPill>
        ) : isCompleted ? (
          <StatusPill tone="completed">Completed</StatusPill>
        ) : (
          <StatusPill tone="scheduled">
            <Clock size={10} />
            {scheduledLabel || "Scheduled"}
          </StatusPill>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center justify-end gap-2.5 min-w-0">
          <span
            className={`${syne} font-extrabold text-sm truncate ${
              isCompleted && winnerId === match.teamA?._id
                ? "text-[#5fff60]"
                : isCompleted
                ? "text-[rgba(200,220,200,0.5)]"
                : "text-white"
            }`}
          >
            {match.teamA?.name || "TBD"}
          </span>
          {(isCompleted || isLive) && match.scoreA != null && (
            <span
              className={`${syne} font-extrabold text-xl leading-none flex-shrink-0 ${
                isCompleted && winnerId === match.teamA?._id
                  ? "text-[#5fff60]"
                  : isCompleted
                  ? "text-[rgba(180,220,180,0.3)]"
                  : "text-white"
              }`}
            >
              {match.scoreA}
            </span>
          )}
        </div>
        <div className={`${syne} font-extrabold text-[0.65rem] text-[rgba(120,160,120,0.45)]`}>
          VS
        </div>
        <div className="flex items-center gap-2.5 min-w-0">
          {(isCompleted || isLive) && match.scoreB != null && (
            <span
              className={`${syne} font-extrabold text-xl leading-none flex-shrink-0 ${
                isCompleted && winnerId === match.teamB?._id
                  ? "text-[#5fff60]"
                  : isCompleted
                  ? "text-[rgba(180,220,180,0.3)]"
                  : "text-white"
              }`}
            >
              {match.scoreB}
            </span>
          )}
          <span
            className={`${syne} font-extrabold text-sm truncate ${
              isCompleted && winnerId === match.teamB?._id
                ? "text-[#5fff60]"
                : isCompleted
                ? "text-[rgba(200,220,200,0.5)]"
                : "text-white"
            }`}
          >
            {match.teamB?.name || "TBD"}
          </span>
        </div>
      </div>
    </div>
  );
};

const StandingsRow = ({ row }) => (
  <div className="flex items-center gap-3 py-2.5 px-2 border-b border-[rgba(95,255,96,0.08)] last:border-b-0">
    <span
      className={`${syne} font-extrabold text-sm w-5 ${
        row.rank === 1 ? "text-[#5fff60]" : "text-[rgba(180,220,180,0.5)]"
      }`}
    >
      {row.rank}
    </span>
    <div className="flex-1 min-w-0">
      <div className="text-white font-semibold text-[0.78rem] truncate">
        {row.team.name}
      </div>
      <div
        className={`text-[0.58rem] tracking-[0.06em] uppercase ${
          row.eliminated ? "text-[rgba(255,150,150,0.55)]" : "text-[rgba(95,255,96,0.55)]"
        }`}
      >
        {row.eliminated
          ? `Eliminated · ${row.furthestRoundName}`
          : row.matchesPlayed > 0
          ? `Reached ${row.furthestRoundName}`
          : "Not Started"}
      </div>
    </div>
    {row.rank === 1 && !row.eliminated && (
      <Trophy size={14} className="text-[#5fff60] flex-shrink-0" />
    )}
  </div>
);

export const OnSpotMatchesSection = ({ hackathon }) => {
  const matchPhases = useMemo(
    () => (hackathon.phases || []).filter((p) => p.phaseType === "MATCH_ROUND"),
    [hackathon.phases]
  );

  const [selectedPhaseId, setSelectedPhaseId] = useState(matchPhases[0]?._id || null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    if (!selectedPhaseId && matchPhases.length) {
      setSelectedPhaseId(matchPhases[0]._id);
    }
  }, [matchPhases, selectedPhaseId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [matchesRes, standingsRes] = await Promise.all([
          selectedPhaseId
            ? MatchAPI.getRoundMatchesPublic(hackathon._id, selectedPhaseId)
            : Promise.resolve({ data: { matches: [] } }),
          MatchAPI.getStandings(hackathon._id),
        ]);
        if (cancelled) return;
        setMatches(matchesRes.data.matches || []);
        setStandings(standingsRes.data.standings || []);
      } catch {
        // best-effort — a transient poll failure shouldn't clear the page
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hackathon._id, selectedPhaseId]);

  const isLiveNow = matches.some((m) => m.status === "LIVE");

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1000px]">
      <style>{`
        @keyframes onspot-pulse {
          0% { box-shadow: 0 0 0 0 rgba(95,255,96,0.55); }
          70% { box-shadow: 0 0 0 9px rgba(95,255,96,0); }
          100% { box-shadow: 0 0 0 0 rgba(95,255,96,0); }
        }
      `}</style>

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h2 className={`${syne} font-extrabold text-white text-xl`}>Live Bracket</h2>
        {isLiveNow && (
          <StatusPill tone="live">
            <PulseDot size={6} />
            Live Now
          </StatusPill>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex gap-2.5 flex-wrap">
            {matchPhases.map((phase) => (
              <button
                key={phase._id}
                onClick={() => setSelectedPhaseId(phase._id)}
                className={`${mono} inline-flex items-center gap-2 text-[0.72rem] tracking-[0.1em] uppercase px-4 py-2 rounded-[3px] border transition-all ${
                  selectedPhaseId === phase._id
                    ? "bg-[rgba(95,255,96,0.12)] border-[rgba(95,255,96,0.45)] text-[#5fff60] font-bold"
                    : "bg-[rgba(20,22,20,0.6)] border-[rgba(95,255,96,0.1)] text-[rgba(180,220,180,0.4)]"
                }`}
              >
                {phase.phaseName}
              </button>
            ))}
          </div>

          {matches.length === 0 ? (
            <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-8 text-center text-[rgba(180,220,180,0.4)] text-sm">
              No matches scheduled for this round yet.
            </div>
          ) : (
            matches.map((match) => <MatchCard key={match._id} match={match} />)
          )}
        </div>

        <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-5 lg:sticky lg:top-6">
          <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />

          <div className="flex items-center gap-2 mb-1">
            <Trophy size={15} className="text-[#5fff60]" />
            <span className={`${syne} font-extrabold text-[0.95rem] text-[#5fff60]`}>
              Live Standings
            </span>
          </div>
          <div className="text-[0.58rem] tracking-[0.08em] uppercase text-[rgba(120,160,120,0.4)] mb-4">
            Updates after every match
          </div>

          {standings.length === 0 ? (
            <div className="text-[0.7rem] text-[rgba(180,220,180,0.4)] py-4 text-center">
              No teams yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {standings.map((row) => (
                <StandingsRow key={row.team._id} row={row} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
