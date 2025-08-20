import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  SiHtml5, SiGithub, SiPython, SiNodedotjs,
  SiJavascript, SiMysql, SiTensorflow, SiReact, SiCss3
} from 'react-icons/si';
import { FiCornerDownRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Allcss.css';

const Quest = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationTimer, setExplanationTimer] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [previewQuest, setPreviewQuest] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/devquest');
        const fetchedData = response.data["Questions&Answer"] || response.data.questions || response.data;
        const formattedQuestions = (fetchedData || []).map((item) => ({
          id: item.id,
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          topic: item.topic
        }));
        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, []);

  const QUESTION_TIMER = 90;

  useEffect(() => {
    if (quizStarted && !showExplanation && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showExplanation) {
      handleTimeUp();
    }
  }, [timeLeft, quizStarted, showExplanation, quizCompleted]);

  useEffect(() => {
    if (showExplanation && explanationTimer > 0) {
      const timer = setTimeout(() => setExplanationTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showExplanation && explanationTimer === 0) {
      moveToNextQuestion();
    }
  }, [explanationTimer, showExplanation]);

  const handleTimeUp = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setTimeLeft(QUESTION_TIMER);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleAnswerClick = (answerIndex) => {
    if (selectedAnswer !== null || showExplanation) return;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    setExplanationTimer(correct ? 5 : 10);
  };

  const moveToNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setExplanationTimer(0);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setTimeLeft(QUESTION_TIMER);
    } else {
      setQuizCompleted(true);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(QUESTION_TIMER);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  const todayCount = questions.length || 5;
  const todayTopic = (questions[0] && questions[0].topic) || 'Web Development (MERN Stack)';
  const todayDateStr = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const prevFive = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    return {
      key: i,
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      topic: 'Web Dev'
    };
  });

  // Dummy Preview Question
  const dummyPreview = {
    question: "What is web technology?",
    options: [
      "A collection of tools and techniques used to create and deliver content on the World Wide Web",
      "A type of software that enables users to access and interact with information on the internet",
      "A network of interconnected computers that share information and services",
      "A system for storing and retrieving information on the internet"
    ]
  };

  if (!quizStarted && !quizCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-900 text-white font-sans py-8 px-4 md:px-8 lg:px-12 overflow-x-hidden"
      >
        {/* Background watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-screen">
          <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#06B6D4" stopOpacity="0.06" />
                <stop offset="1" stopColor="#06B6D4" stopOpacity="0.06" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g1)" />
            <g transform="translate(15, 40)" >
              <text x="0" y="0" fill="#0ea5b7" fontSize="80" opacity="0.02" fontFamily="monospace">DEVQUEST</text>
            </g>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm text-gray-300">HackSprint · DevQuests</h2>
              <h1 className="text-xl sm:text-xl md:text-8xl lg:text-[7rem] xl:text-[55px] ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 tracking-widest z-10 relative">
                DevQuest — Daily Challenges
              </h1>
            </div>
            <div className="text-right">
              <div className="text-xl text-yellow-300">
                 Stay consistent · Maintain Your Streak 
              </div>
            </div>
          </div>

          {/* 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: four info cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {[
                { t: 'Revise Core Concepts', d: 'Strengthen your fundamentals daily with short, focused DevQuests.' },
                { t: 'Build Your Streak', d: 'Attempt daily and maintain your streak while climbing the leaderboard.' },
                { t: 'MERN Stack Challenges', d: 'Hands-on problems covering MongoDB, Express, React, and Node.js.' },
                { t: 'Sharpen Interview Skills', d: 'Curated from real-world coding interview patterns.' },
              ].map((c) => (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  key={c.t}
                  className="bg-white/5 p-5 rounded-xl shadow-md border border-gray-700 transition"
                >
                  <h3 className="text-lg font-semibold text-green-400">{c.t}</h3>
                  <p className="text-sm text-white mt-2">{c.d}</p>
                </motion.div>
              ))}
            </div>

            {/* Right: today's questions box */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-700/40 shadow-2xl"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-cyan-600 flex items-center justify-center shadow-xl">
                      <div className="text-center text-white">
                        <div className="text-3xl md:text-4xl font-extrabold">{todayCount}</div>
                        <div className="text-xs md:text-sm">Questions</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/80">Topic</div>
                        <div className="text-xl md:text-2xl font-semibold text-white">{todayTopic}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/80">Date</div>
                        <div className="text-lg font-medium text-white">{todayDateStr}</div>
                      </div>
                    </div>
                    <p className="mt-4 text-white max-w-xl">
                      DevQuest delivers short, focused challenges daily — perfect for interviews and building real-world skills.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        onClick={startQuiz}
                        className="inline-flex items-center gap-3 px-5 py-3 rounded-xl font-semibold shadow-lg transition-transform text-white bg-[#b042ff]"
                      >
                        View Today's Questions <FiCornerDownRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className="text-sm text-white underline underline-offset-2"
                      >
                        See previous DevQuests
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Previous DevQuests */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Previous DevQuests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {prevFive.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreviewQuest(p)}
                  className="text-left p-4 rounded-xl bg-white/5 border border-gray-700/30 hover:scale-[1.02] transition-transform shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white font-medium">{p.date}</div>
                    <div className="text-xs text-white/70">Preview</div>
                  </div>
                  <div className="mt-3 text-sm text-white font-semibold">{p.topic}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-16" />
        </div>

        {/* Modal Preview */}
        <AnimatePresence>
          {previewQuest && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            >
              <motion.div
                key="modal"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-gray-800 text-white p-8 rounded-2xl w-[92vw] max-w-2xl relative shadow-2xl"
              >
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                  onClick={() => setPreviewQuest(null)}
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold mb-5">{previewQuest.topic} · {previewQuest.date}</h2>
                <div className="overflow-hidden relative max-h-[70vh]">
                  <p className="text-lg font-semibold mb-3">{dummyPreview.question}</p>
                  <ul className="space-y-2 pr-2">
                    {dummyPreview.options.map((opt, idx) => (
                      <li key={idx} className="p-3 rounded bg-white/5">
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <div className="pointer-events-none absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-gray-800 to-transparent" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    alert("Redirecting to Login/Signup or showing all questions if logged in")
                  }
                  className="mt-6 bg-cyan-600 px-5 py-3 rounded-xl font-semibold transition text-white"
                >
                  View All
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return null;
};

export default Quest;
