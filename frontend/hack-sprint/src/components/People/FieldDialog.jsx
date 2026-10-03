import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { X, ChevronLeft, ChevronRight, MapPin, Send, Check, Loader2, Search } from "lucide-react";
import { PeopleAPI } from "../../api/people.api.js";
import { ConnectionsAPI } from "../../api/connections.api.js";
import { Avatar } from "./PeopleBits.jsx";

// One field of the campus, shown as a focused dialog: a person at a time with
// quiet previous / next controls, and the message composer inline instead of
// a second window.
const FieldDialog = ({ district, sentIds, onSent, onClose }) => {
  const [deck, setDeck] = useState(district.people);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const loadingRef = useRef(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [pinned, setPinned] = useState(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || hasNext === false) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await PeopleAPI.district(district.id, page + 1, 5);
      const more = res.data.people || [];
      setDeck((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...more.filter((p) => !seen.has(p._id))];
      });
      setPage((p) => p + 1);
      setHasNext(!!res.data.pagination?.hasNext);
    } catch {
      setHasNext(false);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [district.id, page, hasNext]);

  useEffect(() => {
    if (index >= deck.length - 2) loadMore();
  }, [index, deck.length, loadMore]);

  // Look someone up by username or name, in any field.
  useEffect(() => {
    const q = query.trim().replace(/^@/, "");
    if (q.length < 2) { setResults(null); setSearching(false); return; }
    const controller = new AbortController();
    setSearching(true);
    const t = setTimeout(() => {
      PeopleAPI.search(q, controller.signal)
        .then((res) => setResults(res.data.people || []))
        .catch((err) => { if (err.code !== "ERR_CANCELED") setResults([]); })
        .finally(() => !controller.signal.aborted && setSearching(false));
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query]);

  const person = pinned || deck[index];
  const sent = person && sentIds.has(person._id);
  const total = hasNext === false ? deck.length : null;
  const canPrev = !pinned && index > 0;
  const canNext = !pinned && (index < deck.length - 1 || hasNext !== false);
  const showResults = !pinned && query.trim().replace(/^@/, "").length >= 2;

  const go = useCallback((dir) => {
    setComposing(false);
    setMessage("");
    setIndex((i) => Math.max(0, i + dir));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (composing || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight" && canNext) go(1);
      if (e.key === "ArrowLeft" && canPrev) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composing, canNext, canPrev, go]);

  const send = async () => {
    if (!message.trim() || sending || !person) return;
    setSending(true);
    try {
      await ConnectionsAPI.sendRequest(person._id, message.trim());
      onSent(person._id);
      toast.success(`Request sent to ${person.name}`);
      setComposing(false);
      setMessage("");
    } catch (err) {
      if (err.response?.status === 409) {
        onSent(person._id);
        toast.error("You've already reached out to this person");
        setComposing(false);
      } else if (err.response?.status === 401) {
        toast.error("Log in to message someone");
      } else {
        toast.error("Couldn't send that — try again");
      }
    } finally {
      setSending(false);
    }
  };

  const monogram = district.name.split(/[ &]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div role="dialog" aria-modal="true" aria-label={district.name} className="relative w-full max-w-[480px] bg-card text-card-foreground border border-border rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="h-[3px] bg-primary" />

      <header className="flex items-start gap-3.5 px-6 pt-5 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg border border-border bg-secondary flex items-center justify-center font-display font-extrabold text-sm tracking-tight flex-shrink-0">{monogram}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted-foreground">Field</div>
          <h2 className="font-display font-extrabold text-lg leading-tight tracking-tight">{district.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{district.tagline}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-2 -mt-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center cursor-pointer transition-colors">
          <X size={16} />
        </button>
      </header>

      <div className="px-6 pt-4">
        <label className="relative block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPinned(null); setComposing(false); }}
            placeholder="Find someone by username or name"
            aria-label="Search people by username"
            className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-8 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setPinned(null); }} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"><X size={12} /></button>
          )}
        </label>
      </div>

      <div className="px-6 py-5 min-h-[270px]">
        {showResults ? (
          <div>
            <div className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-2">{searching ? "Searching…" : results?.length ? "Results" : ""}</div>
            {!searching && results && results.length === 0 ? (
              <div className="py-12 text-center">
                <div className="font-semibold text-sm">No one matches “{query.trim()}”</div>
                <p className="text-xs text-muted-foreground mt-1">Check the spelling, or leave out the @.</p>
              </div>
            ) : (
              <div className="flex flex-col -mx-2">
                {(results || []).map((p) => (
                  <button key={p._id} onClick={() => { setPinned(p); setComposing(false); }} className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-secondary cursor-pointer transition-colors">
                    <Avatar person={p} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.userName ? `@${p.userName}` : ""}{p.skills?.length ? ` · ${p.skills.slice(0, 2).join(", ")}` : ""}</div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : !person ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-center">
            {loadingMore ? <Loader2 size={20} className="animate-spin text-muted-foreground" /> : (
              <>
                <div className="font-semibold">Nobody here yet</div>
                <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">People appear once they add a skill from this field to their profile.</p>
              </>
            )}
          </div>
        ) : composing ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar person={person} size={40} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Message {person.name}</div>
                <div className="text-xs text-muted-foreground">If they reply, you're connected and can keep chatting.</div>
              </div>
            </div>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder="Introduce yourself, propose teaming up, or ask a question…"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 resize-none"
            />
            <div className="mt-1.5 text-right text-[0.7rem] text-muted-foreground tabular-nums">{message.length} / 500</div>
          </div>
        ) : (
          <div key={person._id} className="animate-[dlgIn_.22s_ease]">
            <div className="flex items-center gap-4">
              <Avatar person={person} size={64} />
              <div className="min-w-0">
                <div className="font-display font-extrabold text-xl leading-tight truncate">{person.name}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                  {person.userName && <span>@{person.userName}</span>}
                  {person.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{person.location}</span>}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[3.75rem]">{person.bio || "Building something on HackSprint."}</p>
            {(person.skills || []).length > 0 && (
              <div className="mt-4">
                <div className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {person.skills.slice(0, 8).map((s) => (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-md border ${district.skills.includes(s) ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground"}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-border bg-secondary/40">
        {composing ? (
          <>
            <button onClick={() => setComposing(false)} className="text-sm font-medium px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">Back</button>
            <button onClick={send} disabled={!message.trim() || sending} className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity">
              {sending ? "Sending…" : "Send request"} <Send size={14} />
            </button>
          </>
        ) : showResults ? (
          <span className="text-xs text-muted-foreground">Search covers every field</span>
        ) : (
          <>
            {pinned ? (
              <button onClick={() => setPinned(null)} className="inline-flex items-center gap-1 text-sm font-medium px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"><ChevronLeft size={15} /> Back</button>
            ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <button onClick={() => go(-1)} disabled={!canPrev} aria-label="Previous person" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-default cursor-pointer transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-xs tabular-nums min-w-[44px] text-center">{person ? `${index + 1} / ${total ?? `${deck.length}+`}` : "—"}</span>
              <button onClick={() => go(1)} disabled={!canNext} aria-label="Next person" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-default cursor-pointer transition-colors"><ChevronRight size={16} /></button>
            </div>
            )}
            {person && (
              sent ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary px-3 py-2"><Check size={15} /> Request sent</span>
              ) : (
                <button onClick={() => setComposing(true)} className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 cursor-pointer transition-opacity">Say hi</button>
              )
            )}
          </>
        )}
      </footer>
      <style>{`@keyframes dlgIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
};

export default FieldDialog;
