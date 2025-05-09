require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const security = require('./config/security');
const logger = require('./config/logger');
const cron = require('node-cron');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const axios = require('axios');

// Import routes
const authRoutes = require('./routes/authRoutes');
const cookieSpotRoutes = require('./routes/cookieSpotRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const photoRoutes = require('./routes/photoRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cookieTypeRoutes = require('./routes/cookieTypeRoutes');
const dietaryOptionRoutes = require('./routes/dietaryOptionRoutes');
const tripRoutes = require('./routes/tripRoutes');
const externalApiRoutes = require('./routes/externalApiRoutes');
const cookieSpots = require('./routes/cookieSpots');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Security Middleware
app.use(helmet(security.helmetConfig));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
app.use('/api/', security.apiLimiter);
app.use('/api/auth', security.authLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://cookiespots.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas connection
let isConnecting = false;
let isConnected = false;

const connectDB = async () => {
  if (isConnecting) {
    logger.info('Already attempting to connect to MongoDB...');
    return;
  }
  
  isConnecting = true;
  
  try {
    const mongoURI = process.env.MONGO_URI || config.mongoURI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is not configured. Please set MONGO_URI in your environment variables.');
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('MongoDB Atlas connected successfully');
    isConnected = true;
    
    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
      setTimeout(() => {
        isConnecting = false;
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
      isConnected = true;
    });

  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    logger.error('Failed to connect to MongoDB. Will retry on next request.');
    isConnected = false;
  } finally {
    isConnecting = false;
  }
};

// Middleware to ensure database connection before processing requests
const ensureDBConnection = async (req, res, next) => {
  if (!isConnected && !isConnecting) {
    logger.info('Database not connected. Attempting to connect...');
    await connectDB();
  }
  next();
};

// Connect to MongoDB Atlas
connectDB();

// Set up routes with database connection check
app.use(ensureDBConnection);
app.use('/api/auth', authRoutes);
app.use('/api/cookie-spots', cookieSpotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cookie-types', cookieTypeRoutes);
app.use('/api/dietary-options', dietaryOptionRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/external', externalApiRoutes);
app.use('/api/cookie-spots/all-sources', cookieSpots);
app.use('/health', healthRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;