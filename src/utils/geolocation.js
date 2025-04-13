/**
 * Utility functions for handling geolocation
 */

/**
 * Get the user's current location using the browser's Geolocation API
 * @returns {Promise} A promise that resolves with the user's coordinates or rejects with an error
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: false, // Set to true for more accurate results, but may take longer
          timeout: 5000, // Time in milliseconds before timeout
          maximumAge: 300000 // Maximum age of a cached position in milliseconds (5 minutes)
        }
      );
    });
  };
  
  /**
   * Reverse geocode coordinates to get city and state
   * @param {Object} coords - Object containing latitude and longitude
   * @returns {Promise} A promise that resolves with the location data
   */
  export const reverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      // Extract city and state from the address
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.hamlet || 'Unknown';
      const state = address.state || address.province || '';
      
      return {
        city,
        state,
        formattedLocation: state ? `${city}, ${state}` : city
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  };
  
  /**
   * Get default location when geolocation fails or is not available
   * @returns {Object} Default location object
   */
  export const getDefaultLocation = () => {
    return {
      city: 'New York',
      state: 'NY',
      formattedLocation: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060
    };
  };
  