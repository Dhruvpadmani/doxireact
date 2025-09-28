import {useState} from 'react'
import {Link, Outlet, useLocation} from 'react-router-dom'
import {Activity, Calendar, FileText, Heart, Star, Stethoscope, User, X,} from 'lucide-react'
import {useAuth} from '../contexts/AuthContext'
import Header from '../components/Header'

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  
  console.log('PatientLayout rendered, user:', user, 'location:', location.pathname)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">DOXI Patient</span>
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
              to="/patient" 
              className={`nav-item ${location.pathname === '/patient' ? 'active' : ''}`}
            >
              <Activity className="h-5 w-5" />
              Dashboard
            </Link>
            <Link 
              to="/patient/book-appointment" 
              className={`nav-item ${location.pathname === '/patient/book-appointment' ? 'active' : ''}`}
            >
              <Calendar className="h-5 w-5" />
              Book Appointment
            </Link>
            <Link 
              to="/patient/find-doctor" 
              className={`nav-item ${location.pathname === '/patient/find-doctor' ? 'active' : ''}`}
            >
              <Stethoscope className="h-5 w-5" />
              Find Doctor
            </Link>
            <Link 
              to="/patient/medical-reports" 
              className={`nav-item ${location.pathname === '/patient/medical-reports' ? 'active' : ''}`}
            >
              <FileText className="h-5 w-5" />
              Reports
            </Link>
            <Link 
              to="/patient/medical-history" 
              className={`nav-item ${location.pathname === '/patient/medical-history' ? 'active' : ''}`}
            >
              <Heart className="h-5 w-5" />
              Medical History
            </Link>
            <Link 
              to="/patient/reviews" 
              className={`nav-item ${location.pathname === '/patient/reviews' ? 'active' : ''}`}
            >
              <Star className="h-5 w-5" />
              Reviews
            </Link>
              <Link
                  to="/patient/profile"
                  className={`nav-item ${location.pathname === '/patient/profile' ? 'active' : ''}`}
              >
                  <User className="h-5 w-5"/>
                  Profile
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
