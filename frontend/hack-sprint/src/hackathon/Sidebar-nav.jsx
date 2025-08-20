export const SidebarNav = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: "overview", label: "Overview", icon: "" },
    { id: "themes", label: "Themes", icon: "" },
    { id: "prizes", label: "Prizes", icon: "" },
    { id: "submission-guide", label: "Submission Guide", icon: "" },
    { id: "judging", label: "Judging Criteria", icon: "" },
    { id: "rules", label: "Rules", icon: "" },
    { id: "faqs", label: "FAQs", icon: "" },
    { id: "about", label: "About us", icon: "" },
    { id: "discussion", label: "Discussion", icon: "" },
  ];

  return (
    <nav className="w-72 bg-surface/30 backdrop-blur-sm border-r border-green-500 min-h-screen sticky top-16">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
          <span className="w-2 h-2 bg-hero-primary rounded-full"></span>
          Navigation
        </h3>
        <ul className="space-y-1">
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 group border ${
                  activeSection === section.id
                    ? "bg-hero-primary/20 text-hero-primary font-medium border-green-500 shadow-lg shadow-hero-primary/10"
                    : "text-text-secondary hover:text-foreground hover:bg-surface-hover hover:translate-x-1 border-green-500"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-base group-hover:scale-110 transition-transform duration-200">
                  {section.icon}
                </span>
                <span>{section.label}</span>
                {activeSection === section.id && (
                  <div className="ml-auto w-2 h-2 bg-hero-primary rounded-full animate-pulse"></div>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-green-500">
          <div className="text-xs text-text-secondary text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-hero-primary rounded-full animate-pulse"></div>
              <span>Event Details</span>
              <div
                className="w-1 h-1 bg-hero-secondary rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};