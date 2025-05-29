/**
 * Utility functions for handling geolocation
 */

/**
 * Check if geolocation permission is granted
 * @returns {Promise} A promise that resolves with permission status
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return 'unsupported';
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.log('Permission API not supported:', error);
    return 'unsupported';
  }
};

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
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your internet connection and try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving your location.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increase timeout to 15 seconds (from default 3 seconds)
          maximumAge: 300000 // Cache location for 5 minutes
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
  