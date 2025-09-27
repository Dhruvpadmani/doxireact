import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  Filter,
  User,
  Clock,
  MapPin,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  Users,
  Eye,
  Plus,
  Save,
  Edit,
  Trash2,
  CheckCircle as CheckCircleIcon,
  Phone,
  Mail,
  Stethoscope,
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarX,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CalendarManagement = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete', 'availability'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    notes: '',
    maxAppointments: 1
  });
  const [formErrors, setFormErrors] = useState({});
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Functions
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll use localStorage data as fallback
      const registeredDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
      setDoctors(registeredDoctors);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      // Sample calendar events data
      const sampleEvents = [
        {
          id: '1',
          doctorId: '1',
          doctor: { profile: { firstName: 'Jane', lastName: 'Smith', specialization: 'Cardiology' } },
          date: selectedDate,
          startTime: '09:00',
          endTime: '10:00',
          isAvailable: true,
          notes: 'Regular consultation hours',
          maxAppointments: 1,
          currentAppointments: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          doctorId: '2',
          doctor: { profile: { firstName: 'Bob', lastName: 'Wilson', specialization: 'Dermatology' } },
          date: selectedDate,
          startTime: '10:30',
          endTime: '11:30',
          isAvailable: false,
          notes: 'Emergency consultation',
          maxAppointments: 1,
          currentAppointments: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setCalendarEvents(sampleEvents);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    }
  }, [selectedDate]);

  // useEffects
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.doctorId) errors.doctorId = 'Doctor is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
    if (formData.maxAppointments < 1) {
      errors.maxAppointments = 'Maximum appointments must be at least 1';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const newEvent = {
        id: Date.now().toString(),
        doctorId: formData.doctorId,
        doctor: selectedDoctor,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isAvailable: formData.isAvailable,
        notes: formData.notes,
        maxAppointments: formData.maxAppointments,
        currentAppointments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCalendarEvents(prev => [newEvent, ...prev]);
      setSuccess('Calendar event created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      setError('Failed to create calendar event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const updatedEvent = {
        ...selectedDoctor,
        doctorId: formData.doctorId,
        doctor: selectedDoctor,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isAvailable: formData.isAvailable,
        notes: formData.notes,
        maxAppointments: formData.maxAppointments,
        updatedAt: new Date().toISOString()
      };
      
      setCalendarEvents(prev => prev.map(e => 
        e.id === selectedDoctor.id ? updatedEvent : e
      ));
      setSuccess('Calendar event updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      setError('Failed to update calendar event');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setCalendarEvents(prev => prev.filter(e => e.id !== selectedDoctor.id));
      setSuccess('Calendar event deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      setError('Failed to delete calendar event');
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: '',
      date: selectedDate,
      startTime: '',
      endTime: '',
      isAvailable: true,
      notes: '',
      maxAppointments: 1
    });
    setFormErrors({});
    setSelectedDoctor(null);
  };

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.profile?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterSpecialization === 'all' || 
                         doctor.profile?.specialization === filterSpecialization;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(d => d.profile?.specialization))].filter(Boolean);

  // Modal handlers
  const handleViewAvailability = (doctor) => {
    setSelectedDoctor(doctor);
    const slots = generateTimeSlots(selectedDate);
    setTimeSlots(slots);
    setModalType('availability');
    setShowModal(true);
  };

  const handleViewEvent = (event) => {
    setSelectedDoctor(event);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedDoctor(event);
    setFormData({
      doctorId: event.doctorId,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      isAvailable: event.isAvailable,
      notes: event.notes,
      maxAppointments: event.maxAppointments
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteEventClick = (event) => {
    setSelectedDoctor(event);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateEventClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const generateTimeSlots = (date) => {
    // Generate sample time slots from 9 AM to 5 PM in 30 min intervals
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Check if this time slot has an event
        const hasEvent = calendarEvents.some(event => 
          event.date === date && 
          event.startTime <= timeString && 
          event.endTime > timeString
        );
        slots.push({
          time: timeString,
          available: !hasEvent
        });
      }
    }
    return slots;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Calendar Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Unified view of doctor availability and schedule management
          </p>
        </div>
        <button
          onClick={handleCreateEventClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Event
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
            placeholder="Search doctors by name or specialization..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="input"
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
          >
            <option value="all">All Specializations</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
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
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Verified Doctors</p>
              <p className="stat-value text-success-600">
                {doctors.filter(d => d.verificationStatus === 'verified').length}
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
              <p className="stat-label">Calendar Events</p>
              <p className="stat-value text-warning-600">
                {calendarEvents.filter(e => e.date === selectedDate).length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Available Slots</p>
              <p className="stat-value text-info-600">
                {calendarEvents.filter(e => e.date === selectedDate && e.isAvailable).length}
              </p>
            </div>
            <div className="bg-info-100 dark:bg-info-900 p-3 rounded-full">
              <CalendarCheck className="h-6 w-6 text-info-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Events Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Doctor</th>
              <th className="table-head">Date & Time</th>
              <th className="table-head">Duration</th>
              <th className="table-head">Status</th>
              <th className="table-head">Appointments</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {calendarEvents.filter(e => e.date === selectedDate).length > 0 ? (
              calendarEvents
                .filter(e => e.date === selectedDate)
                .map((event, index) => (
                <tr key={event.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {event.doctor?.profile?.firstName?.[0]}
                        {event.doctor?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dr. {event.doctor?.profile?.firstName} {event.doctor?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.doctor?.profile?.specialization}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white">
                    {(() => {
                      const start = new Date(`2000-01-01T${event.startTime}`);
                      const end = new Date(`2000-01-01T${event.endTime}`);
                      const diffMs = end - start;
                      const diffMins = Math.round(diffMs / 60000);
                      return `${diffMins} min`;
                    })()}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      event.isAvailable ? 'badge-success' : 'badge-destructive'
                    }`}>
                      {event.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {event.currentAppointments}/{event.maxAppointments}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="btn btn-ghost btn-sm"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEventClick(event)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Event"
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
                  No calendar events found for {new Date(selectedDate).toLocaleDateString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Doctor Availability Table */}
      <div className="dashboard-card overflow-x-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor Availability</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View doctor availability and schedule management</p>
        </div>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Doctor</th>
              <th className="table-head">Specialization</th>
              <th className="table-head">Availability</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, index) => (
                <tr key={doctor.id} className="table-row">
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
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {calendarEvents.some(e => e.doctorId === doctor.id && e.date === selectedDate && e.isAvailable)
                          ? 'Available' 
                          : 'Not available'}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewAvailability(doctor)}
                        className="btn btn-primary btn-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Schedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No doctors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for calendar events/availability */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Event Details'}
                  {modalType === 'create' && 'Create New Event'}
                  {modalType === 'edit' && 'Edit Event'}
                  {modalType === 'delete' && 'Delete Event'}
                  {modalType === 'availability' && `Availability for Dr. ${selectedDoctor?.profile?.firstName} ${selectedDoctor?.profile?.lastName}`}
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

              {modalType === 'view' && selectedDoctor && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedDoctor.doctor?.profile?.firstName?.[0]}
                        {selectedDoctor.doctor?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Dr. {selectedDoctor.doctor?.profile?.firstName} {selectedDoctor.doctor?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {selectedDoctor.doctor?.profile?.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        <CalendarIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(selectedDoctor.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedDoctor.startTime} - {selectedDoctor.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Event Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Duration:</span> 
                          {(() => {
                            const start = new Date(`2000-01-01T${selectedDoctor.startTime}`);
                            const end = new Date(`2000-01-01T${selectedDoctor.endTime}`);
                            const diffMs = end - start;
                            const diffMins = Math.round(diffMs / 60000);
                            return ` ${diffMins} minutes`;
                          })()}
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Status:</span> 
                          <span className={`badge ml-2 ${selectedDoctor.isAvailable ? 'badge-success' : 'badge-destructive'}`}>
                            {selectedDoctor.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Max Appointments:</span> {selectedDoctor.maxAppointments}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Current Appointments:</span> {selectedDoctor.currentAppointments}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Notes
                      </h5>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedDoctor.notes || 'No notes available'}
                        </p>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(selectedDoctor.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-gray-600 dark:text-gray-400">Last Updated:</span> {new Date(selectedDoctor.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="label">Date *</label>
                      <input
                        type="date"
                        className={`input ${formErrors.date ? 'border-red-500' : ''}`}
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                      {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Start Time *</label>
                      <input
                        type="time"
                        className={`input ${formErrors.startTime ? 'border-red-500' : ''}`}
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                      {formErrors.startTime && <p className="text-red-500 text-sm mt-1">{formErrors.startTime}</p>}
                    </div>
                    <div>
                      <label className="label">End Time *</label>
                      <input
                        type="time"
                        className={`input ${formErrors.endTime ? 'border-red-500' : ''}`}
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                      {formErrors.endTime && <p className="text-red-500 text-sm mt-1">{formErrors.endTime}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Maximum Appointments</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className={`input ${formErrors.maxAppointments ? 'border-red-500' : ''}`}
                        value={formData.maxAppointments}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAppointments: parseInt(e.target.value) }))}
                      />
                      {formErrors.maxAppointments && <p className="text-red-500 text-sm mt-1">{formErrors.maxAppointments}</p>}
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select
                        className="input"
                        value={formData.isAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes about this time slot..."
                    />
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedDoctor && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Event</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The calendar event will be permanently removed.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Doctor:</strong> Dr. {selectedDoctor.doctor?.profile?.firstName} {selectedDoctor.doctor?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Date:</strong> {new Date(selectedDoctor.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Time:</strong> {selectedDoctor.startTime} - {selectedDoctor.endTime}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Notes:</strong> {selectedDoctor.notes || 'No notes'}
                    </p>
                  </div>
                </div>
              )}

              {modalType === 'availability' && selectedDoctor && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Slots for {selectedDate}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {timeSlots.map((slot, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border text-center ${
                            slot.available 
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-200' 
                              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-200'
                          }`}
                        >
                          <div className="font-medium">{slot.time}</div>
                          <div className={`text-sm mt-1 ${slot.available ? 'text-green-600' : 'text-red-600'}`}>
                            {slot.available ? 'Available' : 'Booked'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legend</h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-500"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-red-500"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Booked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateEvent}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Event
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateEvent}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Event
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteEvent}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  {modalType === 'availability' ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagement;