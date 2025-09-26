import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
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
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
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

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        try {
          // Try to validate with backend first
          const response = await authAPI.getProfile()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token
            }
          })
        } catch (error) {
          // If backend fails, use saved user data as fallback
          console.log('Backend auth failed, using saved user data:', error.message)
          try {
            const userData = JSON.parse(savedUser)
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: userData,
                token
              }
            })
          } catch (parseError) {
            // If saved user data is invalid, clear everything
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            dispatch({
              type: 'AUTH_FAILURE',
              payload: 'Session expired'
            })
          }
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      // If backend is not available, check for demo accounts
      console.log('Backend not available, checking demo accounts')
      
      // Check if this is a demo account
      const demoAccounts = JSON.parse(localStorage.getItem('demoAccounts') || '[]')
      const demoUser = demoAccounts.find(account => account.email === email && account.password === password)
      
      if (demoUser) {
        const token = 'demo-token-' + Date.now()
        localStorage.setItem('token', token)
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: demoUser, token }
        })
        
        toast.success('Demo login successful!')
        return { success: true }
      }
      
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
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Registration successful!')
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
      }
      
      const demoToken = 'demo-token-' + Date.now()
      
      localStorage.setItem('token', demoToken)
      localStorage.setItem('user', JSON.stringify(demoUser))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: demoUser, token: demoToken }
      })
      
      toast.success('Demo account created successfully!')
      return { success: true }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
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

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    changePassword
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
