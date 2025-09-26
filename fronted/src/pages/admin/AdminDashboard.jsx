import { useState, useEffect } from 'react'
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
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../services/api'
// Demo data removed
import LoadingSpinner from '../../components/LoadingSpinner'
import Header from '../../components/Header'

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // No demo data - show empty state
      setDashboardData({
        statistics: {
          total: {
            users: 0,
            doctors: 0,
            appointments: 0
          },
          emergency: {
            pending: 0
          }
        },
        recent: {
          appointments: [],
          users: []
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
            <a href="#" className="nav-item active">
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <a href="#" className="nav-item">
              <Users className="h-5 w-5" />
              Users
            </a>
            <a href="#" className="nav-item">
              <UserCheck className="h-5 w-5" />
              Doctors
            </a>
            <a href="#" className="nav-item">
              <Calendar className="h-5 w-5" />
              Appointments
            </a>
            <a href="#" className="nav-item">
              <FileText className="h-5 w-5" />
              Reports
            </a>
            <a href="#" className="nav-item">
              <Star className="h-5 w-5" />
              Reviews
            </a>
            <a href="#" className="nav-item">
              <AlertTriangle className="h-5 w-5" />
              Emergency
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
          userRole="admin" 
        />

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.profile?.firstName}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Total Users</p>
                  <p className="stat-value text-primary-600">{stats.total?.users || 0}</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Total Doctors</p>
                  <p className="stat-value text-success-600">{stats.total?.doctors || 0}</p>
                </div>
                <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Total Appointments</p>
                  <p className="stat-value text-warning-600">{stats.total?.appointments || 0}</p>
                </div>
                <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Pending Emergencies</p>
                  <p className="stat-value text-error-600">{stats.emergency?.pending || 0}</p>
                </div>
                <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-error-600" />
                </div>
              </div>
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
                          {appointment.patientId?.patientId || 'Unknown Patient'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          with Dr. {appointment.doctorId?.specialization || 'Unknown Doctor'}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {recent.users?.length > 0 ? (
                  recent.users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <span className={`badge ${user.role === 'admin' ? 'badge-default' : user.role === 'doctor' ? 'badge-success' : 'badge-secondary'}`}>
                        {user.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent users</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

