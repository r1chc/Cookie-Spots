import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCurrentLocation, reverseGeocode } from '../utils/geolocation'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const handleScroll = useCallback(
    debounce(() => {
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }, 10),
    []
  )

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleLogoClick = (e) => {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/') {
      e.preventDefault(); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setIsMenuOpen(false);
  }

  const handleNavClick = (e) => {
    const targetPath = e.currentTarget.getAttribute('href');
    const currentPath = window.location.pathname;
    
    if (targetPath === currentPath) {
      e.preventDefault(); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
    
    setIsMenuOpen(false);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    window.dispatchEvent(new CustomEvent('navigationStateChange', {
      detail: { isOpen: !isMenuOpen }
    }));
  }

  const handleCookiesNearYouClick = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentLocation();
      const locationData = await reverseGeocode(coords);
      
      const searchUrl = `/search?location=${encodeURIComponent(locationData.formattedLocation)}&lat=${coords.latitude}&lng=${coords.longitude}`;
      
      if (location.pathname === '/search') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(searchUrl, { replace: true });
      } else {
        navigate(searchUrl);
      }
      
    } catch (error) {
      console.error("Error getting location for 'Cookies Near You':", error);
      alert("Could not get your location. Please ensure location services are enabled in your browser and try again.");
    } finally {
      setIsLocating(false);
      setIsMenuOpen(false);
    }
  };

  const handleSubscribeClick = (e) => {
    e.preventDefault();
    
    // Navigate to home page if not already there
    if (location.pathname !== '/') {
      // Use navigate with a callback to scroll after navigation completes
      navigate('/', { state: { scrollToNewsletter: true } });
    } else {
      // Already on home page, just scroll to the newsletter section
      const newsletterSection = document.getElementById('newsletter');
      if (newsletterSection) {
        newsletterSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-[9999]">
      <header 
        className={`bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
          isSticky ? 'shadow-lg' : 'shadow-none'
        }`}
      >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
            <Link to="/" className="flex items-center" onClick={handleLogoClick}>
            <img 
              src="/images/Cookie_Spots_Logo.png" 
              alt="Cookie Spots Logo" 
              className="h-8 w-auto mr-2"
              style={{ outline: 'none', border: 'none' }}
            />
            <img 
              src="/images/Cookie_Spots_Logo_Words.png" 
              alt="Cookie Spots" 
              className="h-8 w-auto"
              style={{ outline: 'none', border: 'none' }}
            />
          </Link>

          {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-primary text-base" onClick={handleNavClick}>Explore</Link>
              <Link to="/blog" className="text-gray-700 hover:text-primary text-base" onClick={handleNavClick}>Recipes & Blog</Link>
              <Link to="/about" className="text-gray-700 hover:text-primary text-base" onClick={handleNavClick}>About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary text-base" onClick={handleNavClick}>Contact Us</Link>
            </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
              <button className="lg:hidden text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200" onClick={toggleMenu}>
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                )}
              </button>
            
              <button 
                onClick={handleCookiesNearYouClick}
                disabled={isLocating}
                className="hidden lg:block bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: 'var(--color-primary, #3b82f6) !important', color: 'white !important' }}
              >
                {isLocating ? 'Locating...' : 'Cookies Near You'}
              </button>
            
              <Link to="/#newsletter" className="hidden lg:block bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium" onClick={handleSubscribeClick}>
                Subscribe
              </Link>
          </div>
        </div>

        {/* Mobile Menu */}
          <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-md z-10 overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isMenuOpen ? 'max-h-[500px]' : 'max-h-0'
          }`}>
            <nav className={`py-4 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isMenuOpen ? 'translate-y-0' : 'translate-y-[-100%]'
            }`}>
              <div className="flex flex-col items-center">
                <Link to="/" className="block py-2 text-gray-700 text-base text-center hover:text-primary w-full max-w-[200px]" onClick={handleNavClick}>Explore</Link>
                <div className="w-full max-w-[300px] border-b border-gray-200"></div>
                <Link to="/blog" className="block py-2 text-gray-700 text-base text-center hover:text-primary w-full max-w-[200px]" onClick={handleNavClick}>Recipes & Blog</Link>
                <div className="w-full max-w-[300px] border-b border-gray-200"></div>
                <Link to="/about" className="block py-2 text-gray-700 text-base text-center hover:text-primary w-full max-w-[200px]" onClick={handleNavClick}>About</Link>
                <div className="w-full max-w-[300px] border-b border-gray-200"></div>
                <Link to="/contact" className="block py-2 text-gray-700 text-base text-center hover:text-primary w-full max-w-[200px]" onClick={handleNavClick}>Contact Us</Link>
                <div className="mt-3"></div>
                <button 
                  onClick={handleCookiesNearYouClick}
                  disabled={isLocating}
                  className="block py-2 text-white bg-primary rounded-md text-center my-2 hover:opacity-90 disabled:opacity-70 w-full max-w-[200px]"
                  style={{ backgroundColor: 'var(--color-primary, #3b82f6) !important', color: 'white !important' }}
                >
                  {isLocating ? 'Locating...' : 'Cookies Near You'}
                </button>
                <Link to="/#newsletter" className="block py-2 text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md text-center my-2 w-full max-w-[200px]" onClick={handleSubscribeClick}>Subscribe</Link>
              </div>
          </nav>
          </div>
      </div>
    </header>
    </div>
  )
}

export default Header