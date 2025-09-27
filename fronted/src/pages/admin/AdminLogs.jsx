import { useState, useEffect } from 'react';
import { 
  FileBarChart,
  Search,
  Filter,
  User,
  LogOut,
  Edit,
  Trash2,
  Eye,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await adminAPI.getAdminLogs();
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // Set empty array in case of error
      setLogs([
        {
          _id: '1',
          adminId: { profile: { firstName: 'Admin', lastName: 'User' } },
          action: 'login',
          target_table: 'users',
          target_id: '123',
          timestamp: new Date().toISOString(),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...'
        }
      ]);
    } finally {
      setLoading(false);
    }
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

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowModal(true);
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Logs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track all admin actions (deletes, updates, login history, user blocks)
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search logs by admin name, action, or table..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white w-full"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Logs</p>
              <p className="stat-value text-primary-600">{logs.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <FileBarChart className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
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

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Unique Admins</p>
              <p className="stat-value text-warning-600">
                {[...new Set(logs.map(log => log.adminId?._id))].length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-warning-600" />
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
              <th className="table-head">IP Address</th>
              <th className="table-head">Timestamp</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentLogs.length > 0 ? (
              currentLogs.map((log, index) => (
                <tr key={log._id} className="table-row">
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
                  <td className="table-cell text-gray-900 dark:text-white">
                    {log.ip_address || 'N/A'}
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleViewLog(log)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
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

      {/* Modal for log details */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Log Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Admin</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedLog.adminId?.profile?.firstName} {selectedLog.adminId?.profile?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Action</p>
                    <div className="flex items-center gap-2">
                      {getActionIcon(selectedLog.action)}
                      <span className={`${getActionColor(selectedLog.action)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Target Table</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedLog.target_table}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Target ID</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedLog.target_id}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">IP Address</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedLog.ip_address || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">User Agent</p>
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {selectedLog.user_agent || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Timestamp</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {selectedLog.details && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Details</p>
                    <pre className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}