import React, { useState } from 'react'

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Fallback if onSearch prop is not provided
      window.location.href = `/search?location=${encodeURIComponent(searchTerm)}`
    }
  }

  // Inline styles to override any conflicting CSS
  const searchContainerStyle = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem', // Increased left padding to make space for icon
    borderRadius: '9999px',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '1rem',
    color: '#1F2F16', // Set text color to your text-color variable
    backgroundColor: 'white' // Ensure background is white
  };

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
  };

  return (
    <div style={searchContainerStyle}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          style={inputStyle}
          placeholder="Search for city, region, or zipcode"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
    </div>
  )
}

export default SearchBar