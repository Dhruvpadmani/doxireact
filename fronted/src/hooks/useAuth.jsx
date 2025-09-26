import { useState, useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (userData, token) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Check user role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Get user info
  const getUser = () => {
    return user;
  };

  // Get user role
  const getUserRole = () => {
    return user ? user.role : null;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is doctor
  const isDoctor = () => {
    return hasRole('doctor');
  };

  // Check if user is patient
  const isPatient = () => {
    return hasRole('patient');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    getUser,
    getUserRole,
    isAdmin,
    isDoctor,
    isPatient
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Higher-order component for protected routes
export function withAuth(Component, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasAnyRole, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAuthenticated()) {
        navigate('/login');
      } else if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        navigate('/unauthorized');
      }
    }, [isAuthenticated, hasAnyRole, loading, navigate]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated()) {
      return null;
    }

    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for checking authentication
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  return { isAuthenticated: isAuthenticated(), loading };
}

// Hook for checking role-based access
export function useRequireRole(allowedRoles) {
  const { isAuthenticated, hasAnyRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        navigate('/login');
      } else if (allowedRoles && !hasAnyRole(allowedRoles)) {
        navigate('/unauthorized');
      }
    }
  }, [isAuthenticated, hasAnyRole, loading, navigate, allowedRoles]);

  return { 
    isAuthenticated: isAuthenticated(), 
    hasRequiredRole: allowedRoles ? hasAnyRole(allowedRoles) : true,
    loading 
  };
}