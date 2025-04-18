import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookieSpots } from '../utils/CookieSpotContext';
import CookieSpotCard from '../components/CookieSpotCard';
import FilterButtons from '../components/FilterButtons';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { fetchAllSourceCookieSpots } from '../utils/cookieSpotService';
import MapComponent from '../components/Map';

// Google Map component
const GoogleMap = ({ center, bounds, spots, hoveredSpot, searchMetadata }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef({});
  
  useEffect(() => {
    loadGoogleMapsAPI();
    
    return () => {
      // Clean up map instance
      if (mapInstanceRef.current) {
        // Clean up any listeners if needed
      }
    };
  }, []);
  
  const loadGoogleMapsAPI = async () => {
    try {
      // Use the shared loader instead of creating a new one
      await loadGoogleMaps();
      
      // Instead of initializing Google Maps here, we'll use our Map component
      googleRef.current = window.google;
    } catch (error) {
      console.error('Error loading Google Maps API:', error);
    }
  };
  
  // Use our Map component instead of direct Google Maps implementation
  return (
    <MapComponent
      spots={spots}
      center={center && center.length === 2 ? { lat: center[0], lng: center[1] } : null}
      bounds={bounds ? {
        north: bounds[1][0],
        east: bounds[1][1],
        south: bounds[0][0],
        west: bounds[0][1]
      } : null}
      hoveredSpot={hoveredSpot}
      mapType="google"
      searchMetadata={searchMetadata}
    />
  );
};

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    cookieSpots, 
    cookieTypes, 
    dietaryOptions, 
    loading, 
    error, 
    pagination, 
    filters, 
    loadCookieSpots, 
    updateFilters 
  } = useCookieSpots();
  
  const [hoveredSpot, setHoveredSpot] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [bounds, setBounds] = useState(null);
  
  // Add state for external API results
  const [externalResults, setExternalResults] = useState([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [combinedResults, setCombinedResults] = useState([]);
  const [searchViewport, setSearchViewport] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  
  // Store the caching status in state
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Force white background
  useEffect(() => {
    document.body.classList.add('search-page');
    
    const style = document.createElement('style');
    style.textContent = `
      body.search-page, 
      body.search-page #root, 
      body.search-page main, 
      body.search-page [class*="bg-primary"] {
        background-color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.classList.remove('search-page');
      document.head.removeChild(style);
    };
  }, []);
  
  // Parse query params on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialFilters = {};
    
    if (searchParams.has('location')) {
      initialFilters.search = searchParams.get('location');
    } else if (searchParams.has('search')) {
      initialFilters.search = searchParams.get('search');
    }
    
    if (searchParams.has('cookieType')) {
      initialFilters.cookieType = searchParams.get('cookieType');
    }
    
    if (searchParams.has('dietaryOption')) {
      initialFilters.dietaryOption = searchParams.get('dietaryOption');
    }
    
    if (searchParams.has('sort')) {
      initialFilters.sort = searchParams.get('sort');
    }
    
    if (searchParams.has('order')) {
      initialFilters.order = searchParams.get('order');
    }
    
    if (Object.keys(initialFilters).length > 0) {
      updateFilters(initialFilters);
    }
    setIsInitialLoad(false);
  }, [location.search]);

  // Effect to load external results after internal database results
  useEffect(() => {
    const loadExternalResults = async () => {
      try {
        setIsLoadingExternal(true);
        
        // Get search parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const locationQuery = searchParams.get('location') || searchParams.get('search');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        
        if (!locationQuery && (!lat || !lng)) {
          setIsLoadingExternal(false);
          return;
        }
        
        // Prepare search parameters
        let searchLocation;
        if (lat && lng) {
          searchLocation = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
        } else {
          searchLocation = locationQuery;
        }
        
        console.log('Fetching external results for:', searchLocation);
        
        // Fetch from external APIs
        try {
          const result = await fetchAllSourceCookieSpots(searchLocation);
          const externalSpots = result.spots || [];
          setExternalResults(externalSpots);
          
          // Store search metadata if available
          if (result.search_metadata) {
            setSearchMetadata(result.search_metadata);
            console.log('Received search metadata:', result.search_metadata);
          }
          
          // Add debug logs
          console.log('External API results:', {
            totalSpots: externalSpots.length,
            hasViewport: !!result.viewport,
            firstSpot: externalSpots.length > 0 ? externalSpots[0].name : 'none',
            hasSearchMetadata: !!result.search_metadata,
            fromCache: result.fromCache
          });
          
          // Store the caching status in state
          if (result.fromCache) {
            setIsFromCache(true);
            console.log('%c✓ Results were served from server cache - No Google Places API calls were made', 'color: green; font-weight: bold');
          } else {
            setIsFromCache(false);
            console.log('%c⚠ Fresh results from Google Places API', 'color: orange');
          }
          
          // Store viewport information for map centering
          if (result.viewport) {
            setSearchViewport(result.viewport);
            console.log('Setting map viewport from search:', result.viewport);
          }
          
          // Combine with database results (cookieSpots from context)
          const combined = [...cookieSpots];
          const seenIds = new Set(cookieSpots.map(spot => spot._id));
          const seenNames = new Map();
          
          // Create a map of existing names/addresses for deduplication
          cookieSpots.forEach(spot => {
            const key = `${(spot.name || '').toLowerCase()}|${(spot.address || '').toLowerCase()}`;
            seenNames.set(key, true);
          });
          
          // Add external results that aren't duplicates
          externalSpots.forEach(spot => {
            if (spot._id && seenIds.has(spot._id)) return;
            
            const key = `${(spot.name || '').toLowerCase()}|${(spot.address || '').toLowerCase()}`;
            if (seenNames.has(key)) return;
            
            combined.push(spot);
            seenNames.set(key, true);
          });
          
          // Update log message to be more accurate about data source
          if (result.fromCache) {
            console.log(`Combined ${cookieSpots.length} database results with ${externalSpots.length} results from server cache for a total of ${combined.length} unique spots`);
          } else {
            console.log(`Combined ${cookieSpots.length} database results with ${externalSpots.length} external API results for a total of ${combined.length} unique spots`);
          }
          
          // Update state with combined results
          setCombinedResults(combined);
        } catch (error) {
          console.error('Error fetching from external sources:', error);
          setCombinedResults([]);
        }
      } catch (error) {
        console.error('Error in loadExternalResults:', error);
        setCombinedResults([]);
      } finally {
        setIsLoadingExternal(false);
      }
    };
    
    // Only run this effect after internal database results are loaded
    if (!loading && !isInitialLoad) {
      loadExternalResults();
    }
  }, [location.search, cookieSpots, loading, isInitialLoad]);

  // Calculate map bounds based on all spots
  useEffect(() => {
    // Use combined results if available, otherwise fall back to cookieSpots
    const spotsToUse = combinedResults.length > 0 ? combinedResults : cookieSpots;
    
    // First check if we have a viewport from search results
    if (searchViewport) {
      // Use the viewport from the search results to set the map boundaries
      console.log('Using search viewport for map:', searchViewport);
      
      // Set center to the middle of the viewport
      const centerLat = (searchViewport.northeast.lat + searchViewport.southwest.lat) / 2;
      const centerLng = (searchViewport.northeast.lng + searchViewport.southwest.lng) / 2;
      setMapCenter([centerLat, centerLng]);
      
      // Set bounds based on viewport
      const southWest = [
        searchViewport.southwest.lat,
        searchViewport.southwest.lng
      ];
      
      const northEast = [
        searchViewport.northeast.lat,
        searchViewport.northeast.lng
      ];
      
      setBounds([southWest, northEast]);
      return;
    }
    
    // If no viewport, use the spots to calculate bounds
    if (spotsToUse && spotsToUse.length > 0) {
      // Find valid coordinates
      const validSpots = spotsToUse.filter(
        spot => spot && spot.location && spot.location.coordinates && 
        spot.location.coordinates.length === 2
      );
      
      if (validSpots.length > 0) {
        // Set center to first spot
        setMapCenter([
          validSpots[0].location.coordinates[1], 
          validSpots[0].location.coordinates[0]
        ]);
        
        // Calculate bounds
        if (validSpots.length > 1) {
          const lats = validSpots.map(spot => spot.location.coordinates[1]);
          const lngs = validSpots.map(spot => spot.location.coordinates[0]);
          
          const southWest = [
            Math.min(...lats) - 0.01,
            Math.min(...lngs) - 0.01
          ];
          
          const northEast = [
            Math.max(...lats) + 0.01,
            Math.max(...lngs) + 0.01
          ];
          
          setBounds([southWest, northEast]);
        }
      }
    }
  }, [combinedResults, cookieSpots, searchViewport]);
  
  // Memoize the URL update function
  const updateURL = useCallback((currentFilters) => {
    const searchParams = new URLSearchParams();
    
    if (currentFilters.search) {
      searchParams.set('search', currentFilters.search);
    }
    
    if (currentFilters.cookieType) {
      searchParams.set('cookieType', currentFilters.cookieType);
    }
    
    if (currentFilters.dietaryOption) {
      searchParams.set('dietaryOption', currentFilters.dietaryOption);
    }
    
    if (currentFilters.sort !== 'average_rating' || currentFilters.order !== 'desc') {
      searchParams.set('sort', currentFilters.sort);
      searchParams.set('order', currentFilters.order);
    }
    
    navigate(`/search?${searchParams.toString()}`, { replace: true });
  }, [navigate]);
  
  // Update URL when filters change, but only after initial load
  useEffect(() => {
    if (!isInitialLoad) {
      updateURL(filters);
    }
  }, [filters, updateURL, isInitialLoad]);
  
  // Handle page change
  const handlePageChange = (page) => {
    loadCookieSpots(page);
    window.scrollTo(0, 0);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    let sort = 'average_rating';
    let order = 'desc';
    
    if (value === 'rating_high') {
      sort = 'average_rating';
      order = 'desc';
    } else if (value === 'rating_low') {
      sort = 'average_rating';
      order = 'asc';
    } else if (value === 'reviews') {
      sort = 'review_count';
      order = 'desc';
    } else if (value === 'newest') {
      sort = 'createdAt';
      order = 'desc';
    }
    
    updateFilters({ sort, order });
  };
  
  // Get current sort value for select
  const getCurrentSortValue = () => {
    const { sort, order } = filters;
    
    if (sort === 'average_rating' && order === 'desc') return 'rating_high';
    if (sort === 'average_rating' && order === 'asc') return 'rating_low';
    if (sort === 'review_count') return 'reviews';
    if (sort === 'createdAt') return 'newest';
    
    return 'rating_high'; // Default
  };

  // Handle card hover for map interaction
  const handleCardHover = (cookieSpot) => {
    setHoveredSpot(cookieSpot);
  };

  // Handle card unhover
  const handleCardUnhover = () => {
    setHoveredSpot(null);
  };

  // Get all spots to display (combined results or just cookieSpots)
  const spotsToDisplay = combinedResults.length > 0 ? combinedResults : cookieSpots;
  
  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: 'white !important' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Search Results</span>
        </div>
        
        {/* Search Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-2 md:mb-0">
            {filters.search ? `Results for "${filters.search}"` : 'All Cookie Spots'}
          </h1>
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select
                id="sort"
                value={getCurrentSortValue()}
                onChange={handleSortChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="rating_high">Highest Rated</option>
                <option value="rating_low">Lowest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Filters Sidebar - Left Column */}
          <div className="lg:w-1/5 lg:pr-6 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              {/* Cookie Types Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Cookie Types</h3>
                <FilterButtons
                  items={cookieTypes}
                  selectedId={filters.cookieType}
                  onSelect={(id) => updateFilters({ cookieType: id })}
                  colorClass="bg-blue-100 text-primary"
                />
              </div>
              
              {/* Dietary Options Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Dietary Options</h3>
                <FilterButtons
                  items={dietaryOptions}
                  selectedId={filters.dietaryOption}
                  onSelect={(id) => updateFilters({ dietaryOption: id })}
                  colorClass="bg-green-100 text-green-800"
                />
              </div>
              
              {/* Additional Filters */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Features</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Dine-in</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Takeout</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Delivery</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Wheelchair Accessible</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">$</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">$$</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">$$$</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">$$$$</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results - Middle Column */}
          <div className="lg:w-2/5 px-3">
            <div className="bg-white rounded-lg shadow-md">
              {/* Show loading state when either internal or external results are loading */}
              {(loading || isLoadingExternal) ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading results</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : spotsToDisplay.length === 0 ? (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cookie spots found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any cookie spots for your search "{filters.search}".
                    <br />
                    Try searching for a different location, or try removing some filters.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => updateFilters({ search: '', cookieType: '', dietaryOption: '' })}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Clear all filters
                    </button>
                    <Link
                      to="/"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Return home
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Display combined results */}
                    {spotsToDisplay.map((cookieSpot, index) => (
                      cookieSpot ? (
                        <div 
                          key={cookieSpot._id || `spot-${index}`}
                          onMouseEnter={() => handleCardHover(cookieSpot)}
                          onMouseLeave={handleCardUnhover}
                        >
                          <CookieSpotCard cookieSpot={cookieSpot} />
                        </div>
                      ) : null
                    ))}
                  </div>
                  
                  {/* Pagination - only show for database results */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {[...Array(pagination.totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.currentPage === i + 1
                                ? 'z-10 bg-blue-50 border-primary text-primary'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.currentPage === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                  
                  {/* Source information */}
                  {externalResults.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      <p>
                        {isFromCache ? 
                          'Results include data from our database and cached external sources' :
                          'Results include data from our database and external API calls'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Map - Right Column */}
          <div className="lg:w-2/5 lg:pl-6 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="h-[calc(100vh-2rem)] min-h-[600px]">
                {spotsToDisplay && spotsToDisplay.length > 0 && (
                  <GoogleMap 
                    center={mapCenter}
                    bounds={bounds}
                    spots={spotsToDisplay}
                    hoveredSpot={hoveredSpot}
                    searchMetadata={searchMetadata}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;