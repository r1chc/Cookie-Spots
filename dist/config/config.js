// Remove the dotenv config since it's already loaded in server.js
// require('dotenv').config();

module.exports = {
  // MongoDB Atlas connection string
  mongoURI: process.env.MONGO_URI,
  
  // JWT secret for authentication
  jwtSecret: process.env.JWT_SECRET || 'cookiespotsecret',
  
  // JWT token expiration (in seconds)
  jwtExpiration: '7d',
  
  // Server port
  port: process.env.PORT || 5002, // Changed to match server.js default
  
  // Upload directory for photos
  uploadDir: 'uploads',
  
  // Maximum file size for uploads (in bytes)
  maxFileSize: 5 * 1024 * 1024, // 5MB
  
  // Allowed file types for uploads
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Default pagination limits
  defaultLimit: 10,
  
  // Default search radius (in meters)
  defaultSearchRadius: 5000, // 5km
  
  // Maximum search radius (in meters)
  maxSearchRadius: 50000, // 50km
  
  // Cookie spot status options
  cookieSpotStatus: {
    ACTIVE: 'active',
    PENDING: 'pending',
    CLOSED: 'closed',
    REPORTED: 'reported'
  },
  
  // Review status options
  reviewStatus: {
    PUBLISHED: 'published',
    PENDING: 'pending',
    REJECTED: 'rejected'
  },
  
  // Photo status options
  photoStatus: {
    APPROVED: 'approved',
    PENDING: 'pending',
    REJECTED: 'rejected'
  }
};
