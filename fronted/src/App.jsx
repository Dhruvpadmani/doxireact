import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import FindDoctor from './pages/FindDoctor'
import AdminDashboard from './pages/admin/AdminDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorPatients from './pages/doctor/DoctorPatients'
import DoctorReports from './pages/doctor/DoctorReports'
import DoctorReviews from './pages/doctor/DoctorReviews'
import DoctorAnalytics from './pages/doctor/DoctorAnalytics'
import DoctorSettings from './pages/doctor/DoctorSettings'
import StandaloneDoctorAppointments from './pages/DoctorAppointments'
import DoctorLayout from './layouts/DoctorLayout'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientFindDoctor from './pages/patient/FindDoctorNew'
import MedicalReports from './pages/patient/MedicalReports'
import TestAuth from './pages/patient/TestAuth'
import Reviews from './pages/patient/Reviews'
import MedicalHistory from './pages/patient/MedicalHistory'
import StandalonePatientDashboard from './pages/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import StandaloneBookAppointment from './pages/BookAppointment'
import PatientLayout from './layouts/PatientLayout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/Unauthorized'

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/find-doctor" element={<FindDoctor />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes - Redirect to role-specific dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'admin' && <Navigate to="/admin" replace />}
            {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'doctor' && <Navigate to="/doctor" replace />}
            {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'patient' && <Navigate to="/patient" replace />}
            <Navigate to="/login" replace />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Doctor Routes with Layout */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="reports" element={<DoctorReports />} />
        <Route path="reviews" element={<DoctorReviews />} />
        <Route path="analytics" element={<DoctorAnalytics />} />
        <Route path="settings" element={<DoctorSettings />} />
      </Route>
      
      {/* Patient Routes with Layout */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="find-doctor" element={<PatientFindDoctor />} />
        <Route path="medical-reports" element={<MedicalReports />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="test-auth" element={<TestAuth />} />
      </Route>
      
      {/* Standalone Pages (Need Authentication) */}
      <Route
        path="/book-appointment"
        element={
          <ProtectedRoute>
            <StandaloneBookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <StandaloneDoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <StandalonePatientDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
