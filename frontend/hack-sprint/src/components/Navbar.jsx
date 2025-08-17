import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getDashboard } from '../backendApis/api'
import { Menu, X, Home, User, Trophy, BookOpen, Shield, ChevronDown, Zap, Code2, Terminal, LogOut } from 'lucide-react'

// Enhanced authentication service
const authService = {
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        return null;
      }
      
      // Make API call to get user data
      const response = await getDashboard();
      return response.data.userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return token && token !== 'null';
  },

  logout: async () => {
    try {
      // Clear all auth-related data
      const keysToRemove = [
        'token',
        'refreshToken',
        'userNickname',
        'userGithubId',
        'userAvatar',
        'userEmail',
        'userVerified',
        'userSubmissions'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Load user data and authentication status
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setUserLoading(true)
        
        const isAuth = authService.isAuthenticated()
        setIsLoggedIn(isAuth)
        
        if (isAuth) {
          const userData = await authService.getCurrentUser()
          setUserInfo(userData)
          
          // If user data fetch fails but token exists, user might need to re-login
          if (!userData) {
            setIsLoggedIn(false)
            await authService.logout()
          }
        } else {
          setUserInfo(null)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setIsLoggedIn(false)
        setUserInfo(null)
      } finally {
        setUserLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Listen for route changes to update auth status
  useEffect(() => {
    const token = localStorage.getItem("token")
    const wasLoggedIn = isLoggedIn
    const nowLoggedIn = !!token
    
    if (wasLoggedIn !== nowLoggedIn) {
      setIsLoggedIn(nowLoggedIn)
      
      // If user just logged out, clear user info
      if (!nowLoggedIn) {
        setUserInfo(null)
      }
      // If user just logged in, fetch user data
      else if (nowLoggedIn && !userInfo) {
        const fetchUserData = async () => {
          try {
            const userData = await authService.getCurrentUser()
            setUserInfo(userData)
          } catch (error) {
            console.error('Error fetching user data after login:', error)
          }
        }
        fetchUserData()
      }
    }
  }, [location, isLoggedIn, userInfo])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
        setShowUserMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const navItems = [
    { name: 'Home', pageLink: '/', icon: Home },
    { name: 'About', pageLink: '/about', icon: BookOpen },
    { name: 'Quest', pageLink: '/quest', icon: Terminal },
    // { name: 'Leaderboard', pageLink: '/leaderboard', icon: Trophy },
    { 
      name: isLoggedIn ? 'Dashboard' : 'Account', 
      pageLink: isLoggedIn ? '/dashboard' : '/account/login', 
      icon: User 
    }
  ]

  const handleNavigate = (link) => {
    navigate(link)
    setIsOpen(false)
    setShowUserMenu(false)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsLoggedIn(false)
      setUserInfo(null)
      setShowUserMenu(false)
      setIsOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleUserMenuClick = (e) => {
    e.stopPropagation()
    setShowUserMenu(!showUserMenu)
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
                className="flex items-center space-x-2 sm:space-x-3 transition-all duration-300">

                {/* Animated Logo */}
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                    <img src='hackSprint.webp' className="w-full h-full cursor-pointer object-contain" alt="HackSprint Logo" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                </div>

                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl cursor-pointer lg:text-2xl font-bold text-white font-mono tracking-wide">
                    HackSprint
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = getActiveItem() === item.name

                return (
                  <div key={item.name} className="relative group">
                    <button
                      onClick={() => handleNavigate(item.pageLink)}
                      className={`flex items-center space-x-2 px-2 md:px-3 cursor-pointer lg:px-4 py-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
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

                  {userLoading ? (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  ) : isLoggedIn && userInfo ? (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <span className="text-sm text-gray-400 font-mono hidden lg:inline">
                    {userLoading ? 'Checking...' : isLoggedIn && userInfo ? 'Online' : 'Offline'}
                  </span>

                  {userInfo ? <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> : <div className="" />}
                  {userInfo ? <span className="text-sm text-gray-400 font-mono hidden lg:inline">Online</span> : <span className="text-sm text-gray-400 font-mono hidden lg:inline"></span>}

                </div>

                {/* User Avatar/Profile Button */}
                <div className="relative">
                  <button
                    onClick={handleUserMenuClick}
                    className="w-7 h-7 lg:w-8 lg:h-8 cursor-pointer bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg relative overflow-hidden"
                  >
                    {isLoggedIn && userInfo && userInfo.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt="User Avatar"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <User size={14} className={`text-white lg:w-4 lg:h-4 ${isLoggedIn && userInfo && userInfo.avatar ? 'hidden' : 'block'}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-green-500/30 rounded-lg shadow-xl py-2 z-50">
                      {isLoggedIn && userInfo ? (
                        <>
                          <div className="px-4 py-2 border-b border-green-500/20">
                            <p className="text-sm text-white font-medium">{userInfo.name || 'User'}</p>
                            <p className="text-xs text-gray-400">{userInfo.email || 'user@example.com'}</p>
                          </div>
                          <button
                            onClick={() => handleNavigate('/dashboard')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <User size={14} />
                            <span>Dashboard</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <LogOut size={14} />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleNavigate('/account/login')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <User size={14} />
                            <span>Login</span>
                          </button>
                          <button
                            onClick={() => handleNavigate('/account/register')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <Shield size={14} />
                            <span>Register</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button and Status */}
            <div className="flex md:hidden items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {userLoading ? (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />
                ) : isLoggedIn && userInfo ? (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="text-xs text-gray-400 font-mono hidden xs:inline">
                  {userLoading ? 'Loading' : isLoggedIn && userInfo ? 'Online' : 'Offline'}
                </span>
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
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                      {isLoggedIn && userInfo && userInfo.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <User size={14} className={`text-white sm:w-4 sm:h-4 ${isLoggedIn && userInfo && userInfo.avatar ? 'hidden' : 'block'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {isLoggedIn && userInfo ? userInfo.name || 'User' : 'Guest'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isLoggedIn && userInfo ? 'Active Session' : 'Guest Mode'}
                      </div>
                    </div>
                  </div>
                  
                  {isLoggedIn && userInfo ? (
                    <button
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  ) : (
                    <Zap size={14} className="text-green-400 sm:w-4 sm:h-4" />
                  )}
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