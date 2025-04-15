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
      
      console.log('API response from internal database (cache):', response);
      
      // Check if we have any results from the cache
      if (response && response.data && response.data.length > 0) {
        console.log(`Found ${response.data.length} cached results in MongoDB`);
        return response.data;
      }
      
      // If no cached results in MongoDB, fetch from external APIs
      console.log('No cached results found, fetching from external APIs');
      const externalResults = await fetchAllSourceCookieSpots({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      
      if (externalResults && externalResults.length > 0) {
        return externalResults;
      }
    }
    
    // If coordinates didn't work or no results, try with location string
    if (userLocation.city || userLocation.formattedLocation) {
      const searchQuery = userLocation.formattedLocation || userLocation.city;
      // Try to get cached results for this location string
      const cachedResults = await searchCookieSpots(searchQuery);
      
      if (cachedResults && cachedResults.length > 0) {
        console.log(`Found ${cachedResults.length} cached results for "${searchQuery}"`);
        return cachedResults;
      }
      
      // If no cached results, get from external APIs
      console.log(`No cached results for "${searchQuery}", fetching from external APIs`);
      return await fetchAllSourceCookieSpots(searchQuery);
    }
    
    // If all else fails, fetch all cookie spots (limited)
    const response = await cookieSpotApi.getAllCookieSpots({ limit: 10 });
    if (response?.data?.cookieSpots?.length > 0) {
      return response.data.cookieSpots;
    }
    
    // Last resort - try external APIs with default location
    return await fetchAllSourceCookieSpots(getDefaultLocation());
    
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
    console.log(`Searching cache for cookie spots matching: "${locationQuery}"`);
    
    // Call the API with the search parameter to check cached results
    const response = await cookieSpotApi.getAllCookieSpots({ 
      search: locationQuery,
      limit: 50
    });
    
    if (response && response.data && response.data.cookieSpots) {
      console.log(`Found ${response.data.cookieSpots.length} cached results in MongoDB for "${locationQuery}"`);
      return response.data.cookieSpots;
    } else {
      console.log(`No cached results found in MongoDB for "${locationQuery}"`);
      return [];
    }
  } catch (error) {
    console.error('Error searching cookie spots in cache:', error);
    return [];
  }
};

/**
 * Fetch cookie spots from Google Places API for a location
 * @param {string|Object} location - Location string or object with coordinates
 * @returns {Array} Array of cookie spots from Google Places API
 */
export const fetchAllSourceCookieSpots = async (location) => {
  try {
    console.log('Fetching cookie spots from Google Places API for location:', location);
    
    // Make sure we have a valid location
    if (!location) {
      console.error('Invalid location provided to fetchAllSourceCookieSpots');
      return [];
    }
    
    // Log the exact format of the location for debugging
    if (typeof location === 'string') {
      console.log('Location is a string:', location);
    } else {
      console.log('Location is an object:', JSON.stringify(location));
    }
    
    // Use our externalApiService to get results from Google Places API
    const cookieSpots = await getAllSourceCookieSpots(location);
    
    // Log the response details
    console.log(`Found ${cookieSpots.length} cookie spots from Google Places API`);
    if (cookieSpots.length === 0) {
      console.log('No results received from Google Places API');
    } else {
      console.log('First result example:', cookieSpots[0].name);
    }
    
    return cookieSpots;
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    
    // If there's a specific error message, log it for debugging
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    }
    
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
 * Comprehensive search combining both database cache and Google Places API results
 * @param {string|Object} location - Location string or object with coordinates
 * @returns {Array} Combined array of cookie spots from database cache and Google Places API
 */
export const comprehensiveSearch = async (location) => {
  try {
    console.log('Performing comprehensive search for:', location);
    
    // Get results from both sources in parallel
    const [cacheResults, googleResults] = await Promise.all([
      typeof location === 'string' 
        ? searchCookieSpots(location) 
        : fetchCookieSpotsByLocation(location),
      fetchAllSourceCookieSpots(location)
    ]);
    
    console.log(`Found ${cacheResults.length} results from cache and ${googleResults.length} from Google Places API`);
    
    // Combine results, avoiding duplicates by checking ID/name/address
    const allResults = [...cacheResults];
    const seenIds = new Set(cacheResults.map(spot => spot._id));
    const seenNames = new Map();
    
    // Create a map of existing names/addresses for deduplication
    cacheResults.forEach(spot => {
      const key = `${spot.name.toLowerCase()}|${(spot.address || '').toLowerCase()}`;
      seenNames.set(key, true);
    });
    
    // Add Google results that aren't duplicates
    googleResults.forEach(spot => {
      if (seenIds.has(spot._id)) return;
      
      const key = `${spot.name.toLowerCase()}|${(spot.address || '').toLowerCase()}`;
      if (seenNames.has(key)) return;
      
      allResults.push(spot);
      seenNames.set(key, true);
    });
    
    console.log(`Combined for a total of ${allResults.length} unique cookie spots`);
    return allResults;
  } catch (error) {
    console.error('Error in comprehensive search:', error);
    return [];
  }
};