import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import clerkWebhookRoutes from './routes/clerk-webhook.js';
import userRoutes from './routes/user.js';
import passwordRoutes from './routes/passwords.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Special handling for Clerk webhook (needs raw body)
app.use('/api/clerk', clerkWebhookRoutes);

// Regular JSON parsing for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'Set' : 'Not Set',
      PORT: process.env.PORT || 3001
    }
  });
});

// Enhanced MongoDB Connection Function
const connectDB = async () => {
  try {
    // Debug environment variables
    console.log('🔍 Environment Variables Debug:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI || 'not set');
    console.log('   PORT:', process.env.PORT || 'not set');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
    console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');

    // Get MongoDB URI with fallback
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securevault';

    console.log('🔄 Attempting MongoDB connection...');
    console.log(`📍 MongoDB URI: ${mongoURI}`);

    // Check if URI looks valid
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }

    // Enhanced connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('⚙️ Connection options:', JSON.stringify(options, null, 2));

    // Attempt connection
    await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    console.log(`📡 Ready State: ${mongoose.connection.readyState}`);

    // Test database operations
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📁 Available collections:', collections.map(c => c.name));

      // Test write operation
      const testResult = await mongoose.connection.db.admin().ping();
      console.log('🏓 Database ping successful:', testResult);

    } catch (dbError) {
      console.warn('⚠️ Database operations test failed:', dbError.message);
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('🔍 Error Details:');
    console.error('   Error Name:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);

    // Specific error handling
    if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network Error - Possible causes:');
      console.error('   • MongoDB service is not running');
      console.error('   • Wrong host/port in connection string');
      console.error('   • Firewall blocking connection');
      console.error('   • Network connectivity issues');
    }

    if (error.name === 'MongoServerSelectionError') {
      console.error('🎯 Server Selection Error - Possible causes:');
      console.error('   • MongoDB is not running on the specified host/port');
      console.error('   • Connection string is incorrect');
      console.error('   • Authentication failed');
      console.error('   • Network timeout');
    }

    if (error.name === 'MongoParseError') {
      console.error('📝 Parse Error - Connection string format is invalid');
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection Refused - MongoDB is likely not running');
      console.error('💡 To start MongoDB:');
      console.error('   Windows: net start MongoDB  OR  mongod');
      console.error('   macOS: brew services start mongodb-community  OR  mongod');
      console.error('   Linux: sudo systemctl start mongod  OR  mongod');
    }

    if (error.code === 'ENOTFOUND') {
      console.error('🔍 Host Not Found - Check your MongoDB host address');
    }

    if (error.code === 18) {
      console.error('🔐 Authentication Failed - Check username/password');
    }

    console.error('🔧 Troubleshooting Steps:');
    console.error('   1. Verify MongoDB is installed and running');
    console.error('   2. Check connection string format');
    console.error('   3. Verify host and port are correct');
    console.error('   4. Check firewall settings');
    console.error('   5. Test connection with MongoDB Compass or mongo shell');

    // Retry connection after delay
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Enhanced connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 MongoDB connecting...');
});

mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connected');
});

// Connect to database
connectDB();

// Routes
app.use('/api/user', userRoutes);
app.use('/api/passwords', passwordRoutes);

// Enhanced database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    let collections = [];
    let pingResult = null;

    if (dbState === 1) {
      try {
        collections = await mongoose.connection.db.listCollections().toArray();
        pingResult = await mongoose.connection.db.admin().ping();
      } catch (dbError) {
        console.error('Database operation error:', dbError);
      }
    }

    res.json({
      status: 'success',
      database: {
        state: states[dbState],
        stateCode: dbState,
        name: mongoose.connection.db?.databaseName || 'Not connected',
        host: mongoose.connection.host || 'localhost',
        port: mongoose.connection.port || 27017,
        collections: collections.map(c => c.name),
        ping: pingResult,
        uri: process.env.MONGODB_URI ? 'Set in environment' : 'Using default'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        mongooseVersion: mongoose.version
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      name: error.name,
      code: error.code
    });
  }
});

// MongoDB connection status endpoint
app.get('/api/mongodb-status', (req, res) => {
  const connection = mongoose.connection;
  res.json({
    readyState: connection.readyState,
    host: connection.host,
    port: connection.port,
    name: connection.name,
    collections: connection.db ? Object.keys(connection.db.collections) : [],
    states: {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // MongoDB connection errors
  if (error.name === 'MongoNetworkError') {
    return res.status(503).json({
      message: 'Database connection error. Please check if MongoDB is running.'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️ Received SIGINT. Graceful shutdown...');

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Received SIGTERM. Graceful shutdown...');

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(1);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 SecureVault Server Starting...');
  console.log(`📱 Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/securevault'}`);
  console.log('📊 Health check: http://localhost:3001/health');
  console.log('🧪 DB test: http://localhost:3001/api/test-db');
  console.log('📡 MongoDB status: http://localhost:3001/api/mongodb-status');
});

export default app;