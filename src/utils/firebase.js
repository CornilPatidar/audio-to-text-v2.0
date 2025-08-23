import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

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
export const githubProvider = new GithubAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

githubProvider.setCustomParameters({
  prompt: 'select_account'
})

// Note: Using default persistence (local storage)

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    console.log('Google sign-in successful:', result.user)
    return { success: true, user: result.user }
  } catch (error) {
    console.error('Google sign-in error:', error)
    
    let errorMessage = 'Authentication failed'
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups for this site and try again.'
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized. Please add localhost to Firebase authorized domains.'
    } else if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase configuration issue. Please check your Firebase setup.'
    } else {
      errorMessage = error.message || 'An unexpected error occurred.'
    }
    
    return { success: false, error: errorMessage }
  }
}

export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider)
    console.log('GitHub sign-in successful:', result.user)
    return { success: true, user: result.user }
  } catch (error) {
    console.error('GitHub sign-in error:', error)
    
    let errorMessage = 'Authentication failed'
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups for this site and try again.'
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized. Please add localhost to Firebase authorized domains.'
    } else if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase configuration issue. Please check your Firebase setup.'
    } else {
      errorMessage = error.message || 'An unexpected error occurred.'
    }
    
    return { success: false, error: errorMessage }
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

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

export default app
