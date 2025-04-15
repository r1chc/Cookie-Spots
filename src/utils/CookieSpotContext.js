import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { cookieSpotApi, cookieTypeApi, dietaryOptionApi } from '../utils/api';

// Create cookie spots context
const CookieSpotContext = createContext();

// Cookie spots provider component
export const CookieSpotProvider = ({ children }) => {
  const [cookieSpots, setCookieSpots] = useState([]);
  const [cookieTypes, setCookieTypes] = useState([]);
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    cookieType: '',
    dietaryOption: '',
    sort: 'average_rating',
    order: 'desc'
  });

  // Load cookie types and dietary options on initial render
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [cookieTypesRes, dietaryOptionsRes] = await Promise.all([
          cookieTypeApi.getAllCookieTypes(),
          dietaryOptionApi.getAllDietaryOptions()
        ]);
        
        setCookieTypes(cookieTypesRes.data);
        setDietaryOptions(dietaryOptionsRes.data);
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Failed to load filter options. Please refresh the page.');
        
        // Set fallback filter options
        setCookieTypes([
          { _id: 'mock-ct-1', name: 'Chocolate Chip' },
          { _id: 'mock-ct-2', name: 'Sugar Cookie' },
          { _id: 'mock-ct-3', name: 'Oatmeal Raisin' },
          { _id: 'mock-ct-4', name: 'Peanut Butter' },
          { _id: 'mock-ct-5', name: 'Snickerdoodle' },
          { _id: 'mock-ct-6', name: 'Macaron' }
        ]);
        
        setDietaryOptions([
          { _id: 'mock-do-1', name: 'Vegan' },
          { _id: 'mock-do-2', name: 'Gluten-Free' },
          { _id: 'mock-do-3', name: 'Nut-Free' },
          { _id: 'mock-do-4', name: 'Dairy-Free' }
        ]);
      }
    };

    loadFilterOptions();
  }, []);

  // Load cookie spots with current filters
  const loadCookieSpots = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        sort: filters.sort,
        order: filters.order
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.cookieType) params.cookie_type = filters.cookieType;
      if (filters.dietaryOption) params.dietary_option = filters.dietaryOption;
      
      const res = await cookieSpotApi.getAllCookieSpots(params);
      
      if (res && res.data) {
        setCookieSpots(res.data.cookieSpots || []);
        setPagination({
          currentPage: res.data.currentPage || 1,
          totalPages: res.data.totalPages || 1,
          total: res.data.total || 0
        });
      } else {
        setCookieSpots([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          total: 0
        });
      }
    } catch (err) {
      console.error('Error loading cookie spots:', err);
      setError('Failed to load cookie spots. Please try again.');
      
      // Create mock cookie spots for demonstration
      const mockSpots = createMockDataForSearch(filters.search || 'New York');
      setCookieSpots(mockSpots);
      
      // Set mock pagination
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: mockSpots.length
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create mock data
  const createMockDataForSearch = (searchLocation) => {
    const defaultCoords = { lat: 40.7128, lng: -74.0060 }; // NYC default
    
    // Create some mock spots with the search term
    return [
      {
        _id: 'mock-1',
        name: `${searchLocation} Cookie Company`,
        description: 'Local favorite cookie shop with fresh baked goods daily.',
        address: `123 Main St, ${searchLocation}`,
        average_rating: 4.7,
        review_count: 42,
        location: {
          coordinates: [defaultCoords.lng, defaultCoords.lat]
        },
        cookie_types: ['Chocolate Chip', 'Sugar Cookie'],
        dietary_options: ['Gluten-Free'],
        website: 'https://example.com',
        phone: '(555) 123-4567'
      },
      {
        _id: 'mock-2',
        name: 'Cookie Monster Bakery',
        description: 'Specialty cookies in dozens of flavors.',
        address: `456 Elm St, ${searchLocation}`,
        average_rating: 4.3,
        review_count: 28,
        location: {
          coordinates: [defaultCoords.lng + 0.01, defaultCoords.lat + 0.01]
        },
        cookie_types: ['Peanut Butter', 'Oatmeal Raisin'],
        dietary_options: ['Vegan'],
        website: 'https://example.com',
        phone: '(555) 234-5678'
      },
      {
        _id: 'mock-3',
        name: 'Sweet Treats & Co',
        description: 'Artisanal cookies and pastries.',
        address: `789 Oak St, ${searchLocation}`,
        average_rating: 4.5,
        review_count: 36,
        location: {
          coordinates: [defaultCoords.lng - 0.01, defaultCoords.lat - 0.01]
        },
        cookie_types: ['Macaron', 'Snickerdoodle'],
        dietary_options: ['Dairy-Free', 'Nut-Free'],
        website: 'https://example.com',
        phone: '(555) 345-6789'
      }
    ];
  };

  // Load cookie spots on initial render and when filters change
  useEffect(() => {
    loadCookieSpots(1);
  }, [filters]);

  // Get a single cookie spot by ID
  const getCookieSpotById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await cookieSpotApi.getCookieSpotById(id);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      console.error('Error loading cookie spot:', err);
      setError('Failed to load cookie spot details. Please try again.');
      
      // Return mock cookie spot details
      return {
        _id: id,
        name: 'Cookie Shop Demo',
        description: 'This is a demo cookie shop shown when the API is unavailable. In a real environment, this would show actual data from our database. Our site is currently experiencing technical difficulties connecting to the database.',
        address: '123 Demo Street, New York, NY 10001',
        average_rating: 4.7,
        review_count: 42,
        location: {
          coordinates: [-74.0060, 40.7128] // NYC
        },
        website: 'https://example.com',
        phone: '(555) 123-4567',
        hours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '10:00 AM - 9:00 PM',
          sunday: '10:00 AM - 6:00 PM'
        },
        cookie_types: [
          { _id: 'mock-ct-1', name: 'Chocolate Chip' },
          { _id: 'mock-ct-2', name: 'Sugar Cookie' },
          { _id: 'mock-ct-3', name: 'Oatmeal Raisin' }
        ],
        dietary_options: [
          { _id: 'mock-do-1', name: 'Vegan' },
          { _id: 'mock-do-2', name: 'Gluten-Free' }
        ],
        reviews: [
          {
            _id: 'mock-review-1',
            user: { username: 'CookieLover', _id: 'user-1' },
            rating: 5,
            comment: 'Best cookies I\'ve ever had!',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: 'mock-review-2',
            user: { username: 'SweetTooth', _id: 'user-2' },
            rating: 4,
            comment: 'Really good cookies and friendly staff.',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]
      };
    }
  };

  // Get nearby cookie spots
  const getNearbyCookieSpots = async (lat, lng, distance = 5000, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await cookieSpotApi.getNearbyCookieSpots(lat, lng, distance, limit);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      console.error('Error loading nearby cookie spots:', err);
      setError('Failed to load nearby cookie spots. Please try again.');
      
      // Return mock nearby cookie spots
      return [
        {
          _id: 'mock-nearby-1',
          name: 'Nearby Cookie Shop',
          description: 'A fantastic cookie shop near your location.',
          address: '123 Nearby St',
          average_rating: 4.8,
          review_count: 35,
          location: {
            coordinates: [lng + 0.005, lat + 0.005]
          },
          distance: 400 // meters
        },
        {
          _id: 'mock-nearby-2',
          name: 'Local Bakery',
          description: 'Fresh cookies baked daily.',
          address: '456 Local Ave',
          average_rating: 4.5,
          review_count: 28,
          location: {
            coordinates: [lng - 0.003, lat - 0.002]
          },
          distance: 650 // meters
        },
        {
          _id: 'mock-nearby-3',
          name: 'Sweet Corner',
          description: 'Specialty cookies and pastries.',
          address: '789 Sweet Blvd',
          average_rating: 4.3,
          review_count: 22,
          location: {
            coordinates: [lng + 0.008, lat - 0.006]
          },
          distance: 980 // meters
        }
      ];
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      cookieType: '',
      dietaryOption: '',
      sort: 'average_rating',
      order: 'desc'
    });
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const contextValue = {
    cookieSpots,
    cookieTypes,
    dietaryOptions,
    loading,
    error,
    pagination,
    filters,
    loadCookieSpots,
    getCookieSpotById,
    getNearbyCookieSpots,
    updateFilters,
    clearFilters,
    clearError
  };

  return React.createElement(
    CookieSpotContext.Provider,
    { value: contextValue },
    children
  );
};

// Custom hook to use cookie spots context
export const useCookieSpots = () => {
  const context = useContext(CookieSpotContext);
  if (!context) {
    throw new Error('useCookieSpots must be used within a CookieSpotProvider');
  }
  return context;
};

export default CookieSpotContext;
