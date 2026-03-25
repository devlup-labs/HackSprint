import React, { useState, useEffect } from "react";
import axios from "axios";
import { getDashboard } from "../backendApis/api";
import { useNavigate } from "react-router-dom";

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const PrimaryBtn = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`${mono} inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase
      px-6 py-3 rounded-[3px] border cursor-pointer transition-all duration-150
      bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
      hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)] ${className}`}
  >
    {children}
  </button>
);

const dummyQuestions = [
  {
    id: "q1",
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "Hyperlink and Text Markup Language",
      "Home Tool Markup Language",
      "Hyper Transfer Markup Language",
    ],
    correctAnswer: 0,
    explanation:
      "HTML stands for HyperText Markup Language. It's the standard language for creating web pages.",
    points: 10,
  },
  {
    id: "q2",
    question: "Which company developed JavaScript?",
    options: ["Microsoft", "Netscape", "Sun Microsystems", "Oracle"],
    correctAnswer: 1,
    explanation: "JavaScript was developed by Netscape in the mid-1990s.",
    points: 10,
  },
  {
    id: "q3",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctAnswer: 1,
    explanation: "Binary search works in O(log n) time on sorted arrays.",
    points: 10,
  },
];

const KEYS = {
  IDX: "devquest_current_index",
  TIME: "devquest_time_left",
  ANSWERS: "devquest_user_answers",
  STARTED: "devquest_quiz_started",
  DONE: "devquest_quiz_completed",
  DATE: "devquest_quiz_date",
};
const getDate = () => new Date().toISOString().split("T")[0];
const fromToday = () => localStorage.getItem(KEYS.DATE) === getDate();
const getMidnight = () => {
  const m = new Date();
  m.setHours(24, 0, 0, 0);
  return Math.floor((m.getTime() - Date.now()) / 1000);
};
const fmtTime = (s) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");

const Questions = () => {
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(59);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationTimer, setExplanationTimer] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [midnight, setMidnight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizId, setQuizId] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    getDashboard()
      .then((r) => setUserId(r.data.userData._id))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setMidnight(getMidnight());
    const t = setInterval(() => {
      setMidnight(getMidnight());
      if (!fromToday()) window.location.reload();
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const clearProgress = () =>
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  const resetState = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setTimeLeft(59);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setExplanationTimer(0);
    setIsCorrect(false);
    setQuizCompleted(false);
    setUserAnswers([]);
    clearProgress();
  };
  const loadProgress = () => {
    if (!fromToday()) {
      resetState();
      return;
    }
    const s = localStorage;
    if (s.getItem(KEYS.IDX) !== null)
      setCurrentQ(parseInt(s.getItem(KEYS.IDX), 10));
    if (s.getItem(KEYS.TIME) !== null)
      setTimeLeft(parseInt(s.getItem(KEYS.TIME), 59));
    if (s.getItem(KEYS.ANSWERS) !== null)
      setUserAnswers(JSON.parse(s.getItem(KEYS.ANSWERS)));
    if (s.getItem(KEYS.STARTED) !== null)
      setQuizStarted(JSON.parse(s.getItem(KEYS.STARTED)));
    if (s.getItem(KEYS.DONE) !== null)
      setQuizCompleted(JSON.parse(s.getItem(KEYS.DONE)));
  };
  useEffect(() => {
    if (questions.length > 0 && quizStarted) {
      localStorage.setItem(KEYS.IDX, currentQ.toString());
      localStorage.setItem(KEYS.TIME, timeLeft.toString());
      localStorage.setItem(KEYS.ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(KEYS.STARTED, JSON.stringify(quizStarted));
      localStorage.setItem(KEYS.DONE, JSON.stringify(quizCompleted));
      localStorage.setItem(KEYS.DATE, getDate());
    }
  }, [
    currentQ,
    timeLeft,
    userAnswers,
    quizStarted,
    quizCompleted,
    questions.length,
  ]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const r = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/dailyquiz/today`
        );
        if (r.data?.dailyQuiz?.questions?.length > 0) {
          setQuestions(
            r.data.dailyQuiz.questions.map((q) => ({
              id: q._id,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              points: q.points || 10,
            }))
          );
          setQuizId(r.data.dailyQuiz._id);
        } else {
          setQuestions(dummyQuestions);
          setQuizId("dummyQuiz");
        }
      } catch {
        setQuestions(dummyQuestions);
        setQuizId("dummyQuiz");
      } finally {
        setIsLoading(false);
        loadProgress();
        if (fromToday()) {
          if (!localStorage.getItem(KEYS.STARTED)) {
            setQuizStarted(true);
            setTimeLeft(59);
          }
        } else {
          setQuizStarted(true);
          setTimeLeft(59);
          localStorage.setItem(KEYS.DATE, getDate());
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!quizStarted || showExplanation || quizCompleted) return;
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
    handleTimeUp();
  }, [timeLeft, quizStarted, showExplanation, quizCompleted]);

  useEffect(() => {
    if (!showExplanation) return;
    if (explanationTimer > 0) {
      const t = setTimeout(() => setExplanationTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
    moveNext();
  }, [explanationTimer, showExplanation]);

  const handleTimeUp = async () => {
    const a = [...userAnswers];
    a[currentQ] = null;
    setUserAnswers(a);
    if (currentQ < questions.length - 1) {
      setCurrentQ((p) => p + 1);
      setTimeLeft(59);
      setSelectedAnswer(null);
    } else {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/user/finishquiz`,
          { userId, quizId }
        );
      } catch {}
      setQuizCompleted(true);
    }
  };

  const handleAnswer = async (idx) => {
    if (selectedAnswer !== null || showExplanation) return;
    setSelectedAnswer(idx);
    const correct = idx === questions[currentQ].correctAnswer;
    setIsCorrect(correct);
    const a = [...userAnswers];
    a[currentQ] = {
      selectedAnswer: idx,
      isCorrect: correct,
      timeSpent: 59 - timeLeft,
    };
    setUserAnswers(a);
    try {
      const url = correct
        ? "/api/user/correctanswer"
        : "/api/user/incorrectanswer";
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        questionId: questions[currentQ].id,
        userId,
      });
    } catch {}
    setShowExplanation(true);
    setExplanationTimer(correct ? 15 : 30);
  };

  const moveNext = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setExplanationTimer(0);
    if (currentQ < questions.length - 1) {
      setCurrentQ((p) => p + 1);
      setTimeLeft(59);
    } else setQuizCompleted(true);
  };

  const handleFinish = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/finishquiz`,
        { userId, quizId }
      );
    } catch {}
    setQuizCompleted(true);
  };

  const stats = () => {
    const ans = userAnswers.filter((a) => a !== null);
    const correct = ans.filter((a) => a?.isCorrect);
    return {
      total: questions.length,
      answered: ans.length,
      correct: correct.length,
      pct: ans.length > 0 ? Math.round((correct.length / ans.length) * 100) : 0,
    };
  };

  if (isLoading || questions.length === 0)
    return (
      <div
        className={`${mono} min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-5`}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(95,255,96,0.15)] border-t-[#5fff60] animate-spin" />
        <div className="text-center">
          <h2
            className={`${syne} font-extrabold text-white text-2xl tracking-tight mb-1`}
          >
            Initialising DevQuest
          </h2>
          <p className="text-[0.65rem] text-[rgba(180,220,180,0.6)] tracking-[0.06em]">
            Preparing your challenge…
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 150, 300].map((d) => (
            <div
              key={d}
              className="w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    );

  if (quizCompleted) {
    const s = stats();
    const grade =
      s.pct >= 80
        ? {
            label: "Outstanding!",
            sub: "Exceptional mastery.",
            color: "green",
            border: "border-[rgba(95,255,96,0.3)]",
            bg: "bg-[rgba(95,255,96,0.07)]",
            text: "text-[#5fff60]",
          }
        : s.pct >= 60
        ? {
            label: "Great Job!",
            sub: "Keep building on this.",
            color: "blue",
            border: "border-[rgba(96,200,255,0.3)]",
            bg: "bg-[rgba(96,200,255,0.07)]",
            text: "text-[rgba(96,200,255,0.85)]",
          }
        : {
            label: "Keep Learning!",
            sub: "Every expert was once a beginner.",
            color: "amber",
            border: "border-[rgba(255,184,77,0.3)]",
            bg: "bg-[rgba(255,184,77,0.07)]",
            text: "text-[#ffb84d]",
          };
    return (
      <div
        className={`${mono} min-h-screen bg-[#0a0a0a] text-[#e8ffe8] flex flex-col items-center justify-center px-4 py-14 relative overflow-hidden`}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(95,255,96,.024) 1px,transparent 1px),linear-gradient(90deg,rgba(95,255,96,.024) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
          style={{
            background:
              "radial-gradient(ellipse,rgba(95,255,96,.07) 0%,transparent 65%)",
          }}
        />

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-7">
          <div className="text-center">
            <div className="text-[0.52rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.45)] mb-2">
              DevQuest Complete
            </div>
            <h1
              className={`${syne} font-extrabold text-white text-3xl sm:text-4xl tracking-tight`}
            >
              Mission Accomplished
            </h1>
            <p className="text-[0.7rem] text-[rgba(180,220,180,0.6)] mt-1.5 tracking-[0.03em]">
              You've completed today's{" "}
              <span className="text-[#5fff60]">DevQuest</span> challenge.
            </p>
          </div>

          <div className="relative w-full bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-7">
            <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
            <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />

            <div className="text-[0.52rem] tracking-[0.18em] uppercase text-[rgba(95,255,96,0.4)] mb-5">
              Performance Analytics
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: s.total, color: "text-[#e8ffe8]" },
                {
                  label: "Answered",
                  value: s.answered,
                  color: "text-[#5fff60]",
                },
                { label: "Correct", value: s.correct, color: "text-[#5fff60]" },
                { label: "Score", value: `${s.pct}%`, color: `${grade.text}` },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.1)] rounded-[3px] py-4"
                >
                  <span
                    className={`${syne} font-extrabold text-3xl leading-none ${color}`}
                  >
                    {value}
                  </span>
                  <span className="text-[0.55rem] tracking-[0.1em] uppercase text-[rgba(180,220,180,0.5)]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[3px] border ${grade.bg} ${grade.border} mb-4`}
            >
              <span
                className={`text-[0.62rem] tracking-[0.08em] font-semibold ${grade.text}`}
              >
                {grade.label}
              </span>
              <span className="text-[0.6rem] text-[rgba(180,220,180,0.55)]">
                — {grade.sub}
              </span>
            </div>

            <div className="h-1.5 w-full bg-[rgba(95,255,96,0.08)] rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-[#5fff60] rounded-full transition-all duration-700"
                style={{
                  width: `${s.pct}%`,
                  boxShadow: "0 0 8px rgba(95,255,96,0.4)",
                }}
              />
            </div>

            <div className="text-center mb-6">
              <div className="text-[0.55rem] tracking-[0.1em] uppercase text-[rgba(180,220,180,0.45)] mb-1">
                Next quiz available in
              </div>
              <div className={`${mono} text-[#5fff60] text-xl font-semibold`}>
                {fmtTime(midnight)}
              </div>
              <div className="text-[0.58rem] text-[rgba(180,220,180,0.38)] mt-0.5">
                New challenges refresh daily at midnight
              </div>
            </div>

            <div className="flex justify-center">
              <PrimaryBtn onClick={() => navigate("/leaderboard")}>
                View Leaderboard 🏆
              </PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = Math.round(((currentQ + 1) / questions.length) * 100);
  const urgent = timeLeft <= 10;

  return (
    <div
      className={`${mono} min-h-screen bg-[#0a0a0a] text-[#e8ffe8] flex flex-col relative overflow-hidden`}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(95,255,96,.024) 1px,transparent 1px),linear-gradient(90deg,rgba(95,255,96,.024) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 border-b border-[rgba(95,255,96,0.08)] bg-[rgba(8,10,8,0.85)] backdrop-blur-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1
                className={`${syne} font-extrabold text-white text-base tracking-tight`}
              >
                DevQuest Assessment
              </h1>
              <p className="text-[0.58rem] tracking-[0.08em] uppercase text-[rgba(180,220,180,0.5)]">
                Question {currentQ + 1} of {questions.length}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.08em] px-3 py-1.5 rounded-[3px] border transition-all ${
                urgent
                  ? "bg-[rgba(255,60,60,0.1)] border-[rgba(255,60,60,0.3)] text-[#ff9090]"
                  : "bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.2)] text-[#5fff60]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  urgent ? "bg-[#ff6060]" : "bg-[#5fff60]"
                }`}
              />
              {timeLeft}s
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-[rgba(95,255,96,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5fff60] rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  boxShadow: "0 0 6px rgba(95,255,96,0.4)",
                }}
              />
            </div>
            <span className="text-[0.55rem] tracking-[0.06em] text-[rgba(95,255,96,0.55)] flex-shrink-0">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-3xl flex flex-col gap-5">
          <div className="relative bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-6 sm:p-8">
            <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
            <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />

            <h2
              className={`${syne} font-extrabold text-white text-lg sm:text-xl tracking-tight text-center mb-7 leading-snug`}
            >
              {q.question}
            </h2>

            <div className="flex flex-col gap-3 mb-7">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const selected = selectedAnswer === i;
                const correct = i === q.correctAnswer;
                const shown = selectedAnswer !== null;

                let border =
                  "border-[rgba(95,255,96,0.12)] hover:border-[rgba(95,255,96,0.32)]";
                let bg =
                  "bg-[rgba(95,255,96,0.03)] hover:bg-[rgba(95,255,96,0.07)]";
                let lBg =
                  "bg-[rgba(95,255,96,0.08)] text-[rgba(95,255,96,0.6)]";
                let txt =
                  "text-[rgba(232,255,232,0.85)] group-hover:text-white";

                if (shown) {
                  if (selected && correct) {
                    border = "border-[rgba(95,255,96,0.5)]";
                    bg = "bg-[rgba(95,255,96,0.12)]";
                    lBg = "bg-[#5fff60] text-[#050905]";
                    txt = "text-white";
                  } else if (selected) {
                    border = "border-[rgba(255,60,60,0.5)]";
                    bg = "bg-[rgba(255,60,60,0.1)]";
                    lBg = "bg-[#ff6060] text-white";
                    txt = "text-[#ff9090]";
                  } else if (correct) {
                    border = "border-[rgba(95,255,96,0.4)]";
                    bg = "bg-[rgba(95,255,96,0.08)]";
                    lBg = "bg-[#5fff60] text-[#050905]";
                    txt = "text-white";
                  } else {
                    border = "border-[rgba(95,255,96,0.06)]";
                    bg = "bg-transparent";
                    lBg =
                      "bg-[rgba(95,255,96,0.04)] text-[rgba(95,255,96,0.3)]";
                    txt = "text-[rgba(180,220,180,0.35)]";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={shown}
                    className={`group relative flex items-center gap-3 text-left px-4 py-3.5 rounded-[3px] border cursor-pointer transition-all duration-200 disabled:cursor-not-allowed ${border} ${bg}`}
                  >
                    <div
                      className={`${mono} w-8 h-8 rounded-[2px] flex items-center justify-center text-[0.68rem] font-bold flex-shrink-0 transition-all ${lBg}`}
                    >
                      {letter}
                    </div>
                    <p
                      className={`${mono} text-[0.72rem] leading-relaxed transition-colors ${txt}`}
                    >
                      {opt}
                    </p>
                    {shown && (selected || correct) && (
                      <div className="ml-auto flex-shrink-0">
                        {selected && correct ? (
                          <span className="text-[#5fff60] text-base">✓</span>
                        ) : selected ? (
                          <span className="text-[#ff6060] text-base">✗</span>
                        ) : (
                          <span className="text-[#5fff60] text-base">✓</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center">
              {currentQ === questions.length - 1 ? (
                <PrimaryBtn onClick={handleFinish}>
                  Complete Assessment
                </PrimaryBtn>
              ) : (
                <PrimaryBtn onClick={moveNext}>
                  Continue to Next Question
                </PrimaryBtn>
              )}
            </div>
          </div>

          {showExplanation && (
            <div
              className={`relative bg-[rgba(10,12,10,0.92)] border-2 rounded-[4px] p-6 transition-all duration-300 ${
                isCorrect
                  ? "border-[rgba(95,255,96,0.3)]"
                  : "border-[rgba(255,96,96,0.3)]"
              }`}
            >
              <span
                className={`absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 ${
                  isCorrect
                    ? "border-[rgba(95,255,96,0.55)]"
                    : "border-[rgba(255,96,96,0.55)]"
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-[3px] flex items-center justify-center flex-shrink-0 ${
                      isCorrect
                        ? "bg-[rgba(95,255,96,0.12)] border border-[rgba(95,255,96,0.3)]"
                        : "bg-[rgba(255,60,60,0.12)] border border-[rgba(255,60,60,0.3)]"
                    }`}
                  >
                    {isCorrect ? (
                      <span className="text-[#5fff60] text-lg">✓</span>
                    ) : (
                      <span className="text-[#ff6060] text-lg">✗</span>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`${syne} font-extrabold text-sm tracking-tight ${
                        isCorrect ? "text-[#5fff60]" : "text-[#ff9090]"
                      }`}
                    >
                      {isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                    </h3>
                    <p className="text-[0.6rem] text-[rgba(180,220,180,0.5)]">
                      {isCorrect
                        ? "Well done!"
                        : "Review the explanation below"}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.08em] uppercase px-3 py-1.5 rounded-[3px] bg-[rgba(95,255,96,0.06)] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.6)] flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-pulse" />
                  Auto-advance in {explanationTimer}s
                </div>
              </div>
              <div className="bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] p-5">
                <div className="text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.4)] mb-2">
                  Explanation
                </div>
                <p
                  className={`${mono} text-[0.72rem] text-[rgba(232,255,232,0.8)] leading-relaxed`}
                >
                  {q.explanation}
                </p>
              </div>
            </div>
          )}

          {userAnswers[currentQ] !== undefined && !showExplanation && (
            <div className="flex justify-center">
              <span
                className={`${mono} inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.08em] uppercase px-3 py-1.5 rounded-[3px] border bg-[rgba(95,255,96,0.06)] border-[rgba(95,255,96,0.18)] text-[rgba(95,255,96,0.55)]`}
              >
                ✓ Previously answered
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
