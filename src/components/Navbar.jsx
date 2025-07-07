import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Home, User, Trophy, BookOpen, Shield, ChevronDown, Zap, Code2, Terminal } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("userToken")
    setIsLoggedIn(!!token)
  }, [location])

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { name: 'Home', pageLink: '/', icon: Home },
    { name: 'About', pageLink: '/about', icon: BookOpen },
    { name: 'Quest', pageLink: '/quest', icon: Terminal },
    { name: 'Leaderboard', pageLink: '/leaderboard', icon: Trophy },
    { name: isLoggedIn ? 'Dashboard' : 'Account', pageLink: isLoggedIn ? '/dashboard' : '/login', icon: User }
  ]

  const handleNavigate = (link) => {
    navigate(link)
    setIsOpen(false)
  }

  // Get current active item based on location
  const getActiveItem = () => {
    const currentItem = navItems.find(item => item.pageLink === location.pathname)
    return currentItem ? currentItem.name : 'Home'
  }

  return (
    <>
      {/* Animated background particles */}
      <div className="fixed top-0 left-0 right-0 h-16 sm:h-20 pointer-events-none z-40 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-green-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-green-500/30' 
          : 'bg-gray-900/80 backdrop-blur-sm border-b border-green-900/50'
      }`}>
        
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative group">
              <button
                onClick={() => handleNavigate('/')}
                className="flex items-center space-x-2 sm:space-x-3 transition-all duration-300 hover:scale-105"
              >
                {/* Animated Logo */}
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                    <img src='hackSprint.webp' className="w-full h-full object-contain" alt="HackSprint Logo" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-wide">
                    HackSprint
                  </span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
              
              {/* Beta Badge */}
              <div className="hidden xs:block sm:block">
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30 font-mono">
                  BETA
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Shows full nav on larger screens */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = getActiveItem() === item.name
                
                return (
                  <div key={item.name} className="relative group">
                    <button
                      onClick={() => handleNavigate(item.pageLink)}
                      className={`flex items-center space-x-2 px-2 md:px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
                        isActive 
                          ? 'bg-green-500/20 text-green-400 shadow-lg' 
                          : 'text-gray-300 hover:text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {/* Scan line effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform -skew-x-12 transition-transform duration-700 ${
                        isActive ? 'translate-x-full' : '-translate-x-full group-hover:translate-x-full'
                      }`} />
                      
                      <Icon size={16} className="relative z-10" />
                      <span className="font-medium relative z-10 text-xs md:text-sm lg:text-base">{item.name}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-green-600" />
                      )}
                    </button>
                  </div>
                )
              })}
              
              {/* Profile/Status Section */}
              <div className="flex items-center space-x-2 lg:space-x-3 ml-2 lg:ml-6 pl-2 lg:pl-6 border-l border-green-500/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400 font-mono hidden lg:inline">Online</span>
                </div>
                
                <button className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg">
                  <User size={14} className="text-white lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button and Status */}
            <div className="flex md:hidden items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-mono hidden xs:inline">Online</span>
              </div>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-green-400 transition-all duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-green-500/10"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-3 sm:py-4 border-t border-green-500/20">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = getActiveItem() === item.name
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.pageLink)}
                      className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-green-500/20 text-green-400 border-l-4 border-green-400' 
                          : 'text-gray-300 hover:text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      <Icon size={18} className="sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>
              
              {/* Mobile Profile Section */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-500/20">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <User size={14} className="text-white sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Developer</div>
                      <div className="text-xs text-gray-400">Active Session</div>
                    </div>
                  </div>
                  <Zap size={14} className="text-green-400 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
      </nav>
      
      {/* Spacer to prevent content overlap */}
      <div className="h-14 sm:h-16" />
    </>
  )
}

export default Navbar