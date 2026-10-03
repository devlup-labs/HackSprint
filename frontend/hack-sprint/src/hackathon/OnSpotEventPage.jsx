import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, ChevronRight } from "lucide-react";
import { HeroSection } from "./HeroSection";
import { SidebarNav } from "./SidebarNav";
import { ContentSection } from "./ContentSection";
import { SocialShare } from "./SocialShare";
import SEO from "../components/SEO.jsx";

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none bg-[rgba(var(--hk-bg-rgb),0.92)] backdrop-blur-xl" />
);

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

export const OnSpotEventPage = ({ hackathon }) => {
  const isDesktop = useIsDesktop();
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();

  const handleEnterEvent = () => {
    navigate(`/hackathon/${hackathon.slug}/bracket`);
  };

  return (
    <div className="min-h-screen bg-[rgba(var(--hk-bg-rgb),0.92)] backdrop-blur-xl relative text-[var(--hk-text)]">
      <SEO
        title={hackathon.title}
        description={hackathon.subTitle || `${hackathon.title} — a live on-spot event on HackSprint.`}
        path={`/hackathon/${hackathon.slug}`}
        image={hackathon.image?.url}
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
          eventFormat="ON_SPOT"
          extraAction={
            <button
              onClick={handleEnterEvent}
              className="font-[family-name:'JetBrains_Mono',monospace] w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs tracking-[0.1em] uppercase px-5 py-2.5 rounded-[3px] border cursor-pointer transition-all duration-150 bg-[rgba(var(--hk-accent-rgb),0.1)] border-[rgba(var(--hk-card-border-rgb),0.64)] dark:border-[rgba(var(--hk-card-border-rgb),0.4)] text-[var(--hk-accent-solid)] hover:bg-[rgba(var(--hk-accent-rgb),0.18)] hover:shadow-[0_0_20px_rgba(var(--hk-accent-rgb),0.15)]"
            >
              <Swords size={14} />
              Enter
              <ChevronRight size={14} />
            </button>
          }
        />

        <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto">
          <SidebarNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
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
};
