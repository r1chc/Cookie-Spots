/**
 * @route   POST /api/cookie-spots/all-sources
 * @desc    Fetch cookie spots from Google Places API
 * @access  Public
 */
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
    
    // Fetch from APIs using the seed.js functions
    const { fetchCookieSpots } = require('../seed');
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