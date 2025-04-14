/**
 * API service for fetching cookie spot data
 */

import { getDefaultLocation } from './geolocation';
import { cookieSpotApi } from './api';
import { getAllSourceCookieSpots } from './externalApiService';

/**
 * Fetch cookie spots based on user location
 * @param {Object} location - Object containing location data
 * @returns {Array} Array of cookie spots near the location
 */
export const fetchCookieSpotsByLocation = async (location = null) => {
  try {
    // If no location is provided, use default
    const userLocation = location || getDefaultLocation();
    console.log('Fetching cookie spots for location:', userLocation);
    
    // Use coordinates to fetch from API if available
    if (userLocation.latitude && userLocation.longitude) {
      const response = await cookieSpotApi.getNearbyCookieSpots(
        userLocation.latitude,
        userLocation.longitude,
        5000, // 5km radius
        50    // Up to 50 results
      );
      
      console.log('API response from internal database:', response);
      
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
    
    console.log('Search API response from internal database:', response);
    
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
    console.log('Fetching cookie spots from all external sources for location:', location);
    
    // Use our externalApiService to get results from all sources
    const cookieSpots = await getAllSourceCookieSpots(location);
    
    console.log(`Found ${cookieSpots.length} cookie spots from external sources`);
    
    return cookieSpots;
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

/**
 * Comprehensive search combining both database and external API results
 * @param {string|Object} location - Location string or object with coordinates
 * @returns {Array} Combined array of cookie spots from database and external APIs
 */
export const comprehensiveSearch = async (location) => {
  try {
    console.log('Performing comprehensive search for:', location);
    
    // Get results from both sources in parallel
    const [databaseResults, externalResults] = await Promise.all([
      typeof location === 'string' 
        ? searchCookieSpots(location) 
        : fetchCookieSpotsByLocation(location),
      fetchAllSourceCookieSpots(location)
    ]);
    
    console.log(`Found ${databaseResults.length} results from database and ${externalResults.length} from external APIs`);
    
    // Combine results, avoiding duplicates by checking ID/name/address
    const allResults = [...databaseResults];
    const seenIds = new Set(databaseResults.map(spot => spot._id));
    const seenNames = new Map();
    
    // Create a map of existing names/addresses for deduplication
    databaseResults.forEach(spot => {
      const key = `${spot.name.toLowerCase()}|${(spot.address || '').toLowerCase()}`;
      seenNames.set(key, true);
    });
    
    // Add external results that aren't duplicates
    externalResults.forEach(spot => {
      if (seenIds.has(spot._id)) return;
      
      const key = `${spot.name.toLowerCase()}|${(spot.address || '').toLowerCase()}`;
      if (seenNames.has(key)) return;
      
      allResults.push(spot);
      seenNames.set(key, true);
    });
    
    return allResults;
  } catch (error) {
    console.error('Error in comprehensive search:', error);
    return [];
  }
};