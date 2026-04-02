import React from "react";
import {
  LayoutDashboard,
  Award,
  FileText,
  Scale,
  CircleHelp,
  Info,
  MessagesSquare,
  NotebookPen,
  Target as ThemeIcon,
  ThumbsUp,
  Images,
} from "lucide-react";

export const SidebarNav = ({
  activeSection,
  onSectionChange,
  showVoting,
  showResult,
}) => {
  const allSections = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "about", label: "About", icon: Info },
    { id: "prizes", label: "Prizes", icon: Award },
    { id: "submission-guide", label: "Submission", icon: NotebookPen },
    { id: "judging", label: "Judging", icon: Scale },
    { id: "results", label: "Results", icon: Award, requiresResult: true },
    { id: "upvote", label: "Voting", icon: ThumbsUp, requiresResult: true },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "rules", label: "Rules", icon: FileText },
    { id: "faqs", label: "FAQs", icon: CircleHelp },
    { id: "refMaterial", label: "Reference", icon: FileText },
    { id: "discussion", label: "Discussion", icon: MessagesSquare },
  ];

  const sections = allSections.filter((s) => {
    if (s.requiresVoting && !showVoting) return false;
    if (s.requiresResult && !showResult) return false;
    return true;
  });

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      <aside className="w-full lg:w-56 lg:min-h-[calc(100vh-88px)] lg:sticky top-[88px] shrink-0">
        <div
          className="
          h-full px-3 py-3 lg:px-4 lg:py-5
          bg-[rgba(8,10,8,0.92)] backdrop-blur-xl
          border-b border-[rgba(95,255,96,0.08)]
          lg:border-b-0 lg:border-r lg:border-[rgba(95,255,96,0.08)]
        "
        >
          <div className="hidden lg:block font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.38)] border-l-2 border-[rgba(95,255,96,0.28)] pl-2 mb-4">
            Navigation
          </div>

          <ul
            className="
            flex flex-row lg:flex-col
            gap-1
            overflow-x-auto lg:overflow-x-visible
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          "
          >
            {sections.map((section) => {
              const active = activeSection === section.id;
              const Icon = section.icon;
              return (
                <li key={section.id} className="flex-shrink-0">
                  <button
                    onClick={() => onSectionChange(section.id)}
                    className={`
                      font-[family-name:'JetBrains_Mono',monospace]
                      w-full text-left
                      inline-flex items-center gap-2
                      text-[0.62rem] tracking-[0.06em]
                      px-3 py-2 rounded-[3px] border
                      cursor-pointer transition-all duration-150 group
                      whitespace-nowrap
                      ${
                        active
                          ? "bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.28)] text-[#5fff60]"
                          : "bg-transparent border-transparent text-[rgba(180,220,180,0.42)] hover:bg-[rgba(95,255,96,0.05)] hover:border-[rgba(95,255,96,0.14)] hover:text-[rgba(180,220,180,0.75)]"
                      }
                    `}
                  >
                    <Icon
                      size={13}
                      className={`flex-shrink-0 transition-colors ${
                        active
                          ? "text-[#5fff60]"
                          : "text-[rgba(95,255,96,0.3)] group-hover:text-[rgba(95,255,96,0.6)]"
                      }`}
                    />

                    <span>{section.label}</span>

                    {active && (
                      <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-pulse flex-shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
};
