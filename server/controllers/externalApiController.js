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
    let searchRadius = 5000; // Default 5km radius
    let isNeighborhood = false;

    // If we have a location string, geocode it first to detect location type
    if (params.location) {
      // Geocode the location to get coordinates and location type
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${googleApiKey}`;
      const geocodeResponse = await axios.get(geocodeUrl);
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const result = geocodeResponse.data.results[0];
        const location = result.geometry.location;
        viewport = result.geometry.viewport;
        
        // Check if this is a neighborhood or sublocality
        // Types reference: https://developers.google.com/maps/documentation/geocoding/requests-geocoding#Types
        const types = result.types || [];
        isNeighborhood = types.some(type => 
          ['neighborhood', 'sublocality', 'sublocality_level_1', 'sublocality_level_2'].includes(type)
        );
        
        // For neighborhoods, use a larger radius to cover the entire area
        if (isNeighborhood) {
          console.log(`Detected neighborhood search for "${params.location}". Using expanded radius.`);
          searchRadius = 7500; // 7.5km to cover larger neighborhoods
          
          // Calculate a better radius based on the viewport if available
          if (viewport) {
            // Calculate the diagonal distance of the viewport as a better approximation of neighborhood size
            const northEast = viewport.northeast;
            const southWest = viewport.southwest;
            
            // Haversine distance calculation between the corners
            const R = 6371000; // Earth radius in meters
            const dLat = (northEast.lat - southWest.lat) * Math.PI / 180;
            const dLon = (northEast.lng - southWest.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(southWest.lat * Math.PI / 180) * Math.cos(northEast.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            // Use viewport-based radius with a minimum of 3km and maximum of 10km
            searchRadius = Math.max(3000, Math.min(10000, distance / 2));
            console.log(`Calculated neighborhood radius: ${searchRadius.toFixed(0)}m based on viewport`);
          }
        } else if (types.includes('locality') || types.includes('administrative_area_level_1')) {
          // For cities and states, also use a larger radius
          searchRadius = 8000; // 8km for cities
        }
        
        searchRequest = {
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng
              },
              radius: searchRadius
            }
          },
          includedTypes: ['bakery', 'cafe'],
          maxResultCount: 20,
          rankPreference: 'DISTANCE'
        };
        
        // If we have explicit coordinates from URL params, override the geocoded ones
        if (params.lat && params.lng) {
          console.log('Using explicit coordinates from URL params');
          searchRequest.locationRestriction.circle.center = {
            latitude: parseFloat(params.lat),
            longitude: parseFloat(params.lng)
          };
        }
      } else {
        throw new Error('Location not found');
      }
    } 
    // If we only have coordinates (no location string), use them directly
    else if (params.lat && params.lng) {
      searchRequest = {
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(params.lat),
              longitude: parseFloat(params.lng)
            },
            radius: searchRadius
          }
        },
        includedTypes: ['bakery', 'cafe'],
        maxResultCount: 20,
        rankPreference: 'DISTANCE'
      };
      
      // Create a viewport based on the radius
      const latLngDelta = searchRadius / 111000; // approximate degrees for the radius
      viewport = {
        southwest: {
          lat: parseFloat(params.lat) - latLngDelta,
          lng: parseFloat(params.lng) - latLngDelta
        },
        northeast: {
          lat: parseFloat(params.lat) + latLngDelta,
          lng: parseFloat(params.lng) + latLngDelta
        }
      };
    }

    console.log(`Searching for cookie spots with radius: ${searchRadius}m`);

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
      place_id: place.id,
      // Add search metadata to help with UI presentation
      search_metadata: {
        search_type: isNeighborhood ? 'neighborhood' : 'general',
        search_radius: searchRadius
      }
    }));

    // For debugging
    console.log(`Found ${cookieSpots.length} cookie spots for ${isNeighborhood ? 'neighborhood' : 'location'} "${params.location || 'coordinates'}" with ${searchRadius}m radius`);

    return {
      cookieSpots,
      viewport,
      search_metadata: {
        search_type: isNeighborhood ? 'neighborhood' : 'general',
        search_radius: searchRadius,
        location: params.location
      }
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