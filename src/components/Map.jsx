import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { validateSpotCoordinates } from '../utils/spotUtils';
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

// Helper function to format business hours
const formatHours = (hours) => {
  if (!hours || Object.keys(hours).length === 0) return '';
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = daysOfWeek[new Date().getDay() - 1 >= 0 ? new Date().getDay() - 1 : 6]; // Adjust: 0 = Sunday in JS but we use monday as first day
  
  let hoursHtml = `<div style="margin: 8px 0; font-size: 0.9em;">`;
  if (hours[today]) {
    hoursHtml += `<p style="margin: 0 0 4px; font-weight: bold;">Today: ${hours[today]}</p>`;
  }
  
  hoursHtml += `<details>
                  <summary style="cursor: pointer; color: #1F75CB;">View all hours</summary>
                  <div style="margin-top: 6px;">`;
  
  daysOfWeek.forEach(day => {
    if (hours[day]) {
      const isToday = day === today;
      hoursHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 2px; ${isToday ? 'font-weight: bold;' : ''}">
                      <span style="text-transform: capitalize;">${day}:</span>
                      <span>${hours[day]}</span>
                    </div>`;
    }
  });
  
  hoursHtml += `</div></details></div>`;
  return hoursHtml;
};

// Function to generate photo carousel HTML for infoWindow
const createPhotoCarousel = (photos) => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return '';
  }
  
  // Limit to 5 photos maximum
  const photoUrls = photos.slice(0, 5);
  
  // Add error handling for images
  const fallbackImageUrl = '/images/cookie-spot-placeholder.jpg';
  
  if (photoUrls.length === 1) {
    // Single photo
    return `<div style="margin-bottom: 8px;">
              <img 
                src="${photoUrls[0]}" 
                alt="Location" 
                style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;"
                onerror="this.onerror=null; this.src='${fallbackImageUrl}';"
              >
            </div>`;
  }
  
  // Multiple photos - create a simple carousel
  const carouselId = 'carousel_' + Math.random().toString(36).substr(2, 9);
  
  return `<div style="position: relative; margin-bottom: 8px;" data-carousel-id="${carouselId}">
            <div id="photo-carousel" style="width: 100%; height: 150px; overflow: hidden; border-radius: 4px;">
              ${photoUrls.map((url, index) => 
                `<img 
                  src="${url}" 
                  alt="Location photo ${index + 1}" 
                  style="width: 100%; height: 150px; object-fit: cover; display: ${index === 0 ? 'block' : 'none'};"
                  onerror="this.onerror=null; this.src='${fallbackImageUrl}'; this.style.display='${index === 0 ? 'block' : 'none'}';"
                >`
              ).join('')}
            </div>
            <div style="position: absolute; bottom: 8px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px;">
              ${photoUrls.map((_, index) => 
                `<span style="height: 6px; width: 6px; border-radius: 50%; background-color: white; opacity: ${index === 0 ? '1' : '0.5'};"></span>`
              ).join('')}
            </div>
            <button onclick="window.prevPhoto(this)" style="position: absolute; left: 4px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <span style="font-size: 18px;">&lt;</span>
            </button>
            <button onclick="window.nextPhoto(this)" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <span style="font-size: 18px;">&gt;</span>
            </button>
          </div>`;
};

// Initialize carousel functionality
if (typeof window !== 'undefined') {
  if (!window.photoCarousels) {
    window.photoCarousels = {};
  }

  window.showPhoto = function(index, container) {
    const photos = container.querySelectorAll('img');
    const dots = container.parentNode.querySelector('div[style*="justify-content: center"]').children;
    
    photos.forEach((photo, i) => {
      photo.style.display = i === index ? 'block' : 'none';
    });
    
    Array.from(dots).forEach((dot, i) => {
      dot.style.opacity = i === index ? '1' : '0.5';
    });
  };

  window.nextPhoto = function(btn) {
    const container = btn.parentNode.querySelector('#photo-carousel');
    const carouselId = container.closest('[data-carousel-id]').getAttribute('data-carousel-id');
    
    if (!window.photoCarousels[carouselId]) {
      window.photoCarousels[carouselId] = {
        currentIndex: 0,
        totalPhotos: container.querySelectorAll('img').length
      };
    }
    
    const carousel = window.photoCarousels[carouselId];
    const newIndex = (carousel.currentIndex + 1) % carousel.totalPhotos;
    window.photoCarousels[carouselId].currentIndex = newIndex;
    window.showPhoto(newIndex, container);
  };

  window.prevPhoto = function(btn) {
    const container = btn.parentNode.querySelector('#photo-carousel');
    const carouselId = container.closest('[data-carousel-id]').getAttribute('data-carousel-id');
    
    if (!window.photoCarousels[carouselId]) {
      window.photoCarousels[carouselId] = {
        currentIndex: 0,
        totalPhotos: container.querySelectorAll('img').length
      };
    }
    
    const carousel = window.photoCarousels[carouselId];
    const newIndex = (carousel.currentIndex - 1 + carousel.totalPhotos) % carousel.totalPhotos;
    window.photoCarousels[carouselId].currentIndex = newIndex;
    window.showPhoto(newIndex, container);
  };
}

// Component for rendering markers to prevent their disappearance
const MarkersList = ({ spots, hoveredSpot, clickedSpot }) => {
  const map = useMap();
  const leafletPopupRef = useRef({});
  
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
            ref={(ref) => {
              if (ref) {
                // Store reference to the popup in the ref
                leafletPopupRef.current[spot._id] = ref;
              }
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{spot.name}</h3>
                {spot.description ? 
                  <p>{spot.description}</p> : 
                  <p>
                    {spot.address || ''}
                    {spot.city ? (spot.address ? ', ' : '') + spot.city : ''}
                    {spot.state_province ? (spot.city ? ', ' : '') + spot.state_province : ''}
                  </p>
                }
                
                {/* Display phone if available */}
                {spot.phone && (
                  <p className="mt-1 mb-1">
                    <a href={`tel:${spot.phone.replace(/\D/g, '')}`} className="text-primary-600 hover:text-primary-800">
                      {spot.phone}
                    </a>
                  </p>
                )}
                
                {/* Display business hours if available */}
                {spot.hours_of_operation && Object.keys(spot.hours_of_operation).length > 0 && (
                  <div className="mt-2 mb-2">
                    <h4 className="font-semibold text-sm mb-1">Business Hours</h4>
                    <div className="text-xs">
                      {spot.hours_of_operation.monday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Monday:</span>
                          <span>{spot.hours_of_operation.monday}</span>
                        </div>
                      )}
                      {spot.hours_of_operation.tuesday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Tuesday:</span>
                          <span>{spot.hours_of_operation.tuesday}</span>
                        </div>
                      )}
                      {spot.hours_of_operation.wednesday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Wednesday:</span>
                          <span>{spot.hours_of_operation.wednesday}</span>
                        </div>
                      )}
                      {spot.hours_of_operation.thursday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Thursday:</span>
                          <span>{spot.hours_of_operation.thursday}</span>
                        </div>
                      )}
                      {spot.hours_of_operation.friday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Friday:</span>
                          <span>{spot.hours_of_operation.friday}</span>
                        </div>
                      )}
                      {spot.hours_of_operation.saturday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Saturday:</span>
                          <span>{spot.hours_of_operation.saturday}</span>
                        </div>
                      )}
                      {spot.hours_of_operation.sunday && (
                        <div className="flex justify-between">
                          <span className="font-medium">Sunday:</span>
                          <span>{spot.hours_of_operation.sunday}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
  clickedSpot,
  mapType = 'google', // 'leaflet' or 'google'
  searchMetadata = null, // Added parameter for search metadata
  onSpotClick
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
  const boundsChangeTimeoutRef = useRef(null);
  const infoWindowRef = useRef(null); // Add reference for active InfoWindow

  // Create a debounced bounds change handler at the component level
  const handleBoundsChanged = useCallback(() => {
    if (!mapInstance) return;

    const bounds = mapInstance.getBounds();
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    
    if (bounds && center && zoom) {
      const newBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };
      
      const newViewport = {
        center: {
          lat: center.lat(),
          lng: center.lng()
        },
        zoom
      };

      // Clear any existing timeout
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }

      // Set a new timeout
      boundsChangeTimeoutRef.current = setTimeout(() => {
        setBounds(newBounds);
        setViewport(newViewport);
        if (onBoundsChange) onBoundsChange(newBounds);
        if (onViewportChange) onViewportChange(newViewport);
      }, 200); // 200ms debounce delay
    }
  }, [mapInstance, onBoundsChange, onViewportChange]);

  // Cleanup function for the debounce timeout
  useEffect(() => {
    return () => {
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }
    };
  }, []);

  // Initialize Google Maps if using Google
  useEffect(() => {
    if (mapType !== 'google' || !mapContainerRef.current || googleLoaded) return;
    
    const loadGoogleMapsAPI = async () => {
      try {
        await loadGoogleMaps();
        
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API not available after loading');
        }
        
        setGoogleApi(window.google);
        
        let initialZoom = zoom;
        if (searchMetadata && searchMetadata.search_radius) {
          initialZoom = calculateZoomForRadius(searchMetadata.search_radius);
        }
        
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: center || { lat: 37.7749, lng: -122.4194 },
          zoom: initialZoom,
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID || '',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });
        
        // Add the bounds changed listener using our debounced handler
        map.addListener('bounds_changed', handleBoundsChanged);
        
        setMapInstance(map);
        setGoogleLoaded(true);
        
        return () => {
          // Clean up the listener when the component unmounts
          if (map) {
            window.google.maps.event.clearInstanceListeners(map);
          }
        };
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };
    
    loadGoogleMapsAPI();
  }, [mapType, center, zoom, handleBoundsChanged, googleLoaded, searchMetadata]);

  // Update Google Map markers when spots change
  const updateMarkers = useCallback((spots) => {
    if (!mapInstance || !window.google || !spots) return;
    
    const currentSpotIds = new Set();
    
    // Create infoWindow if it doesn't exist yet
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
    
    spots.forEach(spot => {
      const validSpot = validateSpotCoordinates(spot);
      if (!validSpot || !validSpot._id) return;
      
      currentSpotIds.add(validSpot._id);
      
      const position = {
        lat: validSpot.location.coordinates[1],
        lng: validSpot.location.coordinates[0]
      };
      
      let marker = markersRef.current[validSpot._id];
      
      if (marker) {
        const currentPosition = marker.getPosition();
        if (currentPosition.lat() !== position.lat || currentPosition.lng() !== position.lng) {
          marker.setPosition(position);
        }
      } else {
        marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: validSpot.name
        });
        
        marker.addListener('click', () => {
          // Determine if this is a MongoDB spot or an external API spot
          // External spots typically have one of these source properties, 
          // don't have a MongoDB ObjectId format, or include external IDs
          const isExternalSpot = 
            validSpot.source === 'google' || 
            validSpot.source_id || 
            validSpot.place_id ||
            (validSpot._id && typeof validSpot._id === 'string' && 
              (!validSpot._id.match(/^[0-9a-f]{24}$/i) || validSpot._id.includes('-')));
          
          // For debugging
          console.log('Marker clicked:', { spotId: validSpot._id, isExternalSpot });
          
          // Create Google Maps URL for external spots
          const googleMapsUrl = (() => {
            // If we have a place_id (preferred option), use it for a direct link to the specific business
            if (validSpot.place_id) {
              return `https://www.google.com/maps/place/?q=place_id:${validSpot.place_id}`;
            }
            
            // If we have a source_id that looks like a place_id, use that
            if (validSpot.source_id && typeof validSpot.source_id === 'string' && 
                validSpot.source_id.length > 20) {
              return `https://www.google.com/maps/place/?q=place_id:${validSpot.source_id}`;
            }
            
            // For spots with location but no place_id, create a more specific search
            // This won't be a direct link to the business page, but will be more specific than just coordinates
            if (validSpot.location && validSpot.location.coordinates) {
              return `https://www.google.com/maps/search/${encodeURIComponent(validSpot.name)}/@${
                validSpot.location.coordinates[1]
              },${
                validSpot.location.coordinates[0]
              },17z`;  // 17z is a zoom level that's good for businesses
            }
            
            // Last resort - just search for the business by name and address
            return `https://www.google.com/maps/search/${encodeURIComponent(
              validSpot.name + ' ' + (validSpot.address || '') + ' ' + (validSpot.city || '')
            )}`;
          })();
          
          // Create info window content with direct display instead of a link for external spots
          const contentString = `
            <div style="min-width: 250px; max-width: 300px; padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${validSpot.name}</h3>
              ${validSpot.photos && validSpot.photos.length > 0 ? createPhotoCarousel(validSpot.photos) : ''}
              ${validSpot.description ? 
                `<p style="margin: 0 0 8px;">${validSpot.description}</p>` : 
                `<p style="margin: 0 0 8px;">${validSpot.address || ''}
                 ${validSpot.city ? (validSpot.address ? ', ' : '') + validSpot.city : ''}
                 ${validSpot.state_province ? (validSpot.city ? ', ' : '') + validSpot.state_province : ''}</p>`
              }
              ${validSpot.phone ? `<p style="margin: 0 0 8px;"><a href="tel:${validSpot.phone.replace(/\D/g, '')}" style="color: #1F75CB; text-decoration: none;">${validSpot.phone}</a></p>` : ''}
              ${validSpot.rating ? `<p style="margin: 0 0 8px;">Rating: ${validSpot.rating.toFixed(1)} ⭐ (${validSpot.user_ratings_total || '0'} reviews)</p>` : ''}
              ${validSpot.hours_of_operation && Object.keys(validSpot.hours_of_operation).length > 0 ? 
                formatHours(validSpot.hours_of_operation) : ''}
              ${validSpot.website ? `<p style="margin: 0 0 8px;"><a href="${validSpot.website}" target="_blank" style="color: #1F75CB;">Visit Website</a></p>` : ''}
              ${isExternalSpot ? 
                `<p style="margin-top: 8px;"><a href="${googleMapsUrl}" target="_blank" style="color: #4c7ef3; text-decoration: none;">View on Google Maps</a></p>` : 
                `<a 
                  href="/cookie-spot/${validSpot._id}" 
                  style="color: #1F75CB; text-decoration: none; font-weight: 500;"
                >
                  View Details
                </a>`
              }
            </div>
          `;
          
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(mapInstance, marker);
          
          if (onSpotClick && !isExternalSpot) {
            onSpotClick(validSpot);
          }
        });
        
        markersRef.current[validSpot._id] = marker;
      }
      
      // Update animation based on hover state
      if (hoveredSpot && hoveredSpot._id === validSpot._id) {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
      } else {
        marker.setAnimation(null);
      }
    });
    
    // Remove markers for spots that no longer exist
    Object.keys(markersRef.current).forEach(spotId => {
      if (!currentSpotIds.has(spotId)) {
        const marker = markersRef.current[spotId];
        if (marker) {
          marker.setMap(null);
          delete markersRef.current[spotId];
        }
      }
    });
  }, [mapInstance, onSpotClick, hoveredSpot]);

  useEffect(() => {
    if (mapType === 'google' && spots) {
      updateMarkers(spots);
    }
  }, [mapType, spots, updateMarkers]);

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

  // Handle clicked spot for Google Maps markers - show the popup
  useEffect(() => {
    if (mapType !== 'google' || !mapInstance || !window.google || !clickedSpot) return;
    
    const marker = markersRef.current[clickedSpot._id];
    if (marker) {
      // Set marker to bounce
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      
      // Check if we have an info window reference
      if (infoWindowRef.current) {
        // Create the content for the info window
        const validSpot = validateSpotCoordinates(clickedSpot);
        if (!validSpot) return;
        
        // Determine if this is an external spot
        const isExternalSpot = 
          validSpot.source === 'google' || 
          validSpot.source_id || 
          validSpot.place_id ||
          (validSpot._id && typeof validSpot._id === 'string' && 
            (!validSpot._id.match(/^[0-9a-f]{24}$/i) || validSpot._id.includes('-')));
        
        // Create Google Maps URL for external spots
        const googleMapsUrl = (() => {
          if (validSpot.place_id) {
            return `https://www.google.com/maps/place/?q=place_id:${validSpot.place_id}`;
          }
          
          if (validSpot.source_id && typeof validSpot.source_id === 'string' && 
              validSpot.source_id.length > 20) {
            return `https://www.google.com/maps/place/?q=place_id:${validSpot.source_id}`;
          }
          
          if (validSpot.location && validSpot.location.coordinates) {
            return `https://www.google.com/maps/search/${encodeURIComponent(validSpot.name)}/@${
              validSpot.location.coordinates[1]
            },${
              validSpot.location.coordinates[0]
            },17z`;
          }
          
          return `https://www.google.com/maps/search/${encodeURIComponent(
            validSpot.name + ' ' + (validSpot.address || '') + ' ' + (validSpot.city || '')
          )}`;
        })();
        
        // Create info window content
        const contentString = `
          <div style="min-width: 250px; max-width: 300px; padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${validSpot.name}</h3>
            ${validSpot.photos && validSpot.photos.length > 0 ? createPhotoCarousel(validSpot.photos) : ''}
            ${validSpot.description ? 
              `<p style="margin: 0 0 8px;">${validSpot.description}</p>` : 
              `<p style="margin: 0 0 8px;">${validSpot.address || ''}
               ${validSpot.city ? (validSpot.address ? ', ' : '') + validSpot.city : ''}
               ${validSpot.state_province ? (validSpot.city ? ', ' : '') + validSpot.state_province : ''}</p>`
            }
            ${validSpot.phone ? `<p style="margin: 0 0 8px;"><a href="tel:${validSpot.phone.replace(/\D/g, '')}" style="color: #1F75CB; text-decoration: none;">${validSpot.phone}</a></p>` : ''}
            ${validSpot.rating ? `<p style="margin: 0 0 8px;">Rating: ${validSpot.rating.toFixed(1)} ⭐ (${validSpot.user_ratings_total || '0'} reviews)</p>` : ''}
            ${validSpot.hours_of_operation && Object.keys(validSpot.hours_of_operation).length > 0 ? 
              formatHours(validSpot.hours_of_operation) : ''}
            ${validSpot.website ? `<p style="margin: 0 0 8px;"><a href="${validSpot.website}" target="_blank" style="color: #1F75CB;">Visit Website</a></p>` : ''}
            ${isExternalSpot ? 
              `<p style="margin-top: 8px;"><a href="${googleMapsUrl}" target="_blank" style="color: #4c7ef3; text-decoration: none;">View on Google Maps</a></p>` : 
              `<a 
                href="/cookie-spot/${validSpot._id}" 
                style="color: #1F75CB; text-decoration: none; font-weight: 500;"
              >
                View Details
              </a>`
            }
          </div>
        `;
        
        // Set the content and open the info window
        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(mapInstance, marker);
      }
    }
  }, [clickedSpot, mapType, mapInstance]);

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

  // Clean up function when component unmounts
  useEffect(() => {
    return () => {
      // Close any open info windows
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      
      // Clear any markers
      Object.values(markersRef.current).forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = {};
    };
  }, []);

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
};

export default Map; 