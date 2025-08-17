import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    SiHtml5, SiGithub, SiPython, SiNodedotjs,
    SiJavascript, SiMysql, SiTensorflow, SiReact, SiCss3
} from 'react-icons/si';
import './Allcss.css'

const Questions = () => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [explanationTimer, setExplanationTimer] = useState(0);
    const [isCorrect, setIsCorrect] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]); // Track user answers

    // Local Storage keys
    const STORAGE_KEYS = {
        CURRENT_INDEX: 'devquest_current_index',
        TIME_LEFT: 'devquest_time_left',
        USER_ANSWERS: 'devquest_user_answers',
        QUIZ_STARTED: 'devquest_quiz_started',
        QUIZ_COMPLETED: 'devquest_quiz_completed'
    };

    // Load progress from localStorage on component mount
    const loadProgress = () => {
        try {
            const savedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
            const savedTimeLeft = localStorage.getItem(STORAGE_KEYS.TIME_LEFT);
            const savedAnswers = localStorage.getItem(STORAGE_KEYS.USER_ANSWERS);
            const savedQuizStarted = localStorage.getItem(STORAGE_KEYS.QUIZ_STARTED);
            const savedQuizCompleted = localStorage.getItem(STORAGE_KEYS.QUIZ_COMPLETED);

            if (savedIndex !== null) {
                setCurrentQuestionIndex(parseInt(savedIndex, 10));
            }
            if (savedTimeLeft !== null) {
                setTimeLeft(parseInt(savedTimeLeft, 10));
            }
            if (savedAnswers !== null) {
                setUserAnswers(JSON.parse(savedAnswers));
            }
            if (savedQuizStarted !== null) {
                setQuizStarted(JSON.parse(savedQuizStarted));
            }
            if (savedQuizCompleted !== null) {
                setQuizCompleted(JSON.parse(savedQuizCompleted));
            }
        } catch (error) {
            console.error('Error loading progress from localStorage:', error);
        }
    };

    // Save progress to localStorage
    const saveProgress = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentQuestionIndex.toString());
            localStorage.setItem(STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
            localStorage.setItem(STORAGE_KEYS.USER_ANSWERS, JSON.stringify(userAnswers));
            localStorage.setItem(STORAGE_KEYS.QUIZ_STARTED, JSON.stringify(quizStarted));
            localStorage.setItem(STORAGE_KEYS.QUIZ_COMPLETED, JSON.stringify(quizCompleted));
        } catch (error) {
            console.error('Error saving progress to localStorage:', error);
        }
    };

    // Clear progress from localStorage
    const clearProgress = () => {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing progress from localStorage:', error);
        }
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/devquest');
                const fetchedData = response.data["Questions&Answer"];

                const formattedQuestions = fetchedData.map((item) => ({
                    id: item.id,
                    question: item.question,
                    options: item.options,
                    correctAnswer: item.correctAnswer,
                    explanation: item.explanation
                }));

                setQuestions(formattedQuestions);

                // Load progress after questions are loaded
                loadProgress();

                // If no saved state, start quiz with default values
                const savedQuizStarted = localStorage.getItem(STORAGE_KEYS.QUIZ_STARTED);
                if (savedQuizStarted === null) {
                    setQuizStarted(true);
                    setTimeLeft(20);
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
            }
        };

        fetchQuestions();
    }, []);

    // Save progress whenever state changes
    useEffect(() => {
        if (questions.length > 0) {
            saveProgress();
        }
    }, [currentQuestionIndex, timeLeft, userAnswers, quizStarted, quizCompleted, questions.length]);

    // Timer for questions (20 seconds)
    useEffect(() => {
        if (quizStarted && !showExplanation && !quizCompleted && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !showExplanation) {
            // Time's up, move to next question
            handleTimeUp();
        }
    }, [timeLeft, quizStarted, showExplanation, quizCompleted]);

    // Timer for explanation display
    useEffect(() => {
        if (showExplanation && explanationTimer > 0) {
            const timer = setTimeout(() => {
                setExplanationTimer(explanationTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showExplanation && explanationTimer === 0) {
            moveToNextQuestion();
        }
    }, [explanationTimer, showExplanation]);

    const handleTimeUp = () => {
        // Save unanswered question as null
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = null;
        setUserAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimeLeft(20);
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

        // Save user's answer
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = {
            selectedAnswer: answerIndex,
            isCorrect: correct,
            timeSpent: 20 - timeLeft
        };
        setUserAnswers(newAnswers);

        // Show explanation immediately
        setShowExplanation(true);
        setExplanationTimer(correct ? 5 : 10); // 5 sec for correct, 10 sec for wrong
    };

    const moveToNextQuestion = () => {
        setShowExplanation(false);
        setSelectedAnswer(null);
        setExplanationTimer(0);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimeLeft(20);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleNextButton = () => {
        moveToNextQuestion();
    };

    const startQuiz = () => {
        clearProgress(); // Clear any existing progress
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
        setTimeLeft(20);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setExplanationTimer(0);
        setQuizCompleted(false);
        setUserAnswers([]);
    };

    const resetQuiz = () => {
        clearProgress(); // Clear saved progress
        setQuizStarted(false);
        setCurrentQuestionIndex(0);
        setTimeLeft(20);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setExplanationTimer(0);
        setQuizCompleted(false);
        setUserAnswers([]);
    };

    const getQuizStats = () => {
        const answeredQuestions = userAnswers.filter(answer => answer !== null);
        const correctAnswers = answeredQuestions.filter(answer => answer && answer.isCorrect);
        return {
            total: questions.length,
            answered: answeredQuestions.length,
            correct: correctAnswers.length,
            percentage: answeredQuestions.length > 0 ? Math.round((correctAnswers.length / answeredQuestions.length) * 100) : 0
        };
    };

    // Show loading screen if questions haven't loaded yet
    if (!quizStarted || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-xl">Loading Quiz...</p>
                </div>
            </div>
        );
    }

    if (quizCompleted) {
        const stats = getQuizStats();
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="celebration-bg-1 absolute w-96 h-96 rounded-full opacity-10 animate-float-slow"></div>
                    <div className="celebration-bg-2 absolute w-64 h-64 rounded-full opacity-10 animate-float-slow-delayed"></div>
                    <div className="celebration-bg-3 absolute w-48 h-48 rounded-full opacity-10 animate-float-reverse"></div>
                </div>

                <div className="text-center max-w-2xl animate-fade-in-up relative z-10">
                    <div className="mb-8 animate-celebration-badge">
                        <div className="inline-block p-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-2xl">
                            <span className="text-6xl animate-bounce-celebration">🏆</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-8 text-green-400 animate-pulse-slow">Quest Completed!</h1>

                    <div className="mb-8 p-6 bg-gray-800 rounded-2xl border border-green-500/30 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <p className="text-xl md:text-2xl mb-4 text-white">Quiz Statistics</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-400">{stats.total}</div>
                                <div className="text-sm text-gray-300">Total</div>
                            </div>
                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-500">{stats.answered}</div>
                                <div className="text-sm text-gray-300">Answered</div>
                            </div>
                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-300">{stats.correct}</div>
                                <div className="text-sm text-gray-300">Correct</div>
                            </div>
                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-200">{stats.percentage}%</div>
                                <div className="text-sm text-gray-300">Score</div>
                            </div>
                        </div>
                        <p className="text-lg text-gray-300 mt-4">
                            Great job on finishing the DevQuest challenge!
                        </p>
                    </div>

                    <button
                        onClick={resetQuiz}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl text-xl cursor-pointer transition-all duration-300 transform hover:scale-105 animate-bounce-in shadow-xl border border-green-400/30"
                        style={{ animationDelay: '0.7s', opacity: 0 }}
                    >
                        Take Quest Again
                    </button>
                </div>

                <style jsx>{`
                    .celebration-bg-1 {
                        background: linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1));
                        top: 10%;
                        left: 10%;
                    }
                    
                    .celebration-bg-2 {
                        background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.1));
                        top: 20%;
                        right: 15%;
                    }
                    
                    .celebration-bg-3 {
                        background: linear-gradient(225deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1));
                        bottom: 20%;
                        left: 20%;
                    }

                    @keyframes pulseSlow {
                        0%, 100% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                    }

                    @keyframes floatSlow {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-20px) rotate(5deg);
                        }
                    }

                    @keyframes floatSlowDelayed {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-15px) rotate(-3deg);
                        }
                    }

                    @keyframes floatReverse {
                        0%, 100% {
                            transform: translateY(-10px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(10px) rotate(2deg);
                        }
                    }

                    @keyframes celebrationBadge {
                        0% {
                            transform: scale(0) rotate(0deg);
                        }
                        50% {
                            transform: scale(1.2) rotate(180deg);
                        }
                        100% {
                            transform: scale(1) rotate(360deg);
                        }
                    }

                    @keyframes bounceCelebration {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }

                    .animate-pulse-slow {
                        animation: pulseSlow 2s ease-in-out infinite;
                    }

                    .animate-float-slow {
                        animation: floatSlow 4s ease-in-out infinite;
                    }

                    .animate-float-slow-delayed {
                        animation: floatSlowDelayed 5s ease-in-out infinite;
                    }

                    .animate-float-reverse {
                        animation: floatReverse 3.5s ease-in-out infinite;
                    }

                    .animate-celebration-badge {
                        animation: celebrationBadge 1s ease-out forwards;
                    }

                    .animate-bounce-celebration {
                        animation: bounceCelebration 2s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const hasAnsweredCurrent = userAnswers[currentQuestionIndex] !== undefined;
    const canShowNext = selectedAnswer !== null;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden flex flex-col items-center pt-8">
            {/* Enhanced Animated Background */}
            <div className="absolute inset-0">
                <div className="bg-grid absolute inset-0"></div>
                <div className="floating-orb-1 absolute w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full opacity-10 animate-float-1"></div>
                <div className="floating-orb-2 absolute w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full opacity-10 animate-float-2"></div>
                <div className="floating-orb-3 absolute w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full opacity-15 animate-float-3"></div>
                <div className="floating-orb-4 absolute w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 rounded-full opacity-20 animate-float-4"></div>

                {/* Animated Lines */}
                <div className="animated-line-1 absolute h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30"></div>
                <div className="animated-line-2 absolute w-px bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-30"></div>
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-4 sm:mb-6 animate-fade-in-down">
                    <div className="mb-3 sm:mb-4 relative">
                        {hasAnsweredCurrent && (
                            <div className="text-sm text-green-400 animate-fade-in">
                                ✓ Previously answered
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center gap-2 sm:gap-3 animate-slide-in-left">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-base sm:text-lg font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 animate-slide-in-right">
                            <span className="text-base sm:text-lg font-medium">Time Left:</span>
                            <div className={`relative text-lg sm:text-xl lg:text-2xl font-bold px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 shadow-lg ${timeLeft <= 5 ? 'bg-red-600 animate-pulse shadow-red-500/30' : timeLeft <= 10 ? 'bg-yellow-600 shadow-yellow-500/30' : 'bg-green-600 shadow-green-500/30'}`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"></div>
                                <span className="relative z-10">{timeLeft}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="relative w-full bg-gray-800 rounded-full h-2 sm:h-3 mb-4 animate-fade-in border border-gray-700/50 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full opacity-50"></div>
                        <div
                            className="bg-gradient-to-r from-green-500 via-green-400 to-green-300 h-2 sm:h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-lg"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Question Container */}
                <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 animate-question-enter border border-gray-700/50 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-400/5 rounded-2xl"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-t-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-center mb-4 sm:mb-6">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse mr-2 sm:mr-3 flex-shrink-0"></div>
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center animate-type-writer leading-tight px-2">
                                {currentQuestion.question}
                            </h2>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse ml-2 sm:ml-3 flex-shrink-0"></div>
                        </div>

                        {/* Enhanced Options */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerClick(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`relative p-3 sm:p-4 lg:p-5 rounded-xl text-left transition-all duration-300 transform hover:scale-105 border ${selectedAnswer === null ? 'animate-option-enter' : ''} ${selectedAnswer === null
                                        ? 'bg-gray-700/80 hover:bg-gray-600/80 cursor-pointer hover:shadow-xl border-gray-600/50 hover:border-green-500/50'
                                        : selectedAnswer === index
                                            ? isCorrect
                                                ? 'bg-green-600/90 animate-correct-answer border-green-400 shadow-green-500/30'
                                                : 'bg-red-600/90 animate-wrong-answer border-red-400 shadow-red-500/30'
                                            : index === currentQuestion.correctAnswer && selectedAnswer !== null
                                                ? 'bg-green-600/90 animate-reveal-correct border-green-400 shadow-green-500/30'
                                                : 'bg-gray-700/50 opacity-50 border-gray-600/30'
                                        } ${selectedAnswer !== null ? 'cursor-not-allowed' : ''}`}
                                    style={{
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                                    <div className="relative z-10 flex items-center">
                                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-600 rounded-full font-bold mr-3 sm:mr-4 text-xs sm:text-sm flex-shrink-0">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="flex-1 text-sm sm:text-base lg:text-lg leading-relaxed">{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={handleNextButton}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 animate-fade-in border border-green-400/30 shadow-lg"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} →
                            </button>
                        </div>


                        {/* Enhanced Explanation */}
                        {showExplanation && (
                            <div className={`relative p-4 sm:p-5 lg:p-6 rounded-xl mb-4 animate-explanation-enter border ${isCorrect ? 'bg-green-800/80 border-green-500/50 shadow-green-500/20' : 'bg-red-800/80 border-red-500/50 shadow-red-500/20'} shadow-xl backdrop-blur-sm`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                                        <h3 className="text-lg sm:text-xl font-semibold animate-bounce-in flex items-center gap-2 sm:gap-3">
                                            <span className="text-xl sm:text-2xl">{isCorrect ? '✅' : '❌'}</span>
                                            {isCorrect ? 'Correct!' : 'Incorrect!'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-base sm:text-lg font-bold bg-gray-900/50 px-3 sm:px-4 py-2 rounded-lg animate-pulse">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-bounce"></div>
                                            Auto-advance in {explanationTimer}s
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                                        <p className="text-sm sm:text-base lg:text-lg animate-fade-in-up leading-relaxed">{currentQuestion.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
                    .bg-grid {
                        background-image: 
                            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px);
                        background-size: 30px 30px;
                    }

                    @media (min-width: 640px) {
                        .bg-grid {
                            background-size: 40px 40px;
                        }
                    }

                    @media (min-width: 1024px) {
                        .bg-grid {
                            background-size: 50px 50px;
                        }
                    }

                    .floating-orb-1 {
                        background: linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2));
                        top: 10%;
                        left: 5%;
                    }

                    .floating-orb-2 {
                        background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.2));
                        top: 60%;
                        right: 10%;
                    }

                    .floating-orb-3 {
                        background: linear-gradient(225deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2));
                        bottom: 20%;
                        left: 15%;
                    }

                    .floating-orb-4 {
                        background: linear-gradient(315deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.2));
                        top: 30%;
                        right: 30%;
                    }

                    .animated-line-1 {
                        top: 25%;
                        left: 0;
                        right: 0;
                        animation: lineMove 8s ease-in-out infinite;
                    }

                    .animated-line-2 {
                        top: 0;
                        bottom: 0;
                        right: 25%;
                        animation: lineMove2 10s ease-in-out infinite;
                    }

                    @keyframes gridMove {
                        0% {
                            transform: translate(0, 0);
                        }
                        100% {
                            transform: translate(50px, 50px);
                        }
                    }

                    @keyframes float1 {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-20px) rotate(5deg);
                        }
                    }

                    @keyframes float2 {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-15px) rotate(-3deg);
                        }
                    }

                    @keyframes float3 {
                        0%, 100% {
                            transform: translateY(-10px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(10px) rotate(2deg);
                        }
                    }

                    @keyframes float4 {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-25px) rotate(-5deg);
                        }
                    }

                    @keyframes lineMove {
                        0%, 100% {
                            opacity: 0.3;
                            transform: translateX(-100px);
                        }
                        50% {
                            opacity: 0.8;
                            transform: translateX(100px);
                        }
                    }

                    @keyframes lineMove2 {
                        0%, 100% {
                            opacity: 0.3;
                            transform: translateY(-100px);
                        }
                        50% {
                            opacity: 0.8;
                            transform: translateY(100px);
                        }
                    }

                    @keyframes shimmer {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }

                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideInLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes slideInRight {
                        from {
                            opacity: 0;
                            transform: translateX(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes questionEnter {
                        from {
                            opacity: 0;
                            transform: translateY(50px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    @keyframes optionEnter {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes correctAnswer {
                        0% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }

                    @keyframes wrongAnswer {
                        0%, 100% {
                            transform: translateX(0);
                        }
                        25% {
                            transform: translateX(-5px);
                        }
                        75% {
                            transform: translateX(5px);
                        }
                    }

                    @keyframes revealCorrect {
                        from {
                            background-color: rgba(55, 65, 81, 0.5);
                        }
                        to {
                            background-color: rgba(22, 163, 74, 0.9);
                        }
                    }

                    @keyframes explanationEnter {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                            max-height: 0;
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                            max-height: 500px;
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes bounceIn {
                        0% {
                            opacity: 0;
                            transform: scale(0.3);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                        70% {
                            transform: scale(0.9);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    .animate-float-1 {
                        animation: float1 4s ease-in-out infinite;
                    }

                    .animate-float-2 {
                        animation: float2 5s ease-in-out infinite;
                    }

                    .animate-float-3 {
                        animation: float3 3.5s ease-in-out infinite;
                    }

                    .animate-float-4 {
                        animation: float4 6s ease-in-out infinite;
                    }

                    .animate-shimmer {
                        animation: shimmer 2s ease-in-out infinite;
                    }

                    .animate-fade-in-down {
                        animation: fadeInDown 0.6s ease-out forwards;
                    }

                    .animate-slide-in-left {
                        animation: slideInLeft 0.5s ease-out forwards;
                    }

                    .animate-slide-in-right {
                        animation: slideInRight 0.5s ease-out forwards;
                    }

                    .animate-fade-in {
                        animation: fadeIn 0.8s ease-out forwards;
                    }

                    .animate-question-enter {
                        animation: questionEnter 0.7s ease-out forwards;
                    }

                    .animate-option-enter {
                        animation: optionEnter 0.5s ease-out forwards;
                        opacity: 0;
                    }

                    .animate-correct-answer {
                        animation: correctAnswer 0.6s ease-in-out;
                    }

                    .animate-wrong-answer {
                        animation: wrongAnswer 0.5s ease-in-out;
                    }

                    .animate-reveal-correct {
                        animation: revealCorrect 0.8s ease-out forwards;
                    }

                    .animate-explanation-enter {
                        animation: explanationEnter 0.5s ease-out forwards;
                    }

                    .animate-fade-in-up {
                        animation: fadeInUp 0.5s ease-out forwards;
                    }

                    .animate-bounce-in {
                        animation: bounceIn 0.6s ease-out forwards;
                    }

                    /* Mobile-specific adjustments */
                    @media (max-width: 639px) {
                        .hover\\:scale-105:hover {
                            transform: none;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Questions;