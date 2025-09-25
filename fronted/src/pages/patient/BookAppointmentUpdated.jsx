import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  ArrowLeft,
  CheckCircle,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function BookAppointment() {
  const [activeTab, setActiveTab] = useState('book') // 'book', 'today', 'upcoming', 'last'
  const [loading, setLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'in_person',
    reason: ''
  })
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

  // Mock appointment data
  const [appointments, setAppointments] = useState([
    {
      id: '1',
      doctor: 'Dr. John Smith',
      specialization: 'Cardiologist',
      date: '2024-01-25',
      time: '10:00 AM',
      type: 'in_person',
      status: 'confirmed',
      reason: 'Regular checkup'
    },
    {
      id: '2',
      doctor: 'Dr. Sarah Johnson',
      specialization: 'Dermatologist',
      date: '2024-01-26',
      time: '2:30 PM',
      type: 'video',
      status: 'pending',
      reason: 'Skin consultation'
    }
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Mock appointment booking
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
      
      // Add new appointment to list
      const newAppointment = {
        id: Date.now().toString(),
        doctor: 'Dr. Selected Doctor',
        specialization: 'General',
        date: appointmentData.date,
        time: appointmentData.time,
        type: appointmentData.type,
        status: 'pending',
        reason: appointmentData.reason
      }
      setAppointments(prev => [newAppointment, ...prev])
      
      // Reset form
      setAppointmentData({
        doctorId: '',
        date: '',
        time: '',
        type: 'in_person',
        reason: ''
      })
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === today)
  }

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date > today)
  }

  const getLastAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date < today)
  }

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'today':
        return getTodayAppointments()
      case 'upcoming':
        return getUpcomingAppointments()
      case 'last':
        return getLastAppointments()
      default:
        return []
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'in_person':
        return <User className="w-4 h-4" />
      case 'video':
        return <Stethoscope className="w-4 h-4" />
      case 'phone':
        return <Clock className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  if (loading && appointments.length === 0) {
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
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/patient"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Schedule and manage your appointments</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'book'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'today'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Today's Appointments ({getTodayAppointments().length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming Appointments ({getUpcomingAppointments().length})
          </button>
          <button
            onClick={() => setActiveTab('last')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'last'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Last Appointments ({getLastAppointments().length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'book' && (
            <div>
              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-green-800 dark:text-green-200">Appointment booked successfully!</p>
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Book New Appointment</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Fill out the form below to schedule your appointment</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Doctor
                      </label>
                      <select
                        value={appointmentData.doctorId}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, doctorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Choose a doctor...</option>
                        <option value="dr1">Dr. John Smith - Cardiologist</option>
                        <option value="dr2">Dr. Sarah Johnson - Dermatologist</option>
                        <option value="dr3">Dr. Michael Brown - Neurologist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Appointment Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={appointmentData.date}
                          onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Time
                      </label>
                      <div className="relative">
                        <select
                          value={appointmentData.time}
                          onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="">--:--</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                        </select>
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Consultation Type
                      </label>
                      <select
                        value={appointmentData.type}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="in_person">In-Person</option>
                        <option value="video">Video Call</option>
                        <option value="phone">Phone Call</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                      value={appointmentData.reason}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of your visit"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Check Availability
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Appointment Lists */}
          {(activeTab === 'today' || activeTab === 'upcoming' || activeTab === 'last') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeTab === 'today' && "Today's Appointments"}
                  {activeTab === 'upcoming' && "Upcoming Appointments"}
                  {activeTab === 'last' && "Last Appointments"}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Filter className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {getFilteredAppointments().length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {activeTab === 'today' && "You have no appointments scheduled for today."}
                      {activeTab === 'upcoming' && "You have no upcoming appointments."}
                      {activeTab === 'last' && "You have no past appointments."}
                    </p>
                  </div>
                ) : (
                  getFilteredAppointments().map((appointment) => (
                    <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              {getTypeIcon(appointment.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {appointment.doctor}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                              {appointment.specialization}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(appointment.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {appointment.time}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {appointment.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {appointment.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
