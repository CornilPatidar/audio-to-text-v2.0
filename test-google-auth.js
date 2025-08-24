// Test script to debug Google OAuth issues
// Run this in the browser console to test Google authentication

console.log('🧪 Testing Google OAuth Configuration...')

// Check Firebase configuration
console.log('📍 Current domain:', window.location.hostname)
console.log('🔧 Firebase auth domain:', 'audio-to-text-26.firebaseapp.com')
console.log('🔧 Expected redirect URI:', 'https://audio-to-text-26.firebaseapp.com/__/auth/handler')

// Test if Firebase is properly initialized
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase is loaded')
} else {
  console.log('❌ Firebase is not loaded')
}

// Test if auth is available
if (typeof auth !== 'undefined') {
  console.log('✅ Firebase Auth is available')
  console.log('📍 Auth domain:', auth.config.authDomain)
} else {
  console.log('❌ Firebase Auth is not available')
}

// Test Google provider configuration
if (typeof googleProvider !== 'undefined') {
  console.log('✅ Google provider is configured')
  console.log('🔧 Provider scopes:', googleProvider.scopes)
  console.log('🔧 Provider custom parameters:', googleProvider.customParameters)
} else {
  console.log('❌ Google provider is not configured')
}

// Instructions for fixing OAuth loop
console.log('\n🔧 To fix Google OAuth loop, check these settings:')
console.log('1. Firebase Console → Authentication → Sign-in method → Google')
console.log('   - Make sure Google is enabled')
console.log('   - Check that your domain is in authorized domains')
console.log('2. Google Cloud Console → APIs & Services → Credentials')
console.log('   - Find your OAuth 2.0 Client ID')
console.log('   - Add these Authorized JavaScript origins:')
console.log('     * http://localhost:5173 (for development)')
console.log('     * https://your-domain.com (for production)')
console.log('   - Add these Authorized redirect URIs:')
console.log('     * https://audio-to-text-26.firebaseapp.com/__/auth/handler')
console.log('     * http://localhost:5173 (for development)')
console.log('3. Clear browser cache and cookies')
console.log('4. Try in incognito/private mode')

// Test function to manually trigger Google sign-in
window.testGoogleSignIn = async () => {
  try {
    console.log('🧪 Testing Google sign-in...')
    const result = await signInWithGoogle()
    console.log('✅ Test result:', result)
    return result
  } catch (error) {
    console.error('❌ Test failed:', error)
    return { success: false, error: error.message }
  }
}

console.log('\n🚀 Run testGoogleSignIn() to test Google authentication')
