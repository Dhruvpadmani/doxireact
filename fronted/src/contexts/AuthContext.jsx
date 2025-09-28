import { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication on app start...')
      const savedUser = localStorage.getItem('user')
      
      console.log('👤 User data exists:', !!savedUser)
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          console.log('✅ Found saved user data:', userData.email)
          
          // Try to validate with backend first
          console.log('🔄 Attempting backend validation...')
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
            
            const response = await Promise.race([
              authAPI.getProfile(),
              timeoutPromise
            ])
            
            console.log('✅ Backend validation successful, setting user as authenticated')
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.data.user
              }
            })
            // Update local storage with fresh user data
            localStorage.setItem('user', JSON.stringify(response.data.user))
          } catch (backendError) {
            console.log('⚠️ Backend validation failed, clearing saved data:', backendError.message)
            // Backend validation failed, clear saved data and redirect to login
            localStorage.removeItem('user')
            dispatch({
              type: 'AUTH_FAILURE',
              payload: 'Session expired'
            })
          }
        } catch (parseError) {
          // If saved user data is invalid, clear everything
          console.log('❌ Invalid saved user data, clearing storage')
          localStorage.removeItem('user')
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Session expired'
          })
        }
      } else {
        // No user data, set loading to false
        console.log('❌ No user data found')
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    console.log('🔐 Login attempt started:', { email })
    dispatch({ type: 'AUTH_START' })
    try {
      console.log('📡 Calling authAPI.login...')
      const response = await authAPI.login(email, password)
      console.log('✅ Login API response received:', response.data)
      const { user } = response.data  // Token is now in cookie
      
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user }
      })
      
      toast.success('Login successful!')
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'doctor') {
        navigate('/doctor')
      } else if (user.role === 'patient') {
        navigate('/patient')
      } else {
        navigate('/dashboard')
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // Check if this is a demo account (only if backend is completely unavailable)
      if (!error.response) {
        console.log('Backend not available, checking demo accounts')
        const demoAccounts = JSON.parse(localStorage.getItem('demoAccounts') || '[]')
        const demoUser = demoAccounts.find(account => account.email === email && account.password === password)
        
        if (demoUser) {
          localStorage.setItem('user', JSON.stringify(demoUser))
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: demoUser }
          })
          
          toast.success('Demo login successful!')
          
          // Redirect based on user role
          if (demoUser.role === 'admin') {
            navigate('/admin')
          } else if (demoUser.role === 'doctor') {
            navigate('/doctor')
          } else if (demoUser.role === 'patient') {
            navigate('/patient')
          } else {
            navigate('/dashboard')
          }
          
          return { success: true }
        }
      }
      
      // Handle backend errors properly
      const message = error.response?.data?.message || 'Login failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authAPI.register(userData)
      const { user } = response.data  // Token is now in cookie
      
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user }
      })
      
      toast.success('Registration successful!')
      
      // Redirect based on user role
      if (user.role === 'doctor') {
        navigate('/doctor')
      } else if (user.role === 'patient') {
        navigate('/patient')
      } else {
        navigate('/dashboard')
      }
      
      return { success: true }
    } catch (error) {
      // If backend is not available, create a demo account
      console.log('Backend not available, creating demo account')
      
      const demoUser = {
        id: Date.now().toString(),
        email: userData.email,
        role: userData.role,
        profile: userData.profile,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date()
      }
      
      // Save demo account for future logins
      const demoAccounts = JSON.parse(localStorage.getItem('demoAccounts') || '[]')
      demoAccounts.push({
        ...demoUser,
        password: userData.password // Store password for demo login
      })
      localStorage.setItem('demoAccounts', JSON.stringify(demoAccounts))
      
      // If doctor is registering, save to registeredDoctors for patient panel
      if (userData.role === 'doctor') {
        const doctorData = {
          id: demoUser.id,
          profile: userData.profile,
          specialization: userData.profile.specialization || 'General Medicine',
          experience: userData.profile.experience || 0,
          consultationFee: userData.profile.consultationFee || 0,
          licenseNumber: userData.profile.licenseNumber || '',
          bio: userData.profile.bio || '',
          languages: userData.profile.languages || ['English'],
          rating: {
            average: 0,
            count: 0
          },
          isVerified: false,
          createdAt: new Date().toISOString()
        }
        
        const registeredDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || '[]')
        registeredDoctors.push(doctorData)
        localStorage.setItem('registeredDoctors', JSON.stringify(registeredDoctors))
        console.log('✅ Doctor saved to localStorage:', doctorData)
        console.log('📋 Total registered doctors:', registeredDoctors.length)
      }
      
      // For demo registration, we still store user info but token is handled by cookie
      localStorage.setItem('user', JSON.stringify(demoUser))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: demoUser }
      })
      
      toast.success('Demo account created successfully!')
      
      // Redirect based on user role
      if (demoUser.role === 'doctor') {
        navigate('/doctor')
      } else if (demoUser.role === 'patient') {
        navigate('/patient')
      } else {
        navigate('/dashboard')
      }
      
      return { success: true }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear user data from localStorage (token is cleared by server via cookie)
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user
      })
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    // Only return true if user exists and loading is complete
    return !state.loading && !!state.user;
  }

  // Check user role
  const hasRole = (role) => {
    return state.user && state.user.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return state.user && roles.includes(state.user.role)
  }

  // Get user info
  const getUser = () => {
    return state.user
  }

  // Get user role
  const getUserRole = () => {
    return state.user ? state.user.role : null
  }

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin')
  }

  // Check if user is doctor
  const isDoctor = () => {
    return hasRole('doctor')
  }

  // Check if user is patient
  const isPatient = () => {
    return hasRole('patient')
  }

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    getUser,
    getUserRole,
    isAdmin,
    isDoctor,
    isPatient
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
