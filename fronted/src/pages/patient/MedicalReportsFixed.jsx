import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  Trash2, 
  Upload, 
  FileText, 
  Image, 
  File,
  Save,
  X
} from 'lucide-react'
import { patientAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const MedicalReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'lab',
    description: '',
    testDate: '',
    files: []
  })
  const [updateForm, setUpdateForm] = useState({
    title: '',
    type: 'lab',
    description: '',
    testDate: '',
    files: []
  })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await patientAPI.getReports()
      setReports(response.data.reports)
    } catch (error) {
      console.error('Error loading reports:', error)
      // Use mock data when API fails
      setReports([
        {
          id: '1',
          title: 'Blood Test Results',
          type: 'lab',
          status: 'completed',
          testDate: '2024-01-15',
          reportDate: '2024-01-16',
          description: 'Complete blood count and lipid panel',
          files: [
            { name: 'blood_test.pdf', type: 'pdf', size: 245760 },
            { name: 'lab_results.jpg', type: 'image', size: 189440 }
          ],
          tags: ['blood test', 'lab work']
        },
        {
          id: '2',
          title: 'X-Ray Report',
          type: 'imaging',
          status: 'completed',
          testDate: '2024-01-10',
          reportDate: '2024-01-11',
          description: 'Chest X-ray examination',
          files: [
            { name: 'chest_xray.jpg', type: 'image', size: 512000 }
          ],
          tags: ['x-ray', 'chest']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowUploadModal(false)
      setUploadForm({ title: '', type: 'lab', description: '', testDate: '', files: [] })
      loadReports()
      alert('Report uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const handleUpdateReport = (report) => {
    setSelectedReport(report)
    setUpdateForm({
      title: report.title,
      type: report.type,
      description: report.description,
      testDate: report.testDate,
      files: report.files
    })
    setShowUpdateModal(true)
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 1500))
      setShowUpdateModal(false)
      loadReports()
      alert('Report updated successfully!')
    } catch (error) {
      console.error('Update failed:', error)
      alert('Update failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setLoading(true)
      try {
        // Mock delete
        await new Promise(resolve => setTimeout(resolve, 1000))
        setReports(reports.filter(report => report.id !== reportId))
        alert('Report deleted successfully!')
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Delete failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDownloadReport = (report) => {
    console.log('Download report clicked for:', report.title)
    try {
      const reportData = {
        "Report Information": {
          "Title": report.title,
          "Report ID": report.id,
          "Type": report.type,
          "Status": report.status,
          "Test Date": new Date(report.testDate).toLocaleDateString(),
          "Report Date": new Date(report.reportDate).toLocaleDateString(),
          "Tags": report.tags.join(', ')
        },
        "Files": report.files.map(file => ({
          "Name": file.name,
          "Type": file.type,
          "Size": formatFileSize(file.size)
        })),
        "Generated On": new Date().toLocaleString()
      }
      
      const dataStr = JSON.stringify(reportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      
      const linkElement = document.createElement('a')
      linkElement.href = url
      linkElement.download = `${report.id}_Medical_Report.json`
      linkElement.style.display = 'none'
      document.body.appendChild(linkElement)
      linkElement.click()
      document.body.removeChild(linkElement)
      window.URL.revokeObjectURL(url)
      
      alert('Report downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  const handleDownloadFile = (file) => {
    console.log('Download file clicked for:', file.name)
    try {
      const fileData = {
        "File Information": {
          "Name": file.name,
          "Type": file.type,
          "Size": formatFileSize(file.size),
          "Uploaded": new Date().toLocaleDateString()
        },
        "Content": `This is a sample ${file.type} file: ${file.name}`,
        "Note": "This is a demo file. In a real application, this would contain the actual file content."
      }
      
      const dataStr = JSON.stringify(fileData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      
      const linkElement = document.createElement('a')
      linkElement.href = url
      linkElement.download = file.name.replace(/\.[^/.]+$/, "") + "_info.json"
      linkElement.style.display = 'none'
      document.body.appendChild(linkElement)
      linkElement.click()
      document.body.removeChild(linkElement)
      window.URL.revokeObjectURL(url)
      
      alert(`File "${file.name}" downloaded successfully!`)
    } catch (error) {
      console.error('File download failed:', error)
      alert('Failed to download file. Please try again.')
    }
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage your medical reports</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{report.description}</p>
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
                  onClick={() => handleUpdateReport(report)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                  title="Update report"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownloadReport(report)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors"
                  title="Download report"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Delete report"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="lab">Lab Report</option>
                    <option value="imaging">Imaging</option>
                    <option value="pathology">Pathology</option>
                    <option value="radiology">Radiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.testDate}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, testDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, files: Array.from(e.target.files) }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Update Report Modal */}
      {showUpdateModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Report</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type
                  </label>
                  <select
                    value={updateForm.type}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="lab">Lab Report</option>
                    <option value="imaging">Imaging</option>
                    <option value="pathology">Pathology</option>
                    <option value="radiology">Radiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={updateForm.testDate}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, testDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Update Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalReports
