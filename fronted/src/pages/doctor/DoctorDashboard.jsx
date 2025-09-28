import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {AlertTriangle, Bot, Calendar, Clock, Star, Stethoscope} from 'lucide-react'
import {useAuth} from '../../contexts/AuthContext'
import {doctorAPI} from '../../services/api'
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's Appointments</p>
                    <p className="text-2xl font-bold text-primary-600">{stats.todayAppointments || 0}</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Appointments</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalAppointments || 0}</p>
                </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                      <Stethoscope className="h-6 w-6 text-green-600"/>
                </div>
              </div>
            </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Appointments</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments || 0}</p>
                </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600"/>
                </div>
              </div>
            </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                    <p className="text-2xl font-bold text-red-600">{stats.averageRating?.toFixed(1) || '0.0'}</p>
                </div>
                  <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                      <Star className="h-6 w-6 text-red-600"/>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                className="inline-block w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center transition-colors"
              >
                View Schedule
              </Link>
            </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Medical guidance & support</p>
                </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                      <Bot className="h-6 w-6 text-green-600"/>
                </div>
              </div>
              <button
                  className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => alert('AI Assistant feature coming soon!')}
              >
                Get Help
              </button>
            </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Urgent patient requests</p>
                </div>
                  <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600"/>
                </div>
              </div>
              <button
                  className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => alert('Emergency alerts feature coming soon!')}
              >
                View Alerts
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                        <span
                            className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        {appointment.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent appointments</p>
                )}
              </div>
            </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                        <span
                            className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200">
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