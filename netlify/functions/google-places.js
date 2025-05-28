const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { query, lat, lng, radius = 5000 } = event.queryStringParameters || {};

    if (!query && (!lat || !lng)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Either query or lat/lng coordinates are required' })
      };
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('Google Places API key is not configured');
    }

    let url;
    if (query) {
      // Text search
      url = `https://places.googleapis.com/v1/places:searchText`;
      const response = await axios.post(url, {
        textQuery: query,
        maxResultCount: 20
      }, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount'
        }
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    } else {
      // Nearby search
      url = `https://places.googleapis.com/v1/places:searchNearby`;
      const response = await axios.post(url, {
        locationBias: {
          circle: {
            center: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng)
            },
            radius: parseFloat(radius)
          }
        },
        maxResultCount: 20
      }, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount'
        }
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch from Google Places API',
        message: error.message
      })
    };
  }
}; 