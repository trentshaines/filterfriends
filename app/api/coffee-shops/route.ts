import { NextRequest, NextResponse } from 'next/server';
import { generateMockScores } from '@/lib/mockScores';

// Define the interface for coffee shop data
interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  photos?: string[];
  vicinity?: string;
  priceLevel?: number;
  drinksRating: number;
  studyability: number;
  ambiance: number;
  proximityScore: number;
  distance: number;
}

// Interface for the new Places API response
interface PlacesApiResponse {
  places: Array<{
    id: string;
    displayName?: {
      text: string;
    };
    formattedAddress?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    rating?: {
      value: number;
    };
    userRatingCount?: number;
    currentOpeningHours?: {
      openNow?: boolean;
    };
    photos?: Array<{
      name: string;
      id: string;
    }>;
    priceLevel?: string;
  }>;
}

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const latitude = parseFloat(searchParams.get('latitude') || '');
  const longitude = parseFloat(searchParams.get('longitude') || '');
  const radius = parseInt(searchParams.get('radius') || '1000');

  // Validate parameters
  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid latitude or longitude parameters' },
      { status: 400 }
    );
  }

  // Get API key from environment variables
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Prepare the request body for the Places API
    const requestBody = {
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude
          },
          radius: radius
        }
      },
      includedTypes: ["cafe"],
      maxResultCount: 20,
      languageCode: "en",
      // Request all available fields
      rankPreference: "DISTANCE"
    };

    // Make a request to the Google Places API
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.photos,places.priceLevel'
      },
      body: JSON.stringify(requestBody)
    });

    // Process the response
    if (response.ok) {
      const data = await response.json();
      console.log("API Response:", JSON.stringify(data, null, 2));
      
      if (data.places && Array.isArray(data.places)) {
        // Transform the data to match our CoffeeShop interface
        const coffeeShops = data.places.map(place => {
          // Calculate distance from user to coffee shop (in meters)
          const distance = calculateDistance(
            latitude, 
            longitude, 
            place.location.latitude, 
            place.location.longitude
          );
          
          // Generate mock scores
          const mockScores = generateMockScores(place.id);
          
          // Log each place's rating
          console.log(`Place: ${place.displayName?.text}, Rating: ${place.rating}`);
          
          return {
            id: place.id,
            name: place.displayName?.text || "Unknown",
            address: place.formattedAddress || "",
            location: {
              lat: place.location.latitude,
              lng: place.location.longitude
            },
            rating: place.rating || 0,
            userRatingsTotal: place.userRatingCount || 0,
            openNow: place.currentOpeningHours?.openNow,
            photos: place.photos ? place.photos.map(photo => 
              `/api/place-photo?photo_id=${photo.name}`
            ) : [],
            priceLevel: place.priceLevel,
            // Add our mock scores
            drinksRating: mockScores.drinksRating,
            studyability: mockScores.studyability,
            ambiance: mockScores.ambiance,
            distance: distance // Include actual distance in meters
          };
        });

        return NextResponse.json({ coffeeShops });
      } else {
        return NextResponse.json(
          { error: 'Invalid response format from Places API' },
          { status: 500 }
        );
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      
      return NextResponse.json(
        { 
          error: 'Error from Places API', 
          details: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Exception:", error);
    return NextResponse.json(
      { error: 'Failed to fetch coffee shops', details: String(error) },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c); // Distance in meters, rounded to nearest meter
} 