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
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.priceLevel,places.businessStatus'
        }
      }
    );

    // Transform Google Places API response to match expected format
    const places = response.data.places || [];
    const transformedResults = places.map(place => ({
      _id: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      location: {
        coordinates: place.location ? [place.location.longitude, place.location.latitude] : [0, 0]
      },
      average_rating: place.rating || 0,
      review_count: place.userRatingCount || 0,
      source: 'google',
      place_id: place.id,
      // Add photos
      photos: place.photos ? place.photos.slice(0, 5).map(photo => ({
        url: `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`,
        width: photo.widthPx || 400,
        height: photo.heightPx || 400
      })) : [],
      // Add contact information
      phone: place.internationalPhoneNumber || place.nationalPhoneNumber || '',
      website: place.websiteUri || '',
      google_maps_url: place.googleMapsUri || '',
      // Add hours
      hours: place.regularOpeningHours ? {
        weekday_text: place.regularOpeningHours.weekdayDescriptions || [],
        periods: place.regularOpeningHours.periods || []
      } : null,
      // Add business status and price level
      business_status: place.businessStatus || 'OPERATIONAL',
      price_level: place.priceLevel || null
    }));

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: transformedResults,
        metadata: {
          search_location: location,
          total_results: transformedResults.length,
          source: 'google_places_api'
        }
      })
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