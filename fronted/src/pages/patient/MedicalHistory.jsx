import React, {useEffect, useState} from 'react'
import {AlertCircle, Calendar, Clock, Download, Eye, FileText, Pill, Stethoscope, User} from 'lucide-react'
import {appointmentsAPI, patientAPI, prescriptionsAPI, reportsAPI} from '../../services/api'

const MedicalHistory = () => {
  const [activeTab, setActiveTab] = useState('appointments')
  const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [reports, setReports] = useState([])
  const [patientInfo, setPatientInfo] = useState({
    name: "Loading...",
    email: "Loading...",
    dateOfBirth: "Loading...",
    gender: "Loading...",
    bloodGroup: "Loading...",
    phone: "Loading...",
    address: "Loading..."
  })

  useEffect(() => {
    loadData()
  }, [])

  // Refresh data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadReports() // Refresh reports when user comes back
      }
    }

    const handleFocus = () => {
      loadReports() // Refresh reports when user comes back
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
      setError(null)
    try {
      // Load all data in parallel
      await Promise.all([
        loadPatientInfo(),
        loadAppointments(),
        loadPrescriptions(),
        loadReports()
      ])
    } catch (error) {
      console.error('Error loading medical history:', error)
        setError(error.response?.data?.message || 'Failed to load medical history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadPatientInfo = async () => {
    try {
        // Load patient info from API
        const response = await patientAPI.getProfile()
        const userData = response.data.user
        setPatientInfo({
            name: `${userData.profile?.firstName || ''} ${userData.profile?.lastName || ''}`.trim() || "User",
            email: userData.email || "user@example.com",
            dateOfBirth: userData.profile?.dateOfBirth || "Not provided",
            gender: userData.profile?.gender || "Not provided",
            bloodGroup: userData.profile?.bloodGroup || "Not provided",
            phone: userData.profile?.phone || "Not provided",
            address: userData.profile?.address || "Not provided"
        })
    } catch (error) {
        console.error('Error loading patient info:', error)
        setPatientInfo({
            name: user?.name || "User",
            email: user?.email || "user@example.com",
            dateOfBirth: "Not provided",
            gender: "Not provided",
            bloodGroup: "Not provided",
            phone: "Not provided",
            address: "Not provided"
        })
    }
  }

  const loadAppointments = async () => {
    try {
        // Load appointments from API
        const response = await appointmentsAPI.getAppointments()
        setAppointments(response.data.appointments || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    }
  }

  const loadPrescriptions = async () => {
    try {
        // Load prescriptions from API
        const response = await prescriptionsAPI.getPrescriptions()
        setPrescriptions(response.data.prescriptions || [])
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      setPrescriptions([])
    }
  }

  const loadReports = async () => {
    try {
        // Load reports from API
        const response = await reportsAPI.getReports()
        // Transform data to match Medical History format
        const transformedReports = (response.data.reports || []).map(report => ({
            id: report.id,
            title: report.title,
            type: report.type,
            date: report.testDate || report.createdAt,
            doctor: report.doctorName || 'System',
            status: report.status,
            description: report.description,
            files: report.files || [] // Include files data
        }))
        setReports(transformedReports)
    } catch (error) {
      console.error('Error loading reports:', error)
      setReports([])
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleViewFile = (file) => {
    // For demo purposes, show an alert
    // In a real app, this would open the file in a viewer
    alert(`Viewing file: ${file.name}\n\nIn a real application, this would open the file in a viewer.`)
  }

  const handleDownloadFile = (file) => {
    // For demo purposes, show an alert
    // In a real app, this would download the actual file
    alert(`Downloading file: ${file.name}\n\nIn a real application, this would download the file to your device.`)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const renderAppointments = () => (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3>
          <p className="text-gray-500 dark:text-gray-400">You haven't had any appointments yet.</p>
        </div>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {appointment.doctorName}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {appointment.specialization}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>{appointment.type}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderPrescriptions = () => (
    <div className="space-y-4">
      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
          <p className="text-gray-500 dark:text-gray-400">You don't have any prescriptions yet.</p>
        </div>
      ) : (
        prescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {prescription.doctorName}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatDate(prescription.date)}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Medications:</h4>
              <div className="space-y-2">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {prescription.notes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes:</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  {prescription.notes}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )

  const renderReports = () => (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
          <p className="text-gray-500 dark:text-gray-400">You don't have any medical reports yet.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {report.type}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(report.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{report.doctor}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {report.description}
                </p>
                
                {/* Files Section */}
                {report.files && report.files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Files:</h4>
                    <div className="space-y-2">
                      {report.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            {file.type === 'pdf' ? (
                              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">PDF</span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">IMG</span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'} • {file.type?.toUpperCase() || 'FILE'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewFile(file)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="View file"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="p-6">
          {/* Error Message */}
          {error && (
              <div
                  className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2"/>
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
              </div>
          )}
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Medical History</h1>
          <p className="text-gray-600 dark:text-gray-400">Complete overview of your medical records and appointments</p>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Patient Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name:</label>
                <p className="text-gray-900 dark:text-white">{patientInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email:</label>
                <p className="text-gray-900 dark:text-white">{patientInfo.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth:</label>
                <p className="text-gray-900 dark:text-white">{patientInfo.dateOfBirth}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender:</label>
                <p className="text-gray-900 dark:text-white">{patientInfo.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group:</label>
                <p className="text-gray-900 dark:text-white">{patientInfo.bloodGroup}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone:</label>
                <p className="text-gray-900 dark:text-white">{patientInfo.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="h-5 w-5" />
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'prescriptions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Pill className="h-5 w-5" />
                Prescriptions ({prescriptions.length})
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <FileText className="h-5 w-5" />
                Reports ({reports.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                {activeTab === 'appointments' && renderAppointments()}
                {activeTab === 'prescriptions' && renderPrescriptions()}
                {activeTab === 'reports' && renderReports()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalHistory
