// server/controllers/externalApiController.js

const axios = require('axios');
const config = require('../config/config');
const NodeCache = require('node-cache');

// Create a cache with TTL of 1 hour (in seconds)
const apiCache = new NodeCache({ stdTTL: 3600 });

/**
 * Controller for handling external API requests
 */
const externalApiController = {
  /**
   * Fetch cookie spots from all sources (Google, Yelp, Facebook)
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
      let searchParams = {};
      if (lat && lng) {
        searchParams = { lat, lng };
      } else if (location) {
        searchParams = { location };
      }
      
      // Parallel fetch from all three APIs
      const [googleSpots, yelpSpots, facebookSpots] = await Promise.all([
        fetchFromGoogle(searchParams),
        fetchFromYelp(searchParams),
        fetchFromFacebook(searchParams)
      ]);
      
      console.log(`Found: Google (${googleSpots.length}), Yelp (${yelpSpots.length}), Facebook (${facebookSpots.length})`);
      
      // Combine results, avoiding duplicates
      const allSpots = [...googleSpots, ...yelpSpots, ...facebookSpots];
      const uniqueSpots = removeDuplicates(allSpots);
      
      // Cache the results
      apiCache.set(cacheKey, uniqueSpots);
      
      return res.json({
        success: true,
        cookieSpots: uniqueSpots
      });
    } catch (error) {
      console.error('Error fetching from all sources:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching cookie spots from external sources',
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
    const googleApiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      console.error('Google Places API key not found');
      return [];
    }
    
    // Get either location or coordinates
    let location;
    let coordinates;
    
    if (params.lat && params.lng) {
      coordinates = { lat: params.lat, lng: params.lng };
    } else if (params.location) {
      // Geocode the location to get coordinates
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${googleApiKey}`;
      const geocodeResponse = await axios.get(geocodeUrl);
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        coordinates = geocodeResponse.data.results[0].geometry.location;
        location = params.location;
      } else {
        return [];
      }
    } else {
      return [];
    }
    
    // Search for cookie shops near these coordinates
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=5000&type=bakery&keyword=cookie&key=${googleApiKey}`;
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
      
      return {
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
      };
    }));
    
    return spots;
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return [];
  }
}

/**
 * Fetch cookie spots from Yelp API
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of cookie spots
 */
async function fetchFromYelp(params) {
  try {
    const yelpApiKey = process.env.YELP_API_KEY;
    if (!yelpApiKey) {
      console.error('Yelp API key not found');
      return [];
    }
    
    // Build the search term
    let location;
    
    if (params.lat && params.lng) {
      // Use coordinates for Yelp search
      location = `${params.lat},${params.lng}`;
    } else if (params.location) {
      location = params.location;
    } else {
      return [];
    }
    
    // Search for cookie businesses
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=cookies&location=${encodeURIComponent(location)}&categories=bakeries&limit=50`;
    const response = await axios.get(yelpUrl, {
      headers: {
        Authorization: `Bearer ${yelpApiKey}`
      }
    });
    
    if (!response.data.businesses) {
      console.error('No results from Yelp API');
      return [];
    }
    
    // Map Yelp results to our schema
    const spots = await Promise.all(response.data.businesses.map(async (business) => {
      // Get business details if needed
      let details = business;
      
      // If you need more details, uncomment this block
      /* 
      try {
        const detailsUrl = `https://api.yelp.com/v3/businesses/${business.id}`;
        const detailsResponse = await axios.get(detailsUrl, {
          headers: {
            Authorization: `Bearer ${yelpApiKey}`
          }
        });
        details = detailsResponse.data;
      } catch (err) {
        console.error(`Error fetching details for ${business.id}:`, err);
      }
      */
      
      return {
        name: business.name,
        description: business.categories?.map(cat => cat.title).join(', ') || '',
        address: business.location.address1 || '',
        city: business.location.city || '',
        state_province: business.location.state || '',
        country: business.location.country || 'USA',
        postal_code: business.location.zip_code || '',
        location: {
          type: 'Point',
          coordinates: [business.coordinates.longitude, business.coordinates.latitude]
        },
        phone: business.phone || '',
        website: business.url || '',
        hours_of_operation: {},
        price_range: business.price || '$$',
        has_dine_in: true,
        has_takeout: business.transactions?.includes('pickup') || false,
        has_delivery: business.transactions?.includes('delivery') || false,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        cookie_types: [{ name: 'Cookies' }],
        dietary_options: [],
        features: ['Yelp Verified'],
        average_rating: business.rating || 0,
        review_count: business.review_count || 0,
        source: 'yelp',
        source_id: business.id
      };
    }));
    
    return spots;
  } catch (error) {
    console.error('Error fetching from Yelp API:', error);
    return [];
  }
}

/**
 * Fetch cookie spots from Facebook API
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of cookie spots
 */
async function fetchFromFacebook(params) {
  try {
    const fbAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!fbAccessToken) {
      console.error('Facebook access token not found');
      return [];
    }
    
    // Build the search term
    let location;
    let center;
    
    if (params.lat && params.lng) {
      center = `${params.lat},${params.lng}`;
    } else if (params.location) {
      location = params.location;
      // For Facebook, we might need to geocode the location
      // For simplicity, we'll skip that here
      center = location;
    } else {
      return [];
    }
    
    // Search for places near this location
    const searchUrl = `https://graph.facebook.com/v17.0/search?type=place&q=cookie bakery&center=${encodeURIComponent(center)}&distance=10000&fields=name,location,overall_star_rating,price_range,phone,website,hours,category_list&access_token=${fbAccessToken}`;
    const response = await axios.get(searchUrl);
    
    if (!response.data.data) {
      console.error('No results from Facebook Graph API');
      return [];
    }
    
    // Map Facebook results to our schema
    const spots = response.data.data.map(place => {
      // Format hours of operation
      const hours = {};
      if (place.hours) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          hours[day] = place.hours[day + '_1_open'] && place.hours[day + '_1_close'] 
            ? `${place.hours[day + '_1_open']} - ${place.hours[day + '_1_close']}` 
            : 'Closed';
        });
      }
      
      return {
        name: place.name,
        description: place.category_list?.map(cat => cat.name).join(', ') || '',
        address: place.location?.street || '',
        city: place.location?.city || '',
        state_province: place.location?.state || '',
        country: place.location?.country || 'USA',
        postal_code: place.location?.zip || '',
        location: {
          type: 'Point',
          coordinates: [place.location?.longitude || 0, place.location?.latitude || 0]
        },
        phone: place.phone || '',
        website: place.website || '',
        hours_of_operation: hours,
        price_range: place.price_range?.length ? '$'.repeat(place.price_range.length) : '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: false,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        cookie_types: [{ name: 'Cookies' }],
        dietary_options: [],
        features: ['Facebook Verified'],
        average_rating: place.overall_star_rating || 0,
        review_count: 0,
        source: 'facebook',
        source_id: place.id
      };
    });
    
    return spots;
  } catch (error) {
    console.error('Error fetching from Facebook Graph API:', error);
    return [];
  }
}

/**
 * Remove duplicate cookie spots
 * @param {Array} spots - Array of cookie spots
 * @returns {Array} - Array of unique cookie spots
 */
function removeDuplicates(spots) {
  const uniqueSpots = [];
  const seenBusinesses = new Map();
  
  for (const spot of spots) {
    // Create a unique key based on name and address
    const nameNormalized = spot.name.toLowerCase().trim();
    const addressNormalized = spot.address.toLowerCase().trim();
    const key = `${nameNormalized}|${addressNormalized}|${spot.city ? spot.city.toLowerCase() : ''}`;
    
    // If we haven't seen this business before, add it
    if (!seenBusinesses.has(key)) {
      seenBusinesses.set(key, true);
      uniqueSpots.push(spot);
    }
  }
  
  return uniqueSpots;
}

module.exports = externalApiController;