// Mock data generator for coffee shop scores

interface CoffeeShopScores {
  drinksRating: number;  // 1-5 scale
  studyability: number;  // 1-5 scale
  ambiance: number;      // 1-5 scale
}

// Generate consistent mock scores based on place ID
export function generateMockScores(placeId: string): CoffeeShopScores {
  // Use the place ID to generate deterministic scores
  // This ensures the same place always gets the same scores
  const hash = hashCode(placeId);
  
  // Generate scores between 1-5 with one decimal place
  return {
    drinksRating: normalizeScore(Math.abs(hash % 41) / 8),
    studyability: normalizeScore(Math.abs((hash >> 4) % 37) / 7.4),
    ambiance: normalizeScore(Math.abs((hash >> 8) % 43) / 8.6),
  };
}

// Helper function to normalize scores to 1-5 range with one decimal place
function normalizeScore(value: number): number {
  // Ensure score is between 1-5
  const score = 1 + (value % 4);
  // Round to one decimal place
  return Math.round(score * 10) / 10;
}

// Simple string hash function
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure positive value
} 