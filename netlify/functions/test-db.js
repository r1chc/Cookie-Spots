const { connectToDatabase } = require('./utils/mongodb');

exports.handler = async (event, context) => {
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
    const db = await connectToDatabase();
    
    // Try to list all collections to verify connection
    const collections = await db.listCollections().toArray();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Successfully connected to MongoDB',
        collections: collections.map(c => c.name),
        database: db.databaseName
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to connect to MongoDB',
        message: error.message
      })
    };
  }
}; 