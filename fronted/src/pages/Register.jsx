import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Stethoscope } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const { register: registerUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm()

  const password = watch('password')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setValue('role', role)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    const result = await registerUser(data)
    setIsLoading(false)
    
    // Navigation is handled inside the register function in AuthContext
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Join DOXI
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account to get started
          </p>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Demo Mode:</strong> You can create an account and test the dashboard even without the backend running!
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                    selectedRole === 'patient' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  }`}
                  onClick={() => handleRoleSelect('patient')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className={`text-sm font-medium ${
                      selectedRole === 'patient' 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Patient
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Book appointments
                    </div>
                  </div>
                </div>
                <div 
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                    selectedRole === 'doctor' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  }`}
                  onClick={() => handleRoleSelect('doctor')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                      <Stethoscope className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className={`text-sm font-medium ${
                      selectedRole === 'doctor' 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Doctor
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Manage patients
                    </div>
                  </div>
                </div>
                <div 
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                    selectedRole === 'admin' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  }`}
                  onClick={() => handleRoleSelect('admin')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className={`text-sm font-medium ${
                      selectedRole === 'admin' 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Admin
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Manage system
                    </div>
                  </div>
                </div>
              </div>
              <input
                {...register('role', { required: 'Please select a role' })}
                type="hidden"
                value={selectedRole}
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('profile.firstName', { 
                      required: 'First name is required',
                      maxLength: {
                        value: 50,
                        message: 'First name must be at most 50 characters'
                      }
                    })}
                    type="text"
                    className="input pl-10"
                    placeholder="First name"
                    maxLength={50}
                  />
                </div>
                {errors.profile?.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('profile.lastName', { 
                      required: 'Last name is required',
                      maxLength: {
                        value: 50,
                        message: 'Last name must be at most 50 characters'
                      }
                    })}
                    type="text"
                    className="input pl-10"
                    placeholder="Last name"
                    maxLength={50}
                  />
                </div>
                {errors.profile?.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('profile.phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Phone number must be exactly 10 digits'
                    }
                  })}
                  type="tel"
                  className="input pl-10"
                  placeholder="Enter your phone number"
                  onInput={(e) => {
                    // Allow only digits and limit to 10 characters
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) {
                      value = value.slice(0, 10);
                    }
                    e.target.value = value;
                  }}
                  maxLength={10}
                />
              </div>
              {errors.profile?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.profile.phone.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('profile.dateOfBirth', {
                    validate: {
                      notFuture: (value) => {
                        if (value && new Date(value) > new Date()) {
                          return 'Date of birth cannot be in the future';
                        }
                        return true;
                      },
                      minimumAge: (value) => {
                        if (value) {
                          const birthDate = new Date(value);
                          const today = new Date();
                          const age = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
                            ? age - 1 
                            : age;
                          
                          if (adjustedAge < 13) {
                            return 'You must be at least 13 years old';
                          }
                          if (adjustedAge > 120) {
                            return 'Please enter a valid date of birth';
                          }
                        }
                        return true;
                      }
                    }
                  })}
                  type="date"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Doctor-specific fields */}
            {selectedRole === 'doctor' && (
              <>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specialization *
                </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('profile.specialization', { required: selectedRole === 'doctor' ? 'Specialization is required' : false })}
                      type="text"
                      className="input pl-10"
                      placeholder="e.g., Cardiology, General Medicine"
                    />
                  </div>
                  {errors.profile?.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.profile.specialization.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    License Number *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('profile.licenseNumber', { required: selectedRole === 'doctor' ? 'License number is required' : false })}
                      type="text"
                      className="input pl-10"
                      placeholder="Medical license number"
                    />
                  </div>
                  {errors.profile?.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.profile.licenseNumber.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                {...register('terms', { required: 'You must accept the terms and conditions' })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Create Account
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Theme Toggle */}
        <div className="text-center">
          <button
            onClick={toggleTheme}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
          </button>
        </div>
      </div>
    </div>
  )
}
