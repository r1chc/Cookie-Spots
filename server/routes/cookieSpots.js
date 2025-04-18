/**
 * @route   POST /api/cookie-spots/all-sources
 * @desc    Fetch cookie spots from Google Places API
 * @access  Public
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const express = require('express');
const { getZipCodesForNeighborhood } = require('../utils/neighborhoodUtils');

const router = express.Router();

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
    
    // Process in chunks of 3 to avoid overwhelming the API
    const chunkSize = 3;
    for (let i = 0; i < zipCodes.length; i += chunkSize) {
      const zipCodeBatch = zipCodes.slice(i, i + chunkSize);
      
      console.log(`Fetching batch ${Math.floor(i/chunkSize) + 1} of zip codes: ${zipCodeBatch.join(', ')}`);
      
      // Process batch concurrently
      const batchResults = await Promise.all(
        zipCodeBatch.map(zipCode => fetchCookieSpotsFromGoogle(zipCode))
      );
      
      // Add all results to the combined array
      batchResults.forEach((spots, index) => {
        console.log(`Found ${spots.length} spots for ZIP: ${zipCodeBatch[index]}`);
        allSpots = [...allSpots, ...spots];
      });
    }
    
    console.log(`Total combined: ${allSpots.length} spots from ${zipCodes.length} zip codes`);
    return allSpots;
  } catch (error) {
    console.error('Error fetching cookie spots:', error);
    return [];
  }
};

// Helper function to deduplicate cookie spots
const deduplicateSpots = (spots) => {
  if (!spots || !Array.isArray(spots)) return [];
  
  const uniqueSpots = [];
  const seenIds = new Set();
  const seenAddresses = new Set();
  
  for (const spot of spots) {
    // Skip if already seen
    if (!spot) continue;
    
    // Check by ID
    if (spot.source_id && seenIds.has(spot.source_id)) continue;
    if (spot.place_id && seenIds.has(spot.place_id)) continue;
    
    // Check by address
    const addressKey = `${spot.name}|${spot.address}`.toLowerCase();
    if (addressKey && seenAddresses.has(addressKey)) continue;
    
    // Add to unique spots
    uniqueSpots.push(spot);
    
    // Mark as seen
    if (spot.source_id) seenIds.add(spot.source_id);
    if (spot.place_id) seenIds.add(spot.place_id);
    if (addressKey) seenAddresses.add(addressKey);
  }
  
  return uniqueSpots;
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
          // First, check if this is a neighborhood and get multiple zip codes
          const neighborhoodZipCodes = await getZipCodesForNeighborhood(
            searchParams.location, 
            process.env.VITE_GOOGLE_PLACES_API_KEY
          );
          
          if (neighborhoodZipCodes.length > 0) {
            console.log(`Using ${neighborhoodZipCodes.length} zip codes for neighborhood: ${searchParams.location}`);
            zipCodes = neighborhoodZipCodes;
          } else {
            // Fall back to single zip code geocoding
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
    
    // Allow more zip codes for neighborhoods, but limit to a reasonable amount
    // to avoid excessive API calls
    zipCodes = zipCodes.slice(0, 8); // Increased from 3 to 8 for neighborhoods
    
    console.log(`Searching cookie spots in zip codes: ${zipCodes.join(', ')}`);
    
    // Use the local fetchCookieSpots function instead of importing from seed.js
    const cookieSpots = await fetchCookieSpots(zipCodes);
    
    // Deduplicate results since we might get the same spots from different zip codes
    const uniqueSpots = deduplicateSpots(cookieSpots);
    console.log(`Deduplicated from ${cookieSpots.length} to ${uniqueSpots.length} unique spots`);
    
    if (!uniqueSpots || uniqueSpots.length === 0) {
      console.log('No cookie spots found, checking API key status');
      if (!process.env.VITE_GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Google Places API key is not configured'
        });
      }
    }
    
    // Return the combined results with neighborhood metadata
    return res.json({ 
      success: true,
      zipCodes,
      cookieSpots: uniqueSpots,
      search_metadata: {
        search_type: zipCodes.length > 1 ? 'multi_zipcode' : 'single_zipcode',
        location: searchParams.location,
        zipcode_count: zipCodes.length
      }
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

module.exports = router; 