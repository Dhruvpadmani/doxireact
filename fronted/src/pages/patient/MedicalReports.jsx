import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Eye, 
  Download, 
  FileText, 
  Image, 
  File,
  X,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react'
import { reportsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const MedicalReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getReports()
      if (response.data && response.data.reports) {
        setReports(response.data.reports)
      } else {
        setReports([])
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const handleDownloadReport = async (report) => {
    try {
      const response = await reportsAPI.downloadReport(report._id)
      // In a real application, this would trigger a file download
      console.log('Download initiated for report:', report.title)
      alert('Report download initiated!')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  const handleDownloadFile = (file) => {
    console.log('Download file clicked for:', file.name)
    // In a real application, this would download the actual file
    alert(`File "${file.name}" download would be initiated here`)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type === 'pdf') return <FileText className="w-4 h-4 text-red-500" />
    if (type === 'image') return <Image className="w-4 h-4 text-blue-500" />
    return <File className="w-4 h-4 text-gray-500" />
  }

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="p-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View your medical test reports uploaded by doctors</p>
        </div>

        {/* Empty State */}
        {reports.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No reports found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No medical reports have been uploaded by your doctors yet
            </p>
          </div>
        )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : report.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{report.description}</p>
                
                {/* Doctor Information */}
                {report.doctorId && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Uploaded by: Dr. {report.doctorId.specialization || 'Unknown Doctor'}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Type: {report.type}</span>
                  <span>Test Date: {new Date(report.testDate).toLocaleDateString()}</span>
                  <span>Report Date: {new Date(report.reportDate).toLocaleDateString()}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Files:</span>
                  </div>
                  <div className="space-y-2">
                    {report.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)} • {file.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleViewReport(report)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="View report"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownloadReport(report)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors"
                  title="Download report"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Report Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{selectedReport.title}</h4>
                
                {/* Doctor Information */}
                {selectedReport.doctorId && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Uploaded by: Dr. {selectedReport.doctorId.specialization || 'Unknown Doctor'}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Report ID: {selectedReport.reportId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedReport.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedReport.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Test Date:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(selectedReport.testDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Report Date:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(selectedReport.reportDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {selectedReport.description && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedReport.description}</p>
                  </div>
                )}
                {selectedReport.recommendations && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Doctor's Recommendations:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedReport.recommendations}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Files</h5>
                <div className="space-y-3">
                  {selectedReport.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)} • {file.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}

export default MedicalReports
