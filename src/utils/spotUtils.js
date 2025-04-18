/**
 * Utility functions for handling cookie spots
 */

/**
 * Deduplicate cookie spots based on ID, name, and address
 * @param {Array} baseSpots - Base array of spots to keep
 * @param {Array} newSpots - New spots to merge
 * @returns {Array} - Combined array with duplicates removed
 */
export const deduplicateSpots = (baseSpots = [], newSpots = []) => {
  if (!Array.isArray(baseSpots) || !Array.isArray(newSpots)) {
    return baseSpots || [];
  }

  const seenIds = new Set(baseSpots.map(spot => spot._id));
  const seenNames = new Map();

  // Create lookup for existing spots
  baseSpots.forEach(spot => {
    if (spot && spot.name && spot.address) {
      const key = `${spot.name.toLowerCase()}|${spot.address.toLowerCase()}`;
      seenNames.set(key, true);
    }
  });

  // Add new spots that aren't duplicates
  const combined = [...baseSpots];
  newSpots.forEach(spot => {
    if (!spot) return;

    // Check ID first
    if (spot._id && seenIds.has(spot._id)) return;

    // Then check name + address combination
    if (spot.name && spot.address) {
      const key = `${spot.name.toLowerCase()}|${spot.address.toLowerCase()}`;
      if (seenNames.has(key)) return;
      
      combined.push(spot);
      seenNames.set(key, true);
      if (spot._id) seenIds.add(spot._id);
    }
  });

  return combined;
};

/**
 * Validate and fix spot coordinates
 * @param {Object} spot - Cookie spot to validate
 * @returns {Object|null} - Fixed spot or null if invalid
 */
export const validateSpotCoordinates = (spot) => {
  if (!spot) return null;

  // Clone the spot to avoid modifying the original
  const fixedSpot = { ...spot };

  // Check if location exists
  if (!fixedSpot.location) {
    fixedSpot.location = { type: 'Point', coordinates: [0, 0] };
  }

  // Check if coordinates exist
  if (!fixedSpot.location.coordinates) {
    fixedSpot.location.coordinates = [0, 0];
  }

  // Check coordinates format
  if (!Array.isArray(fixedSpot.location.coordinates)) {
    // Try to fix if it's an object with lat/lng properties
    if (fixedSpot.location.coordinates && 
        typeof fixedSpot.location.coordinates === 'object' && 
        'lat' in fixedSpot.location.coordinates && 
        'lng' in fixedSpot.location.coordinates) {
      
      fixedSpot.location.coordinates = [
        fixedSpot.location.coordinates.lng,
        fixedSpot.location.coordinates.lat
      ];
    } else {
      return null;
    }
  }

  // Check if we have latitude/longitude properties directly on the spot
  if ((!fixedSpot.location.coordinates[0] || !fixedSpot.location.coordinates[1]) && 
      fixedSpot.latitude && fixedSpot.longitude) {
    fixedSpot.location.coordinates = [fixedSpot.longitude, fixedSpot.latitude];
  }

  // Verify coordinates are numbers
  if (isNaN(fixedSpot.location.coordinates[0]) || isNaN(fixedSpot.location.coordinates[1])) {
    return null;
  }

  return fixedSpot;
}; 