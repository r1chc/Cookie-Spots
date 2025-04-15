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
    
    console.log('Fetching from Google Places API with params:', params);
    
    // Call our backend endpoint that integrates with Google Places API
    const response = await api.post('/external/all-sources', params);
    
    if (response.data && response.data.cookieSpots) {
      console.log(`Fetched ${response.data.cookieSpots.length} cookie spots from Google Places API`);
      
      // Return both the cookie spots and the viewport information
      return {
        cookieSpots: response.data.cookieSpots,
        viewport: response.data.viewport || null
      };
    }
    
    return { cookieSpots: [], viewport: null };
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
    return { cookieSpots: [], viewport: null };
  }
};

/**
 * Process raw cookie spots from Google Places API to match our app's data structure
 * @param {Array} cookieSpots - Raw cookie spots from external APIs
 * @param {Object} viewport - Viewport information for the location search
 * @returns {Object} - Processed cookie spots with unified structure and viewport info
 */
export const processExternalCookieSpots = (cookieSpots = [], viewport = null) => {
  if (!cookieSpots || !Array.isArray(cookieSpots) || cookieSpots.length === 0) {
    return { spots: [], viewport };
  }
  
  const processedSpots = cookieSpots.map(spot => {
    // Create a unique ID if not present
    const id = spot._id || spot.id || `ext-google-${spot.source_id || Math.random().toString(36).substring(2, 15)}`;
    
    // Process coordinates to ensure they're in the right format
    let coordinates = [0, 0]; // Default
    if (spot.location && spot.location.coordinates) {
      coordinates = spot.location.coordinates;
    } else if (spot.longitude && spot.latitude) {
      coordinates = [spot.longitude, spot.latitude];
    }
    
    // Extract cookie types and ensure they're in the right format
    let cookieTypes = [];
    if (spot.cookie_types && Array.isArray(spot.cookie_types)) {
      cookieTypes = spot.cookie_types.map(type => {
        if (typeof type === 'string') {
          return { _id: `type-${type}`, name: type };
        } else if (type && type.name) {
          return { _id: type._id || `type-${type.name}`, name: type.name };
        }
        return null;
      }).filter(Boolean);
    }
    
    // Unified structure that works with our app
    return {
      _id: id,
      id,
      name: spot.name || 'Unknown Cookie Spot',
      description: spot.description || '',
      address: spot.address || '',
      city: spot.city || '',
      state_province: spot.state_province || spot.state || '',
      country: spot.country || 'USA',
      postal_code: spot.postal_code || spot.zip_code || '',
      location: {
        type: 'Point',
        coordinates
      },
      phone: spot.phone || '',
      website: spot.website || '',
      hours_of_operation: spot.hours_of_operation || {},
      price_range: spot.price_range || '$$',
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
      source_id: spot.source_id || id
    };
  });
  
  return { spots: processedSpots, viewport };
};

/**
 * Main function to fetch, process and return cookie spots from Google Places API
 * @param {Object|string} location - Location object or string
 * @returns {Promise} - Promise that resolves with processed cookie spots and viewport
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
    
    // Process the raw data (this will return an object with spots and viewport)
    const result = processExternalCookieSpots(
      rawResult.cookieSpots || [], 
      rawResult.viewport || null
    );
    
    return result;
  } catch (error) {
    console.error('Error in getAllSourceCookieSpots:', error);
    return { spots: [], viewport: null };
  }
};

export default {
  fetchFromAllSources,
  processExternalCookieSpots,
  getAllSourceCookieSpots
};