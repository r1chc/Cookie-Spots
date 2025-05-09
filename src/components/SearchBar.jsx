import React, { useState, useEffect, useRef } from 'react'
import { loadGoogleMaps } from '../utils/googleMapsLoader'
import { getCurrentLocation, reverseGeocode } from '../utils/geolocation'
import ReactDOM from 'react-dom'

const SearchBar = ({ onSearch, variant = 'rounded' }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isApiLoaded, setIsApiLoaded] = useState(false)
  const [apiError, setApiError] = useState(null)
  const autocompleteService = useRef(null)
  const sessionToken = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  
  // Update dropdown position whenever we show suggestions or on window scroll
  useEffect(() => {
    const updatePosition = () => {
      if (showSuggestions && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };
    
    // Update position initially and on scroll
    updatePosition();
    
    // Add scroll event listener to reposition the dropdown when scrolling
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSuggestions, suggestions]);
  
  // Create suggestions portal container
  useEffect(() => {
    let portalContainer = document.getElementById('suggestions-portal');
    
    // Create portal container if it doesn't exist
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = 'suggestions-portal';
      document.body.appendChild(portalContainer);
    }
    
    // Clean up when component unmounts
    return () => {
      // We don't remove the container since it might be used by other SearchBar instances
    };
  }, []);
  
  // Load Google Maps API using the shared loader
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
        // Get API key from environment variables
        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
        
        if (!apiKey) {
          console.error("No Google API key found in environment variables")
          setApiError("Missing API key")
          return
        }
        
        // Skip initialization if already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log("Google Maps API already loaded, skipping initialization")
          setIsApiLoaded(true)
          
          // Create session token and autocomplete service if not already created
          if (!autocompleteService.current) {
            sessionToken.current = new google.maps.places.AutocompleteSessionToken()
            autocompleteService.current = new google.maps.places.AutocompleteService()
            console.log("Autocomplete service initialized")
          }
          return
        }
        
        console.log("Initializing Google Maps loader...")
        
        // Use the shared loader instead of creating a new one
        await loadGoogleMaps()
        console.log("Google Maps API loaded successfully")
        
        // Create session token and autocomplete service
        sessionToken.current = new google.maps.places.AutocompleteSessionToken()
        autocompleteService.current = new google.maps.places.AutocompleteService()
        setIsApiLoaded(true)
        console.log("Autocomplete service initialized")
      } catch (error) {
        console.error("Error loading Google Maps API:", error)
        setApiError("Failed to load Google Maps API")
      }
    }
    
    loadGoogleMapsAPI()
  }, [])
  
  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      // If the click is on an element within the suggestions dropdown, do not hide it.
      // The suggestions dropdown is identified by the className 'suggestions-dropdown'.
      if (event.target.closest('.suggestions-dropdown')) {
        return;
      }

      // If the click is outside the main search bar wrapper (input area), then hide suggestions.
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    // Listen for mousedown events on the document to detect clicks outside.
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when the component unmounts or dependencies change.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]); // Dependency array includes wrapperRef to ensure the latest ref is used.
  
  // Handle input change and get place predictions
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length > 2) {
      if (isApiLoaded && autocompleteService.current) {
        console.log("Getting predictions for:", value)
        
        // Determine the type of search to perform based on input
        let requestTypes = []
        
        // Check if input looks like a zip code (5 digits)
        const isZipCode = /^\d{5}$/.test(value)
        
        if (isZipCode) {
          // For zip codes
          requestTypes = ['geocode']
        } else {
          // For cities, states, etc. - use 'geocode' which includes localities
          requestTypes = ['geocode']
          
          // Note: We're not using '(cities)' anymore as it can't be mixed
          // 'geocode' type includes locality, postal_code, country, etc.
        }
        
        const request = {
          input: value,
          types: requestTypes,
          componentRestrictions: { country: 'us' }
        }
        
        if (sessionToken.current) {
          request.sessionToken = sessionToken.current
        }
        
        try {
          autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
            console.log("Predictions status:", status)
            
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              console.log("Received predictions:", predictions)
              setSuggestions(predictions)
              setShowSuggestions(true)
            } else {
              console.log("No predictions found or error:", status)
              setSuggestions([])
              setShowSuggestions(false)
            }
          })
        } catch (error) {
          console.error("Error getting predictions:", error)
          setSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        console.log("API not loaded or autocomplete service not available")
        // If API isn't loaded, still allow manual search
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }
  
  // Handle input focus to show current location option
  const handleInputFocus = () => {
    // Show suggestions with Current Location as the first option
    setSuggestions([])
    setShowSuggestions(true)
  }
  
  // Handle using current location
  const handleCurrentLocationClick = async () => {
    try {
      setIsLoadingLocation(true)
      
      // Get user's current location
      const coords = await getCurrentLocation()
      
      // Reverse geocode to get city and state
      const locationData = await reverseGeocode(coords)
      
      // Prepare location data
      const currentLocationData = {
        name: locationData.formattedLocation,
        address: locationData.formattedLocation,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
      
      // Update search term with the formatted location
      setSearchTerm(locationData.formattedLocation)
      
      // Close suggestions
      setSuggestions([])
      setShowSuggestions(false)
      
      // Perform search with location data
      if (onSearch) {
        onSearch(locationData.formattedLocation, currentLocationData)
      } else {
        // If no onSearch handler, redirect to search page with query params
        const params = new URLSearchParams()
        params.set('location', locationData.formattedLocation)
        params.set('lat', coords.latitude)
        params.set('lng', coords.longitude)
        window.location.href = `/search?${params.toString()}`
      }
    } catch (error) {
      console.error("Error getting current location:", error)
      alert("Couldn't access your location. Please check your browser permissions and try again.")
    } finally {
      setIsLoadingLocation(false)
    }
  }
  
  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    console.log("Selected suggestion:", suggestion)
    setSearchTerm(suggestion.description || suggestion.formatted_address)
    setSuggestions([])
    setShowSuggestions(false)
    
    if (isApiLoaded && google && google.maps && google.maps.places) {
      try {
        const placesService = new google.maps.places.PlacesService(document.createElement('div'))
        
        placesService.getDetails({
          placeId: suggestion.place_id,
          fields: ['geometry', 'name', 'formatted_address'],
          sessionToken: sessionToken.current
        }, (place, status) => {
          console.log("Place details status:", status)
          
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            console.log("Place details:", place)
            
            const locationData = {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              name: place.name,
              address: place.formatted_address
            }
            
            // Call the onSearch callback with the suggestion and location data
            if (onSearch) {
              onSearch(suggestion.description || suggestion.formatted_address, locationData)
            }
          } else {
            // If we can't get details, just navigate with the suggestion text
            if (onSearch) {
              onSearch(suggestion.description || suggestion.formatted_address)
            }
          }
        })
      } catch (error) {
        console.error("Error getting place details:", error)
        
        // If something goes wrong, at least navigate with the suggestion text
        if (onSearch) {
          onSearch(suggestion.description || suggestion.formatted_address)
        }
      }
    } else {
      // If Places API isn't available, just navigate with the suggestion text
      if (onSearch) {
        onSearch(suggestion.description || suggestion.formatted_address)
      }
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm)
      } else {
        // If no onSearch handler, redirect to search page with query params
        window.location.href = `/search?location=${encodeURIComponent(searchTerm)}`;
      }
      setShowSuggestions(false);
    }
  }

  // Get the appropriate border radius based on variant
  const getBorderRadius = () => {
    switch (variant) {
      case 'square':
        return '0.5rem'; // More square but still has slightly rounded corners
      case 'rounded':
      default:
        return '9999px'; // Very rounded (pill shape)
    }
  }

  // Inline styles
  const searchContainerStyle = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 9999 // Very high z-index on the container
  }

  const inputStyle = {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    borderRadius: '2rem',
    backgroundColor: 'white',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '1rem',
    outline: 'none',
    color: '#1F2937' // Dark gray text for input
  }

  const searchIconStyle = {
    position: 'absolute',
    top: '50%',
    left: '1rem',
    transform: 'translateY(-50%)',
    color: '#4B5563'
  }

  const suggestionsContainerStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)', // Position 8px below the input field
    left: 0,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 100, // Still high but doesn't need to be as extreme
    overflow: 'hidden',
    maxHeight: '400px',
    overflowY: 'auto',
    color: '#1F2937', // Dark gray text for dropdown
    transform: 'translateZ(0)', // Force GPU acceleration and create stacking context
    willChange: 'transform', // Hint to browser for optimization
    isolation: 'isolate' // Creates a new stacking context
  }

  const suggestionItemStyle = {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    alignItems: 'center',
    color: '#1F2937' // Dark gray text for suggestion items
  }

  const highlightedStyle = {
    backgroundColor: '#F9FAFB'
  }

  // Check if we need to render the portal
  const createSuggestionsPortal = () => {
    if (!showSuggestions) return null;
    
    const suggestionsElement = document.getElementById('suggestions-portal');
    if (!suggestionsElement) return null;
    
    return ReactDOM.createPortal(
      <div 
        className="suggestions-dropdown border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          maxHeight: '400px',
          overflowY: 'auto',
          borderRadius: variant === 'square' ? '0.5rem' : '0.75rem'
        }}
      >
        {/* Current Location Option */}
        <div
          className="p-3 cursor-pointer hover:bg-gray-100 flex items-center"
          onClick={handleCurrentLocationClick}
        >
          <div className="mr-3 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            {isLoadingLocation ? 'Getting your location...' : 'Use current location'}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200"></div>
        
        {/* Suggestions */}
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.place_id || index}
            className="p-3 cursor-pointer hover:bg-gray-100 flex items-center"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="mr-3 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              {suggestion.description || suggestion.formatted_address || "Unknown location"}
            </div>
          </div>
        ))}
      </div>,
      suggestionsElement
    );
  }

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {variant === 'rounded' ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              style={inputStyle}
              placeholder="Search for cookie spots near you..."
              aria-label="Search for cookie spots"
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="w-full p-4 pl-12 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md bg-white text-gray-800"
              style={{ 
                borderRadius: '0.5rem', 
                transition: 'all 0.2s ease'
              }}
              placeholder="Search for cookie spots near you..."
              aria-label="Search for cookie spots"
            />
          )}
          {variant === 'rounded' ? (
            <span style={searchIconStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
          ) : (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          )}
        </div>
            
        {/* Mount dropdown to body but position relative to search bar */}
        {createSuggestionsPortal()}
      </form>
    </div>
  )
}

export default SearchBar