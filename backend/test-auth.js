const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Signup
    console.log('1. Testing Signup...');
    const signupData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('   User:', signupResponse.data.user.username);
    console.log('   Token received:', !!signupResponse.data.token);
    console.log('');

    const token = signupResponse.data.token;

    // Test 2: Login
    console.log('2. Testing Login...');
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   User:', loginResponse.data.user.username);
    console.log('   Token received:', !!loginResponse.data.token);
    console.log('');

    // Test 3: Get Profile (with authentication)
    console.log('3. Testing Profile (with auth)...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.username);
    console.log('');

    // Test 4: Login with email
    console.log('4. Testing Login with email...');
    const emailLoginData = {
      username: 'test@example.com',
      password: 'password123'
    };

    const emailLoginResponse = await axios.post(`${API_BASE}/auth/login`, emailLoginData);
    console.log('✅ Email login successful:', emailLoginResponse.data.message);
    console.log('');

    console.log('🎉 All authentication tests passed!');
    console.log('\n📋 Available endpoints:');
    console.log('   POST /api/auth/signup - Create new account');
    console.log('   POST /api/auth/login - Login with username/email');
    console.log('   GET /api/auth/profile - Get user profile (requires token)');

  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed:', error.response.data);
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Run the test
testAuth();
