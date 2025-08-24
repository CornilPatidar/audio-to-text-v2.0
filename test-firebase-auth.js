const { auth } = require('./backend/src/firebase-admin');

async function testFirebaseAuth() {
  try {
    console.log('🧪 Testing Firebase Admin SDK...');
    
    // Test creating a custom token
    const customToken = await auth.createCustomToken('test-user-123', {
      userId: 'test-user-123',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    console.log('✅ Custom token generated successfully!');
    console.log('Token:', customToken);
    console.log('Token length:', customToken.length);
    
    // Test token verification
    const decodedToken = await auth.verifyIdToken(customToken);
    console.log('✅ Token verification successful!');
    console.log('Decoded token:', decodedToken);
    
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:', error);
  }
}

testFirebaseAuth();
