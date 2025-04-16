// test-uber-api.js
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env

async function testUberEatsApi() {
  try {
    // Get API key from environment
    const apiKey = process.env.VITE_UBER_EATS_API_KEY;
    
    if (!apiKey) {
      console.error('No Uber Eats API key found in environment variables');
      return;
    }
    
    console.log('Testing Uber Eats API with key starting with:', apiKey.substring(0, 5));
    
    // Test coordinates (New York City)
    const coordinates = { lat: 40.7128, lng: -74.0060 };
    
    // Set up query parameters
    const queryParams = new URLSearchParams({
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      query: 'cookies bakery',
      radius: 5000,
      limit: 10
    });
    
    // Construct URL
    const uberEatsUrl = `https://api.uber.com/v1/eats/stores?${queryParams.toString()}`;
    
    console.log('Making test request to:', uberEatsUrl);
    
    // Set headers
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Send the request
    const response = await axios.get(uberEatsUrl, { 
      headers,
      validateStatus: false // Don't throw on non-2xx responses
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 200) {
      console.log('Success! Response data structure:', Object.keys(response.data));
      console.log('Number of stores:', response.data.stores ? response.data.stores.length : 0);
      
      if (response.data.stores && response.data.stores.length > 0) {
        console.log('First store example:', response.data.stores[0]);
      }
    } else {
      console.error('Error response:', response.data);
    }
  } catch (error) {
    console.error('Error testing Uber Eats API:', error.message);
    
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
testUberEatsApi(); 