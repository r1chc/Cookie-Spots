const { MongoClient } = require('mongodb');

// Create a new MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);

// Create a cached connection variable
let cachedDb = null;

// Function to connect to the database
async function connectToDatabase() {
  // If the database connection is cached, use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const db = await client.connect();
  
  // Cache the database connection
  cachedDb = db.db(process.env.MONGODB_DATABASE);
  
  return cachedDb;
}

module.exports = {
  connectToDatabase,
  client
}; 