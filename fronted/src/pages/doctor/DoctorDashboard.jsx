import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  FileText, 
  Stethoscope, 
  Star, 
  Clock,
  TrendingUp,
  Activity,
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
import LoadingSpinner from '../../components/LoadingSpinner'

export default function DoctorDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await doctorAPI.getDashboard()
      if (response.data) {
        setDashboardData(response.data)
      } else {
        // Fallback to empty state if no data
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
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      
      // Show user-friendly error message
      if (error.response?.status !== 401) { // 401 already handled by interceptor
        import('react-hot-toast').then((toast) => {
          toast.error('Failed to load dashboard data. Please check your connection and try again.');
        });
      }
      
      // Fallback to empty state if API fails
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
    <div className="p-6">
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
              <Link 
                to="/doctor/appointments"
                className="btn btn-primary w-full mt-4 block text-center"
              >
                View Schedule
              </Link>
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
  )
}