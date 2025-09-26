import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Star,
  Send,
  MessageCircle,
  Heart,
  Edit,
  Trash2,
  Clock,
  User,
  Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Reviews = () => {
  const [activeTab, setActiveTab] = useState('write') // 'write', 'my-reviews', 'recent'
  const [loading, setLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    doctorId: '',
    rating: 0,
    review: '',
    editingId: null
  })
  const [myReviews, setMyReviews] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [hoveredStar, setHoveredStar] = useState(0)
  const { user } = useAuth()

  // Load doctors from localStorage or API
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    loadMyReviews()
    loadRecentReviews()
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      console.log('Loading doctors...')
      
      // Demo doctors with same format as FindDoctor
      const demoDoctors = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          specialization: 'Cardiology',
          name: 'Dr. John Smith'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson', 
          specialization: 'Dermatology',
          name: 'Dr. Sarah Johnson'
        },
        {
          id: '3',
          firstName: 'Priya',
          lastName: 'Sharma',
          specialization: 'Pediatrics',
          name: 'Dr. Priya Sharma'
        },
        {
          id: '4',
          firstName: 'Laljee',
          lastName: 'Miyani',
          specialization: 'Neurologist',
          name: 'Dr. Laljee Miyani'
        },
        {
          id: '5',
          firstName: 'Michael',
          lastName: 'Brown',
          specialization: 'Orthopedics',
          name: 'Dr. Michael Brown'
        }
      ]
      
      // Load registered doctors saved during signup/login
      const savedDoctors = localStorage.getItem('registeredDoctors')
      let doctorsData = [...demoDoctors] // Start with demo doctors
      
      if (savedDoctors) {
        try {
          const raw = JSON.parse(savedDoctors) || []
          console.log('Found registered doctors:', raw)
          
          // Add registered doctors to the list
          const registeredDoctors = raw.map((d) => ({
            id: d.id || d._id || d.userId || `${d.firstName || ''}-${d.lastName || ''}`,
            firstName: d.firstName || d.name?.first || '',
            lastName: d.lastName || d.name?.last || '',
            specialization: d.specialization || d.profile?.specialization || 'General',
            name: `Dr. ${d.firstName || d.name?.first || ''} ${d.lastName || d.name?.last || ''}`.trim()
          }))
          
          // Combine registered and demo doctors
          doctorsData = [...registeredDoctors, ...demoDoctors]
        } catch (parseError) {
          console.error('Error parsing registered doctors:', parseError)
        }
      }
      
      console.log('Setting doctors:', doctorsData)
      setDoctors(doctorsData)
    } catch (error) {
      console.error('Error loading doctors:', error)
      // Fallback demo doctors
      const fallbackDoctors = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          specialization: 'Cardiology',
          name: 'Dr. John Smith'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'Dermatology', 
          name: 'Dr. Sarah Johnson'
        },
        {
          id: '3',
          firstName: 'Priya',
          lastName: 'Sharma',
          specialization: 'Pediatrics',
          name: 'Dr. Priya Sharma'
        },
        {
          id: '4',
          firstName: 'Laljee',
          lastName: 'Miyani',
          specialization: 'Neurologist',
          name: 'Dr. Laljee Miyani'
        }
      ]
      console.log('Using fallback doctors:', fallbackDoctors)
      setDoctors(fallbackDoctors)
    }
  }

  const loadMyReviews = async () => {
    try {
      // Load reviews from localStorage
      const savedReviews = localStorage.getItem('patientMyReviews')
      if (savedReviews) {
        const reviewsData = JSON.parse(savedReviews)
        setMyReviews(reviewsData)
      } else {
        setMyReviews([])
      }
    } catch (error) {
      console.error('Error loading my reviews:', error)
      setMyReviews([])
    }
  }

  const loadRecentReviews = async () => {
    try {
      // Load recent reviews from localStorage
      const savedRecentReviews = localStorage.getItem('patientRecentReviews')
      if (savedRecentReviews) {
        const recentReviewsData = JSON.parse(savedRecentReviews)
        setRecentReviews(recentReviewsData)
      } else {
        setRecentReviews([])
      }
    } catch (error) {
      console.error('Error loading recent reviews:', error)
      setRecentReviews([])
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.doctorId || reviewForm.rating === 0 || !reviewForm.review.trim()) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (reviewForm.editingId) {
        // Update existing review
        const updatedReviews = myReviews.map(review => 
          review.id === reviewForm.editingId 
            ? {
                ...review,
                doctorName: doctors.find(d => d.id === reviewForm.doctorId)?.name || 'Unknown Doctor',
                doctorSpecialization: doctors.find(d => d.id === reviewForm.doctorId)?.specialization || 'Unknown',
                rating: reviewForm.rating,
                review: reviewForm.review,
                submittedAt: new Date(), // Update submission time
                canEdit: true
              }
            : review
        )
        setMyReviews(updatedReviews)
        localStorage.setItem('patientMyReviews', JSON.stringify(updatedReviews))
        alert('Review updated successfully!')
      } else {
        // Create new review
        const newReview = {
          id: Date.now().toString(),
          doctorName: doctors.find(d => d.id === reviewForm.doctorId)?.name || 'Unknown Doctor',
          doctorSpecialization: doctors.find(d => d.id === reviewForm.doctorId)?.specialization || 'Unknown',
          rating: reviewForm.rating,
          review: reviewForm.review,
          submittedAt: new Date(),
          canEdit: true
        }
        
        const updatedReviews = [newReview, ...myReviews]
        setMyReviews(updatedReviews)
        localStorage.setItem('patientMyReviews', JSON.stringify(updatedReviews))
        alert('Review submitted successfully!')
      }
      
      // Reset form
      setReviewForm({ doctorId: '', rating: 0, review: '', editingId: null })
      setHoveredStar(0)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditReview = (reviewId) => {
    const review = myReviews.find(r => r.id === reviewId)
    if (review) {
      setReviewForm({
        doctorId: doctors.find(d => d.name === review.doctorName)?.id || '',
        rating: review.rating,
        review: review.review,
        editingId: reviewId // Add editing ID to track which review is being edited
      })
      setActiveTab('write')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const updatedReviews = myReviews.filter(r => r.id !== reviewId)
        setMyReviews(updatedReviews)
        localStorage.setItem('patientMyReviews', JSON.stringify(updatedReviews))
        alert('Review deleted successfully!')
      } catch (error) {
        console.error('Error deleting review:', error)
        alert('Failed to delete review. Please try again.')
      }
    }
  }

  const canEditReview = (submittedAt) => {
    const now = new Date()
    const reviewTime = new Date(submittedAt)
    const diffInMinutes = (now - reviewTime) / (1000 * 60)
    return diffInMinutes <= 30
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
            className={`w-6 h-6 ${
              interactive ? 'cursor-pointer' : 'cursor-default'
            }`}
            disabled={!interactive}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (interactive ? (hoveredStar || rating) : rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reviews & Ratings</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your experience and help others make informed decisions</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Write Review Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {reviewForm.editingId ? 'Edit Review' : 'Write a Review'}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {reviewForm.editingId ? 'Update your review' : 'Share your experience with a doctor'}
            </p>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Doctor ({doctors.length} available)
                </label>
                <select
                  value={reviewForm.doctorId}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id} className="text-gray-800">
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                {doctors.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">No doctors available. Please refresh the page.</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm(prev => ({ ...prev, rating }))
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Share your experience with this doctor..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {reviewForm.editingId ? 'Update Review' : 'Submit Review'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* My Reviews Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Reviews</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Reviews you've written</p>
            
            {myReviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                <p className="text-gray-500 dark:text-gray-400">You haven't written any reviews yet. Share your experience to help others!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myReviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{review.doctorName}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{review.doctorSpecialization}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {canEditReview(review.submittedAt) && (
                          <>
                            <button
                              onClick={() => handleEditReview(review.id)}
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                              title="Edit review"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                              title="Delete review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {!canEditReview(review.submittedAt) && (
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>Edit time expired</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{formatTimeAgo(review.submittedAt)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{review.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Reviews</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">What other patients are saying</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{review.doctorName}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.doctorSpecialization}</p>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{formatTimeAgo(review.submittedAt)}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{review.likes} likes</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{review.review}</p>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                  <User className="h-3 w-3" />
                  <span>{review.patientName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reviews
