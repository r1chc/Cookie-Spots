import { comprehensiveSearch } from '../utils/cookieSpotService';

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
      return await comprehensiveSearch({
        latitude: params.latitude,
        longitude: params.longitude
      });
    }
    
    // If we have a query, use it for the search
    if (params.query) {
      return await comprehensiveSearch(params.query);
    }
    
    // If no valid parameters, return empty array
    console.warn('No valid search parameters provided');
    return [];
  } catch (error) {
    console.error('Error fetching cookie spots:', error);
    return [];
  }
}; 