import { useAuth } from '../contexts/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'

// Higher-order component to protect individual components
export function withAuthProtection(WrappedComponent, allowedRoles = []) {
  return function ProtectedComponent(props) {
    const { user, loading } = useAuth()
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </div>
      )
    }
    
    // Check if user data exists in localStorage as fallback
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user && !savedUser && !token) {
      return <Navigate to="/login" replace />
    }
    
    if (allowedRoles.length > 0) {
      const currentUser = user || (savedUser ? JSON.parse(savedUser) : null)
      if (!currentUser || !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/unauthorized" replace />
      }
    }
    
    return <WrappedComponent {...props} />
  }
}

// Hook version for functional components
export function useProtectedRoute(allowedRoles = []) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!loading) {
      // Check if user data exists in localStorage as fallback
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (!user && !savedUser && !token) {
        navigate('/login')
        return
      }
      
      if (allowedRoles.length > 0) {
        const currentUser = user || (savedUser ? JSON.parse(savedUser) : null)
        if (!currentUser || !allowedRoles.includes(currentUser.role)) {
          navigate('/unauthorized')
        }
      }
    }
  }, [user, loading, navigate, allowedRoles])
  
  return { user, loading }
}