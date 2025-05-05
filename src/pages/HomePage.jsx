import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import CookieSpotCard from '../components/CookieSpotCard'
import FilterButtons from '../components/FilterButtons'
import { getCurrentLocation, reverseGeocode, getDefaultLocation } from '../utils/geolocation'
import { fetchCookieSpotsByLocation, fetchAllSourceCookieSpots } from '../utils/cookieSpotService'
import useScrollRestoration from '../hooks/useScrollRestoration'
import '../styles/HomePage.css'

// In-memory cache for the homepage to avoid duplicate API calls
const homePageCache = {
  featuredSpots: null,
  userLocation: null,
  timestamp: null,
  // Cache expiration in milliseconds (15 minutes)
  expirationTime: 15 * 60 * 1000
};

const HomePage = ({ onSearch }) => {
  useScrollRestoration();
  
  const [featuredSpots, setFeaturedSpots] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to get user location and fetch nearby cookie spots
    const getUserLocationAndSpots = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have valid cached data
        const now = Date.now();
        if (homePageCache.featuredSpots && 
            homePageCache.userLocation && 
            homePageCache.timestamp && 
            (now - homePageCache.timestamp < homePageCache.expirationTime)) {
          
          console.log('Using cached homepage data from previous visit');
          setFeaturedSpots(homePageCache.featuredSpots);
          setUserLocation(homePageCache.userLocation);
          setIsLoading(false);
          return;
        }
        
        // If no cache or expired, get new data
        console.log('No valid cache found, fetching new location and spots data');
        
        // Try to get the user's current location
        const coords = await getCurrentLocation();
        
        // Reverse geocode to get city and state
        const locationData = await reverseGeocode(coords);
        
        // Set the user's location
        const userLocationData = {
          ...locationData,
          latitude: coords.latitude,
          longitude: coords.longitude
        };
        
        setUserLocation(userLocationData);
        
        try {
          // Fetch cookie spots based on the user's location
          const spots = await fetchCookieSpotsByLocation(userLocationData);
          // Check if spots is an array or an object with spots property
          const spotsArray = Array.isArray(spots) ? spots : (spots?.spots || []);
          
          if (spotsArray.length > 0) {
            // Sort by rating and limit to top 5
            const sortedSpots = [...spotsArray].sort((a, b) => 
              (b.average_rating || 0) - (a.average_rating || 0)
            ).slice(0, 5);
            
            setFeaturedSpots(sortedSpots);
            
            // Update the cache
            homePageCache.featuredSpots = sortedSpots;
            homePageCache.userLocation = userLocationData;
            homePageCache.timestamp = Date.now();
          } else {
            setFeaturedSpots([]);
          }
        } catch (spotError) {
          console.error('Error fetching spots:', spotError);
          setFeaturedSpots([]);
        }
        
      } catch (error) {
        console.error('Error getting location or spots:', error);
        setLocationError(error.message);
        
        // Use default location as fallback
        const defaultLocation = getDefaultLocation();
        setUserLocation(defaultLocation);
        
        try {
          // Fetch default cookie spots
          const defaultSpots = await fetchCookieSpotsByLocation(defaultLocation);
          // Check if spots is an array or an object with spots property
          const spotsArray = Array.isArray(defaultSpots) ? defaultSpots : (defaultSpots?.spots || []);
          
          if (spotsArray.length > 0) {
            // Sort by rating and limit to top 5
            const sortedSpots = [...spotsArray].sort((a, b) => 
              (b.average_rating || 0) - (a.average_rating || 0)
            ).slice(0, 5);
            
            setFeaturedSpots(sortedSpots);
            
            // Update the cache even for default location
            homePageCache.featuredSpots = sortedSpots;
            homePageCache.userLocation = defaultLocation;
            homePageCache.timestamp = Date.now();
          } else {
            setFeaturedSpots([]);
          }
        } catch (spotError) {
          console.error('Error fetching default spots:', spotError);
          setFeaturedSpots([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Call the function to get location and spots
    getUserLocationAndSpots();
  }, []);

  const handleSearch = (searchText, locationData) => {
    // Build URL params
    const params = new URLSearchParams();
    params.set('location', searchText);
    
    // Add coordinates if available
    if (locationData && locationData.latitude && locationData.longitude) {
      params.set('lat', locationData.latitude);
      params.set('lng', locationData.longitude);
    }
    
    // Navigate to search results page
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container mx-auto px-4 text-center hero-content">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Find Cookie Spots Nearby</h1>
          <p className="text-xl mb-8 text-white">Discover the best cookies in your area</p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Featured Cookie Spots */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {userLocation ? `Top 5 Cookie Spots Near ${userLocation.city}` : 'Top 5 Cookie Spots Near Me'}
              {locationError && <span className="text-sm text-gray-500 ml-2">(Using default locations)</span>}
            </h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          <FilterButtons />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
              {Array.isArray(featuredSpots) && featuredSpots.map(spot => (
                <div key={spot.id || spot._id} className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CookieSpotCard spot={spot} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Cookie Types */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Popular Cookie Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Chocolate Chip', image: '/images/cookie-types/chocolate-chip.webp' },
              { name: 'Sugar Cookie', image: '/images/cookie-types/sugar-cookie.webp' },
              { name: 'Oatmeal Raisin', image: '/images/cookie-types/oatmeal-raisin.webp' },
              { name: 'Peanut Butter', image: '/images/cookie-types/peanut-butter.webp' },
              { name: 'Snickerdoodle', image: '/images/cookie-types/snickerdoodle.webp' },
              { name: 'Macaron', image: '/images/cookie-types/macaron.webp' }
            ].map((cookie, index) => (
              <Link 
                key={index} 
                to={`/search?type=${cookie.name}`}
                className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full">
                  <img 
                    src={cookie.image} 
                    alt={cookie.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium">{cookie.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* App Promotion */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Get the CookieSpots App</h2>
              <p className="text-lg mb-6">Find cookie spots on the go with our mobile app. Available for iOS and Android.</p>
              <div className="flex space-x-4">
                <a href="#" className="block">
                  <img src="/images/app-store-badge.svg" alt="Download on the App Store" className="h-12" />
                </a>
                <a href="#" className="block">
                  <img src="/images/google-play-badge.svg" alt="Get it on Google Play" className="h-12" />
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src="/images/app-mockup.png" alt="CookieSpots App" className="max-w-full rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Hungry? Let us feed you the latest</h2>
          <p className="text-gray-600 mb-6">Cookie exclusives: amazing stories, hot tips, and free stuff you don't want to miss!</p>
          <form className="max-w-md mx-auto">
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button 
                type="submit" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-md"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default HomePage
