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
  Pill
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { patientAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function PatientDashboard() {
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: 0,
    medicalReports: 0,
    activePrescriptions: 0,
    healthScore: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Refresh data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData()
      }
    }

    const handleFocus = () => {
      fetchDashboardData()
    }

    // Also refresh when user navigates back to dashboard
    const handlePopState = () => {
      fetchDashboardData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch data from API
      const [dashboardRes, prescriptionsRes] = await Promise.all([
        patientAPI.getDashboard(),
        patientAPI.getPrescriptions()
      ])

      const dashboardData = dashboardRes.data;
      const prescriptionsData = prescriptionsRes.data.prescriptions || [];

      // Calculate statistics from API data
      const statistics = dashboardData.statistics || {};
      const activePrescriptions = prescriptionsData.filter(pres => 
        !pres.isExpired && pres.status === 'active'
      ).length;

      setDashboardData({
        upcomingAppointments: statistics.upcomingAppointments || 0,
        medicalReports: statistics.totalReports || 0,
        activePrescriptions,
        healthScore: statistics.healthScore || 0 // if available in API, otherwise calculate
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Fallback to a user-friendly error state instead of localStorage
      setDashboardData({
        upcomingAppointments: 0,
        medicalReports: 0,
        activePrescriptions: 0,
        healthScore: 0
      })
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        // Already handled by interceptor
      } else {
        // Show toast notification about network error
        import('react-hot-toast').then((toast) => {
          toast.error('Failed to load dashboard data. Please check your connection and try again.');
        });
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateHealthScore = (appointments, reports, prescriptions) => {
    // Simple health score calculation
    // Base score starts at 100
    let score = 100
    
    // Deduct points for overdue appointments (if any)
    // Add points for recent reports (shows active healthcare)
    if (reports > 0) score += 5
    if (appointments > 0) score += 10 // Having appointments is good
    
    // Deduct points for too many active prescriptions (might indicate health issues)
    if (prescriptions > 5) score -= 10
    else if (prescriptions > 0) score += 5
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.firstName || 'Patient'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.upcomingAppointments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical Reports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.medicalReports}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <Stethoscope className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.activePrescriptions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.healthScore}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/patient/book-appointment"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Book Appointment</span>
            </Link>
            <Link
              to="/patient/find-doctor"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Find Doctor</span>
            </Link>
            <Link
              to="/patient/medical-reports"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Reports</span>
            </Link>
            <Link
              to="/patient/reviews"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Reviews & Ratings</span>
            </Link>
            <Link
              to="/patient/medical-history"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Medical History</span>
            </Link>
            <Link
              to="/patient/prescriptions"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Pill className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">My Prescriptions</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 mr-3">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Appointment scheduled</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow at 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 mr-3">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New report available</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blood test results</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 mr-3">
                <Stethoscope className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Prescription updated</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">New medication added</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Health Trend</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Improving</p>
          </div>
          <div className="text-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Heart Rate</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Normal (72 bpm)</p>
          </div>
          <div className="text-center">
            <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Activity className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Activity Level</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Moderate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
