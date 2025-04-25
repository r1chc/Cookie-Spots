// src/utils/externalApiService.js

import axios from 'axios';

/**
 * Service for fetching cookie spot data from external APIs
 * (Google Places)
 */

// Create an axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enable debug mode for testing
const DEBUG_MODE = true;

/**
 * Helper function to format hours from Google API periods format to our app format
 * @param {Array|Object} hours - Hours data from Google API
 * @returns {Object} - Formatted hours in our app format
 */
const formatHoursOfOperation = (hours) => {
  // If we already have the correct format, just return it
  if (hours && typeof hours === 'object' && !Array.isArray(hours) && 
      (hours.monday || hours.tuesday || hours.wednesday || hours.thursday || 
       hours.friday || hours.saturday || hours.sunday)) {
    return hours;
  }
  
  // Initialize empty hours object
  const formattedHours = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null
  };
  
  // If we have weekday_text, use that to format hours (from old Google Places API)
  if (hours && hours.weekday_text && Array.isArray(hours.weekday_text)) {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    hours.weekday_text.forEach((dayHours, index) => {
      const day = daysOfWeek[index];
      formattedHours[day] = dayHours.split(': ')[1] || 'Closed';
    });
    return formattedHours;
  }
  
  // If we have periods (from new Google Places API), format them
  if (hours && Array.isArray(hours)) {
    // GoogleAPI periods are indexed by day of week (0 = Sunday, 1 = Monday, etc.)
    // We need to map them to our format
    const daysMap = {
      0: 'sunday',
      1: 'monday', 
      2: 'tuesday', 
      3: 'wednesday', 
      4: 'thursday', 
      5: 'friday', 
      6: 'saturday'
    };
    
    // For each period, extract opening and closing times
    hours.forEach(period => {
      if (period && period.open) {
        const dayNum = period.open.day;
        const day = daysMap[dayNum];
        
        if (day) {
          const openHour = parseInt(period.open.hour || 0);
          const openMinute = parseInt(period.open.minute || 0);
          let openTime = '';
          
          // Format opening time
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
    
    return formattedHours;
  }
  
  return formattedHours;
};

/**
 * Helper function to determine if a business is cookie-related
 * @param {Object} spot - Business spot to check
 * @returns {boolean} - True if the business is likely cookie-related
 */
const isCookieRelatedBusiness = (spot) => {
  if (!spot || !spot.name) return false;
  
  // Strong cookie indicators - exact matches we definitely want to include
  const strongCookieKeywords = ['cookie', 'bakery', 'pastry', 'dessert', 'cake', 'sweet', 'patisserie'];
  
  // Secondary indicators - increase confidence but not definitive
  const secondaryCookieKeywords = ['bake', 'cafe', 'coffee'];
  
  // Definitely not cookie related - exclude these
  const exclusionKeywords = ['uniqlo', 'bagel', 'clothing', 'apparel', 'store', 'market', 'pizza', 
                            'restaurant', 'hardware', 'salon', 'cleaners', 'bank', 'gas', 'pharmacy'];
                            
  const name = (spot.name || '').toLowerCase();
  const description = (spot.description || '').toLowerCase();
  
  // Immediately exclude if name contains exclusion keywords
  if (exclusionKeywords.some(keyword => name.includes(keyword))) {
    return false;
  }

  // Strong match if name contains any of the strong cookie keywords
  if (strongCookieKeywords.some(keyword => name.includes(keyword))) {
    return true;
  }
  
  // Look for secondary indicators in the name
  const hasSecondaryKeyword = secondaryCookieKeywords.some(keyword => name.includes(keyword));
  
  // If spot has cookie types defined, it's likely a cookie spot
  if (spot.cookie_types && spot.cookie_types.length > 0) {
    return true;
  }
  
  // Check if the description mentions cookies
  if (description.includes('cookie') || description.includes('bakery') || description.includes('cake')) {
    return true;
  }
  
  // No strong indicators, but has secondary keywords
  return hasSecondaryKeyword;
};

/**
 * Fetch cookie spots from Google Places API
 * @param {Object} params - Search parameters (location or coordinates)
 * @returns {Promise} - Promise that resolves with results and viewport information
 */
export const fetchFromAllSources = async (params = {}) => {
  try {
    // We expect either a location string or lat/lng coordinates
    if (!params.location && !(params.lat && params.lng)) {
      throw new Error('Either location or coordinates required');
    }
    
    // Generate cache key for debugging
    const cacheKey = params.location 
      ? `all-sources-${params.location}` 
      : `all-sources-${params.lat}-${params.lng}`;
    console.log(`Requesting data for cache key: ${cacheKey}`);
    
    // Add debug flag to params
    const requestParams = { ...params, debug: DEBUG_MODE };
    
    // Call our backend endpoint that integrates with Google Places API
    const response = await api.post('/external/all-sources', requestParams);
    
    // Check if response includes a cached flag
    const isFromCache = response.data?.fromCache === true;
    
    if (response.data && response.data.cookieSpots) {
      if (isFromCache) {
        console.log(`Received ${response.data.cookieSpots.length} cookie spots from server cache of external APIs`);
      } else {
        console.log(`Fetched ${response.data.cookieSpots.length} cookie spots from Google Places API (fresh call)`);
      }
      
      // Return both the cookie spots and the viewport information
      return {
        cookieSpots: response.data.cookieSpots,
        viewport: response.data.viewport || null,
        search_metadata: response.data.search_metadata || null,
        fromCache: isFromCache
      };
    }
    
    return { cookieSpots: [], viewport: null, search_metadata: null, fromCache: false };
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx range
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    return { cookieSpots: [], viewport: null, search_metadata: null, fromCache: false };
  }
};

/**
 * Process raw cookie spots from Google Places API to match our app's data structure
 * @param {Array} cookieSpots - Raw cookie spots from external APIs
 * @param {Object} viewport - Viewport information for the location search
 * @param {Object} search_metadata - Search metadata from the API response
 * @returns {Object} - Processed cookie spots with unified structure and viewport info
 */
export const processExternalCookieSpots = (cookieSpots = [], viewport = null, search_metadata = null) => {
  if (!cookieSpots || !Array.isArray(cookieSpots) || cookieSpots.length === 0) {
    return { spots: [], viewport, search_metadata };
  }
  
  console.log('Processing cookie spots with hours data:', 
    cookieSpots.map(spot => ({
      name: spot.name,
      hours_original: spot.hours_of_operation,
      has_hours: Boolean(spot.hours_of_operation && Object.keys(spot.hours_of_operation).length > 0)
    }))
  );
  
  const processedSpots = cookieSpots.map(spot => {
    // Generate a client-side ID if not present
    const id = spot._id || spot.id || spot.place_id || `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Debug log for photos
    if (spot.photos && Array.isArray(spot.photos)) {
      console.log(`Spot "${spot.name}" has ${spot.photos.length} photos. First photo:`, 
        spot.photos.length > 0 ? spot.photos[0] : 'none');
    }
    
    // Extract and normalize cookie types
    let cookieTypes = [];
    if (spot.cookie_types) {
      cookieTypes = Array.isArray(spot.cookie_types)
        ? spot.cookie_types
        : typeof spot.cookie_types === 'string'
          ? spot.cookie_types.split(',').map(type => type.trim())
          : [];
    }
    
    // Format hours of operation
    const hours_of_operation = formatHoursOfOperation(spot.hours_of_operation);
    
    // Debug log for the specific spot
    if (DEBUG_MODE) {
      console.log(`Hours for ${spot.name}:`, 
        { 
          original: spot.hours_of_operation,
          formatted: hours_of_operation,
          has_original: Boolean(spot.hours_of_operation), 
          has_formatted: Boolean(hours_of_operation && Object.keys(hours_of_operation).some(day => hours_of_operation[day]))
        }
      );
    }
    
    // Return normalized cookie spot
    return {
      _id: id,
      name: spot.name,
      description: spot.description || spot.vicinity || '',
      address: spot.address || spot.vicinity || '',
      city: spot.city || '',
      state_province: spot.state_province || '',
      country: spot.country || 'USA',
      postal_code: spot.postal_code || '',
      location: spot.location || {
        type: 'Point',
        coordinates: [spot.lng || spot.longitude || 0, spot.lat || spot.latitude || 0]
      },
      phone: spot.phone || spot.formatted_phone_number || '',
      website: spot.website || spot.url || '',
      hours_of_operation,
      price_range: spot.price_range || (spot.price_level ? '$'.repeat(spot.price_level) : '$$'),
      has_dine_in: spot.has_dine_in || false,
      has_takeout: spot.has_takeout || true,
      has_delivery: spot.has_delivery || false,
      is_wheelchair_accessible: spot.is_wheelchair_accessible || false,
      accepts_credit_cards: spot.accepts_credit_cards || true,
      cookie_types: cookieTypes,
      dietary_options: spot.dietary_options || [],
      features: spot.features || [],
      average_rating: spot.average_rating || spot.rating || 0,
      review_count: spot.review_count || spot.user_ratings_total || 0,
      source: spot.source || 'google',
      source_id: spot.source_id || id,
      // Add photos array if it exists in the original data
      photos: spot.photos && Array.isArray(spot.photos) ? spot.photos : [],
      place_id: spot.place_id || null, // Make sure place_id is passed through
      // Include any search metadata at the spot level if present
      search_metadata: spot.search_metadata || null
    };
  });
  
  // Step 1: Filter out non-cookie-related spots
  const cookieRelatedSpots = processedSpots.filter(isCookieRelatedBusiness);
  
  // Step 2: If we have enough cookie-related spots, return only those
  if (cookieRelatedSpots.length >= 5) {
    console.log(`Found ${cookieRelatedSpots.length} cookie-related spots, filtering out non-cookie businesses`);
    return { 
      spots: cookieRelatedSpots, 
      viewport, 
      search_metadata 
    };
  }
  
  // Step 3: If we don't have enough, sort to prioritize cookie-related spots
  console.log(`Only found ${cookieRelatedSpots.length} exact cookie-related spots, prioritizing them in results`);
  const sortedSpots = processedSpots.sort((a, b) => {
    const aIsCookie = isCookieRelatedBusiness(a);
    const bIsCookie = isCookieRelatedBusiness(b);
    
    // Put cookie spots first
    if (aIsCookie && !bIsCookie) return -1;
    if (!aIsCookie && bIsCookie) return 1;
    
    // Then sort by rating
    return (b.average_rating || 0) - (a.average_rating || 0);
  });
  
  return { 
    spots: sortedSpots, 
    viewport, 
    search_metadata 
  };
};

/**
 * Main function to fetch, process and return cookie spots from Google Places API
 * @param {Object|string} location - Location object or string
 * @returns {Promise} - Promise that resolves with processed cookie spots, viewport and search metadata
 */
export const getAllSourceCookieSpots = async (location) => {
  try {
    let params = {};
    
    // Process different location input formats
    if (typeof location === 'string') {
      params = { location };
    } else if (location && location.latitude && location.longitude) {
      params = { 
        lat: location.latitude, 
        lng: location.longitude 
      };
    } else if (location && location.city) {
      let locationString = location.city;
      if (location.state) {
        locationString += `, ${location.state}`;
      }
      params = { location: locationString };
    }
    
    console.log('Getting cookie spots from Google Places API with params:', params);
    
    // Fetch raw data from Google Places API
    const rawResult = await fetchFromAllSources(params);
    
    // Process the raw data (this will return an object with spots, viewport and search_metadata)
    const result = processExternalCookieSpots(
      rawResult.cookieSpots || [], 
      rawResult.viewport || null,
      rawResult.search_metadata || null
    );
    
    // Add the fromCache flag to the result
    result.fromCache = rawResult.fromCache || false;
    
    // Log the search metadata if available
    if (result.search_metadata) {
      console.log('Search metadata received:', result.search_metadata);
    }
    
    // If results were from cache, log it clearly
    if (result.fromCache) {
      console.log('✓ Results were served from cache - no external API calls were made');
    }
    
    return result;
  } catch (error) {
    console.error('Error in getAllSourceCookieSpots:', error);
    return { spots: [], viewport: null, search_metadata: null };
  }
};

export default {
  fetchFromAllSources,
  processExternalCookieSpots,
  getAllSourceCookieSpots
};