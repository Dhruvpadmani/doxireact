import { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  UserX,
  UserPlus,
  Clock,
  Check,
  X as XIcon,
  Calendar,
  FileText,
  Star
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'approve', 'deactivate'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(10);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await adminAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search term and status
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.profile?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && doctor.verificationStatus === 'pending') ||
                         (filterStatus === 'verified' && doctor.verificationStatus === 'verified') ||
                         (filterStatus === 'deactivated' && doctor.status === 'deactivated');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setModalType('view');
    setShowModal(true);
  };

  const handleApproveDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setModalType('approve');
    setShowModal(true);
  };

  const handleDeactivateDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setModalType('deactivate');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedDoctor) return;

    try {
      if (modalType === 'approve') {
        // Approve doctor
        await adminAPI.updateDoctorStatus(selectedDoctor._id, {
          verificationStatus: 'verified',
          approvedAt: new Date().toISOString()
        });
        
        // Update local state
        setDoctors(prev => prev.map(d => 
          d._id === selectedDoctor._id 
            ? { ...d, verificationStatus: 'verified', approvedAt: new Date().toISOString() }
            : d
        ));
      } else if (modalType === 'deactivate') {
        // Toggle deactivate status
        await adminAPI.updateDoctorStatus(selectedDoctor._id, {
          status: selectedDoctor.status === 'active' ? 'deactivated' : 'active'
        });
        
        // Update local state
        setDoctors(prev => prev.map(d => 
          d._id === selectedDoctor._id 
            ? { ...d, status: selectedDoctor.status === 'active' ? 'deactivated' : 'active' }
            : d
        ));
      }
      
      setShowModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Failed to update doctor:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verify doctors, approve/reject registrations, manage availability
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search doctors by name, email, or specialization..."
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
            <option value="deactivated">Deactivated</option>
          </select>
          
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Doctors</p>
              <p className="stat-value text-primary-600">{doctors.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Verified</p>
              <p className="stat-value text-success-600">
                {doctors.filter(d => d.verificationStatus === 'verified').length}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <Check className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pending Approval</p>
              <p className="stat-value text-warning-600">
                {doctors.filter(d => d.verificationStatus === 'pending').length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Deactivated</p>
              <p className="stat-value text-error-600">
                {doctors.filter(d => d.status === 'deactivated').length}
              </p>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <UserX className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Doctor</th>
              <th className="table-head">Specialization</th>
              <th className="table-head">Verification</th>
              <th className="table-head">Status</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor, index) => (
                <tr key={doctor._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {doctor.profile?.firstName?.[0]}
                        {doctor.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {doctor.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {doctor.profile?.specialization}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${doctor.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                      {doctor.verificationStatus}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${doctor.status === 'active' ? 'badge-success' : 'badge-destructive'}`}>
                      {doctor.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {doctor.verificationStatus === 'pending' && (
                        <button
                          onClick={() => handleApproveDoctor(doctor)}
                          className="btn btn-success btn-sm"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeactivateDoctor(doctor)}
                        className={`btn btn-sm ${doctor.status === 'active' ? 'btn-destructive' : 'btn-success'}`}
                      >
                        {doctor.status === 'active' ? <UserX className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No doctors found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstDoctor + 1} to {Math.min(indexOfLastDoctor, filteredDoctors.length)} of {filteredDoctors.length} doctors
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

      {/* Modal for doctor details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' ? 'Doctor Details' : 
                   modalType === 'approve' ? 'Approve Doctor' : 
                   `${selectedDoctor?.status === 'active' ? 'Deactivate' : 'Activate'} Doctor`}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedDoctor && (
                <div className="space-y-4">
                  {modalType === 'view' ? (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                          {selectedDoctor.profile?.firstName?.[0]}
                          {selectedDoctor.profile?.lastName?.[0]}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Dr. {selectedDoctor.profile?.firstName} {selectedDoctor.profile?.lastName}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedDoctor.email}</p>
                          <span className={`badge mt-1 ${selectedDoctor.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                            {selectedDoctor.verificationStatus}
                          </span>
                          <span className={`badge mt-1 ml-2 ${selectedDoctor.status === 'active' ? 'badge-success' : 'badge-destructive'}`}>
                            {selectedDoctor.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Professional Info</h5>
                          <p><span className="text-gray-600 dark:text-gray-400">Specialization:</span> {selectedDoctor.profile?.specialization}</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Experience:</span> {selectedDoctor.profile?.experienceYears} years</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Bio:</span> {selectedDoctor.profile?.bio}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Account Info</h5>
                          <p><span className="text-gray-600 dark:text-gray-400">Member since:</span> {new Date(selectedDoctor.createdAt).toLocaleDateString()}</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Verification status:</span> {selectedDoctor.verificationStatus}</p>
                          <p><span className="text-gray-600 dark:text-gray-400">Status:</span> {selectedDoctor.status}</p>
                        </div>
                      </div>
                    </div>
                  ) : modalType === 'approve' ? (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Are you sure you want to approve this doctor?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Doctor:</strong> Dr. {selectedDoctor.profile?.firstName} {selectedDoctor.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {selectedDoctor.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Specialization:</strong> {selectedDoctor.profile?.specialization}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Are you sure you want to {selectedDoctor.status === 'active' ? 'deactivate' : 'activate'} this doctor?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Doctor:</strong> Dr. {selectedDoctor.profile?.firstName} {selectedDoctor.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {selectedDoctor.email}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {(modalType === 'approve' || modalType === 'deactivate') && (
                  <button
                    onClick={handleAction}
                    className={`btn ${modalType === 'approve' ? 'btn-success' : selectedDoctor?.status === 'active' ? 'btn-destructive' : 'btn-success'}`}
                  >
                    {modalType === 'approve' ? 'Approve Doctor' : selectedDoctor?.status === 'active' ? 'Deactivate Doctor' : 'Activate Doctor'}
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