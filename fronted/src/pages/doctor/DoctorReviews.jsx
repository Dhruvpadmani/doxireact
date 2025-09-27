import { useState, useEffect } from 'react'
import { 
  Star, 
  User, 
  Calendar, 
  MessageCircle,
  Search,
  Filter,
  Eye,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

// No demo data - using real API data only

export default function DoctorReviews() {
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReview, setSelectedReview] = useState(null)
  const [showReviewDetails, setShowReviewDetails] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchTerm, ratingFilter, statusFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      // Fetch real patient reviews from API only
      const response = await doctorAPI.getReviews()
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews)
      } else {
        // No fallback - show empty state
        setReviews([])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      // No fallback - show empty state
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const filterReviews = () => {
    let filtered = reviews

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter))
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter)
    }

    setFilteredReviews(filtered)
  }

  const handleViewReview = (review) => {
    setSelectedReview(review)
    setShowReviewDetails(true)
  }

  const handleRespondToReview = (review) => {
    setSelectedReview(review)
    setResponseText(review.response || '')
    setShowResponseForm(true)
  }

  const handleSubmitResponse = async () => {
    try {
      // Call real API to respond to review
      const response = await doctorAPI.respondToReview(selectedReview.id, responseText)
      
      if (response.data) {
        // Update local state with the response
        const updatedReviews = reviews.map(review => 
          review.id === selectedReview.id 
            ? { ...review, response: responseText }
            : review
        )
        
        setReviews(updatedReviews)
        setShowResponseForm(false)
        setResponseText('')
        alert('Response submitted successfully!')
      }
    } catch (error) {
      console.error('Failed to submit response:', error)
      alert('Failed to submit response. Please try again.')
    }
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400'
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'moderated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'hidden': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View and respond to patient feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageRating}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">5-Star Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviews.filter(r => r.rating === 5).length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Response</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviews.filter(r => !r.response).length}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by patient name, title, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="moderated">Moderated</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {review.patientName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {review.patientEmail} • {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                      {review.isVerified && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {getRatingStars(review.rating)}
                      </div>
                      <span className={`text-lg font-semibold ${getRatingColor(review.rating)}`}>
                        {review.rating}/5
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {review.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {review.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.helpful} helpful</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Appointment: {review.appointmentId}
                    </div>
                  </div>

                  {review.response && (
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Your Response</span>
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">{review.response}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewReview(review)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  
                  {!review.response && (
                    <button
                      onClick={() => handleRespondToReview(review)}
                      className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors border border-green-200 dark:border-green-700"
                    >
                      <Reply className="h-4 w-4" />
                      Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {showReviewDetails && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Review Details
                </h2>
                <button
                  onClick={() => setShowReviewDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Patient Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReview.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReview.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedReview.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Appointment ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReview.appointmentId}</p>
                    </div>
                  </div>
                </div>

                {/* Review Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {getRatingStars(selectedReview.rating)}
                        </div>
                        <span className={`text-lg font-semibold ${getRatingColor(selectedReview.rating)}`}>
                          {selectedReview.rating}/5
                        </span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {selectedReview.title}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedReview.comment}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{selectedReview.helpful} helpful</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                        {selectedReview.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Response */}
                {selectedReview.response && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Response</h3>
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-300">{selectedReview.response}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Form Modal */}
      {showResponseForm && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Respond to Review
                </h2>
                <button
                  onClick={() => setShowResponseForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Review by {selectedReview.patientName}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {getRatingStars(selectedReview.rating)}
                    </div>
                    <span className={`text-lg font-semibold ${getRatingColor(selectedReview.rating)}`}>
                      {selectedReview.rating}/5
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedReview.comment}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response to this review..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowResponseForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
