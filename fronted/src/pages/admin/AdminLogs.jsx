import React, {useCallback, useEffect, useState} from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  FileBarChart,
  Globe,
  LogOut,
  Mail,
  Monitor,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  User,
  Users
} from 'lucide-react';
import {adminAPI} from '../../services/api';

const AdminLogs = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    adminId: '',
    action: '',
    target_table: '',
    target_id: '',
    ip_address: '',
    user_agent: '',
    details: '',
    severity: 'info'
  });
  const [formErrors, setFormErrors] = useState({});
  const [admins, setAdmins] = useState([]);

  // Functions
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
        // Use real API call to fetch logs
        const response = await adminAPI.getLogs();
        if (response.data && response.data.logs) {
            setLogs(response.data.logs);
        } else {
            setLogs([]);
        }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
        setError('Failed to load logs');
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load logs. Please check your connection and try again.');
        });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
        // Fetch admins
        const adminsResponse = await adminAPI.getUsers({role: 'admin'});
        if (adminsResponse.data && adminsResponse.data.users) {
            setAdmins(adminsResponse.data.users);
        }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load admins. Please check your connection and try again.');
        });
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchLogs();
    fetchAdmins();
  }, [fetchLogs, fetchAdmins]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.adminId) errors.adminId = 'Admin is required';
    if (!formData.action) errors.action = 'Action is required';
    if (!formData.target_table) errors.target_table = 'Target table is required';
    if (!formData.target_id) errors.target_id = 'Target ID is required';
    if (!formData.ip_address) errors.ip_address = 'IP address is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateLog = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedAdmin = admins.find(a => a.id === formData.adminId);
      
      const newLog = {
        id: Date.now().toString(),
        adminId: selectedAdmin,
        action: formData.action,
        target_table: formData.target_table,
        target_id: formData.target_id,
        timestamp: new Date().toISOString(),
        ip_address: formData.ip_address,
        user_agent: formData.user_agent,
        details: formData.details ? JSON.parse(formData.details) : {},
        severity: formData.severity
      };
      
      setLogs(prev => [newLog, ...prev]);
      setSuccess('Admin log created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create admin log:', error);
      setError('Failed to create admin log');
    }
  };

  const handleUpdateLog = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedAdmin = admins.find(a => a.id === formData.adminId);
      
      const updatedLog = {
        ...selectedLog,
        adminId: selectedAdmin,
        action: formData.action,
        target_table: formData.target_table,
        target_id: formData.target_id,
        ip_address: formData.ip_address,
        user_agent: formData.user_agent,
        details: formData.details ? JSON.parse(formData.details) : {},
        severity: formData.severity,
        timestamp: new Date().toISOString()
      };
      
      setLogs(prev => prev.map(l => 
        l.id === selectedLog.id ? updatedLog : l
      ));
      setSuccess('Admin log updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update admin log:', error);
      setError('Failed to update admin log');
    }
  };

  const handleDeleteLog = async () => {
    try {
      setLogs(prev => prev.filter(l => l.id !== selectedLog.id));
      setSuccess('Admin log deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete admin log:', error);
      setError('Failed to delete admin log');
    }
  };

  const resetForm = () => {
    setFormData({
      adminId: '',
      action: '',
      target_table: '',
      target_id: '',
      ip_address: '',
      user_agent: '',
      details: '',
      severity: 'info'
    });
    setFormErrors({});
    setSelectedLog(null);
  };

  // Filter logs based on search term, action, and date
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_table?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesDate = !filterDate || new Date(log.timestamp).toDateString() === new Date(filterDate).toDateString();
    
    return matchesSearch && matchesAction && matchesDate;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Modal handlers
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditLog = (log) => {
    setSelectedLog(log);
    setFormData({
      adminId: log.adminId?.id || '',
      action: log.action || '',
      target_table: log.target_table || '',
      target_id: log.target_id || '',
      ip_address: log.ip_address || '',
      user_agent: log.user_agent || '',
      details: log.details ? JSON.stringify(log.details, null, 2) : '',
      severity: log.severity || 'info'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteLogClick = (log) => {
    setSelectedLog(log);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateLogClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Admin', 'Action', 'Target Table', 'Target ID', 'IP Address', 'Timestamp', 'Severity'],
      ...filteredLogs.map(log => [
        `${log.adminId?.profile?.firstName} ${log.adminId?.profile?.lastName}`,
        log.action,
        log.target_table,
        log.target_id,
        log.ip_address,
        new Date(log.timestamp).toLocaleString(),
        log.severity
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
      case 'view':
        return 'text-blue-600 dark:text-blue-400';
      case 'create':
        return 'text-green-600 dark:text-green-400';
      case 'update':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'delete':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return <User className="h-4 w-4" />;
      case 'logout':
        return <LogOut className="h-4 w-4" />;
      case 'create':
        return <Activity className="h-4 w-4" />;
      case 'update':
        return <Edit className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Logs</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Track all admin actions (deletes, updates, login history, user blocks)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportLogs}
            className="btn btn-outline flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleCreateLogClick}
            className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Log
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search logs by admin name, action, or table..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="input"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="settings">Settings</option>
          </select>
        </div>
        
        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Logs</p>
              <p className="stat-value text-primary-600">{logs.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <FileBarChart className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Today's Logs</p>
              <p className="stat-value text-success-600">
                {logs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <Activity className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Unique Admins</p>
              <p className="stat-value text-warning-600">
                {[...new Set(logs.map(log => log.adminId?.id))].length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Critical Actions</p>
              <p className="stat-value text-error-600">
                {logs.filter(log => log.severity === 'error' || log.action === 'delete').length}
              </p>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Admin</th>
              <th className="table-head">Action</th>
              <th className="table-head">Target</th>
              <th className="table-head">Severity</th>
              <th className="table-head">IP Address</th>
              <th className="table-head">Timestamp</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentLogs.length > 0 ? (
              currentLogs.map((log, index) => (
                <tr key={log.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {log.adminId?.profile?.firstName?.[0]}
                        {log.adminId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {log.adminId?.profile?.firstName} {log.adminId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {log.adminId?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    <div>
                      <p className="font-medium">{log.target_table}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {log.target_id}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      log.severity === 'error' ? 'badge-destructive' :
                      log.severity === 'warning' ? 'badge-warning' :
                      log.severity === 'info' ? 'badge-success' :
                      'badge-secondary'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      {log.ip_address || 'N/A'}
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewLog(log)}
                        className="btn btn-ghost btn-sm"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditLog(log)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Log"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLogClick(log)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
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

      {/* Modal for log details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Log Details'}
                  {modalType === 'create' && 'Create New Log'}
                  {modalType === 'edit' && 'Edit Log'}
                  {modalType === 'delete' && 'Delete Log'}
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

              {modalType === 'view' && selectedLog && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedLog.adminId?.profile?.firstName?.[0]}
                        {selectedLog.adminId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Admin</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedLog.adminId?.profile?.firstName} {selectedLog.adminId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedLog.adminId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {getActionIcon(selectedLog.action)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Action</h4>
                        <p className={`text-gray-600 dark:text-gray-400 ${getActionColor(selectedLog.action)}`}>
                          {selectedLog.action}
                        </p>
                        <span className={`badge mt-1 ${
                          selectedLog.severity === 'error' ? 'badge-destructive' :
                          selectedLog.severity === 'warning' ? 'badge-warning' :
                          selectedLog.severity === 'info' ? 'badge-success' :
                          'badge-secondary'
                        }`}>
                          {selectedLog.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Target Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Table:</span> {selectedLog.target_table}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">ID:</span> {selectedLog.target_id}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System Information
                      </h5>
                      <div className="space-y-2">
                        <p className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">IP:</span> {selectedLog.ip_address || 'N/A'}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Time:</span> {new Date(selectedLog.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      User Agent
                    </h5>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {selectedLog.user_agent || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileBarChart className="h-4 w-4" />
                        Additional Details
                      </h5>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <pre className="text-gray-700 dark:text-gray-300 text-sm overflow-x-auto">
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Admin *</label>
                      <select
                        className={`input ${formErrors.adminId ? 'border-red-500' : ''}`}
                        value={formData.adminId}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminId: e.target.value }))}
                      >
                        <option value="">Select Admin</option>
                        {admins.map(admin => (
                          <option key={admin.id} value={admin.id}>
                            {admin.profile?.firstName} {admin.profile?.lastName} ({admin.email})
                          </option>
                        ))}
                      </select>
                      {formErrors.adminId && <p className="text-red-500 text-sm mt-1">{formErrors.adminId}</p>}
                    </div>
                    <div>
                      <label className="label">Action *</label>
                      <select
                        className={`input ${formErrors.action ? 'border-red-500' : ''}`}
                        value={formData.action}
                        onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                      >
                        <option value="">Select Action</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="view">View</option>
                        <option value="settings">Settings</option>
                      </select>
                      {formErrors.action && <p className="text-red-500 text-sm mt-1">{formErrors.action}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Target Table *</label>
                      <input
                        type="text"
                        className={`input ${formErrors.target_table ? 'border-red-500' : ''}`}
                        value={formData.target_table}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_table: e.target.value }))}
                        placeholder="e.g., users, patients, doctors"
                      />
                      {formErrors.target_table && <p className="text-red-500 text-sm mt-1">{formErrors.target_table}</p>}
                    </div>
                    <div>
                      <label className="label">Target ID *</label>
                      <input
                        type="text"
                        className={`input ${formErrors.target_id ? 'border-red-500' : ''}`}
                        value={formData.target_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_id: e.target.value }))}
                        placeholder="Record ID"
                      />
                      {formErrors.target_id && <p className="text-red-500 text-sm mt-1">{formErrors.target_id}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">IP Address *</label>
                      <input
                        type="text"
                        className={`input ${formErrors.ip_address ? 'border-red-500' : ''}`}
                        value={formData.ip_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                        placeholder="192.168.1.1"
                      />
                      {formErrors.ip_address && <p className="text-red-500 text-sm mt-1">{formErrors.ip_address}</p>}
                    </div>
                    <div>
                      <label className="label">Severity</label>
                      <select
                        className="input"
                        value={formData.severity}
                        onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">User Agent</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.user_agent}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_agent: e.target.value }))}
                      placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
                    />
                  </div>

                  <div>
                    <label className="label">Additional Details (JSON)</label>
                    <textarea
                      className="input"
                      rows="4"
                      value={formData.details}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                      placeholder='{"key": "value", "reason": "example"}'
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter valid JSON format for additional log details
                    </p>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedLog && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Log Entry</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The log entry will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Admin:</strong> {selectedLog.adminId?.profile?.firstName} {selectedLog.adminId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Action:</strong> {selectedLog.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Target:</strong> {selectedLog.target_table} (ID: {selectedLog.target_id})
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateLog}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Log
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateLog}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Log
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteLog}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Log
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

export default AdminLogs;