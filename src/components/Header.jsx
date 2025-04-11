import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/cookie-spots-logo.svg" alt="Cookie Spots Logo" className="h-10 w-10 mr-2" />
            <span className="cookie-spots-logo">CookieSpots</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/explore" className="text-gray-700 hover:text-primary-600">Explore</Link>
            <Link to="/map" className="text-gray-700 hover:text-primary-600">Map</Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary-600">Blog</Link>
            <Link to="/app" className="text-gray-700 hover:text-primary-600">The App</Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary-600">Shop</Link>
            
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                More
                <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">About Us</Link>
                  <Link to="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Contact</Link>
                  <Link to="/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</Link>
                </div>
              )}
            </div>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <Link to="/add-cookie-spot" className="hidden md:block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Add Listing
            </Link>
            
            <Link to="/login" className="hidden md:block bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
              Login / Join
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <Link to="/explore" className="block py-2 text-gray-700">Explore</Link>
            <Link to="/map" className="block py-2 text-gray-700">Map</Link>
            <Link to="/blog" className="block py-2 text-gray-700">Blog</Link>
            <Link to="/app" className="block py-2 text-gray-700">The App</Link>
            <Link to="/shop" className="block py-2 text-gray-700">Shop</Link>
            <Link to="/about" className="block py-2 text-gray-700">About Us</Link>
            <Link to="/contact" className="block py-2 text-gray-700">Contact</Link>
            <Link to="/faq" className="block py-2 text-gray-700">FAQ</Link>
            <Link to="/add-cookie-spot" className="block py-2 text-gray-700">Add Listing</Link>
            <Link to="/login" className="block py-2 text-gray-700">Login / Join</Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
