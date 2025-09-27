import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, MapPin, Clock, DollarSign, Phone, Video, User, ArrowLeft } from 'lucide-react'
import { doctorsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const FindDoctorNew = () => {
  const [doctors, setDoctors] = useState([])
  const [allDoctors, setAllDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 20,
    sortBy: 'rating',
    sortOrder: 'desc'
  })

  useEffect(() => {
    loadDoctors()
  }, [searchParams])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      // First try to load from localStorage (registered doctors)
      const registeredDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
      console.log('Found registered doctors:', registeredDoctors);
      
      if (registeredDoctors.length > 0) {
        const formattedDoctors = registeredDoctors.map(doctor => ({
          id: doctor.id,
          firstName: doctor.profile?.firstName || 'Unknown',
          lastName: doctor.profile?.lastName || 'Doctor',
          specialization: doctor.specialization || 'General Medicine',
          rating: doctor.rating?.average || 0,
          experience: doctor.experience || 0,
          consultationFee: doctor.consultationFee || 0,
          location: doctor.profile?.location || 'Not specified',
          availability: 'Available Today',
          consultationTypes: doctor.profile?.consultationTypes || ['in_person'], 
          languages: doctor.languages || ['English'],
          _id: doctor.id,
          bio: doctor.bio || '',
          licenseNumber: doctor.licenseNumber || '',
          isVerified: doctor.isVerified || false
        }));
        
        console.log('Formatted doctors:', formattedDoctors);
        setAllDoctors(formattedDoctors)
        setDoctors(formattedDoctors)
      } else {
        // If no registered doctors, try API
        const params = {
          ...searchParams,
          q: searchTerm || undefined
        }
        
        const response = await doctorsAPI.search(params)
        setAllDoctors(response.data.doctors || [])
        setDoctors(response.data.doctors || [])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      // If both localStorage and API fail, show empty state
      setAllDoctors([])
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  const getConsultationIcon = (type) => {
    switch (type) {
      case 'in_person': return <User className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length > 0) {
      const filtered = allDoctors.filter(doctor => 
        doctor.firstName.toLowerCase().includes(value.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(value.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(value.toLowerCase()) ||
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredDoctors(filtered)
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
      setFilteredDoctors([])
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.length > 0) {
      const filtered = allDoctors.filter(doctor => 
        doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setDoctors(filtered)
    } else {
      setDoctors(allDoctors)
    }
    setShowDropdown(false)
  }

  const selectDoctor = (doctor) => {
    setSearchTerm(`${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`)
    setShowDropdown(false)
    // Filter to show only the selected doctor
    setDoctors([doctor])
  }

  const handleBookAppointment = (doctorId) => {
    window.location.href = `/patient/book-appointment?doctorId=${doctorId}`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading doctors...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/patient"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find a Doctor</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Search and book appointments with verified doctors</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by specialization, name, or keywords..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            
            {/* Dropdown List */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => selectDoctor(doctor)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : searchTerm.length > 0 ? (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    No doctors found matching "{searchTerm}"
                  </div>
                ) : (
                  allDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => selectDoctor(doctor)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Search
          </button>
        </form>
      </div>


      {/* Doctors List */}
      <div className="space-y-6">
        {doctors.length > 0 ? doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(doctor.rating)}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        ({doctor.rating})
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">
                    {doctor.specialization}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {doctor.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {doctor.experience} years experience
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${doctor.consultationFee}/consultation
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {doctor.availability}
                    </span>
                    <div className="flex items-center space-x-2">
                      {doctor.consultationTypes.map((type, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          {getConsultationIcon(type)}
                          <span className="ml-1 capitalize">{type.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Languages:</span>
                    {doctor.languages.map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleBookAppointment(doctor.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Book Appointment
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No doctors found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No registered doctors available. Please register as a doctor first.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FindDoctorNew
