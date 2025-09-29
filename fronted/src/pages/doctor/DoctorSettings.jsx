import {useEffect, useState} from 'react'
import {Bell, Calendar, Eye, EyeOff, Save, Shield, User} from 'lucide-react'
import {useAuth} from '../../contexts/AuthContext'
import {doctorAPI} from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function DoctorSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    licenseNumber: '',
    hospital: '',
    address: '',
    bio: '',
    consultationFee: 0,
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      appointmentReminders: true,
      patientMessages: true,
      systemUpdates: true
    }
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      // Fetch real profile data from API
      const response = await doctorAPI.getProfile()
      if (response.data && response.data.user) {
        const user = response.data.user
        setProfile(prev => ({
          ...prev,
          firstName: user.profile?.firstName || user.firstName || prev.firstName,
          lastName: user.profile?.lastName || user.lastName || prev.lastName,
          email: user.email || prev.email,
          phone: user.profile?.phone || user.phone || prev.phone,
          specialization: user.specialization || prev.specialization,
          experience: user.experience || prev.experience,
          qualification: user.qualification || prev.qualification,
          licenseNumber: user.licenseNumber || prev.licenseNumber,
          hospital: user.hospital || prev.hospital,
          address: user.profile?.address || user.address || prev.address,
          bio: user.profile?.bio || user.bio || prev.bio,
          consultationFee: user.consultationFee || user.fee || prev.consultationFee,
          availability: user.profile?.availability || user.availability || prev.availability,
          notifications: user.profile?.notifications || user.notifications || prev.notifications
        }))
      } else if (response.data) {
        // Alternative response structure
        const data = response.data;
        setProfile(prev => ({
          ...prev,
          firstName: data.firstName || data.profile?.firstName || prev.firstName,
          lastName: data.lastName || data.profile?.lastName || prev.lastName,
          email: data.email || prev.email,
          phone: data.phone || data.profile?.phone || prev.phone,
          specialization: data.specialization || prev.specialization,
          experience: data.experience || prev.experience,
          qualification: data.qualification || prev.qualification,
          licenseNumber: data.licenseNumber || prev.licenseNumber,
          hospital: data.hospital || prev.hospital,
          address: data.address || data.profile?.address || prev.address,
          bio: data.bio || data.profile?.bio || prev.bio,
          consultationFee: data.consultationFee || data.fee || prev.consultationFee,
          availability: data.availability || data.profile?.availability || prev.availability,
          notifications: data.notifications || data.profile?.notifications || prev.notifications
        }))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // In case of error, retain the initial state but log the issue
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
        // Update profile via API
        const profileData = {
            profile: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                address: profile.address,
                bio: profile.bio,
                availability: profile.availability,
                notifications: profile.notifications
            },
            specialization: profile.specialization,
            experience: profile.experience,
            qualification: profile.qualification,
            licenseNumber: profile.licenseNumber,
            hospital: profile.hospital,
            consultationFee: profile.consultationFee,
            email: profile.email
        }

        const response = await doctorAPI.updateProfile(profileData)

        if (response.data) {
            alert('Profile updated successfully!')
        } else {
            throw new Error('Invalid response from server')
        }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!')
      return
    }

      if (passwordForm.newPassword.length < 6) {
          alert('Password must be at least 6 characters long!')
          return
      }
    
    try {
      setSaving(true)
        // Change password via API
        const response = await doctorAPI.changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        })

        if (response.data) {
            alert('Password changed successfully!')
            setPasswordForm({currentPassword: '', newPassword: '', confirmPassword: ''})
        } else {
            throw new Error('Invalid response from server')
        }
    } catch (error) {
      console.error('Failed to change password:', error)
        if (error.response && error.response.data && error.response.data.message) {
            alert(`Failed to change password: ${error.response.data.message}`)
        } else {
            alert('Failed to change password. Please try again.')
        }
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'availability' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Availability
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name (e.g. John)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name (e.g. Smith)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address (e.g. doctor@example.com)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number (e.g. +91 98765 43210)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={profile.specialization}
                        onChange={(e) => setProfile(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="Enter your medical specialization (e.g. Cardiology, Orthopedics)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</label>
                      <input
                        type="text"
                        value={profile.experience}
                        onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="Enter your years of experience (e.g. 10 years)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualification</label>
                      <input
                        type="text"
                        value={profile.qualification}
                        onChange={(e) => setProfile(prev => ({ ...prev, qualification: e.target.value }))}
                        placeholder="Enter your qualifications (e.g. MBBS, MD, DM)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">License Number</label>
                      <input
                        type="text"
                        value={profile.licenseNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        placeholder="Enter your medical license number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hospital</label>
                      <input
                        type="text"
                        value={profile.hospital}
                        onChange={(e) => setProfile(prev => ({ ...prev, hospital: e.target.value }))}
                        placeholder="Enter hospital/clinic name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        value={profile.consultationFee}
                        onChange={(e) => setProfile(prev => ({ ...prev, consultationFee: parseInt(e.target.value) }))}
                        placeholder="Enter consultation fee in INR"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Address and Bio */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                      <textarea
                        value={profile.address}
                        onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your full address including street, city, state, and pin code"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell patients about yourself, your expertise, and approach to treatment (e.g. Experienced cardiologist specializing in preventive cardiology with 15 years of practice...)"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Availability Settings</h2>
              
              <div className="space-y-4">
                {Object.entries(profile.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {day}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={schedule.available}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: { ...schedule, available: e.target.checked }
                            }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                      </div>
                    </div>
                    {schedule.available && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: { ...schedule, start: e.target.value }
                            }
                          }))}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-sm text-gray-500">to</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: { ...schedule, end: e.target.value }
                            }
                          }))}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                {Object.entries(profile.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'sms' && 'Receive notifications via SMS'}
                        {key === 'push' && 'Receive push notifications'}
                        {key === 'appointmentReminders' && 'Get reminded about upcoming appointments'}
                        {key === 'patientMessages' && 'Get notified about new patient messages'}
                        {key === 'systemUpdates' && 'Receive system updates and announcements'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationChange(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter your current password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password (at least 6 characters)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Shield className="h-4 w-4" />
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
