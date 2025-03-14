import { NextResponse } from 'next/server';

export async function GET() {
  // Get the API key from environment variables
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // Check if the API key exists
  const keyExists = !!apiKey;
  
  // Get the first and last 4 characters of the key (for security)
  const maskedKey = apiKey 
    ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
    : 'Not found';
  
  // Return the status
  return NextResponse.json({
    keyExists,
    maskedKey,
    envVars: Object.keys(process.env).filter(key => 
      key.includes('GOOGLE') || key.includes('MAP')
    ),
    message: keyExists 
      ? 'API key found in environment variables' 
      : 'API key NOT found in environment variables'
  });
} 