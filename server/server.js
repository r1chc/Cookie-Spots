require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Atlas connection
let isConnecting = false;
let isConnected = false;

const connectDB = async () => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('Already attempting to connect to MongoDB...');
    return;
  }
  
  isConnecting = true;
  
  try {
    // Use MongoDB Atlas connection string from environment variable or config
    const mongoURI = process.env.MONGO_URI || config.mongoURI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is not configured. Please set MONGO_URI in your environment variables.');
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('MongoDB Atlas connected successfully');
    isConnected = true;
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
      // Attempt to reconnect after a delay
      setTimeout(() => {
        isConnecting = false;
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
      isConnected = true;
    });

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit the process, just log the error
    console.error('Failed to connect to MongoDB. Will retry on next request.');
    isConnected = false;
  } finally {
    isConnecting = false;
  }
};

// Middleware to ensure database connection before processing requests
const ensureDBConnection = async (req, res, next) => {
  if (!isConnected && !isConnecting) {
    console.log('Database not connected. Attempting to connect...');
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

// Use our new enhanced cookie spots route
app.use('/api/cookie-spots/all-sources', cookieSpots);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, config.uploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use(`/${config.uploadDir}`, express.static(uploadsDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || config.port;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;