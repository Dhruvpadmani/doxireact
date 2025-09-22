import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Video, 
  Monitor,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  FileText,
  Star,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CalendarDays,
  Stethoscope,
  Heart,
  Activity,
  X,
  ArrowLeft
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

// Demo appointments data
const demoAppointments = [
  {
    id: 'APT000001',
    patientName: 'Priya Sharma',
    patientEmail: 'priya.sharma@email.com',
    patientPhone: '+91 98765 43210',
    appointmentDate: '2024-01-15',
    appointmentTime: '10:00',
    type: 'in_person',
    reason: 'Regular checkup and blood pressure monitoring',
    symptoms: ['Headache', 'Dizziness', 'Fatigue'],
    duration: 30,
    notes: 'Patient has been experiencing frequent headaches for the past week',
    status: 'scheduled',
    payment: {
      amount: 1500,
      status: 'pending'
    },
    createdAt: '2024-01-10T09:30:00Z',
    doctorNotes: '',
    followUpRequired: false,
    followUpDate: null
  },
  {
    id: 'APT000002',
    patientName: 'Rajesh Kumar',
    patientEmail: 'rajesh.kumar@email.com',
    patientPhone: '+91 87654 32109',
    appointmentDate: '2024-01-15',
    appointmentTime: '11:30',
    type: 'video',
    reason: 'Follow-up consultation for diabetes management',
    symptoms: ['High blood sugar', 'Increased thirst'],
    duration: 45,
    notes: 'Patient needs to discuss medication adjustments',
    status: 'confirmed',
    payment: {
      amount: 1200,
      status: 'paid'
    },
    createdAt: '2024-01-12T14:20:00Z',
    doctorNotes: 'Patient responding well to current medication',
    followUpRequired: true,
    followUpDate: '2024-02-15'
  },
  {
    id: 'APT000003',
    patientName: 'Anita Patel',
    patientEmail: 'anita.patel@email.com',
    patientPhone: '+91 76543 21098',
    appointmentDate: '2024-01-16',
    appointmentTime: '09:00',
    type: 'phone',
    reason: 'Emergency consultation for chest pain',
    symptoms: ['Chest pain', 'Shortness of breath', 'Nausea'],
    duration: 20,
    notes: 'Patient called for urgent consultation',
    status: 'pending',
    payment: {
      amount: 1000,
      status: 'pending'
    },
    createdAt: '2024-01-14T08:15:00Z',
    doctorNotes: '',
    followUpRequired: false,
    followUpDate: null
  },
  {
    id: 'APT000004',
    patientName: 'Vikram Singh',
    patientEmail: 'vikram.singh@email.com',
    patientPhone: '+91 65432 10987',
    appointmentDate: '2024-01-16',
    appointmentTime: '14:00',
    type: 'in_person',
    reason: 'Annual health checkup',
    symptoms: [],
    duration: 60,
    notes: 'Comprehensive health assessment required',
    status: 'scheduled',
    payment: {
      amount: 1500,
      status: 'paid'
    },
    createdAt: '2024-01-13T16:45:00Z',
    doctorNotes: '',
    followUpRequired: false,
    followUpDate: null
  },
  {
    id: 'APT000005',
    patientName: 'Sunita Gupta',
    patientEmail: 'sunita.gupta@email.com',
    patientPhone: '+91 54321 09876',
    appointmentDate: '2024-01-17',
    appointmentTime: '16:30',
    type: 'video',
    reason: 'Mental health consultation',
    symptoms: ['Anxiety', 'Sleep issues', 'Mood swings'],
    duration: 60,
    notes: 'Patient seeking help for anxiety and depression',
    status: 'cancelled',
    payment: {
      amount: 1800,
      status: 'refunded'
    },
    createdAt: '2024-01-11T11:20:00Z',
    doctorNotes: 'Patient cancelled due to personal reasons',
    followUpRequired: false,
    followUpDate: null
  }
]

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, typeFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Load from localStorage if available, otherwise use demo data
      const savedAppointments = localStorage.getItem('demoAppointments')
      if (savedAppointments) {
        const parsedAppointments = JSON.parse(savedAppointments)
        setAppointments(parsedAppointments)
      } else {
        setAppointments(demoAppointments)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setAppointments(demoAppointments)
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedAppointments = appointments.map(apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            status: action,
            doctorNotes: doctorNotes || apt.doctorNotes,
            updatedAt: new Date().toISOString()
          }
        }
        return apt
      })
      
      setAppointments(updatedAppointments)
      
      // Update localStorage
      localStorage.setItem('demoAppointments', JSON.stringify(updatedAppointments))
      
      // Close details modal
      setShowDetails(false)
      setSelectedAppointment(null)
      setDoctorNotes('')
      
      alert(`Appointment ${action} successfully!`)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">DOXI Doctor</span>
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
            <a href="/doctor-appointments" className="nav-item">
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <a href="#" className="nav-item active">
              <Calendar className="h-5 w-5" />
              Appointments
            </a>
            <a href="#" className="nav-item">
              <User className="h-5 w-5" />
              Patients
            </a>
            <a href="#" className="nav-item">
              <FileText className="h-5 w-5" />
              Prescriptions
            </a>
            <a href="#" className="nav-item">
              <MessageCircle className="h-5 w-5" />
              Chat
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
              >
                <X className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Doctor Appointments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/doctor-appointments" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </a>
              <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Home
              </a>
              <a href="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Login
              </a>
              <a href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Register
              </a>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => window.location.href = '/'}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            </div>
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
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2">
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
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </button>
                      )}

                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
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
        </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Doctor Notes</h3>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
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
    </div>
  )
}
