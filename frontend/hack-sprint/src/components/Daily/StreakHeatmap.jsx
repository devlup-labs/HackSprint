import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Flame } from "lucide-react";
import { DailyAPI } from "../../api/daily.api.js";
import { DAILY_OPEN_EVENT, DAILY_ANSWERED_EVENT } from "./DailyChallenge.jsx";

const DAYS = 371; // 53 weeks, so the grid always ends on today's column
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parse = (key) => new Date(`${key}T12:00:00Z`);
const fmt = (d) => d.toISOString().slice(0, 10);

const StreakHeatmap = () => {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await DailyAPI.getActivity(DAYS);
      setData(res.data);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DAILY_ANSWERED_EVENT, load);
    return () => window.removeEventListener(DAILY_ANSWERED_EVENT, load);
  }, [load]);

  const { weeks, monthLabels, answeredToday } = useMemo(() => {
    if (!data) return { weeks: [], monthLabels: [], answeredToday: false };
    const byDate = new Map(data.days.map((d) => [d.date, d.correct]));
    const end = parse(data.today);
    // Start on the Sunday that begins the first column.
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (DAYS - 1));
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const cols = [];
    const labels = [];
    let lastMonth = -1;
    for (let c = 0; ; c++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        const d = new Date(start);
        d.setUTCDate(start.getUTCDate() + c * 7 + r);
        const key = fmt(d);
        const future = key > data.today;
        col.push({ key, future, status: future ? null : byDate.has(key) ? (byDate.get(key) ? "right" : "wrong") : "none" });
      }
      cols.push(col);
      const m = parse(col[0].key).getUTCMonth();
      if (m !== lastMonth) {
        labels.push({ col: c, label: MONTHS[m] });
        lastMonth = m;
      }
      if (col[6].key >= data.today) break;
    }
    return { weeks: cols, monthLabels: labels, answeredToday: byDate.has(data.today) };
  }, [data]);

  if (!data) return null;
  const { streak } = data;
  const solved = data.days.filter((d) => d.correct).length;

  const cellCls = {
    none: "bg-[rgba(var(--hk-text-rgb),0.1)] dark:bg-[rgba(var(--hk-text-rgb),0.07)]",
    wrong: "bg-[rgba(var(--hk-amber-rgb),0.55)]",
    right: "bg-[rgb(var(--hk-accent-rgb))]",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-[family-name:'Syne',sans-serif] font-extrabold text-[1.5rem] leading-none text-[var(--hk-text)]">
            <Flame size={22} className="text-[rgb(var(--hk-amber-rgb))]" />
            {streak.current}
            <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] font-medium tracking-[0.08em] uppercase text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)]">
              day streak
            </span>
          </div>
          <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.5)] leading-relaxed">
            Longest {streak.longest} · Solved {solved} in the last year
          </div>
        </div>
        {!answeredToday && (
          <button
            onClick={() => window.dispatchEvent(new Event(DAILY_OPEN_EVENT))}
            className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] tracking-[0.08em] uppercase px-3.5 py-2 rounded-[3px] border border-[var(--hk-accent-solid)] bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] font-bold cursor-pointer hover:brightness-110 transition"
          >
            Solve today's question
          </button>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-max">
          <div className="relative h-4 mb-1 font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)]">
            {monthLabels.map((m) => (
              <span key={m.col} className="absolute" style={{ left: m.col * 14 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell) =>
                  cell.future ? (
                    <span key={cell.key} className="w-[11px] h-[11px]" />
                  ) : (
                    <span
                      key={cell.key}
                      title={`${cell.key}${cell.status === "right" ? " · solved" : cell.status === "wrong" ? " · attempted" : ""}`}
                      className={`w-[11px] h-[11px] rounded-[2px] ${cellCls[cell.status]} ${cell.key === data.today ? "ring-1 ring-[rgba(var(--hk-accent-rgb),0.9)]" : ""}`}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(var(--hk-text-rgb),0.7)] dark:text-[rgba(var(--hk-text-rgb),0.45)]">
        <span className="flex items-center gap-1"><span className={`w-[10px] h-[10px] rounded-[2px] ${cellCls.none}`} /> No answer</span>
        <span className="flex items-center gap-1"><span className={`w-[10px] h-[10px] rounded-[2px] ${cellCls.wrong}`} /> Attempted</span>
        <span className="flex items-center gap-1"><span className={`w-[10px] h-[10px] rounded-[2px] ${cellCls.right}`} /> Solved</span>
      </div>
    </div>
  );
};

export default StreakHeatmap;
