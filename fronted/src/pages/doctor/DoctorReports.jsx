import { useState, useEffect } from 'react'
import { 
  FileText, 
  User, 
  Calendar, 
  Download,
  Eye,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  FileImage,
  FileCheck,
  FileX,
  Upload,
  X,
  Save
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI, reportsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

// No demo data - using real API data only

export default function DoctorReports() {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportDetails, setShowReportDetails] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [patients, setPatients] = useState([])
  const [uploadForm, setUploadForm] = useState({
    patientId: '',
    type: '',
    title: '',
    description: '',
    testDate: '',
    reportDate: '',
    files: [],
    recommendations: '',
    followUpRequired: false,
    followUpDate: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchReports()
    fetchPatients()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, statusFilter, typeFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      // Fetch real medical reports from API only
      const response = await reportsAPI.getReports()
      if (response.data && response.data.reports) {
        setReports(response.data.reports)
      } else {
        // No fallback - show empty state
        setReports([])
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      // No fallback - show empty state
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await doctorAPI.getPatients()
      if (response.data && response.data.patients) {
        setPatients(response.data.patients)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      setPatients([])
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.patientId || !uploadForm.type || !uploadForm.title || !uploadForm.testDate || !uploadForm.reportDate) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const reportData = {
        patientId: uploadForm.patientId,
        type: uploadForm.type,
        title: uploadForm.title,
        description: uploadForm.description,
        testDate: uploadForm.testDate,
        reportDate: uploadForm.reportDate,
        files: uploadForm.files.map(file => ({
          name: file.name,
          type: file.type || 'pdf',
          size: file.size || 0
        })),
        recommendations: uploadForm.recommendations,
        followUpRequired: uploadForm.followUpRequired,
        followUpDate: uploadForm.followUpDate || undefined
      }

      await reportsAPI.create(reportData)
      
      setShowUploadModal(false)
      setUploadForm({
        patientId: '',
        type: '',
        title: '',
        description: '',
        testDate: '',
        reportDate: '',
        files: [],
        recommendations: '',
        followUpRequired: false,
        followUpDate: ''
      })
      
      // Refresh reports
      fetchReports()
      alert('Report uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = reports

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter)
    }

    setFilteredReports(filtered)
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setShowReportDetails(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'blood_test': return <FileText className="h-4 w-4" />
      case 'imaging': return <FileImage className="h-4 w-4" />
      case 'pathology': return <FileCheck className="h-4 w-4" />
      case 'radiology': return <FileImage className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'blood_test': return 'Blood Test'
      case 'imaging': return 'Imaging'
      case 'pathology': return 'Pathology'
      case 'radiology': return 'Radiology'
      default: return type.replace('_', ' ').toUpperCase()
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage patient medical reports</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'completed').length}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Follow-up Required</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.followUpRequired).length}
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
                placeholder="Search by patient name, email, report ID, or title..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="blood_test">Blood Test</option>
              <option value="imaging">Imaging</option>
              <option value="pathology">Pathology</option>
              <option value="radiology">Radiology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.patientName} • {report.reportId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        {getTypeIcon(report.type)}
                        <span>{getTypeLabel(report.type)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Test Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(report.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(report.reportDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lab Technician</p>
                      <p className="font-medium text-gray-900 dark:text-white">{report.labTechnician.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reviewed By</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {report.reviewedBy || 'Not reviewed'}
                      </p>
                    </div>
                  </div>

                  {report.results.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Key Results</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {report.results.slice(0, 3).map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-900 dark:text-white">{result.testName}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.status === 'normal' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {result.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.recommendations && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recommendations</p>
                      <p className="text-gray-900 dark:text-white">{report.recommendations}</p>
                    </div>
                  )}

                  {report.followUpRequired && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Follow-up Required</p>
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        {report.followUpDate ? new Date(report.followUpDate).toLocaleDateString() : 'Date TBD'}
                      </p>
                    </div>
                  )}

                  {report.files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {report.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            <FileText className="h-4 w-4" />
                            <span className="text-gray-900 dark:text-white">{file.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  
                  {report.files.length > 0 && (
                    <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors border border-green-200 dark:border-green-700">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Report Details - {selectedReport.title}
                </h2>
                <button
                  onClick={() => setShowReportDetails(false)}
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
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReport.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReport.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReport.patientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReport.patientId}</p>
                    </div>
                  </div>
                </div>

                {/* Report Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReport.reportId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getTypeLabel(selectedReport.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Test Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedReport.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedReport.reportDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lab Technician</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReport.labTechnician.name}</p>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {selectedReport.results.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Results</h3>
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
                          {selectedReport.results.map((result, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 text-gray-900 dark:text-white">{result.testName}</td>
                              <td className="py-2 text-gray-900 dark:text-white font-medium">{result.value}</td>
                              <td className="py-2 text-gray-500 dark:text-gray-400">{result.unit || '-'}</td>
                              <td className="py-2 text-gray-500 dark:text-gray-400">{result.normalRange || '-'}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  result.status === 'normal' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
                  </div>
                )}

                {/* Recommendations and Follow-up */}
                <div className="space-y-4">
                  {selectedReport.recommendations && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h3>
                      <p className="text-gray-900 dark:text-white">{selectedReport.recommendations}</p>
                    </div>
                  )}

                  {selectedReport.followUpRequired && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Follow-up Required</h3>
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        {selectedReport.followUpDate ? new Date(selectedReport.followUpDate).toLocaleDateString() : 'Date TBD'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Files */}
                {selectedReport.files.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attachments</h3>
                    <div className="space-y-2">
                      {selectedReport.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Medical Report</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6">
              <div className="space-y-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Patient *
                  </label>
                  <select
                    value={uploadForm.patientId}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.userId?.profile?.firstName} {patient.userId?.profile?.lastName} - {patient.patientId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type *
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select report type...</option>
                    <option value="lab">Lab Report</option>
                    <option value="imaging">Imaging Report</option>
                    <option value="pathology">Pathology Report</option>
                    <option value="radiology">Radiology Report</option>
                    <option value="blood_test">Blood Test</option>
                    <option value="urine_test">Urine Test</option>
                    <option value="xray">X-Ray</option>
                    <option value="mri">MRI</option>
                    <option value="ct_scan">CT Scan</option>
                    <option value="ultrasound">Ultrasound</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Report Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter report title..."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter report description..."
                  />
                </div>

                {/* Test Date and Report Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Date *
                    </label>
                    <input
                      type="date"
                      value={uploadForm.testDate}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, testDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Date *
                    </label>
                    <input
                      type="date"
                      value={uploadForm.reportDate}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, reportDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Upload Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Files
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-input').click()}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Choose Files
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uploadForm.files.length > 0 ? `${uploadForm.files.length} file(s) selected` : 'No files chosen'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: PDF, JPG, PNG (Max 10MB each)
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, files: Array.from(e.target.files) }))}
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Doctor's Recommendations
                  </label>
                  <textarea
                    value={uploadForm.recommendations}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your recommendations..."
                  />
                </div>

                {/* Follow-up Required */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={uploadForm.followUpRequired}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Follow-up Required
                    </span>
                  </label>
                  {uploadForm.followUpRequired && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={uploadForm.followUpDate}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
