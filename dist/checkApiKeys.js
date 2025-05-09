require('dotenv').config();

// Check if the necessary API keys are set
console.log('Checking API keys and tokens...');
console.log('=================================');

// Google Places API Key
const googleKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
console.log('Google Places API Key:', googleKey ? `${googleKey.substring(0, 5)}...${googleKey.substring(googleKey.length - 5)}` : 'Not set');

console.log('=================================');
console.log('Note: If the Google Places API key shows "Not set", the search functionality will not work properly.');
console.log('Make sure all keys are properly set in your .env file and the server has been restarted.'); 