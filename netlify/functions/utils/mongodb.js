const { MongoClient } = require('mongodb');

// Create a cached connection variable
let cachedDb = null;

// Function to connect to the database
async function connectToDatabase() {
  // If the database connection is cached, use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb;
  }

  // Debug environment variables
  console.log('Environment variables check:', {
    hasMongoUri: !!process.env.MONGO_URI,
    hasMongoDatabase: !!process.env.MONGODB_DATABASE,
    mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    nodeEnv: process.env.NODE_ENV
  });

  // Validate environment variables
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set. Please check your Netlify environment variables.');
  }

  if (!process.env.MONGODB_DATABASE) {
    throw new Error('MONGODB_DATABASE environment variable is not set. Please check your Netlify environment variables.');
  }

  // Validate MongoDB URI format
  if (!process.env.MONGO_URI.startsWith('mongodb://') && !process.env.MONGO_URI.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
  }

  try {
    // Create a new MongoDB client
    const client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB successfully');

    // Cache the database connection
    cachedDb = client.db(process.env.MONGODB_DATABASE);
    
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

module.exports = {
  connectToDatabase
}; 