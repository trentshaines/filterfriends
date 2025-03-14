// Comprehensive Google Maps API Test Script
require('dotenv').config({ path: '.env.local' });
const https = require('https');
const os = require('os');

// Get API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error('Error: API key not found in environment variables');
  process.exit(1);
}

console.log('=== Google Maps API Key Test ===');
console.log(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('===============================\n');

// Get local machine information for debugging restrictions
const networkInterfaces = os.networkInterfaces();
let ipAddresses = [];

// Extract IP addresses
Object.keys(networkInterfaces).forEach(interfaceName => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach(iface => {
    // Skip internal/loopback interfaces
    if (!iface.internal) {
      ipAddresses.push({
        family: iface.family,
        address: iface.address
      });
    }
  });
});

console.log('Local Machine Information:');
console.log(`Hostname: ${os.hostname()}`);
console.log('IP Addresses:');
ipAddresses.forEach(ip => {
  console.log(`  ${ip.family}: ${ip.address}`);
});
console.log('User Agent: Node.js HTTP Client');
console.log('===============================\n');

// Test multiple API endpoints
const endpoints = [
  {
    name: "Places API (Nearby Search)",
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=1000&type=cafe&keyword=coffee&key=${apiKey}`
  },
  {
    name: "Places API (Text Search)",
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=coffee+shops+in+San+Francisco&key=${apiKey}`
  },
  {
    name: "Geocoding API",
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${apiKey}`
  }
];

// Function to test an endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`Testing: ${endpoint.name}...`);
    
    const options = {
      headers: {
        'User-Agent': 'Node.js Test Script',
        'Referer': 'https://localhost:3000/'
      }
    };
    
    https.get(endpoint.url, options, (res) => {
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
  console.log('\n=== Test Results ===');
  
  let allSuccess = true;
  let restrictionIssue = false;
  
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`  HTTP Status: ${result.httpStatus}`);
    console.log(`  API Status: ${result.apiStatus}`);
    console.log(`  Success: ${result.success ? 'YES ✅' : 'NO ❌'}`);
    
    if (!result.success) {
      allSuccess = false;
      console.log(`  Error: ${result.message || 'Unknown error'}`);
      
      // Check for specific error messages
      if (result.message) {
        if (result.message.includes('not authorized')) {
          console.log('  → This API is not enabled for your project');
          console.log('  → Enable it at: https://console.cloud.google.com/apis/library');
        }
        
        // Check for restriction-related errors
        if (result.message.includes('API key not authorized') || 
            result.message.includes('referer') || 
            result.message.includes('IP address') ||
            result.message.includes('restriction')) {
          restrictionIssue = true;
          console.log('  → This appears to be a restriction issue with your API key');
        }
      }
    } else if (result.name.includes('Places API') && result.data.results) {
      // Show sample results for Places API
      console.log(`  Found ${result.data.results.length} results`);
      if (result.data.results.length > 0) {
        console.log(`  First result: ${result.data.results[0].name || 'Unnamed'}`);
      }
    }
  });
  
  console.log('\n=== Summary ===');
  if (allSuccess) {
    console.log('All API tests passed! Your API key is working correctly. ✅');
  } else {
    console.log('Some API tests failed. Please check the errors above. ❌');
    
    console.log('\nPossible issues:');
    
    // API not enabled
    if (results.some(r => r.message && r.message.includes('not authorized'))) {
      console.log('1. APIs not enabled:');
      console.log('   - Go to Google Cloud Console: https://console.cloud.google.com/apis/library');
      console.log('   - Make sure you have the following APIs enabled:');
      console.log('     • Places API');
      console.log('     • Geocoding API');
      console.log('     • Maps JavaScript API');
    }
    
    // Restriction issues
    if (restrictionIssue) {
      console.log('2. API Key Restrictions:');
      console.log('   Your API key may have restrictions that are blocking these requests:');
      console.log('   - Go to: https://console.cloud.google.com/apis/credentials');
      console.log('   - Find your API key and check its restrictions');
      console.log('   - Common restrictions that could cause issues:');
      console.log('     • IP address restrictions (your current IPs are listed above)');
      console.log('     • HTTP referrer restrictions (this test is using "https://localhost:3000/")');
      console.log('     • API restrictions (make sure all needed APIs are selected)');
      console.log('   - For testing, consider temporarily removing restrictions');
    }
    
    // Billing issues
    console.log('3. Billing not set up:');
    console.log('   - Ensure billing is set up for your Google Cloud project');
    console.log('   - Go to: https://console.cloud.google.com/billing');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
}); 