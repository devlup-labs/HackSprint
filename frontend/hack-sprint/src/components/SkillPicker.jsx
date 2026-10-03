import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SkillsAPI } from "../api/skills.api.js";
import "../pages/Styles/AllHackathons.css";

// Job-board-style skill search: start typing and the matching skills from
// our catalog (the DB) appear, pick one to add it. There is deliberately no
// "browse everything" list — the catalog spans dozens of fields.
const SkillPicker = ({ selected = [], onAdd, disabled = false }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      SkillsAPI.search(q, 8, controller.signal)
        .then((res) => {
          const chosen = new Set(selected.map((s) => s.toLowerCase()));
          setResults((res.data.skills || []).filter((s) => !chosen.has(s.name.toLowerCase())));
          setActive(0);
          setLoading(false);
        })
        .catch((err) => {
          if (err.code !== "ERR_CANCELED") setLoading(false);
        });
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected]);

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = async (skill) => {
    await onAdd(skill.name);
    setQuery("");
    setResults([]);
    setActive(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgba(var(--hk-accent-rgb),0.5)] pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search skills to add…"
          autoComplete="off"
          className="w-full bg-[rgba(var(--hk-input-bg),0.7)] border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.12)] rounded-[3px] pl-8 pr-3 py-2 text-[0.7rem] text-[var(--hk-text)] placeholder-[rgba(var(--hk-text-rgb),0.5)] dark:placeholder-[rgba(var(--hk-accent-rgb),0.22)] font-[family-name:'JetBrains_Mono',monospace] focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.42)] transition-all disabled:opacity-50"
        />
      </div>

      {showPanel && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-[3px] border border-[rgba(var(--hk-card-border-rgb),0.2)] dark:border-[rgba(var(--hk-card-border-rgb),0.2)] bg-[rgb(var(--hk-card-bg))] shadow-xl"
        >
          {loading && results.length === 0 ? (
            <li className="px-3 py-2.5 text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.6)] dark:text-[rgba(var(--hk-text-rgb),0.4)]">
              Searching…
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2.5 text-[0.65rem] text-[rgba(var(--hk-text-rgb),0.6)] dark:text-[rgba(var(--hk-text-rgb),0.4)]">
              No matching skill in our catalog.
            </li>
          ) : (
            results.map((s, i) => (
              <li
                key={s.name}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex flex-col gap-0.5 px-3 py-2 cursor-pointer text-[0.7rem] ${
                  i === active
                    ? "bg-[rgba(var(--hk-accent-rgb),0.12)] text-[var(--hk-accent-solid)]"
                    : "text-[var(--hk-text)]"
                }`}
              >
                <span>{s.name}</span>
                <span className="text-[0.55rem] uppercase tracking-[0.06em] text-[rgba(var(--hk-text-rgb),0.6)] dark:text-[rgba(var(--hk-text-rgb),0.35)]">
                  {s.category}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SkillPicker;
