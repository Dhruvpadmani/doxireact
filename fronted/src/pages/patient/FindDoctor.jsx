import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, MapPin, Clock, DollarSign, Users, Award, Phone, Video, User, ArrowLeft, Calendar } from 'lucide-react'
import { doctorsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const FindDoctor = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({})
  const [filterOptions, setFilterOptions] = useState({
    specializations: [],
    languages: [],
    consultationTypes: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load doctors and filter options
  useEffect(() => {
    loadDoctors()
    loadFilterOptions()
  }, [searchParams, filters])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const params = {
        ...searchParams,
        ...filters,
        search: searchTerm || undefined
      }
      
      const response = await doctorsAPI.search(params)
      setDoctors(response.data.doctors)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error loading doctors:', error)
      // Use mock data when API fails
      setDoctors([
        {
          id: '1',
          firstName: 'Dr. John',
          lastName: 'Smith',
          specialization: 'Cardiologist',
          rating: 4.8,
          experience: 15,
          location: 'New York',
          consultationFee: 150,
          languages: ['English', 'Spanish'],
          consultationTypes: ['in_person', 'video'],
          availability: 'Available today'
        },
        {
          id: '2',
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          specialization: 'Dermatologist',
          rating: 4.9,
          experience: 12,
          location: 'Los Angeles',
          consultationFee: 120,
          languages: ['English'],
          consultationTypes: ['in_person', 'video', 'phone'],
          availability: 'Available tomorrow'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      // Mock filter options
      setFilterOptions({
        specializations: ['Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician'],
        languages: ['English', 'Spanish', 'French'],
        consultationTypes: ['in_person', 'video', 'phone']
      })
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadDoctors()
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handlePageChange = (page) => {
    setSearchParams(prev => ({ ...prev, page }))
  }

  const getConsultationIcon = (type) => {
    switch (type) {
      case 'in_person': return <User className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
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

  const handleBookAppointment = (doctorId) => {
    // Navigate to book appointment page with doctor pre-selected
    window.location.href = `/patient/book-appointment?doctorId=${doctorId}`
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

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by specialization, name, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specialization
              </label>
              <select
                value={filters.specialization || ''}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Specializations</option>
                {filterOptions.specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Consultation Type
              </label>
              <select
                value={filters.consultationType || ''}
                onChange={(e) => handleFilterChange('consultationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="in_person">In-Person</option>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Languages</option>
                {filterOptions.languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Doctors List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {doctors.map((doctor) => (
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
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg ${
                      pagination.current === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FindDoctor