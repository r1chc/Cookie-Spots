const axios = require('axios');

const handler = async (event, context) => {
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
    const { location, debug } = JSON.parse(event.body || '{}');

    if (!location) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Location is required' })
      };
    }

    // Get Google Places API key from environment variables
    const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('Google Places API key is not configured');
    }

    // Make request to Google Places API
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: `cookie shop ${location}`,
        maxResultCount: 20
      },
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount'
        }
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error in external-api function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch from external API',
        message: error.message
      })
    };
  }
};

module.exports = { handler }; 