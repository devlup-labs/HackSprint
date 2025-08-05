import React, { useState, useEffect } from 'react'
import Loader from '../components/Loader'
import { Users, Calendar, Timer, ArrowRight, Code, Trophy, Zap, Star, Github, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'



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
      {isTyping && <span className="animate-pulse">|</span>}
    </div>
  )
}

const HackathonCard = ({ hackathon, isExpired = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (

    <div
      className={`border border-green-500/20 bg-white/5 backdrop-blur-sm hover:border-green-400 hover:scale-[1.02] transition-all duration-300 px-4 sm:px-5 py-4 sm:py-5 rounded-xl cursor-pointer relative group overflow-hidden ${isHovered ? 'shadow-2xl shadow-green-500/20' : ''
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick} 
    >
      {/* Scan line effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform -skew-x-12 transition-transform duration-1000 ${isHovered ? 'translate-x-full' : '-translate-x-full'
        }`} />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${isExpired ? 'bg-red-500/10' : 'bg-green-500/10'
          }`}>
          <Timer size={12} className={isExpired ? 'text-red-400' : 'text-green-400'} />
          <span className={`font-mono text-xs sm:text-sm ${isExpired ? 'text-red-400' : 'text-green-400'
            }`}>
            {isExpired ? '0d 0h 0m' : '3d 14h 22m'}
          </span>
        </div>
      </div>

      <div className='flex flex-col relative z-10'>
        <div className='flex flex-col flex-1 pr-20 sm:pr-24 md:pr-28 lg:pr-32'>
          <div className="flex flex-col gap-2 mb-2">
            <h3 className='font-semibold text-lg sm:text-xl lg:text-2xl text-white/90 pr-2'>
              {hackathon.title}
            </h3>
            <div className="flex gap-1 flex-wrap">
              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
                {hackathon.difficulty}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full whitespace-nowrap">
                {hackathon.category}
              </span>
            </div>
          </div>

          <p className='text-gray-400 text-sm sm:text-base mb-3'>{hackathon.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {hackathon.techStack.map((tech, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded">
                {tech}
              </span>
            ))}
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8'>
            <div className='flex items-center text-xs sm:text-sm'>
              <Users size={14} className='text-gray-500' />
              <span className='ml-1 text-gray-400'>{hackathon.participants} participants</span>
            </div>
            <div className='flex items-center text-xs sm:text-sm'>
              <Trophy size={14} className='text-gray-500' />
              <span className='ml-1 text-gray-400'>{hackathon.prize}</span>
            </div>
            <div className='flex items-center text-xs sm:text-sm'>
              <Calendar size={14} className='text-gray-500' />
              <span className='ml-1 text-gray-400'>{hackathon.dates}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar for active hackathons */}
      {!isExpired && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
            style={{ width: `${hackathon.progress}%` }}
          />
        </div>
      )}
    </div>
  )
}



const Home = () => {
  const navigate = useNavigate();

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

  const activeHackathons = [
    {
      title: "Building HackSprint Platform",
      description: "A centralized platform for hackathons, dev quests and events",
      participants: 500,
      prize: "$10,000",
      dates: "10/06/2025 - 20/06/2025",
      difficulty: "Advanced",
      category: "Web Dev",
      techStack: ["React", "Node.js", "MongoDB", "Socket.io"],
      progress: 65
    },
    {
      title: "AI Code Assistant Challenge",
      description: "Build an intelligent coding assistant using machine learning",
      participants: 342,
      prize: "$7,500",
      dates: "15/06/2025 - 25/06/2025",
      difficulty: "Expert",
      category: "AI/ML",
      techStack: ["Python", "TensorFlow", "OpenAI", "FastAPI"],
      progress: 40
    }
  ]

  const expiredHackathons = [
    {
      title: "Blockchain Voting System",
      description: "Create a secure, transparent voting platform using blockchain",
      participants: 278,
      prize: "$5,000",
      dates: "01/05/2025 - 10/05/2025",
      difficulty: "Advanced",
      category: "Blockchain",
      techStack: ["Solidity", "Web3.js", "React", "IPFS"]
    },
    {
      title: "Green Tech Solutions",
      description: "Develop sustainable technology solutions for environmental challenges",
      participants: 156,
      prize: "$3,000",
      dates: "20/04/2025 - 30/04/2025",
      difficulty: "Intermediate",
      category: "IoT",
      techStack: ["Arduino", "Python", "React", "PostgreSQL"]
    }
  ]



  return (
    <div className='bg-gray-900 relative overflow-hidden min-h-screen -mt-16'>
      <Loader />
      <GridBackground />
      <FloatingParticles />

      <div className="h-screen flex flex-col items-center justify-center overflow-hidden relative px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 z-20 relative">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[120px] ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 tracking-widest z-10 text-center relative">
            HackSprint
            <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-green-800 blur-3xl opacity-20 -z-10" />
          </h1>

          <TypingText
            text="Where Code Meets Innovation"
            className="text-xl sm:text-2xl text-gray-400 mt-4 font-mono"
          />
        </div>

        {/* Enhanced Quote Boxes - Fixed positioning to avoid overlap */}
        <div className="hidden xl:block absolute inset-0 z-10">
          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-4 py-3 max-w-xs opacity-70 hover:opacity-100 hover:border-green-400 transition-all duration-300 cursor-default shadow-lg"
            style={{ top: '15%', left: '3%' }}
          >
            <Code size={16} className="text-green-400 mb-2 mx-auto" />
            There's nothing like the bonding experience of fixing a deployment bug five minutes before the deadline.
          </div>

          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-4 py-3 max-w-xs opacity-70 hover:opacity-100 hover:border-green-400 transition-all duration-300 cursor-default shadow-lg"
            style={{ top: '15%', right: '3%' }}
          >
            <Zap size={16} className="text-green-400 mb-2 mx-auto" />
            Trust in peer-to-peer systems is tricky. In hackathons, we trust someone will push to main at 3AM.
          </div>

          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-4 py-3 max-w-xs opacity-70 hover:opacity-100 hover:border-green-400 transition-all duration-300 cursor-default shadow-lg"
            style={{ bottom: '15%', left: '3%' }}
          >
            <Star size={16} className="text-green-400 mb-2 mx-auto" />
            Every sprint starts with hope and ends with console.logs. Somewhere in between, there's magic.
          </div>

          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-4 py-3 max-w-xs opacity-70 hover:opacity-100 hover:border-green-400 transition-all duration-300 cursor-default shadow-lg"
            style={{ bottom: '15%', right: '3%' }}
          >
            <Github size={16} className="text-green-400 mb-2 mx-auto" />
            Developers spend 50% of their time reading code—we compress that into 5 minutes of panic.
          </div>
        </div>

        {/* Large screens but smaller than XL - fewer quote boxes */}
        <div className="hidden lg:block xl:hidden absolute inset-0 z-10">
          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-3 py-2 max-w-xs opacity-60 hover:opacity-100 hover:border-green-400 transition-all duration-300 cursor-default shadow-lg text-sm"
            style={{ top: '20%', left: '2%' }}
          >
            <Code size={14} className="text-green-400 mb-1 mx-auto" />
            Fixing bugs five minutes before deadline builds character.
          </div>

          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-3 py-2 max-w-xs opacity-60 hover:opacity-100 hover:border-green-400 transition-all duration-300 cursor-default shadow-lg text-sm"
            style={{ top: '20%', right: '2%' }}
          >
            <Star size={14} className="text-green-400 mb-1 mx-auto" />
            Every sprint starts with hope and ends with console.logs.
          </div>
        </div>

        {/* Mobile Quote Boxes - Only show on medium and smaller screens */}


        <div className="lg:hidden absolute inset-0 w-full h-full z-10">
          <div
            className="absolute left-1/2 transform -translate-x-1/2 border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-2 py-2 text-xs opacity-50 hover:opacity-70 transition-all duration-300 cursor-default max-w-[140px]"
            style={{ top: '8%' }}
          >
            <Code size={12} className="text-green-400 mb-1 mx-auto" />
            Fixing bugs builds character.
          </div>

          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-2 py-2 text-xs opacity-50 hover:opacity-70 transition-all duration-300 cursor-default max-w-[130px]"
            style={{ bottom: '20%', left: '2%' }}
          >
            <Github size={12} className="text-green-400 mb-1 mx-auto" />
            Git conflicts, half understanding.
          </div>

          <div
            className="absolute border border-green-400/30 bg-gray-900/90 backdrop-blur-sm rounded-lg text-white text-center px-2 py-2 text-xs opacity-50 hover:opacity-70 transition-all duration-300 cursor-default max-w-[120px]"
            style={{ bottom: '20%', right: '2%' }}
          >
            <Star size={12} className="text-green-400 mb-1 mx-auto" />
            5 minutes of panic coding.
          </div>
        </div>
      </div>

      {/* Enhanced Active Hackathons Section */}
      <div className='flex items-center justify-center px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col w-full max-w-7xl'>
          <div className="flex items-center justify-between mb-8">
            <h2 className='text-2xl sm:text-3xl lg:text-5xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-800 flex items-center gap-3'>
              <span className="relative">
                <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-lg inline-block"></span>
                <span className="absolute inset-0 h-3 w-3 rounded-full bg-green-400 animate-ping"></span>
              </span>
              Active Hackathons
            </h2>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                <span className="text-green-400 font-mono">{activeHackathons.length}</span> active
              </div>
              <button className="text-green-400 hover:text-green-300 transition-colors">
                <ExternalLink size={20} />
              </button>
            </div>
          </div>

          <div className='space-y-4 sm:space-y-6'>
            {activeHackathons.map((hackathon, index) => (
              <HackathonCard 
              key={index} hackathon={hackathon} 
              onClick={()=>{
                console.log("Card clicked");
                navigate('/activehackathondetails', { state: hackathon })}
              }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Expired Hackathons Section */}
      <div className='flex items-center justify-center mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col w-full max-w-7xl'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
            <h2 className='text-2xl sm:text-3xl lg:text-5xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-500 flex items-center gap-3'>
              <span className="h-3 w-3 rounded-full bg-red-400 opacity-50"></span>
              Expired Hackathons
            </h2>
            <button className="text-gray-400 cursor-pointer hover:text-gray-300 flex items-center gap-2 transition-colors text-sm sm:text-base group">
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className='space-y-4 sm:space-y-6 mb-20 sm:mb-32 lg:mb-40'>
            {expiredHackathons.map((hackathon, index) => (
              <HackathonCard key={index} hackathon={hackathon} isExpired={true} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Statistics */}
      <div className="border-t border-green-500/20 bg-gray-900/80 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">1,250+</div>
              <div className="text-gray-400">Total Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">47</div>
              <div className="text-gray-400">Hackathons Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">$125K</div>
              <div className="text-gray-400">Total Prize Money</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home