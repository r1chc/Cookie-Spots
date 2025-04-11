import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookieSpots } from '../utils/CookieSpotContext';
import CookieSpotCard from '../components/CookieSpotCard';
import FilterButtons from '../components/FilterButtons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  
  // Parse query params on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialFilters = {};
    
    if (searchParams.has('search')) {
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
  }, []);
  
  // Update URL when filters change
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    if (filters.search) {
      searchParams.set('search', filters.search);
    }
    
    if (filters.cookieType) {
      searchParams.set('cookieType', filters.cookieType);
    }
    
    if (filters.dietaryOption) {
      searchParams.set('dietaryOption', filters.dietaryOption);
    }
    
    if (filters.sort !== 'average_rating' || filters.order !== 'desc') {
      searchParams.set('sort', filters.sort);
      searchParams.set('order', filters.order);
    }
    
    navigate(`/search?${searchParams.toString()}`, { replace: true });
  }, [filters, navigate]);
  
  // Update map center based on first result
  useEffect(() => {
    if (cookieSpots.length > 0 && cookieSpots[0].location && cookieSpots[0].location.coordinates) {
      setMapCenter([cookieSpots[0].location.coordinates[1], cookieSpots[0].location.coordinates[0]]);
    }
  }, [cookieSpots]);
  
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary-600">Home</Link>
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
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'}`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 ${viewMode === 'map' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'}`}
              aria-label="Map view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4 lg:pr-8 mb-6 lg:mb-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            {/* Cookie Types Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Cookie Types</h3>
              <FilterButtons
                items={cookieTypes}
                selectedId={filters.cookieType}
                onSelect={(id) => updateFilters({ cookieType: id })}
                colorClass="bg-primary-100 text-primary-800"
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
                  <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-gray-700">Dine-in</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-gray-700">Takeout</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-gray-700">Delivery</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
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
        
        {/* Results */}
        <div className="lg:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : cookieSpots.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cookie spots found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={() => updateFilters({ search: '', cookieType: '', dietaryOption: '' })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {cookieSpots.map(cookieSpot => (
                  <CookieSpotCard key={cookieSpot._id} cookieSpot={cookieSpot} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
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
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
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
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-[600px]">
                <MapContainer 
                  center={mapCenter} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {cookieSpots.map(cookieSpot => (
                    cookieSpot.location && cookieSpot.location.coordinates && (
                      <Marker 
                        key={cookieSpot._id} 
                        position={[cookieSpot.location.coordinates[1], cookieSpot.location.coordinates[0]]}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-bold">{cookieSpot.name}</h3>
                            <p className="text-sm">{cookieSpot.address}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-400 text-sm">{'★'.repeat(Math.floor(cookieSpot.average_rating))}</span>
                              <span className="text-gray-300 text-sm">{'★'.repeat(5 - Math.floor(cookieSpot.average_rating))}</span>
                              <span className="ml-1 text-xs text-gray-600">{cookieSpot.average_rating.toFixed(1)}</span>
                            </div>
                            <Link 
                              to={`/cookie-spot/${cookieSpot._id}`}
                              className="block mt-2 text-sm text-primary-600 hover:text-primary-700"
                            >
                              View Details
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
