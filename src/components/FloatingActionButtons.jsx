import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ArticlePage.css';

const FloatingActionButtons = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef(null);
  const searchButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Effect for showing/hiding floating action buttons on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) { // Show after scrolling 200px
        setShowButtons(true);
      } else {
        setShowButtons(false);
        setIsSearchOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Focus search input when opened
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    setIsSearchOpen(prev => !prev);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogsearch?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSearchInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
  };

  return (
    <>
      {showButtons && (
        <>
          {/* Search input container - completely separate from buttons */}
          <div className={`search-input-container ${isSearchOpen ? 'open' : ''}`}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Recipes & Blog..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
            />
          </div>

          {/* Floating action buttons container */}
          <div className="floating-action-buttons">
            <button
              ref={searchButtonRef}
              className="floating-button search-button"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
            <button
              className="floating-button scroll-to-top"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingActionButtons; 