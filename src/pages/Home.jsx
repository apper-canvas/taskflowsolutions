import { Link } from 'react-router-dom'
import { useState, useEffect, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import { AuthContext } from '../App'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const { logout } = useContext(AuthContext)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setShowProfileDropdown(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-30"></div>
              <div className="relative glass-effect p-3 rounded-2xl">
                <ApperIcon name="CheckSquare" className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 font-medium">
                Simple. Elegant. Productive.
              </p>
            </div>
          </motion.div>

<div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/projects"
                className="glass-effect p-3 rounded-2xl hover:bg-white/30 transition-all duration-300 group flex items-center space-x-2"
              >
                <ApperIcon name="Building" className="w-6 h-6 text-primary group-hover:text-primary-light" />
                <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-primary">
                  Projects
                </span>
              </Link>
            </motion.div>
            <motion.button
              onClick={toggleDarkMode}
              className="glass-effect p-3 rounded-2xl hover:bg-white/30 transition-all duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ApperIcon name="Sun" className="w-6 h-6 text-yellow-500 group-hover:text-yellow-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ApperIcon name="Moon" className="w-6 h-6 text-indigo-600 group-hover:text-indigo-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Profile */}
            {isAuthenticated && user && (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={toggleProfileDropdown}
                  className="glass-effect p-3 rounded-2xl hover:bg-white/30 transition-all duration-300 group flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <ApperIcon name="User" className="w-5 h-5 text-white" />
                  </div>
                  <ApperIcon 
                    name="ChevronDown" 
                    className={`w-4 h-4 text-surface-600 dark:text-surface-400 transition-transform duration-200 ${
                      showProfileDropdown ? 'rotate-180' : ''
                    }`} 
                  />
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 glass-effect rounded-2xl shadow-xl border border-white/20 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                            <ApperIcon name="User" className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 truncate">
                              {user?.firstName && user?.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user?.name || 'User'
                              }
                            </p>
                            <p className="text-xs text-surface-600 dark:text-surface-400 truncate">
                              {user?.emailAddress || user?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-surface-700 dark:text-surface-300 hover:bg-white/10 rounded-xl transition-colors duration-200"
                        >
                          <ApperIcon name="LogOut" className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <MainFeature />
        </div>
      </main>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
    </div>
  )
}

export default Home