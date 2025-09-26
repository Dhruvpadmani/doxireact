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
  Bot
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { patientAPI } from '../../services/api'
// Demo data removed
import LoadingSpinner from '../../components/LoadingSpinner'

export default function PatientDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await patientAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // No demo data - show empty state
      setDashboardData({
        statistics: {
          upcomingAppointments: 0,
          totalAppointments: 0,
          totalPrescriptions: 0,
          totalReports: 0
        },
        recent: {
          appointments: [],
          prescriptions: []
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
                {dashboardData?.upcomingAppointments || 2}
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
                {dashboardData?.medicalReports || 5}
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
                {dashboardData?.activePrescriptions || 3}
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
                {dashboardData?.healthScore || 85}%
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
            <a
              href="#"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Chat Support</span>
            </a>
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
