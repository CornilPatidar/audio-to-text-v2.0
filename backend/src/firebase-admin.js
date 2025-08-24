const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '..', 'audio-to-text-26-firebase-adminsdk-fbsvc-4b967546f8.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: 'audio-to-text-26'
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  throw error;
}

// Export auth instance
const auth = admin.auth();

module.exports = { admin, auth };
