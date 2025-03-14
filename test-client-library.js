// Test script for Google Maps Services Node.js Client Library
require('dotenv').config({ path: '.env.local' });

// Import the Client from the Google Maps Services package
let Client;
try {
  const { Client: GMapsClient } = require('@googlemaps/google-maps-services-js');
  Client = GMapsClient;
} catch (error) {
  console.error('Error importing @googlemaps/google-maps-services-js:');
  console.error('You may need to install it with: npm install @googlemaps/google-maps-services-js');
  process.exit(1);
}

// Get API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error('Error: API key not found in environment variables');
  process.exit(1);
}

console.log('=== Google Maps Services Client Library Test ===');
console.log(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('==============================================\n');

// Initialize the client
const client = new Client({});

// Test functions
async function testPlacesNearby() {
  console.log('Testing placesNearby() - This is what your app uses...');
  try {
    const response = await client.placesNearby({
      params: {
        location: { lat: 37.7749, lng: -122.4194 },
        radius: 1000,
        type: 'cafe',
        keyword: 'coffee',
        key: apiKey,
      },
    });
    
    console.log(`HTTP Status: ${response.status}`);
    console.log(`API Status: ${response.data.status}`);
    
    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      console.log(`Success: YES ✅`);
      console.log(`Found ${response.data.results.length} results`);
      if (response.data.results.length > 0) {
        console.log(`First result: ${response.data.results[0].name}`);
      }
    } else {
      console.log(`Success: NO ❌`);
      console.log(`Error: ${response.data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`Success: NO ❌`);
    console.log('Error details:');
    
    if (error.response) {
      console.log(`  HTTP Status: ${error.response.status}`);
      console.log(`  API Status: ${error.response.data?.status || 'N/A'}`);
      console.log(`  Error Message: ${error.response.data?.error_message || error.message}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
    
    // Check for specific error types
    if (error.message.includes('not authorized')) {
      console.log('\nThis error indicates the Places API is not enabled for your project.');
      console.log('To fix this:');
      console.log('1. Go to https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
      console.log('2. Click "ENABLE" to enable the Places API');
    }
  }
}

async function testGeocoding() {
  console.log('\nTesting geocode() - For comparison...');
  try {
    const response = await client.geocode({
      params: {
        address: '1600 Amphitheatre Parkway, Mountain View, CA',
        key: apiKey,
      },
    });
    
    console.log(`HTTP Status: ${response.status}`);
    console.log(`API Status: ${response.data.status}`);
    
    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      console.log(`Success: YES ✅`);
      console.log(`Found ${response.data.results.length} results`);
    } else {
      console.log(`Success: NO ❌`);
      console.log(`Error: ${response.data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`Success: NO ❌`);
    console.log('Error details:');
    
    if (error.response) {
      console.log(`  HTTP Status: ${error.response.status}`);
      console.log(`  API Status: ${error.response.data?.status || 'N/A'}`);
      console.log(`  Error Message: ${error.response.data?.error_message || error.message}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
  }
}

// Run the tests
async function runTests() {
  try {
    await testPlacesNearby();
    await testGeocoding();
    
    console.log('\n=== Summary ===');
    console.log('If placesNearby() failed but geocode() succeeded:');
    console.log('1. You need to specifically enable the Places API');
    console.log('2. Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
    console.log('3. Click "ENABLE" to enable the Places API');
    console.log('4. Wait 5-10 minutes for changes to take effect');
    
    console.log('\nIf both tests failed:');
    console.log('1. Check if your API key is valid');
    console.log('2. Check if billing is set up for your Google Cloud project');
    console.log('3. Check if your API key has restrictions that might be blocking these requests');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests(); 