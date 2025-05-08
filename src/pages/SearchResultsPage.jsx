import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookieSpots } from '../utils/CookieSpotContext';
import CookieSpotCard from '../components/CookieSpotCard';
import FilterButtons from '../components/FilterButtons';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { fetchAllSourceCookieSpots } from '../utils/cookieSpotService';
import MapComponent from '../components/Map';
import useScrollRestoration from '../hooks/useScrollRestoration';

// Google Map component
const GoogleMap = ({ center, bounds, spots, hoveredSpot, clickedSpot, searchMetadata }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();
  
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
  
  // Handle spot click - navigate to the cookie spot detail page
  const handleSpotClick = (spot) => {
    if (spot && spot._id) {
      // Check if this is an external spot (from Google Places API)
      // External spots typically have one of these source properties,
      // don't have a MongoDB ObjectId format, or include external IDs
      const isExternalSpot = 
        spot.source === 'google' || 
        spot.source_id || 
        spot.place_id ||
        (spot._id && typeof spot._id === 'string' && 
          (!spot._id.match(/^[0-9a-f]{24}$/i) || spot._id.includes('-')));
      
      console.log('Clicked spot:', { id: spot._id, isExternalSpot });
      
      if (!isExternalSpot) {
        navigate(`/cookie-spot/${spot._id}`);
      }
      // For external spots, we don't navigate - the InfoWindow will
      // display all the needed information
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
      clickedSpot={clickedSpot}
      mapType="google"
      searchMetadata={searchMetadata}
      onSpotClick={handleSpotClick}
    />
  );
};

const SearchResultsPage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

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
  const [clickedSpot, setClickedSpot] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [bounds, setBounds] = useState(null);
  
  // Add state for external API results
  const [externalResults, setExternalResults] = useState([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [combinedResults, setCombinedResults] = useState([]);
  const [searchViewport, setSearchViewport] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  
  // Track if we should show no results message (with a delay)
  const [showNoResults, setShowNoResults] = useState(false);
  
  // Store the caching status in state
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Add a ref to track the previous search to prevent duplicates
  const previousSearchRef = useRef(null);
  
  // Add cookie type selection state
  const [selectedCookieTypes, setSelectedCookieTypes] = useState([]);
  
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
    
    // Set search state immediately
    setIsLoadingExternal(true);
    
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
    
    // Reset the previousSearchRef when location.search changes
    previousSearchRef.current = null;
    
    if (Object.keys(initialFilters).length > 0) {
      updateFilters(initialFilters);
      console.log('Initial filters set:', initialFilters);
    } else {
      // If no filters in URL, but we still need to load
      console.log('No initial filters, loading default cookie spots');
      loadCookieSpots(1);
    }
    setIsInitialLoad(false);
  }, [location.search]);

  // Add this function to filter spots by cookie types
  const filterSpotsByCookieTypes = (spots) => {
    if (!selectedCookieTypes.length) return spots;
    
    return spots.filter(spot => {
      // Check menu items for cookie types
      const menuItems = spot.menu_items || [];
      const menuItemMatches = menuItems.some(item => 
        selectedCookieTypes.some(type => 
          item.name.toLowerCase().includes(type.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(type.toLowerCase()))
        )
      );
      
      // Check reviews for cookie types
      const reviews = spot.reviews || [];
      const reviewMatches = reviews.some(review => 
        selectedCookieTypes.some(type => 
          review.text.toLowerCase().includes(type.toLowerCase())
        )
      );
      
      // Check business description/tags
      const description = (spot.description || '').toLowerCase();
      const tags = (spot.tags || []).map(tag => tag.toLowerCase());
      const descriptionMatches = selectedCookieTypes.some(type => 
        description.includes(type.toLowerCase()) ||
        tags.includes(type.toLowerCase())
      );
      
      return menuItemMatches || reviewMatches || descriptionMatches;
    });
  };

  // Modify the useEffect that handles search results
  useEffect(() => {
    const loadExternalResults = async () => {
      if (!location.search) return;
      
      const searchParams = new URLSearchParams(location.search);
      const searchLocation = searchParams.get('location') || searchParams.get('search');
      
      if (!searchLocation) {
        console.log('No search term, skipping external results load');
        return;
      }
      
      if (previousSearchRef.current === searchLocation) {
        console.log('Skipping duplicate search for:', searchLocation);
        return;
      }
      
      previousSearchRef.current = searchLocation;
      setIsLoadingExternal(true);
      
      try {
        setShowNoResults(false);
        
        const result = await fetchAllSourceCookieSpots(searchLocation);
        const externalSpots = result.spots || [];
        
        if (externalSpots && externalSpots.length > 0) {
          // Apply cookie type filtering
          const filteredSpots = filterSpotsByCookieTypes(externalSpots);
          setExternalResults(filteredSpots);
          
          if (result.search_metadata) {
            setSearchMetadata(result.search_metadata);
          }
          
          if (result.viewport) {
            setSearchViewport(result.viewport);
          }
          
          setIsFromCache(result.fromCache || false);
        }
      } catch (error) {
        console.error('Error loading external results:', error);
      } finally {
        setIsLoadingExternal(false);
      }
    };
    
    loadExternalResults();
  }, [location.search, selectedCookieTypes]);

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

  // Handle card click for map interaction
  const handleCardClick = (cookieSpot) => {
    setClickedSpot(cookieSpot);
  };

  // Get all spots to display (combined results or just cookieSpots)
  const spotsToDisplay = combinedResults.length > 0 ? combinedResults : cookieSpots;
  
  // Force "no results" to false when loading
  if (loading || isLoadingExternal) {
    if (showNoResults) setShowNoResults(false);
  }
  
  // Reset showNoResults when a new search starts
  useEffect(() => {
    setShowNoResults(false);
  }, [location.search]);
  
  // Add cookie type selection handler
  const handleCookieTypeSelect = (cookieType) => {
    setSelectedCookieTypes(prev => {
      if (prev.includes(cookieType)) {
        return prev.filter(type => type !== cookieType);
      }
      return [...prev, cookieType];
    });
  };

  // Add this to your JSX where you want to show the cookie type filters
  const renderCookieTypeFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {['chocolate chip', 'biscotti', 'sugar', 'oatmeal', 'peanut butter', 'snickerdoodle'].map(type => (
        <button
          key={type}
          onClick={() => handleCookieTypeSelect(type)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selectedCookieTypes.includes(type)
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {type}
        </button>
      ))}
    </div>
  );

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
              {/* Initial loading state */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Loading from database...</h3>
                  </div>
                </div>
              ) : isLoadingExternal ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">We're getting your Cookie Spots!</h3>
                    <p className="text-gray-600">Fetching spots in your area...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading results</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : spotsToDisplay.length === 0 && showNoResults ? (
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
                  {spotsToDisplay.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {/* Display combined results */}
                      {spotsToDisplay.map((cookieSpot, index) => (
                        cookieSpot ? (
                          <div 
                            key={cookieSpot._id || `spot-${index}`}
                            onMouseEnter={() => handleCardHover(cookieSpot)}
                            onMouseLeave={handleCardUnhover}
                            onClick={() => handleCardClick(cookieSpot)}
                            className="cursor-pointer"
                          >
                            <CookieSpotCard cookieSpot={cookieSpot} />
                          </div>
                        ) : null
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Processing results...</h3>
                        <p className="text-gray-600">Almost there</p>
                      </div>
                    </div>
                  )}
                  
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
                          `Results include ${cookieSpots.length > 0 ? 'MongoDB data and ' : ''}cookie spots from our server cache` :
                          `Results include ${cookieSpots.length > 0 ? 'MongoDB data and ' : ''}cookie spots from Google Places API${searchMetadata?.search_type === 'multi_zipcode' ? ` across ${searchMetadata.zipcode_count} zip codes` : ''}`}
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
                    clickedSpot={clickedSpot}
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