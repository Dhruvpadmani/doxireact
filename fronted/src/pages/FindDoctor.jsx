import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, MapPin, Clock, DollarSign, Users, Award, Phone, Video, User } from 'lucide-react'
import { doctorsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

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
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const response = await doctorsAPI.search({ limit: 1 })
      setFilterOptions(response.data.filters)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(prev => ({ ...prev, page: 1 }))
    loadDoctors()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
    setSearchParams(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (sortBy) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handlePageChange = (page) => {
    setSearchParams(prev => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSearchParams(prev => ({ ...prev, page: 1 }))
  }

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case 'in_person': return <User className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="mt-2 text-gray-600">Search and book appointments with verified doctors</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization || ''}
                    onChange={(e) => handleFilterChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Specializations</option>
                    {filterOptions.specializations?.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating || ''}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>
                </div>

                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Type
                  </label>
                  <select
                    value={filters.consultationType || ''}
                    onChange={(e) => handleFilterChange('consultationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="in_person">In-Person</option>
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={filters.language || ''}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Languages</option>
                    {filterOptions.languages?.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fee Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Fee (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minFee || ''}
                    onChange={(e) => handleFilterChange('minFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Fee (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxFee || ''}
                    onChange={(e) => handleFilterChange('maxFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: 'rating', label: 'Rating' },
                { key: 'fee', label: 'Fee' },
                { key: 'experience', label: 'Experience' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSortChange(option.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    searchParams.sortBy === option.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {searchParams.sortBy === option.key && (
                    <span className="ml-1">
                      {searchParams.sortOrder === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {pagination.total} doctors found
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Doctor Header */}
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {doctor.userId?.profile?.firstName} {doctor.userId?.profile?.lastName}
                  </h3>
                  <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                  <p className="text-sm text-gray-600">{doctor._id}</p>

                  {/* Doctor Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ₹{doctor.consultationFee} consultation fee
                    </div>
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">Languages:</span>
                        <span>{doctor.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Consultation Types */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.consultationTypes?.map((type, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                      >
                        {getConsultationTypeIcon(type.type)}
                        <span className="capitalize">{type.type.replace('_', ' ')}</span>
                        <span className="text-gray-500">₹{type.fee}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      View Profile
                    </button>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg ${
                      pagination.current === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FindDoctor

