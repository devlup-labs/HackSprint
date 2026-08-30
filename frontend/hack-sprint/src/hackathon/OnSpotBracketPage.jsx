import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Swords, MapPin } from "lucide-react";
import { HackathonAPI } from "../api/hackathon.api.js";
import { OnSpotMatchesSection } from "./OnSpotMatchesSection.jsx";
import SEO from "../components/SEO.jsx";

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none bg-[rgba(8,10,8,0.92)] backdrop-blur-xl" />
);

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black text-green-400">
    <GridBackground />
    <div className="relative z-10">
      <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-[#5fff60]" />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono">
        LOADING
      </span>
    </div>
  </div>
);

export const OnSpotBracketPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
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
          setError("Hackathon not found");
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
        <div className="relative z-10 bg-black/70 backdrop-blur-xl border border-red-500/30 rounded-xl p-8 shadow-[0_0_40px_rgba(255,0,0,0.1)]">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Page</h2>
          <p className="text-gray-400 font-mono">{error || "Event not found"}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[rgba(8,10,8,0.92)] backdrop-blur-xl relative text-white">
      <SEO
        title={`Live Bracket — ${hackathon.title}`}
        description={`Live bracket, matches and standings for ${hackathon.title} on HackSprint.`}
        path={`/hackathon/${hackathon.slug}/bracket`}
        image={hackathon.image?.url}
      />
      <GridBackground />

      <div className="relative z-10">
        <div className="border-b border-[rgba(95,255,96,0.1)] bg-[#0a0a0a]">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-5">
            <button
              onClick={() => navigate(`/hackathon/${hackathon.slug}`)}
              className="font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.7rem] tracking-[0.08em] uppercase text-[rgba(180,220,180,0.5)] hover:text-[#5fff60] transition-colors mb-4 cursor-pointer"
            >
              <ArrowLeft size={13} />
              Back to Event
            </button>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 bg-[rgba(95,255,96,0.08)] rounded-[3px] flex items-center justify-center border border-[rgba(95,255,96,0.25)] flex-shrink-0">
                <Swords size={18} className="text-[#5fff60]" />
              </div>
              <div>
                <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl sm:text-2xl leading-tight">
                  {hackathon.title}
                </h1>
                {hackathon.venue && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} className="text-[rgba(95,255,96,0.5)] flex-shrink-0" />
                    <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] text-[rgba(180,220,180,0.5)]">
                      {hackathon.venue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto">
          <OnSpotMatchesSection hackathon={hackathon} />
        </div>
      </div>
    </div>
  );
};
