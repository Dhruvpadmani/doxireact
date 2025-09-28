import React, {useCallback, useEffect, useState} from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Search,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserX,
  X as XIcon
} from 'lucide-react';
import {adminAPI} from '../../services/api';

const DoctorManagement = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete', 'approve', 'deactivate'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    experienceYears: '',
    bio: '',
    contactNumber: '',
    address: '',
    hospital: '',
    licenseNumber: '',
    status: 'active',
    verificationStatus: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});

  // Functions
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
        // Use real API call to fetch doctors
        const response = await adminAPI.getDoctors();
        if (response.data && response.data.doctors) {
            setDoctors(response.data.doctors);
        } else {
            setDoctors([]);
        }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setError('Failed to load doctors');
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load doctors. Please check your connection and try again.');
        });
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

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
    if (!formData.specialization.trim()) errors.specialization = 'Specialization is required';
    if (!formData.experienceYears || formData.experienceYears < 0 || formData.experienceYears > 50) {
      errors.experienceYears = 'Experience must be between 0 and 50 years';
    }
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      errors.contactNumber = 'Contact number must be 10 digits';
    }
    if (!formData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateDoctor = async () => {
    if (!validateForm()) return;
    
    try {
      const newDoctor = {
        id: Date.now().toString(),
        email: formData.email,
        role: 'doctor',
        status: formData.status,
        verificationStatus: formData.verificationStatus,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialization: formData.specialization,
          experienceYears: parseInt(formData.experienceYears),
          bio: formData.bio,
          contactNumber: formData.contactNumber,
          address: formData.address,
          hospital: formData.hospital,
          licenseNumber: formData.licenseNumber
        },
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      
      setDoctors(prev => [newDoctor, ...prev]);
      setSuccess('Doctor created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create doctor:', error);
      setError('Failed to create doctor');
    }
  };

  const handleUpdateDoctor = async () => {
    if (!validateForm()) return;
    
    try {
      const updatedDoctor = {
        ...selectedDoctor,
        email: formData.email,
        status: formData.status,
        verificationStatus: formData.verificationStatus,
        profile: {
          ...selectedDoctor.profile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialization: formData.specialization,
          experienceYears: parseInt(formData.experienceYears),
          bio: formData.bio,
          contactNumber: formData.contactNumber,
          address: formData.address,
          hospital: formData.hospital,
          licenseNumber: formData.licenseNumber
        }
      };
      
      setDoctors(prev => prev.map(d => 
        d.id === selectedDoctor.id ? updatedDoctor : d
      ));
      setSuccess('Doctor updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update doctor:', error);
      setError('Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      setDoctors(prev => prev.filter(d => d.id !== selectedDoctor.id));
      setSuccess('Doctor deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      setError('Failed to delete doctor');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      specialization: '',
      experienceYears: '',
      bio: '',
      contactNumber: '',
      address: '',
      hospital: '',
      licenseNumber: '',
      status: 'active',
      verificationStatus: 'pending'
    });
    setFormErrors({});
    setSelectedDoctor(null);
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

  // Modal handlers
  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      firstName: doctor.profile?.firstName || '',
      lastName: doctor.profile?.lastName || '',
      email: doctor.email || '',
      specialization: doctor.profile?.specialization || '',
      experienceYears: doctor.profile?.experienceYears || '',
      bio: doctor.profile?.bio || '',
      contactNumber: doctor.profile?.contactNumber || '',
      address: doctor.profile?.address || '',
      hospital: doctor.profile?.hospital || '',
      licenseNumber: doctor.profile?.licenseNumber || '',
      status: doctor.status || 'active',
      verificationStatus: doctor.verificationStatus || 'pending'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateDoctorClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleApproveDoctor = async (doctor) => {
    try {
      setDoctors(prev => prev.map(d => 
        d.id === doctor.id 
          ? { ...d, verificationStatus: 'verified', approvedAt: new Date().toISOString() }
          : d
      ));
      setSuccess('Doctor approved successfully');
    } catch (error) {
      console.error('Failed to approve doctor:', error);
      setError('Failed to approve doctor');
    }
  };

  const handleToggleStatus = async (doctor) => {
    try {
      const newStatus = doctor.status === 'active' ? 'deactivated' : 'active';
      setDoctors(prev => prev.map(d => 
        d.id === doctor.id ? { ...d, status: newStatus } : d
      ));
      setSuccess(`Doctor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to update doctor status:', error);
      setError('Failed to update doctor status');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Verify doctors, approve/reject registrations, manage availability
          </p>
        </div>
        <button
          onClick={handleCreateDoctorClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Doctor
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
            <XIcon className="h-4 w-4" />
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
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search doctors by name, email, or specialization..."
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
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Doctors</p>
              <p className="stat-value text-primary-600">{doctors.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Doctor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {doctor.verificationStatus === 'pending' && (
                        <button
                          onClick={() => handleApproveDoctor(doctor)}
                          className="btn btn-success btn-sm"
                          title="Approve Doctor"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(doctor)}
                        className={`btn btn-sm ${doctor.status === 'active' ? 'btn-destructive' : 'btn-success'}`}
                        title={doctor.status === 'active' ? 'Deactivate Doctor' : 'Activate Doctor'}
                      >
                        {doctor.status === 'active' ? <UserX className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteDoctorClick(doctor)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Doctor"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Doctor Details'}
                  {modalType === 'create' && 'Add New Doctor'}
                  {modalType === 'edit' && 'Edit Doctor'}
                  {modalType === 'delete' && 'Delete Doctor'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {modalType === 'view' && selectedDoctor && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                      {selectedDoctor.profile?.firstName?.[0]}
                      {selectedDoctor.profile?.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Dr. {selectedDoctor.profile?.firstName} {selectedDoctor.profile?.lastName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedDoctor.email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`badge ${selectedDoctor.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                          {selectedDoctor.verificationStatus}
                        </span>
                        <span className={`badge ${selectedDoctor.status === 'active' ? 'badge-success' : 'badge-destructive'}`}>
                          {selectedDoctor.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Professional Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Specialization:</span> {selectedDoctor.profile?.specialization}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Experience:</span> {selectedDoctor.profile?.experienceYears} years</p>
                        <p><span className="text-gray-600 dark:text-gray-400">License:</span> {selectedDoctor.profile?.licenseNumber}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Hospital:</span> {selectedDoctor.profile?.hospital || 'N/A'}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Bio:</span> {selectedDoctor.profile?.bio || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Information
                      </h5>
                      <div className="space-y-2">
                        <p className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Contact:</span> {selectedDoctor.profile?.contactNumber || 'N/A'}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Address:</span> {selectedDoctor.profile?.address || 'N/A'}
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Member since:</span> {new Date(selectedDoctor.createdAt).toLocaleDateString()}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Last active:</span> {selectedDoctor.lastActiveAt ? new Date(selectedDoctor.lastActiveAt).toLocaleDateString() : 'Never'}</p>
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
                      <label className="label">Specialization *</label>
                      <select
                        className={`input ${formErrors.specialization ? 'border-red-500' : ''}`}
                        value={formData.specialization}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      >
                        <option value="">Select Specialization</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Emergency Medicine">Emergency Medicine</option>
                      </select>
                      {formErrors.specialization && <p className="text-red-500 text-sm mt-1">{formErrors.specialization}</p>}
                    </div>
                    <div>
                      <label className="label">Experience (Years) *</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        className={`input ${formErrors.experienceYears ? 'border-red-500' : ''}`}
                        value={formData.experienceYears}
                        onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                      />
                      {formErrors.experienceYears && <p className="text-red-500 text-sm mt-1">{formErrors.experienceYears}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">License Number *</label>
                    <input
                      type="text"
                      className={`input ${formErrors.licenseNumber ? 'border-red-500' : ''}`}
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="Medical license number"
                    />
                    {formErrors.licenseNumber && <p className="text-red-500 text-sm mt-1">{formErrors.licenseNumber}</p>}
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
                    <label className="label">Hospital/Clinic</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.hospital}
                      onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                      placeholder="Hospital or clinic name"
                    />
                  </div>

                  <div>
                    <label className="label">Address</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label className="label">Bio</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Professional bio and background"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Status</label>
                      <select
                        className="input"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="active">Active</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Verification Status</label>
                      <select
                        className="input"
                        value={formData.verificationStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, verificationStatus: e.target.value }))}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                      </select>
                    </div>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedDoctor && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Doctor</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The doctor will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateDoctor}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Doctor
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateDoctor}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Doctor
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteDoctor}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Doctor
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

export default DoctorManagement;