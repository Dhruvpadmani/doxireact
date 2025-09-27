import React, { useState, useEffect, useCallback } from 'react';
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
  Star,
  Plus,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Clock
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const PatientManagement = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'create', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    contactNumber: '',
    address: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Functions
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll use localStorage data as fallback
      const registeredUsers = JSON.parse(localStorage.getItem('demoAccounts') || '[]');
      const patientUsers = registeredUsers.filter(user => user.role === 'patient');
      setPatients(patientUsers);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      errors.age = 'Age must be between 1 and 120';
    }
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      errors.contactNumber = 'Contact number must be 10 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreatePatient = async () => {
    if (!validateForm()) return;
    
    try {
      const newPatient = {
        _id: Date.now().toString(),
        email: formData.email,
        role: 'patient',
        status: formData.status,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          gender: formData.gender,
          contactNumber: formData.contactNumber,
          address: formData.address
        },
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      
      setPatients(prev => [newPatient, ...prev]);
      setSuccess('Patient created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create patient:', error);
      setError('Failed to create patient');
    }
  };

  const handleUpdatePatient = async () => {
    if (!validateForm()) return;
    
    try {
      const updatedPatient = {
        ...selectedPatient,
        email: formData.email,
        status: formData.status,
        profile: {
          ...selectedPatient.profile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          gender: formData.gender,
          contactNumber: formData.contactNumber,
          address: formData.address
        }
      };
      
      setPatients(prev => prev.map(p => 
        p._id === selectedPatient._id ? updatedPatient : p
      ));
      setSuccess('Patient updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update patient:', error);
      setError('Failed to update patient');
    }
  };

  const handleDeletePatient = async () => {
    try {
      setPatients(prev => prev.filter(p => p._id !== selectedPatient._id));
      setSuccess('Patient deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete patient:', error);
      setError('Failed to delete patient');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      gender: '',
      contactNumber: '',
      address: '',
      status: 'active'
    });
    setFormErrors({});
    setSelectedPatient(null);
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

  // Modal handlers
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.profile?.firstName || '',
      lastName: patient.profile?.lastName || '',
      email: patient.email || '',
      age: patient.profile?.age || '',
      gender: patient.profile?.gender || '',
      contactNumber: patient.profile?.contactNumber || '',
      address: patient.profile?.address || '',
      status: patient.status || 'active'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeletePatientClick = (patient) => {
    setSelectedPatient(patient);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreatePatientClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleToggleStatus = async (patient) => {
    try {
      const newStatus = patient.status === 'active' ? 'blocked' : 'active';
      setPatients(prev => prev.map(p => 
        p._id === patient._id ? { ...p, status: newStatus } : p
      ));
      setSuccess(`Patient ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
    } catch (error) {
      console.error('Failed to update patient status:', error);
      setError('Failed to update patient status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Manage patient accounts, monitor activity, and control access
          </p>
        </div>
        <button
          onClick={handleCreatePatientClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Patient
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
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
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
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
            placeholder="Search patients by name or email..."
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
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Patients</p>
              <p className="stat-value text-primary-600">{patients.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Patient"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(patient)}
                        className={`btn btn-sm ${patient.status === 'active' ? 'btn-destructive' : 'btn-success'}`}
                        title={patient.status === 'active' ? 'Block Patient' : 'Activate Patient'}
                      >
                        {patient.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeletePatientClick(patient)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Patient Details'}
                  {modalType === 'create' && 'Add New Patient'}
                  {modalType === 'edit' && 'Edit Patient'}
                  {modalType === 'delete' && 'Delete Patient'}
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

              {modalType === 'view' && selectedPatient && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                      {selectedPatient.profile?.firstName?.[0]}
                      {selectedPatient.profile?.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedPatient.email}
                      </p>
                      <span className={`badge mt-1 ${selectedPatient.status === 'active' ? 'badge-success' : 'badge-destructive'}`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Age:</span> {selectedPatient.profile?.age || 'N/A'}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Gender:</span> {selectedPatient.profile?.gender || 'N/A'}</p>
                        <p className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Contact:</span> {selectedPatient.profile?.contactNumber || 'N/A'}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Address:</span> {selectedPatient.profile?.address || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Account Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Member since:</span> {new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Last active:</span> {selectedPatient.lastActiveAt ? new Date(selectedPatient.lastActiveAt).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input
                        type="text"
                        className={`input ${formErrors.firstName ? 'border-red-500' : ''}`}
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                      {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="label">Last Name *</label>
                      <input
                        type="text"
                        className={`input ${formErrors.lastName ? 'border-red-500' : ''}`}
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                      {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className={`input ${formErrors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Age *</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className={`input ${formErrors.age ? 'border-red-500' : ''}`}
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      />
                      {formErrors.age && <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>}
                    </div>
                    <div>
                      <label className="label">Gender *</label>
                      <select
                        className={`input ${formErrors.gender ? 'border-red-500' : ''}`}
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Contact Number *</label>
                    <input
                      type="tel"
                      className={`input ${formErrors.contactNumber ? 'border-red-500' : ''}`}
                      value={formData.contactNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                      placeholder="10-digit phone number"
                    />
                    {formErrors.contactNumber && <p className="text-red-500 text-sm mt-1">{formErrors.contactNumber}</p>}
                  </div>

                  <div>
                    <label className="label">Address</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedPatient && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Patient</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The patient will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Patient:</strong> {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> {selectedPatient.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreatePatient}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Patient
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdatePatient}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Patient
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeletePatient}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Patient
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

export default PatientManagement;