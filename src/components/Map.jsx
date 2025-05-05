import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { validateSpotCoordinates } from '../utils/spotUtils';

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

const calculateZoomForRadius = (radius) => {
  // Convert radius from meters to degrees (approximate)
  const radiusInDegrees = radius / 111000;
  
  // Calculate zoom level based on radius
  // This is a simplified calculation and may need adjustment
  const zoom = Math.floor(14 - Math.log2(radiusInDegrees));
  
  return Math.max(1, Math.min(20, zoom));
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
  searchMetadata = null,
  onSpotClick
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowsRef = useRef({});
  const [map, setMap] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
        await loadGoogleMaps();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return;

    const initialCenter = center || { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    const initialZoom = zoom;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(mapInstance);

    // Add bounds change listener
    mapInstance.addListener('bounds_changed', () => {
      const newBounds = mapInstance.getBounds();
      if (newBounds && onBoundsChange) {
        onBoundsChange({
          north: newBounds.getNorthEast().lat(),
          south: newBounds.getSouthWest().lat(),
          east: newBounds.getNorthEast().lng(),
          west: newBounds.getSouthWest().lng()
        });
      }
    });

    // Add viewport change listener
    mapInstance.addListener('center_changed', () => {
      const newCenter = mapInstance.getCenter();
      const newZoom = mapInstance.getZoom();
      if (newCenter && onViewportChange) {
        onViewportChange({
          center: {
            lat: newCenter.lat(),
            lng: newCenter.lng()
          },
          zoom: newZoom
        });
      }
    });

    return () => {
      // Cleanup
      if (mapInstance) {
        window.google.maps.event.clearInstanceListeners(mapInstance);
      }
    };
  }, [googleMapsLoaded, center, zoom, onViewportChange, onBoundsChange]);

  // Update markers when spots change
  useEffect(() => {
    if (!map || !googleMapsLoaded) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.setMap(null));
    markersRef.current = {};

    // Clear existing info windows
    Object.values(infoWindowsRef.current).forEach(infoWindow => infoWindow.close());
    infoWindowsRef.current = {};

    // Add new markers
    spots.forEach(spot => {
      if (!spot.location?.coordinates) return;

      const position = {
        lat: spot.location.coordinates[1],
        lng: spot.location.coordinates[0]
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: spot.name,
        animation: window.google.maps.Animation.DROP
      });

      // Create info window content
      const content = `
        <div style="max-width: 300px; padding: 8px;">
          ${spot.photos ? createPhotoCarousel(spot.photos) : ''}
          <h3 style="font-weight: bold; margin-bottom: 8px;">${spot.name}</h3>
          ${spot.description ? 
            `<p style="margin-bottom: 8px;">${spot.description}</p>` : 
            `<p style="margin-bottom: 8px;">
              ${spot.address || ''}
              ${spot.city ? (spot.address ? ', ' : '') + spot.city : ''}
              ${spot.state_province ? (spot.city ? ', ' : '') + spot.state_province : ''}
            </p>`
          }
          ${spot.phone ? 
            `<p style="margin-bottom: 8px;">
              <a href="tel:${spot.phone.replace(/\D/g, '')}" style="color: #1F75CB; text-decoration: none;">
                ${spot.phone}
              </a>
            </p>` : ''
          }
          ${spot.hours_of_operation ? formatHours(spot.hours_of_operation) : ''}
          <div style="margin-top: 8px; text-align: center;">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="color: #1F75CB; text-decoration: none; font-weight: 500;"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content,
        maxWidth: 300
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        // Close all other info windows
        Object.values(infoWindowsRef.current).forEach(iw => iw.close());
        
        // Open this info window
        infoWindow.open(map, marker);
        
        // Call onSpotClick if provided
        if (onSpotClick) {
          onSpotClick(spot);
        }
      });

      // Store references
      markersRef.current[spot._id] = marker;
      infoWindowsRef.current[spot._id] = infoWindow;
    });
  }, [map, spots, googleMapsLoaded, onSpotClick]);

  // Update map view when viewport or bounds change
  useEffect(() => {
    if (!map) return;

    if (viewport) {
      map.setCenter(viewport.center);
      map.setZoom(viewport.zoom);
    } else if (bounds) {
      const boundsObj = new window.google.maps.LatLngBounds(
        { lat: bounds.south, lng: bounds.west },
        { lat: bounds.north, lng: bounds.east }
      );
      map.fitBounds(boundsObj);
    }
  }, [map, viewport, bounds]);

  // Update marker appearance for hovered/clicked spots
  useEffect(() => {
    if (!map || !googleMapsLoaded) return;

    // Reset all markers to default
    Object.values(markersRef.current).forEach(marker => {
      marker.setAnimation(null);
    });

    // Highlight hovered spot
    if (hoveredSpot && markersRef.current[hoveredSpot._id]) {
      markersRef.current[hoveredSpot._id].setAnimation(window.google.maps.Animation.BOUNCE);
    }

    // Open info window for clicked spot
    if (clickedSpot && markersRef.current[clickedSpot._id]) {
      const marker = markersRef.current[clickedSpot._id];
      const infoWindow = infoWindowsRef.current[clickedSpot._id];
      
      // Close all other info windows
      Object.values(infoWindowsRef.current).forEach(iw => iw.close());
      
      // Open this info window
      infoWindow.open(map, marker);
    }
  }, [map, hoveredSpot, clickedSpot, googleMapsLoaded]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
};

export default Map; 