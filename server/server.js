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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Atlas connection
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variable or config
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://cookiespots:cookiespots123@cookiespots.mongodb.net/cookie-spots?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB Atlas
connectDB();

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/cookie-spots', cookieSpotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cookie-types', cookieTypeRoutes);
app.use('/api/dietary-options', dietaryOptionRoutes);
app.use('/api/trips', tripRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
