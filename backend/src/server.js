const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { prisma, testConnection } = require('./database');
const authRoutes = require('./routes/auth');
const transcriptionRoutes = require('./routes/transcriptions');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://audio-to-text-v2-0.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcriptions', transcriptionRoutes);

// Test database connection on startup
app.get('/api/db-test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        status: 'success',
        message: 'Database connection successful!',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed!'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'AudioTextly Backend API is running! 🎤',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'AudioTextly Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for transcriptions
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Transcription API is working!',
    endpoints: {
      'POST /api/auth/signup': 'Create new user account',
      'POST /api/auth/login': 'Login with username/email and password',
      'GET /api/auth/profile': 'Get current user profile (requires auth)',
      'GET /api/transcriptions': 'Get all transcriptions',
      'POST /api/transcriptions': 'Create new transcription',
      'GET /api/transcriptions/:id': 'Get specific transcription',
      'DELETE /api/transcriptions/:id': 'Delete transcription'
    }
  });
});

// Test endpoint to verify transcriptions route loading
app.get('/api/test-transcriptions-route', (req, res) => {
  try {
    const transcriptionRoutes = require('./routes/transcriptions');
    res.json({
      success: true,
      message: 'Transcription routes module loaded successfully',
      routes: transcriptionRoutes.stack ? transcriptionRoutes.stack.length : 'No stack info'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load transcription routes',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint at http://localhost:${PORT}/api/test`);
  console.log(`🗄️ Database test at http://localhost:${PORT}/api/db-test`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   - Signup: POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   - Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - Profile: GET http://localhost:${PORT}/api/auth/profile`);
  
  // Test database connection on startup (but don't fail if it doesn't work)
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Database connection successful on startup!');
    } else {
      console.log('⚠️ Database connection failed on startup - some features may not work');
      console.log('💡 Make sure DATABASE_URL environment variable is set correctly');
    }
  } catch (error) {
    console.log('⚠️ Database connection test failed on startup - some features may not work');
    console.log('💡 Error details:', error.message);
  }
});
