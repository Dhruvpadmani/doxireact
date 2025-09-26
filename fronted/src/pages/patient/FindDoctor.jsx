import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, MapPin, Clock, DollarSign, Users, Award, Phone, Video, User, ArrowLeft, Calendar } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

const FindDoctor = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      // First try to load from localStorage
      const savedDoctors = localStorage.getItem('registeredDoctors')
      if (savedDoctors) {
        const doctorsData = JSON.parse(savedDoctors)
        setDoctors(doctorsData || [])
        setLoading(false)
        return
      }
      
      // If no localStorage data, show demo doctors
      const demoDoctors = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          specialization: 'Cardiology',
          rating: 4.8,
          experience: 10,
          consultationFee: 150,
          location: 'New York',
          availability: 'Available Today',
          consultationTypes: ['in_person', 'video'],
          languages: ['English', 'Spanish']
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'Dermatology',
          rating: 4.9,
          experience: 8,
          consultationFee: 120,
          location: 'Los Angeles',
          availability: 'Available Tomorrow',
          consultationTypes: ['video', 'phone'],
          languages: ['English', 'French']
        },
        {
          id: '3',
          firstName: 'Priya',
          lastName: 'Sharma',
          specialization: 'Pediatrics',
          rating: 4.7,
          experience: 12,
          consultationFee: 100,
          location: 'Chicago',
          availability: 'Available Today',
          consultationTypes: ['in_person', 'video', 'phone'],
          languages: ['English', 'Hindi']
        }
      ]
      setDoctors(demoDoctors)
    } catch (error) {
      console.error('Error loading doctors:', error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadDoctors()
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

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
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
        </form>
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
        </div>
      )}
    </div>
  )
}

export default FindDoctor