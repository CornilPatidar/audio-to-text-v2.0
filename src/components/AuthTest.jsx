import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthTest() {
  const { user, isAuthenticated, loading, error } = useAuth()

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
      
      {loading && (
        <div className="text-blue-600">
          <i className="fa-solid fa-spinner animate-spin mr-2"></i>
          Checking authentication...
        </div>
      )}
      
      {error && (
        <div className="text-red-600 mb-4">
          <i className="fa-solid fa-exclamation-triangle mr-2"></i>
          Error: {error}
        </div>
      )}
      
      {isAuthenticated && user ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">
              <i className="fa-solid fa-check-circle"></i>
            </span>
            <span className="font-medium">Authenticated</span>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Name:</strong> {user.displayName || 'Not provided'}</p>
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
            <p><strong>Provider:</strong> {user.providerData?.[0]?.providerId || 'Unknown'}</p>
            <p><strong>UID:</strong> {user.uid}</p>
          </div>
        </div>
      ) : (
        <div className="text-gray-600">
          <i className="fa-solid fa-user-slash mr-2"></i>
          Not authenticated
        </div>
      )}
    </div>
  )
}
