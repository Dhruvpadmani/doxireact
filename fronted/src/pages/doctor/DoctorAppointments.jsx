import {useEffect, useState} from 'react'
import {
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  MapPin,
  Monitor,
  Phone,
  Search,
  User,
  Video,
  X,
  XCircle
} from 'lucide-react'
import {useAuth} from '../../contexts/AuthContext'
import {doctorAPI} from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

// No demo data - using real API data only

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [patientReports, setPatientReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, typeFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)

        // Fetch appointments from API
        const response = await doctorAPI.getAppointments()
        if (response.data && response.data.appointments) {
            setAppointments(response.data.appointments)
        } else {
            setAppointments([])
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.type === typeFilter)
    }

    setFilteredAppointments(filtered)
  }

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      setActionLoading(true)

        // Update appointment status via API
        const response = await doctorAPI.updateAppointmentStatus(appointmentId, {
            status: action,
            doctorNotes: doctorNotes || (selectedAppointment ? selectedAppointment.doctorNotes : '')
      })

        if (response.data && response.data.appointment) {
            // Update local state with the updated appointment
            const updatedAppointments = appointments.map(apt => {
                if (apt.id === appointmentId) {
                    return response.data.appointment
                }
                return apt
            })

            setAppointments(updatedAppointments)

            // If there's a selected appointment, update it too
            if (selectedAppointment && selectedAppointment.id === appointmentId) {
                setSelectedAppointment(response.data.appointment)
            }

            console.log('✅ Appointment updated via API:', action)

            // Close details modal
            setShowDetails(false)
            setDoctorNotes('')

            alert(`Appointment ${action} successfully!`)
        } else {
            throw new Error('Invalid response from server')
        }
    } catch (error) {
      console.error('Failed to update appointment:', error)
      alert('Failed to update appointment. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setDoctorNotes(appointment.doctorNotes || '')
    setShowDetails(true)
  }

  const handleViewPatientDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowPatientDetails(true)
  }

  const handleViewReports = async (appointment) => {
    setSelectedAppointment(appointment)
    setShowReports(true)
    setReportsLoading(true)
    
    try {
      // Simulate API call for patient reports
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPatientReports(appointment.reports || [])
    } catch (error) {
      console.error('Failed to fetch patient reports:', error)
      setPatientReports([])
    } finally {
      setReportsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'in_person': return <MapPin className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'in_person': return 'In-Person'
      case 'video': return 'Video Call'
      case 'phone': return 'Phone Call'
      default: return type
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-yellow-600 dark:text-yellow-400'
      case 'refunded': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
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
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
             <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your patient appointments</p>
           </div>


          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by patient name, email, or appointment ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="in_person">In-Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment.patientEmail}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            {getTypeIcon(appointment.type)}
                            <span>{getTypeLabel(appointment.type)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Appointment ID</p>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.duration} min</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                          <p className={`font-medium ${getPaymentStatusColor(appointment.payment.status)}`}>
                            ₹{appointment.payment.amount} ({appointment.payment.status})
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reason for Visit</p>
                        <p className="text-gray-900 dark:text-white">{appointment.reason}</p>
                      </div>

                      {appointment.symptoms.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Symptoms</p>
                          <div className="flex flex-wrap gap-2">
                            {appointment.symptoms.map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Patient Notes</p>
                          <p className="text-gray-900 dark:text-white">{appointment.notes}</p>
                        </div>
                      )}

                      {appointment.doctorNotes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Notes</p>
                          <p className="text-gray-900 dark:text-white">{appointment.doctorNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {/* Three Main Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          See Details
                        </button>
                        
                        <button
                          onClick={() => handleViewPatientDetails(appointment)}
                          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors border border-purple-200 dark:border-purple-700"
                        >
                          <User className="h-4 w-4" />
                          Patient Info
                        </button>
                        
                        <button
                          onClick={() => handleViewReports(appointment)}
                          className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors border border-green-200 dark:border-green-700"
                        >
                          <FileText className="h-4 w-4" />
                          View Reports
                        </button>
                      </div>
                      
                      {/* Status-based Actions */}
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 mt-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </button>
                      )}

                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 mt-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Appointment ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.id}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {getTypeIcon(selectedAppointment.type)}
                        {getTypeLabel(selectedAppointment.type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medical Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reason for Visit</p>
                      <p className="text-gray-900 dark:text-white">{selectedAppointment.reason}</p>
                    </div>
                    
                    {selectedAppointment.symptoms.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Symptoms</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointment.symptoms.map((symptom, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAppointment.notes && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Patient Notes</p>
                        <p className="text-gray-900 dark:text-white">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Notes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor Notes</h3>
                    <span className="text-sm text-gray-500">{doctorNotes.length}/500</span>
                  </div>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setDoctorNotes(e.target.value);
                      }
                    }}
                    placeholder="Add your notes about this appointment..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAppointmentAction(selectedAppointment.id, 'confirmed')}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(selectedAppointment.id, 'cancelled')}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {selectedAppointment.status === 'scheduled' && (
                    <button
                      onClick={() => handleAppointmentAction(selectedAppointment.id, 'confirmed')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirm
                    </button>
                  )}

                  {selectedAppointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleAppointmentAction(selectedAppointment.id, 'completed')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Patient Details - {selectedAppointment.patientName}
                </h2>
                <button
                  onClick={() => setShowPatientDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientAge} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientGender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medical History</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppointment.patientDetails?.medicalHistory?.map((condition, index) => (
                          <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppointment.patientDetails?.allergies?.map((allergy, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Medications</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppointment.patientDetails?.medications?.map((medication, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientDetails?.emergencyContact?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientDetails?.emergencyContact?.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.patientDetails?.emergencyContact?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Reports Modal */}
      {showReports && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Patient Reports - {selectedAppointment.patientName}
                </h2>
                <button
                  onClick={() => setShowReports(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : patientReports.length > 0 ? (
                <div className="space-y-6">
                  {patientReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {report.type.replace('_', ' ').toUpperCase()} • {new Date(report.testDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            report.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {report.status}
                          </span>
                          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {report.results && report.results.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Test Name</th>
                                <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Value</th>
                                <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Unit</th>
                                <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Normal Range</th>
                                <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.results.map((result, index) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                  <td className="py-2 text-gray-900 dark:text-white">{result.testName}</td>
                                  <td className="py-2 text-gray-900 dark:text-white font-medium">{result.value}</td>
                                  <td className="py-2 text-gray-500 dark:text-gray-400">{result.unit || '-'}</td>
                                  <td className="py-2 text-gray-500 dark:text-gray-400">{result.normalRange || '-'}</td>
                                  <td className="py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      result.status === 'normal' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : result.status === 'abnormal'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                      {result.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports available</h3>
                  <p className="text-gray-500 dark:text-gray-400">This patient has no medical reports on file</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
