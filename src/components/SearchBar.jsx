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

  return (
    <div className="w-full max-w-2xl mx-auto search-container">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          className="search-bar w-full pl-12 pr-4 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Search for city, region, or zipcode"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute left-0 top-0 h-full px-4 flex items-center text-gray-500 search-button"
          aria-label="Search location"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default SearchBar
