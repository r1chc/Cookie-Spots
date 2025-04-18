import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

// Fix default marker icon issue in Leaflet
// This is a common issue with Leaflet in React applications
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Define highlighted marker icon once to avoid recreation on each render
const highlightedIcon = new L.Icon({
  iconUrl: '/images/marker-icon-highlighted.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Component to update map view when viewport changes
const MapUpdater = ({ viewport, bounds, shouldPreserveView }) => {
  const map = useMap();
  const appliedViewportRef = useRef(null);
  const appliedBoundsRef = useRef(null);
  
  useEffect(() => {
    if (shouldPreserveView) return;
    
    // Check if we've already applied this exact viewport/bounds to prevent loops
    const viewportChanged = viewport && 
      (!appliedViewportRef.current || 
       JSON.stringify(viewport) !== JSON.stringify(appliedViewportRef.current));
       
    const boundsChanged = bounds && 
      (!appliedBoundsRef.current || 
       JSON.stringify(bounds) !== JSON.stringify(appliedBoundsRef.current));
    
    if (viewportChanged) {
      map.setView([viewport.center.lat, viewport.center.lng], viewport.zoom);
      appliedViewportRef.current = viewport;
    } else if (boundsChanged) {
      map.fitBounds([
        [bounds.south, bounds.west],
        [bounds.north, bounds.east]
      ]);
      appliedBoundsRef.current = bounds;
    }
  }, [map, viewport, bounds, shouldPreserveView]);
  
  return null;
};

// Component for rendering markers to prevent their disappearance
const MarkersList = ({ spots, hoveredSpot }) => {
  return (
    <>
      {spots.map(spot => {
        if (!spot.location?.coordinates) return null;
        
        const position = [
          spot.location.coordinates[1], // latitude
          spot.location.coordinates[0]  // longitude
        ];
        
        const isHovered = hoveredSpot && hoveredSpot._id === spot._id;
        
        return (
          <Marker 
            key={spot._id} 
            position={position}
            icon={isHovered ? highlightedIcon : new L.Icon.Default()}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{spot.name}</h3>
                <p>{spot.address}</p>
                <a 
                  href={`/cookie-spot/${spot._id}`} 
                  className="text-primary-600 hover:text-primary-800"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Add the following function after the MapUpdater component
// This calculates the appropriate zoom level based on radius
const calculateZoomForRadius = (radius) => {
  // Convert radius from meters to km
  const radiusInKm = radius / 1000;
  
  // Calculate zoom based on radius
  // These values are approximate and may need fine-tuning
  if (radiusInKm <= 1) return 15; // Very small radius
  if (radiusInKm <= 2) return 14;
  if (radiusInKm <= 3) return 13.5;
  if (radiusInKm <= 5) return 13;
  if (radiusInKm <= 8) return 12;
  if (radiusInKm <= 10) return 11.5;
  if (radiusInKm <= 15) return 11;
  if (radiusInKm <= 20) return 10;
  if (radiusInKm <= 30) return 9;
  return 8; // For very large areas
};

const Map = ({ 
  spots = [], 
  center, 
  zoom = 13, 
  viewport = null, 
  bounds = null, 
  onViewportChange, 
  onBoundsChange,
  hoveredSpot,
  mapType = 'leaflet', // 'leaflet' or 'google'
  searchMetadata = null // Added parameter for search metadata
}) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [currentViewport, setViewport] = useState(viewport);
  const [currentBounds, setBounds] = useState(bounds);
  const [filters, setFilters] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleApi, setGoogleApi] = useState(null);
  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef({});
  const spotIndexRef = useRef({});

  // Calculate initial zoom based on search radius if available
  useEffect(() => {
    if (searchMetadata && searchMetadata.search_radius) {
      const newZoom = calculateZoomForRadius(searchMetadata.search_radius);
      console.log(`Adjusting zoom to ${newZoom} based on search radius of ${searchMetadata.search_radius}m`);
      
      // Update viewport with new zoom level if viewport exists
      if (viewport) {
        const adjustedViewport = {
          ...viewport,
          zoom: newZoom
        };
        setViewport(adjustedViewport);
      }
    }
  }, [searchMetadata, viewport]);

  // Initialize Google Maps if using Google
  useEffect(() => {
    if (mapType !== 'google' || !mapContainerRef.current || googleLoaded) return;
    
    const loadGoogleMapsAPI = async () => {
      try {
        // Use the shared loader instead of creating a new one
        await loadGoogleMaps();
        
        // After loading, check if Google Maps is available in the window object
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API not available after loading');
        }
        
        // Store the Google API reference
        setGoogleApi(window.google);
        
        // Determine initial zoom from searchMetadata or use the provided zoom
        let initialZoom = zoom;
        if (searchMetadata && searchMetadata.search_radius) {
          initialZoom = calculateZoomForRadius(searchMetadata.search_radius);
        }
        
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: center || { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
          zoom: initialZoom,
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID || '',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });
        
        setMapInstance(map);
        setGoogleLoaded(true);
        
        // Use a more robust debounce mechanism to prevent update loops
        let boundsChangeTimeout = null;
        let lastUpdateTime = 0;
        const DEBOUNCE_DELAY = 200; // 200ms debounce
        const MIN_UPDATE_INTERVAL = 500; // Minimum 500ms between updates
        
        // Listen for map movements to update viewport/bounds
        map.addListener('bounds_changed', () => {
          // Clear any pending timeout
          if (boundsChangeTimeout) {
            clearTimeout(boundsChangeTimeout);
          }
          
          const now = Date.now();
          
          // If an update just happened, always use debounce to prevent rapid sequential updates
          if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
            boundsChangeTimeout = setTimeout(() => {
              handleBoundsChanged();
              lastUpdateTime = Date.now();
            }, DEBOUNCE_DELAY);
            return;
          }
          
          // Otherwise process immediately and reset the timer
          handleBoundsChanged();
          lastUpdateTime = now;
        });
        
        // Extract bounds changed handling logic to a separate function
        const handleBoundsChanged = () => {
          const newBounds = map.getBounds();
          if (!newBounds) return;
          
          const newViewport = {
            center: {
              lat: map.getCenter().lat(),
              lng: map.getCenter().lng()
            },
            zoom: map.getZoom()
          };
          
          // Only update if there's a significant change to avoid loops
          const hasSignificantViewportChange = 
            !currentViewport || 
            Math.abs(newViewport.center.lat - currentViewport.center?.lat) > 0.0001 ||
            Math.abs(newViewport.center.lng - currentViewport.center?.lng) > 0.0001 ||
            newViewport.zoom !== currentViewport.zoom;
            
          if (hasSignificantViewportChange) {
            const newBoundsObj = {
              north: newBounds.getNorthEast().lat(),
              east: newBounds.getNorthEast().lng(),
              south: newBounds.getSouthWest().lat(),
              west: newBounds.getSouthWest().lng()
            };
            
            // Update internal state
            setViewport(newViewport);
            setBounds(newBoundsObj);
            
            // Notify parent components
            if (onViewportChange) onViewportChange(newViewport);
            if (onBoundsChange) onBoundsChange(newBoundsObj);
          }
        };
        
        // Apply bounds if available from search results
        if (bounds && window.google) {
          const googleBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(bounds.south, bounds.west),
            new window.google.maps.LatLng(bounds.north, bounds.east)
          );
          map.fitBounds(googleBounds);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };
    
    loadGoogleMapsAPI();
    
    return () => {
      // Clean up Google Maps markers to prevent memory leaks
      if (Object.keys(markersRef.current).length > 0) {
        Object.values(markersRef.current).forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
        markersRef.current = {};
      }
    };
  }, [mapType, mapContainerRef, center, zoom, onViewportChange, onBoundsChange, googleLoaded, bounds, searchMetadata, currentViewport]);

  // Update Google Map markers when spots change
  useEffect(() => {
    if (mapType !== 'google' || !mapInstance || !window.google || !spots || spots.length === 0) return;
    
    // Build an index of current spots by ID for quick lookup
    const currentSpotIds = {};
    spots.forEach(spot => {
      if (spot && spot._id) {
        currentSpotIds[spot._id] = true;
      }
    });
    
    // Remove markers that are no longer in the spots array
    Object.keys(markersRef.current).forEach(spotId => {
      if (!currentSpotIds[spotId]) {
        const marker = markersRef.current[spotId];
        if (marker) {
          marker.setMap(null);
          delete markersRef.current[spotId];
        }
      }
    });
    
    // Add or update markers for current spots
    spots.forEach(spot => {
      if (!spot || !spot._id || !spot.location?.coordinates) return;
      
      const position = { 
        lat: spot.location.coordinates[1], 
        lng: spot.location.coordinates[0] 
      };
      
      // Check if we already have a marker for this spot
      const existingMarker = markersRef.current[spot._id];
      
      if (existingMarker) {
        // Update existing marker position if needed
        const currentPosition = existingMarker.getPosition();
        if (currentPosition.lat() !== position.lat || currentPosition.lng() !== position.lng) {
          existingMarker.setPosition(position);
        }
        
        // Update animation based on hover state
        if (hoveredSpot && hoveredSpot._id === spot._id) {
          existingMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        } else {
          existingMarker.setAnimation(null);
        }
      } else {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: spot.name,
          animation: hoveredSpot && hoveredSpot._id === spot._id ? 
            window.google.maps.Animation.BOUNCE : null,
          optimized: true
        });
        
        // Create info window with spot details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h3 style="font-weight: bold; margin-bottom: 5px;">${spot.name}</h3>
              <p style="margin-bottom: 8px;">${spot.address}</p>
              <a 
                href="/cookie-spot/${spot._id}" 
                style="color: #4f46e5; text-decoration: underline;"
                target="_blank"
              >
                View Details
              </a>
            </div>
          `,
          pixelOffset: new window.google.maps.Size(0, -30)
        });
        
        // Add click listener to show info window
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });
        
        // Store marker reference
        markersRef.current[spot._id] = marker;
      }
    });
    
    // Store the current spots index for future comparison
    spotIndexRef.current = currentSpotIds;
    
  }, [mapType, mapInstance, spots, hoveredSpot]);

  // Handle hover state changes for Google Maps markers
  useEffect(() => {
    if (mapType !== 'google' || !mapInstance || !window.google) return;
    
    // Update animation for all markers
    Object.entries(markersRef.current).forEach(([spotId, marker]) => {
      if (hoveredSpot && hoveredSpot._id === spotId) {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
      } else {
        marker.setAnimation(null);
      }
    });
  }, [hoveredSpot, mapType, mapInstance]);

  useEffect(() => {
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
      
      // IMPORTANT: Only update if the viewport/bounds came from external props, not from internal state changes
      // This prevents infinite update loops
      if (viewport && viewport !== currentViewport && mapType === 'google') {
        // Update Google Maps view with external viewport prop
        mapInstance.setCenter({ 
          lat: viewport.center.lat, 
          lng: viewport.center.lng 
        });
        mapInstance.setZoom(viewport.zoom || zoom);
      } else if (bounds && bounds !== currentBounds && mapType === 'google') {
        // Update Google Maps bounds with external bounds prop
        if (window.google) {
          const googleBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(bounds.south, bounds.west),
            new window.google.maps.LatLng(bounds.north, bounds.east)
          );
          mapInstance.fitBounds(googleBounds);
        }
      }
    } catch (error) {
      console.error('Error updating map viewport:', error);
    }
  }, [viewport, bounds, mapInstance, filters, mapType, zoom]);

  // Add a new useEffect to handle prop changes properly
  useEffect(() => {
    // Only update state from props when there's a significant change
    // This prevents unnecessary re-renders
    if (viewport) {
      const hasSignificantChange = 
        !currentViewport || 
        !currentViewport.center ||
        Math.abs(viewport.center.lat - currentViewport.center.lat) > 0.0001 ||
        Math.abs(viewport.center.lng - currentViewport.center.lng) > 0.0001 ||
        viewport.zoom !== currentViewport.zoom;
        
      if (hasSignificantChange) {
        setViewport(viewport);
      }
    }
    
    if (bounds) {
      const hasSignificantChange =
        !currentBounds ||
        Math.abs(bounds.north - currentBounds.north) > 0.0001 ||
        Math.abs(bounds.south - currentBounds.south) > 0.0001 ||
        Math.abs(bounds.east - currentBounds.east) > 0.0001 ||
        Math.abs(bounds.west - currentBounds.west) > 0.0001;
        
      if (hasSignificantChange) {
        setBounds(bounds);
      }
    }
  }, [viewport, bounds]);

  // Use a useLayoutEffect to immediately handle initial bounds/viewport
  useLayoutEffect(() => {
    if (mapType === 'leaflet') return; // Not needed for Leaflet
    
    if (!mapInstance || !window.google) return;
    
    // This runs once after map is initialized to properly set the initial bounds or viewport
    if (bounds) {
      const googleBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(bounds.south, bounds.west),
        new window.google.maps.LatLng(bounds.north, bounds.east)
      );
      mapInstance.fitBounds(googleBounds);
    } else if (viewport) {
      mapInstance.setCenter({ 
        lat: viewport.center.lat, 
        lng: viewport.center.lng 
      });
      mapInstance.setZoom(viewport.zoom || zoom);
    }
  }, [mapInstance, mapType]);

  // Component display based on map type
  if (mapType === 'google') {
    return (
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg shadow-md" 
        style={{ minHeight: '400px' }}
      />
    );
  }

  // Default to Leaflet - using separate MarkersList component to prevent marker disappearance
  return (
    <MapContainer
      center={center || [37.7749, -122.4194]} // Default to San Francisco
      zoom={searchMetadata?.search_radius 
        ? calculateZoomForRadius(searchMetadata.search_radius) 
        : zoom}
      className="w-full h-full rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
      whenCreated={setMapInstance}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MarkersList spots={spots} hoveredSpot={hoveredSpot} />
      
      <MapUpdater 
        viewport={currentViewport} 
        bounds={currentBounds} 
        shouldPreserveView={
          (filters && filters.preserveView) || 
          new URLSearchParams(window.location.search).get('preserveView') === 'true'
        } 
      />
    </MapContainer>
  );
};

export default Map; 