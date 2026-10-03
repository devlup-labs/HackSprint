import React, { useState, useEffect } from "react";
import { HeroSection } from "../hackathon/HeroSection";
import { SidebarNav } from "../hackathon/SidebarNav";
import { ContentSection } from "../hackathon/ContentSection";
import { SocialShare } from "../hackathon/SocialShare";
import { OnSpotEventPage } from "../hackathon/OnSpotEventPage.jsx";
import { useParams } from "react-router-dom";
import { HackathonAPI } from "../api/hackathon.api.js";
import SEO from "../components/SEO.jsx";
import { SITE_URL } from "../utils/seo.js";
import "./Styles/AllHackathons.css";

const useIsDesktop = () => {
  const query = "(min-width: 1024px)";
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
};

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none bg-[rgba(var(--hk-bg-rgb),0.92)] backdrop-blur-xl"></div>
);

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--hk-bg)] text-[var(--hk-accent-solid)]">
    <GridBackground />
    <div className="relative z-10">
      <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-[var(--hk-accent-solid)]"></div>
      <div
        className="absolute top-0 left-0 w-20 h-20 border-4 border-t-transparent border-b-transparent border-dashed rounded-full animate-spin border-[rgba(var(--hk-accent-rgb),0.5)]"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-[var(--hk-text)]">
        LOADING
      </span>
    </div>
  </div>
);

export default function HackathonDetails() {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await HackathonAPI.getHackathonBySlug(slug);
        if (!res.data) {
          setError("Event not found");
          setHackathon(null);
        } else {
          setHackathon(res.data.hackathon);
        }
      } catch {
        setError("Failed to load event details. Please try again later.");
        setHackathon(null);
      }
      setLoading(false);
    };
    loadData();
  }, [slug]);

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--hk-bg)] text-center p-8 relative">
        <GridBackground />
        <div className="relative z-10 bg-[rgba(var(--hk-card-bg),0.7)] backdrop-blur-xl border border-[rgba(var(--hk-red-rgb),0.3)] rounded-xl p-8 shadow-[0_0_40px_rgba(var(--hk-red-rgb),0.1)]">
          <h2 className="text-2xl font-bold text-[rgb(var(--hk-red-rgb))] mb-4">
            Error Loading Page
          </h2>
          <p className="text-[rgba(var(--hk-text-rgb),0.6)] font-mono">{error}</p>
        </div>
      </div>
    );

  if (hackathon.eventFormat === "ON_SPOT") {
    return <OnSpotEventPage hackathon={hackathon} />;
  }

  const phases = hackathon.phases || [];
  const starts = phases.map((p) => new Date(p.startDate)).filter((d) => !isNaN(d));
  const ends = phases.map((p) => new Date(p.endDate)).filter((d) => !isNaN(d));
  const overallStart = starts.length ? new Date(Math.min(...starts)) : null;
  const overallEnd = ends.length ? new Date(Math.max(...ends)) : null;
  const pageUrl = `${SITE_URL}/hackathon/${hackathon.slug}`;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: hackathon.title,
    description: hackathon.subTitle || `${hackathon.title} — hosted on HackSprint.`,
    url: pageUrl,
    ...(hackathon.image?.url && { image: [hackathon.image.url] }),
    ...(overallStart && { startDate: overallStart.toISOString() }),
    ...(overallEnd && { endDate: overallEnd.toISOString() }),
    eventAttendanceMode: hackathon.venue
      ? "https://schema.org/OfflineEventAttendanceMode"
      : "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: hackathon.venue
      ? { "@type": "Place", name: hackathon.venue }
      : { "@type": "VirtualLocation", url: pageUrl },
    organizer: { "@type": "Organization", name: "HackSprint", url: SITE_URL },
  };

  return (
    <div className="min-h-screen bg-[var(--hk-bg)] backdrop-blur-xl relative text-[var(--hk-text)]">
      <SEO
        title={hackathon.title}
        description={
          hackathon.subTitle ||
          `Register for ${hackathon.title} on HackSprint — form a team, submit your project, and get judged.`
        }
        path={`/hackathon/${hackathon.slug}`}
        image={hackathon.image?.url}
        jsonLd={eventJsonLd}
      />
      <GridBackground />

      <div className="relative z-10">
        <HeroSection
          title={hackathon.title}
          subTitle={hackathon.subTitle}
          venue={hackathon.venue}
          participantCount={hackathon.numParticipants || 0}
          prizes={hackathon.prizes}
          imageUrl={hackathon.image?.url || "/assets/hackathon-banner.png"}
          hackathonId={hackathon._id}
          slug={hackathon.slug}
          phases={hackathon.phases}
          participationType={hackathon.participationType}
          maxTeamSize={hackathon.maxTeamSize}
        />

        <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto">
          <SidebarNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            showVoting={hackathon.votingConfig?.enabled}
            showResult={hackathon.showResult}
            showJudging={
              hackathon.judgingConfig?.minScore != null ||
              hackathon.judgingConfig?.maxScore != null
            }
          />

          <ContentSection activeSection={activeSection} hackathon={hackathon} />

          {isDesktop && (
            <div className="hidden lg:block">
              <SocialShare hackathonId={hackathon._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
