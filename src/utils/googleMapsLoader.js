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

// Function to load Google Maps once and return a promise
const loadGoogleMaps = () => {
  return loader.load();
};

export { loadGoogleMaps }; 