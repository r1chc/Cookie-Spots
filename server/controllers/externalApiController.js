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
          console.log(`*** CACHE HIT: Returning ${cachedResults.cookieSpots.length} cached spots from server cache ***`);
          return res.json({
            success: true,
            cookieSpots: cachedResults.cookieSpots,
            viewport: cachedResults.viewport,
            fromCache: true,
            search_metadata: cachedResults.search_metadata || null
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
      
      console.log(`*** FRESH DATA: Found ${result.cookieSpots.length} results from Google Places API ***`);
      
      // No need to combine results anymore since we only use Google
      const uniqueSpots = result.cookieSpots;
      
      // Cache the complete results object including viewport
      apiCache.set(cacheKey, { 
        cookieSpots: uniqueSpots, 
        viewport: result.viewport,
        search_metadata: result.search_metadata || null
      });
      
      console.log(`Cached results for future use with key: ${cacheKey}`);
      
      return res.json({
        success: true,
        cookieSpots: uniqueSpots,
        viewport: result.viewport,
        fromCache: false,
        search_metadata: result.search_metadata || null,
        message: 'Fresh data from Google Places API'
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
    let search_metadata = {};

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
        const types = result.types || [];
        isNeighborhood = types.some(type => 
          ['neighborhood', 'sublocality', 'sublocality_level_1', 'sublocality_level_2'].includes(type)
        );
        
        // For neighborhoods, try to get the actual boundary polygon if available
        if (isNeighborhood) {
          console.log(`Detected neighborhood search for "${params.location}". Fetching boundary...`);
          
          try {
            // Try to get the actual neighborhood boundary from the Places API
            const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,name&key=${googleApiKey}`;
            const placeDetailsResponse = await axios.get(placeDetailsUrl);
            
            if (placeDetailsResponse.data.result && placeDetailsResponse.data.result.geometry && 
                placeDetailsResponse.data.result.geometry.viewport) {
              
              console.log(`Found boundary data for "${params.location}"`);
              const neighborhoodBoundary = placeDetailsResponse.data.result.geometry.viewport;
              
              // Store the boundary for UI purposes and filtering
              search_metadata = {
                search_type: 'neighborhood_with_boundary',
                viewport: neighborhoodBoundary,
                location: params.location,
                place_id: result.place_id,
                boundary_available: true
              };
              
              // For UI visualization, we'll also include the place_id which the frontend can use
              // to render the actual neighborhood polygon using the Google Maps JavaScript API
            }
          } catch (boundaryError) {
            console.log(`Error fetching neighborhood boundary: ${boundaryError.message}`);
            // Continue with the text search approach even if boundary fetch fails
          }
          
          // Use text search approach for neighborhoods
          const textSearchRequest = {
            textQuery: `bakery OR cafe OR coffee shop in ${params.location}`,
            maxResultCount: 50  // Maximum allowed by the API
          };
          
          console.log(`Trying text search for "${textSearchRequest.textQuery}"`);
          
          try {
            // Try text search with the specific neighborhood name
            const textSearchHeaders = {
              'X-Goog-Api-Key': googleApiKey,
              'X-Goog-FieldMask': '*',
              'Content-Type': 'application/json'
            };
            
            const textSearchResponse = await axios.post(
              'https://places.googleapis.com/v1/places:searchText',
              textSearchRequest,
              { headers: textSearchHeaders }
            );
            
            if (textSearchResponse.data.places && textSearchResponse.data.places.length > 0) {
              console.log(`Text search for "${params.location}" found ${textSearchResponse.data.places.length} places`);
              
              // Process the results
              const places = textSearchResponse.data.places || [];
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
                search_metadata: search_metadata || {
                  search_type: 'neighborhood_text',
                  location: params.location
                }
              }));
              
              // Filter results to only include those that actually mention the neighborhood in the address
              // This helps ensure we're only getting places actually in the neighborhood
              const neighborhoodFiltered = cookieSpots.filter(spot => {
                const addressText = (spot.description || '').toLowerCase();
                const neighborhoodName = params.location.toLowerCase();
                return addressText.includes(neighborhoodName);
              });
              
              console.log(`Filtered to ${neighborhoodFiltered.length} places specifically mentioning ${params.location} in address`);
              
              return {
                cookieSpots: neighborhoodFiltered.length > 0 ? neighborhoodFiltered : cookieSpots, // Fall back to all results if filter is too strict
                viewport,
                search_metadata: search_metadata || {
                  search_type: 'neighborhood_text',
                  location: params.location
                }
              };
            }
          } catch (textSearchError) {
            console.log(`Text search failed, falling back to nearby search: ${textSearchError.message}`);
            // Fall back to nearby search if text search fails
          }
          
          // Fall back to circle-based search if text search fails or returns no results
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
            includedTypes: ['bakery', 'cafe', 'coffee_shop', 'restaurant', 'food'],
            maxResultCount: 30
          };
          
          // Add post-processing filter in search_metadata to filter results within neighborhood bounds
          search_metadata = {
            search_type: 'neighborhood',
            viewport: viewport,
            location: params.location,
            bounds_filter: {
              southwest: {
                lat: viewport.southwest.lat,
                lng: viewport.southwest.lng
              },
              northeast: {
                lat: viewport.northeast.lat,
                lng: viewport.northeast.lng
              }
            }
          };
          
          console.log(`Falling back to nearby search with radius of ${searchRadius.toFixed(2)} meters for neighborhood search.`);
        } else {
          // For non-neighborhood searches or when viewport is not available, use radius-based search
          searchRadius = types.some(type => ['locality', 'administrative_area_level_1', 'administrative_area_level_2'].includes(type))
            ? 15000  // 15km for cities
            : 5000;  // 5km default
          
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
            includedTypes: ['bakery', 'cafe', 'coffee_shop', 'restaurant', 'food'],
            maxResultCount: 30
          };
          
          search_metadata = {
            search_type: 'general',
            search_radius: searchRadius,
            location: params.location
          };
        }
        
        // If we have explicit coordinates from URL params, override the geocoded ones
        if (params.lat && params.lng) {
          console.log('Using explicit coordinates from URL params');
          if (searchRequest.locationRestriction.circle) {
            searchRequest.locationRestriction.circle.center = {
              latitude: parseFloat(params.lat),
              longitude: parseFloat(params.lng)
            };
          }
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
        includedTypes: ['bakery', 'cafe', 'coffee_shop', 'restaurant', 'food'],
        maxResultCount: 30,
        languageCode: 'en'
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
      
      search_metadata = {
        search_type: 'general',
        search_radius: searchRadius
      };
    }

    console.log(`Searching for cookie spots with request:`, JSON.stringify(searchRequest, null, 2));

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
      search_metadata: search_metadata
    }));

    // For debugging
    console.log(`Found ${cookieSpots.length} cookie spots for ${isNeighborhood ? 'neighborhood' : 'location'} "${params.location || 'coordinates'}"`);

    return {
      cookieSpots,
      viewport,
      search_metadata: search_metadata
    };
  } catch (error) {
    console.error('Error with Google Places API:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
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