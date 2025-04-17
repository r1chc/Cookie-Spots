// server/controllers/externalApiController.js

const axios = require('axios');
const config = require('../config/config');
const NodeCache = require('node-cache');

// Create a cache with TTL of 30 minutes (in seconds) - shorter caching time for development
const apiCache = new NodeCache({ stdTTL: 1800 });

/**
 * Controller for handling external API requests
 */
const externalApiController = {
  /**
   * Fetch cookie spots from Google Places API
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  fetchAllSources: async (req, res) => {
    try {
      const { location, lat, lng } = req.body;
      
      // Validate inputs
      if (!location && (!lat || !lng)) {
        return res.status(400).json({ 
          success: false,
          message: 'Either location or coordinates (lat/lng) are required' 
        });
      }
      
      // Create a cache key based on the request
      const cacheKey = location 
        ? `all-sources-${location}` 
        : `all-sources-${lat}-${lng}`;
      
      // Check if we have cached results
      const cachedResults = apiCache.get(cacheKey);
      if (cachedResults) {
        console.log(`Using cached results for ${cacheKey}`);
        if (cachedResults.cookieSpots && Array.isArray(cachedResults.cookieSpots)) {
          console.log(`Returning ${cachedResults.cookieSpots.length} cached spots`);
          return res.json({
            success: true,
            cookieSpots: cachedResults.cookieSpots,
            viewport: cachedResults.viewport
          });
        } else {
          console.log('Cached results found but invalid format, fetching fresh data');
          apiCache.del(cacheKey); // Delete invalid cache
        }
      }
      
      // Define search parameters
      let searchParams;
      if (lat && lng) {
        searchParams = { lat, lng };
      } else if (location) {
        searchParams = { location };
      }
      
      console.log('Fetching cookie spots with params:', searchParams);
      
      // Only fetch from Google Places API now
      const result = await fetchFromGoogle(searchParams);
      
      console.log(`Found: Google (${result.cookieSpots.length})`);
      
      // No need to combine results anymore since we only use Google
      const uniqueSpots = result.cookieSpots;
      
      // Cache the complete results object including viewport
      apiCache.set(cacheKey, { 
        cookieSpots: uniqueSpots, 
        viewport: result.viewport 
      });
      
      return res.json({
        success: true,
        cookieSpots: uniqueSpots,
        viewport: result.viewport
      });
    } catch (error) {
      console.error('Error fetching from Google Places API:', error);
      if (error.response?.data?.error) {
        console.error('Places API error:', error.response.data.error);
        // Handle specific error codes from new API
        switch (error.response.data.error.code) {
          case 'INVALID_ARGUMENT':
            // Handle invalid arguments
            break;
          case 'PERMISSION_DENIED':
            // Handle authentication issues
            break;
          // Add other error codes as needed
        }
      }
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching cookie spots from Google Places API',
        error: error.message
      });
    }
  }
};

/**
 * Fetch cookie spots from Google Places API
 * @param {Object} params - Search parameters
 * @returns {Object} - Object containing cookie spots and viewport
 */
async function fetchFromGoogle(params) {
  try {
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
    
    // Update headers to include the API key
    const headers = {
      'X-Goog-Api-Key': googleApiKey,
      'X-Goog-FieldMask': '*',
      'Content-Type': 'application/json'
    };

    let searchRequest;
    let viewport;

    // If we have coordinates, use them directly
    if (params.lat && params.lng) {
      searchRequest = {
        locationRestriction: {
          circle: {
            center: {
              latitude: params.lat,
              longitude: params.lng
            },
            radius: 5000.0 // 5km radius - increased from 2km for better coverage
          }
        },
        includedTypes: ['bakery', 'cafe'],
        maxResultCount: 20,
        rankPreference: 'DISTANCE'
      };
      
      // Create a viewport based on the radius
      const latLngDelta = 5000 / 111000; // approximate degrees for 5km
      viewport = {
        southwest: {
          lat: params.lat - latLngDelta,
          lng: params.lng - latLngDelta
        },
        northeast: {
          lat: params.lat + latLngDelta,
          lng: params.lng + latLngDelta
        }
      };
    } 
    // If we have a location string, geocode it first
    else if (params.location) {
      // Geocode the location to get coordinates
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${googleApiKey}`;
      const geocodeResponse = await axios.get(geocodeUrl);
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const result = geocodeResponse.data.results[0];
        const location = result.geometry.location;
        viewport = result.geometry.viewport;
        
        searchRequest = {
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng
              },
              radius: 5000.0 // 5km radius
            }
          },
          includedTypes: ['bakery', 'cafe'],
          maxResultCount: 20,
          rankPreference: 'DISTANCE'
        };
      } else {
        throw new Error('Location not found');
      }
    }

    // Make the API call
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      searchRequest,
      { headers }
    );

    // Process the results
    const places = response.data.places || [];
    const cookieSpots = places.map(place => ({
      name: place.displayName?.text,
      description: place.formattedAddress,
      address: place.addressComponents?.streetNumber + ' ' + place.addressComponents?.route,
      city: place.addressComponents?.locality,
      state_province: place.addressComponents?.administrativeArea,
      country: place.addressComponents?.country,
      postal_code: place.addressComponents?.postalCode,
      location: {
        type: 'Point',
        coordinates: [place.location.longitude, place.location.latitude]
      },
      phone: place.internationalPhoneNumber,
      website: place.websiteUri,
      hours_of_operation: place.currentOpeningHours?.periods || [],
      price_range: place.priceLevel ? '$'.repeat(place.priceLevel) : '$$',
      rating: place.rating,
      user_ratings_total: place.userRatingCount,
      place_id: place.id
    }));

    return {
      cookieSpots,
      viewport
    };
  } catch (error) {
    console.error('Error with Google Places API:', error);
    throw error;
  }
}

// Remove fetchFromYelp and fetchFromFacebook functions

// Since we no longer need to remove duplicates (only one source), simplify this function
function removeDuplicates(spots) {
  return spots; // Just return the spots as is since they're all from one source
}

async function testNearbySearch() {
  console.log('\nTesting Nearby Search API');
  try {
    const headers = {
      'X-Goog-Api-Key': googleApiKey,
      'X-Goog-FieldMask': '*',
      'Content-Type': 'application/json'
    };
    
    const searchRequest = {
      locationRestriction: {
        circle: {
          center: {
            latitude: 40.7131,
            longitude: -73.9567
          },
          radius: 5000.0
        }
      },
      includedTypes: ['bakery'],
      maxResultCount: 20
    };
    
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      searchRequest,
      { headers }
    );
    
    console.log('Results found:', response.data.places?.length || 0);
    // Rest of your testing logic...
  } catch (error) {
    console.error('Nearby Search API error:', error);
  }
}

module.exports = externalApiController;