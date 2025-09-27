import { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  User,
  MessageCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'approve', 'remove'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await adminAPI.getReviews();
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Set empty array in case of error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews based on search term and status
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.patientId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.patientId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.doctorId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.doctorId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'approved' && review.status === 'approved') ||
                         (filterStatus === 'pending' && review.status === 'pending') ||
                         (filterStatus === 'removed' && review.status === 'removed');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setModalType('view');
    setShowModal(true);
  };

  const handleApproveReview = (review) => {
    setSelectedReview(review);
    setModalType('approve');
    setShowModal(true);
  };

  const handleRemoveReview = (review) => {
    setSelectedReview(review);
    setModalType('remove');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedReview || !modalType) return;

    try {
      if (modalType === 'approve') {
        // Approve review
        await adminAPI.updateReviewStatus(selectedReview._id, {
          status: 'approved'
        });
        
        // Update local state
        setReviews(prev => prev.map(r => 
          r._id === selectedReview._id 
            ? { ...r, status: 'approved' }
            : r
        ));
      } else if (modalType === 'remove') {
        // Remove review
        await adminAPI.updateReviewStatus(selectedReview._id, {
          status: 'removed',
          removedReason: 'Inappropriate content'
        });
        
        // Update local state
        setReviews(prev => prev.map(r => 
          r._id === selectedReview._id 
            ? { ...r, status: 'removed', removedReason: 'Inappropriate content' }
            : r
        ));
      }
      
      setShowModal(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'removed': return 'badge-destructive';
      default: return 'badge-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'pending': return <MessageCircle className="h-4 w-4" />;
      case 'removed': return <X className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor abusive/fake feedback, remove inappropriate reviews
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search reviews by patient, doctor, or content..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
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
              <p className="stat-label">Total Reviews</p>
              <p className="stat-value text-primary-600">{reviews.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Approved</p>
              <p className="stat-value text-success-600">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <Check className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pending</p>
              <p className="stat-value text-warning-600">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Review Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Patient</th>
              <th className="table-head">Doctor</th>
              <th className="table-head">Rating</th>
              <th className="table-head">Review</th>
              <th className="table-head">Status</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentReviews.length > 0 ? (
              currentReviews.map((review, index) => (
                <tr key={review._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {review.patientId?.profile?.firstName?.[0]}
                        {review.patientId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.patientId?.profile?.firstName} {review.patientId?.profile?.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {review.doctorId?.profile?.firstName?.[0]}
                        {review.doctorId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dr. {review.doctorId?.profile?.firstName} {review.doctorId?.profile?.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-gray-900 dark:text-white">({review.rating})</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 dark:text-white max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(review.status)}
                      <span className={`badge ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReview(review)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveReview(review)}
                            className="btn btn-success btn-sm"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveReview(review)}
                            className="btn btn-destructive btn-sm"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {review.status !== 'pending' && (
                        <button
                          onClick={() => handleRemoveReview(review)}
                          className="btn btn-outline btn-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} reviews
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

      {/* Modal for review details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' ? 'Review Details' : 
                   modalType === 'approve' ? 'Approve Review' : 
                   'Remove Review'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedReview && (
                <div className="space-y-4">
                  {modalType === 'view' ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Review Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Patient</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {selectedReview.patientId?.profile?.firstName} {selectedReview.patientId?.profile?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Doctor</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Dr. {selectedReview.doctorId?.profile?.firstName} {selectedReview.doctorId?.profile?.lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-medium text-gray-900 dark:text-white">Rating</p>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-gray-900 dark:text-white">({selectedReview.rating}/5)</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Review</p>
                        <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          "{selectedReview.comment}"
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <p className="font-medium text-gray-900 dark:text-white">Status</p>
                        <span className={`badge ${getStatusColor(selectedReview.status)}`}>
                          {selectedReview.status}
                        </span>
                      </div>
                    </div>
                  ) : modalType === 'approve' ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-gray-700 dark:text-gray-300">
                          Approve this review? It will be visible to other users.
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="font-medium text-gray-900 dark:text-white">Review</p>
                        <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          "{selectedReview.comment}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Rating</p>
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <p className="text-gray-700 dark:text-gray-300">
                          Remove this review? This action cannot be undone.
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="font-medium text-gray-900 dark:text-white">Review</p>
                        <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          "{selectedReview.comment}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Rating</p>
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'approve' && (
                  <button
                    onClick={handleAction}
                    className="btn btn-success"
                  >
                    Approve Review
                  </button>
                )}
                {modalType === 'remove' && (
                  <button
                    onClick={handleAction}
                    className="btn btn-destructive"
                  >
                    Remove Review
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