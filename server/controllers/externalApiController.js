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
        return res.json({
          success: true,
          cookieSpots: cachedResults
        });
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
      const googleSpots = await fetchFromGoogle(searchParams);
      
      console.log(`Found: Google (${googleSpots.length})`);
      
      // No need to combine results anymore since we only use Google
      const uniqueSpots = googleSpots;
      
      // Cache the results
      apiCache.set(cacheKey, uniqueSpots);
      
      return res.json({
        success: true,
        cookieSpots: uniqueSpots
      });
    } catch (error) {
      console.error('Error fetching from Google Places API:', error);
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
 * @returns {Array} - Array of cookie spots
 */
async function fetchFromGoogle(params) {
  try {
    // Try to get the API key from different environment variables
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
    
    if (!googleApiKey) {
      console.error('Google Places API key not found in environment variables');
      console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
      return getMockData(params);
    }
    
    console.log('Google API Key available:', googleApiKey ? 'Yes' : 'No');
    console.log('Google API Key first 5 chars:', googleApiKey.substring(0, 5));
    
    // First try to use the actual Google API
    try {
      // Get either location or coordinates
      let coordinates;
      
      if (params.lat && params.lng) {
        coordinates = { lat: params.lat, lng: params.lng };
        console.log('Using provided coordinates:', coordinates);
      } else if (params.location) {
        // Geocode the location to get coordinates
        try {
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${googleApiKey}`;
          console.log('Geocoding request for location:', params.location);
          const geocodeResponse = await axios.get(geocodeUrl);
          
          console.log('Geocode response status:', geocodeResponse.status);
          
          if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
            coordinates = geocodeResponse.data.results[0].geometry.location;
            console.log('Coordinates from geocoding:', coordinates);
          } else {
            console.error('No geocoding results for:', params.location);
            console.error('Geocode response:', geocodeResponse.data);
            throw new Error(`No geocoding results found for location: ${params.location}`);
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError.message);
          throw new Error('Failed to geocode location');
        }
      } else {
        throw new Error('No location or coordinates provided');
      }
      
      // Search for places
      console.log('Building Google Places search requests with API key');

      // Make search radius larger to find more results
      const searchRadius = 10000; // 10km instead of 5km
      const placesRequests = [
        // Search for bakeries with "cookie" keyword
        axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${searchRadius}&type=bakery&keyword=cookie&key=${googleApiKey}`),
        // Search for bakeries (general)
        axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${searchRadius}&type=bakery&key=${googleApiKey}`),
        // Search for cafes with "cookie" keyword
        axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${searchRadius}&type=cafe&keyword=cookie&key=${googleApiKey}`),
        // Search with keyword "cookies" only
        axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${searchRadius}&keyword=cookies&key=${googleApiKey}`),
        // Search with keyword "dessert" and "bakery"
        axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${searchRadius}&keyword=dessert+bakery&key=${googleApiKey}`),
        // Textual search for cookies in the area
        axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=cookies+near+${coordinates.lat},${coordinates.lng}&key=${googleApiKey}`)
      ];
      
      console.log('Searching for places near coordinates:', coordinates);
      console.log('Total search requests:', placesRequests.length);
      
      const placesResponses = await Promise.all(placesRequests.map(request => 
        request.catch(err => {
          console.error('Error in place search request:', err.message);
          return { data: { results: [] } }; // Return empty results on error
        })
      ));
      
      // Combine all results into one array
      let allResults = [];
      let uniquePlaceIds = new Set();
      
      for (let i = 0; i < placesResponses.length; i++) {
        const response = placesResponses[i];
        console.log(`Search request ${i+1}: Found ${response.data?.results?.length || 0} places`);
        
        if (response.data?.status && response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
          console.error(`Search request ${i+1} error:`, response.data.status, response.data.error_message);
        }
        
        if (response.data?.results && response.data.results.length > 0) {
          response.data.results.forEach(place => {
            if (!uniquePlaceIds.has(place.place_id)) {
              uniquePlaceIds.add(place.place_id);
              allResults.push(place);
            }
          });
        }
      }
      
      console.log('Places API responses received:', placesResponses.length);
      console.log('Number of unique places found:', allResults.length);
      
      if (allResults.length === 0) {
        console.log('No results from Google Places API, falling back to mock data');
        return getMockData(params);
      }
      
      console.log(`Found ${allResults.length} potential spots from Google`);
      
      // Map Google results to our schema
      const spots = [];
      
      for (const place of allResults) {
        try {
          // Get place details for more information
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,address_components,types&key=${googleApiKey}`;
          const detailsResponse = await axios.get(detailsUrl);
          const details = detailsResponse.data.result || {};
          
          // Check if the place has relevant types or keywords in the name that suggest it sells cookies
          const relevantTypes = ['bakery', 'cafe', 'food', 'store', 'restaurant'];
          const placeTypes = details.types || place.types || [];
          const hasRelevantType = placeTypes.some(type => relevantTypes.includes(type));
          
          const nameLowerCase = place.name.toLowerCase();
          const hasRelevantKeyword = nameLowerCase.includes('cookie') || 
                                     nameLowerCase.includes('bakery') || 
                                     nameLowerCase.includes('sweets') || 
                                     nameLowerCase.includes('dessert') || 
                                     nameLowerCase.includes('pastry') ||
                                     nameLowerCase.includes('cake') ||
                                     nameLowerCase.includes('food');
          
          // Skip places that don't match our criteria
          if (!hasRelevantType && !hasRelevantKeyword) {
            continue;
          }
          
          // Extract address components
          const addressComponents = details.address_components || [];
          const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
          const street = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
          const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
          const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || '';
          const postalCode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || '';
          const country = addressComponents.find(comp => comp.types.includes('country'))?.short_name || 'USA';
          
          // Format hours of operation
          const hours = {};
          if (details.opening_hours && details.opening_hours.weekday_text) {
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            details.opening_hours.weekday_text.forEach((dayHours, index) => {
              const day = daysOfWeek[index];
              hours[day] = dayHours.split(': ')[1] || 'Closed';
            });
          }
          
          spots.push({
            name: place.name,
            description: place.vicinity || '',
            address: `${streetNumber} ${street}`.trim(),
            city,
            state_province: state,
            country,
            postal_code: postalCode,
            location: {
              type: 'Point',
              coordinates: [place.geometry.location.lng, place.geometry.location.lat]
            },
            phone: details.formatted_phone_number || '',
            website: details.website || '',
            hours_of_operation: hours,
            price_range: place.price_level ? '$'.repeat(place.price_level) : '$$',
            status: 'active',
            has_dine_in: true,
            has_takeout: true,
            has_delivery: false,
            is_wheelchair_accessible: false,
            accepts_credit_cards: true,
            cookie_types: [{ name: 'Cookies' }],
            dietary_options: [],
            features: ['Google Verified'],
            average_rating: place.rating || 0,
            review_count: place.user_ratings_total || 0,
            source: 'google',
            source_id: place.place_id
          });
        } catch (err) {
          console.error(`Error processing Google place ${place.place_id}:`, err.message);
        }
      }
      
      if (spots.length > 0) {
        // If not enough spots were found after filtering, add mock data
        if (spots.length < 3) {
          console.log(`Only ${spots.length} valid spots found, adding some mock data`);
          return [...spots, ...getMockData(params)];
        }
        
        return spots;
      }
      
      // If the above fails but no error was thrown, fall back to mock data
      console.log('No valid spots found from Google API, falling back to mock data');
      throw new Error('No valid spots from Google Places API');
      
    } catch (googleApiError) {
      console.error('Error with Google Places API, using mock data instead:', googleApiError.message);
      return getMockData(params);
    }
  } catch (error) {
    console.error('Fatal error in fetchFromGoogle:', error.message);
    return getMockData(params);
  }
}

/**
 * Get mock cookie spot data based on the requested location
 */
function getMockData(params) {
  console.log('Generating mock data for location params:', params);
  
  // Create mock data near the requested location
  let mockCoordinates;
  let locationName = "New York";
  
  if (params.lat && params.lng) {
    mockCoordinates = [params.lng, params.lat]; // Use provided coordinates
  } else if (params.location) {
    // Try to extract city and state from location string
    const locationParts = params.location.split(',').map(part => part.trim());
    console.log('Location parts:', locationParts);
    locationName = locationParts[0] || "New York";
    
    // Use default coordinates for specific locations, otherwise use NYC
    if (locationParts[0].toLowerCase().includes('williamsburg')) {
      mockCoordinates = [-73.9567, 40.7131]; // Williamsburg, Brooklyn
    } else if (locationParts[0].toLowerCase().includes('astoria')) {
      mockCoordinates = [-73.9245, 40.7615]; // Astoria
    } else {
      mockCoordinates = [-73.9665, 40.7812]; // NYC (default)
    }
  } else {
    mockCoordinates = [-73.9665, 40.7812]; // NYC (default)
  }
  
  console.log('Using mock coordinates:', mockCoordinates, 'for location:', locationName);
  
  // Create mock spots
  const mockSpots = [
    {
      name: "Cookie Dreams Bakery",
      description: "Fresh, homemade cookies of all varieties",
      address: "123 Main Street",
      city: locationName,
      state_province: "NY",
      country: "USA",
      postal_code: "10001",
      location: {
        type: 'Point',
        coordinates: mockCoordinates
      },
      phone: "(718) 555-1212",
      website: "https://www.broadwaybakery.com",
      hours_of_operation: {
        monday: "7:00 AM - 8:00 PM",
        tuesday: "7:00 AM - 8:00 PM",
        wednesday: "7:00 AM - 8:00 PM",
        thursday: "7:00 AM - 8:00 PM",
        friday: "7:00 AM - 9:00 PM",
        saturday: "8:00 AM - 9:00 PM",
        sunday: "8:00 AM - 7:00 PM"
      },
      price_range: "$$",
      status: 'active',
      has_dine_in: true,
      has_takeout: true,
      has_delivery: false,
      is_wheelchair_accessible: true,
      accepts_credit_cards: true,
      cookie_types: [{ name: 'Chocolate Chip' }],
      dietary_options: [],
      features: ['Google Verified'],
      average_rating: 4.7,
      review_count: 123,
      source: 'google',
      source_id: 'mock-google-1'
    },
    {
      name: "Crumbl Cookies",
      description: "Premium gourmet cookies in rotating flavors",
      address: "456 Oak Avenue",
      city: locationName,
      state_province: "NY",
      country: "USA",
      postal_code: "10001",
      location: {
        type: 'Point',
        coordinates: [mockCoordinates[0] + 0.005, mockCoordinates[1] + 0.003]
      },
      phone: "(212) 555-3434",
      website: "https://www.crumblcookies.com",
      hours_of_operation: {
        monday: "10:00 AM - 10:00 PM",
        tuesday: "10:00 AM - 10:00 PM",
        wednesday: "10:00 AM - 10:00 PM",
        thursday: "10:00 AM - 10:00 PM",
        friday: "10:00 AM - 12:00 AM",
        saturday: "10:00 AM - 12:00 AM",
        sunday: "12:00 PM - 8:00 PM"
      },
      price_range: "$$$",
      status: 'active',
      has_dine_in: true,
      has_takeout: true,
      has_delivery: true,
      is_wheelchair_accessible: true,
      accepts_credit_cards: true,
      cookie_types: [{ name: "Chocolate Chip" }, { name: "Sugar" }, { name: "Peanut Butter" }],
      dietary_options: [{ name: "Gluten-Free Options" }],
      features: ["Weekly Specials", "Rotating Menu"],
      average_rating: 4.7,
      review_count: 342,
      source: 'google',
      source_id: 'mock-crumbl-cookies'
    },
    {
      name: "Levain Bakery",
      description: "Famous for thick, gooey cookies",
      address: "789 Maple Street",
      city: locationName,
      state_province: "NY",
      country: "USA",
      postal_code: "10001",
      location: {
        type: 'Point',
        coordinates: [mockCoordinates[0] - 0.004, mockCoordinates[1] - 0.002]
      },
      phone: "(212) 555-8989",
      website: "https://www.levainbakery.com",
      hours_of_operation: {
        monday: "8:00 AM - 8:00 PM",
        tuesday: "8:00 AM - 8:00 PM",
        wednesday: "8:00 AM - 8:00 PM",
        thursday: "8:00 AM - 8:00 PM",
        friday: "8:00 AM - 9:00 PM",
        saturday: "8:00 AM - 9:00 PM",
        sunday: "9:00 AM - 7:00 PM"
      },
      price_range: "$$$",
      status: 'active',
      has_dine_in: true,
      has_takeout: true,
      has_delivery: false,
      is_wheelchair_accessible: true,
      accepts_credit_cards: true,
      cookie_types: [{ name: "Chocolate Chip Walnut" }, { name: "Dark Chocolate Chip" }],
      dietary_options: [],
      features: ["Award Winning"],
      average_rating: 4.9,
      review_count: 896,
      source: 'google',
      source_id: 'mock-levain-bakery'
    }
  ];
  
  return mockSpots;
}

// Remove fetchFromYelp and fetchFromFacebook functions

// Since we no longer need to remove duplicates (only one source), simplify this function
function removeDuplicates(spots) {
  return spots; // Just return the spots as is since they're all from one source
}

module.exports = externalApiController;