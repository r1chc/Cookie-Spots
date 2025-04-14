/**
 * API service for fetching cookie spot data
 */

import { getDefaultLocation } from './geolocation';
import { cookieSpotApi } from './api';

/**
 * Fetch cookie spots based on user location
 * @param {Object} location - Object containing location data
 * @returns {Array} Array of cookie spots near the location
 */
export const fetchCookieSpotsByLocation = async (location = null) => {
  try {
    // If no location is provided, use default
    const userLocation = location || getDefaultLocation();
    
    // Use coordinates to fetch from API if available
    if (userLocation.latitude && userLocation.longitude) {
      const response = await cookieSpotApi.getNearbyCookieSpots(
        userLocation.latitude,
        userLocation.longitude,
        5000, // 5km radius
        50    // Up to 50 results
      );
      
      console.log('API response:', response);
      
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    }
    
    // If coordinates didn't work or no results, try with location string
    if (userLocation.city || userLocation.formattedLocation) {
      const searchQuery = userLocation.formattedLocation || userLocation.city;
      return await searchCookieSpots(searchQuery);
    }
    
    // If all else fails, fetch all cookie spots (limited)
    const response = await cookieSpotApi.getAllCookieSpots({ limit: 10 });
    return response.data.cookieSpots || [];
    
  } catch (error) {
    console.error('Error fetching cookie spots by location:', error);
    // Return empty array on error
    return [];
  }
};

/**
 * Search for cookie spots by location string
 * @param {string} locationQuery - Location search query
 * @returns {Array} Array of cookie spots matching the search
 */
export const searchCookieSpots = async (locationQuery) => {
  try {
    // Call the API with the search parameter
    const response = await cookieSpotApi.getAllCookieSpots({ 
      search: locationQuery,
      limit: 50
    });
    
    console.log('Search API response:', response);
    
    // Return the results
    return response.data.cookieSpots || [];
  } catch (error) {
    console.error('Error searching cookie spots:', error);
    return [];
  }
};

/**
 * Fetch cookie spots from all sources (Google, Yelp, Facebook) for a location
 * This combines results from all three sources
 * @param {string|Object} location - Location string or object with coordinates
 * @returns {Array} Combined array of cookie spots from all sources
 */
export const fetchAllSourceCookieSpots = async (location) => {
  try {
    let searchParam = {};
    
    // Handle different location input formats
    if (typeof location === 'string') {
      searchParam = { location: location };
    } else if (location && location.latitude && location.longitude) {
      searchParam = { 
        lat: location.latitude, 
        lng: location.longitude 
      };
    } else if (location && location.city) {
      searchParam = { location: location.city };
      if (location.state) {
        searchParam.location += `, ${location.state}`;
      }
    }
    
    // Call our backend API that integrates all three sources
    const response = await fetch('/api/cookie-spots/all-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParam)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from external APIs');
    }
    
    const data = await response.json();
    console.log('All sources data:', data);
    
    return data.cookieSpots || [];
  } catch (error) {
    console.error('Error fetching from all sources:', error);
    // Fallback to standard search
    if (typeof location === 'string') {
      return await searchCookieSpots(location);
    } else if (location && (location.latitude || location.city)) {
      return await fetchCookieSpotsByLocation(location);
    }
    return [];
  }
};
