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
    const { lat, lng, distance = 5, limit = 10 } = event.queryStringParameters || {};

    if (!lat || !lng) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Latitude and longitude are required' })
      };
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distanceKm = parseFloat(distance);
    const limitNum = parseInt(limit);

    // Convert distance from kilometers to meters for MongoDB geospatial query
    const distanceInMeters = distanceKm * 1000;

    console.log(`Searching for cookie spots near ${latitude}, ${longitude} within ${distanceKm}km (${distanceInMeters}m)`);

    try {
      // First, try to ensure the geospatial index exists
      await cookieSpots.createIndex({ "location": "2dsphere" });
    } catch (indexError) {
      console.log('Geospatial index may already exist:', indexError.message);
    }

    // Create a geospatial query using $near
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distanceInMeters
        }
      }
    };

    console.log('Executing geospatial query:', JSON.stringify(query, null, 2));

    // Execute the query
    const spots = await cookieSpots
      .find(query)
      .limit(limitNum)
      .toArray();

    console.log(`Found ${spots.length} cookie spots`);

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
      body: JSON.stringify({ 
        error: 'Failed to fetch nearby cookie spots',
        details: error.message 
      })
    };
  }
}; 