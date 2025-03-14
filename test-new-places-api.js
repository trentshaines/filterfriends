// Test script for the new Google Places API
require('dotenv').config({ path: '.env.local' });
const https = require('https');

// Get API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error('Error: API key not found in environment variables');
  process.exit(1);
}

console.log('=== Google Places API (New) Test ===');
console.log(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('===================================\n');

// Test the new Places API endpoints
const endpoints = [
  {
    name: "Places API (New) - Find Place",
    url: `https://places.googleapis.com/v1/places:searchText`,
    method: 'POST',
    body: {
      textQuery: "coffee shops in San Francisco",
      maxResultCount: 10
    }
  },
  {
    name: "Places API (New) - Nearby Search",
    url: `https://places.googleapis.com/v1/places:searchNearby`,
    method: 'POST',
    body: {
      locationRestriction: {
        circle: {
          center: {
            latitude: 37.7749,
            longitude: -122.4194
          },
          radius: 1000.0
        }
      },
      includedTypes: ["cafe"],
      maxResultCount: 10
    }
  }
];

// Function to test an endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`Testing: ${endpoint.name}...`);
    
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
      }
    };
    
    const req = https.request(endpoint.url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`HTTP Status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            console.log(`Success: YES ✅`);
            if (result.places) {
              console.log(`Found ${result.places.length} places`);
              if (result.places.length > 0) {
                console.log(`First result: ${result.places[0].displayName?.text || 'Unnamed'}`);
              }
            } else {
              console.log('No places found in the response');
            }
          } else {
            console.log(`Success: NO ❌`);
            console.log(`Error: ${JSON.stringify(result.error || result, null, 2)}`);
            
            // Check for specific error types
            if (data.includes('API not enabled')) {
              console.log('\nThis error indicates the Places API is not enabled for your project.');
              console.log('To fix this:');
              console.log('1. Go to https://console.cloud.google.com/apis/library and search for "Places API"');
              console.log('2. Click on "Places API" (the new version)');
              console.log('3. Click "ENABLE" to enable the Places API');
            }
          }
          
          resolve({
            name: endpoint.name,
            success: res.statusCode === 200,
            data: result
          });
        } catch (error) {
          console.log(`Success: NO ❌`);
          console.log(`Error parsing response: ${error.message}`);
          console.log(`Raw response: ${data}`);
          reject(error);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`Success: NO ❌`);
      console.log(`Network error: ${err.message}`);
      reject(err);
    });
    
    // Write the request body
    req.write(JSON.stringify(endpoint.body));
    req.end();
  });
}

// Test the Geocoding API for comparison
function testGeocodingApi() {
  return new Promise((resolve, reject) => {
    console.log('\nTesting Geocoding API (for comparison)...');
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`HTTP Status: ${res.statusCode}`);
          console.log(`API Status: ${result.status}`);
          
          if (result.status === 'OK' || result.status === 'ZERO_RESULTS') {
            console.log(`Success: YES ✅`);
            console.log(`Found ${result.results.length} results`);
          } else {
            console.log(`Success: NO ❌`);
            console.log(`Error: ${result.error_message || 'Unknown error'}`);
          }
          
          resolve({
            name: 'Geocoding API',
            success: result.status === 'OK' || result.status === 'ZERO_RESULTS',
            data: result
          });
        } catch (error) {
          console.log(`Success: NO ❌`);
          console.log(`Error parsing response: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (err) => {
      console.log(`Success: NO ❌`);
      console.log(`Network error: ${err.message}`);
      reject(err);
    });
  });
}

// Run all tests
async function runTests() {
  try {
    const results = [];
    
    // Test Places API endpoints
    for (const endpoint of endpoints) {
      try {
        const result = await testEndpoint(endpoint);
        results.push(result);
      } catch (error) {
        console.error(`Failed to test ${endpoint.name}: ${error}`);
      }
    }
    
    // Test Geocoding API
    try {
      const geocodingResult = await testGeocodingApi();
      results.push(geocodingResult);
    } catch (error) {
      console.error(`Failed to test Geocoding API: ${error}`);
    }
    
    // Display summary
    console.log('\n=== Summary ===');
    
    const placesApiSuccess = results.some(r => r.name.includes('Places API') && r.success);
    const geocodingSuccess = results.some(r => r.name === 'Geocoding API' && r.success);
    
    if (placesApiSuccess) {
      console.log('✅ Places API (New) is working correctly!');
    } else {
      console.log('❌ Places API (New) is not working.');
      console.log('To enable the new Places API:');
      console.log('1. Go to https://console.cloud.google.com/apis/library and search for "Places API"');
      console.log('2. Click on "Places API" (the new version)');
      console.log('3. Click "ENABLE" to enable the Places API');
    }
    
    if (geocodingSuccess) {
      console.log('✅ Geocoding API is working correctly!');
    } else {
      console.log('❌ Geocoding API is not working.');
    }
    
    console.log('\nNote: The new Places API uses a different endpoint structure than the old one.');
    console.log('You will need to update your application code to use the new API.');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests(); 