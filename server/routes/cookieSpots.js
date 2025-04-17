/**
 * @route   POST /api/cookie-spots/all-sources
 * @desc    Fetch cookie spots from Google Places API
 * @access  Public
 */

const axios = require('axios');
const NodeCache = require('node-cache');

// Create a cache with TTL of 14 days (in seconds)
const cookieSpotCache = new NodeCache({ stdTTL: 1209600 });

// Fetch cookie spots from Google Places API
const fetchCookieSpotsFromGoogle = async (zipCode) => {
  try {
    const cachedData = cookieSpotCache.get(`google-${zipCode}`);
    if (cachedData) {
      console.log(`Using cached Google data for ${zipCode}`);
      return cachedData;
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      console.error('Google Places API key not found');
      return [];
    }

    // First get coordinates for the zip code
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${googleApiKey}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.error(`No location found for zip code ${zipCode}`);
      return [];
    }
    
    const location = geocodeResponse.data.results[0].geometry.location;
    
    // Search for cookie shops near this location
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&type=bakery&keyword=cookie&key=${googleApiKey}`;
    const placesResponse = await axios.get(placesUrl);
    
    if (!placesResponse.data.results) {
      console.error('No results from Google Places API');
      return [];
    }
    
    // Map Google results to our schema
    const spots = await Promise.all(placesResponse.data.results.map(async (place) => {
      // Get place details for more information
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,address_components&key=${googleApiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      const details = detailsResponse.data.result || {};
      
      // Extract address components
      const addressComponents = details.address_components || [];
      const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
      const street = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
      const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || '';
      const postalCode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || zipCode;
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
      
      return {
        name: place.name,
        description: place.vicinity || '',
        address: `${streetNumber} ${street}`,
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
        // Default values for fields we can't get from Google
        has_dine_in: true,
        has_takeout: true,
        has_delivery: false,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        // These would need to be set manually or via another process
        cookie_types: [],
        dietary_options: [],
        features: ['Google Verified'],
        source: 'google',
        source_id: place.place_id
      };
    }));
    
    // Cache the results
    cookieSpotCache.set(`google-${zipCode}`, spots);
    return spots;
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return [];
  }
};

// Fetch and combine cookie spots from all APIs
const fetchCookieSpots = async (zipCodes = []) => {
  try {
    let allSpots = [];
    
    for (const zipCode of zipCodes) {
      console.log(`Fetching cookie spots for ZIP: ${zipCode}`);
      
      // Fetch only from Google Places API
      const googleSpots = await fetchCookieSpotsFromGoogle(zipCode);
      
      console.log(`Found: Google (${googleSpots.length})`);
      
      // Add to combined results
      allSpots = [...allSpots, ...googleSpots];
    }
    
    return allSpots;
  } catch (error) {
    console.error('Error fetching cookie spots:', error);
    return [];
  }
};

// Clear cache utility function
const clearCache = () => {
  cookieSpotCache.flushAll();
  console.log('Cache cleared');
};

router.post('/all-sources', async (req, res) => {
  try {
    const { location, lat, lng } = req.body;
    
    // Choose appropriate search parameters
    let searchParams;
    if (lat && lng) {
      searchParams = { lat, lng };
    } else if (location) {
      searchParams = { location };
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Either location or coordinates (lat/lng) are required' 
      });
    }
    
    console.log('Received search request with params:', searchParams);
    
    // Define search areas/zip codes based on provided location/coordinates
    let zipCodes = [];
    
    // For lat/lng, convert to zip code
    if (searchParams.lat && searchParams.lng) {
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${searchParams.lat},${searchParams.lng}&key=${process.env.VITE_GOOGLE_PLACES_API_KEY}`;
        console.log('Geocoding coordinates to zip code');
        const geocodeResponse = await axios.get(geocodeUrl);
        
        if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
          // Extract zip code from address components
          for (const result of geocodeResponse.data.results) {
            const postalComponent = result.address_components.find(
              comp => comp.types.includes('postal_code')
            );
            
            if (postalComponent) {
              zipCodes.push(postalComponent.long_name);
              console.log('Found zip code from coordinates:', postalComponent.long_name);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error getting zip code from coordinates:', error);
      }
    }
    
    // For location string, try to extract or determine zip codes
    if (searchParams.location && zipCodes.length === 0) {
      // Check if location itself is a zip code
      if (/^\d{5}$/.test(searchParams.location.trim())) {
        zipCodes.push(searchParams.location.trim());
        console.log('Using provided zip code:', searchParams.location.trim());
      } else {
        try {
          // Use geocoding to get zip code for location
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchParams.location)}&key=${process.env.VITE_GOOGLE_PLACES_API_KEY}`;
          console.log('Geocoding location to zip code:', searchParams.location);
          const geocodeResponse = await axios.get(geocodeUrl);
          
          if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
            // Extract zip code and nearby areas
            for (const result of geocodeResponse.data.results) {
              const postalComponent = result.address_components.find(
                comp => comp.types.includes('postal_code')
              );
              
              if (postalComponent) {
                zipCodes.push(postalComponent.long_name);
                console.log('Found zip code from location:', postalComponent.long_name);
              }
            }
          }
        } catch (error) {
          console.error('Error getting zip code from location:', error);
          console.error('Geocoding response:', error.response?.data);
        }
      }
    }
    
    // If we still don't have zip codes, use default ones
    if (zipCodes.length === 0) {
      // Use a default zip code based on location hints or a global default
      if (searchParams.location) {
        // Try to extract state or city keywords
        const locationLower = searchParams.location.toLowerCase();
        
        if (locationLower.includes('new york') || locationLower.includes('ny')) {
          zipCodes = ['10001', '10023', '10014', '10013'];
        } else if (locationLower.includes('los angeles') || locationLower.includes('la')) {
          zipCodes = ['90001', '90024', '90210', '90069'];
        } else if (locationLower.includes('chicago')) {
          zipCodes = ['60601', '60611', '60654', '60614'];
        } else {
          // Generic popular US zip codes as fallback
          zipCodes = ['10001', '90210', '60601', '94102', '02108'];
        }
        console.log('Using default zip codes for location:', zipCodes);
      } else {
        // Default to New York zip codes
        zipCodes = ['10001', '10023', '10014', '10013'];
        console.log('Using default New York zip codes:', zipCodes);
      }
    }
    
    // Limit to at most 3 zip codes to avoid excessive API calls
    zipCodes = zipCodes.slice(0, 3);
    
    console.log(`Searching cookie spots in zip codes: ${zipCodes.join(', ')}`);
    
    // Use the local fetchCookieSpots function instead of importing from seed.js
    const cookieSpots = await fetchCookieSpots(zipCodes);
    
    if (!cookieSpots || cookieSpots.length === 0) {
      console.log('No cookie spots found, checking API key status');
      if (!process.env.VITE_GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Google Places API key is not configured'
        });
      }
    }
    
    // Return the combined results
    return res.json({ 
      success: true,
      zipCodes,
      cookieSpots
    });
    
  } catch (error) {
    console.error('Error fetching from all sources:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
}); 