const admin = require('firebase-admin');

let serviceAccount;
let firebaseInitialized = false;

if (process.env.FIREBASE_PROJECT_ID) {
  // Environment variables from Railway
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  console.log('✅ Firebase config loaded from environment variables');
} else {
  // Local JSON fallback for development
  try {
    serviceAccount = require('../audio-to-text-26-firebase-adminsdk-fbsvc-4b967546f8.json');
    console.log('✅ Firebase config loaded from local JSON file');
  } catch (error) {
    console.log('⚠️ Firebase service account not available - authentication features will be disabled');
  }
}

let auth = null;

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    auth = admin.auth();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  }
} else {
  console.log('⚠️ Firebase Admin SDK not initialized - no service account available');
}

module.exports = { admin, auth, firebaseInitialized };
