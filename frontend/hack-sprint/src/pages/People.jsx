import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PeopleAPI } from "../api/people.api.js";
import SEO from "../components/SEO.jsx";
import CampusMap from "../components/People/CampusMap.jsx";
import FieldDialog from "../components/People/FieldDialog.jsx";

export default function PeoplePage() {
  const [districts, setDistricts] = useState(null);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [sentIds, setSentIds] = useState(() => new Set());

  useEffect(() => {
    PeopleAPI.campus()
      .then((res) => setDistricts(res.data.districts || []))
      .catch(() => setError("The campus is closed for a moment. Try again shortly."));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e) => e.key === "Escape" && setActiveId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  const active = districts?.find((d) => d.id === activeId);

  return (
    <div className="bg-background text-foreground">
      <SEO title="Community" description="Explore the HackSprint campus: pick a building, meet the people in that field, say hi." path="/people" />

      {error ? (
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">{error}</div>
      ) : !districts ? (
        <div className="h-[calc(100vh-56px)] min-h-[520px] animate-pulse bg-secondary/30" />
      ) : (
        <>
          <div className="relative h-[calc(100vh-56px)] min-h-[520px]">
            <CampusMap districts={districts} activeId={activeId} onSelect={setActiveId} />
            <div className="absolute top-4 left-5 pointer-events-none">
              <div className="text-[0.68rem] font-bold tracking-[0.16em] uppercase text-primary">Community</div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight">The campus</h1>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground pointer-events-none whitespace-nowrap">Select a building to meet the people inside</div>
          </div>

          {/* Phones: the plan is small, so the same fields as plain buttons */}
          <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 border-t border-border">
            {districts.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-full border border-border bg-card text-foreground cursor-pointer"
              >
                {d.name}
              </button>
            ))}
          </div>
        </>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          onMouseDown={(e) => e.target === e.currentTarget && setActiveId(null)}
        >
          <FieldDialog
            key={active.id}
            district={active}
            sentIds={sentIds}
            onSent={(id) => setSentIds((prev) => new Set(prev).add(id))}
            onClose={() => setActiveId(null)}
          />
        </div>
      )}
    </div>
  );
}
