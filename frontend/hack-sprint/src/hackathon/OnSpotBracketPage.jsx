import React, { useState, useEffect } from "react";
import "../pages/Styles/AllHackathons.css";
import { useParams } from "react-router-dom";
import { HackathonAPI } from "../api/hackathon.api.js";
import { OnSpotMatchesSection } from "./OnSpotMatchesSection.jsx";
import SEO from "../components/SEO.jsx";

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none bg-[rgba(var(--hk-bg-rgb),0.92)] backdrop-blur-xl" />
);

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--hk-bg)] text-[var(--hk-accent-solid)]">
    <GridBackground />
    <div className="relative z-10">
      <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-[var(--hk-accent-solid)]" />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono">
        LOADING
      </span>
    </div>
  </div>
);

export const OnSpotBracketPage = () => {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await HackathonAPI.getHackathonBySlug(slug);
        if (!res.data) {
          setError("Event not found");
        } else {
          setHackathon(res.data.hackathon);
        }
      } catch {
        setError("Failed to load this event. Please try again later.");
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <Loader />;

  if (error || !hackathon)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-center p-8 relative">
        <GridBackground />
        <div className="relative z-10 bg-[rgba(var(--hk-card-bg),0.9)] backdrop-blur-xl border border-[rgba(var(--hk-red-rgb),0.3)] rounded-xl p-8 shadow-[0_0_40px_rgba(255,0,0,0.1)]">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Page</h2>
          <p className="text-gray-400 font-mono">{error || "Event not found"}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[rgba(var(--hk-bg-rgb),0.92)] backdrop-blur-xl relative text-[var(--hk-text)]">
      <SEO
        title={`Live Bracket — ${hackathon.title}`}
        description={`Live bracket, matches and standings for ${hackathon.title} on HackSprint.`}
        path={`/hackathon/${hackathon.slug}/bracket`}
        image={hackathon.image?.url}
      />
      <GridBackground />

      <div className="relative z-10">
        <OnSpotMatchesSection hackathon={hackathon} />
      </div>
    </div>
  );
};
