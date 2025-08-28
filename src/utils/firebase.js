import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult, signInWithCustomToken } from 'firebase/auth'

// Firebase configuration
// You'll need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyAKuzgqDg9xpVK9VuAEdqGHSCabbWdp-H0",
  authDomain: "audio-to-text-26.firebaseapp.com",
  projectId: "audio-to-text-26",
  storageBucket: "audio-to-text-26.firebasestorage.app",
  messagingSenderId: "588786758905",
  appId: "1:588786758905:web:84e76b10115e7ba66b9e28",
  measurementId: "G-F8HNFXV62V" 
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Auth providers
export const googleProvider = new GoogleAuthProvider()
export const appleProvider = new OAuthProvider('apple.com')

// Configure Google provider with simplified settings to avoid OAuth loop
googleProvider.setCustomParameters({
  prompt: 'select_account' // Always show account selector
})

// Add basic scopes for Google
googleProvider.addScope('profile')
googleProvider.addScope('email')

// Configure Apple provider with advanced settings
appleProvider.addScope('email')
appleProvider.addScope('name')
appleProvider.setCustomParameters({
  locale: 'en' // Set locale for Apple sign-in screen
})

// Note: Using default persistence (local storage)

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google sign-in...')
    console.log('📍 Current domain:', window.location.hostname)
    console.log('🔧 Firebase config:', { 
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId 
    })
    
    // Clear any existing auth state to prevent loops
    await signOut(auth)
    
    const result = await signInWithPopup(auth, googleProvider)
    console.log('✅ Google sign-in successful:', result.user)
    
    // Get Google access token for additional API calls
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken
    
    // Get additional user info if needed
    const additionalUserInfo = result._tokenResponse
    
    return { 
      success: true, 
      user: result.user,
      accessToken,
      additionalUserInfo,
      isNewUser: result._tokenResponse?.isNewUser || false
    }
  } catch (error) {
    console.error('❌ Google sign-in error:', error)
    console.error('🔍 Error code:', error.code)
    console.error('🔍 Error message:', error.message)
    
    // Handle account exists with different credential error
    if (error.code === 'auth/account-exists-with-different-credential') {
      console.log('⚠️ Account exists with different credential')
      return { 
        success: false, 
        error: 'An account with this email already exists with a different sign-in method. Please use the original sign-in method.',
        errorCode: error.code,
        credential: error.credential
      }
    }
    
    // Handle OAuth loop issues
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('🔄 Popup was closed, trying redirect method...')
      try {
        await signInWithRedirect(auth, googleProvider)
        return { success: true, redirect: true }
      } catch (redirectError) {
        console.error('❌ Redirect also failed:', redirectError)
        return { success: false, error: 'Authentication was cancelled. Please try again.' }
      }
    }
    
    // If popup fails, try redirect
    if (error.code === 'auth/popup-blocked') {
      try {
        console.log('🔄 Popup blocked, trying redirect method...')
        await signInWithRedirect(auth, googleProvider)
        return { success: true, redirect: true }
      } catch (redirectError) {
        console.error('❌ Redirect also failed:', redirectError)
        return { success: false, error: 'Both popup and redirect methods failed. Please allow popups or try again.' }
      }
    }
    
    let errorMessage = 'Authentication failed'
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups for this site and try again.'
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = `This domain (${window.location.hostname}) is not authorized. Please add it to Firebase authorized domains.`
    } else if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase configuration issue. Please check your Firebase setup.'
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled in Firebase. Please enable it in the Firebase console.'
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.'
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many sign-in attempts. Please try again later.'
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Authentication was cancelled. Please try again.'
    } else {
      errorMessage = error.message || 'An unexpected error occurred.'
    }
    
    return { success: false, error: errorMessage, errorCode: error.code }
  }
}





export const signInWithApple = async () => {
  try {
    console.log('🔐 Starting Apple sign-in...')
    console.log('📍 Current domain:', window.location.hostname)
    
    const result = await signInWithPopup(auth, appleProvider)
    console.log('✅ Apple sign-in successful:', result.user)
    
    // Get Apple credential for additional API calls
    const credential = OAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken
    const idToken = credential?.idToken
    
    // Get additional user info if needed
    const additionalUserInfo = result._tokenResponse
    
    return { 
      success: true, 
      user: result.user,
      accessToken,
      idToken,
      additionalUserInfo,
      isNewUser: result._tokenResponse?.isNewUser || false
    }
  } catch (error) {
    console.error('❌ Apple sign-in error:', error)
    console.error('🔍 Error code:', error.code)
    console.error('🔍 Error message:', error.message)
    
    // Handle account exists with different credential error
    if (error.code === 'auth/account-exists-with-different-credential') {
      console.log('⚠️ Account exists with different credential')
      return { 
        success: false, 
        error: 'An account with this email already exists with a different sign-in method. Please use the original sign-in method.',
        errorCode: error.code,
        credential: error.credential
      }
    }
    
    // If popup fails, try redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        console.log('🔄 Popup failed, trying redirect method...')
        await signInWithRedirect(auth, appleProvider)
        return { success: true, redirect: true }
      } catch (redirectError) {
        console.error('❌ Redirect also failed:', redirectError)
        return { success: false, error: 'Both popup and redirect methods failed. Please allow popups or try again.' }
      }
    }
    
    let errorMessage = 'Authentication failed'
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups for this site and try again.'
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = `This domain (${window.location.hostname}) is not authorized. Please add it to Firebase authorized domains.`
    } else if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase configuration issue. Please check your Firebase setup.'
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Apple sign-in is not enabled in Firebase. Please enable it in the Firebase console.'
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.'
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many sign-in attempts. Please try again later.'
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid Apple credentials. Please try again.'
    } else if (error.code === 'auth/missing-or-invalid-nonce') {
      errorMessage = 'Security validation failed. Please try again.'
    } else {
      errorMessage = error.message || 'An unexpected error occurred.'
    }
    
    return { success: false, error: errorMessage, errorCode: error.code }
  }
}



export const signOutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

// Sign in with custom token
export const signInWithCustomTokenAuth = async (customToken) => {
  try {
    console.log('🔐 Starting custom token sign-in...')
    const result = await signInWithCustomToken(auth, customToken)
    console.log('✅ Custom token sign-in successful:', result.user)
    return { success: true, user: result.user }
  } catch (error) {
    console.error('❌ Custom token sign-in error:', error)
    return { success: false, error: error.message }
  }
}

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Debug function to test Firebase configuration
export const testFirebaseConfig = () => {
  console.log('🔧 Testing Firebase configuration...')
  console.log('📍 Auth domain:', firebaseConfig.authDomain)
  console.log('📍 Project ID:', firebaseConfig.projectId)
  console.log('📍 API Key exists:', !!firebaseConfig.apiKey)
  console.log('📍 App ID exists:', !!firebaseConfig.appId)
  console.log('📍 Current domain:', window.location.hostname)
  console.log('📍 Firebase app initialized:', !!app)
  console.log('📍 Auth instance created:', !!auth)
  console.log('📍 Google provider configured:', !!googleProvider)
  
  return {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    currentDomain: window.location.hostname,
    appInitialized: !!app,
    authInitialized: !!auth
  }
}

// Get JWT token from backend for Firebase users
export const getJWTTokenForFirebaseUser = async (firebaseUser) => {
  try {
    console.log('🔐 Getting JWT token for Firebase user...')
    
    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken()
    
    // Exchange Firebase ID token for JWT token
    const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://audiotextly-production.up.railway.app/api' : 'http://localhost:5000/api'}/auth/firebase-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken: idToken,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get JWT token')
    }

    console.log('✅ JWT token obtained successfully')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Failed to get JWT token:', error)
    return { success: false, error: error.message }
  }
}

export default app
