
import { useState, useEffect } from "react";
import { HeroSection } from "../hackathon/Hero-section";
import { SidebarNav } from "../hackathon/Sidebar-nav";
import { ContentSection } from "../hackathon/Content-section";
import { SocialShare } from "../hackathon/Social-share";
import { RegistrationForm } from "../hackathon/RegistrationForm";

// --- DUMMY MODE ---
const USE_DUMMY_DATA = true;

const dummyHackathons = [
  {
    _id: "60d21b4667d0d8992e610c85",
    title: "AI-Powered Personal Finance Advisor",
    subTitle:
      "Build an intelligent app to help users manage their finances smarter and faster.",
    description:
      "The AI-Powered Personal Finance Advisor hackathon challenges participants to create innovative tools that bring financial literacy, automation, and personalized financial planning into everyone's hands. Whether it's budget tracking, investment insights, or debt management, your solution should simplify and empower financial decision-making.",
    submissions: [
      { team: "FinBot" },
      { team: "MoneyMinds" },
      { team: "CashFlow AI" },
      { team: "BudgetBuddies" },
      { team: "InvestAI" },
    ],
    startDate: new Date("2025-08-01T00:00:00.000Z"),
    endDate: new Date("2025-09-10T23:59:59.000Z"),
    status: true,
    difficulty: "Advanced",
    category: ["AI/ML", "FinTech", "Blockchain"],
    prizeMoney: 10000,
    techStackUsed: [
      "React",
      "Node.js",
      "Python",
      "TensorFlow",
      "Plaid API",
      "MongoDB",
      "Docker",
    ],
    about: `This hackathon is dedicated to empowering individuals with innovative financial solutions. Participants will dive into real-world financial challenges such as budgeting, credit score improvement, investment guidance, and fraud detection. The goal is to bring cutting-edge AI/ML into personal finance, helping people make smarter money choices. You'll also gain exposure to APIs widely used in FinTech, work with real datasets, and build solutions that can impact millions of users worldwide.

💡 What's in it for you?

Get showcased: The top 3 teams will have their ideas showcased at Elastic{ON} Bengaluru on September 24, in front of hundreds of tech leaders — including Elastic's Leadership.
Elite mentorship: One-on-one sessions with Elastic and AWS experts — get hands-on feedback from AI builders, solution architects, and tech veterans.
Get the spotlight: The top 3 teams will be featured on Elastic's global blog, reaching developers and innovators across the world.
₹6 Lakhs in prizes: Rewards plus visibility — a winning combo to fast-track your future.`,
    rules: `The hackathon is open to teams of 3-5 members, all of whom must be working professionals only. Basic knowledge of Elastic products and AWS LLM is recommended. Teams must be made up of no less than three (3) members and no more than five (5) members.
We do not require to form teams within the same organisation

You can either invite your friends to form a team or you can request other teams to add you as a member.

The idea proposal is an online activity and will start on Jul 18, 2025 05:30 PM IST (Asia/Kolkata) and end at Sep 07, 2025 11:59 PM IST (Asia/Kolkata).

The shortlisted participants will receive details about the venue and timings for the hackathon by 12th September 2025.

The online training for shortlisted participants will be conducted on 15th September 2025.

The shortlisted teams will be invited to Bengaluru for the finale on 18th September 2025.

There are 3 themes of the hackathon, you must submit a hack that is in one of these themes.

During the idea proposal phase you are allowed to edit/resubmit your proposal.

You are expected to come up with new and innovative ideas, any idea that has been copied from somewhere will be disqualified.

Your idea proposal must be developed entirely during the Hackathon duration. You may use open source libraries and other freely available systems / services such as Google Maps, Facebook Connect, Twitter feeds etc.

Please refer to Section 8. Intellectual Property of Hackathon Terms and Conditions for details on ownership.

Pursuant to Elastic's Anti-bribery and Gifts & Entertainment Policy, we ask that you provide a written acknowledgment via email confirming that you have reviewed the potential prize within your organisation and that its acceptance complies with the local anti-bribery laws and policies of your country and employing agency.

By participating in the hackathon, you agree to the terms and conditions of HackerEarth.`,
    judging: `Judging CriteriaSubmissions will be evaluated by a panel of experts from Elastic, AWS, and the developer community. Your solution will be judged on the following criteria:

Innovation (25%)

Novelty of the idea and its use of Generative AI. How original and forward-thinking is the concept?

Technical Implementation (30%)

Effective use of Elasticsearch and other relevant technologies. How well was the solution architected and built?

Impact (20%)

Practical applications and the potential to solve real-world problems. Does it address a meaningful challenge?

User Experience (15%)

Simplicity, design, and usability. Is the experience intuitive, accessible, and well-designed?

Presentation (10%)

Clarity of the demo and pitch. How well is the idea communicated and showcased?`,
    themes: `Hack-the-Impossible
Break logic. Bend rules. Build the unthinkable.

Making the Impossible, Possible. Use Elastic to build a solution that tackles a seemingly impossible challenge.
  
 
Hack-Life
Hack what matters — your mind, habits, and everyday chaos.

Build an innovative solution with Elastic to solve a day-to-day / life problem of your own.

 
Hack-to-the-Future
Build the tools we'll all use in 2030 — today.

Invent ahead of your time. Build solutions the future will thank you for.`,
    prizes: `Main Prizes:
 
Winner
INR 300000
 
1st Runner Up
INR 200000
 
2nd Runner Up
INR 100000`,
    submissionGuide: `To participate in Forge the Future, you'll need to submit a compelling idea that demonstrates your vision, technical depth, and alignment with the Hackathon theme.
Problem Statement

Clearly define the challenge you are addressing. What gap are you trying to bridge? Why does this problem matter?

Solution

Outline your proposed solution — how it works, what makes it effective, and how it will bring value to users, communities, or businesses. Highlight what's innovative about your idea.

Tech Stack

List the technologies you plan to use. Make sure to include how you'll incorporate Elastic — whether it's via Elasticsearch, Kibana, Elastic Observability, or other capabilities from Elastic's AI stack.

Guidelines for Idea Submission

Your idea must align with the Hackathon theme.
It should clearly articulate both the problem and the proposed solution.
Be specific about how Elastic technology will be used to power or enhance your solution.
This Idea Submission will form the foundation of your full project submission if selected for the Hackathon.
Think bold, build real. Let your imagination lead — but keep it rooted in real-world impact.`,
    faqs: [
      {
        question: "Can we do any pre-preparation before the hackathon?",
        answer: "No, you are only expected to start hacking on the hackathon day. However, data preparation is encouraged."
      },
      {
        question: "I already have data or an existing Elastic cluster, can I reuse that?",
        answer: "Yes, you can reuse it. We consider this part of data preparation. You will not be at a disadvantage if you don't have an existing one."
      },
      {
        question: "I do not have any technical background, can I join the hackathon?",
        answer: "At least one member of your team should have a technical background to be able to create an application using Elastic and Amazon Bedrock (and/or Foundation Models). You may find that a diverse team made of product managers or UX practitioners can be beneficial."
      },
      {
        question: "I'm a government employee or represent the government. Can I participate?",
        answer: "Pursuant to Elastic's Anti-bribery and Gifts & Entertainment Policy, we ask that you provide a written acknowledgment via email confirming that you have reviewed the potential prize within your organisation and that its acceptance complies with the local anti-bribery laws and policies of your country and employing agency."
      },
      {
        question: "Are we supposed to make our own travel and accommodation arrangements?",
        answer: "Yes, all participants will be handling their own travel and accommodation."
      },
      {
        question: "Do I need to pay any money to register for the Hackathon?",
        answer: "No. You do not have to pay anything to anyone to register yourself for any Hackathon on HackerEarth."
      },
      {
        question: "Do I need to have any specific qualifications to be a participant for the Hackathon?",
        answer: "If you love to code, you are more than welcome to participate in the Hackathon."
      },
      {
        question: "If it is a team submission, does that mean all team members will have access to work at the same time?",
        answer: "Yes, all team members can log in from their accounts and do application submission on HackerEarth."
      },
      {
        question: "Who will own the IP (Intellectual Property) Rights to the product that I have built?",
        answer: "Please refer to Section 8. Intellectual Property of Hackathon Terms and Conditions for details on ownership."
      }
    ]
  },
];

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-hero-primary"></div>
      <div
        className="absolute inset-0 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-hero-secondary"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      ></div>
    </div>
  </div>
);

export default function HackathonDetails() {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  // --- State for managing views ---
  const [view, setView] = useState("details"); // Can be 'details' or 'form'

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      await new Promise((r) => setTimeout(r, 600));
      if (USE_DUMMY_DATA) {
        const found = dummyHackathons[0];
        setHackathon(found);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // --- Handlers for registration flow ---
  const handleRegister = () => {
    // This function will be called from the HeroSection component
    // when a logged-in and verified user clicks the register button
    setView("form");
  };
  
  const handleFormSubmit = async (formData) => {
    try {
      // In a real app, you'd send the data to a backend API here
      console.log("Submitting registration data to backend:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful registration, go back to details view
      setView("details");
      
      // The HeroSection component will handle updating the registration status
      // through its own state management
      
    } catch (error) {
      console.error('Registration error:', error);
      // Handle error appropriately
    }
  };

  // --- Render logic ---
  if (loading) return <Loader />;
  
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-destructive font-mono text-2xl p-8 text-center">
        {error}
      </div>
    );
    
  // Conditionally render the registration form
  if (view === "form") {
    return <RegistrationForm onBack={() => setView("details")} onSubmit={handleFormSubmit} />;
  }

  // Render the main hackathon details page
  return (
    <div className="min-h-screen bg-[#101622]">
      <HeroSection
        title={hackathon.title}
        subTitle={hackathon.subTitle}
        isActive={hackathon.status}
        startDate={hackathon.startDate}
        endDate={hackathon.endDate}
        participantCount={hackathon.submissions?.length || 0}
        prizeMoney={hackathon.prizeMoney}
        imageUrl="/assets/hackathon-banner.png"
        hackathonId={hackathon._id}
        onRegister={handleRegister}
      />

      <div className="flex">
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <ContentSection activeSection={activeSection} hackathon={hackathon} />
        <SocialShare />
      </div>
    </div>
  );
}
=======
import React, { useState, useEffect } from 'react'
import Loader from '../components/Loader'
import { Users, Calendar, Timer, ArrowRight, Code, Trophy, Zap, Star, Github, ExternalLink, Terminal, Coffee, Bug, Lightbulb, Cpu, Database } from 'lucide-react'
import axios from "axios";


const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30 animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`
        }}
      />
    ))}
  </div>
)

const GridBackground = () => (
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px'
    }} />
  </div>
)

const TabButton = ({ active, onClick, children, count, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 font-medium text-sm sm:text-base ${
      active
        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
        : 'bg-white/5 text-gray-400 border border-gray-700/50 hover:bg-white/10 hover:text-green-400 hover:border-green-500/20'
    }`}
  >
    <Icon size={16} className={active ? 'text-green-400' : 'text-gray-500'} />
    <span>{children}</span>
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
      active ? 'bg-green-500/30 text-green-300' : 'bg-gray-700/50 text-gray-400'
    }`}>
      {count}
    </span>
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 rounded-lg animate-pulse" />
    )}
  </button>
)

const HackathonCard = ({ hackathon }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  function getProgress(startDate, endDate) {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const totalDuration = end - start;
    const elapsed = now - start;

    return ((elapsed / totalDuration) * 100).toFixed(2);
  }

  const getCountdown = (targetDate) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return "0d 0h 0m";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(hackathon.status === 'upcoming' ? hackathon.startDate : hackathon.endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [hackathon.endDate, hackathon.startDate, hackathon.status]);

  const isExpired = hackathon.status === 'expired'
  const isUpcoming = hackathon.status === 'upcoming'

  const getStatusColor = () => {
    if (isExpired) return 'red'
    if (isUpcoming) return 'blue'
    return 'green'
  }

  const statusColor = getStatusColor()

  return (
    <div
      className={`border border-green-500/20 bg-white/5 backdrop-blur-sm hover:border-green-400 hover:scale-[1.02] transition-all duration-300 rounded-xl cursor-pointer relative group overflow-hidden ${isHovered ? 'shadow-2xl shadow-green-500/20' : ''
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scan line effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform -skew-x-12 transition-transform duration-1000 ${isHovered ? 'translate-x-full' : '-translate-x-full'
        }`} />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-80 lg:h-60 h-48 w-full relative overflow-hidden rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none">
          {/* Image Container */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
            {hackathon.image && !imageError ? (
              <>
                <img
                  src={hackathon.image}
                  alt={hackathon.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                  } ${isHovered ? 'scale-105' : 'scale-100'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              /* Fallback Design */
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: `
                      linear-gradient(45deg, rgba(34, 197, 94, 0.1) 25%, transparent 25%),
                      linear-gradient(-45deg, rgba(34, 197, 94, 0.1) 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, rgba(34, 197, 94, 0.1) 75%),
                      linear-gradient(-45deg, transparent 75%, rgba(34, 197, 94, 0.1) 75%)
                    `,
                    backgroundSize: '30px 30px',
                    backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px'
                  }} />
                </div>
                <div className="text-center z-10">
                  <Code size={40} className="text-green-400/60 mx-auto mb-2" />
                  <div className="text-green-400/40 text-sm font-mono">HACKATHON</div>
                </div>
              </div>
            )}

            {/* Status Badge on Image */}
            <div className="absolute top-3 left-3 z-20">
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-${statusColor}-500/30`}>
                <span className={`h-2 w-2 rounded-full bg-${statusColor}-400 animate-pulse`}></span>
                <span className={`text-xs font-medium text-${statusColor}-300 uppercase tracking-wide`}>
                  {hackathon.status}
                </span>
              </div>
            </div>

            {/* Floating Tech Icons */}
            <div className="absolute bottom-3 left-3 flex gap-1 z-20">
              {(hackathon.techStack || []).slice(0, 3).map((tech, index) => (
                <div key={index} className="backdrop-blur-sm bg-black/30 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">
                  {tech}
                </div>
              ))}
              {hackathon.techStack && hackathon.techStack.length > 3 && (
                <div className="backdrop-blur-sm bg-black/30 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">
                  +{hackathon.techStack.length - 3}
                </div>
              )}
            </div>

            {/* Geometric overlay effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              isHovered ? 'animate-pulse' : ''
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rotate-45 transform translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/5 rotate-12 transform -translate-x-12 translate-y-12" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-4 sm:px-5 py-4 sm:py-5 relative z-10">
          {/* Timer Badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-${statusColor}-500/10 backdrop-blur-sm`}>
              <Timer size={12} className={`text-${statusColor}-400`} />
              <span className={`font-mono text-xs sm:text-sm text-${statusColor}-400`}>
                {isExpired ? '0d 0h 0m' : (countdown || getCountdown(isUpcoming ? hackathon.startDate : hackathon.endDate))}
              </span>
            </div>
          </div>

          <div className="pr-20 sm:pr-24 md:pr-28 lg:pr-32">
            <div className="flex flex-col gap-2 mb-3">
              <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-white/90 leading-tight">
                {hackathon.title}
              </h3>
              <div className="flex gap-1 flex-wrap">
                {/* Difficulty tag */}
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
                  {hackathon.difficulty}
                </span>

                {/* Multiple category tags */}
                {(hackathon.category || []).map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full whitespace-nowrap"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <p className='text-gray-400 text-sm sm:text-base mb-4 line-clamp-2'>{hackathon.description}</p>

            {/* Tech Stack - Mobile Only (Desktop shown on image) */}
            <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
              {(hackathon.techStack || []).map((tech, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded">
                  {tech}
                </span>
              ))}
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 lg:gap-8'>
              <div className='flex items-center text-xs sm:text-sm'>
                <Users size={14} className='text-gray-500' />
                <span className='ml-1 text-gray-400'>{hackathon.participants} participants</span>
              </div>
              <div className='flex items-center text-xs sm:text-sm'>
                <Trophy size={14} className='text-gray-500' />
                <span className='ml-1 text-gray-400'>${hackathon.prize}</span>
              </div>
              <div className='flex items-center text-xs sm:text-sm'>
                <Calendar size={14} className='text-gray-500' />
                <span className='ml-1 text-gray-400'>{hackathon.dates}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar for active hackathons */}
      {hackathon.status === 'active' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
            style={{ width: `${getProgress(hackathon.startDate, hackathon.endDate)}%` }}
          />
        </div>
      )}
    </div>
  )
}

const Hackathons = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [activeHackathons, setActiveHackathons] = useState([])
  const [expiredHackathons, setExpiredHackathons] = useState([])
  const [upcomingHackathons, setUpcomingHackathons] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.fade-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const [activeRes, expiredRes, upcomingRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/hackathons`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/hackathons/expiredHackathons`),
          // axios.get("http://localhost:3000/api/hackathons/upcomingHackathons"), // Assuming this endpoint exists
        ]);

        const mapData = (data, status) =>
          (data || []).map((h) => ({
            ...h,
            status: status,
            participants: h.numParticipants || 0,
            prize: h.prizeMoney,
            techStack: h.techStackUsed || [],
            category: h.category || 'General',
            image: h.image || h.imageUrl || null, // Support both 'image' and 'imageUrl' field names
            dates: `${new Date(h.startDate).toLocaleDateString()} - ${new Date(h.endDate).toLocaleDateString()}`
          }));

        setActiveHackathons(mapData(activeRes.data.allHackathons, 'active'));
        setExpiredHackathons(mapData(expiredRes.data.expiredHackathons, 'expired'));
        setUpcomingHackathons(mapData(upcomingRes.data.upcomingHackathons || [], 'upcoming')); // Handle if endpoint doesn't exist yet
      } catch (error) {
        console.error("Error fetching hackathons:", error);
        // Handle the case where upcoming endpoint doesn't exist yet
        if (error.response?.status === 404 && error.config.url.includes('upcomingHackathons')) {
          setUpcomingHackathons([]);
        }
      }
    };

    fetchHackathons();
  }, []);

  const getCurrentHackathons = () => {
    switch (activeTab) {
      case 'active':
        return activeHackathons;
      case 'upcoming':
        return upcomingHackathons;
      case 'expired':
        return expiredHackathons;
      default:
        return activeHackathons;
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'active':
        return 'Active Hackathons';
      case 'upcoming':
        return 'Upcoming Hackathons';
      case 'expired':
        return 'Expired Hackathons';
      default:
        return 'Active Hackathons';
    }
  }

  const getTabIcon = () => {
    switch (activeTab) {
      case 'active':
        return (
          <span className="relative flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-lg inline-block"></span>
            <span className="absolute inset-0 h-3 w-3 rounded-full bg-green-400 animate-ping"></span>
          </span>
        );
      case 'upcoming':
        return <span className="h-3 w-3 rounded-full bg-blue-400 shadow-lg"></span>;
      case 'expired':
        return <span className="h-3 w-3 rounded-full bg-red-400 opacity-50"></span>;
      default:
        return null;
    }
  }

  const getTabGradient = () => {
    switch (activeTab) {
      case 'active':
        return 'from-green-300 to-green-800';
      case 'upcoming':
        return 'from-blue-300 to-blue-800';
      case 'expired':
        return 'from-red-300 to-red-500';
      default:
        return 'from-green-300 to-green-800';
    }
  }

  return (
    <div className='bg-gray-900 relative overflow-hidden min-h-screen -mt-16'>
      <Loader />
      <GridBackground />
      <FloatingParticles />

      {/* Tab Navigation */}
      <div className='flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32 lg:mt-40'>
        <div className='flex flex-col w-full max-w-7xl'>
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10">
            <TabButton
              active={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
              count={activeHackathons.length}
              icon={Zap}
            >
              Active
            </TabButton>
            <TabButton
              active={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
              count={upcomingHackathons.length}
              icon={Calendar}
            >
              Upcoming
            </TabButton>
            <TabButton
              active={activeTab === 'expired'}
              onClick={() => setActiveTab('expired')}
              count={expiredHackathons.length}
              icon={Timer}
            >
              Expired
            </TabButton>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl sm:text-3xl lg:text-5xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-b ${getTabGradient()} flex items-center gap-3`}>
              {getTabIcon()}
              {getTabTitle()}
            </h2>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                <span className="text-green-400 font-mono">{getCurrentHackathons().length}</span> {activeTab}
              </div>
              <button className="text-green-400 hover:text-green-300 transition-colors">
                <ExternalLink size={20} />
              </button>
            </div>
          </div>

          {/* Hackathons List */}
          <div className='space-y-4 sm:space-y-6 mb-20 sm:mb-32 lg:mb-40'>
            {getCurrentHackathons().length > 0 ? (
              getCurrentHackathons().map((hackathon, index) => (
                <HackathonCard key={`${activeTab}-${index}`} hackathon={hackathon} />
              ))
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-8xl mb-4 opacity-20">🏆</div>
                <h3 className="text-xl sm:text-2xl text-gray-400 mb-2">No {activeTab} hackathons</h3>
                <p className="text-gray-500">Check back later for updates!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hackathons
