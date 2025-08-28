const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { auth: firebaseAuth } = require('../firebase-admin');

const router = express.Router();

// Health check for auth router
router.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    scope: 'auth',
    message: 'Auth router is working!',
    timestamp: new Date().toISOString()
  });
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Clean and validate input
    const usernameClean = username.trim();
    const emailClean = email.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameClean },
          { email: emailClean }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: existingUser.username === usernameClean
          ? 'Username already taken' 
          : 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: usernameClean,
        email: emailClean,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username/email and password are required'
      });
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username/email or password is incorrect'
      });
    }

    // Check if user is a Firebase-only user
    if (user.isFirebaseUser && !user.password) {
      return res.status(401).json({
        error: 'Firebase user',
        message: 'This account was created with Google/Apple sign-in. Please use the OAuth buttons to sign in.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username/email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get profile'
    });
  }
});

// Generate Firebase custom token
router.post('/firebase-token', authenticateToken, async (req, res) => {
  try {
    // Get user from database to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Create custom claims for the token
    const customClaims = {
      userId: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    };

    // Generate Firebase custom token
    const customToken = await firebaseAuth.createCustomToken(user.id, customClaims);

    res.json({
      message: 'Firebase custom token generated successfully',
      customToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Firebase token generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate Firebase token'
    });
  }
});

// Firebase login endpoint
router.post('/firebase-login', async (req, res) => {
  try {
    const { idToken, email, displayName, photoURL } = req.body;

    if (!idToken || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'ID token and email are required'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    
    if (decodedToken.email !== email) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Email mismatch'
      });
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username: email.split('@')[0], // Use email prefix as username
          name: displayName || email.split('@')[0],
          avatarUrl: photoURL || null,
          password: null, // Firebase users don't have passwords
          isFirebaseUser: true
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Firebase login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate with Firebase'
    });
  }
});

module.exports = router;
