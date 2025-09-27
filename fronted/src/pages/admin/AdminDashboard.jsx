import React, { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Star, 
  AlertTriangle,
  TrendingUp,
  UserPlus,
  CalendarCheck
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminDashboard = () => {
  // Props destructuring (none for this component)
  
  // Default hooks
  const { user } = useAuth()
  
  // Redux states (none for this component)
  
  // Component states
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Functions
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Failed to load dashboard data')
      
      // Fallback to localStorage data when API fails
      const registeredDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || '[]')
      const registeredUsers = JSON.parse(localStorage.getItem('demoAccounts') || '[]')
      const registeredAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]')
      
      setDashboardData({
        statistics: {
          total: {
            users: registeredUsers.length,
            doctors: registeredDoctors.length,
            appointments: registeredAppointments.length
          },
          emergency: {
            pending: 0
          }
        },
        recent: {
          appointments: registeredAppointments.slice(0, 5),
          users: registeredUsers.slice(0, 5)
        }
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffects
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])


  // Loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const stats = dashboardData?.statistics || {}
  const recent = dashboardData?.recent || {}

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          Welcome back, {user?.profile?.firstName || 'Admin'}!
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Users</p>
              <p className="stat-value text-primary-600">{stats.total?.users || 0}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">+12%</span>
              </div>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Doctors</p>
              <p className="stat-value text-success-600">{stats.total?.doctors || 0}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">+8%</span>
              </div>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Appointments</p>
              <p className="stat-value text-warning-600">{stats.total?.appointments || 0}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">+15%</span>
              </div>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Pending Emergencies</p>
              <p className="stat-value text-error-600">{stats.emergency?.pending || 0}</p>
              <div className="flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs text-red-600 dark:text-red-400">Urgent</span>
              </div>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Appointments</h3>
            <CalendarCheck className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recent.appointments?.length > 0 ? (
              recent.appointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {appointment.patientId?.patientId || 'Unknown Patient'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        with Dr. {appointment.doctorId?.specialization || 'Unknown Doctor'}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${
                    appointment.status === 'confirmed' ? 'badge-success' :
                    appointment.status === 'pending' ? 'badge-warning' :
                    appointment.status === 'cancelled' ? 'badge-error' :
                    'badge-secondary'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent appointments</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
            <UserPlus className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recent.users?.length > 0 ? (
              recent.users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-default' : 
                    user.role === 'doctor' ? 'badge-success' : 
                    'badge-secondary'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent users</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Doctor</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Register new doctor</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">View Appointments</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage bookings</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Generate Report</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">View analytics</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Emergency</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Handle urgent cases</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

