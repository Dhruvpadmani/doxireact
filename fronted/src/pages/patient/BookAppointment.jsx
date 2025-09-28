import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  Search,
  Stethoscope,
  Trash2,
  User,
  X
} from 'lucide-react'
import {useAuth} from '../../contexts/AuthContext'
import {appointmentsAPI, doctorsAPI} from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function BookAppointment() {
  const [activeTab, setActiveTab] = useState('book') // 'book', 'today', 'upcoming', 'last'
  const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
  const [appointmentData, setAppointmentData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'in_person',
    reason: ''
  })
  const [success, setSuccess] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [editForm, setEditForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'in_person',
    reason: ''
  })
  const { user } = useAuth()

    // Load appointments from API
    const [appointments, setAppointments] = useState([])

    // Load doctors from API
  const [doctors, setDoctors] = useState([])

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors()
      if (activeTab !== 'book') {
          loadAppointments()
    }
  }, [activeTab])

    const loadAppointments = async () => {
        try {
            setLoading(true)
            const response = await appointmentsAPI.getAppointments()
            setAppointments(response.data.appointments || [])
        } catch (error) {
            console.error('Error loading appointments:', error)
            setError('Failed to load appointments. Please try again.')
            // Fallback to empty array if API fails
            setAppointments([])
        } finally {
            setLoading(false)
        }
    }

    const loadDoctors = async () => {
    try {
      console.log('Loading doctors for appointment booking...')
        const response = await doctorsAPI.search()
        setDoctors(response.data.doctors || [])
        console.log('Found doctors for booking:', response.data.doctors)
    } catch (error) {
      console.error('Error loading doctors:', error)
        setError('Failed to load doctors. Please try again.')
      setDoctors([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
      setError(null)
    
    try {
        // Create appointment via API
        const appointmentPayload = {
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        type: appointmentData.type,
        reason: appointmentData.reason,
        symptoms: [],
        notes: '',
        patientDetails: {
          medicalHistory: user.profile?.medicalHistory || [],
          allergies: user.profile?.allergies || [],
          medications: user.profile?.medications || [],
          emergencyContact: user.profile?.emergencyContact || {
            name: 'Not provided',
            relationship: 'Not provided',
            phone: 'Not provided'
          }
        }
        }

        const response = await appointmentsAPI.book(appointmentPayload)
        setSuccess(true)

        // Refresh appointments after successful booking
        await loadAppointments()
      
      // Reset form
      setAppointmentData({
        doctorId: '',
        date: '',
        time: '',
        type: 'in_person',
        reason: ''
      })

        // Show success message for a few seconds
        setTimeout(() => {
            setSuccess(false)
        }, 3000)
    } catch (error) {
      console.error('Booking failed:', error)
        setError(error.response?.data?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => {
      const appointmentDate = apt.appointmentDate || apt.date
      return appointmentDate === today
    })
  }

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => {
      const appointmentDate = apt.appointmentDate || apt.date
      return appointmentDate > today
    })
  }

  const getLastAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => {
      const appointmentDate = apt.appointmentDate || apt.date
      return appointmentDate < today
    })
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

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowViewModal(true)
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditForm({
      doctorId: appointment.doctorId || '',
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      reason: appointment.reason
    })
    setShowEditModal(true)
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
        setLoading(true)
        setError(null)
      try {
          // Cancel appointment via API
          await appointmentsAPI.cancelAppointment(appointmentId, 'Patient requested cancellation')

          // Refresh appointments after successful deletion
          await loadAppointments()

          // Close modals if they were showing this appointment
          if (showViewModal && selectedAppointment?.id === appointmentId) {
              setShowViewModal(false)
          }
          if (showEditModal && selectedAppointment?.id === appointmentId) {
              setShowEditModal(false)
          }
      } catch (error) {
        console.error('Error deleting appointment:', error)
          setError(error.response?.data?.message || 'Failed to delete appointment. Please try again.')
      } finally {
          setLoading(false)
      }
    }
  }

  const handleUpdateAppointment = async (e) => {
    e.preventDefault()
    setLoading(true)
      setError(null)
    
    try {
        // Update appointment via API
        const updatePayload = {
            appointmentDate: editForm.date,
            appointmentTime: editForm.time,
            type: editForm.type,
            reason: editForm.reason
        }

        await appointmentsAPI.updateAppointment(selectedAppointment.id, updatePayload)

        // Refresh appointments after successful update
        await loadAppointments()
      
      setShowEditModal(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Update failed:', error)
        setError(error.response?.data?.message || 'Failed to update appointment. Please try again.')
    } finally {
      setLoading(false)
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
        {/* Error Message */}
        {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2"/>
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            </div>
        )}
      
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
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.profile?.firstName} {doctor.profile?.lastName} - {doctor.specialization}
                          </option>
                        ))}
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
                                {new Date(appointment.appointmentDate || appointment.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {appointment.appointmentTime || appointment.time}
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
                          <button 
                            onClick={() => handleViewAppointment(appointment)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View appointment"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditAppointment(appointment)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Edit appointment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete appointment"
                          >
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

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
                <p className="text-gray-900 dark:text-white">{selectedAppointment.doctor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <p className="text-gray-900 dark:text-white">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <p className="text-gray-900 dark:text-white">{selectedAppointment.time}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p className="text-gray-900 dark:text-white">{selectedAppointment.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                <p className="text-gray-900 dark:text-white">{selectedAppointment.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Appointment</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                <select
                  value={editForm.time}
                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="in_person">In-Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
                <textarea
                  value={editForm.reason}
                  onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
