import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import {
  Users,
  Calendar,
  Timer,
  Code,
  Trophy,
  Zap,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useHackathons } from "../../hooks/useHackathons";
import "../Styles/AllHackathons.css";

/* ── Grid background ── */
const GridBackground = () => <div className="hk-bg" />;

/* ── Skeleton ── */
const Skeleton = ({ className }) => (
  <div
    className={`relative overflow-hidden bg-[rgba(95,255,96,0.04)] rounded-[3px] hk-shimmer ${className}`}
  />
);

const HackathonCardSkeleton = () => (
  <div className="font-jb border border-[rgba(95,255,96,0.08)] bg-[rgba(10,12,10,0.6)] rounded-[4px] overflow-hidden">
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
        "bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60]",
      dot: "bg-[#5fff60]",
    },
    blue: {
      active:
        "bg-[rgba(96,200,255,0.1)] border-[rgba(96,200,255,0.3)] text-[#60c8ff]",
      dot: "bg-[#60c8ff]",
    },
    red: {
      active:
        "bg-[rgba(255,96,96,0.08)] border-[rgba(255,96,96,0.25)] text-[#ff9090]",
      dot: "bg-[#ff9090]",
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
            : "bg-[rgba(10,12,10,0.6)] border-[rgba(95,255,96,0.1)] text-[rgba(180,220,180,0.45)] hover:border-[rgba(95,255,96,0.22)] hover:text-[rgba(180,220,180,0.7)]"
        }`}
    >
      {active && (
        <div
          className={`hk-tab-pulse absolute inset-0 rounded-[3px] opacity-20`}
          style={{ background: c.dot }}
        />
      )}
      <Icon size={12} />
      {children}
      <span
        className={`font-jb text-[0.55rem] px-1.5 py-[1px] rounded-[2px] ${
          active
            ? "bg-[rgba(95,255,96,0.15)] text-inherit"
            : "bg-[rgba(95,255,96,0.05)] text-[rgba(180,220,180,0.35)]"
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
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${d}d ${h}h ${m}m`;
  };

  useEffect(() => {
    if (!hackathon.startDate || !hackathon.endDate) return;
    const t = setInterval(() => {
      setCountdown(
        getCountdown(
          hackathon.status === "upcoming"
            ? hackathon.startDate
            : hackathon.submissionEndDate
        )
      );
    }, 1000);
    return () => clearInterval(t);
  }, [
    hackathon.endDate,
    hackathon.submissionEndDate,
    hackathon.startDate,
    hackathon.status,
  ]);

  const isExpired = hackathon.status === "expired";
  const isUpcoming = hackathon.status === "upcoming";
  const isActive = hackathon.status === "active";

  const statusStyle = isExpired
    ? {
        dot: "bg-[#ff6060]",
        text: "text-[#ff9090]",
        border: "border-[rgba(255,96,96,0.2)]",
        bg: "bg-[rgba(255,96,96,0.06)]",
      }
    : isUpcoming
    ? {
        dot: "bg-[#60c8ff]",
        text: "text-[#60c8ff]",
        border: "border-[rgba(96,200,255,0.2)]",
        bg: "bg-[rgba(96,200,255,0.06)]",
      }
    : {
        dot: "bg-[#5fff60]",
        text: "text-[#5fff60]",
        border: "border-[rgba(95,255,96,0.2)]",
        bg: "bg-[rgba(95,255,96,0.06)]",
      };

  const totalPrize = hackathon.rewards?.length
    ? hackathon.rewards.reduce((s, r) => s + (r.amount || 0), 0)
    : (hackathon.prizeMoney1 || 0) +
      (hackathon.prizeMoney2 || 0) +
      (hackathon.prizeMoney3 || 0);

  return (
    <div
      className="hk-card font-jb relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] backdrop-blur-sm cursor-pointer overflow-hidden transition-all duration-300 hover:border-[rgba(95,255,96,0.32)] hover:shadow-[0_0_28px_rgba(95,255,96,0.08)] hover:-translate-y-[2px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (!isUpcoming) navigate(`/hackathon/${hackathon._id}`);
      }}
    >
      {/* hover sweep */}
      {hovered && (
        <div className="hk-card-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.04)] to-transparent pointer-events-none z-0" />
      )}

      <div className="flex flex-col lg:flex-row">
        {/* ── Image ── */}
        <div className="lg:w-72 lg:h-52 h-44 w-full relative flex-shrink-0 overflow-hidden bg-[rgba(95,255,96,0.04)]">
          {hackathon.image && !imgError ? (
            <>
              <img
                src={hackathon.image}
                alt={hackathon.title}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                } ${hovered ? "scale-105" : "scale-100"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,12,10,0.7)] via-transparent to-[rgba(10,12,10,0.2)]" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Code size={32} className="text-[rgba(95,255,96,0.25)]" />
              <span className="font-jb text-[0.55rem] tracking-[0.16em] uppercase text-[rgba(95,255,96,0.22)]">
                Hackathon
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
              <span className={statusStyle.text}>{hackathon.status}</span>
            </div>
          </div>

          {/* tech chips */}
          <div className="absolute bottom-3 left-3 flex gap-1 z-10 flex-wrap">
            {(hackathon.techStack || []).slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="font-jb text-[0.55rem] tracking-[0.05em] px-1.5 py-[3px] rounded-[2px] bg-[rgba(10,12,10,0.8)] border border-[rgba(95,255,96,0.18)] text-[rgba(95,255,96,0.65)] backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
            {hackathon.techStack?.length > 3 && (
              <span className="font-jb text-[0.55rem] px-1.5 py-[3px] rounded-[2px] bg-[rgba(10,12,10,0.8)] border border-[rgba(95,255,96,0.12)] text-[rgba(95,255,96,0.4)]">
                +{hackathon.techStack.length - 3}
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
                {isExpired
                  ? "Ended"
                  : countdown ||
                    getCountdown(
                      isUpcoming
                        ? hackathon.startDate
                        : hackathon.submissionEndDate
                    )}
              </span>
            </div>
          </div>

          <div className="pr-28">
            {/* title + tags */}
            <div className="mb-3">
              <h3 className="font-syne font-extrabold text-white text-[1.05rem] leading-tight tracking-tight mb-2">
                {hackathon.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {/* <span className="font-jb text-[0.55rem] tracking-[0.08em] uppercase px-2 py-[3px] rounded-[2px] bg-[rgba(95,255,96,0.07)] border border-[rgba(95,255,96,0.18)] text-[rgba(95,255,96,0.65)]">
                  {hackathon.difficulty}
                </span> */}
                {(hackathon.category || []).map((cat, i) => (
                  <span
                    key={i}
                    className="font-jb text-[0.55rem] tracking-[0.08em] uppercase px-2 py-[3px] rounded-[2px] bg-[rgba(96,200,255,0.07)] border border-[rgba(96,200,255,0.18)] text-[rgba(96,200,255,0.65)]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* description */}
            <p className="font-jb text-[0.67rem] text-[rgba(180,220,180,0.45)] leading-relaxed mb-4 line-clamp-2">
              {hackathon.description}
            </p>

            {/* meta row */}
            <div className="flex flex-wrap gap-4">
              <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.4)]">
                <Users size={11} className="text-[rgba(95,255,96,0.4)]" />
                {hackathon.participants} participants
              </span>
              {totalPrize > 0 && (
                <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.4)]">
                  <Trophy size={11} className="text-[rgba(255,184,77,0.5)]" />₹
                  {totalPrize.toLocaleString("en-IN")}
                </span>
              )}
              <span className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.4)]">
                <Calendar size={11} className="text-[rgba(95,255,96,0.4)]" />
                {hackathon.dates}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* progress bar */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(95,255,96,0.06)]">
          <div
            className="h-full bg-[#5fff60] hk-progress transition-all duration-300"
            style={{
              width: `${getProgress(
                hackathon.startDate,
                hackathon.submissionEndDate
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
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const activeHackathons = hackathonsData?.active || [];
  const expiredHackathons = hackathonsData?.expired || [];
  const upcomingHackathons = hackathonsData?.upcoming || [];

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
      expired: expiredHackathons,
    };
    const mainCats = ["Web Dev", "AI/ML", "Blockchain", "IoT"];
    return (map[activeTab] || []).filter((h) => {
      const matchSearch = h.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let matchCat = true;
      if (selectedCategory) {
        if (selectedCategory === "Other") {
          const cats = Array.isArray(h.category) ? h.category : [h.category];
          matchCat = cats.every((c) => !mainCats.includes(c));
        } else {
          matchCat = Array.isArray(h.category)
            ? h.category.includes(selectedCategory)
            : h.category === selectedCategory;
        }
      }
      return (
        matchSearch &&
        matchCat &&
        (!selectedDifficulty || h.difficulty === selectedDifficulty)
      );
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDifficulty("");
  };
  const hasFilters = searchTerm || selectedCategory || selectedDifficulty;

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
      color: "blue",
    },
    expired: {
      label: "Expired",
      icon: Timer,
      count: expiredHackathons.length,
      color: "red",
    },
  };

  const tabTitle = {
    active: "Active Hackathons",
    upcoming: "Upcoming Hackathons",
    expired: "Expired Hackathons",
  };
  const tabGradient = {
    active: "from-[#5fff60] to-[#2d8030]",
    upcoming: "from-[#60c8ff] to-[#2060a0]",
    expired: "from-[#ff9090] to-[#a03030]",
  };

  const selectCls =
    "font-jb w-full px-3 py-2 text-[0.65rem] tracking-[0.05em] border border-[rgba(95,255,96,0.12)] rounded-[3px] bg-[rgba(10,12,10,0.7)] text-[#e8ffe8] focus:outline-none focus:border-[rgba(95,255,96,0.38)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.05)] transition-all [color-scheme:dark]";

  return (
    <>
      <div className="font-jb hk-bg min-h-screen bg-[#0a0a0a] text-[#e8ffe8] overflow-hidden -mt-16">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(95,255,96,0.35)] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search hackathons by title…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-jb w-full pl-9 pr-10 py-2.5 text-[0.68rem] tracking-[0.04em] border border-[rgba(95,255,96,0.12)] rounded-[3px] bg-[rgba(10,12,10,0.7)] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.25)] focus:outline-none focus:border-[rgba(95,255,96,0.38)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.05)] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(95,255,96,0.35)] hover:text-[#5fff60] transition-colors"
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
                      ? "bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60]"
                      : "bg-[rgba(10,12,10,0.6)] border-[rgba(95,255,96,0.1)] text-[rgba(180,220,180,0.45)] hover:border-[rgba(95,255,96,0.22)] hover:text-[rgba(180,220,180,0.7)]"
                  }`}
              >
                <Filter size={11} /> Filters
                {hasFilters && (
                  <span className="font-jb text-[0.52rem] px-1.5 py-[1px] rounded-[2px] bg-[rgba(95,255,96,0.15)] text-[#5fff60]">
                    {
                      [searchTerm, selectedCategory, selectedDifficulty].filter(
                        Boolean
                      ).length
                    }
                  </span>
                )}
              </button>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="font-jb inline-flex items-center gap-1.5 text-[0.62rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[3px] border border-[rgba(255,96,96,0.2)] bg-[rgba(255,96,96,0.06)] text-[rgba(255,120,120,0.6)] hover:text-[#ff9090] hover:border-[rgba(255,96,96,0.38)] transition-all cursor-pointer"
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>

            {/* filter panel */}
            {showFilters && (
              <div className="relative flex flex-wrap gap-4 p-4 bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px]">
                <span className="absolute top-[-1px] left-[-1px] w-[8px] h-[8px] border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
                <span className="absolute bottom-[-1px] right-[-1px] w-[8px] h-[8px] border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />
                <div className="min-w-[160px]">
                  <label className="font-jb block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">All Categories</option>
                    {["Web Dev", "AI/ML", "Blockchain", "IoT", "Other"].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="min-w-[160px]">
                  <label className="font-jb block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">All Difficulties</option>
                    {["Beginner", "Intermediate", "Advanced", "Expert"].map(
                      (d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── Section heading ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            {/* Title */}
            <h2
              className={`font-syne font-extrabold text-transparent bg-clip-text bg-gradient-to-b ${tabGradient[activeTab]} flex items-center gap-2 sm:gap-3`}
              style={{ fontSize: "clamp(1.2rem,4vw,2.4rem)" }}
            >
              {activeTab === "active" && (
                <span className="relative inline-flex">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#5fff60] inline-block" />
                  <span className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#5fff60] animate-ping opacity-60" />
                </span>
              )}

              {activeTab === "upcoming" && (
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#60c8ff] inline-block" />
              )}

              {activeTab === "expired" && (
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff9090] opacity-50 inline-block" />
              )}

              {tabTitle[activeTab]}
            </h2>

            {/* Count */}
            <div className="font-jb text-[0.6rem] sm:text-[0.65rem] tracking-[0.08em] text-[rgba(180,220,180,0.4)]">
              <span className="text-[#5fff60]">
                {loading ? "…" : getCurrentHackathons().length}
              </span>{" "}
              {activeTab}
              {hasFilters && (
                <span className="text-[#ffb84d] ml-2">(filtered)</span>
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
              getCurrentHackathons().map((h, i) => (
                <HackathonCard key={`${activeTab}-${i}`} hackathon={h} />
              ))
            ) : (
              <div className="font-jb text-center py-16 flex flex-col items-center gap-3">
                <span className="text-5xl opacity-15">
                  {hasFilters ? "🔍" : "🏆"}
                </span>
                <p className="text-[0.75rem] text-[rgba(180,220,180,0.4)] tracking-[0.06em]">
                  {hasFilters
                    ? "No hackathons match your filters"
                    : `No ${activeTab} hackathons`}
                </p>
                <p className="text-[0.62rem] text-[rgba(180,220,180,0.25)]">
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
