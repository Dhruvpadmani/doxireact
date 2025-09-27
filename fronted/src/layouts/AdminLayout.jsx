import { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
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
            
            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-600">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}