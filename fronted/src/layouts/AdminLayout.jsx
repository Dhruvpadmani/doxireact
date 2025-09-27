import { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Star, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Menu,
  X,
  MessageCircle,
  Settings,
  FileBarChart,
  LogOut,
  Bell,
  Moon,
  Sun,
  User,
  ChevronDown,
  Stethoscope,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '', label: 'Dashboard', icon: Activity },
    { path: 'patients', label: 'Patient Management', icon: Users },
    { path: 'doctors', label: 'Doctor Management', icon: UserCheck },
    { path: 'appointments', label: 'Appointment Management', icon: Calendar },
    { path: 'reports', label: 'Report Management', icon: FileText },
    { path: 'reviews', label: 'Review Management', icon: Star },
    { path: 'calendar', label: 'Calendar', icon: Calendar },
    { path: 'notifications', label: 'Notifications', icon: MessageCircle },
    { path: 'analytics', label: 'Analytics', icon: TrendingUp },
    { path: 'logs', label: 'Admin Logs', icon: FileBarChart },
    { path: 'settings', label: 'Settings', icon: Settings }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(`/admin/${path}`);
  };

  // Sample notifications data
  const notifications = [
    { id: 1, message: 'New appointment request from John Doe', time: '2 min ago', unread: true },
    { id: 2, message: 'Doctor Smith completed patient report', time: '1 hour ago', unread: true },
    { id: 3, message: 'System maintenance scheduled for tonight', time: '3 hours ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">DOXI Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(`/admin/${item.path}`)}
                  className={`nav-item w-full text-left flex items-center gap-3 ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left flex items-center gap-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="h-6 w-6" />
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
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Admin
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.profile?.firstName} {user?.profile?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          alert('Profile settings coming soon!');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          alert('Account settings coming soon!');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Account Settings
                      </button>
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

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}