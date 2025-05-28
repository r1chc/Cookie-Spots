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

    // Make multiple requests to get more results (Google Places API limits to 20 per request)
    const allResults = [];
    let nextPageToken = null;
    let requestCount = 0;
    const maxRequests = 3; // This will give us up to 60 results

    do {
      const requestBody = {
        textQuery: `cookie shop ${location}`,
        maxResultCount: 20
      };

      if (nextPageToken) {
        requestBody.pageToken = nextPageToken;
      }

      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchText',
        requestBody,
        {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.priceLevel,places.businessStatus,nextPageToken'
          }
        }
      );

      const places = response.data.places || [];
      
      // Transform Google Places API response to match expected format
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
        // Fix photo URLs - use proper Google Places API photo reference
        photos: place.photos ? place.photos.slice(0, 5).map(photo => {
          // Extract the photo reference from the name field
          const photoReference = photo.name.split('/').pop();
          return {
            url: `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`,
            reference: photoReference,
            width: photo.widthPx || 400,
            height: photo.heightPx || 400
          };
        }) : [],
        // Fix contact information - ensure phone is properly extracted
        phone: place.internationalPhoneNumber || place.nationalPhoneNumber || null,
        website: place.websiteUri || null,
        google_maps_url: place.googleMapsUri || null,
        // Add hours with better formatting
        hours: place.regularOpeningHours ? {
          weekday_text: place.regularOpeningHours.weekdayDescriptions || [],
          periods: place.regularOpeningHours.periods || [],
          open_now: place.regularOpeningHours.openNow || null
        } : null,
        // Add business status and price level
        business_status: place.businessStatus || 'OPERATIONAL',
        price_level: place.priceLevel || null
      }));

      allResults.push(...transformedResults);
      nextPageToken = response.data.nextPageToken;
      requestCount++;

      // Add a small delay between requests to avoid rate limiting
      if (nextPageToken && requestCount < maxRequests) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } while (nextPageToken && requestCount < maxRequests);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: allResults,
        metadata: {
          search_location: location,
          total_results: allResults.length,
          source: 'google_places_api',
          requests_made: requestCount
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