import { useState, useEffect } from 'react'
import { 
  Pill, 
  User, 
  Calendar, 
  FileText, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

// No demo data - using real API data only

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    filterPrescriptions()
  }, [prescriptions, searchTerm, statusFilter])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      
      // Fetch real prescriptions from API only
      const response = await doctorAPI.getPrescriptions()
      if (response.data && response.data.prescriptions) {
        setPrescriptions(response.data.prescriptions)
      } else {
        // No fallback - show empty state
        setPrescriptions([])
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error)
      // No fallback - show empty state
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  const filterPrescriptions = () => {
    let filtered = prescriptions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription => 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter)
    }

    setFilteredPrescriptions(filtered)
  }

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setShowPrescriptionDetails(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage patient prescriptions and medications</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Prescription
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{prescriptions.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {prescriptions.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {prescriptions.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {prescriptions.filter(p => p.status === 'expired').length}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by patient name, email, prescription ID, or diagnosis..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <Pill className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {prescription.patientName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {prescription.patientEmail} • {prescription.prescriptionId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Prescription Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(prescription.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Diagnosis</p>
                      <p className="font-medium text-gray-900 dark:text-white">{prescription.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Medications</p>
                      <p className="font-medium text-gray-900 dark:text-white">{prescription.medications.length} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Refills</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {prescription.refillsRemaining}/{prescription.totalRefills}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Medications</p>
                    <div className="space-y-2">
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{medication.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {medication.dosage} • {medication.frequency} • {medication.duration}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {medication.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-white">{prescription.notes}</p>
                    </div>
                  )}

                  {prescription.followUpDate && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Follow-up Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(prescription.followUpDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewPrescription(prescription)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  
                  {prescription.status === 'active' && (
                    <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors border border-green-200 dark:border-green-700">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {showPrescriptionDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Prescription Details - {selectedPrescription.prescriptionId}
                </h2>
                <button
                  onClick={() => setShowPrescriptionDetails(false)}
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Patient Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPrescription.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPrescription.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPrescription.patientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPrescription.patientId}</p>
                    </div>
                  </div>
                </div>

                {/* Prescription Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prescription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Prescription ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPrescription.prescriptionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedPrescription.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Diagnosis</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPrescription.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPrescription.status)}`}>
                        {selectedPrescription.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medications</h3>
                  <div className="space-y-4">
                    {selectedPrescription.medications.map((medication, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{medication.name}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {medication.quantity}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Dosage</p>
                            <p className="font-medium text-gray-900 dark:text-white">{medication.dosage}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Frequency</p>
                            <p className="font-medium text-gray-900 dark:text-white">{medication.frequency}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-medium text-gray-900 dark:text-white">{medication.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Instructions</p>
                            <p className="font-medium text-gray-900 dark:text-white">{medication.instructions}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes and Follow-up */}
                <div className="space-y-4">
                  {selectedPrescription.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                      <p className="text-gray-900 dark:text-white">{selectedPrescription.notes}</p>
                    </div>
                  )}

                  {selectedPrescription.followUpDate && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Follow-up Date</h3>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedPrescription.followUpDate).toLocaleDateString()}
                      </p>
                    </div>
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
