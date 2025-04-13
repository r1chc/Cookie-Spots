/**
 * API service for fetching cookie spot data
 */

import { getDefaultLocation } from './geolocation';

// Mock database of cookie spots across different locations
const COOKIE_SPOTS_DB = {
  // New York
  "New York": [
    {
      id: 1,
      name: "Crumbl Cookie",
      image: "/images/cookie-spot-1.jpg",
      rating: 4.8,
      reviewCount: 324,
      location: "New York, NY",
      description: "Specialty cookies with rotating weekly flavors",
      cookieTypes: ["Chocolate Chip", "Sugar Cookie", "Specialty"]
    },
    {
      id: 2,
      name: "Levain Bakery",
      image: "/images/cookie-spot-2.jpg",
      rating: 4.9,
      reviewCount: 512,
      location: "New York, NY",
      description: "Famous for giant gooey cookies with crisp edges",
      cookieTypes: ["Chocolate Chip", "Double Chocolate", "Oatmeal Raisin"]
    }
  ],
  
  // Boston
  "Boston": [
    {
      id: 3,
      name: "Insomnia Cookies",
      image: "/images/cookie-spot-3.jpg",
      rating: 4.6,
      reviewCount: 287,
      location: "Boston, MA",
      description: "Late-night cookie delivery service",
      cookieTypes: ["Chocolate Chip", "Snickerdoodle", "White Chocolate Macadamia"]
    },
    {
      id: 7,
      name: "Boston Cookie Company",
      image: "/images/cookie-spot-7.jpg",
      rating: 4.5,
      reviewCount: 156,
      location: "Boston, MA",
      description: "Traditional New England style cookies",
      cookieTypes: ["Chocolate Chip", "Molasses", "Cranberry White Chocolate"]
    }
  ],
  
  // Chicago
  "Chicago": [
    {
      id: 4,
      name: "Cookie Dough & Co",
      image: "/images/cookie-spot-4.jpg",
      rating: 4.7,
      reviewCount: 198,
      location: "Chicago, IL",
      description: "Edible cookie dough and freshly baked cookies",
      cookieTypes: ["Cookie Dough", "Chocolate Chip", "Peanut Butter"]
    },
    {
      id: 8,
      name: "Windy City Cookies",
      image: "/images/cookie-spot-8.jpg",
      rating: 4.4,
      reviewCount: 178,
      location: "Chicago, IL",
      description: "Chicago-style deep dish cookie pies",
      cookieTypes: ["Deep Dish Cookie", "S'mores", "Chocolate Chunk"]
    }
  ],
  
  // Los Angeles
  "Los Angeles": [
    {
      id: 5,
      name: "LA Cookie Shop",
      image: "/images/cookie-spot-5.jpg",
      rating: 4.7,
      reviewCount: 342,
      location: "Los Angeles, CA",
      description: "Gourmet cookies with California-inspired flavors",
      cookieTypes: ["Avocado White Chocolate", "Lemon Poppy", "Vegan Chocolate"]
    },
    {
      id: 9,
      name: "Hollywood Sweets",
      image: "/images/cookie-spot-9.jpg",
      rating: 4.6,
      reviewCount: 267,
      location: "Los Angeles, CA",
      description: "Celebrity-inspired cookie creations",
      cookieTypes: ["Red Carpet Red Velvet", "Star Studded Snickerdoodle", "Golden Globe Ginger"]
    }
  ],
  
  // San Francisco
  "San Francisco": [
    {
      id: 6,
      name: "Bay Area Bites",
      image: "/images/cookie-spot-6.jpg",
      rating: 4.8,
      reviewCount: 289,
      location: "San Francisco, CA",
      description: "Sourdough-based cookies and local ingredients",
      cookieTypes: ["Sourdough Chocolate Chip", "Bay Butter", "Fog City Snickerdoodle"]
    },
    {
      id: 10,
      name: "Golden Gate Cookies",
      image: "/images/cookie-spot-10.jpg",
      rating: 4.9,
      reviewCount: 312,
      location: "San Francisco, CA",
      description: "Artisanal cookies with locally sourced ingredients",
      cookieTypes: ["Ghirardelli Chocolate", "Napa Valley Wine", "Sonoma Almond"]
    }
  ],
  
  // Default/Fallback
  "Default": [
    {
      id: 1,
      name: "Crumbl Cookie",
      image: "/images/cookie-spot-1.jpg",
      rating: 4.8,
      reviewCount: 324,
      location: "New York, NY",
      description: "Specialty cookies with rotating weekly flavors",
      cookieTypes: ["Chocolate Chip", "Sugar Cookie", "Specialty"]
    },
    {
      id: 2,
      name: "Levain Bakery",
      image: "/images/cookie-spot-2.jpg",
      rating: 4.9,
      reviewCount: 512,
      location: "New York, NY",
      description: "Famous for giant gooey cookies with crisp edges",
      cookieTypes: ["Chocolate Chip", "Double Chocolate", "Oatmeal Raisin"]
    },
    {
      id: 3,
      name: "Insomnia Cookies",
      image: "/images/cookie-spot-3.jpg",
      rating: 4.6,
      reviewCount: 287,
      location: "Boston, MA",
      description: "Late-night cookie delivery service",
      cookieTypes: ["Chocolate Chip", "Snickerdoodle", "White Chocolate Macadamia"]
    },
    {
      id: 4,
      name: "Cookie Dough & Co",
      image: "/images/cookie-spot-4.jpg",
      rating: 4.7,
      reviewCount: 198,
      location: "Chicago, IL",
      description: "Edible cookie dough and freshly baked cookies",
      cookieTypes: ["Cookie Dough", "Chocolate Chip", "Peanut Butter"]
    }
  ]
};

/**
 * Fetch cookie spots based on user location
 * @param {Object} location - Object containing city and state
 * @returns {Array} Array of cookie spots near the location
 */
export const fetchCookieSpotsByLocation = async (location = null) => {
  try {
    // If no location is provided, use default
    const userLocation = location || getDefaultLocation();
    
    // In a real app, this would be an API call to a backend service
    // that would use the coordinates to find nearby spots
    // For this demo, we'll use our mock database
    
    // Get the city name
    const city = userLocation.city;
    
    // Check if we have data for this city
    if (COOKIE_SPOTS_DB[city]) {
      return COOKIE_SPOTS_DB[city];
    }
    
    // If we don't have data for this specific city, return default spots
    return COOKIE_SPOTS_DB["Default"];
  } catch (error) {
    console.error('Error fetching cookie spots:', error);
    return COOKIE_SPOTS_DB["Default"];
  }
};

/**
 * Search for cookie spots by location string
 * @param {string} locationQuery - Location search query
 * @returns {Array} Array of cookie spots matching the search
 */
export const searchCookieSpots = async (locationQuery) => {
  try {
    // In a real app, this would be an API call to search
    // For this demo, we'll do a simple match against our mock database
    
    const normalizedQuery = locationQuery.trim().toLowerCase();
    
    // Check each city in our database
    for (const [city, spots] of Object.entries(COOKIE_SPOTS_DB)) {
      if (city.toLowerCase().includes(normalizedQuery)) {
        return spots;
      }
    }
    
    // If no match, return default spots
    return COOKIE_SPOTS_DB["Default"];
  } catch (error) {
    console.error('Error searching cookie spots:', error);
    return COOKIE_SPOTS_DB["Default"];
  }
};
