import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const TestAuth = () => {
  const { user, loading, token } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Token:</strong> {token ? 'Present' : 'Not present'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
        <p><strong>User Role:</strong> {user?.role || 'No role'}</p>
      </div>
    </div>
  )
}

export default TestAuth

