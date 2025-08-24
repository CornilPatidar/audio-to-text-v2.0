import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function UserProfile() {
  const { user, logout, loading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    setShowDropdown(false)
    await logout()
  }

  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case 'google.com':
        return 'fa-brands fa-google'
      case 'github.com':
        return 'fa-brands fa-github'
      default:
        return 'fa-solid fa-user'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors duration-200"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.name || user.username || 'User'}
            className="w-8 h-8 rounded-full border-2 border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-medium">
            {getUserInitials(user?.name || user?.username || user?.email)}
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium">
          {user?.name || user?.username || user?.email?.split('@')[0] || 'User'}
        </span>
        <span className="sm:hidden text-sm font-medium">
          {user?.name?.split(' ')[0] || user?.username || user?.email?.split('@')[0] || 'User'}
        </span>
        <i className="fa-solid fa-chevron-down text-xs"></i>
      </button>

      {showDropdown && (
        <>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name || user.username || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-medium">
                    {getUserInitials(user?.name || user?.username || user?.email)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <i className={`${getProviderIcon(user?.providerData?.[0]?.providerId)} text-xs text-gray-400 mr-1`}></i>
                    <span className="text-xs text-gray-400">
                      {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 
                       user?.providerData?.[0]?.providerId === 'github.com' ? 'GitHub' : 'Email'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <i className="fa-solid fa-cog mr-2"></i>
                  Settings
                </button>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <i className="fa-solid fa-history mr-2"></i>
                  Transcription History
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sign-out-alt mr-2"></i>
                      Sign out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          ></div>
        </>
      )}
    </div>
  )
}
