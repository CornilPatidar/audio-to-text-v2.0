const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../database');
const { authenticateToken } = require('../middleware/auth');

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

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: existingUser.username === username 
          ? 'Username already taken' 
          : 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
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

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Username/email and password are required'
      });
    }

    // Find user by username (case-sensitive) or email (case-insensitive)
    let user = null;
    
    console.log('Login attempt with:', username);
    
    // First try to find by username (case-sensitive)
    user = await prisma.user.findFirst({
      where: { username: username }
    });
    
    console.log('User found by username:', user ? 'Yes' : 'No');
    
    // If not found by username, try by email (case-insensitive)
    if (!user) {
      console.log('Trying email search...');
      
      // Use raw SQL for guaranteed case-insensitive email search
      const users = await prisma.$queryRaw`
        SELECT * FROM users 
        WHERE LOWER(email) = LOWER(${username})
        LIMIT 1
      `;
      user = users[0] || null;
      
      console.log('User found by email (case-insensitive):', user ? 'Yes' : 'No');
      if (user) {
        console.log('Found user email:', user.email);
        console.log('Input email:', username);
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username/email or password is incorrect'
      });
    }

    // Check password
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

module.exports = router;
