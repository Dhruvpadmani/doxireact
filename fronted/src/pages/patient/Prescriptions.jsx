import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Pill,
  Calendar,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = async () => {
    setLoading(true)
    try {
      // Load prescriptions from localStorage
      const savedPrescriptions = localStorage.getItem('patientPrescriptions')
      if (savedPrescriptions) {
        const prescriptionsData = JSON.parse(savedPrescriptions)
        setPrescriptions(prescriptionsData)
      } else {
        // Demo prescriptions if no data
        const demoPrescriptions = [
          {
            id: '1',
            doctorName: 'Dr. Sarah Johnson',
            doctorSpecialization: 'Dermatology',
            date: '2024-01-15',
            status: 'active',
            medications: [
              {
                name: 'Cetirizine',
                dosage: '10mg',
                frequency: 'Once daily',
                duration: '7 days',
                instructions: 'Take with food'
              },
              {
                name: 'Hydrocortisone Cream',
                dosage: '1%',
                frequency: 'Twice daily',
                duration: '14 days',
                instructions: 'Apply to affected area'
              }
            ],
            notes: 'Continue treatment as prescribed. Follow up in 2 weeks.',
            followUpDate: '2024-01-29'
          },
          {
            id: '2',
            doctorName: 'Dr. John Smith',
            doctorSpecialization: 'Cardiology',
            date: '2024-01-10',
            status: 'completed',
            medications: [
              {
                name: 'Lisinopril',
                dosage: '5mg',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take in the morning'
              }
            ],
            notes: 'Monitor blood pressure regularly. Return if side effects occur.',
            followUpDate: '2024-02-10'
          },
          {
            id: '3',
            doctorName: 'Dr. Priya Sharma',
            doctorSpecialization: 'Pediatrics',
            date: '2024-01-05',
            status: 'expired',
            medications: [
              {
                name: 'Amoxicillin',
                dosage: '250mg',
                frequency: 'Three times daily',
                duration: '10 days',
                instructions: 'Take with plenty of water'
              }
            ],
            notes: 'Complete full course even if symptoms improve.',
            followUpDate: '2024-01-15'
          }
        ]
        setPrescriptions(demoPrescriptions)
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorSpecialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const handleDownloadPrescription = (prescription) => {
    // For demo purposes, show an alert
    alert(`Downloading prescription from ${prescription.doctorName}\n\nIn a real application, this would download a PDF file.`)
  }

  const handleViewPrescription = (prescription) => {
    // For demo purposes, show an alert
    alert(`Viewing prescription from ${prescription.doctorName}\n\nDate: ${formatDate(prescription.date)}\nStatus: ${prescription.status}\n\nIn a real application, this would open a detailed view.`)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading prescriptions...</p>
          </div>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage your medication prescriptions</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by doctor, medication, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No prescriptions found' : 'No prescriptions yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Your prescriptions will appear here after your appointments.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              {/* Prescription Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {prescription.doctorName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                        {prescription.doctorSpecialization}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(prescription.date)}
                        </span>
                        {prescription.followUpDate && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Follow-up: {formatDate(prescription.followUpDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(prescription.status)}
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Pill className="w-5 h-5 mr-2" />
                  Medications ({prescription.medications.length})
                </h4>
                <div className="space-y-4">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {medication.name}
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{medication.dosage}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{medication.frequency}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{medication.duration}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Instructions:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{medication.instructions}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Doctor Notes */}
                {prescription.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Doctor's Notes
                    </h5>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex items-center space-x-3">
                  <button
                    onClick={() => handleViewPrescription(prescription)}
                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownloadPrescription(prescription)}
                    className="flex items-center px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Prescriptions
