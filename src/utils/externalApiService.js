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
  
  const processedSpots = cookieSpots.map(spot => {
    // Generate a client-side ID if not present
    const id = spot._id || spot.id || spot.place_id || `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract and normalize cookie types
    let cookieTypes = [];
    if (spot.cookie_types) {
      cookieTypes = Array.isArray(spot.cookie_types)
        ? spot.cookie_types
        : typeof spot.cookie_types === 'string'
          ? spot.cookie_types.split(',').map(type => type.trim())
          : [];
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
      review_count: spot.review_count || 0,
      source: spot.source || 'google',
      source_id: spot.source_id || id,
      // Include any search metadata at the spot level if present
      search_metadata: spot.search_metadata || null
    };
  });
  
  return { 
    spots: processedSpots, 
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