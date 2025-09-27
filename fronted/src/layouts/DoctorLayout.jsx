import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  Calendar, 
  Stethoscope, 
  Star, 
  Activity,
  X,
  Users,
  FileSearch,
  BarChart3,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  
  console.log('DoctorLayout rendered, user:', user, 'location:', location.pathname)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">DOXI Doctor</span>
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
            <Link 
              to="/doctor" 
              className={`nav-item ${location.pathname === '/doctor' ? 'active' : ''}`}
            >
              <Activity className="h-5 w-5" />
              Dashboard
            </Link>
            <Link 
              to="/doctor/appointments" 
              className={`nav-item ${location.pathname === '/doctor/appointments' ? 'active' : ''}`}
            >
              <Calendar className="h-5 w-5" />
              Appointments
            </Link>
            <Link 
              to="/doctor/patients" 
              className={`nav-item ${location.pathname === '/doctor/patients' ? 'active' : ''}`}
            >
              <Users className="h-5 w-5" />
              Patients
            </Link>
            <Link 
              to="/doctor/reports" 
              className={`nav-item ${location.pathname === '/doctor/reports' ? 'active' : ''}`}
            >
              <FileSearch className="h-5 w-5" />
              Reports
            </Link>
            <Link 
              to="/doctor/reviews" 
              className={`nav-item ${location.pathname === '/doctor/reviews' ? 'active' : ''}`}
            >
              <Star className="h-5 w-5" />
              Reviews
            </Link>
            <Link 
              to="/doctor/analytics" 
              className={`nav-item ${location.pathname === '/doctor/analytics' ? 'active' : ''}`}
            >
              <BarChart3 className="h-5 w-5" />
              Analytics
            </Link>
            <Link 
              to="/doctor/settings" 
              className={`nav-item ${location.pathname === '/doctor/settings' ? 'active' : ''}`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          user={user}
        />

        {/* Page Content - This is where the routed components will render */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
