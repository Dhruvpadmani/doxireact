import { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CalendarManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await adminAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      // Set empty array in case of error
      setDoctors([]);
    } finally {
      setLoading(false);
    }
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

  const handleViewAvailability = (doctor) => {
    setSelectedDoctor(doctor);
    // Generate sample time slots for the selected doctor
    const slots = generateTimeSlots(selectedDate);
    setTimeSlots(slots);
    setShowModal(true);
  };

  const generateTimeSlots = (date) => {
    // Generate sample time slots from 9 AM to 5 PM in 30 min intervals
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Randomly assign availability for demo purposes
        const isAvailable = Math.random() > 0.3;
        slots.push({
          time: timeString,
          available: isAvailable
        });
      }
    }
    return slots;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Unified view of doctor availability
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Doctors</p>
              <p className="stat-value text-primary-600">{doctors.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
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

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Today</p>
              <p className="stat-value text-warning-600">
                {doctors.filter(d => d.status === 'active' && d.availability && d.availability.some(a => a.date === selectedDate && a.isAvailable)).length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Calendar Table */}
      <div className="dashboard-card overflow-x-auto">
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
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {doctor.availability && doctor.availability.some(a => a.date === selectedDate && a.isAvailable) 
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
                        View
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

      {/* Modal for doctor availability details */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Availability for Dr. {selectedDoctor.profile?.firstName} {selectedDoctor.profile?.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedDate}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Slots</h4>
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