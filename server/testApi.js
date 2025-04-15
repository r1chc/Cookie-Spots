// server/testApi.js
require('dotenv').config();
const axios = require('axios');

console.log('Testing Google Places API');
console.log('========================');

// First check if we have an API key
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
console.log('API Key available:', googleApiKey ? 'Yes' : 'No');
if (googleApiKey) {
  console.log('API Key first 5 chars:', googleApiKey.substring(0, 5));
  console.log('API Key last 5 chars:', googleApiKey.substring(googleApiKey.length - 5));
} else {
  console.error('No Google Places API key found in environment variables!');
  process.exit(1);
}

// Test geocoding
async function testGeocoding() {
  console.log('\nTesting Geocoding API');
  console.log('--------------------');
  try {
    const location = 'Williamsburg, Brooklyn, NY';
    console.log('Geocoding location:', location);
    
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
    const response = await axios.get(geocodeUrl);
    
    console.log('Status:', response.data.status);
    if (response.data.status !== 'OK') {
      console.error('Error message:', response.data.error_message);
    } else {
      const results = response.data.results;
      console.log('Results found:', results.length);
      if (results.length > 0) {
        const firstResult = results[0];
        console.log('First result formatted address:', firstResult.formatted_address);
        console.log('First result location:', firstResult.geometry?.location);
      }
    }
  } catch (error) {
    console.error('Geocoding API error:', error.message);
  }
}

// Test nearby search
async function testNearbySearch() {
  console.log('\nTesting Nearby Search API');
  console.log('------------------------');
  try {
    const lat = 40.7131;
    const lng = -73.9567;
    console.log('Searching near coordinates:', { lat, lng });
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=bakery&key=${googleApiKey}`;
    const response = await axios.get(searchUrl);
    
    console.log('Status:', response.data.status);
    if (response.data.status !== 'OK') {
      console.error('Error message:', response.data.error_message);
    } else {
      const results = response.data.results;
      console.log('Results found:', results.length);
      if (results.length > 0) {
        console.log('First 3 places:');
        for (let i = 0; i < Math.min(3, results.length); i++) {
          const place = results[i];
          console.log(`  ${i+1}. ${place.name} (${place.vicinity})`);
        }
      }
    }
  } catch (error) {
    console.error('Nearby Search API error:', error.message);
  }
}

// Test text search
async function testTextSearch() {
  console.log('\nTesting Text Search API');
  console.log('----------------------');
  try {
    const query = 'cookies near williamsburg brooklyn';
    console.log('Searching for:', query);
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;
    const response = await axios.get(searchUrl);
    
    console.log('Status:', response.data.status);
    if (response.data.status !== 'OK') {
      console.error('Error message:', response.data.error_message);
    } else {
      const results = response.data.results;
      console.log('Results found:', results.length);
      if (results.length > 0) {
        console.log('First 3 places:');
        for (let i = 0; i < Math.min(3, results.length); i++) {
          const place = results[i];
          console.log(`  ${i+1}. ${place.name} (${place.formatted_address})`);
        }
      }
    }
  } catch (error) {
    console.error('Text Search API error:', error.message);
  }
}

// Run the tests
async function runTests() {
  await testGeocoding();
  await testNearbySearch();
  await testTextSearch();
  console.log('\nTests completed.');
}

runTests(); 