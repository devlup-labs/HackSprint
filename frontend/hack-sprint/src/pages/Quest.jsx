import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
    SiHtml5, SiGithub, SiPython, SiNodedotjs,
    SiJavascript, SiMysql, SiTensorflow, SiReact, SiCss3
} from 'react-icons/si';
import QuestImg from '../assets/quest.png'
import './Allcss.css'

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


    const logos = [
        [
            SiHtml5, SiGithub, SiPython
        ], [
            SiNodedotjs,
            SiJavascript, SiMysql
        ], [
            SiTensorflow, SiReact, SiCss3
        ]
    ]

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

                setQuestions(formattedQuestions); // This updates the UI automatically
            } catch (err) {
                console.error("Error fetching questions:", err);
            }
        };

        fetchQuestions();
    }, []);


    // Timer for questions (90 seconds)
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

    const startQuiz = () => {
        setQuizStarted(true);
        setTimeLeft(20);
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setCurrentQuestionIndex(0);
        setTimeLeft(20);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setExplanationTimer(0);
        setQuizCompleted(false);
    };

    if (!quizStarted) {
        return (
            <div className="flex mt-20 items-start justify-around text-white font-sans overflow-hidden lg:overflow-none">
                <div className='ml-[-2vw]flex flex-col'>
                    <h1 className="text-3xl md:text-6xl leading-tight font-semibold text-white mb-30 animate-fade-in-up">
                        Ignite Your Tech Journey with<br />
                        HackSprint <span className="text-white">Dev Quests</span>
                    </h1>

                    <div className="w-[55vw] h-full animate-fade-in-left">
                        <img
                            src={QuestImg}
                            alt="DevQuest Preview"
                            className="w-full object-cover -mb-30 rounded-xl shadow-[0_0_10px_10px_rgba(0,255,255,0.2)] hover:scale-105 transition-transform duration-500"
                            style={{
                                boxShadow: `
                            0px 0px 1.15px rgba(25, 87, 84, 1),
                            0px 0px 2.29px rgba(25, 87, 84, 1),
                            0px 0px 8.03px rgba(25, 87, 84, 1),
                            0px 0px 16.06px rgba(25, 87, 84, 1),
                            0px 0px 27.53px rgba(25, 87, 84, 1),
                            0px 0px 48.18px rgba(25, 87, 84, 1)
                            `
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-10 mt-10 animate-fade-in-right">
                    <div className='flex flex-col gap-8 items-center ml-[-50px] animate-float'>
                        {logos.map((items, groupIndex) => (
                            <div className='flex items-center gap-8' key={groupIndex}>
                                {items.map((Icon, i) => (
                                    <Icon
                                        key={i}
                                        className="w-18 h-18 text-white hover:text-cyan-400 transition-colors duration-300 hover:scale-110 transform transition-transform"
                                        style={{
                                            animationDelay: `${(groupIndex * items.length + i) * 0.1}s`
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-end text-xl md:text-[2rem] leading-snug mt-2 animate-fade-in-up">
                        <p className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>Join daily to enhance your skills</p>
                        <p className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>through <span className="font-bold">Quests</span> and <span className="font-bold">Coding</span></p>
                        <p className="animate-slide-in-right" style={{ animationDelay: '0.7s' }}><span className="">challenges.</span></p>
                    </div>

                    <div className='animate-bounce-in'>
                        <button
                            onClick={startQuiz}
                            className="w-full bgButton text-white mt-10 text-xl md:text-5xl py-7 rounded-3xl cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 transform">
                            Question
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-50px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes fadeInRight {
                        from {
                            opacity: 0;
                            transform: translateX(50px);
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

                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-10px);
                        }
                    }

                    .animate-fade-in-up {
                        animation: fadeInUp 0.8s ease-out forwards;
                    }

                    .animate-fade-in-left {
                        animation: fadeInLeft 1s ease-out forwards;
                        animation-delay: 0.2s;
                        opacity: 0;
                    }

                    .animate-fade-in-right {
                        animation: fadeInRight 1s ease-out forwards;
                        animation-delay: 0.4s;
                        opacity: 0;
                    }

                    .animate-slide-in-right {
                        animation: slideInRight 0.6s ease-out forwards;
                        opacity: 0;
                    }

                    .animate-bounce-in {
                        animation: bounceIn 0.8s ease-out forwards;
                        animation-delay: 1s;
                        opacity: 0;
                    }

                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                        animation-delay: 1.5s;
                    }
                `}</style>
            </div>
        );
    };

    if (quizCompleted) {
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
                        <div className="inline-block p-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-2xl">
                            <span className="text-6xl animate-bounce-celebration">🏆</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-8 text-cyan-400 animate-pulse-slow">Quest Completed!</h1>

                    <div className="mb-8 p-6 bg-gray-800 rounded-2xl border border-cyan-500/30 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <p className="text-xl md:text-2xl mb-4 text-white">No more questions available</p>
                        <p className="text-lg text-gray-300">
                            You've completed all {questions.length} questions. Great job on finishing the DevQuest challenge!
                        </p>
                    </div>

                    <button
                        onClick={resetQuiz}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-xl cursor-pointer transition-all duration-300 transform hover:scale-105 animate-bounce-in shadow-xl border border-cyan-400/30"
                        style={{ animationDelay: '0.7s', opacity: 0 }}
                    >
                        Take Quest Again
                    </button>
                </div>

                <style jsx>{`
                    .celebration-bg-1 {
                        background: linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(147, 51, 234, 0.1));
                        top: 10%;
                        left: 10%;
                    }
                    
                    .celebration-bg-2 {
                        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
                        top: 20%;
                        right: 15%;
                    }
                    
                    .celebration-bg-3 {
                        background: linear-gradient(225deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1));
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
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden flex items-center justify-center">
            {/* Enhanced Animated Background */}
            <div className="absolute inset-0">
                <div className="bg-grid absolute inset-0"></div>
                <div className="floating-orb-1 absolute w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full opacity-10 animate-float-1"></div>
                <div className="floating-orb-2 absolute w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full opacity-10 animate-float-2"></div>
                <div className="floating-orb-3 absolute w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full opacity-15 animate-float-3"></div>
                <div className="floating-orb-4 absolute w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 rounded-full opacity-20 animate-float-4"></div>

                {/* Animated Lines */}
                <div className="animated-line-1 absolute h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"></div>
                <div className="animated-line-2 absolute w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-30"></div>
            </div>

            <div className="max-w-4xl w-full relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-4 sm:mb-6 animate-fade-in-down">
                    <div className="mb-3 sm:mb-4 relative">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 mb-2 relative leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                                DevQuest Challenge
                            </span>
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-70 animate-pulse"></div>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center gap-2 sm:gap-3 animate-slide-in-left">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-cyan-500 rounded-full animate-pulse"></div>
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
                            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-lg"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Question Container */}
                <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 animate-question-enter border border-gray-700/50 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-t-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-center mb-4 sm:mb-6">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-pulse mr-2 sm:mr-3 flex-shrink-0"></div>
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center animate-type-writer leading-tight px-2">
                                {currentQuestion.question}
                            </h2>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-pulse ml-2 sm:ml-3 flex-shrink-0"></div>
                        </div>

                        {/* Enhanced Options */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerClick(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`relative p-3 sm:p-4 lg:p-5 rounded-xl text-left transition-all duration-300 transform hover:scale-105 border ${selectedAnswer === null ? 'animate-option-enter' : ''} ${selectedAnswer === null
                                        ? 'bg-gray-700/80 hover:bg-gray-600/80 cursor-pointer hover:shadow-xl border-gray-600/50 hover:border-cyan-500/50'
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
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                                            Next in {explanationTimer}s
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
                            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
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
                        background: linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2));
                        top: 10%;
                        left: 5%;
                    }

                    .floating-orb-2 {
                        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2));
                        top: 60%;
                        right: 10%;
                    }

                    .floating-orb-3 {
                        background: linear-gradient(225deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2));
                        bottom: 20%;
                        left: 15%;
                    }

                    .floating-orb-4 {
                        background: linear-gradient(315deg, rgba(251, 146, 60, 0.2), rgba(239, 68, 68, 0.2));
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

export default Quest;