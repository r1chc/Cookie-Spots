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

    // Make multiple requests with different search terms to get more results
    const allResults = [];
    const searchTerms = [
      `cookie shop ${location}`,
      `bakery ${location}`,
      `cookies ${location}`,
      `dessert shop ${location}`
    ];
    
    // First, try to geocode the location to get coordinates for location bias
    let locationBias = null;
    try {
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
      );
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const coords = geocodeResponse.data.results[0].geometry.location;
        locationBias = {
          circle: {
            center: {
              latitude: coords.lat,
              longitude: coords.lng
            },
            radius: 25000 // 25km radius bias
          }
        };
      }
    } catch (geocodeError) {
      console.log('Geocoding failed, proceeding without location bias:', geocodeError.message);
    }
    
    for (const searchTerm of searchTerms) {
      try {
        const requestBody = {
          textQuery: searchTerm,
          maxResultCount: 20
        };
        
        // Add location bias if we have coordinates
        if (locationBias) {
          requestBody.locationBias = locationBias;
        }
        
        const response = await axios.post(
          'https://places.googleapis.com/v1/places:searchText',
          requestBody,
          {
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.priceLevel,places.businessStatus'
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
          // Fix photo URLs - return URLs directly as strings for compatibility
          photos: place.photos ? place.photos.slice(0, 5).map(photo => 
            `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`
          ) : [],
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
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (searchError) {
        console.error(`Error searching for "${searchTerm}":`, searchError);
        // Continue with other search terms even if one fails
      }
    }
    
    // Remove duplicates based on place_id
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.place_id === result.place_id)
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: uniqueResults,
        metadata: {
          search_location: location,
          total_results: uniqueResults.length,
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