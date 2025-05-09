import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookieSpots } from '../utils/CookieSpotContext';
import CookieSpotCard from '../components/CookieSpotCard';
import FilterButtons from '../components/FilterButtons';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { fetchAllSourceCookieSpots } from '../utils/cookieSpotService';
import MapComponent from '../components/Map';
import useScrollRestoration from '../hooks/useScrollRestoration';

// Helper function to get filter keyword (name) from its ID
const getFilterKeyword = (filterId, items) => {
  if (!filterId || !items || items.length === 0) return null;
  if (filterId === 'all' || filterId === '') return null; 
  const item = items.find(opt => opt._id === filterId);
  return item ? item.name.toLowerCase() : null;
};

// Helper function to check if a spot matches a keyword in its name, description, or specific arrays
const spotMatchesKeyword = (spot, keyword, fieldArrayName = null) => {
  if (!keyword) return true; 
  const lowerKeyword = keyword.toLowerCase();

  const nameMatch = spot.name && spot.name.toLowerCase().includes(lowerKeyword);
  const descriptionMatch = spot.description && spot.description.toLowerCase().includes(lowerKeyword);
  
  let fieldArrayValuesMatch = false;
  if (fieldArrayName && spot[fieldArrayName] && Array.isArray(spot[fieldArrayName])) {
    fieldArrayValuesMatch = spot[fieldArrayName].some(val => typeof val === 'string' && val.toLowerCase().includes(lowerKeyword));
  }

  return nameMatch || descriptionMatch || fieldArrayValuesMatch;
};

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

  // Add keyword state for cookie-specific filtering
  const [cookieKeyword, setCookieKeyword] = useState('');
  
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

  // Effect to load external results after internal database results
  useEffect(() => {
    const loadExternalResults = async () => {
      if (!location.search) return;
      
      // Get the search term from the URL - either 'location' or 'search' parameter
      const searchParams = new URLSearchParams(location.search);
      const searchLocation = searchParams.get('location') || searchParams.get('search');
      
      // Skip external fetching if no search term
      if (!searchLocation) {
        console.log('No search term, skipping external results load');
        return;
      }
      
      // Avoid duplicate searches if the search term hasn't changed
      if (previousSearchRef.current === searchLocation) {
        console.log('Skipping duplicate search for:', searchLocation);
        return;
      }
      
      // Track this search to avoid duplicates
      previousSearchRef.current = searchLocation;
      
      // Start loading state
      setIsLoadingExternal(true);
      
      console.log('Loading external results for:', searchLocation);
      
      try {
        setShowNoResults(false);
        
        try {
          // Fetch external API results
          const result = await fetchAllSourceCookieSpots(searchLocation);
          const externalSpots = result.spots || [];
          
          // Log the exact number of spots received
          console.log(`RECEIVED ${externalSpots.length} spots from external API`);
          
          // Log additional information about multi-zipcode searches
          if (result.search_metadata?.search_type === 'multi_zipcode') {
            console.log(`Multi-zipcode search from ${result.search_metadata.zipcode_count} zip codes for ${searchLocation}`);
          }
          
          // If we got results, store them
          if (externalSpots && externalSpots.length > 0) {
            setExternalResults(externalSpots);
            
            // Store metadata if available
            if (result.search_metadata) {
              console.log('Search metadata:', result.search_metadata);
              setSearchMetadata(result.search_metadata);
            }
            
            // Store viewport information
            if (result.viewport) {
              setSearchViewport(result.viewport);
            }
            
            // Track if results came from cache
            setIsFromCache(result.fromCache || false);
            
            // Combine with database results
            const combined = [...cookieSpots];
            const seenIds = new Set(cookieSpots.map(spot => spot._id));
            const seenNames = new Map();
            
            // Create lookup for existing spots
            cookieSpots.forEach(spot => {
              if (spot && spot.name && spot.address) {
                const key = `${spot.name.toLowerCase()}|${spot.address.toLowerCase()}`;
                seenNames.set(key, true);
              }
            });
            
            // Add external results that aren't duplicates
            externalSpots.forEach(spot => {
              if (spot._id && seenIds.has(spot._id)) return;
              
              if (spot && spot.name && spot.address) {
                const key = `${spot.name.toLowerCase()}|${spot.address.toLowerCase()}`;
                if (seenNames.has(key)) return;
                
                combined.push(spot);
                seenNames.set(key, true);
              }
            });
            
            // Log the final combined count
            console.log(`COMBINED: Setting ${combined.length} spots in state (${cookieSpots.length} from DB + ${externalSpots.length - (combined.length - cookieSpots.length)} filtered out as duplicates)`);
            
            // Update state with combined results and ensure we don't show "no results"
            setCombinedResults(combined);
            setShowNoResults(false);
          } else {
            // If no external results, just use the MongoDB results
            setCombinedResults(cookieSpots);
            
            // Only show "no results" if both sources returned nothing
            if (cookieSpots.length === 0) {
              // Wait a bit to be sure rendering is complete
              setTimeout(() => {
                setShowNoResults(true);
              }, 1000);
            }
          }
        } catch (error) {
          console.error('Error fetching from external sources:', error);
          // On error, use whatever MongoDB results we have
          setCombinedResults(cookieSpots);
          
          // Only show "no results" if MongoDB returned nothing
          if (cookieSpots.length === 0) {
            setTimeout(() => {
              setShowNoResults(true);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error in loadExternalResults:', error);
        setCombinedResults(cookieSpots);
      } finally {
        // Always ensure loading state is cleared
        setIsLoadingExternal(false);
      }
    };
    
    // Only run this effect after internal database results are loaded
    if (!loading && !isInitialLoad) {
      loadExternalResults();
    }
  }, [location.search, isInitialLoad, cookieSpots]);

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
    let clientSort = value;  // Store the client-side sort preference
    
    // For server API requests, always use valid parameters
    // to prevent server errors
    if (value === 'rating_high') {
      sort = 'average_rating';
      order = 'desc';
    } else if (value === 'rating_low') {
      sort = 'average_rating';
      order = 'asc';
    } else if (value === 'reviews') {
      // Use a safe sort parameter for server API
      sort = 'average_rating';
      order = 'desc';
    }
    
    updateFilters({ sort, order, clientSort });
  };
  
  // Get current sort value for select
  const getCurrentSortValue = () => {
    // First check if we have a clientSort value
    if (filters.clientSort) {
      // If clientSort is 'newest' (from previous version), default to 'rating_high'
      if (filters.clientSort === 'newest') return 'rating_high';
      return filters.clientSort;
    }
    
    // Fall back to legacy sort/order logic
    const { sort, order } = filters;
    
    if (sort === 'average_rating' && order === 'desc') return 'rating_high';
    if (sort === 'average_rating' && order === 'asc') return 'rating_low';
    if (sort === 'review_count') return 'reviews';
    
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

  const finalFilteredSpots = useMemo(() => {
    if (loading || !combinedResults) {
        return [];
    }
    if (combinedResults.length === 0) {
        return [];
    }

    const activeCookieTypeKeyword = getFilterKeyword(filters.cookieType, cookieTypes);
    const activeDietaryOptionKeyword = getFilterKeyword(filters.dietaryOption, dietaryOptions);
    
    // First apply all filters
    let filteredSpots = combinedResults;
    
    if (activeCookieTypeKeyword || activeDietaryOptionKeyword) {
      filteredSpots = combinedResults.filter(spot => {
        const isExternal = spot.source === 'google' || spot.place_id;

        if (activeCookieTypeKeyword) {
          let matchesCookieType = false;
          if (isExternal) {
            matchesCookieType = spotMatchesKeyword(spot, activeCookieTypeKeyword, 'cookie_types');
          } else { 
            const internalSpotInContext = cookieSpots.find(cs => cs._id === spot._id);
            if (internalSpotInContext && internalSpotInContext.cookie_types && Array.isArray(internalSpotInContext.cookie_types)) {
              matchesCookieType = internalSpotInContext.cookie_types.some(ct => 
                (typeof ct === 'string' && ct.toLowerCase().includes(activeCookieTypeKeyword)) || 
                (ct.name && ct.name.toLowerCase().includes(activeCookieTypeKeyword))
              );
            } else {
              matchesCookieType = spotMatchesKeyword(spot, activeCookieTypeKeyword, 'cookie_types');
            }
          }
          if (!matchesCookieType) return false;
        }

        if (activeDietaryOptionKeyword) {
          let matchesDietaryOption = false;
          if (isExternal) {
            matchesDietaryOption = spotMatchesKeyword(spot, activeDietaryOptionKeyword, 'dietary_options');
          } else { 
            const internalSpotInContext = cookieSpots.find(cs => cs._id === spot._id);
            if (internalSpotInContext && internalSpotInContext.dietary_options && Array.isArray(internalSpotInContext.dietary_options)) {
              matchesDietaryOption = internalSpotInContext.dietary_options.some(opt => 
                (typeof opt === 'string' && opt.toLowerCase().includes(activeDietaryOptionKeyword)) ||
                (opt.name && opt.name.toLowerCase().includes(activeDietaryOptionKeyword))
              );
            } else {
              matchesDietaryOption = spotMatchesKeyword(spot, activeDietaryOptionKeyword, 'dietary_options');
            }
          }
          if (!matchesDietaryOption) return false;
        }
        return true; 
      });
    }
    
    // Then apply sorting - use clientSort if available, otherwise use sort/order
    const clientSort = filters.clientSort || getCurrentSortValue();
    
    // Create a sorted copy of the filtered results
    return [...filteredSpots].sort((a, b) => {
      // For highest/lowest rating
      if (clientSort === 'rating_high') {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        return ratingB - ratingA;
      }
      
      if (clientSort === 'rating_low') {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        return ratingA - ratingB;
      }
      
      // For review_count
      if (clientSort === 'reviews') {
        const countA = a.review_count || 0;
        const countB = b.review_count || 0;
        return countB - countA;
      }
      
      // Default sort by average_rating desc
      const defaultRatingA = a.average_rating || 0;
      const defaultRatingB = b.average_rating || 0;
      return defaultRatingB - defaultRatingA;
    });
  }, [combinedResults, filters, cookieTypes, dietaryOptions, cookieSpots, loading]);

  // Get all spots to display
  const spotsToDisplay = finalFilteredSpots;

  // Effect to manage the showNoResults flag based on final results and loading states
  useEffect(() => {
    // If we are still loading data from any source, or if there's an error,
    // the main loading/error messages should be shown, so don't decide on "no results" yet.
    if (loading || isLoadingExternal || error) {
      // It might be good to ensure showNoResults is false here if not handled elsewhere,
      // to prevent briefly showing "no results" if loading states toggle quickly.
      // For now, the main goal is to set it to true when appropriate.
      // setShowNoResults(false); // Consider if this is needed or if existing resets are sufficient.
      return;
    }

    // At this point, all loading is done, and there's no error.
    // Now, check if there are any spots to display.
    if (spotsToDisplay.length === 0) {
      // No spots left after all fetching and client-side filtering.
      setShowNoResults(true);
    } else {
      // There are spots to display.
      setShowNoResults(false);
    }
  }, [spotsToDisplay, loading, isLoadingExternal, error]);

  // Add function to handle keyword filtering
  const handleKeywordFilterChange = (e) => {
    setCookieKeyword(e.target.value);
  };
  
  const applyKeywordFilter = () => {
    if (cookieKeyword.trim()) {
      updateFilters({ keyword: cookieKeyword.trim() });
    } else {
      // If keyword is empty, clear the keyword filter
      const updatedFilters = { ...filters };
      delete updatedFilters.keyword;
      updateFilters(updatedFilters);
    }
  };

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
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {filters.search ? `Results for "${filters.search}"` : 'All Cookie Spots'}
          </h1>
          <div className="flex items-center mb-4">
            <div>
              <label htmlFor="sort" className="mr-2 text-gray-700 font-medium">Sort by:</label>
              <select
                id="sort"
                value={getCurrentSortValue()}
                onChange={handleSortChange}
                className="border border-primary text-base pl-3 pr-10 py-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg"
                style={{ borderColor: 'var(--color-primary, #3b82f6)' }}
              >
                <option value="rating_high">Highest Rated</option>
                <option value="rating_low">Lowest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Filters Sidebar - Left Column - Now hidden */}
          <div className="hidden">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              {/* Cookie Types Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Cookie Types</h3>
                <FilterButtons
                  items={cookieTypes}
                  selectedId={filters.cookieType || 'all'}
                  onSelect={(id) => {
                    const newCookieType = filters.cookieType === id ? null : id;
                    updateFilters({ ...filters, cookieType: newCookieType });
                  }}
                  colorClass="bg-blue-100 text-primary"
                />
              </div>
              
              {/* Dietary Options Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Dietary Options</h3>
                <FilterButtons
                  items={dietaryOptions}
                  selectedId={filters.dietaryOption || 'all'}
                  onSelect={(id) => {
                    const newDietaryOption = filters.dietaryOption === id ? null : id;
                    updateFilters({ ...filters, dietaryOption: newDietaryOption });
                  }}
                  colorClass="bg-green-100 text-green-800"
                />
              </div>
              
              {/* Keyword Filter for Reviews & Menu Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Filter by Keyword</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Find places with specific cookies mentioned in reviews or menu items
                </p>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="e.g., chocolate chip, oatmeal"
                      value={cookieKeyword}
                      onChange={handleKeywordFilterChange}
                      className="border border-gray-300 rounded-l px-3 py-2 text-sm flex-grow"
                      onKeyDown={(e) => e.key === 'Enter' && applyKeywordFilter()}
                    />
                    <button
                      onClick={applyKeywordFilter}
                      className="bg-primary text-white rounded-r px-4 py-2 text-sm"
                    >
                      Apply
                    </button>
                  </div>
                  {filters.keyword && (
                    <div className="mt-2 flex items-center">
                      <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium flex items-center">
                        Filtering by: {filters.keyword}
                        <button
                          onClick={() => {
                            const updatedFilters = { ...filters };
                            delete updatedFilters.keyword;
                            updateFilters(updatedFilters);
                            setCookieKeyword('');
                          }}
                          className="ml-2 text-blue-800 hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  )}
                </div>
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
          
          {/* Results - Left Column (expanded) */}
          <div className="lg:w-1/2 px-3">
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
                      onClick={() => updateFilters({ search: '', cookieType: '', dietaryOption: '', keyword: '' })}
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
          
          {/* Map - Right Column (expanded) */}
          <div className="lg:w-1/2 lg:pl-6 mt-6 lg:mt-0">
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