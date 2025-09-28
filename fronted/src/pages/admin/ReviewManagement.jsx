import React, {useCallback, useEffect, useState} from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle as CheckCircleIcon,
  Edit,
  Eye,
  Mail,
  MessageCircle,
  Plus,
  Save,
  Search,
  Star,
  Stethoscope,
  Trash2,
  X
} from 'lucide-react';
import {adminAPI} from '../../services/api';

const ReviewManagement = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete', 'approve'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    rating: 5,
    comment: '',
    status: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Functions
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
        // Use real API call to fetch reviews
        const response = await adminAPI.getReviews();
        if (response.data && response.data.reviews) {
            setReviews(response.data.reviews);
        } else {
            setReviews([]);
        }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setError('Failed to load reviews');
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load reviews. Please check your connection and try again.');
        });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientsAndDoctors = useCallback(async () => {
    try {
        // Fetch patients
        const patientsResponse = await adminAPI.getUsers({role: 'patient'});
        if (patientsResponse.data && patientsResponse.data.users) {
            setPatients(patientsResponse.data.users);
        }

        // Fetch doctors
        const doctorsResponse = await adminAPI.getDoctors();
        if (doctorsResponse.data && doctorsResponse.data.doctors) {
            setDoctors(doctorsResponse.data.doctors);
        }
    } catch (error) {
      console.error('Failed to fetch patients and doctors:', error);
        // Show user-friendly error message
        import('react-hot-toast').then((toast) => {
            toast.error('Failed to load patients and doctors. Please check your connection and try again.');
        });
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchReviews();
    fetchPatientsAndDoctors();
  }, [fetchReviews, fetchPatientsAndDoctors]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.doctorId) errors.doctorId = 'Doctor is required';
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    if (!formData.comment.trim()) errors.comment = 'Review comment is required';
    if (formData.comment.trim().length < 10) {
      errors.comment = 'Review comment must be at least 10 characters long';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateReview = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const newReview = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        rating: formData.rating,
        comment: formData.comment,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setReviews(prev => [newReview, ...prev]);
      setSuccess('Review created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create review:', error);
      setError('Failed to create review');
    }
  };

  const handleUpdateReview = async () => {
    if (!validateForm()) return;
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const updatedReview = {
        ...selectedReview,
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        rating: formData.rating,
        comment: formData.comment,
        status: formData.status,
        updatedAt: new Date().toISOString()
      };
      
      setReviews(prev => prev.map(r => 
        r.id === selectedReview.id ? updatedReview : r
      ));
      setSuccess('Review updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update review:', error);
      setError('Failed to update review');
    }
  };

  const handleDeleteReview = async () => {
    try {
      setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
      setSuccess('Review deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete review:', error);
      setError('Failed to delete review');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      rating: 5,
      comment: '',
      status: 'pending'
    });
    setFormErrors({});
    setSelectedReview(null);
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

  // Modal handlers
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setFormData({
      patientId: review.patientId?.id || '',
      doctorId: review.doctorId?.id || '',
      rating: review.rating || 5,
      comment: review.comment || '',
      status: review.status || 'pending'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteReviewClick = (review) => {
    setSelectedReview(review);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateReviewClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleApproveReview = async (review) => {
    try {
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, status: 'approved', updatedAt: new Date().toISOString() } : r
      ));
      setSuccess('Review approved successfully');
    } catch (error) {
      console.error('Failed to approve review:', error);
      setError('Failed to approve review');
    }
  };

  const handleRemoveReview = async (review) => {
    try {
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, status: 'removed', removedReason: 'Inappropriate content', updatedAt: new Date().toISOString() } : r
      ));
      setSuccess('Review removed successfully');
    } catch (error) {
      console.error('Failed to remove review:', error);
      setError('Failed to remove review');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Review Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Monitor abusive/fake feedback, remove inappropriate reviews
          </p>
        </div>
        <button
          onClick={handleCreateReviewClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Review
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
            placeholder="Search reviews by patient, doctor, or content..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Total Reviews</p>
              <p className="stat-value text-primary-600">{reviews.length}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="stat-label">Removed</p>
              <p className="stat-value text-error-600">
                {reviews.filter(r => r.status === 'removed').length}
              </p>
            </div>
            <div className="bg-error-100 dark:bg-error-900 p-3 rounded-full">
              <X className="h-6 w-6 text-error-600" />
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
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditReview(review)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Review"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {review.status === 'pending' && (
                        <button
                          onClick={() => handleApproveReview(review)}
                          className="btn btn-success btn-sm"
                          title="Approve Review"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {review.status === 'approved' && (
                        <button
                          onClick={() => handleRemoveReview(review)}
                          className="btn btn-destructive btn-sm"
                          title="Remove Review"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReviewClick(review)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Review"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Review Details'}
                  {modalType === 'create' && 'Create New Review'}
                  {modalType === 'edit' && 'Edit Review'}
                  {modalType === 'delete' && 'Delete Review'}
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

              {modalType === 'view' && selectedReview && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedReview.patientId?.profile?.firstName?.[0]}
                        {selectedReview.patientId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Patient</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedReview.patientId?.profile?.firstName} {selectedReview.patientId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedReview.patientId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        {selectedReview.doctorId?.profile?.firstName?.[0]}
                        {selectedReview.doctorId?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Dr. {selectedReview.doctorId?.profile?.firstName} {selectedReview.doctorId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {selectedReview.doctorId?.profile?.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Review Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Rating:</span> 
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-gray-600 dark:text-gray-400">({selectedReview.rating}/5)</span>
                          </div>
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Status:</span> 
                          <span className={`badge ml-2 ${getStatusColor(selectedReview.status)}`}>
                            {selectedReview.status}
                          </span>
                        </p>
                        {selectedReview.removedReason && (
                          <p><span className="text-gray-600 dark:text-gray-400">Removal Reason:</span> {selectedReview.removedReason}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Review Content
                      </h5>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          "{selectedReview.comment}"
                        </p>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(selectedReview.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-gray-600 dark:text-gray-400">Last Updated:</span> {new Date(selectedReview.updatedAt).toLocaleString()}
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
                      <label className="label">Patient *</label>
                      <select
                        className={`input ${formErrors.patientId ? 'border-red-500' : ''}`}
                        value={formData.patientId}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.profile?.firstName} {patient.profile?.lastName} ({patient.email})
                          </option>
                        ))}
                      </select>
                      {formErrors.patientId && <p className="text-red-500 text-sm mt-1">{formErrors.patientId}</p>}
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Rating *</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating }))}
                            className={`p-2 rounded-lg transition-colors ${
                              formData.rating >= rating
                                ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          >
                            <Star className={`h-6 w-6 ${formData.rating >= rating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-gray-600 dark:text-gray-400">({formData.rating}/5)</span>
                      </div>
                      {formErrors.rating && <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>}
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select
                        className="input"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="removed">Removed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Review Comment *</label>
                    <textarea
                      className={`input ${formErrors.comment ? 'border-red-500' : ''}`}
                      rows="4"
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with the doctor..."
                    />
                    {formErrors.comment && <p className="text-red-500 text-sm mt-1">{formErrors.comment}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum 10 characters required
                    </p>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedReview && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Review</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The review will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Patient:</strong> {selectedReview.patientId?.profile?.firstName} {selectedReview.patientId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Doctor:</strong> Dr. {selectedReview.doctorId?.profile?.firstName} {selectedReview.doctorId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Rating:</strong> {selectedReview.rating}/5 stars
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Comment:</strong> {selectedReview.comment.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateReview}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Review
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateReview}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Review
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteReview}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Review
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
};

export default ReviewManagement;