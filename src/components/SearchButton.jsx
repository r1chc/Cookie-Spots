import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchClick = (e) => {
    e.preventDefault();
    setIsSearchOpen(prev => !prev);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogsearch?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={`fixed bottom-4 right-16 sm:right-[4.5rem] md:right-[5rem] lg:right-[5rem] z-[9999] ${
      isVisible || isSearchOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`flex items-center transition-all duration-500 ease-in-out ${
          isSearchOpen ? 'w-[15rem]' : 'w-0'
        } overflow-hidden`}>
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <div className="flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="p-2 rounded-l-full border border-white bg-white/90 text-gray-800 focus:outline-none focus:ring-0 w-full"
              />
            </div>
            <button
              type="submit"
              className="p-2 rounded-r-full bg-primary-600 text-white border border-white hover:bg-primary-700 transition-colors duration-200"
            >
              Search
            </button>
          </form>
        </div>
        <button
          onClick={handleSearchClick}
          className="p-2 sm:p-3 rounded-full bg-primary-600 text-white shadow-lg border-2 border-white hover:bg-primary-700 hover:scale-110 focus:outline-none"
          aria-label={isSearchOpen ? "Close search" : "Search articles"}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isSearchOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchButton; 