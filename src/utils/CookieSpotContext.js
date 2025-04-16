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
        setCookieTypes([]);
        setDietaryOptions([]);
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
      setCookieSpots([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: 0
      });
    } finally {
      setLoading(false);
    }
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
      return null;
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
      return [];
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
