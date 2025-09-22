import { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Moon, 
  Sun, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  MessageCircle,
  Heart,
  Stethoscope,
  Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Header({ sidebarOpen, setSidebarOpen, userRole = 'patient' }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setProfileDropdownOpen(false)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="h-4 w-4" />
      case 'admin':
        return <Users className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'doctor':
        return 'Doctor'
      case 'admin':
        return 'Admin'
      default:
        return 'Patient'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'bg-green-500'
      case 'admin':
        return 'bg-purple-500'
      default:
        return 'bg-blue-500'
    }
  }

  // Demo notifications data
  const notifications = [
    {
      id: 1,
      title: 'New Appointment Booked',
      message: 'You have a new appointment with Dr. Smith tomorrow at 10:00 AM',
      time: '2 minutes ago',
      unread: true,
      type: 'appointment'
    },
    {
      id: 2,
      title: 'Prescription Ready',
      message: 'Your prescription is ready for pickup',
      time: '1 hour ago',
      unread: true,
      type: 'prescription'
    },
    {
      id: 3,
      title: 'Appointment Reminder',
      message: 'Don\'t forget your appointment with Dr. Johnson today at 3:00 PM',
      time: '3 hours ago',
      unread: false,
      type: 'reminder'
    },
    {
      id: 4,
      title: 'System Update',
      message: 'New features have been added to your dashboard',
      time: '1 day ago',
      unread: false,
      type: 'system'
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            >
              <div className={`w-8 h-8 ${getRoleColor(userRole)} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">
                  {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  {getRoleIcon(userRole)}
                  <span className="ml-1">{getRoleLabel(userRole)}</span>
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${getRoleColor(userRole)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-lg font-medium">
                        {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.profile?.firstName} {user?.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        {getRoleIcon(userRole)}
                        <span className="ml-1">{getRoleLabel(userRole)}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault()
                      setProfileDropdownOpen(false)
                      alert('Profile settings coming soon!')
                    }}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault()
                      setProfileDropdownOpen(false)
                      alert('Account settings coming soon!')
                    }}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault()
                      setProfileDropdownOpen(false)
                      alert('Help & Support coming soon!')
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-3" />
                    Help & Support
                  </a>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

