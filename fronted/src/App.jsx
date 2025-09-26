import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import FindDoctor from './pages/FindDoctor'
import AdminDashboard from './pages/admin/AdminDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import StandaloneDoctorAppointments from './pages/DoctorAppointments'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientFindDoctor from './pages/patient/FindDoctorNew'
import MedicalReports from './pages/patient/MedicalReports'
import TestAuth from './pages/patient/TestAuth'
import Reviews from './pages/patient/Reviews'
import MedicalHistory from './pages/patient/MedicalHistory'
import Prescriptions from './pages/patient/Prescriptions'
import StandalonePatientDashboard from './pages/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import StandaloneBookAppointment from './pages/BookAppointment'
import PatientLayout from './layouts/PatientLayout'
import LoadingSpinner from './components/LoadingSpinner'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  // Check if user data exists in localStorage as fallback
  const savedUser = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  
  if (!user && !savedUser && !token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/find-doctor" element={<FindDoctor />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/book-appointment" element={<StandaloneBookAppointment />} />
      <Route path="/doctor-appointments" element={<StandaloneDoctorAppointments />} />
      <Route path="/patient-dashboard" element={<StandalonePatientDashboard />} />
      
      {/* Protected Routes - Redirect to role-specific dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
            {console.log('Dashboard route, user role:', user?.role)}
            {user?.role === 'admin' && <Navigate to="/admin" replace />}
            {user?.role === 'doctor' && <Navigate to="/doctor" replace />}
            {user?.role === 'patient' && <Navigate to="/patient" replace />}
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
      
      {/* Doctor Routes */}
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      
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
                <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="test-auth" element={<TestAuth />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 Route */}
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
