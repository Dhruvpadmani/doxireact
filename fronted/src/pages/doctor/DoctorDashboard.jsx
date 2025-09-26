import { useState, useEffect } from 'react'
import { 
  Calendar, 
  FileText, 
  Stethoscope, 
  Star, 
  Clock,
  TrendingUp,
  Activity,
  Menu,
  X,
  Heart,
  MessageCircle,
  Bot,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  UserCheck,
  CalendarDays,
  Pill,
  FileSearch,
  MessageSquare,
  Brain,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
// Demo data removed
import LoadingSpinner from '../../components/LoadingSpinner'
import Header from '../../components/Header'

export default function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await doctorAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // No demo data - show empty state
      setDashboardData({
        statistics: {
          todayAppointments: 0,
          totalAppointments: 0,
          totalPrescriptions: 0,
          averageRating: 0
        },
        recent: {
          appointments: [],
          upcoming: []
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const stats = dashboardData?.statistics || {}
  const recent = dashboardData?.recent || {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
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
            <a href="#" className="nav-item active">
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <a href="/doctor-appointments" className="nav-item">
              <Calendar className="h-5 w-5" />
              Appointments
            </a>
            <a href="#" className="nav-item">
              <Users className="h-5 w-5" />
              Patients
            </a>
            <a href="#" className="nav-item">
              <ClipboardList className="h-5 w-5" />
              Prescriptions
            </a>
            <a href="#" className="nav-item">
              <FileSearch className="h-5 w-5" />
              Reports
            </a>
            <a href="#" className="nav-item">
              <MessageCircle className="h-5 w-5" />
              Chat
            </a>
            <a href="#" className="nav-item">
              <Brain className="h-5 w-5" />
              AI Assistant
            </a>
            <a href="#" className="nav-item">
              <Star className="h-5 w-5" />
              Reviews
            </a>
            <a href="#" className="nav-item">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </a>
            <a href="#" className="nav-item">
              <Settings className="h-5 w-5" />
              Settings
            </a>
          </div>
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          userRole="doctor" 
        />

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, Dr. {user?.profile?.firstName}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Today's Appointments</p>
                  <p className="stat-value text-primary-600">{stats.todayAppointments || 0}</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Total Appointments</p>
                  <p className="stat-value text-success-600">{stats.totalAppointments || 0}</p>
                </div>
                <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
                  <Stethoscope className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Pending Appointments</p>
                  <p className="stat-value text-warning-600">{stats.pendingAppointments || 0}</p>
                </div>
                <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Average Rating</p>
                  <p className="stat-value text-error-600">{stats.averageRating?.toFixed(1) || '0.0'}</p>
                </div>
                <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
                  <Star className="h-6 w-6 text-error-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">View Appointments</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your schedule</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <button 
                className="btn btn-primary w-full mt-4"
                onClick={() => window.location.href = '/doctor-appointments'}
              >
                View Schedule
              </button>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Medical guidance & support</p>
                </div>
                <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
                  <Bot className="h-6 w-6 text-success-600" />
                </div>
              </div>
              <button 
                className="btn btn-success w-full mt-4"
                onClick={() => alert('AI Assistant feature coming soon!')}
              >
                Get Help
              </button>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Urgent patient requests</p>
                </div>
                <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-error-600" />
                </div>
              </div>
              <button 
                className="btn btn-error w-full mt-4"
                onClick={() => alert('Emergency alerts feature coming soon!')}
              >
                View Alerts
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Appointments</h3>
              <div className="space-y-3">
                {recent.appointments?.length > 0 ? (
                  recent.appointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Patient {appointment.patientId?.patientId || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="badge badge-outline">
                        {appointment.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent appointments</p>
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Appointments</h3>
              <div className="space-y-3">
                {recent.upcoming?.length > 0 ? (
                  recent.upcoming.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Patient {appointment.patientId?.patientId || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="badge badge-success">
                        {appointment.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming appointments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}