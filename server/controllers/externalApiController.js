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
      const { location, lat, lng, debug } = req.body;
      
      // Debug mode for troubleshooting
      const isDebugMode = debug === true;
      
      if (isDebugMode) {
        console.log('=== DEBUG MODE ENABLED ===');
      }
      
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
      const result = await fetchFromGoogle(searchParams, isDebugMode);
      
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
      console.log(`Returning ${uniqueSpots.length} cookie spots to the client`);
      
      // In debug mode, log the first few spots for inspection
      if (isDebugMode && uniqueSpots.length > 0) {
        console.log('=== FIRST 3 RESULTS SAMPLE ===');
        console.log(JSON.stringify(uniqueSpots.slice(0, 3), null, 2));
        console.log('=== END SAMPLE ===');
        
        // Log photo information for debugging
        const spotsWithPhotos = uniqueSpots.filter(spot => spot.photos && spot.photos.length > 0);
        console.log(`=== PHOTO DEBUG: ${spotsWithPhotos.length} spots have photos ===`);
        if (spotsWithPhotos.length > 0) {
          console.log('Sample spot with photos:');
          console.log(JSON.stringify({
            name: spotsWithPhotos[0].name,
            photoCount: spotsWithPhotos[0].photos.length,
            photos: spotsWithPhotos[0].photos
          }, null, 2));
        }
      }
      
      return res.json({
        success: true,
        cookieSpots: uniqueSpots,
        viewport: result.viewport,
        fromCache: false,
        search_metadata: result.search_metadata || null,
        message: 'Fresh data from Google Places API',
        // In debug mode, add an extra field with the raw count
        debug_info: isDebugMode ? {
          raw_result_count: uniqueSpots.length,
          request_params: { location, lat, lng }
        } : null
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

// Helper function to fetch detailed place information
const fetchPlaceDetails = async (placeId, headers) => {
  try {
    if (!placeId) {
      console.log('No place ID provided for details');
      return null;
    }
    
    console.log(`Fetching details for place ID: ${placeId}`);
    
    // Define the specific fields we want to retrieve
    const fieldMask = 'id,displayName,formattedAddress,location,currentOpeningHours,photos';
    
    // Create headers with the correct field mask
    const requestHeaders = {
      ...headers,
      'X-Goog-FieldMask': fieldMask
    };
    
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      { headers: requestHeaders }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error.message);
    return null;
  }
};

// Helper function to format opening hours from Google Places API
const formatOpeningHours = (currentOpeningHours) => {
  // Check if we have opening hours data
  if (!currentOpeningHours || !currentOpeningHours.periods || !Array.isArray(currentOpeningHours.periods)) {
    console.log('No valid opening hours data:', currentOpeningHours);
    return {};
  }
  
  console.log('Formatting opening hours from:', JSON.stringify(currentOpeningHours, null, 2));
  
  // Initialize hours object with days of the week
  const formattedHours = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null
  };
  
  // If we have weekday_text directly, use it (legacy format)
  if (currentOpeningHours.weekday_text && Array.isArray(currentOpeningHours.weekday_text)) {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    currentOpeningHours.weekday_text.forEach((dayHours, index) => {
      if (index < daysOfWeek.length) {
        const day = daysOfWeek[index];
        formattedHours[day] = dayHours.split(': ')[1] || 'Closed';
      }
    });
    console.log('Formatted from weekday_text:', formattedHours);
    return formattedHours;
  }
  
  // Map day numbers from Google API to our day keys
  // Google: 0 = Sunday, 1 = Monday, etc.
  const daysMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  
  // Process each period
  currentOpeningHours.periods.forEach(period => {
    if (period && period.open) {
      const dayNum = period.open.day;
      const day = daysMap[dayNum];
      
      if (day) {
        // Format opening time
        const openHour = parseInt(period.open.hour || 0);
        const openMinute = parseInt(period.open.minute || 0);
        let openTime = '';
        
        if (openHour > 12) {
          openTime = `${openHour - 12}:${openMinute.toString().padStart(2, '0')} PM`;
        } else if (openHour === 12) {
          openTime = `12:${openMinute.toString().padStart(2, '0')} PM`;
        } else if (openHour === 0) {
          openTime = `12:${openMinute.toString().padStart(2, '0')} AM`;
        } else {
          openTime = `${openHour}:${openMinute.toString().padStart(2, '0')} AM`;
        }
        
        // Format closing time if available
        let closeTime = '';
        if (period.close) {
          const closeHour = parseInt(period.close.hour || 0);
          const closeMinute = parseInt(period.close.minute || 0);
          
          if (closeHour > 12) {
            closeTime = `${closeHour - 12}:${closeMinute.toString().padStart(2, '0')} PM`;
          } else if (closeHour === 12) {
            closeTime = `12:${closeMinute.toString().padStart(2, '0')} PM`;
          } else if (closeHour === 0) {
            closeTime = `12:${closeMinute.toString().padStart(2, '0')} AM`;
          } else {
            closeTime = `${closeHour}:${closeMinute.toString().padStart(2, '0')} AM`;
          }
        }
        
        // Set formatted hours string
        formattedHours[day] = closeTime ? `${openTime} - ${closeTime}` : `${openTime} - Open End`;
      }
    }
  });
  
  console.log('Formatted from periods:', formattedHours);
  return formattedHours;
};

/**
 * Fetch cookie spots from Google Places API
 * @param {Object} params - Search parameters
 * @param {Boolean} isDebugMode - Whether debug mode is enabled
 * @returns {Object} - Object containing cookie spots and viewport
 */
async function fetchFromGoogle(params, isDebugMode = false) {
  try {
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
    
    // Update headers to include the API key
    const headers = {
      'X-Goog-Api-Key': googleApiKey,
      // We will set FieldMask per request type later
      'Content-Type': 'application/json'
    };

    let searchRequest;
    let viewport;
    let searchRadius = 5000; // Default 5km radius
    let isNeighborhood = false;
    let search_metadata = {};
    let locationCenter = null;
    let locationName = '';

    // --- Strategy: Handle location string searches first (prioritize text search) ---
    if (params.location) {
      locationName = params.location.split(',')[0].trim(); // Get primary location name
      console.log(`Handling location string search for: "${params.location}" (Primary name: "${locationName}")`);
      
      // Geocode the location to get coordinates and location type
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${googleApiKey}`;
      const geocodeResponse = await axios.get(geocodeUrl);
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const result = geocodeResponse.data.results[0];
        locationCenter = result.geometry.location; // { lat, lng }
        viewport = result.geometry.viewport;
        const types = result.types || [];
        isNeighborhood = types.some(type => 
          ['neighborhood', 'sublocality', 'sublocality_level_1', 'sublocality_level_2'].includes(type)
        );
        
        console.log(`Geocoding result for "${params.location}": `,
          `Type: ${types.join(', ')}, isNeighborhood: ${isNeighborhood}, `,
          `Center: ${locationCenter.lat},${locationCenter.lng}`,
          `Viewport: ${JSON.stringify(viewport)}`);

        // Attempt Text Search Strategy for all location strings
        console.log(`Attempting Multi-Text-Search strategy for "${params.location}"`);
        const searchQueries = [
          `bakery in ${params.location}`,
          `cafe in ${params.location}`,
          `coffee shop in ${params.location}`,
          `cookies in ${params.location}`,
          `dessert shop in ${params.location}` // Changed from 'dessert'
        ];
        
        // Function to fetch and process one text search query
        const fetchTextSearch = async (query) => {
          try {
            const textSearchRequest = {
              textQuery: query,
              maxResultCount: 20
            };
            
            const textSearchFieldMask = [
              "places.id", "places.displayName", "places.formattedAddress", 
              "places.location", "places.addressComponents", "places.rating", 
              "places.userRatingCount", "places.priceLevel", "places.websiteUri", 
              "places.internationalPhoneNumber", "places.currentOpeningHours"
              // Photos will be fetched via Place Details call
            ].join(',');
            
            const textSearchHeaders = {
              ...headers,
              'X-Goog-FieldMask': textSearchFieldMask
            };
            
            const textSearchResponse = await axios.post(
              'https://places.googleapis.com/v1/places:searchText',
              textSearchRequest,
              { headers: textSearchHeaders }
            );
            
            const places = textSearchResponse.data.places || [];
            console.log(`Text search for "${query}" found ${places.length} places.`);
            return places;
          } catch (error) {
            console.error(`Error in text search for "${query}":`, error.message);
            if (error.response) console.error('API Error:', error.response.data);
            return [];
          }
        };

        // Fetch results for all queries
        const allSearchPromises = searchQueries.map(fetchTextSearch);
        const searchResults = await Promise.all(allSearchPromises);
        
        // Merge unique results
        const allPlaces = [];
        const seenPlaceIds = new Set();
        searchResults.flat().forEach(place => {
          if (place && place.id && !seenPlaceIds.has(place.id)) {
            allPlaces.push(place);
            seenPlaceIds.add(place.id);
          }
        });
        console.log(`Combined unique places from text searches: ${allPlaces.length}`);

        if (allPlaces.length > 0) {
          // Process places: Fetch details (for photos/hours) and format
          const processedSpots = await processPlaces(allPlaces, headers, googleApiKey, search_metadata);
          console.log(`Processed ${processedSpots.length} spots after fetching details.`);

          // Filter results to include only those relevant to the locationName
          const locationNameLower = locationName.toLowerCase();
          const filteredSpots = processedSpots.filter(spot => {
            const addressText = (spot.description || '').toLowerCase(); // Using formattedAddress stored in description
            const cityText = (spot.city || '').toLowerCase();
            const stateText = (spot.state_province || '').toLowerCase();
            // Check if location name is in address, city, or state (more robust)
            return addressText.includes(locationNameLower) || cityText.includes(locationNameLower);
            // Add state check if needed: || stateText.includes(locationNameLower)
          });
          console.log(`Filtered to ${filteredSpots.length} places relevant to "${locationName}"`);

          // Decide which set of spots to return
          const finalSpots = filteredSpots.length >= 3 ? filteredSpots : processedSpots; // Use filtered if we have at least 3, else use all processed from text search
          console.log(`Returning ${finalSpots.length} spots based on text search strategy.`);
          
          search_metadata = { 
              ...search_metadata, 
              search_type: isNeighborhood ? 'neighborhood_text' : 'location_text', 
              location: params.location, 
              result_source: 'text_search' 
          };

          return {
            cookieSpots: finalSpots,
            viewport, // Return the geocoded viewport
            search_metadata
          };
        } else {
          console.log('Multi-Text-Search yielded no results. Considering fallback.');
        }
        // If text search failed or yielded no results, proceed to potential fallback (Nearby Search)

      } else {
        console.error(`Geocoding failed for "${params.location}". Cannot proceed with this location.`);
        throw new Error('Location not found');
      }
    }
    
    // --- Fallback or Coordinate Search: Use Nearby Search --- 
    console.log('Using Nearby Search strategy (either fallback or coordinate search).');
    
    // Determine center point for nearby search
    if (!locationCenter && params.lat && params.lng) {
        console.log('Using explicit coordinates from request params for Nearby Search.');
        locationCenter = { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) };
        // Create a synthetic viewport if none exists
        if (!viewport) {
            const latLngDelta = searchRadius / 111000; // approximate degrees
            viewport = {
                southwest: { lat: locationCenter.latitude - latLngDelta, lng: locationCenter.longitude - latLngDelta },
                northeast: { lat: locationCenter.latitude + latLngDelta, lng: locationCenter.longitude + latLngDelta }
            };
        }
        search_metadata = { search_type: 'coordinates_nearby', search_radius: searchRadius };

    } else if (!locationCenter) {
        // Should not happen if geocoding was attempted and failed, error thrown earlier.
        console.error('Cannot perform Nearby Search: No location center available.');
        throw new Error('Cannot determine search center');
    }
    
    // If we fell back from a failed text search for a location string:
    if (params.location && (!search_metadata.search_type || search_metadata.result_source !== 'text_search')) {
        console.log(`Falling back to Nearby Search for location: "${params.location}"`);
        // Adjust radius based on original geocoding type if needed (e.g., larger for city)
        // Example: searchRadius = isNeighborhood ? 5000 : 10000; 
        search_metadata = { search_type: 'location_nearby_fallback', location: params.location, search_radius: searchRadius };
    } else if (!search_metadata.search_type) {
         // Default for coordinate-only search if not set above
         search_metadata = { search_type: 'coordinates_nearby', search_radius: searchRadius };
    }

    searchRequest = {
      locationRestriction: {
        circle: {
          center: locationCenter,
          radius: searchRadius
        }
      },
      includedTypes: ['bakery', 'cafe', 'coffee_shop', 'dessert_shop'], // Added dessert_shop
      maxResultCount: 20,
      languageCode: 'en'
    };

    console.log(`Performing Nearby Search with radius ${searchRadius}m around ${locationCenter.latitude},${locationCenter.longitude}`);
    
    const nearbyFieldMask = [
      "places.id", "places.displayName", "places.formattedAddress", 
      "places.location", "places.addressComponents", "places.rating", 
      "places.userRatingCount", "places.priceLevel", "places.websiteUri", 
      "places.internationalPhoneNumber", "places.currentOpeningHours"
      // Photos fetched via Place Details
    ].join(',');

    const nearbyHeaders = {
      ...headers,
      'X-Goog-FieldMask': nearbyFieldMask
    };

    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      searchRequest,
      { headers: nearbyHeaders }
    );

    const nearbyPlaces = response.data.places || [];
    console.log(`Nearby Search found ${nearbyPlaces.length} places.`);

    // Process places: Fetch details (for photos/hours) and format
    const cookieSpots = await processPlaces(nearbyPlaces, headers, googleApiKey, search_metadata);
    console.log(`Processed ${cookieSpots.length} spots from Nearby Search after fetching details.`);

    // For Nearby Search, we don't typically filter by name, just return results within radius
    search_metadata.result_source = 'nearby_search';

    return {
      cookieSpots,
      viewport, // Return the viewport determined earlier
      search_metadata
    };

  } catch (error) {
    console.error('Error in fetchFromGoogle:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
    // Rethrow or handle appropriately for the controller
    throw error; 
  }
}

// Helper function to process a list of places (fetch details, format)
async function processPlaces(places, baseHeaders, apiKey, searchMetadata) {
  const processedSpots = await Promise.all(places.map(async place => {
    let detailedPlace = place;
    
    // Fetch Place Details (always, to get photos/hours)
    try {
        const details = await fetchPlaceDetails(place.id, baseHeaders);
        if (details) {
            detailedPlace = { ...place, ...details }; // Merge details, overwriting fields like currentOpeningHours if present in details
        } else {
            console.log(`Could not fetch details for ${place.displayName?.text} (${place.id}), using partial data.`);
        }
    } catch (detailError) {
        console.error(`Error fetching details for ${place.id}: ${detailError.message}`);
        // Continue with the data we have from the search result
    }

    // Process photos
    let photos = [];
    let mainImage = null;
    const placeName = encodeURIComponent(detailedPlace.displayName?.text || 'cookie spot');
    const guaranteedImageUrl = `https://placehold.co/800x600/e2e8f0/1e40af?text=${placeName.replace(/%20/g, '+')}`; // Use 800x600 placeholder

    if (detailedPlace.photos && Array.isArray(detailedPlace.photos) && detailedPlace.photos.length > 0) {
      if (!apiKey) {
          console.error('API Key missing for photo URL construction!');
      } else {
          // console.log(`Processing ${detailedPlace.photos.length} photos for ${detailedPlace.displayName?.text}. First photo raw:`, JSON.stringify(detailedPlace.photos[0]));
      }
      
      photos = detailedPlace.photos.slice(0, 5).map((photo, index) => {
        let photoUrl = '';
        if (photo.name && apiKey) {
          photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxWidthPx=1200&maxHeightPx=800`;
          // console.log(`Photo ${index + 1} using V1 format: ${photoUrl}`);
        } else if (photo.photoReference || photo.photo_reference || photo.reference) {
             const reference = photo.photoReference || photo.photo_reference || photo.reference;
             if (apiKey) {
                 photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${reference}&key=${apiKey}`;
                 // console.log(`Photo ${index + 1} using legacy format.`);
             }
        } else if (photo.uri || photo.url) {
             photoUrl = photo.uri || photo.url;
             // console.log(`Photo ${index + 1} using direct URL/URI.`);
        }
        return photoUrl || null;
      }).filter(Boolean);

      if (photos.length > 0) {
        mainImage = photos[0];
      } else {
        mainImage = guaranteedImageUrl;
        // console.log(`Using guaranteed fallback image as mainImage because photo processing failed.`);
      }
    } else {
      mainImage = guaranteedImageUrl;
      // console.log(`No photos array found, using guaranteed fallback image as mainImage.`);
    }
    
    // Extract address components safely
    const getAddressComponent = (type) => 
        detailedPlace.addressComponents?.find(c => c.types.includes(type))?.longText || '';
        
    const streetNumber = getAddressComponent('street_number');
    const route = getAddressComponent('route');
    const addressLine1 = [streetNumber, route].filter(Boolean).join(' ');
    const city = getAddressComponent('locality') || getAddressComponent('postal_town');
    const state = getAddressComponent('administrative_area_level_1');
    const country = getAddressComponent('country');
    const postalCode = getAddressComponent('postal_code');

    const spotData = {
      _id: `google-${place.id}`, // Ensure unique ID format
      source: 'google',
      name: detailedPlace.displayName?.text || 'Unknown Place',
      description: detailedPlace.formattedAddress || '', // Store formatted address here
      address: addressLine1,
      city: city,
      state_province: state,
      country: country,
      postal_code: postalCode,
      location: detailedPlace.location ? { // Use location from detailedPlace if available
        type: 'Point',
        coordinates: [detailedPlace.location.longitude, detailedPlace.location.latitude]
      } : null,
      phone: detailedPlace.internationalPhoneNumber,
      website: detailedPlace.websiteUri,
      hours_of_operation: detailedPlace.currentOpeningHours ? formatOpeningHours(detailedPlace.currentOpeningHours) : {},
      price_range: detailedPlace.priceLevel ? '$'.repeat(detailedPlace.priceLevel) : null, // Use null if unknown
      rating: detailedPlace.rating,
      user_ratings_total: detailedPlace.userRatingCount,
      place_id: place.id,
      photos: photos,
      image: mainImage,
      image_url: mainImage,
      guaranteedImageUrl: guaranteedImageUrl,
      search_metadata: searchMetadata // Pass through search metadata
    };

    // console.log(`Formatted spot: ${spotData.name}`, { hasPhotos: photos.length > 0, mainImage: spotData.image });
    return spotData;
  }));
  
  // Filter out any null results from failed processing
  return processedSpots.filter(Boolean); 
}

// Remove fetchFromYelp and fetchFromFacebook functions

// Since we no longer need to remove duplicates (only one source), simplify this function
function removeDuplicates(spots) {
  return spots; // Just return the spots as is since they're all from one source
}

async function testNearbySearch() {
  console.log('\nTesting Nearby Search API');
  try {
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
    
    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress", 
      "places.location",
      "places.addressComponents",
      "places.rating",
      "places.userRatingCount"
    ].join(',');
    
    const headers = {
      'X-Goog-Api-Key': googleApiKey,
      'X-Goog-FieldMask': fieldMask,
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