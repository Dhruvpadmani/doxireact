import {useEffect, useState} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import {patientAPI} from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Profile() {
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [profileData, setProfileData] = useState({})
    const [error, setError] = useState(null)
    const {user} = useAuth()

    useEffect(() => {
        if (user) {
            loadProfile()
        }
    }, [user])

    const loadProfile = async () => {
        setLoading(true)
        try {
            const response = await patientAPI.getProfile()
            const userData = response.data.user
            setProfileData({
                firstName: userData.profile?.firstName || '',
                lastName: userData.profile?.lastName || '',
                email: userData.email || '',
                phone: userData.profile?.phone || '',
                dateOfBirth: userData.profile?.dateOfBirth || '',
                gender: userData.profile?.gender || '',
                address: userData.profile?.address || '',
                medicalHistory: userData.profile?.medicalHistory || [],
                allergies: userData.profile?.allergies || [],
                medications: userData.profile?.medications || [],
                emergencyContact: userData.profile?.emergencyContact || {
                    name: '',
                    relationship: '',
                    phone: ''
                }
            })
        } catch (error) {
            console.error('Error loading profile:', error)
            setError(error.response?.data?.message || 'Failed to load profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleEmergencyContactChange = (e) => {
        const {name, value} = e.target
        setProfileData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [name]: value
            }
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await patientAPI.updateProfile(profileData)
            setEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="xl"/>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your personal information and medical
                    history</p>
            </div>

            {/* Error Message */}
            {error && (
                <div
                    className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2"/>
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                {editing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profileData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={profileData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Medical History
                                </label>
                                <textarea
                                    name="medicalHistory"
                                    value={profileData.medicalHistory.join(', ')}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        medicalHistory: e.target.value.split(',').map(item => item.trim())
                                    }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="List any medical conditions, surgeries, or treatments"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Allergies
                                </label>
                                <textarea
                                    name="allergies"
                                    value={profileData.allergies.join(', ')}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        allergies: e.target.value.split(',').map(item => item.trim())
                                    }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="List any allergies to medications, food, or environmental factors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Current Medications
                                </label>
                                <textarea
                                    name="medications"
                                    value={profileData.medications.join(', ')}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        medications: e.target.value.split(',').map(item => item.trim())
                                    }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="List all current medications with dosage"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency
                                    Contact</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.emergencyContact.name}
                                    onChange={handleEmergencyContactChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    name="relationship"
                                    value={profileData.emergencyContact.relationship}
                                    onChange={handleEmergencyContactChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.emergencyContact.phone}
                                    onChange={handleEmergencyContactChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal
                                Information</h2>
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.firstName}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.lastName}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.email}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.phone || 'Not provided'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.dateOfBirth || 'Not provided'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.gender || 'Not provided'}</p>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                                <p className="text-gray-900 dark:text-white">{profileData.address || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Medical
                                Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical
                                        History</h3>
                                    <p className="text-gray-900 dark:text-white">
                                        {profileData.medicalHistory && profileData.medicalHistory.length > 0
                                            ? profileData.medicalHistory.join(', ')
                                            : 'No medical history provided'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Allergies</h3>
                                    <p className="text-gray-900 dark:text-white">
                                        {profileData.allergies && profileData.allergies.length > 0
                                            ? profileData.allergies.join(', ')
                                            : 'No allergies reported'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current
                                        Medications</h3>
                                    <p className="text-gray-900 dark:text-white">
                                        {profileData.medications && profileData.medications.length > 0
                                            ? profileData.medications.join(', ')
                                            : 'No medications listed'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Emergency
                                Contact</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                                    <p className="text-gray-900 dark:text-white">{profileData.emergencyContact.name || 'Not provided'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Relationship</h3>
                                    <p className="text-gray-900 dark:text-white">{profileData.emergencyContact.relationship || 'Not provided'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                                    <p className="text-gray-900 dark:text-white">{profileData.emergencyContact.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}