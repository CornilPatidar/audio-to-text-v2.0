import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, onAuthStateChange, signInWithGoogle, signInWithGithub, signOutUser } from '../utils/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
      setUser(user)
      setLoading(false)
      setError(null)
    })

    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    setLoading(true)
    setError(null)
    const result = await signInWithGoogle()
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const loginWithGithub = async () => {
    setLoading(true)
    setError(null)
    const result = await signInWithGithub()
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    const result = await signOutUser()
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithGithub,
    logout,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
