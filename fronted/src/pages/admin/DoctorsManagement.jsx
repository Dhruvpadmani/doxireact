import { useState, useEffect } from 'react';
import { UserCheck, Eye, Edit, Trash2, Search, Filter, CheckCircle, XCircle } from 'lucide-react';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    // Filter doctors based on search term
    if (!searchTerm) {
      setFilteredDoctors(doctors);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = doctors.filter(doctor => 
        doctor.profile?.firstName?.toLowerCase().includes(term) ||
        doctor.profile?.lastName?.toLowerCase().includes(term) ||
        doctor.specialization?.toLowerCase().includes(term) ||
        doctor.profile?.email?.toLowerCase().includes(term)
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const loadDoctors = () => {
    try {
      const registeredDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
      setDoctors(registeredDoctors);
      setFilteredDoctors(registeredDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = (doctorId) => {
    const updatedDoctors = doctors.map(doctor => 
      doctor.id === doctorId 
        ? { ...doctor, isVerified: !doctor.isVerified } 
        : doctor
    );
    
    setDoctors(updatedDoctors);
    setFilteredDoctors(updatedDoctors);
    localStorage.setItem('registeredDoctors', JSON.stringify(updatedDoctors));
  };

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      const updatedDoctors = doctors.filter(doctor => doctor.id !== doctorId);
      setDoctors(updatedDoctors);
      setFilteredDoctors(updatedDoctors);
      localStorage.setItem('registeredDoctors', JSON.stringify(updatedDoctors));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctors Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage registered doctors and their verification status</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, specialization, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
          <div className="col-span-4">Doctor Name</div>
          <div className="col-span-2">Specialization</div>
          <div className="col-span-2">Experience</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Actions</div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No doctors found</h3>
            <p className="text-gray-500 dark:text-gray-400">No registered doctors match your search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doctor.profile?.firstName} {doctor.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doctor.profile?.email || 'No email'}
                    </p>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <p className="text-gray-900 dark:text-white">{doctor.specialization}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-gray-900 dark:text-white">{doctor.experience || 0} years</p>
                </div>
                
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doctor.isVerified 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {doctor.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    )}
                  </span>
                </div>
                
                <div className="col-span-2 flex items-center gap-2">
                  <button 
                    onClick={() => handleVerifyDoctor(doctor.id)}
                    className={`p-2 rounded-lg ${
                      doctor.isVerified 
                        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title={doctor.isVerified ? 'Unverify doctor' : 'Verify doctor'}
                  >
                    {doctor.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View details">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" 
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsManagement;