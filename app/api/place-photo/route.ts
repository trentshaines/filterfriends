import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch place photos from Google Places API
 * 
 * This route takes a photo_id parameter and fetches the photo from Google Places API
 * It then returns the photo as a binary response or redirects to the photo URL
 */
export async function GET(request: NextRequest) {
  try {
    // Get the photo ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const photoId = searchParams.get('photo_id');
    const maxWidth = searchParams.get('maxwidth') || '400';

    // Validate required parameters
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Check if we have an API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured in environment variables' },
        { status: 500 }
      );
    }

    // Construct the URL for the Places API photo endpoint
    const url = `https://places.googleapis.com/v1/${photoId}/media?key=${apiKey}&maxWidthPx=${maxWidth}`;

    // Make the request to the Places API
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': '*'
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API returned status ${response.status}`);
    }

    // Get the photo data
    const photoData = await response.blob();

    // Return the photo data with the appropriate content type
    return new NextResponse(photoData, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching place photo:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to fetch place photo',
        details: errorMessage || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 