import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Stethoscope,
  MessageCircle,
  CalendarX,
  CalendarCheck,
  Plus,
  Save,
  AlertCircle,
  CheckCircle as CheckCircleIcon,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AppointmentManagement = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete', 'status'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: '',
    notes: '',
    status: 'scheduled'
  });
  const [formErrors, setFormErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Functions
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll use localStorage data as fallback
      const patientAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientsAndDoctors = useCallback(async () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('demoAccounts') || '[]');
      const registeredDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
      setPatients(registeredUsers.filter(user => user.role === 'patient'));
      setDoctors(registeredDoctors);
    } catch (error) {
      console.error('Failed to fetch patients and doctors:', error);
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
  }, [fetchAppointments, fetchPatientsAndDoctors]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.doctorId) errors.doctorId = 'Doctor is required';
    if (!formData.date) {
      errors.date = 'Date is required';
    } else if (new Date(formData.date) < new Date()) {
      errors.date = 'Date cannot be in the past';
    }
    if (!formData.timeSlot) errors.timeSlot = 'Time slot is required';
    if (!formData.reason.trim()) errors.reason = 'Reason is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateAppointment = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const newAppointment = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        date: formData.date,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        notes: formData.notes,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAppointments(prev => [newAppointment, ...prev]);
      setSuccess('Appointment created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setError('Failed to create appointment');
    }
  };

  const handleUpdateAppointment = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const updatedAppointment = {
        ...selectedAppointment,
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        date: formData.date,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        notes: formData.notes,
        status: formData.status,
        updatedAt: new Date().toISOString()
      };
      
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppointment.id ? updatedAppointment : a
      ));
      setSuccess('Appointment updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      setError('Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
      setSuccess('Appointment deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      setError('Failed to delete appointment');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      timeSlot: '',
      reason: '',
      notes: '',
      status: 'scheduled'
    });
    setFormErrors({});
    setSelectedAppointment(null);
  };

  // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  // Modal handlers
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId?.id || '',
      doctorId: appointment.doctorId?.id || '',
      date: appointment.date || '',
      timeSlot: appointment.timeSlot || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateAppointmentClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleUpdateStatus = async (appointment, newStatus) => {
    try {
      setAppointments(prev => prev.map(a => 
        a.id === appointment.id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a
      ));
      setSuccess(`Appointment ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      setError('Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-destructive';
      case 'pending': return 'badge-secondary';
      case 'rescheduled': return 'badge-outline';
      default: return 'badge-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rescheduled': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Appointment Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Monitor all appointments, resolve disputes, handle cancellations/reschedules
          </p>
        </div>
        <button
          onClick={handleCreateAppointmentClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </button>
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
            placeholder="Search by patient or doctor name..."
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Appointments</p>
              <p className="stat-value text-primary-600">{appointments.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Scheduled</p>
              <p className="stat-value text-warning-600">
                {appointments.filter(a => a.status === 'scheduled').length}
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
              <p className="stat-label">Completed</p>
              <p className="stat-value text-success-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Cancelled</p>
              <p className="stat-value text-error-600">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Patient</th>
              <th className="table-head">Doctor</th>
              <th className="table-head">Date & Time</th>
              <th className="table-head">Status</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appointment, index) => (
                <tr key={appointment._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {appointment.patientId?.profile?.firstName?.[0]}
                        {appointment.patientId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {appointment.patientId?.profile?.firstName} {appointment.patientId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.patientId?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {appointment.doctorId?.profile?.firstName?.[0]}
                        {appointment.doctorId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dr. {appointment.doctorId?.profile?.firstName} {appointment.doctorId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.doctorId?.profile?.specialization}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(appointment.status)}
                      <span className={`badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="btn btn-ghost btn-sm"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Appointment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment, 'completed')}
                          className="btn btn-success btn-sm"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment, 'cancelled')}
                          className="btn btn-destructive btn-sm"
                          title="Cancel Appointment"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAppointmentClick(appointment)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Appointment"
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
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstAppointment + 1} to {Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} appointments
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

      {/* Modal for appointment details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Appointment Details'}
                  {modalType === 'create' && 'Schedule New Appointment'}
                  {modalType === 'edit' && 'Edit Appointment'}
                  {modalType === 'delete' && 'Delete Appointment'}
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

              {modalType === 'view' && selectedAppointment && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedAppointment.patientId?.profile?.firstName?.[0]}
                        {selectedAppointment.patientId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Patient</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.patientId?.profile?.firstName} {selectedAppointment.patientId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedAppointment.patientId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedAppointment.doctorId?.profile?.firstName?.[0]}
                        {selectedAppointment.doctorId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Dr. {selectedAppointment.doctorId?.profile?.firstName} {selectedAppointment.doctorId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {selectedAppointment.doctorId?.profile?.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Appointment Details
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Date:</span> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Time:</span> {selectedAppointment.timeSlot}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Status:</span> 
                          <span className={`badge ml-2 ${getStatusColor(selectedAppointment.status)}`}>
                            {selectedAppointment.status}
                          </span>
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Reason:</span> {selectedAppointment.reason}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Additional Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Notes:</span> {selectedAppointment.notes || 'No notes'}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Last Updated:</span> {new Date(selectedAppointment.updatedAt).toLocaleString()}</p>
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
                      <label className="label">Date *</label>
                      <input
                        type="date"
                        className={`input ${formErrors.date ? 'border-red-500' : ''}`}
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                    </div>
                    <div>
                      <label className="label">Time Slot *</label>
                      <select
                        className={`input ${formErrors.timeSlot ? 'border-red-500' : ''}`}
                        value={formData.timeSlot}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                      >
                        <option value="">Select Time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                      </select>
                      {formErrors.timeSlot && <p className="text-red-500 text-sm mt-1">{formErrors.timeSlot}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Reason for Visit *</label>
                    <input
                      type="text"
                      className={`input ${formErrors.reason ? 'border-red-500' : ''}`}
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Brief description of the appointment reason"
                    />
                    {formErrors.reason && <p className="text-red-500 text-sm mt-1">{formErrors.reason}</p>}
                  </div>

                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or special instructions"
                    />
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedAppointment && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Appointment</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The appointment will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Patient:</strong> {selectedAppointment.patientId?.profile?.firstName} {selectedAppointment.patientId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Doctor:</strong> Dr. {selectedAppointment.doctorId?.profile?.firstName} {selectedAppointment.doctorId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.timeSlot}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Reason:</strong> {selectedAppointment.reason}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateAppointment}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Schedule Appointment
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateAppointment}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Appointment
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteAppointment}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Appointment
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

export default AppointmentManagement;