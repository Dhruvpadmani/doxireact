import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// ProtectedRoute component for route-level protection
export default function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) {
  const { isAuthenticated, hasAnyRole, loading, user } = useAuth();

  console.log('🛡️ ProtectedRoute check:', {
    loading,
    isAuthenticated: isAuthenticated(),
    user: user?.email,
    userRole: user?.role,
    allowedRoles,
    currentPath: window.location.pathname
  });

  // Show loading spinner while checking auth status
  if (loading) {
    console.log('⏳ Showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Check if user is authenticated (user exists and loading is complete)
  const isUserAuthenticated = !loading && user;

  // If not authenticated, redirect to login
  if (!isUserAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // If user is authenticated but doesn't have required role, redirect to unauthorized
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    console.log('❌ User does not have required role, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ User authenticated and authorized, rendering children');
  // Render children if all checks pass
  return children;
}

// Higher-order component for component-level protection
export function withProtectedRoute(WrappedComponent, allowedRoles = []) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}