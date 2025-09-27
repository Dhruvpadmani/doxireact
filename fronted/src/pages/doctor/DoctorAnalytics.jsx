import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Star,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  FileText,
  Pill,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function DoctorAnalytics() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')
  const { user } = useAuth()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch real analytics data from API only
      const response = await doctorAPI.getDashboard()
      if (response.data && response.data.analytics) {
        setAnalytics(response.data.analytics)
      } else {
        // No fallback - show empty state
        setAnalytics(null)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // No fallback - show empty state
      setAnalytics(null)
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

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your performance and patient insights</p>
        </div>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No analytics data available</h3>
          <p className="text-gray-500 dark:text-gray-400">Analytics will appear here once you have patient data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your performance and patient insights</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.overview.totalPatients}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.overview.totalAppointments}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analytics?.overview.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.overview.averageRating}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.appointments.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.appointments.scheduled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.appointments.cancelled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">No Show</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.appointments.noShow}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Demographics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">New Patients</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.patients.newPatients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Returning Patients</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.patients.returningPatients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Patients</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.patients.activePatients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Inactive Patients</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics?.patients.inactivePatients}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Completion Rate</h3>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.performance.appointmentCompletionRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Appointments completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Retention Rate</h3>
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.performance.patientRetentionRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Patient retention</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Avg Duration</h3>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.performance.averageAppointmentDuration} min</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Per appointment</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Follow-up Rate</h3>
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.performance.followUpRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Follow-up appointments</p>
        </div>
      </div>

      {/* Reviews Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.reviews.fiveStar}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">5 Stars</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.reviews.fourStar}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">4 Stars</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.reviews.threeStar}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">3 Stars</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.reviews.twoStar}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">2 Stars</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.reviews.oneStar}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">1 Star</div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Appointment Distribution</h3>
        <div className="grid grid-cols-7 gap-4">
          {analytics?.trends.weeklyAppointments.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{day.day}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{day.appointments}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
