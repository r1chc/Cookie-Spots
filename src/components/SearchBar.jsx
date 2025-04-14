import React, { useState, useEffect, useRef } from 'react'

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isApiLoaded, setIsApiLoaded] = useState(false)
  const autocompleteService = useRef(null)
  const sessionToken = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)
  
  // Load Google Maps API
  useEffect(() => {
    // Create a script element
    const googleScript = document.createElement('script')
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCKTkJh3mkYxHKtQCFKZraMv3NOPprxVsA&libraries=places&callback=initPlacesAPI`
    googleScript.async = true
    googleScript.defer = true
    
    // Define the callback function
    window.initPlacesAPI = () => {
      setIsApiLoaded(true)
      // Create a new session token
      if (window.google && window.google.maps && window.google.maps.places) {
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken()
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
      }
    }
    
    document.head.appendChild(googleScript)
    
    return () => {
      if (document.head.contains(googleScript)) {
        document.head.removeChild(googleScript)
      }
      delete window.initPlacesAPI
    }
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
    
    if (value.length > 2 && isApiLoaded && autocompleteService.current) {
      const request = {
        input: value,
        types: ['(cities)'],
        sessionToken: sessionToken.current,
      }
      
      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      })
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }
  
  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
    
    // If you need more details about the place, you can use the Place Details API
    if (isApiLoaded && window.google && window.google.maps && window.google.maps.places) {
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
      
      placesService.getDetails({
        placeId: suggestion.place_id,
        fields: ['geometry', 'name', 'formatted_address'],
        sessionToken: sessionToken.current
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          if (onSearch) {
            const locationData = {
              name: place.name,
              address: place.formatted_address,
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            }
            onSearch(place.name, locationData)
          }
        }
      })
      
      // Create a new session token for the next request
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken()
    } else {
      // Fallback if API is not loaded
      if (onSearch) {
        onSearch(suggestion.description)
      }
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 50
  }
  
  const suggestionItemStyle = {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0'
  }
  
  const suggestionHoverStyle = {
    backgroundColor: '#f9fafb'
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
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={suggestionsContainerStyle}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              style={suggestionItemStyle}
              className="hover:bg-gray-50"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium">{suggestion.structured_formatting?.main_text || suggestion.description}</div>
              {suggestion.structured_formatting?.secondary_text && (
                <div className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar