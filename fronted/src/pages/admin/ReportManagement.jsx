import React, {useCallback, useEffect, useState} from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileText,
  FileX,
  Mail,
  Plus,
  Save,
  Search,
  Stethoscope,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import {adminAPI, reportsAPI} from '../../services/api';

const ReportManagement = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete', 'verify'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    reportType: '',
    title: '',
    description: '',
    filePath: '',
    notes: '',
    verifiedStatus: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Functions
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
        // Use real API call to fetch reports
        const response = await reportsAPI.getReports();
        if (response.data && response.data.reports) {
            setReports(response.data.reports);
        } else {
            setReports([]);
        }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Failed to load reports');
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load reports. Please check your connection and try again.');
        });
      // Set empty reports array to prevent blank page
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientsAndDoctors = useCallback(async () => {
    try {
        // Fetch patients
        const patientsResponse = await adminAPI.getUsers({role: 'patient'});
        if (patientsResponse.data && patientsResponse.data.users) {
            setPatients(patientsResponse.data.users);
        } else {
          setPatients([]);
        }

        // Fetch doctors
        const doctorsResponse = await adminAPI.getDoctors();
        if (doctorsResponse.data && doctorsResponse.data.doctors) {
            setDoctors(doctorsResponse.data.doctors);
        } else {
          setDoctors([]);
        }
    } catch (error) {
      console.error('Failed to fetch patients and doctors:', error);
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load patients and doctors. Please check your connection and try again.');
        });
      // Set empty arrays to prevent blank page
      setPatients([]);
      setDoctors([]);
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchReports();
    fetchPatientsAndDoctors();
  }, [fetchReports, fetchPatientsAndDoctors]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.doctorId) errors.doctorId = 'Doctor is required';
    if (!formData.reportType.trim()) errors.reportType = 'Report type is required';
    if (!formData.title.trim()) errors.title = 'Report title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateReport = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const newReport = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        reportType: formData.reportType,
        title: formData.title,
        description: formData.description,
        filePath: formData.filePath || '/reports/default-report.pdf',
        notes: formData.notes,
        verifiedStatus: formData.verifiedStatus,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setReports(prev => [newReport, ...prev]);
      setSuccess('Report created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create report:', error);
      setError('Failed to create report');
    }
  };

  const handleUpdateReport = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const updatedReport = {
        ...selectedReport,
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        reportType: formData.reportType,
        title: formData.title,
        description: formData.description,
        filePath: formData.filePath,
        notes: formData.notes,
        verifiedStatus: formData.verifiedStatus,
        updatedAt: new Date().toISOString()
      };
      
      setReports(prev => prev.map(r => 
        r.id === selectedReport.id ? updatedReport : r
      ));
      setSuccess('Report updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update report:', error);
      setError('Failed to update report');
    }
  };

  const handleDeleteReport = async () => {
    try {
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setSuccess('Report deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete report:', error);
      setError('Failed to delete report');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      reportType: '',
      title: '',
      description: '',
      filePath: '',
      notes: '',
      verifiedStatus: 'pending'
    });
    setFormErrors({});
    setSelectedReport(null);
  };

  // Filter reports based on search term and status
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.patientId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'verified' && report.verifiedStatus === 'verified') ||
                         (filterStatus === 'pending' && report.verifiedStatus === 'pending') ||
                         (filterStatus === 'removed' && report.verifiedStatus === 'removed');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Modal handlers
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setFormData({
      patientId: report.patientId?.id || '',
      doctorId: report.doctorId?.id || '',
      reportType: report.reportType || '',
      title: report.title || '',
      description: report.description || '',
      filePath: report.filePath || '',
      notes: report.notes || '',
      verifiedStatus: report.verifiedStatus || 'pending'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteReportClick = (report) => {
    setSelectedReport(report);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateReportClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleVerifyReport = async (report) => {
    try {
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, verifiedStatus: 'verified', updatedAt: new Date().toISOString() } : r
      ));
      setSuccess('Report verified successfully');
    } catch (error) {
      console.error('Failed to verify report:', error);
      setError('Failed to verify report');
    }
  };

  const handleRemoveReport = async (report) => {
    try {
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, verifiedStatus: 'removed', updatedAt: new Date().toISOString() } : r
      ));
      setSuccess('Report removed successfully');
    } catch (error) {
      console.error('Failed to remove report:', error);
      setError('Failed to remove report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'removed': return 'badge-destructive';
      default: return 'badge-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <FileCheck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'removed': return <FileX className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Report Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Verify uploaded reports, remove invalid files, manage access
          </p>
        </div>
        <button
          onClick={handleCreateReportClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Report
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/>
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search reports by patient, doctor, or type..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Reports</p>
              <p className="stat-value text-primary-600">{reports.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Verified</p>
              <p className="stat-value text-success-600">
                {reports.filter(r => r.verifiedStatus === 'verified').length}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <FileCheck className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Pending</p>
              <p className="stat-value text-warning-600">
                {reports.filter(r => r.verifiedStatus === 'pending').length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Removed</p>
              <p className="stat-value text-error-600">
                {reports.filter(r => r.verifiedStatus === 'removed').length}
              </p>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <FileX className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Patient</th>
              <th className="table-head">Doctor</th>
              <th className="table-head">Report Type</th>
              <th className="table-head">Uploaded</th>
              <th className="table-head">Status</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentReports.length > 0 ? (
              currentReports.map((report, index) => (
                <tr key={report._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {report.patientId?.profile?.firstName?.[0]}
                        {report.patientId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {report.patientId?.profile?.firstName} {report.patientId?.profile?.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {report.doctorId?.profile?.firstName?.[0]}
                        {report.doctorId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dr. {report.doctorId?.profile?.firstName} {report.doctorId?.profile?.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {report.reportType || 'Medical Report'}
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {new Date(report.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.verifiedStatus)}
                      <span className={`badge ${getStatusColor(report.verifiedStatus)}`}>
                        {report.verifiedStatus}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="btn btn-ghost btn-sm"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditReport(report)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Report"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {report.verifiedStatus === 'pending' && (
                        <button
                          onClick={() => handleVerifyReport(report)}
                          className="btn btn-success btn-sm"
                          title="Verify Report"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {report.verifiedStatus === 'verified' && (
                        <button
                          onClick={() => handleRemoveReport(report)}
                          className="btn btn-destructive btn-sm"
                          title="Remove Report"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReportClick(report)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstReport + 1} to {Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length} reports
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for report details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Report Details'}
                  {modalType === 'create' && 'Create New Report'}
                  {modalType === 'edit' && 'Edit Report'}
                  {modalType === 'delete' && 'Delete Report'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalType === 'view' && selectedReport && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedReport.patientId?.profile?.firstName?.[0]}
                        {selectedReport.patientId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Patient</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedReport.patientId?.profile?.firstName} {selectedReport.patientId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedReport.patientId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedReport.doctorId?.profile?.firstName?.[0]}
                        {selectedReport.doctorId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Dr. {selectedReport.doctorId?.profile?.firstName} {selectedReport.doctorId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {selectedReport.doctorId?.profile?.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Report Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Type:</span> {selectedReport.reportType}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Title:</span> {selectedReport.title}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Status:</span> 
                          <span className={`badge ml-2 ${getStatusColor(selectedReport.verifiedStatus)}`}>
                            {selectedReport.verifiedStatus}
                          </span>
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">File:</span> 
                          <button className="text-blue-600 dark:text-blue-400 hover:underline ml-1 flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4"/>
                        Additional Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Description:</span> {selectedReport.description}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Notes:</span> {selectedReport.notes || 'No notes'}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Uploaded:</span> {new Date(selectedReport.uploadedAt).toLocaleString()}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Last Updated:</span> {new Date(selectedReport.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Patient *</label>
                      <select
                        className={`input ${formErrors.patientId ? 'border-red-500' : ''}`}
                        value={formData.patientId}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.profile?.firstName} {patient.profile?.lastName} ({patient.email})
                          </option>
                        ))}
                      </select>
                      {formErrors.patientId && <p className="text-red-500 text-sm mt-1">{formErrors.patientId}</p>}
                    </div>
                    <div>
                      <label className="label">Doctor *</label>
                      <select
                        className={`input ${formErrors.doctorId ? 'border-red-500' : ''}`}
                        value={formData.doctorId}
                        onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.profile?.firstName} {doctor.profile?.lastName} ({doctor.profile?.specialization})
                          </option>
                        ))}
                      </select>
                      {formErrors.doctorId && <p className="text-red-500 text-sm mt-1">{formErrors.doctorId}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Report Type *</label>
                      <select
                        className={`input ${formErrors.reportType ? 'border-red-500' : ''}`}
                        value={formData.reportType}
                        onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                      >
                        <option value="">Select Report Type</option>
                        <option value="Blood Test">Blood Test</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="MRI">MRI</option>
                        <option value="CT Scan">CT Scan</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="ECG">ECG</option>
                        <option value="Biopsy">Biopsy</option>
                        <option value="Pathology">Pathology</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.reportType && <p className="text-red-500 text-sm mt-1">{formErrors.reportType}</p>}
                    </div>
                    <div>
                      <label className="label">Verification Status</label>
                      <select
                        className="input"
                        value={formData.verifiedStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, verifiedStatus: e.target.value }))}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="removed">Removed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Report Title *</label>
                    <input
                      type="text"
                      className={`input ${formErrors.title ? 'border-red-500' : ''}`}
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter report title"
                    />
                    {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                  </div>

                  <div>
                    <label className="label">Description *</label>
                    <textarea
                      className={`input ${formErrors.description ? 'border-red-500' : ''}`}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the report content"
                    />
                    {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  <div>
                    <label className="label">File Path</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={formData.filePath}
                        onChange={(e) => setFormData(prev => ({ ...prev, filePath: e.target.value }))}
                        placeholder="Enter file path or upload file"
                      />
                      <button
                        type="button"
                        className="btn btn-outline flex items-center gap-2"
                        onClick={() => alert('File upload functionality coming soon!')}
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or observations"
                    />
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedReport && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Report</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The report will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Patient:</strong> {selectedReport.patientId?.profile?.firstName} {selectedReport.patientId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Doctor:</strong> Dr. {selectedReport.doctorId?.profile?.firstName} {selectedReport.doctorId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Report Type:</strong> {selectedReport.reportType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Title:</strong> {selectedReport.title}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateReport}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Report
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateReport}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Report
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteReport}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Report
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;