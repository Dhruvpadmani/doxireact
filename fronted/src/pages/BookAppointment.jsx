import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  Search,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Video,
  Monitor,
  X,
  Activity,
  MessageCircle,
  Bot,
  Heart
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

// Demo data for doctors
const demoDoctors = [
  {
    _id: '1',
    specialization: 'Cardiologist',
    experience: 15,
    bio: 'Expert in heart diseases and cardiovascular treatments with over 15 years of experience.',
    consultationFee: 1500,
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: { average: 4.8, count: 120 },
    isVerified: true,
    consultationTypes: [
      { type: 'in_person', fee: 1500, duration: 30 },
      { type: 'video', fee: 1200, duration: 30 },
      { type: 'phone', fee: 1000, duration: 20 }
    ],
    availableTypes: ['in_person', 'video', 'phone']
  },
  {
    _id: '2',
    specialization: 'Dermatologist',
    experience: 12,
    bio: 'Specialized in skin, hair, and nail conditions. Expert in cosmetic dermatology.',
    consultationFee: 1200,
    languages: ['English', 'Hindi'],
    rating: { average: 4.6, count: 95 },
    isVerified: true,
    consultationTypes: [
      { type: 'in_person', fee: 1200, duration: 30 },
      { type: 'video', fee: 1000, duration: 25 }
    ],
    availableTypes: ['in_person', 'video']
  },
  {
    _id: '3',
    specialization: 'Pediatrician',
    experience: 18,
    bio: 'Caring for children from birth to adolescence. Expert in child health and development.',
    consultationFee: 1000,
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: { average: 4.9, count: 200 },
    isVerified: true,
    consultationTypes: [
      { type: 'in_person', fee: 1000, duration: 30 },
      { type: 'video', fee: 800, duration: 25 },
      { type: 'phone', fee: 600, duration: 20 }
    ],
    availableTypes: ['in_person', 'video', 'phone']
  },
  {
    _id: '4',
    specialization: 'Orthopedist',
    experience: 20,
    bio: 'Expert in bone, joint, and muscle disorders. Specialized in sports medicine.',
    consultationFee: 1800,
    languages: ['English', 'Hindi'],
    rating: { average: 4.7, count: 150 },
    isVerified: true,
    consultationTypes: [
      { type: 'in_person', fee: 1800, duration: 45 },
      { type: 'video', fee: 1500, duration: 30 }
    ],
    availableTypes: ['in_person', 'video']
  },
  {
    _id: '5',
    specialization: 'Gynecologist',
    experience: 14,
    bio: 'Specialized in women\'s health, pregnancy, and reproductive health issues.',
    consultationFee: 1300,
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: { average: 4.8, count: 180 },
    isVerified: true,
    consultationTypes: [
      { type: 'in_person', fee: 1300, duration: 30 },
      { type: 'video', fee: 1100, duration: 25 }
    ],
    availableTypes: ['in_person', 'video']
  },
  {
    _id: '6',
    specialization: 'Psychiatrist',
    experience: 16,
    bio: 'Expert in mental health, anxiety, depression, and behavioral disorders.',
    consultationFee: 2000,
    languages: ['English', 'Hindi'],
    rating: { average: 4.9, count: 90 },
    isVerified: true,
    consultationTypes: [
      { type: 'in_person', fee: 2000, duration: 60 },
      { type: 'video', fee: 1800, duration: 45 },
      { type: 'phone', fee: 1500, duration: 30 }
    ],
    availableTypes: ['in_person', 'video', 'phone']
  }
]

// Generate available time slots
const generateTimeSlots = (startTime = '09:00', endTime = '17:00') => {
  const slots = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    slots.push({
      time: timeString,
      available: Math.random() > 0.3 // 70% chance of being available
    })
  }
  
  return slots
}

export default function BookAppointment() {
  const [step, setStep] = useState(1) // 1: Select Doctor, 2: Select Date/Time, 3: Appointment Details, 4: Confirmation
  const [doctors, setDoctors] = useState(demoDoctors)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentData, setAppointmentData] = useState({
    type: 'in_person',
    reason: '',
    symptoms: [],
    duration: 30,
    notes: '',
    patientName: '',
    patientEmail: '',
    patientPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Simulate loading doctors
    setLoading(true)
    setTimeout(() => {
      setDoctors(demoDoctors)
      setLoading(false)
    }, 1000)
  }, [])

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const slots = generateTimeSlots()
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
      setError('Failed to load available time slots.')
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setStep(2)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor._id, date)
    }
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setStep(3)
  }

  const handleInputChange = (field, value) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSymptomAdd = (symptom) => {
    if (symptom.trim() && !appointmentData.symptoms.includes(symptom.trim())) {
      setAppointmentData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom.trim()]
      }))
    }
  }

  const handleSymptomRemove = (index) => {
    setAppointmentData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }))
  }

  const handleBookAppointment = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate appointment ID
      const appointmentId = `APT${String(Date.now()).slice(-6)}`
      
      // Store appointment in localStorage for demo purposes
      const appointment = {
        id: appointmentId,
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.specialization,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        type: appointmentData.type,
        reason: appointmentData.reason,
        symptoms: appointmentData.symptoms,
        duration: appointmentData.duration,
        notes: appointmentData.notes,
        patientName: appointmentData.patientName,
        patientEmail: appointmentData.patientEmail,
        patientPhone: appointmentData.patientPhone,
        status: 'scheduled',
        payment: {
          amount: selectedDoctor.consultationFee,
          status: 'pending'
        },
        createdAt: new Date().toISOString()
      }
      
      // Save to localStorage
      const existingAppointments = JSON.parse(localStorage.getItem('demoAppointments') || '[]')
      existingAppointments.push(appointment)
      localStorage.setItem('demoAppointments', JSON.stringify(existingAppointments))
      
      setSuccess(true)
      setStep(4)
    } catch (error) {
      console.error('Failed to book appointment:', error)
      setError('Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter
    return matchesSearch && matchesSpecialization && doctor.isVerified
  })

  const specializations = [...new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))]

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

  if (loading && step === 1) {
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
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">DOXI</span>
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
            <a href="/patient-dashboard" className="nav-item">
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <a href="#" className="nav-item active">
              <Calendar className="h-5 w-5" />
              Book Appointment
            </a>
            <a href="#" className="nav-item">
              <Stethoscope className="h-5 w-5" />
              Find Doctor
            </a>
            <a href="#" className="nav-item">
              <FileText className="h-5 w-5" />
              Services
            </a>
            <a href="#" className="nav-item">
              <MessageCircle className="h-5 w-5" />
              Contact
            </a>
            <a href="#" className="nav-item">
              <Bot className="h-5 w-5" />
              AI Assistant
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Book Appointment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/patient-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
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
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => window.location.href = '/patient-dashboard'}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {[
                { number: 1, label: 'Select Doctor' },
                { number: 2, label: 'Date & Time' },
                { number: 3, label: 'Appointment Details' },
                { number: 4, label: 'Confirmation' }
              ].map((stepInfo) => (
                <div key={stepInfo.number} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepInfo.number 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {stepInfo.number}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step === stepInfo.number 
                      ? 'text-primary-600 font-medium' 
                      : step > stepInfo.number 
                        ? 'text-green-600 font-medium' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stepInfo.label}
                  </span>
                  {stepInfo.number < 4 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      step > stepInfo.number ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search doctors by specialization or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="md:w-64">
                    <select
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Doctors List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Dr. {doctor.specialization}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {doctor.experience} years experience
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                          {doctor.rating?.average || 0}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {doctor.bio || 'No bio available'}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Consultation Fee</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{doctor.consultationFee}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Languages</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {doctor.languages?.join(', ') || 'English'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Available Types</span>
                        <div className="flex space-x-1">
                          {doctor.consultationTypes?.map((type, index) => (
                            <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {getTypeLabel(type.type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                      Select Doctor
                    </button>
                  </div>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No doctors found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && selectedDoctor && (
            <div className="space-y-6">
              {/* Selected Doctor Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dr. {selectedDoctor.specialization}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedDoctor.experience} years experience • ₹{selectedDoctor.consultationFee}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select Date
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Available Time Slots
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableSlots.filter(slot => slot.available).map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`p-3 text-center rounded-lg border transition-colors ${
                            selectedTime === slot.time
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900'
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-sm font-medium">{slot.time}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No available slots for this date</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Appointment Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Appointment Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Doctor</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Dr. {selectedDoctor?.specialization}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointmentData.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₹{selectedDoctor?.consultationTypes?.find(ct => ct.type === appointmentData.type)?.fee || selectedDoctor?.consultationFee}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Patient Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={appointmentData.patientName}
                      onChange={(e) => {
                        if (e.target.value.length <= 100) {
                          handleInputChange('patientName', e.target.value);
                        }
                      }}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      maxLength={100}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">
                        {appointmentData.patientName.length}/100 characters
                      </span>
                      {appointmentData.patientName.length >= 100 && (
                        <span className="text-sm text-red-600">
                          Character limit reached
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={appointmentData.patientEmail}
                      onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    {appointmentData.patientEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(appointmentData.patientEmail) && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={appointmentData.patientPhone}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Allow only digits and limit to 10 characters
                        if (/^\d{0,10}$/.test(inputValue)) {
                          handleInputChange('patientPhone', inputValue);
                        }
                      }}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      maxLength={10}
                    />
                    {appointmentData.patientPhone && appointmentData.patientPhone.length !== 10 && (
                      <p className="mt-1 text-sm text-red-600">Phone number must be exactly 10 digits</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Appointment Details
                </h3>
                
                <div className="space-y-4">
                  {/* Consultation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Consultation Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedDoctor?.availableTypes?.map((type) => {
                        const consultationType = selectedDoctor.consultationTypes?.find(ct => ct.type === type)
                        return (
                          <button
                            key={type}
                            onClick={() => handleInputChange('type', type)}
                            className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                              appointmentData.type === type
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900'
                            }`}
                          >
                            {getTypeIcon(type)}
                            <span className="ml-2">{getTypeLabel(type)}</span>
                            {consultationType && (
                              <span className="ml-1 text-xs opacity-75">
                                (₹{consultationType.fee})
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Visit *
                    </label>
                    <textarea
                      value={appointmentData.reason}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          handleInputChange('reason', e.target.value);
                        }
                      }}
                      placeholder="Please describe the reason for your visit..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">
                        {appointmentData.reason.length}/500 characters
                      </span>
                      {appointmentData.reason.length >= 500 && (
                        <span className="text-sm text-red-600">
                          Character limit reached
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Symptoms (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {appointmentData.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                        >
                          {symptom}
                          <button
                            onClick={() => handleSymptomRemove(index)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Add a symptom..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (e.target.value.trim() && appointmentData.symptoms.length < 20) {
                              handleSymptomAdd(e.target.value);
                              e.target.value = '';
                            }
                          }
                        }}
                        maxLength={50}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value.trim() && appointmentData.symptoms.length < 20) {
                            handleSymptomAdd(input.value);
                            input.value = '';
                          }
                        }}
                        disabled={appointmentData.symptoms.length >= 20}
                        className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                    {appointmentData.symptoms.length >= 20 && (
                      <p className="mt-1 text-sm text-red-600">Maximum of 20 symptoms allowed</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={appointmentData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={appointmentData.notes}
                      onChange={(e) => {
                        if (e.target.value.length <= 1000) {
                          handleInputChange('notes', e.target.value);
                        }
                      }}
                      placeholder="Any additional information you'd like to share..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">
                        {appointmentData.notes.length}/1000 characters
                      </span>
                      {appointmentData.notes.length >= 1000 && (
                        <span className="text-sm text-red-600">
                          Character limit reached
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    disabled={loading || !appointmentData.reason.trim() || !appointmentData.patientName.trim() || !appointmentData.patientEmail.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(appointmentData.patientEmail) || !appointmentData.patientPhone.trim() || appointmentData.patientPhone.length !== 10}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Booking...</span>
                      </>
                    ) : (
                      'Book Appointment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && success && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Appointment Booked Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your appointment has been confirmed. You will receive a confirmation email shortly.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Appointment Details
                  </h3>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Patient:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {appointmentData.patientName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {appointmentData.patientEmail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {appointmentData.patientPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Doctor:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Dr. {selectedDoctor?.specialization}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getTypeLabel(appointmentData.type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {appointmentData.duration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{selectedDoctor?.consultationTypes?.find(ct => ct.type === appointmentData.type)?.fee || selectedDoctor?.consultationFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setStep(1)
                      setSelectedDoctor(null)
                      setSelectedDate('')
                      setSelectedTime('')
                      setAppointmentData({
                        type: 'in_person',
                        reason: '',
                        symptoms: [],
                        duration: 30,
                        notes: '',
                        patientName: '',
                        patientEmail: '',
                        patientPhone: ''
                      })
                      setSuccess(false)
                      setError('')
                    }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Book Another
                  </button>
                  <button
                    onClick={() => window.location.href = '/patient-dashboard'}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
