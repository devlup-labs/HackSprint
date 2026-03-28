import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownRight, X, Zap, Target, Cloud, Flame } from "lucide-react";
import axios from "axios";
import { API } from "../../backendApis/api";
import "../Styles/Quest.css";

const INFO_CARDS = [
  {
    icon: Zap,
    title: "Stay Industry-Ready",
    desc: "Daily quizzes keep you aligned with the latest in dev, backend, and DevOps.",
  },
  {
    icon: Target,
    title: "Micro-Learning, Big Impact",
    desc: "Just 5–10 minutes daily to sharpen your software engineering mindset.",
  },
  {
    icon: Cloud,
    title: "From Code to Cloud",
    desc: "Quizzes span full-stack, APIs, CI/CD, Docker, and cloud — grow beyond just coding.",
  },
  {
    icon: Flame,
    title: "Build Discipline & Streaks",
    desc: "Consistency is key. Challenge yourself daily and track progress with streaks.",
  },
];

const Card = ({ children, className = "", style }) => (
  <div
    className={`qt-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] backdrop-blur-sm ${className}`}
    style={style}
  >
    {children}
  </div>
);

const Quest = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todayQuiz, setTodayQuiz] = useState(null);
  const [prevFive, setPrevFive] = useState([]);
  const [previewQuest, setPreviewQuest] = useState(null);
  const [dummyPreview, setDummyPreview] = useState({
    question: "",
    options: [],
  });
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown === 0) {
      navigate("/account/login");
      return;
    }
    const t = setTimeout(() => setRedirectCountdown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [redirectCountdown, navigate]);

  useEffect(() => {
    API
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/dailyquiz/today`)
      .then((r) => setTodayQuiz(r.data.dailyQuiz))
      .catch(console.error);
  }, []);

  useEffect(() => {
    API
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/dailyquiz/allquiz`)
      .then((r) => {
        const data = r.data.quizData || [];
        const allQ = data.flatMap((q) => q.questions);
        setDummyPreview({
          question: "Here are the last 5 Daily Quiz Questions:",
          options: allQ.slice(0, 5).map((q, i) => `Q${i + 1}: ${q.question}`),
        });
        setPrevFive(
          data.slice(0, 5).map((q) => ({
            key: q._id,
            date: new Date(q.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            topic: q.Title,
            questions: q.questions,
          }))
        );
      })
      .catch(console.error);
  }, []);

  const handleViewAll = () =>
    isLoggedIn ? navigate("/questions") : setRedirectCountdown(3);

  const label =
    "font-jb text-[0.52rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.45)] mb-1";

  return (
    <div className="qt-root qt-bg min-h-screen bg-[#0a0a0a] overflow-x-hidden -mt-16">
      <div className="relative z-10 max-w-[1100px] mx-auto px-5 pt-28 pb-20">
        <header className="mb-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="qt-from-left">
              <div className={label} style={{ animationDelay: ".05s" }}>
                HackSprint · DevQuests
              </div>
              <h1
                className="qt-syne qt-a2 font-extrabold text-[#5fff60] leading-none tracking-tight -ml-1 md:-ml-2"
                style={{ fontSize: "clamp(2.5rem,4vw,4rem)" }}
              >
                DevQuest
              </h1>
              <div className="qt-a3 flex items-center gap-3 mt-2">
                <div className="w-10 h-px bg-[rgba(95,255,96,0.4)]" />
                <span className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.5)] tracking-[0.05em]">
                  Daily Challenges
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Left — info cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {INFO_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <Card
                  key={c.title}
                  className="qt-info-card p-5"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[3px] bg-[rgba(95,255,96,0.08)] border border-[rgba(95,255,96,0.16)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-[#5fff60]" />
                    </div>
                    <div>
                      <h3 className="qt-syne font-extrabold text-white text-[0.92rem] tracking-tight mb-1">
                        {c.title}
                      </h3>
                      <p className="font-jb text-[0.65rem] text-[rgba(180,220,180,0.45)] leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                  {/* bottom divider */}
                  <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              );
            })}
          </div>

          {/* Right — today's quest */}
          <div className="lg:col-span-7 qt-from-right">
            <Card className="p-7 hover:border-[rgba(95,255,96,0.28)] transition-all">
              <div className="flex flex-col sm:flex-row gap-7">
                {/* count box */}
                <div className="flex-shrink-0">
                  <div className="qt-count-box relative w-[120px] h-[120px] bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.2)] rounded-[4px] flex flex-col items-center justify-center">
                    <span className="qt-syne font-extrabold text-[2.8rem] text-[#5fff60] leading-none">
                      {todayQuiz?.questions?.length ?? "—"}
                    </span>
                    <span className="font-jb text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mt-1">
                      Questions
                    </span>
                  </div>
                </div>

                {/* info */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div>
                      <div className={label}>Today's Topic</div>
                      <h3 className="qt-syne font-extrabold text-white text-[1.15rem] tracking-tight leading-tight">
                        {todayQuiz?.Title || "Loading…"}
                      </h3>
                    </div>
                    <div className="sm:text-right">
                      <div className={label}>Date</div>
                      <p className="font-jb text-[0.78rem] text-[#5fff60]">
                        {todayDateStr}
                      </p>
                    </div>
                  </div>

                  <p className="font-jb text-[0.67rem] text-[rgba(180,220,180,0.45)] leading-relaxed">
                    DevQuest delivers short, focused challenges daily — perfect
                    for interviews and building real-world skills.
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-[rgba(95,255,96,0.25)] to-transparent" />
                    <div className="flex-1 h-px bg-gradient-to-l from-[rgba(95,255,96,0.25)] to-transparent" />
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate("/questions")}
                      className="font-jb inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-6 py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_22px_rgba(95,255,96,0.3)]"
                    >
                      View Today's Questions <CornerDownRight size={13} />
                    </button>
                    <button
                      onClick={() =>
                        window.scrollTo({
                          top: document.body.scrollHeight,
                          behavior: "smooth",
                        })
                      }
                      className="font-jb text-[0.65rem] tracking-[0.1em] uppercase px-6 py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-150 border-[rgba(95,255,96,0.2)] text-[rgba(95,255,96,0.6)] hover:border-[rgba(95,255,96,0.42)] hover:text-[#5fff60]"
                    >
                      Previous DevQuests
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <section className="relative mt-10">
          <div className="relative border border-[rgba(95,255,96,0.12)] rounded-[4px] p-5 sm:p-6 bg-[rgba(10,12,10,0.6)] overflow-hidden">
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[rgba(95,255,96,0.35)]" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[rgba(95,255,96,0.35)]" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[rgba(95,255,96,0.35)]" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[rgba(95,255,96,0.35)]" />

            <div className="flex items-center gap-3 mb-7">
              <div className="w-6 h-px bg-[rgba(95,255,96,0.4)]" />
              <span className="font-jb text-[0.58rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.55)]">
                Previous DevQuests
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-[rgba(95,255,96,0.15)] to-transparent" />
            </div>

            {prevFive.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {prevFive.map((quest) => (
                  <button
                    key={quest.key}
                    onClick={() => setPreviewQuest(quest)}
                    className="qt-card qt-prev-card relative text-left p-5 bg-[rgba(10,12,10,0.7)] border border-[rgba(95,255,96,0.1)] rounded-[4px] hover:border-[rgba(95,255,96,0.3)] hover:bg-[rgba(95,255,96,0.04)] transition-all duration-200 cursor-pointer"
                  >
                    <span className="font-jb text-[0.58rem] text-[#5fff60] tracking-[0.08em]">
                      {quest.date}
                    </span>

                    <h3 className="qt-syne font-extrabold text-white text-[0.88rem] tracking-tight mt-2 mb-2 leading-tight">
                      {quest.topic}
                    </h3>

                    <div className="w-6 h-[2px] bg-[rgba(95,255,96,0.25)] rounded" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="qt-card relative p-6 text-center font-jb text-[0.68rem] text-[rgba(95,255,96,0.5)] tracking-[0.06em]">
                The first DevQuest is currently live!
              </div>
            )}
          </div>
        </section>
      </div>

      {previewQuest && (
        <div
          className="qt-modal-backdrop"
          onClick={() => setPreviewQuest(null)}
        >
          <div
            className="qt-modal qt-card relative w-full max-w-[600px] bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.18)] rounded-[4px] shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-[rgba(95,255,96,0.08)]">
              <div>
                <h2 className="qt-syne font-extrabold text-white text-[1.05rem] tracking-tight">
                  {previewQuest.topic}
                </h2>
                <p className="font-jb text-[0.6rem] text-[#5fff60] tracking-[0.08em] mt-0.5">
                  {previewQuest.date}
                </p>
              </div>
              <button
                onClick={() => setPreviewQuest(null)}
                className="font-jb p-1.5 rounded-[2px] border border-[rgba(95,255,96,0.12)] text-[rgba(95,255,96,0.4)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* body */}
            <div className="qt-modal-body px-6 py-5">
              <div className="font-jb text-[0.55rem] tracking-[0.16em] uppercase text-[rgba(95,255,96,0.45)] mb-4">
                Sample Questions
              </div>
              <div className="flex flex-col gap-2.5">
                {dummyPreview.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.1)] rounded-[3px] transition-all duration-150 hover:border-[rgba(95,255,96,0.25)] hover:bg-[rgba(95,255,96,0.07)]"
                    style={{
                      opacity: isLoggedIn ? 1 : Math.max(0.15, 1 - idx * 0.3),
                    }}
                  >
                    <span className="font-jb text-[0.58rem] text-[#5fff60] flex-shrink-0 mt-[1px]">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="font-jb text-[0.65rem] text-[rgba(180,220,180,0.6)] leading-relaxed">
                      {opt}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* footer */}
            {!isLoggedIn && (
              <div className="px-6 py-4 border-t border-[rgba(95,255,96,0.08)] bg-[rgba(95,255,96,0.03)]">
                <button
                  onClick={handleViewAll}
                  className="font-jb w-full flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase py-[0.75rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.28)]"
                >
                  {redirectCountdown !== null
                    ? `Redirecting in ${redirectCountdown}…`
                    : "View All Questions"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quest;
