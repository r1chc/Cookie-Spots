import { cookieSpotApi } from '../utils/api';

/**
 * Fetch cookie spots based on search parameters
 * @param {Object} params - Search parameters (location or coordinates)
 * @returns {Array} Array of cookie spots matching the search
 */
export const fetchCookieSpots = async (params = {}) => {
  try {
    console.log('Fetching cookie spots with params:', params);
    
    // If we have coordinates, use them for the search
    if (params.latitude && params.longitude) {
      const response = await cookieSpotApi.getNearbyCookieSpots(
        params.latitude,
        params.longitude,
        5000, // 5km radius
        10 // Limit to 10 spots
      );
      return response.data;
    }
    
    // If we have a query, use it for the search
    if (params.query) {
      const response = await cookieSpotApi.searchExternalSources(params.query);
      return response.data.results;
    }
    
    // If no valid parameters, return empty array
    console.warn('No valid search parameters provided');
    return [];
  } catch (error) {
    console.error('Error fetching cookie spots:', error);
    return [];
  }
}; 