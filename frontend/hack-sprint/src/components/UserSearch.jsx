import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { ProfileAPI } from "../api/profile.api.js";

const UserSearch = ({ fullWidth = false }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Debounced, cancellable search: only the latest keystroke's request survives —
  // any still-in-flight request from a previous keystroke is aborted so a slow
  // stale response can never overwrite a newer one.
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await ProfileAPI.searchProfiles(trimmed, { signal: controller.signal });
        setResults(res.data.results || []);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (userName) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/u/${userName}`);
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`} ref={ref}>
      <div className={`flex items-center gap-1.5 h-8 px-2.5 rounded-[3px] border border-[rgba(95,255,96,0.12)] bg-[rgba(8,10,8,0.6)] focus-within:border-[rgba(95,255,96,0.35)] transition-all ${fullWidth ? "w-full" : ""}`}>
        <Search size={13} className="text-[rgba(95,255,96,0.4)] flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search username…"
          className={`bg-transparent border-none outline-none text-[0.68rem] text-white placeholder:text-[rgba(180,220,180,0.3)] transition-all ${
            fullWidth ? "w-full" : "w-28 sm:w-36 focus:w-40 sm:focus:w-48"
          }`}
        />
      </div>

      {showDropdown && (
        <div className={`absolute right-0 mt-2 max-w-[90vw] bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.15)] rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50 ${fullWidth ? "left-0 w-full" : "w-64"}`}>
          <span className="absolute top-[-1px] left-[-1px] w-[8px] h-[8px] border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-[8px] h-[8px] border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-[0.62rem] text-[rgba(180,220,180,0.4)]">Searching…</div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-[0.62rem] text-[rgba(180,220,180,0.4)]">No users found.</div>
            ) : (
              results.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelect(u.userName)}
                  className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-[rgba(95,255,96,0.05)] border-b border-[rgba(95,255,96,0.06)] last:border-b-0"
                >
                  <div className="w-7 h-7 rounded-full bg-[rgba(95,255,96,0.07)] border border-[rgba(95,255,96,0.2)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {u.image?.url ? (
                      <img src={u.image.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={12} className="text-[rgba(95,255,96,0.6)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold text-white truncate">{u.name}</p>
                    <p className="text-[0.58rem] text-[rgba(180,220,180,0.45)] truncate">@{u.userName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
