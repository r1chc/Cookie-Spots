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
    const cookieSpots = db.collection('cookieSpots');

    // Get query parameters
    const { lat, lng, distance = 5000, limit = 10 } = event.queryStringParameters || {};

    if (!lat || !lng) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Latitude and longitude are required' })
      };
    }

    // Convert distance to meters if it's in kilometers
    const distanceInMeters = distance * 1000;

    // Create a geospatial query
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distanceInMeters
        }
      }
    };

    // Execute the query
    const spots = await cookieSpots
      .find(query)
      .limit(parseInt(limit))
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(spots)
    };
  } catch (error) {
    console.error('Error fetching nearby cookie spots:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch nearby cookie spots' })
    };
  }
}; 