/**
 * Utility to debug and fix incorrect location data in cookie spots
 * @param {Array} spots - Array of cookie spots to check and fix
 * @returns {Array} - Array of cookie spots with fixed location data
 */
export const debugAndFixSpotCoordinates = (spots) => {
  try {
    if (!spots || !Array.isArray(spots)) {
      console.log('Invalid spots data:', spots);
      return spots || [];
    }

    console.log(`Checking coordinates for ${spots.length} spots`);
    
    return spots.map(spot => {
      if (!spot) return spot;
      
      try {
        // Clone the spot to avoid modifying the original
        const fixedSpot = { ...spot };
        
        // Check if location exists
        if (!fixedSpot.location) {
          console.log(`Missing location for spot: ${fixedSpot.name}`);
          fixedSpot.location = { type: 'Point', coordinates: [0, 0] };
        }
        
        // Check if coordinates exist
        if (!fixedSpot.location.coordinates) {
          console.log(`Missing coordinates for spot: ${fixedSpot.name}`);
          fixedSpot.location.coordinates = [0, 0];
        }
        
        // Check coordinates format
        if (!Array.isArray(fixedSpot.location.coordinates)) {
          console.log(`Invalid coordinates format for spot: ${fixedSpot.name}`, fixedSpot.location.coordinates);
          
          // Try to fix if it's an object with lat/lng properties
          if (fixedSpot.location.coordinates && 
              typeof fixedSpot.location.coordinates === 'object' && 
              'lat' in fixedSpot.location.coordinates && 
              'lng' in fixedSpot.location.coordinates) {
            
            fixedSpot.location.coordinates = [
              fixedSpot.location.coordinates.lng,
              fixedSpot.location.coordinates.lat
            ];
            console.log(`Fixed object-style coordinates for: ${fixedSpot.name}`);
          } else {
            fixedSpot.location.coordinates = [0, 0];
          }
        }
        
        // Check if we have latitude/longitude properties directly on the spot
        if ((!fixedSpot.location.coordinates[0] || !fixedSpot.location.coordinates[1]) && 
            fixedSpot.latitude && fixedSpot.longitude) {
          console.log(`Using direct lat/lng properties for: ${fixedSpot.name}`);
          fixedSpot.location.coordinates = [fixedSpot.longitude, fixedSpot.latitude];
        }
        
        // Verify coordinates are numbers and in the correct order [lng, lat]
        if (isNaN(fixedSpot.location.coordinates[0]) || isNaN(fixedSpot.location.coordinates[1])) {
          console.log(`Non-numeric coordinates for spot: ${fixedSpot.name}`, fixedSpot.location.coordinates);
          fixedSpot.location.coordinates = [0, 0];
        }
        
        // Log the fixed coordinates
        if (spot.location?.coordinates?.join(',') !== fixedSpot.location.coordinates.join(',')) {
          console.log(`Fixed coordinates for ${fixedSpot.name}: `, {
            original: spot.location?.coordinates,
            fixed: fixedSpot.location.coordinates
          });
        }
        
        return fixedSpot;
      } catch (error) {
        console.error('Error fixing coordinates for spot:', error);
        return spot; // Return the original spot if fixing fails
      }
    });
  } catch (error) {
    console.error('Error in debugAndFixSpotCoordinates:', error);
    return spots || []; // Return original spots if function fails
  }
};

export default { debugAndFixSpotCoordinates }; 