import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader } from '@googlemaps/js-api-loader';

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
  
  useEffect(() => {
    if (shouldPreserveView) return;
    
    if (viewport) {
      map.setView([viewport.center.lat, viewport.center.lng], viewport.zoom);
    } else if (bounds) {
      map.fitBounds([
        [bounds.south, bounds.west],
        [bounds.north, bounds.east]
      ]);
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
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });
        
        const google = await loader.load();
        setGoogleApi(google);
        
        // Determine initial zoom from searchMetadata or use the provided zoom
        let initialZoom = zoom;
        if (searchMetadata && searchMetadata.search_radius) {
          initialZoom = calculateZoomForRadius(searchMetadata.search_radius);
        }
        
        const map = new google.maps.Map(mapContainerRef.current, {
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
        
        // Listen for map movements to update viewport/bounds
        map.addListener('bounds_changed', () => {
          const newBounds = map.getBounds();
          if (!newBounds) return;
          
          const newViewport = {
            center: {
              lat: map.getCenter().lat(),
              lng: map.getCenter().lng()
            },
            zoom: map.getZoom()
          };
          
          setViewport(newViewport);
          setBounds({
            north: newBounds.getNorthEast().lat(),
            east: newBounds.getNorthEast().lng(),
            south: newBounds.getSouthWest().lat(),
            west: newBounds.getSouthWest().lng()
          });
          
          if (onViewportChange) onViewportChange(newViewport);
          if (onBoundsChange) onBoundsChange(newBounds);
        });
        
        // Apply bounds if available from search results
        if (bounds && google) {
          const googleBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(bounds.south, bounds.west),
            new google.maps.LatLng(bounds.north, bounds.east)
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
  }, [mapType, mapContainerRef, center, zoom, onViewportChange, onBoundsChange, googleLoaded, bounds, searchMetadata]);

  // Update Google Map markers when spots change
  useEffect(() => {
    if (mapType !== 'google' || !mapInstance || !googleApi || !spots || spots.length === 0) return;
    
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
          existingMarker.setAnimation(googleApi.maps.Animation.BOUNCE);
        } else {
          existingMarker.setAnimation(null);
        }
      } else {
        // Create new marker
        const marker = new googleApi.maps.Marker({
          position,
          map: mapInstance,
          title: spot.name,
          animation: hoveredSpot && hoveredSpot._id === spot._id ? 
            googleApi.maps.Animation.BOUNCE : null,
          optimized: true
        });
        
        // Create info window with spot details
        const infoWindow = new googleApi.maps.InfoWindow({
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
          pixelOffset: new googleApi.maps.Size(0, -30)
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
    
  }, [mapType, mapInstance, spots, hoveredSpot, googleApi]);

  // Handle hover state changes for Google Maps markers
  useEffect(() => {
    if (mapType !== 'google' || !mapInstance || !googleApi) return;
    
    // Update animation for all markers
    Object.entries(markersRef.current).forEach(([spotId, marker]) => {
      if (hoveredSpot && hoveredSpot._id === spotId) {
        marker.setAnimation(googleApi.maps.Animation.BOUNCE);
      } else {
        marker.setAnimation(null);
      }
    });
  }, [hoveredSpot, mapType, mapInstance, googleApi]);

  useEffect(() => {
    console.log('Map: Viewport or bounds changed, props:', { viewport: currentViewport, bounds: currentBounds });
    
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
      
      if (currentViewport && mapType === 'google') {
        // Update Google Maps view
        mapInstance.setCenter({ 
          lat: currentViewport.center.lat, 
          lng: currentViewport.center.lng 
        });
        mapInstance.setZoom(currentViewport.zoom || zoom);
      } else if (currentBounds && mapType === 'google') {
        // Update Google Maps bounds
        if (googleApi) {
          const bounds = new googleApi.maps.LatLngBounds(
            new googleApi.maps.LatLng(currentBounds.south, currentBounds.west),
            new googleApi.maps.LatLng(currentBounds.north, currentBounds.east)
          );
          mapInstance.fitBounds(bounds);
        }
      }
    } catch (error) {
      console.error('Error updating map viewport:', error);
    }
  }, [currentViewport, currentBounds, mapInstance, filters, mapType, zoom, googleApi]);

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