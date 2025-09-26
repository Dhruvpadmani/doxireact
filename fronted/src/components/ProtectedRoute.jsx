import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

// ProtectedRoute component for route-level protection
export default function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) {
  const { isAuthenticated, hasAnyRole, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect to unauthorized if user doesn't have required role
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

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