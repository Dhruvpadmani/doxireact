import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Calendar,
  FileText,
  Star
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'block'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await adminAPI.getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search term and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && patient.status === 'active') ||
                         (filterStatus === 'blocked' && patient.status === 'blocked');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setModalType('view');
    setShowModal(true);
  };

  const handleBlockPatient = (patient) => {
    setSelectedPatient(patient);
    setModalType('block');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedPatient) return;

    try {
      if (modalType === 'block') {
        // Toggle block status
        await adminAPI.updatePatientStatus(selectedPatient._id, {
          status: selectedPatient.status === 'active' ? 'blocked' : 'active',
          blockedReason: selectedPatient.status === 'active' ? 'Manual block' : ''
        });
        
        // Update local state
        setPatients(prev => prev.map(p => 
          p._id === selectedPatient._id 
            ? { ...p, status: selectedPatient.status === 'active' ? 'blocked' : 'active' }
            : p
        ));
      }
      
      setShowModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to update patient:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage patient accounts, monitor activity, and control access
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
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
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
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
              <p className="stat-label">Total Patients</p>
              <p className="stat-value text-primary-600">{patients.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Patients</p>
              <p className="stat-value text-success-600">
                {patients.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Blocked Patients</p>
              <p className="stat-value text-error-600">
                {patients.filter(p => p.status === 'blocked').length}
              </p>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <UserX className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Patient</th>
              <th className="table-head">Email</th>
              <th className="table-head">Status</th>
              <th className="table-head">Member Since</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentPatients.length > 0 ? (
              currentPatients.map((patient, index) => (
                <tr key={patient._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                        {patient.profile?.firstName?.[0]}
                        {patient.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {patient.profile?.firstName} {patient.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.profile?.age} years, {patient.profile?.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {patient.email}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${patient.status === 'active' ? 'badge-success' : 'badge-destructive'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBlockPatient(patient)}
                        className={`btn btn-sm ${patient.status === 'active' ? 'btn-destructive' : 'btn-success'}`}
                      >
                        {patient.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No patients found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
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

      {/* Modal for patient details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' ? 'Patient Details' : 
                   modalType === 'block' ? `${selectedPatient?.status === 'active' ? 'Block' : 'Unblock'} Patient` : 
                   'Edit Patient'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedPatient && (
                <div className="space-y-4">
                  {modalType === 'view' ? (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                          {selectedPatient.profile?.firstName?.[0]}
                          {selectedPatient.profile?.lastName?.[0]}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedPatient.email}</p>
                          <span className={`badge mt-1 ${selectedPatient.status === 'active' ? 'badge-success' : 'badge-destructive'}`}>
                            {selectedPatient.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Personal Info</h5>
                          <p><span className="text-gray-600 dark:text-gray-400">Age:</span> {selectedPatient.profile?.age || 'N/A'}</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Gender:</span> {selectedPatient.profile?.gender || 'N/A'}</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Contact:</span> {selectedPatient.profile?.contactNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Account Info</h5>
                          <p><span className="text-gray-600 dark:text-gray-400">Member since:</span> {new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Last active:</span> {selectedPatient.lastActiveAt ? new Date(selectedPatient.lastActiveAt).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>
                    </div>
                  ) : modalType === 'block' ? (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Are you sure you want to {selectedPatient.status === 'active' ? 'block' : 'unblock'} this patient?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Patient:</strong> {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {selectedPatient.email}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'block' && (
                  <button
                    onClick={handleAction}
                    className={`btn ${selectedPatient?.status === 'active' ? 'btn-destructive' : 'btn-success'}`}
                  >
                    {selectedPatient?.status === 'active' ? 'Block Patient' : 'Unblock Patient'}
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