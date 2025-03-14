import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key not found in environment variables' 
      });
    }
    
    // Log the key (first 4 chars only) for debugging
    console.log(`Testing Places API (New) with key starting with: ${apiKey.substring(0, 4)}...`);
    
    // San Francisco coordinates
    const latitude = 37.7749;
    const longitude = -122.4194;
    
    // Prepare the request body for the new Places API
    const requestBody = {
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude
          },
          radius: 1000.0
        }
      },
      includedTypes: ["cafe"],
      maxResultCount: 10,
      languageCode: "en"
    };
    
    // Make a request to the new Google Places API
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check if the request was successful
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully connected to Google Places API (New)',
        resultsCount: data.places?.length || 0,
        firstPlace: data.places?.[0]?.displayName?.text || 'No places found'
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        success: false, 
        error: `Google Places API returned status: ${response.status}`,
        errorMessage: errorData.error?.message || 'Unknown error',
        fullResponse: errorData
      });
    }
  } catch (error: any) {
    console.error('Error testing Places API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test Google Places API',
      errorMessage: error.message
    });
  }
} 