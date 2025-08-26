import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, onAuthStateChange, signInWithGoogle, signInWithApple, signOutUser, signInWithCustomTokenAuth } from '../utils/firebase'
import { getRedirectResult } from 'firebase/auth'
import authService from '../utils/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for redirect result first (Firebase OAuth)
        const redirectResult = await getRedirectResult(auth)
        if (redirectResult) {
          console.log('User signed in via redirect:', redirectResult.user)
        }

        // Check if we have a stored token and validate it
        if (authService.isAuthenticated()) {
          const result = await authService.getProfile()
          if (result.success) {
            setUser(result.data.user)
            
            // Check for Firebase custom token and sign in
            const firebaseCustomToken = localStorage.getItem('firebaseCustomToken')
            if (firebaseCustomToken) {
              console.log('🔐 Found Firebase custom token, signing in...')
              const firebaseResult = await signInWithCustomTokenAuth(firebaseCustomToken)
              if (firebaseResult.success) {
                console.log('✅ Firebase custom token authentication successful')
              } else {
                console.log('⚠️ Firebase custom token authentication failed:', firebaseResult.error)
                // Clear invalid token
                localStorage.removeItem('firebaseCustomToken')
              }
            }
          } else {
            // Token is invalid, clear it
            authService.clearAuth()
            localStorage.removeItem('firebaseCustomToken')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error handling redirect result:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const unsubscribe = onAuthStateChange((firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
      // Update user if it's a Firebase user (OAuth or Custom Token)
      if (firebaseUser) {
        setUser(firebaseUser)
      }
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



  const loginWithApple = async () => {
    setLoading(true)
    setError(null)
    const result = await signInWithApple()
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }



  const register = async (userData) => {
    setLoading(true)
    setError(null)
    const result = await authService.register(userData)
    
    if (result.success) {
      setUser(result.data.user)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    const result = await authService.login(credentials)
    
    if (result.success) {
      setUser(result.data.user)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    
    // Try to logout from both Firebase and custom auth
    const firebaseResult = await signOutUser()
    const customResult = await authService.logout()
    
    if (!firebaseResult.success && !customResult.success) {
      setError('Logout failed')
    }
    
    setUser(null)
    setLoading(false)
    return { success: true }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithApple,
    register,
    login,
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
