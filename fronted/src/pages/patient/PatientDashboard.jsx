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
  Bot
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { patientAPI } from '../../services/api'
import { generateDemoPatientData } from '../../utils/demoData'
import LoadingSpinner from '../../components/LoadingSpinner'
import Header from '../../components/Header'

export default function PatientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      // Use demo data when API fails
      setDashboardData(generateDemoPatientData())
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
            <a href="#" className="nav-item active">
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <a href="/book-appointment" className="nav-item">
              <Calendar className="h-5 w-5" />
              Book Appointment
            </a>
            <a href="#" className="nav-item">
              <Stethoscope className="h-5 w-5" />
              Find Doctor
            </a>
            <a href="#" className="nav-item">
              <FileText className="h-5 w-5" />
              Prescriptions
            </a>
            <a href="#" className="nav-item">
              <FileText className="h-5 w-5" />
              Reports
            </a>
            <a href="#" className="nav-item">
              <MessageCircle className="h-5 w-5" />
              Chat
            </a>
            <a href="#" className="nav-item">
              <Bot className="h-5 w-5" />
              AI Assistant
            </a>
            <a href="#" className="nav-item">
              <Star className="h-5 w-5" />
              Reviews
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
          userRole="patient" 
        />

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.profile?.firstName}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Upcoming Appointments</p>
                  <p className="stat-value text-primary-600">{stats.upcomingAppointments || 0}</p>
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
                  <p className="stat-label">Prescriptions</p>
                  <p className="stat-value text-warning-600">{stats.totalPrescriptions || 0}</p>
                </div>
                <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Medical Reports</p>
                  <p className="stat-value text-error-600">{stats.totalReports || 0}</p>
                </div>
                <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-error-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Book Appointment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Schedule with a doctor</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <button 
                className="btn btn-primary w-full mt-4"
                onClick={() => window.location.href = '/book-appointment'}
              >
                Book Now
              </button>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get medical guidance</p>
                </div>
                <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
                  <Bot className="h-6 w-6 text-success-600" />
                </div>
              </div>
              <button 
                className="btn btn-success w-full mt-4"
                onClick={() => alert('AI Assistant feature coming soon!')}
              >
                Chat Now
              </button>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Request urgent help</p>
                </div>
                <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-error-600" />
                </div>
              </div>
              <button 
                className="btn btn-error w-full mt-4"
                onClick={() => {
                  if (confirm('Are you sure you want to request emergency assistance?')) {
                    alert('Emergency request submitted! Medical team will contact you shortly.');
                  }
                }}
              >
                Emergency
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
                          Dr. {appointment.doctorId?.specialization || 'Unknown Doctor'}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Prescriptions</h3>
              <div className="space-y-3">
                {recent.prescriptions?.length > 0 ? (
                  recent.prescriptions.map((prescription, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {prescription.medications?.[0]?.name || 'Prescription'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Dr. {prescription.doctorId?.specialization || 'Unknown Doctor'}
                        </p>
                      </div>
                      <span className="badge badge-success">
                        {prescription.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent prescriptions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
