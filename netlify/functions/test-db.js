const { connectToDatabase } = require('./utils/mongodb');

// Export the handler function
const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Log environment variables (without sensitive data)
    const envCheck = {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasMongoDatabase: !!process.env.MONGODB_DATABASE,
      mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 10) + '...' : 'undefined',
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('Environment check:', envCheck);

    const db = await connectToDatabase();
    
    // Try to list all collections to verify connection
    const collections = await db.listCollections().toArray();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Successfully connected to MongoDB',
        collections: collections.map(c => c.name),
        database: db.databaseName,
        environment: envCheck
      })
    };
  } catch (error) {
    console.error('Test DB Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to connect to MongoDB',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        environment: {
          hasMongoUri: !!process.env.MONGODB_URI,
          hasMongoDatabase: !!process.env.MONGODB_DATABASE,
          mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
          mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 10) + '...' : 'undefined',
          nodeEnv: process.env.NODE_ENV
        }
      })
    };
  }
};

// Export the handler function
module.exports = { handler }; 