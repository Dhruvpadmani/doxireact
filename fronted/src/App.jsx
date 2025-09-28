import {Navigate, Route, Routes} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import {AuthProvider} from './contexts/AuthContext'
import {ThemeProvider} from './contexts/ThemeContext'
import DashboardRedirect from './DashboardRedirect'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import FindDoctor from './pages/FindDoctor'
import AdminDashboard from './pages/admin/AdminDashboard'
import PatientManagement from './pages/admin/PatientManagement'
import DoctorManagement from './pages/admin/DoctorManagement'
import AppointmentManagement from './pages/admin/AppointmentManagement'
import ReportManagement from './pages/admin/ReportManagement'
import ReviewManagement from './pages/admin/ReviewManagement'
import CalendarManagement from './pages/admin/CalendarManagement'
import NotificationsSettingsFixed from './pages/admin/NotificationsSettingsFixed'
import ReportsAnalytics from './pages/admin/ReportsAnalytics'
import AdminLogs from './pages/admin/AdminLogs'
import Settings from './pages/admin/Settings'
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
import MedicalReports from './pages/patient/MedicalReportsFixed'

import Reviews from './pages/patient/Reviews'
import MedicalHistory from './pages/patient/MedicalHistory'
import StandalonePatientDashboard from './pages/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import StandaloneBookAppointment from './pages/BookAppointment'
import PatientProfile from './pages/patient/Profile'
import PatientLayout from './layouts/PatientLayout'
import AdminLayout from './layouts/AdminLayout'
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
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes with Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="doctors" element={<DoctorManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="reviews" element={<ReviewManagement />} />
        <Route path="calendar" element={<CalendarManagement />} />
        <Route path="notifications" element={<NotificationsSettingsFixed />} />
        <Route path="analytics" element={<ReportsAnalytics />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
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
          <Route path="profile" element={<PatientProfile/>}/>
        
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
