'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CoffeeShop } from '@/types/CoffeeShop';
import CoffeeShopCard from './CoffeeShopCard';
import FilterOptions from './FilterOptions';
import { FaLocationArrow, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface Location {
  lat: number;
  lng: number;
}

interface PlacesApiTestResult {
  success: boolean;
  message?: string;
  error?: string;
  errorMessage?: string;
  resultsCount?: number;
  status?: string;
  fullResponse?: any;
  firstPlace?: string;
}

export default function CoffeeShopFinder() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(1000); // Default radius: 1000 meters
  const [placesApiTestResult, setPlacesApiTestResult] = useState<PlacesApiTestResult | null>(null);
  const [placesApiTesting, setPlacesApiTesting] = useState(false);
  const [manualLat, setManualLat] = useState('37.7749');
  const [manualLng, setManualLng] = useState('-122.4194');
  const [filterCriteria, setFilterCriteria] = useState<string>('none');
  const [minScore, setMinScore] = useState<number>(3);
  const [sortCriteria, setSortCriteria] = useState<string>('distance');

  // Get user's current location
  const getUserLocation = () => {
    setIsLoading(true);
    setError(null);
    
    console.log("Attempting to get user location in Arc browser...");

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      console.error(errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    // Add a timeout to detect if the geolocation request is hanging
    const timeoutId = setTimeout(() => {
      console.error("Geolocation request timed out after 10 seconds");
      setError("Location request timed out. Arc browser might be blocking the request or not showing the permission prompt.");
      setIsLoading(false);
    }, 10000);

    const handleSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      console.log("Successfully obtained user location", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(location);
      fetchCoffeeShops(location);
    };

    const handleError = (error: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      console.error("Geolocation error:", error);
      
      let errorMessage = `Error getting location: ${error.message}`;
      
      // Provide more specific error messages based on error code
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission was denied. Arc browser might have blocked the request without showing a prompt.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable. Please try again or use the 'Use Demo Location' button.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Please try again or use the 'Use Demo Location' button.";
          break;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    };

    // Try a different approach for Arc browser
    try {
      console.log("Calling navigator.geolocation.getCurrentPosition...");
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Exception when calling geolocation API:", e);
      setError(`Exception when requesting location: ${e instanceof Error ? e.message : String(e)}`);
      setIsLoading(false);
    }
  };

  // Use a default location (San Francisco)
  const useDefaultLocation = () => {
    setIsLoading(true);
    setError(null);
    
    // San Francisco coordinates
    const defaultLocation = {
      lat: 37.7749,
      lng: -122.4194
    };
    
    setUserLocation(defaultLocation);
    fetchCoffeeShops(defaultLocation);
  };

  // Test Places API directly
  const testPlacesApi = async () => {
    try {
      setPlacesApiTesting(true);
      setPlacesApiTestResult(null);
      const response = await fetch('/api/test-places-api');
      if (!response.ok) {
        throw new Error('Failed to test Places API');
      }
      const data = await response.json();
      setPlacesApiTestResult(data);
    } catch (error: any) {
      console.error('Error testing Places API:', error);
      setPlacesApiTestResult({
        success: false,
        error: 'Error testing Places API',
        errorMessage: error.message
      });
    } finally {
      setPlacesApiTesting(false);
    }
  };

  // Fetch coffee shops from our API
  const fetchCoffeeShops = async (location: Location) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/coffee-shops?latitude=${location.lat}&longitude=${location.lng}&radius=${radius}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch coffee shops');
      }

      const data = await response.json();
      console.log("Coffee shops received:", data.coffeeShops);
      
      // Log each shop's rating
      data.coffeeShops.forEach((shop: any) => {
        console.log(`Shop: ${shop.name}, Rating: ${shop.rating}`);
      });
      
      setCoffeeShops(data.coffeeShops);
    } catch (error: any) {
      setError(`Error fetching coffee shops: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    
    if (userLocation) {
      fetchCoffeeShops(userLocation);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (halfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          <path
            d="M12 17.27V2"
            style={{
              fill: 'none',
              stroke: '#fff',
              strokeWidth: '1px',
            }}
          />
        </svg>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }
    
    return stars;
  };

  const useManualLocation = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      
      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid latitude and longitude values');
        setIsLoading(false);
        return;
      }
      
      const location = { lat, lng };
      setUserLocation(location);
      fetchCoffeeShops(location);
    } catch (error) {
      setError(`Error with manual coordinates: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  };

  // Sort coffee shops based on selected criteria
  const sortedCoffeeShops = useMemo(() => {
    if (!coffeeShops.length) return [];
    
    return [...coffeeShops].sort((a, b) => {
      switch (sortCriteria) {
        case 'distance':
          return a.distance - b.distance; // Ascending (closest first)
        case 'drinks':
          return b.drinksRating - a.drinksRating; // Descending (highest first)
        case 'study':
          return b.studyability - a.studyability; // Descending (highest first)
        case 'ambiance':
          return b.ambiance - a.ambiance; // Descending (highest first)
        case 'rating':
          // Handle undefined ratings
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA; // Descending (highest first)
        default:
          return a.distance - b.distance; // Default to distance
      }
    });
  }, [coffeeShops, sortCriteria]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Coffee Shop Finder</h1>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={getUserLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Find Nearby Coffee Shops'}
        </button>
        
        <button
          onClick={useDefaultLocation}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          disabled={isLoading}
        >
          &quot;Use Demo Location&quot; (San Francisco)
        </button>
        
        <button
          onClick={testPlacesApi}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
          disabled={placesApiTesting}
        >
          {placesApiTesting ? 'Testing...' : 'Test Places API Directly'}
        </button>
        
        <select
          value={radius}
          onChange={handleRadiusChange}
          className="border rounded-md px-3 py-2"
          disabled={!userLocation || isLoading}
        >
          <option value={500}>500m</option>
          <option value={1000}>1km</option>
          <option value={2000}>2km</option>
          <option value={5000}>5km</option>
        </select>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium mb-2">Manual Location Input</h3>
        <p className="text-sm text-gray-600 mb-2">If location detection isn't working, you can enter coordinates manually:</p>
        <div className="flex flex-wrap gap-2 items-center">
          <div>
            <label htmlFor="manual-lat" className="block text-sm">Latitude:</label>
            <input
              id="manual-lat"
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="border rounded px-2 py-1 w-32"
            />
          </div>
          <div>
            <label htmlFor="manual-lng" className="block text-sm">Longitude:</label>
            <input
              id="manual-lng"
              type="text"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="border rounded px-2 py-1 w-32"
            />
          </div>
          <button
            onClick={useManualLocation}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md mt-auto"
            disabled={isLoading}
          >
            Use These Coordinates
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: You can find your coordinates by searching "what's my location" on Google
        </p>
      </div>

      {isLoading && !error && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
          <p>Requesting your location... If you see a browser permission prompt, please click "Allow" to share your location.</p>
        </div>
      )}

      {placesApiTestResult && (
        <div className={`p-4 mb-4 rounded-md ${placesApiTestResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-bold mb-2">Places API Test Result:</h3>
          {placesApiTestResult.success ? (
            <>
              <p className="text-green-600 font-bold">{placesApiTestResult.message}</p>
              <p><strong>Results Count:</strong> {placesApiTestResult.resultsCount}</p>
              {placesApiTestResult.firstPlace && (
                <p><strong>First Place:</strong> {placesApiTestResult.firstPlace}</p>
              )}
              <p className="mt-2">Your Google Places API is working correctly! You should be able to fetch coffee shops now.</p>
            </>
          ) : (
            <>
              <p className="text-red-600 font-bold">{placesApiTestResult.error}</p>
              {placesApiTestResult.errorMessage && (
                <p><strong>Error Message:</strong> {placesApiTestResult.errorMessage}</p>
              )}
              <div className="mt-2 text-red-600">
                <p className="font-bold">Troubleshooting Steps:</p>
                <ol className="list-decimal ml-5">
                  <li>Go to <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> and search for "Places API"</li>
                  <li>Enable the Places API</li>
                  <li>Set up billing at <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Billing</a></li>
                  <li>Check your API key restrictions at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Credentials</a></li>
                  <li>After making changes, restart your development server</li>
                </ol>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          {error.includes('denied') || error.includes('Arc browser') && (
            <div className="mt-2">
              <p className="font-bold">Arc Browser Location Troubleshooting:</p>
              <ol className="list-decimal ml-5">
                <li>Click the shield icon in Arc's address bar</li>
                <li>Make sure "Location" is set to "Allow"</li>
                <li>Try closing and reopening Arc browser</li>
                <li>In Arc settings, go to Privacy & Security → Site Settings → Location</li>
                <li>Make sure this website is not in the blocked list</li>
                <li>Try using the "&quot;Use Demo Location&quot; (San Francisco)" button as a workaround</li>
              </ol>
            </div>
          )}
          {error.includes('403') && (
            <div className="mt-2">
              <p className="font-bold">API Key Error (403 Forbidden):</p>
              <ol className="list-decimal ml-5">
                <li>Your API key might be invalid or missing</li>
                <li>The Places API might not be enabled for your project</li>
                <li>Billing might not be set up for your Google Cloud account</li>
                <li>Your API key might have restrictions that are blocking the request</li>
              </ol>
              <p className="mt-2">Try clicking the "Test Places API Directly" button for more information.</p>
            </div>
          )}
        </div>
      )}

      {/* Add sorting controls */}
      {coffeeShops.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-medium mb-2">Sort Coffee Shops</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label htmlFor="sort-criteria" className="block text-sm mb-1">Sort by:</label>
              <select
                id="sort-criteria"
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="distance">Distance (Closest First)</option>
                <option value="rating">Google Rating (Highest First)</option>
                <option value="drinks">Drinks Quality (Highest First)</option>
                <option value="study">Studyability (Highest First)</option>
                <option value="ambiance">Ambiance (Highest First)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {sortedCoffeeShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCoffeeShops.map((shop) => (
            <div key={shop.id} className="border rounded-lg overflow-hidden shadow-md">
              {shop.photos && shop.photos.length > 0 && (
                <Image
                  src={shop.photos[0]}
                  alt={shop.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg">{shop.name}</h3>
                <p className="text-gray-600">{shop.address}</p>
                
                {/* Google Rating - always show */}
                <div className="flex items-center mt-2">
                  <span className="text-gray-600 mr-1">Google Rating:</span>
                  {shop.rating > 0 ? (
                    <>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(shop.rating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-gray-600">
                        ({shop.rating.toFixed(1)})
                        {shop.userRatingsTotal > 0 && ` · ${shop.userRatingsTotal} reviews`}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">No rating available</span>
                  )}
                </div>
                
                {shop.openNow !== undefined && (
                  <p className={`mt-2 ${shop.openNow ? 'text-green-600' : 'text-red-600'}`}>
                    {shop.openNow ? 'Open Now' : 'Closed'}
                  </p>
                )}
                
                {shop.priceLevel !== undefined && (
                  <p className="mt-1 text-gray-600">
                    Price: {'$'.repeat(shop.priceLevel)}
                  </p>
                )}
              </div>
              <div className="p-4 border-t">
                <h4 className="font-medium mb-2">Scores</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <div className="ml-1">
                      {shop.distance < 1000 ? 
                        `${shop.distance} m` : 
                        `${(shop.distance / 1000).toFixed(1)} km`}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Drinks:</span>
                    <div className="flex items-center">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(shop.drinksRating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1">({shop.drinksRating.toFixed(1)})</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Study:</span>
                    <div className="flex items-center">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(shop.studyability) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1">({shop.studyability.toFixed(1)})</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ambiance:</span>
                    <div className="flex items-center">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(shop.ambiance) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1">({shop.ambiance.toFixed(1)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && userLocation && (
          <p>No coffee shops found. Try increasing the search radius.</p>
        )
      )}
    </div>
  );
} 