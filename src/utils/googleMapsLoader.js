import { Loader } from '@googlemaps/js-api-loader';

// Get API key from environment variables - try multiple possible variable names
const getApiKey = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
         import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 
         '';
};

// Create a single instance of the Google Maps Loader
// with all required libraries for the entire application
const loader = new Loader({
  apiKey: getApiKey(),
  version: 'weekly',
  libraries: ['places', 'geometry'],
});

// Track whether the API has been loaded already
let isLoaded = false;

// Function to load Google Maps once and return a promise
const loadGoogleMaps = () => {
  if (isLoaded && window.google && window.google.maps) {
    // If already loaded, return a resolved promise
    return Promise.resolve();
  }
  
  return loader.load().then(() => {
    isLoaded = true;
    return Promise.resolve();
  });
};

export { loadGoogleMaps }; 