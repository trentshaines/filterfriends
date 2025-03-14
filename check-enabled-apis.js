// Script to check which Google APIs are enabled for your project
require('dotenv').config({ path: '.env.local' });
const https = require('https');

// Get API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error('Error: API key not found in environment variables');
  process.exit(1);
}

console.log('=== Google APIs Enablement Check ===');
console.log(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('====================================\n');

// Test multiple API endpoints to check which ones are enabled
const endpoints = [
  {
    name: "Places API (Nearby Search)",
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=1000&type=cafe&key=${apiKey}`
  },
  {
    name: "Places API (Text Search)",
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=coffee+shops+in+San+Francisco&key=${apiKey}`
  },
  {
    name: "Places API (Find Place)",
    url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=coffee&inputtype=textquery&fields=formatted_address,name,geometry&key=${apiKey}`
  },
  {
    name: "Places API (Details)",
    url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=name,rating,formatted_phone_number&key=${apiKey}`
  },
  {
    name: "Places API (Autocomplete)",
    url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Vict&types=geocode&key=${apiKey}`
  },
  {
    name: "Geocoding API",
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${apiKey}`
  },
  {
    name: "Reverse Geocoding API",
    url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=37.7749,-122.4194&key=${apiKey}`
  },
  {
    name: "Directions API",
    url: `https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=${apiKey}`
  },
  {
    name: "Distance Matrix API",
    url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=Washington,DC&destinations=New+York+City,NY&key=${apiKey}`
  },
  {
    name: "Maps JavaScript API (Static)",
    url: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
  }
];

// Function to test an endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`Testing: ${endpoint.name}...`);
    
    // Special case for Maps JavaScript API which returns JavaScript, not JSON
    if (endpoint.name.includes("Maps JavaScript API")) {
      https.get(endpoint.url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          // For JavaScript API, we just check if it returns 200 and doesn't contain error text
          const isEnabled = res.statusCode === 200 && !data.includes("API project is not authorized");
          resolve({
            name: endpoint.name,
            httpStatus: res.statusCode,
            apiStatus: isEnabled ? "OK" : "ERROR",
            message: isEnabled ? null : "API not enabled or other error",
            success: isEnabled,
            data: { status: isEnabled ? "OK" : "ERROR" }
          });
        });
      }).on('error', (err) => {
        reject(`Network error: ${err.message}`);
      });
      return;
    }
    
    // For JSON APIs
    https.get(endpoint.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const status = {
            name: endpoint.name,
            httpStatus: res.statusCode,
            apiStatus: result.status,
            message: result.error_message || null,
            success: (result.status === 'OK' || result.status === 'ZERO_RESULTS'),
            data: result
          };
          resolve(status);
        } catch (error) {
          reject(`Error parsing response: ${error.message}`);
        }
      });
    }).on('error', (err) => {
      reject(`Network error: ${err.message}`);
    });
  });
}

// Run all tests
async function runTests() {
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      results.push(result);
    } catch (error) {
      console.error(`Failed to test ${endpoint.name}: ${error}`);
    }
  }
  
  // Display results
  console.log('\n=== API Enablement Results ===');
  
  // Group results by API type
  const apiGroups = {
    "Places API": [],
    "Geocoding API": [],
    "Other APIs": []
  };
  
  results.forEach(result => {
    if (result.name.includes("Places API")) {
      apiGroups["Places API"].push(result);
    } else if (result.name.includes("Geocoding API") || result.name.includes("Reverse Geocoding API")) {
      apiGroups["Geocoding API"].push(result);
    } else {
      apiGroups["Other APIs"].push(result);
    }
  });
  
  // Display results by group
  for (const [groupName, groupResults] of Object.entries(apiGroups)) {
    console.log(`\n${groupName}:`);
    
    let groupEnabled = true;
    
    groupResults.forEach(result => {
      console.log(`  ${result.name}:`);
      console.log(`    Status: ${result.success ? 'ENABLED ✅' : 'NOT ENABLED ❌'}`);
      
      if (!result.success) {
        groupEnabled = false;
        if (result.message) {
          console.log(`    Error: ${result.message}`);
        }
      }
    });
    
    console.log(`  Overall: ${groupEnabled ? 'ENABLED ✅' : 'NOT FULLY ENABLED ❌'}`);
  }
  
  console.log('\n=== Summary ===');
  console.log('To enable missing APIs:');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/apis/library');
  console.log('2. Search for each API that shows as "NOT ENABLED"');
  console.log('3. Click on the API and click the "ENABLE" button');
  console.log('4. Wait 5-10 minutes for changes to take effect');
  
  // Check if there might be API restrictions
  if (results.some(r => r.message && (
      r.message.includes('API key not authorized') || 
      r.message.includes('referer') || 
      r.message.includes('IP address') ||
      r.message.includes('restriction')))) {
    console.log('\nNOTE: Some errors suggest API key restrictions might be blocking requests.');
    console.log('Check your API key restrictions at: https://console.cloud.google.com/apis/credentials');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
}); 