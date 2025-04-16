import React, { useEffect } from 'react';

const Map = () => {
  const [mapInstance, setMapInstance] = React.useState(null);
  const [viewport, setViewport] = React.useState(null);
  const [bounds, setBounds] = React.useState(null);
  const [filters, setFilters] = React.useState(null);

  useEffect(() => {
    console.log('Map: Viewport or bounds changed, props:', { viewport, bounds });
    
    if (!mapInstance) return;
    
    try {
      // Check URL params for preserveView flag
      const urlParams = new URLSearchParams(window.location.search);
      const preserveView = urlParams.get('preserveView') === 'true';
      
      // Check if we should preserve the current view (from "Search this area" button)
      const shouldPreserveView = preserveView || 
        (filters && filters.preserveView === true);
      
      // Skip viewport updates if we should preserve the view
      if (shouldPreserveView) {
        console.log('Map: Preserving current map view, skipping viewport update');
        return;
      }
      
      if (viewport) {
        // ... existing code ...
      }
      // ... existing code ...
    } catch (error) {
      console.error('Error updating map viewport:', error);
    }
  }, [viewport, bounds, mapInstance, filters]);

  return (
    // ... existing code ...
  );
};

export default Map; 