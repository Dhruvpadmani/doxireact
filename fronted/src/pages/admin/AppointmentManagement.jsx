import { useState, useEffect } from 'react';
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
  CalendarCheck
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'status', 'resolve'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await adminAPI.getAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
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

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalType('view');
    setShowModal(true);
  };

  const handleUpdateStatus = (appointment) => {
    setSelectedAppointment(appointment);
    setModalType('status');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedAppointment || !modalType) return;

    try {
      if (modalType === 'status') {
        // Update appointment status
        await adminAPI.updateAppointmentStatus(selectedAppointment._id, {
          status: selectedAppointment.status === 'scheduled' ? 'completed' : 
                  selectedAppointment.status === 'completed' ? 'cancelled' : 'scheduled'
        });
        
        // Update local state
        setAppointments(prev => prev.map(a => 
          a._id === selectedAppointment._id 
            ? { ...a, status: selectedAppointment.status === 'scheduled' ? 'completed' : 
                              selectedAppointment.status === 'completed' ? 'cancelled' : 'scheduled' }
            : a
        ));
      }
      
      setShowModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to update appointment:', error);
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointment Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor all appointments, resolve disputes, handle cancellations/reschedules
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by patient or doctor name..."
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
            <option value="rescheduled">Rescheduled</option>
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
              <p className="stat-label">Total Appointments</p>
              <p className="stat-value text-primary-600">{appointments.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
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

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
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
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment)}
                        className="btn btn-outline btn-sm"
                      >
                        <Edit className="h-4 w-4" />
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' ? 'Appointment Details' : 
                   modalType === 'status' ? 'Update Appointment Status' : 
                   'Appointment Action'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedAppointment && (
                <div className="space-y-4">
                  {modalType === 'view' ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {selectedAppointment.patientId?.profile?.firstName?.[0]}
                              {selectedAppointment.patientId?.profile?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Patient: {selectedAppointment.patientId?.profile?.firstName} {selectedAppointment.patientId?.profile?.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedAppointment.patientId?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                              {selectedAppointment.doctorId?.profile?.firstName?.[0]}
                              {selectedAppointment.doctorId?.profile?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Doctor: Dr. {selectedAppointment.doctorId?.profile?.firstName} {selectedAppointment.doctorId?.profile?.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedAppointment.doctorId?.profile?.specialization}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Date</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {new Date(selectedAppointment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Time</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedAppointment.timeSlot}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Status</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className={`badge ${getStatusColor(selectedAppointment.status)}`}>
                              {selectedAppointment.status}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Created</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {new Date(selectedAppointment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : modalType === 'status' ? (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Update the appointment status. Current status: <strong>{selectedAppointment.status}</strong>
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="label">Patient</label>
                          <p className="text-gray-900 dark:text-white">
                            {selectedAppointment.patientId?.profile?.firstName} {selectedAppointment.patientId?.profile?.lastName}
                          </p>
                        </div>
                        <div className="flex-1">
                          <label className="label">Doctor</label>
                          <p className="text-gray-900 dark:text-white">
                            Dr. {selectedAppointment.doctorId?.profile?.firstName} {selectedAppointment.doctorId?.profile?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex-1">
                          <label className="label">Date</label>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(selectedAppointment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-1">
                          <label className="label">Time</label>
                          <p className="text-gray-900 dark:text-white">
                            {selectedAppointment.timeSlot}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'status' && (
                  <button
                    onClick={handleAction}
                    className="btn btn-primary"
                  >
                    Update Status
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