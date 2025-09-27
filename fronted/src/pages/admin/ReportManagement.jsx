import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  FileCheck,
  FileX,
  User,
  Stethoscope,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'verify', 'remove'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await adminAPI.getReports();
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      // Set empty array in case of error
      setReports([]);
    } finally {
      setLoading(false);
    }
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

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setModalType('view');
    setShowModal(true);
  };

  const handleVerifyReport = (report) => {
    setSelectedReport(report);
    setModalType('verify');
    setShowModal(true);
  };

  const handleRemoveReport = (report) => {
    setSelectedReport(report);
    setModalType('remove');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedReport || !modalType) return;

    try {
      if (modalType === 'verify') {
        // Verify report
        await adminAPI.updateReportStatus(selectedReport._id, {
          verifiedStatus: 'verified'
        });
        
        // Update local state
        setReports(prev => prev.map(r => 
          r._id === selectedReport._id 
            ? { ...r, verifiedStatus: 'verified' }
            : r
        ));
      } else if (modalType === 'remove') {
        // Remove report
        await adminAPI.updateReportStatus(selectedReport._id, {
          verifiedStatus: 'removed',
          removedReason: 'Removed by admin'
        });
        
        // Update local state
        setReports(prev => prev.map(r => 
          r._id === selectedReport._id 
            ? { ...r, verifiedStatus: 'removed', removedReason: 'Removed by admin' }
            : r
        ));
      }
      
      setShowModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to update report:', error);
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verify uploaded reports, remove invalid files, manage access
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search reports by patient, doctor, or type..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="removed">Removed</option>
          </select>
          
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Reports</p>
              <p className="stat-value text-primary-600">{reports.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
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

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
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
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {report.verifiedStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerifyReport(report)}
                            className="btn btn-success btn-sm"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveReport(report)}
                            className="btn btn-destructive btn-sm"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {report.verifiedStatus !== 'pending' && (
                        <button
                          onClick={() => handleRemoveReport(report)}
                          className="btn btn-outline btn-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' ? 'Report Details' : 
                   modalType === 'verify' ? 'Verify Report' : 
                   'Remove Report'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedReport && (
                <div className="space-y-4">
                  {modalType === 'view' ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Patient</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {selectedReport.patientId?.profile?.firstName} {selectedReport.patientId?.profile?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Doctor</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Dr. {selectedReport.doctorId?.profile?.firstName} {selectedReport.doctorId?.profile?.lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Report Type</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedReport.reportType || 'Medical Report'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Uploaded</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {new Date(selectedReport.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Status</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className={`badge ${getStatusColor(selectedReport.verifiedStatus)}`}>
                              {selectedReport.verifiedStatus}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">File Path</p>
                          <p className="text-gray-600 dark:text-gray-400 truncate">
                            {selectedReport.filePath}
                          </p>
                        </div>
                      </div>
                      
                      {selectedReport.notes && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Notes</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedReport.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : modalType === 'verify' ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-gray-700 dark:text-gray-300">
                          Verify this report? This will make it available to the patient.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Patient</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedReport.patientId?.profile?.firstName} {selectedReport.patientId?.profile?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Doctor</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Dr. {selectedReport.doctorId?.profile?.firstName} {selectedReport.doctorId?.profile?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-gray-900 dark:text-white">Report Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedReport.reportType}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <p className="text-gray-700 dark:text-gray-300">
                          Remove this report? This action cannot be undone.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Patient</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedReport.patientId?.profile?.firstName} {selectedReport.patientId?.profile?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Doctor</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Dr. {selectedReport.doctorId?.profile?.firstName} {selectedReport.doctorId?.profile?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-gray-900 dark:text-white">Report Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedReport.reportType}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'verify' && (
                  <button
                    onClick={handleAction}
                    className="btn btn-success"
                  >
                    Verify Report
                  </button>
                )}
                {modalType === 'remove' && (
                  <button
                    onClick={handleAction}
                    className="btn btn-destructive"
                  >
                    Remove Report
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
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
}