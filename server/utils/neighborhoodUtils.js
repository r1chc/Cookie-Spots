const axios = require('axios');

/**
 * Get all zip codes in a neighborhood
 * @param {string} neighborhood - Neighborhood name (e.g., "Astoria, Queens, NY")
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise<string[]>} Array of zip codes in the neighborhood
 */
const getZipCodesForNeighborhood = async (neighborhood, apiKey) => {
  try {
    console.log(`Finding zip codes for neighborhood: ${neighborhood}`);
    const zipCodes = new Set();
    
    // Step 1: Geocode the neighborhood to get its boundary/viewport
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(neighborhood)}&key=${apiKey}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.error(`No results found for neighborhood: ${neighborhood}`);
      return [];
    }
    
    const result = geocodeResponse.data.results[0];
    const viewport = result.geometry.viewport;
    
    // Determine if this is actually a neighborhood
    const types = result.types || [];
    const isNeighborhood = types.some(type => 
      ['neighborhood', 'sublocality', 'sublocality_level_1', 'sublocality_level_2'].includes(type)
    );
    
    if (!isNeighborhood) {
      console.log(`Location "${neighborhood}" is not a neighborhood. Type: ${types.join(', ')}`);
    }
    
    // Step 2: Sample multiple points within the viewport to find zip codes
    // Get zip code at center point
    const center = {
      lat: (viewport.northeast.lat + viewport.southwest.lat) / 2,
      lng: (viewport.northeast.lng + viewport.southwest.lng) / 2
    };
    
    // Define points to sample across the neighborhood (center + corners + midpoints)
    const samplePoints = [
      center, // Center
      { lat: viewport.northeast.lat, lng: viewport.northeast.lng }, // NE corner
      { lat: viewport.southwest.lat, lng: viewport.southwest.lng }, // SW corner
      { lat: viewport.northeast.lat, lng: viewport.southwest.lng }, // NW corner
      { lat: viewport.southwest.lat, lng: viewport.northeast.lng }, // SE corner
      { lat: center.lat, lng: viewport.northeast.lng }, // E midpoint
      { lat: center.lat, lng: viewport.southwest.lng }, // W midpoint
      { lat: viewport.northeast.lat, lng: center.lng }, // N midpoint
      { lat: viewport.southwest.lat, lng: center.lng }  // S midpoint
    ];
    
    // Get zip codes for all sample points
    for (const point of samplePoints) {
      try {
        const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${point.lat},${point.lng}&key=${apiKey}`;
        const response = await axios.get(reverseGeocodeUrl);
        
        if (response.data.results && response.data.results.length > 0) {
          // Look for postal code in each result
          for (const reverseResult of response.data.results) {
            const postalComponent = reverseResult.address_components.find(
              comp => comp.types.includes('postal_code')
            );
            
            if (postalComponent) {
              zipCodes.add(postalComponent.long_name);
              break; // Found a zip code for this point, move to next point
            }
          }
        }
      } catch (error) {
        console.error(`Error reverse geocoding point (${point.lat}, ${point.lng}):`, error.message);
      }
    }
    
    const zipCodeArray = Array.from(zipCodes);
    console.log(`Found ${zipCodeArray.length} zip codes for ${neighborhood}: ${zipCodeArray.join(', ')}`);
    
    return zipCodeArray;
  } catch (error) {
    console.error(`Error getting zip codes for neighborhood ${neighborhood}:`, error.message);
    return [];
  }
};

module.exports = {
  getZipCodesForNeighborhood
}; 