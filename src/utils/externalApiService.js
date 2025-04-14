// src/utils/externalApiService.js

import axios from 'axios';

/**
 * Service for fetching and combining cookie spot data from external APIs
 * (Google Places, Yelp, and Facebook)
 */

// Create an axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch cookie spots from all external sources
 * @param {Object} params - Search parameters (location or coordinates)
 * @returns {Promise} - Promise that resolves with combined results
 */
export const fetchFromAllSources = async (params = {}) => {
  try {
    // We expect either a location string or lat/lng coordinates
    if (!params.location && !(params.lat && params.lng)) {
      throw new Error('Either location or coordinates required');
    }
    
    // Call our backend endpoint that integrates all three sources
    const response = await api.post('/cookie-spots/all-sources', params);
    
    if (response.data && response.data.cookieSpots) {
      console.log(`Fetched ${response.data.cookieSpots.length} cookie spots from all sources`);
      return response.data.cookieSpots;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from external APIs:', error);
    return [];
  }
};

/**
 * Process raw cookie spots from external APIs to match our app's data structure
 * @param {Array} cookieSpots - Raw cookie spots from external APIs
 * @returns {Array} - Processed cookie spots with unified structure
 */
export const processExternalCookieSpots = (cookieSpots = []) => {
  if (!cookieSpots || !Array.isArray(cookieSpots) || cookieSpots.length === 0) {
    return [];
  }
  
  return cookieSpots.map(spot => {
    // Create a unique ID if not present
    const id = spot._id || spot.id || `ext-${spot.source}-${spot.source_id || Math.random().toString(36).substring(2, 15)}`;
    
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
      source: spot.source || 'unknown',
      source_id: spot.source_id || id
    };
  });
};

/**
 * Main function to fetch, process and return cookie spots from all sources
 * @param {Object|string} location - Location object or string
 * @returns {Promise} - Promise that resolves with processed cookie spots
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
    
    // Fetch raw data from external APIs
    const rawCookieSpots = await fetchFromAllSources(params);
    
    // Process the raw data
    const processedSpots = processExternalCookieSpots(rawCookieSpots);
    
    return processedSpots;
  } catch (error) {
    console.error('Error in getAllSourceCookieSpots:', error);
    return [];
  }
};

export default {
  fetchFromAllSources,
  processExternalCookieSpots,
  getAllSourceCookieSpots
};