import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('🌐 API Configuration:', {
  API_BASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL
})

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // This enables cookies to be sent with requests
})

// Request interceptor - no need to manually add token since withCredentials is true
api.interceptors.request.use(
  (config) => {
    // Since withCredentials is true, the token cookie will be automatically included
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Request interceptor to log API calls
api.interceptors.request.use(
  (config) => {
    console.log(`%c➡️ ${config.method?.toUpperCase()} ${config.url}`, 'color: #008800; font-weight: bold;');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response) => {
    console.log(`%c✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`, 'color: #000088; font-weight: bold;');
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.log(`%c❌ ${error.config.method?.toUpperCase()} ${error.config.url} - ${error.response.status}`, 'color: #880000; font-weight: bold;');
    } else if (error.request) {
      // Request was made but no response received
      console.log(`%c📡 ${error.config.method?.toUpperCase()} ${error.config.url} - NO RESPONSE`, 'color: #884400; font-weight: bold;');
    } else {
      // Something else happened
      console.log(`%c💥 API SETUP ERROR - ${error.message}`, 'color: #880088; font-weight: bold;');
    }
    
    if (error.response?.status === 401) {
      // Only redirect if not already on login page to prevent infinite loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword }),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, isActive) => 
    api.put(`/admin/users/${id}/status`, { isActive }),
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  verifyDoctor: (id, isVerified) => 
    api.put(`/admin/doctors/${id}/verify`, { isVerified }),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  cancelAppointment: (id, reason) => 
    api.put(`/admin/appointments/${id}/cancel`, { reason }),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, status, reason) => 
    api.put(`/admin/reviews/${id}/moderate`, { status, reason }),
  getEmergencyRequests: (params) => api.get('/admin/emergency-requests', { params }),
  getLogs: (params) => api.get('/admin/logs', { params }),
}

// Doctor API
export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (profileData) => api.put('/doctor/profile', profileData),
  getDashboard: () => api.get('/doctor/dashboard'),
  getAppointments: (params) => api.get('/doctor/appointments', { params }),
  getAppointment: (id) => api.get(`/doctor/appointments/${id}`),
  updateAppointmentStatus: (id, status, notes) => 
    api.put(`/doctor/appointments/${id}/status`, { status, notes }),
  getPatients: (params) => api.get('/doctor/patients', { params }),
  getPatient: (id) => api.get(`/doctor/patients/${id}`),
  getPrescriptions: (params) => api.get('/doctor/prescriptions', { params }),
  getReviews: (params) => api.get('/doctor/reviews', { params }),
  respondToReview: (id, response) => 
    api.put(`/doctor/reviews/${id}/respond`, { response }),
  updateAvailability: (availability) => 
    api.put('/doctor/availability', { availability }),
  addHoliday: (date, reason, isRecurring) => 
    api.post('/doctor/holidays', { date, reason, isRecurring }),
}

// Patient API
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (profileData) => api.put('/patient/profile', profileData),
  getDashboard: () => api.get('/patient/dashboard'),
  getDoctors: (params) => api.get('/patient/doctors', { params }),
  getDoctor: (id) => api.get(`/patient/doctors/${id}`),
  getAppointments: (params) => api.get('/patient/appointments', { params }),
  getAppointment: (id) => api.get(`/patient/appointments/${id}`),
  cancelAppointment: (id, reason) => 
    api.put(`/patient/appointments/${id}/cancel`, { reason }),
  getPrescriptions: (params) => api.get('/patient/prescriptions', { params }),
  getReports: (params) => api.get('/patient/reports', { params }),
  getMedicalHistory: () => api.get('/patient/medical-history'),
  createEmergencyRequest: (requestData) => 
    api.post('/patient/emergency', requestData),
  getEmergencyRequests: (params) => api.get('/patient/emergency-requests', { params }),
}

// Appointments API
export const appointmentsAPI = {
  book: (appointmentData) => api.post('/appointments/book', appointmentData),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/appointments/available-slots/${doctorId}`, { params: { date } }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, updateData) => api.put(`/appointments/${id}`, updateData),
  cancelAppointment: (id, reason) => 
    api.put(`/appointments/${id}/cancel`, { reason }),
}

// Prescriptions API
export const prescriptionsAPI = {
  create: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  getPrescriptions: (params) => api.get('/prescriptions', { params }),
  getPrescription: (id) => api.get(`/prescriptions/${id}`),
  updatePrescription: (id, updateData) => api.put(`/prescriptions/${id}`, updateData),
  addRefill: (id, quantity) => api.post(`/prescriptions/${id}/refill`, { quantity }),
  deletePrescription: (id) => api.delete(`/prescriptions/${id}`),
}

// Reports API
export const reportsAPI = {
  create: (reportData) => api.post('/reports', reportData),
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  updateReport: (id, updateData) => api.put(`/reports/${id}`, updateData),
  reviewReport: (id, reviewData) => api.put(`/reports/${id}/review`, reviewData),
  shareReport: (id, doctorId, accessLevel) => 
    api.post(`/reports/${id}/share`, { doctorId, accessLevel }),
  downloadReport: (id) => api.get(`/reports/${id}/download`),
  deleteReport: (id) => api.delete(`/reports/${id}`),
}

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getReviews: (params) => api.get('/reviews', { params }),
  getReview: (id) => api.get(`/reviews/${id}`),
  updateReview: (id, updateData) => api.put(`/reviews/${id}`, updateData),
  respondToReview: (id, response) => 
    api.put(`/reviews/${id}/respond`, { response }),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getDoctorReviews: (doctorId, params) => 
    api.get(`/reviews/doctor/${doctorId}`, { params }),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotification: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => 
    api.put('/notifications/preferences', { preferences }),
  getStats: () => api.get('/notifications/stats'),
}

// Chat API
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (roomId, params) => 
    api.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, messageData) => 
    api.post(`/chat/rooms/${roomId}/messages`, messageData),
  markAsRead: (roomId) => api.put(`/chat/rooms/${roomId}/messages/read`),
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getParticipants: (roomId) => api.get(`/chat/rooms/${roomId}/participants`),
  createRoom: (roomData) => api.post('/chat/rooms', roomData),
  deleteRoom: (roomId) => api.delete(`/chat/rooms/${roomId}`),
  getStats: () => api.get('/chat/stats'),
}

// AI API
export const aiAPI = {
  chat: (messageData) => api.post('/ai/chat', messageData),
  getConversations: (params) => api.get('/ai/conversations', { params }),
  getConversation: (conversationId) => 
    api.get(`/ai/conversations/${conversationId}`),
  deleteConversation: (conversationId) => 
    api.delete(`/ai/conversations/${conversationId}`),
  getHealthTips: (params) => api.get('/ai/health-tips', { params }),
  checkSymptoms: (symptomData) => api.post('/ai/symptom-checker', symptomData),
  getMedicationInfo: (medicationName) => 
    api.get(`/ai/medication-info/${medicationName}`),
}

// Public Doctors API (for finding doctors)
export const doctorsAPI = {
  search: (params) => api.get('/doctors/search', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getAvailability: (id, date) => 
    api.get(`/doctors/${id}/availability`, { params: { date } }),
  getFilterOptions: () => api.get('/doctors/filter-options'),
}

export default api
