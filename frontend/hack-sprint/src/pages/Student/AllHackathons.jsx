import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import SEO from "../../components/SEO.jsx";
import {
  Users,
  User,
  Calendar,
  Timer,
  Code,
  Trophy,
  Zap,
  Search,
  Filter,
  X,
  Star,
  MapPin,
} from "lucide-react";
import { useHackathons } from "../../hooks/useHackathons";
import "../Styles/AllHackathons.css";

/* ── Grid background ── */
const GridBackground = () => <div className="hk-bg" />;

/* ── Phase helper — only used for the active-phase progress bar,
   everything else comes pre-derived from useHackathons ── */
const getActivePhase = (hackathon) => hackathon.phases?.find((p) => p.isActive);

const getCountdownTarget = (hackathon) => {
  if (hackathon.lifecycleStatus === "UPCOMING") return hackathon.overallStart;
  if (hackathon.lifecycleStatus === "ACTIVE") return hackathon.submissionEnd;
  return null;
};

/* ── Skeleton ── */
const Skeleton = ({ className }) => (
  <div
    className={`relative overflow-hidden bg-[rgba(var(--hk-accent-rgb),0.04)] rounded-[3px] hk-shimmer ${className}`}
  />
);

const HackathonCardSkeleton = () => (
  <div className="font-jb border border-[rgba(var(--hk-accent-rgb),0.08)] bg-[rgba(var(--hk-card-bg),0.6)] rounded-[4px] overflow-hidden">
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-72 lg:h-52 h-44 w-full relative flex-shrink-0">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-3 left-3">
          <Skeleton className="w-20 h-5 rounded-[2px]" />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {[44, 56, 38].map((w, i) => (
            <Skeleton
              key={i}
              className="h-5 rounded-[2px]"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 px-5 py-5 space-y-3">
        <Skeleton className="h-5 w-2/3 rounded-[2px]" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-14 rounded-[2px]" />
          <Skeleton className="h-4 w-18 rounded-[2px]" />
        </div>
        <Skeleton className="h-3 w-full rounded-[2px]" />
        <Skeleton className="h-3 w-4/5 rounded-[2px]" />
        <div className="flex gap-5 pt-2">
          {[64, 80, 88].map((w, i) => (
            <Skeleton
              key={i}
              className="h-3 rounded-[2px]"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ── Tab button ── */
const TabButton = ({
  active,
  onClick,
  children,
  count,
  icon: Icon,
  color = "green",
}) => {
  const colors = {
    green: {
      active:
        "bg-[rgba(var(--hk-accent-rgb),0.1)] border-[rgba(var(--hk-accent-rgb),0.3)] text-[var(--hk-accent-solid)]",
      dot: "bg-[var(--hk-accent-solid)]",
    },
    blue: {
      active:
        "bg-[rgba(var(--hk-blue-rgb),0.1)] border-[rgba(var(--hk-blue-rgb),0.3)] text-[rgb(var(--hk-blue-rgb))]",
      dot: "bg-[rgb(var(--hk-blue-rgb))]",
    },
    red: {
      active:
        "bg-[rgba(var(--hk-red-rgb),0.08)] border-[rgba(var(--hk-red-rgb),0.25)] text-[rgb(var(--hk-red-rgb))]",
      dot: "bg-[rgb(var(--hk-red-rgb))]",
    },
  };
  const c = colors[color];
  return (
    <button
      onClick={onClick}
      className={`font-jb relative inline-flex items-center gap-2 text-[0.65rem] tracking-[0.08em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer transition-all duration-150
        ${
          active
            ? `${c.active}`
            : "bg-[rgba(var(--hk-card-bg),0.6)] border-[rgba(var(--hk-accent-rgb),0.1)] text-[rgba(var(--hk-text-rgb),0.45)] hover:border-[rgba(var(--hk-accent-rgb),0.22)] hover:text-[rgba(var(--hk-text-rgb),0.7)]"
        }`}
    >
      <Icon size={12} />
      {children}
      <span
        className={`font-jb text-[0.55rem] px-1.5 py-[1px] rounded-[2px] ${
          active
            ? "bg-[rgba(var(--hk-accent-rgb),0.15)] text-inherit"
            : "bg-[rgba(var(--hk-accent-rgb),0.05)] text-[rgba(var(--hk-text-rgb),0.35)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
};

/* ── Hackathon card ── */
const HackathonCard = ({ hackathon }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getProgress = (start, end) => {
    const now = Date.now(),
      s = new Date(start).getTime(),
      e = new Date(end).getTime();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return (((now - s) / (e - s)) * 100).toFixed(2);
  };

  const getCountdown = (target) => {
    if (!target) return "";
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${d}d ${h}h ${m}m`;
  };

  const countdownTarget = getCountdownTarget(hackathon);

  useEffect(() => {
    if (!countdownTarget) return;
    setCountdown(getCountdown(countdownTarget));
    const t = setInterval(() => {
      setCountdown(getCountdown(countdownTarget));
    }, 1000);
    return () => clearInterval(t);
  }, [countdownTarget]);

  const status = hackathon.lifecycleStatus;
  const isCompleted = status === "COMPLETED";
  const isActive = status === "ACTIVE";

  const statusStyle = {
    dot: "bg-[var(--hk-accent-solid)]",
    text: "text-[var(--hk-accent-solid)]",
    border: "border-[rgba(var(--hk-accent-rgb),0.2)]",
    bg: "bg-[rgba(var(--hk-accent-rgb),0.06)]",
  };

  const activePhase = getActivePhase(hackathon);
  const isFeatured = !!hackathon.featured;

  return (
    <div
      className={`hk-card font-jb relative bg-[rgba(var(--hk-card-bg),0.88)] rounded-[4px] backdrop-blur-sm cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-[2px] ${
        isFeatured
          ? "border border-[rgba(var(--hk-accent-rgb),0.4)] shadow-[0_0_20px_rgba(var(--hk-accent-rgb),0.1)] hover:border-[rgba(var(--hk-accent-rgb),0.65)] hover:shadow-[0_0_32px_rgba(var(--hk-accent-rgb),0.18)]"
          : "border border-[rgba(var(--hk-card-border-rgb),0.16)] dark:border-[rgba(var(--hk-card-border-rgb),0.1)] hover:border-[rgba(var(--hk-accent-rgb),0.32)] hover:shadow-[0_0_28px_rgba(var(--hk-accent-rgb),0.08)]"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/hackathon/${hackathon.slug}`)}
    >
      {/* featured banner */}
      {isFeatured && (
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5 py-1 bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)]">
          <Star size={10} className="fill-current" />
          <span className="font-jb text-[0.55rem] font-bold tracking-[0.18em] uppercase">
            Featured
          </span>
        </div>
      )}

      {/* hover sweep */}
      {hovered && (
        <div className="hk-card-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[rgba(var(--hk-accent-rgb),0.04)] to-transparent pointer-events-none z-0" />
      )}

      <div className={`flex flex-col lg:flex-row ${isFeatured ? "pt-[22px]" : ""}`}>
        {/* ── Image ── */}
        <div className="lg:w-72 h-44 lg:h-auto lg:min-h-52 lg:self-stretch w-full relative flex-shrink-0 overflow-hidden bg-[rgba(var(--hk-accent-rgb),0.04)]">
          {hackathon.image?.url && !imgError ? (
            <>
              <img
                src={hackathon.image.url}
                alt={hackathon.title}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                } ${hovered ? "scale-105" : "scale-100"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--hk-card-bg),0.7)] via-transparent to-[rgba(var(--hk-card-bg),0.2)]" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Code size={32} className="text-[rgba(var(--hk-accent-rgb),0.25)]" />
              <span className="font-jb text-[0.55rem] tracking-[0.16em] uppercase text-[rgba(var(--hk-accent-rgb),0.22)]">
                Event
              </span>
            </div>
          )}

          {/* status badge */}
          <div className="absolute top-3 left-3 z-10">
            <div
              className={`font-jb inline-flex items-center gap-1.5 text-[0.55rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-[2px] border backdrop-blur-sm ${statusStyle.bg} ${statusStyle.border}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${
                  isActive ? "animate-pulse" : ""
                }`}
              />
              <span className={statusStyle.text}>{status?.toLowerCase()}</span>
            </div>
          </div>

          {/* tech chips */}
          <div className="absolute bottom-3 left-3 flex gap-1 z-10 flex-wrap">
            {(hackathon.techStacks || []).slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="font-jb text-[0.55rem] tracking-[0.05em] px-1.5 py-[3px] rounded-[2px] bg-[rgba(var(--hk-card-bg),0.8)] border border-[rgba(var(--hk-accent-rgb),0.18)] text-[rgba(var(--hk-accent-rgb),0.65)] backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
            {hackathon.techStacks?.length > 3 && (
              <span className="font-jb text-[0.55rem] px-1.5 py-[3px] rounded-[2px] bg-[rgba(var(--hk-card-bg),0.8)] border border-[rgba(var(--hk-accent-rgb),0.12)] text-[rgba(var(--hk-accent-rgb),0.4)]">
                +{hackathon.techStacks.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 px-5 py-4 relative z-10">
          {/* countdown — top right */}
          <div className="absolute top-3 right-3">
            <div
              className={`font-jb inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.06em] px-2.5 py-1 rounded-[2px] border ${
                statusStyle.bg
              } ${statusStyle.border} ${isActive ? "hk-blink" : ""}`}
            >
              <Timer size={10} className={statusStyle.text} />
              <span className={statusStyle.text}>
                {isCompleted
                  ? "Ended"
                  : countdown || getCountdown(countdownTarget)}
              </span>
            </div>
          </div>

          <div className="pr-28">
            {/* title + tags */}
            <div className="mb-3">
              <h3 className="font-syne font-extrabold text-[var(--hk-text)] text-[1.05rem] leading-tight tracking-tight mb-2">
                {hackathon.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`font-jb inline-flex items-center gap-1 text-[0.55rem] tracking-[0.08em] uppercase px-2 py-[3px] rounded-[2px] border ${
                    hackathon.participationType === "TEAM"
                      ? "bg-[rgba(var(--hk-purple-rgb),0.07)] border-[rgba(var(--hk-purple-rgb),0.2)] text-[rgba(var(--hk-purple-rgb),0.85)]"
                      : "bg-[rgba(var(--hk-text-rgb),0.05)] border-[rgba(var(--hk-text-rgb),0.14)] text-[rgba(var(--hk-text-rgb),0.7)]"
                  }`}
                >
                  {hackathon.participationType === "TEAM" ? (
                    <Users size={9} />
                  ) : (
                    <User size={9} />
                  )}
                  {hackathon.participationType === "TEAM"
                    ? `Team · up to ${hackathon.maxTeamSize || "N"}`
                    : "Individual"}
                </span>
                {hackathon.difficulty && (
                  <span className="font-jb text-[0.55rem] tracking-[0.08em] uppercase px-2 py-[3px] rounded-[2px] bg-[rgba(var(--hk-amber-rgb),0.1)] border border-[rgba(var(--hk-amber-rgb),0.25)] text-[rgba(var(--hk-amber-rgb),0.9)]">
                    {hackathon.difficulty}
                  </span>
                )}
                {(hackathon.category || []).map((cat, i) => (
                  <span
                    key={i}
                    className="font-jb text-[0.55rem] tracking-[0.08em] uppercase px-2 py-[3px] rounded-[2px] bg-[rgba(var(--hk-blue-rgb),0.08)] border border-[rgba(var(--hk-blue-rgb),0.2)] text-[rgba(var(--hk-blue-rgb),0.85)]"
                  >
                    {cat}
                  </span>
                ))}
                {(hackathon.tags || []).slice(0, 2).map((tag, i) => (
                  <span
                    key={`tag-${i}`}
                    className="font-jb text-[0.55rem] tracking-[0.08em] uppercase px-2 py-[3px] rounded-[2px] bg-[rgba(var(--hk-accent-rgb),0.06)] border border-[rgba(var(--hk-accent-rgb),0.14)] text-[rgba(var(--hk-accent-rgb),0.75)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* description */}
            <p className="font-jb text-[0.67rem] text-[rgba(var(--hk-text-rgb),0.55)] leading-relaxed mb-4 line-clamp-2">
              {hackathon.description}
            </p>

            {/* meta row */}
            <div className="flex flex-wrap gap-4">
              <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.5)]">
                <Users size={11} className="text-[rgba(var(--hk-accent-rgb),0.6)]" />
                {hackathon.numParticipants || 0} participants
              </span>
              {hackathon.totalPrize > 0 && (
                <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.5)]">
                  <Trophy size={11} className="text-[rgba(var(--hk-amber-rgb),0.8)]" />₹
                  {hackathon.totalPrize.toLocaleString("en-IN")}
                </span>
              )}
              {hackathon.formattedDate && (
                <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.5)]">
                  <Calendar size={11} className="text-[rgba(var(--hk-accent-rgb),0.6)]" />
                  {hackathon.formattedDate}
                </span>
              )}
              {hackathon.venue && (
                <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.5)]">
                  <MapPin size={11} className="text-[rgba(var(--hk-accent-rgb),0.6)]" />
                  {hackathon.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* progress bar — tracks the currently active phase */}
      {isActive && activePhase && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(var(--hk-accent-rgb),0.06)]">
          <div
            className="h-full bg-[var(--hk-accent-solid)] hk-progress transition-all duration-300"
            style={{
              width: `${getProgress(
                activePhase.startDate,
                activePhase.endDate
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const Hackathons = () => {
  const { data: hackathonsData, isLoading } = useHackathons();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const activeHackathons = hackathonsData?.active || [];
  const completedHackathons = hackathonsData?.completed || [];
  const upcomingHackathons = hackathonsData?.upcoming || [];

  // Filter option sets come from whatever the backend actually returned —
  // category/tags are freeform strings set by organizers, not a fixed enum,
  // so a hardcoded options list would silently drift from real data.
  // Derived from hackathonsData directly (stable reference from react-query)
  // rather than the activeHackathons/etc. fallbacks, which get a fresh []
  // on every render while loading.
  const allHackathons = useMemo(() => {
    if (!hackathonsData) return [];
    return [
      ...(hackathonsData.active || []),
      ...(hackathonsData.upcoming || []),
      ...(hackathonsData.completed || []),
    ];
  }, [hackathonsData]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    allHackathons.forEach((h) => (h.category || []).forEach((c) => c && set.add(c)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allHackathons]);

  const availableTags = useMemo(() => {
    const set = new Set();
    allHackathons.forEach((h) => (h.tags || []).forEach((t) => t && set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allHackathons]);

  const availableDifficulties = useMemo(() => {
    const set = new Set();
    allHackathons.forEach((h) => h.difficulty && set.add(h.difficulty));
    // Keep a sensible progression, but only show difficulties that actually occur.
    const order = ["Beginner", "Intermediate", "Advanced", "Expert", "Tough"];
    return order.filter((d) => set.has(d));
  }, [allHackathons]);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  const getCurrentHackathons = () => {
    const map = {
      active: activeHackathons,
      upcoming: upcomingHackathons,
      completed: completedHackathons,
    };
    return (map[activeTab] || [])
      .filter((h) => {
        const matchSearch = h.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchCat =
          !selectedCategory ||
          (h.category || []).some(
            (c) => c.toLowerCase() === selectedCategory.toLowerCase()
          );
        const matchTag =
          !selectedTag ||
          (h.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        return (
          matchSearch &&
          matchCat &&
          matchTag &&
          (!selectedDifficulty || h.difficulty === selectedDifficulty)
        );
      })
      .sort((a, b) => {
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (af !== bf) return bf - af;
        if (af) return (a.featuredOrder || 0) - (b.featuredOrder || 0);
        return 0;
      });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedTag("");
    setSelectedDifficulty("");
  };
  const hasFilters =
    searchTerm || selectedCategory || selectedTag || selectedDifficulty;

  const tabMeta = {
    active: {
      label: "Active",
      icon: Zap,
      count: activeHackathons.length,
      color: "green",
    },
    upcoming: {
      label: "Upcoming",
      icon: Calendar,
      count: upcomingHackathons.length,
      color: "green",
    },
    completed: {
      label: "Completed",
      icon: Timer,
      count: completedHackathons.length,
      color: "green",
    },
  };

  const tabTitle = {
    active: "Active Events",
    upcoming: "Upcoming Events",
    completed: "Completed Events",
  };
  const tabGradient = {
    active: "from-[var(--hk-accent-solid)] to-[var(--hk-accent-solid)]",
    upcoming: "from-[var(--hk-accent-solid)] to-[var(--hk-accent-solid)]",
    completed: "from-[var(--hk-accent-solid)] to-[var(--hk-accent-solid)]",
  };

  const selectCls =
    "font-jb w-full px-3 py-2 text-[0.65rem] tracking-[0.05em] border border-[rgba(var(--hk-accent-rgb),0.12)] rounded-[3px] bg-[rgba(var(--hk-input-bg),0.7)] text-[var(--hk-text)] focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.38)] focus:shadow-[0_0_0_2px_rgba(var(--hk-accent-rgb),0.05)] transition-all [color-scheme:light] dark:[color-scheme:dark]";

  return (
    <>
      <SEO
        title="Browse Events"
        description="Browse live, upcoming, and completed events on HackSprint. Register solo or with a team and start building."
        path="/hackathons"
      />
      <div className="font-jb hk-bg min-h-screen bg-[var(--hk-bg)] text-[var(--hk-text)] overflow-hidden -mt-16">
        <Loader />

        <div className="relative z-10 max-w-[1100px] mx-auto px-5 pt-32 pb-20">
          {/* ── Tabs ── */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(tabMeta).map(
              ([key, { label, icon, count, color }]) => (
                <TabButton
                  key={key}
                  active={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  count={count}
                  icon={icon}
                  color={color}
                >
                  {label}
                </TabButton>
              )
            )}
          </div>

          {/* ── Search + Filters ── */}
          <div className="mb-8 flex flex-col gap-3">
            {/* search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(var(--hk-accent-rgb),0.35)] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search events by title…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-jb w-full pl-9 pr-10 py-2.5 text-[0.68rem] tracking-[0.04em] border border-[rgba(var(--hk-accent-rgb),0.12)] rounded-[3px] bg-[rgba(var(--hk-input-bg),0.7)] text-[var(--hk-text)] placeholder-[rgba(var(--hk-placeholder-rgb),0.25)] focus:outline-none focus:border-[rgba(var(--hk-accent-rgb),0.38)] focus:shadow-[0_0_0_2px_rgba(var(--hk-accent-rgb),0.05)] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(var(--hk-accent-rgb),0.4)] hover:text-[var(--hk-accent-solid)] transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`font-jb inline-flex items-center gap-1.5 text-[0.62rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border cursor-pointer transition-all duration-150
                  ${
                    showFilters || hasFilters
                      ? "bg-[rgba(var(--hk-accent-rgb),0.1)] border-[rgba(var(--hk-accent-rgb),0.3)] text-[var(--hk-accent-solid)]"
                      : "bg-[rgba(var(--hk-card-bg),0.6)] border-[rgba(var(--hk-accent-rgb),0.1)] text-[rgba(var(--hk-text-rgb),0.45)] hover:border-[rgba(var(--hk-accent-rgb),0.22)] hover:text-[rgba(var(--hk-text-rgb),0.7)]"
                  }`}
              >
                <Filter size={11} /> Filters
                {hasFilters && (
                  <span className="font-jb text-[0.52rem] px-1.5 py-[1px] rounded-[2px] bg-[rgba(var(--hk-accent-rgb),0.15)] text-[var(--hk-accent-solid)]">
                    {
                      [searchTerm, selectedCategory, selectedTag, selectedDifficulty].filter(
                        Boolean
                      ).length
                    }
                  </span>
                )}
              </button>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border border-[rgba(var(--hk-red-rgb),0.2)] bg-[rgba(var(--hk-red-rgb),0.06)] text-[rgba(var(--hk-red-rgb),0.8)] hover:text-[rgb(var(--hk-red-rgb))] hover:border-[rgba(var(--hk-red-rgb),0.38)] transition-all cursor-pointer"
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>

            {/* filter panel */}
            {showFilters && (
              <div className="relative flex flex-wrap gap-4 p-4 bg-[rgba(var(--hk-card-bg),0.88)] border border-[rgba(var(--hk-accent-rgb),0.12)] rounded-[4px]">
                <span className="absolute top-[-1px] left-[-1px] w-[8px] h-[8px] border-t-2 border-l-2 border-[rgba(var(--hk-accent-rgb),0.4)]" />
                <span className="absolute bottom-[-1px] right-[-1px] w-[8px] h-[8px] border-b-2 border-r-2 border-[rgba(var(--hk-accent-rgb),0.4)]" />
                <div className="min-w-[160px]">
                  <label className="font-jb block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),0.6)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={selectCls}
                    disabled={availableCategories.length === 0}
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[160px]">
                  <label className="font-jb block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),0.6)] mb-1.5">
                    Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className={selectCls}
                    disabled={availableTags.length === 0}
                  >
                    <option value="">All Tags</option>
                    {availableTags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[160px]">
                  <label className="font-jb block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(var(--hk-accent-rgb),0.6)] mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={selectCls}
                    disabled={availableDifficulties.length === 0}
                  >
                    <option value="">All Difficulties</option>
                    {availableDifficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── Section heading ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h2
              className={`font-syne font-extrabold text-transparent bg-clip-text bg-gradient-to-b ${tabGradient[activeTab]} flex items-center gap-2 sm:gap-3`}
              style={{ fontSize: "clamp(1.2rem,4vw,2.4rem)" }}
            >
              {activeTab === "active" && (
                <span className="relative inline-flex">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--hk-accent-solid)] inline-block" />
                  <span className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--hk-accent-solid)] animate-ping opacity-60" />
                </span>
              )}

              {activeTab === "upcoming" && (
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--hk-accent-solid)] inline-block" />
              )}

              {activeTab === "completed" && (
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--hk-accent-solid)] opacity-50 inline-block" />
              )}

              {tabTitle[activeTab]}
            </h2>

            <div className="font-jb text-[0.6rem] sm:text-[0.65rem] tracking-[0.08em] text-[rgba(var(--hk-text-rgb),0.5)]">
              <span className="text-[var(--hk-accent-solid)]">
                {loading ? "…" : getCurrentHackathons().length}
              </span>{" "}
              {activeTab}
              {hasFilters && (
                <span className="text-[rgba(var(--hk-amber-rgb),0.9)] ml-2">(filtered)</span>
              )}
            </div>
          </div>

          {/* ── Cards ── */}
          <div className="flex flex-col gap-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <HackathonCardSkeleton key={i} />
              ))
            ) : getCurrentHackathons().length > 0 ? (
              getCurrentHackathons().map((h) => (
                <HackathonCard key={h.slug} hackathon={h} />
              ))
            ) : (
              <div className="font-jb text-center py-16 flex flex-col items-center gap-3">
                <span className="text-5xl opacity-15">
                  {hasFilters ? "🔍" : "🏆"}
                </span>
                <p className="text-[0.75rem] text-[rgba(var(--hk-text-rgb),0.5)] tracking-[0.06em]">
                  {hasFilters
                    ? "No events match your filters"
                    : `No ${activeTab} events`}
                </p>
                <p className="text-[0.62rem] text-[rgba(var(--hk-text-rgb),0.35)]">
                  {hasFilters
                    ? "Try adjusting your search or filters"
                    : "Check back later for updates!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hackathons;
