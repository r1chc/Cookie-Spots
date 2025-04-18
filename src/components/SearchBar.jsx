import React, { useState, useEffect, useRef } from 'react'
import { loadGoogleMaps } from '../utils/googleMapsLoader'

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isApiLoaded, setIsApiLoaded] = useState(false)
  const [apiError, setApiError] = useState(null)
  const autocompleteService = useRef(null)
  const sessionToken = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)
  
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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])
  
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
  
  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    console.log("Selected suggestion:", suggestion)
    setSearchTerm(suggestion.description)
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
            
            if (onSearch) {
              const locationData = {
                name: place.name || suggestion.description,
                address: place.formatted_address,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng()
              }
              onSearch(suggestion.description, locationData)
            } else {
              // If no onSearch handler, redirect to search page with query params
              const params = new URLSearchParams()
              params.set('location', suggestion.description)
              
              if (place.geometry && place.geometry.location) {
                params.set('lat', place.geometry.location.lat())
                params.set('lng', place.geometry.location.lng())
              }
              
              window.location.href = `/search?${params.toString()}`
            }
          } else {
            // Only run this code when place details are NOT available
            console.log("Fallback to basic search - place details not available")
            if (onSearch) {
              onSearch(suggestion.description)
            } else {
              window.location.href = `/search?location=${encodeURIComponent(suggestion.description)}`
            }
          }
        })
        
        // Create a new session token for the next request
        sessionToken.current = new google.maps.places.AutocompleteSessionToken()
      } catch (error) {
        console.error("Error getting place details:", error)
        if (onSearch) {
          onSearch(suggestion.description)
        } else {
          window.location.href = `/search?location=${encodeURIComponent(suggestion.description)}`
        }
      }
    } else {
      // Fallback if API is not loaded
      console.log("Fallback to basic search - API not loaded")
      if (onSearch) {
        onSearch(suggestion.description)
      } else {
        window.location.href = `/search?location=${encodeURIComponent(suggestion.description)}`
      }
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted with:", searchTerm)
    
    if (onSearch) {
      onSearch(searchTerm)
    } else {
      window.location.href = `/search?location=${encodeURIComponent(searchTerm)}`
    }
    setShowSuggestions(false)
  }

  // Inline styles
  const searchContainerStyle = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative'
  }

  const inputStyle = {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    borderRadius: '9999px',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '1rem',
    color: '#1F2F16',
    backgroundColor: 'white'
  }

  const buttonStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    zIndex: 10
  }
  
  const suggestionsContainerStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    maxHeight: '300px',
    overflowY: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 50,
    border: '1px solid rgba(250, 121, 33, 0.3)'  // Light orange border
  }
  
  const suggestionItemStyle = {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    color: '#1F2F16'  // Orange color for suggestion text
  }

  return (
    <div style={searchContainerStyle} ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          style={inputStyle}
          placeholder="Search for city, region, or zipcode"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
        />
        <button 
          type="submit"
          style={buttonStyle}
          aria-label="Search location"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{color: '#92AFD7'}}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </form>
      
      {/* API error message */}
      {apiError && (
        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>
          {apiError} - Basic search still available
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={suggestionsContainerStyle}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              style={suggestionItemStyle}
              className="hover:bg-orange-50"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium">{suggestion.structured_formatting?.main_text || suggestion.description}</div>
              {suggestion.structured_formatting?.secondary_text && (
                <div className="text-sm" style={{color: '#1F2F16', opacity: 0.75}}>{suggestion.structured_formatting.secondary_text}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar