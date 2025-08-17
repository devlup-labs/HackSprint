import { useState, useEffect, useRef } from "react"
import {
  Users,
  ArrowRight,
  Code,
  Trophy,
  Zap,
  Terminal,
  Database,
  Rocket,
  Brain,
  Globe,
  Shield,
  Lightbulb,
  Target,
  Award,
  TrendingUp,
  Play,
  Clock,
  CheckCircle,
  Layers,
  Wifi,
  Smartphone,
  Cloud,
  Briefcase,
  GraduationCap,
  Building,
  MapPin,
  Calendar,
  MessageCircle,
  Star,
  Github,
  Linkedin,
  Twitter,
  BarChart3,
  Sparkles,
  ChevronRight,
  BookOpen,
  Coffee,
} from "lucide-react"

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-green-400 rounded-full opacity-40 animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${2 + Math.random() * 4}s`,
        }}
      />
    ))}
    {[...Array(20)].map((_, i) => (
      <div
        key={`large-${i}`}
        className="absolute w-2 h-2 bg-green-600 rounded-full opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animation: 'float 6s ease-in-out infinite',
        }}
      />
    ))}
  </div>
)

const GridBackground = () => (
  <div className="absolute inset-0 opacity-5">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
        linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
      `,
        backgroundSize: "40px 40px",
      }}
    />
    <div
      className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400/3 rounded-full blur-3xl"
      style={{ animation: 'morph 8s ease-in-out infinite' }}
    />
    <div
      className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-green-600/3 rounded-full blur-3xl"
      style={{ animationDelay: "4s", animation: 'morph 8s ease-in-out infinite' }}
    />
    <div
      className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-400/2 rounded-full blur-2xl"
      style={{ animationDelay: "2s", animation: 'morph 8s ease-in-out infinite' }}
    />
  </div>
)

const TypingText = ({ text, className = "" }) => {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [text])

  return (
    <div className={className}>
      {displayText}
      {isTyping && <span className="animate-pulse text-green-400">|</span>}
    </div>
  )
}

const StatCard = ({ value, label, icon: Icon, delay = 0 }) => (
  <div
    className="bg-gray-900/70 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 hover:border-green-400/30 transition-all duration-500 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 bg-green-400/10 rounded-lg flex items-center justify-center group-hover:bg-green-400/20 transition-colors duration-300">
        <Icon className="w-4 h-4 text-green-400" />
      </div>
      <Sparkles className="w-3 h-3 text-green-400/50 group-hover:text-green-400 transition-colors duration-300" />
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
)

// Enhanced Developer Journey Component with Scroll Animations
const DeveloperJourneySection = () => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.dataset.index]));
          }
        });
      },
      { threshold: 0.3, rootMargin: '-50px' }
    );

    const cards = document.querySelectorAll('[data-journey-card]');
    cards.forEach((card) => observer.observe(card));

    // Scroll progress for timeline
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionHeight = sectionRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (sectionHeight + windowHeight)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      cards.forEach((card) => observer.unobserve(card));
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const journeyData = [
    {
      phase: "Phase 1",
      title: "Foundation Building",
      duration: "Weeks 1-4",
      icon: BookOpen,
      description: "Master the fundamentals with hands-on projects and mentorship",
      skills: ["Programming Basics", "Version Control", "Problem Solving", "Team Collaboration"],
      projects: 3,
      side: "left",
    },
    {
      phase: "Phase 2",
      title: "Skill Specialization",
      duration: "Weeks 5-12",
      icon: Target,
      description: "Deep dive into your chosen technology stack with real-world applications",
      skills: ["Advanced Frameworks", "Database Design", "API Development", "Testing"],
      projects: 5,
      side: "right",
    },
    {
      phase: "Phase 3",
      title: "Innovation & Leadership",
      duration: "Weeks 13-24",
      icon: Rocket,
      description: "Lead teams, build complex systems, and create industry-changing solutions",
      skills: ["System Architecture", "Team Leadership", "Product Strategy", "Innovation"],
      projects: 8,
      side: "left",
    },
    {
      phase: "Phase 4",
      title: "Industry Impact",
      duration: "Ongoing",
      icon: Award,
      description: "Mentor others, contribute to open source, and shape the future of technology",
      skills: ["Mentorship", "Open Source", "Speaking", "Entrepreneurship"],
      projects: "∞",
      side: "right",
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="fade-section py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-900/30 backdrop-blur-sm overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `journeyFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with stagger animation */}
        <div className="text-center mb-16">
          <div 
            className="flex items-center justify-center mb-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]"
          >
            <div className="w-px h-8 bg-green-400"></div>
            <span className="text-green-400 text-sm font-semibold tracking-wide uppercase mx-4">DEVELOPER JOURNEY</span>
            <div className="w-px h-8 bg-green-400"></div>
          </div>
          <h2 className="text-5xl sm:text-5xl md:text-5xl lg:text-[3rem] xl:text-[100px] text-white ZaptronFont text-center relative opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
            Your Path to Excellence
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            Follow a structured learning path designed by industry experts. From beginner to advanced, each step is
            crafted to accelerate your growth and maximize your potential.
          </p>
        </div>

        <div className="relative">
          {/* Animated Timeline */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-transparent via-green-500 to-transparent rounded-full"
            style={{
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgb(34, 197, 94) ${scrollProgress * 100}%, 
                rgba(34, 197, 94, 0.3) ${scrollProgress * 100}%, 
                rgba(34, 197, 94, 0.3) 100%)`
            }}
          />

          <div className="space-y-16">
            {journeyData.map((journey, index) => (
              <div 
                key={index} 
                className={`flex items-center ${journey.side === "right" ? "flex-row-reverse" : ""}`}
                data-journey-card
                data-index={index}
              >
                <div className={`w-1/2 ${journey.side === "right" ? "pl-12" : "pr-12"}`}>
                  <div 
                    className={`bg-gray-900/70 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-green-400/30 hover:shadow-2xl hover:shadow-green-400/10 transition-all duration-700 group ${
                      visibleItems.has(index.toString()) 
                        ? `opacity-100 translate-y-0 ${journey.side === 'left' ? 'translate-x-0' : 'translate-x-0'}` 
                        : `opacity-0 ${journey.side === 'left' ? 'translate-x-[-50px] translate-y-8' : 'translate-x-[50px] translate-y-8'}`
                    }`}
                    style={{
                      transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      transitionDelay: `${index * 0.2}s`
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-400/10 rounded-xl flex items-center justify-center border border-green-400/20 group-hover:bg-green-400/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                          <journey.icon className="w-7 h-7 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <div>
                          <p className="text-green-400 text-sm font-semibold">{journey.phase}</p>
                          <p className="text-gray-400 text-sm">{journey.duration}</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                      {journey.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{journey.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {journey.skills.map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="bg-green-400/5 border border-green-400/20 text-green-400 px-3 py-2 rounded-lg text-xs font-medium text-center hover:bg-green-400/10 transition-all duration-300 hover:scale-105"
                          style={{
                            animation: visibleItems.has(index.toString()) 
                              ? `slideInRight 0.6s ease-out ${0.8 + skillIndex * 0.1}s forwards` 
                              : 'none',
                            opacity: visibleItems.has(index.toString()) ? 1 : 0,
                            transform: visibleItems.has(index.toString()) ? 'translateX(0)' : 'translateX(20px)'
                          }}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-2 hover:text-green-400 transition-colors duration-300">
                          <Briefcase className="w-4 h-4" />
                          {journey.projects} Projects
                        </span>
                        <span className="flex items-center gap-2 hover:text-green-400 transition-colors duration-300">
                          <Clock className="w-4 h-4" />
                          {journey.duration}
                        </span>
                      </div>
                      <button className="bg-green-400/10 hover:bg-green-400/20 border border-green-400/20 text-green-400 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 hover:scale-105 hover:shadow-lg hover:shadow-green-400/20 group">
                        View Details
                        <ChevronRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Timeline Node */}
                <div className="relative z-10">
                  <div
                    className={`w-8 h-8 bg-green-400 rounded-full border-4 border-gray-900 shadow-lg transition-all duration-500 ${
                      visibleItems.has(index.toString()) 
                        ? 'shadow-green-400/50 scale-100' 
                        : 'shadow-green-400/20 scale-75'
                    }`}
                    style={{
                      animation: visibleItems.has(index.toString()) 
                        ? 'journeyPulse 2s ease-in-out infinite' 
                        : 'none'
                    }}
                  >
                    <div className="w-full h-full bg-green-400 rounded-full relative">
                      {visibleItems.has(index.toString()) && (
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const sections = document.querySelectorAll(".fade-section")
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  return (
    <div className="bg-gray-900 relative overflow-hidden min-h-screen -mt-16">
      <GridBackground />
      <FloatingParticles />

      {/* Hero Section */}
      <div className="h-screen flex flex-col items-center justify-center overflow-hidden relative px-4 sm:px-6 lg:px-8 pt-16">
        {/* Live Stats Bar */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live:</span>
              <span className="text-white text-sm">50+ developers online</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <Trophy className="w-3 h-3 text-green-400" />
              <span className="text-white text-sm">4 active competitions</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 z-20 relative">
          <div className="mb-4">
            <span className="bg-green-400/10 text-green-400 px-4 py-2 rounded-full text-sm font-medium border border-green-400/20">
              Welcome to the Future of Innovation
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[120px] ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 tracking-widest z-10 text-center relative">
            HackSprint
            <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-green-800 blur-3xl opacity-20 -z-10" />
          </h1>

          <TypingText
            text="Where Innovation Meets Opportunity"
            className="text-xl sm:text-2xl text-gray-300 mt-6 font-medium"
          />

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            Join the developers building the future through collaborative hackathons,
            skill development, and industry connections.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button
              className="bg-green-400 hover:bg-green-500 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group"
              style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
            >
              Start Building Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="border border-gray-700 text-gray-300 hover:border-green-400/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 group bg-gray-900/50 backdrop-blur-sm">
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Floating Quote Boxes - Enhanced */}
        <div className="hidden xl:block absolute inset-0 z-10">
          <div
            className="absolute border border-gray-800/50 bg-gray-900/80 backdrop-blur-lg rounded-xl text-white text-center px-6 py-4 max-w-xs opacity-80 hover:opacity-100 hover:border-green-400/30 transition-all duration-300 cursor-default shadow-2xl"
            style={{
              top: "15%",
              left: "3%",
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                <Code className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">"Code is poetry written in logic, and hackathons are where poets become legends."</p>
            <div className="flex justify-center mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-green-400 fill-current" />
              ))}
            </div>
          </div>

          <div
            className="absolute border border-gray-800/50 bg-gray-900/80 backdrop-blur-lg rounded-xl text-white text-center px-6 py-4 max-w-xs opacity-80 hover:opacity-100 hover:border-green-400/30 transition-all duration-300 cursor-default shadow-2xl"
            style={{
              top: "15%",
              right: "3%",
              animationDelay: "2s",
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">"Innovation happens when brilliant minds collide with impossible deadlines."</p>
            <div className="flex justify-center mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-green-400 fill-current" />
              ))}
            </div>
          </div>

          <div
            className="absolute border border-gray-800/50 bg-gray-900/80 backdrop-blur-lg rounded-xl text-white text-center px-6 py-4 max-w-xs opacity-80 hover:opacity-100 hover:border-green-400/30 transition-all duration-300 cursor-default shadow-2xl"
            style={{
              bottom: "15%",
              left: "3%",
              animationDelay: "4s",
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">"Every great startup began with a crazy idea and a weekend hackathon."</p>
            <div className="flex justify-center mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-green-400 fill-current" />
              ))}
            </div>
          </div>

          <div
            className="absolute border border-gray-800/50 bg-gray-900/80 backdrop-blur-lg rounded-xl text-white text-center px-6 py-4 max-w-xs opacity-80 hover:opacity-100 hover:border-green-400/30 transition-all duration-300 cursor-default shadow-2xl"
            style={{
              bottom: "15%",
              right: "3%",
              animationDelay: "6s",
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                <Rocket className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">"Dream in code, build in teams, launch into the future."</p>
            <div className="flex justify-center mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-green-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase Section */}
      <section id="features" className="fade-section py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-px h-8 bg-green-400"></div>
              <span className="text-green-400 text-sm font-semibold tracking-wide uppercase mx-4">PLATFORM FEATURES</span>
              <div className="w-px h-8 bg-green-400"></div>
            </div>
            <h1 className="text-5xl sm:text-5xl md:text-5xl lg:text-[3rem] xl:text-[100px] text-white ZaptronFont text-center relative">Everything You Need to Innovate</h1>
            <p className="text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
              From ideation to deployment, our comprehensive platform provides all the tools, resources, and community
              support you need to transform your wildest ideas into reality.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Terminal,
                title: "Cloud Development Environment",
                desc: "Code anywhere with our browser-based IDE featuring real-time collaboration, version control, and instant deployment.",
                features: ["VS Code Integration", "Live Collaboration", "Auto-Save & Sync", "Multi-Language Support"],
                gradient: "from-gray-900/80 to-gray-800/80",
                accent: "blue",
              },
              {
                icon: Users,
                title: "Team Formation & Matching",
                desc: "Find your perfect hackathon teammates using our AI-powered matching system based on skills and interests.",
                features: [
                  "Skill-Based Matching",
                  "Global Team Search",
                  "Communication Tools",
                  "Project Collaboration",
                ],
                gradient: "from-gray-900/80 to-gray-800/80",
                accent: "purple",
              },
              {
                icon: Trophy,
                title: "Competition Management",
                desc: "Participate in or host hackathons with our comprehensive event management and judging platform.",
                features: ["Event Creation", "Automated Judging", "Live Leaderboards", "Prize Distribution"],
                gradient: "from-gray-900/80 to-gray-800/80",
                accent: "green",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-green-400/30 hover:shadow-2xl hover:shadow-green-400/10 transition-all duration-500 transform hover:scale-105 group`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-16 h-16 bg-green-400/10 rounded-xl flex items-center justify-center group-hover:bg-green-400/20 transition-all duration-300 border border-green-400/20"
                  >
                    <feature.icon className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400 font-medium">FEATURED</div>
                    <div className="flex justify-end mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-green-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{feature.desc}</p>

                <div className="space-y-3 mb-6">
                  {feature.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      <div className="w-5 h-5 bg-green-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <button className="w-full bg-green-400/10 hover:bg-green-400/20 border border-green-400/20 hover:border-green-400/40 text-green-400 font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105">
                  Learn More
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Developer Journey Section */}
      <DeveloperJourneySection />

      {/* Success Stories Section */}
      <section id="success" className="fade-section py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-px h-8 bg-green-400"></div>
              <span className="text-green-400 text-sm font-semibold tracking-wide uppercase mx-4">SUCCESS STORIES</span>
              <div className="w-px h-8 bg-green-400"></div>
            </div>
            <h2 className="text-5xl sm:text-5xl md:text-5xl lg:text-[3rem] xl:text-[100px] text-white ZaptronFont text-center relative">From Hackathon to Unicorn</h2>
            <p className="text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
              Discover how our community members transformed weekend projects into billion-dollar companies, landed
              dream jobs at top tech firms, and revolutionized entire industries through innovation and determination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Sarah Chen",
                role: "Founder & CEO",
                company: "TechFlow AI",
                achievement: "$50M Series A",
                quote:
                  "What started as a 48-hour hackathon project became a company that's revolutionizing workflow automation for Fortune 500 companies.",
                gradient: "from-gray-900/80 to-gray-800/80",
                verified: true,
                social: { linkedin: "#", twitter: "#" },
              },
              {
                name: "Alex Rodriguez",
                role: "Senior Engineer",
                company: "Meta",
                achievement: "6-Figure Salary",
                quote:
                  "HackSprint didn't just teach me to code—it taught me to think like an innovator. The collaborative projects here prepared me for big tech.",
                gradient: "from-gray-900/80 to-gray-800/80",
                verified: true,
                social: { linkedin: "#", github: "#" },
              },
              {
                name: "Maya Patel",
                role: "CTO",
                company: "HealthTech Solutions",
                achievement: "IPO Success",
                quote:
                  "The collaborative spirit and technical excellence I learned here shaped how I build and lead engineering teams at scale.",
                gradient: "from-gray-900/80 to-gray-800/80",
                verified: true,
                social: { linkedin: "#", twitter: "#" },
              },
            ].map((story, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${story.gradient} backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-green-400/30 hover:shadow-2xl hover:shadow-green-400/10 transition-all duration-500 transform hover:scale-105 group`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-green-400/10 rounded-full border-2 border-green-400/20 group-hover:border-green-400/40 transition-colors duration-300 flex items-center justify-center">
                        <span className="text-green-400 font-bold text-lg">{story.name.charAt(0)}</span>
                      </div>
                      {story.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-gray-900" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{story.name}</h3>
                      <p className="text-gray-400 text-sm">{story.role}</p>
                      <p className="text-green-400 text-sm font-medium">{story.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {story.social.linkedin && (
                      <button className="w-8 h-8 bg-gray-800/50 hover:bg-green-400/20 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <Linkedin className="w-4 h-4 text-gray-400 hover:text-green-400" />
                      </button>
                    )}
                    {story.social.twitter && (
                      <button className="w-8 h-8 bg-gray-800/50 hover:bg-green-400/20 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <Twitter className="w-4 h-4 text-gray-400 hover:text-green-400" />
                      </button>
                    )}
                    {story.social.github && (
                      <button className="w-8 h-8 bg-gray-800/50 hover:bg-green-400/20 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <Github className="w-4 h-4 text-gray-400 hover:text-green-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-400/20">
                      {story.achievement}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-green-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-gray-300 italic leading-relaxed">"{story.quote}"</blockquote>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              className="bg-green-400 hover:bg-green-500 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
              style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
            >
              Read More Success Stories
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Community & Collaboration Section */}
      <section id="community" className="fade-section py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gray-900/70 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-green-400/30 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 bg-green-400/20 rounded-full border-2 border-gray-900 flex items-center justify-center"
                        >
                          <span className="text-green-400 font-bold">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">LIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center bg-gray-800/30 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400 mb-2">15</div>
                    <div className="text-gray-400 text-sm">Hackathons Completed</div>
                  </div>
                  <div className="text-center bg-gray-800/30 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                    <div className="text-gray-400 text-sm">Community Support</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-400/5 border border-green-400/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">Live Activity</span>
                      <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded text-xs">NEW</span>
                    </div>
                    <p className="text-gray-400 text-sm">127 developers currently collaborating on projects</p>
                  </div>

                  <div className="p-4 bg-green-600/5 border border-green-600/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-white text-sm font-medium">Recent Discussion</span>
                      <span className="bg-green-600/20 text-green-600 px-2 py-1 rounded text-xs">HOT</span>
                    </div>
                    <p className="text-gray-400 text-sm">"Best practices for microservices architecture"</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <div className="w-px h-8 bg-green-400"></div>
                <span className="text-green-400 text-sm font-semibold tracking-wide uppercase mx-4">GLOBAL COMMUNITY</span>
                <div className="w-px h-8 bg-green-400"></div>
              </div>
              <h2 className="whitespace-nowrap text-2xl sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-[50px] text-white ZaptronFont text-center relative">
                Join the Innovation Revolution
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Connect with visionary developers, entrepreneurs, and industry leaders who are shaping the future of
                technology. From mentorship to collaboration, find your tribe in our global community of innovators.
              </p>

              <div className="space-y-6 mb-8">
                {[
                  {
                    icon: Users,
                    title: "Expert Mentorship Program",
                    desc: "Learn from industry veterans, successful founders, and technical leaders who've built billion-dollar companies",
                    badge: "Premium",
                  },
                  {
                    icon: Target,
                    title: "Career Acceleration Track",
                    desc: "Fast-track your path to senior roles with personalized guidance, portfolio reviews, and interview prep",
                    badge: "Popular",
                  },
                  {
                    icon: Award,
                    title: "Recognition & Rewards",
                    desc: "Showcase your skills, win prestigious competitions, and earn certifications recognized by top companies",
                    badge: "New",
                  },
                  {
                    icon: Globe,
                    title: "Global Networking Events",
                    desc: "Attend virtual and in-person meetups, conferences, and hackathons in major tech hubs worldwide",
                    badge: "Featured",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group p-4 rounded-lg hover:bg-gray-800/20 transition-colors duration-300">
                    <div className="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-400/20 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{benefit.title}</h3>
                        <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-400/20">
                          {benefit.badge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-green-400 hover:bg-green-500 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
                >
                  Join the Revolution
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-gray-700 text-gray-300 hover:border-green-400/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm">
                  <Calendar className="w-5 h-5" />
                  View Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies & Partners Section */}
      <section className="fade-section py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-px h-8 bg-green-400"></div>
              <span className="text-green-400 text-sm font-semibold tracking-wide uppercase mx-4">TRUSTED BY INDUSTRY LEADERS</span>
              <div className="w-px h-8 bg-green-400"></div>
            </div>
            <h2 className="text-5xl sm:text-5xl md:text-5xl lg:text-[3rem] xl:text-[100px] text-white ZaptronFont text-center relative">Where Innovation Meets Opportunity</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Top companies and startups trust HackSprint to discover talent, drive innovation, and build the future
              together.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16 opacity-60">
            {[
              { name: "TechCorp", verified: true },
              { name: "InnovateLab", verified: true },
              { name: "DataFlow", verified: false },
              { name: "CloudTech", verified: true },
              { name: "AI Solutions", verified: true },
              { name: "BlockChain Co", verified: false },
            ].map((company, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:bg-gray-800/50 hover:border-green-400/30 transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="h-12 w-28 bg-green-400/10 border border-green-400/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-400/20 transition-colors duration-300">
                  <span className="text-green-400 text-xs font-bold">{company.name}</span>
                </div>
                {company.verified && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs">Verified Partner</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="fade-section py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-900/70 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-12 hover:border-green-400/30 transition-all duration-500">
              <div
                className="w-24 h-24 bg-green-400/10 border border-green-400/20 rounded-2xl flex items-center justify-center mx-auto mb-8"
                style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
              >
                <Rocket className="w-12 h-12 text-green-400" />
              </div>

              <h2 className="text-5xl sm:text-5xl md:text-5xl lg:text-[3rem] xl:text-[70px] text-white ZaptronFont text-center relative">Ready to Transform Your Future?</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                Join thousands of developers who have already accelerated their careers, built amazing products, and
                connected with the global tech community. Your innovation journey starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  className="bg-green-400 hover:bg-green-500 text-gray-900 font-semibold px-10 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2"
                  style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
                >
                  Start Building Today
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-gray-700 text-gray-300 hover:border-green-400/50 hover:text-white font-semibold px-10 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 text-lg bg-gray-900/50 backdrop-blur-sm">
                  <Play className="w-5 h-5" />
                  Watch Success Stories
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2 bg-gray-800/30 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Free to start
                </span>
                <span className="flex items-center gap-2 bg-gray-800/30 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2 bg-gray-800/30 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Join in 30 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .fade-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
          }
          100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4);
          }
        }

        @keyframes morph {
          0%, 100% {
            border-radius: 50%;
            transform: scale(1);
          }
          25% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: scale(1.1);
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: scale(0.9);
          }
          75% {
            border-radius: 40% 30% 60% 70% / 40% 50% 60% 80%;
            transform: scale(1.05);
          }
        }

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

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes journeyFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }

        @keyframes journeyPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.8);
          }
        }

        .animate-\[fadeInUp_0\.8s_ease-out_0\.2s_forwards\] {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }

        .animate-\[fadeInUp_0\.8s_ease-out_0\.4s_forwards\] {
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
        }

        .animate-\[fadeInUp_0\.8s_ease-out_0\.6s_forwards\] {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
        }
      `}</style>
    </div>
  )
}

export default Home