import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import CookieSpotCard from '../components/CookieSpotCard'
import FilterButtons from '../components/FilterButtons'

const HomePage = ({ onSearch }) => {
  const [featuredSpots, setFeaturedSpots] = useState([
    {
      id: 1,
      name: "Crumbl Cookie",
      image: "/images/cookie-spot-1.jpg",
      rating: 4.8,
      reviewCount: 324,
      location: "New York, NY",
      description: "Specialty cookies with rotating weekly flavors",
      cookieTypes: ["Chocolate Chip", "Sugar Cookie", "Specialty"]
    },
    {
      id: 2,
      name: "Levain Bakery",
      image: "/images/cookie-spot-2.jpg",
      rating: 4.9,
      reviewCount: 512,
      location: "New York, NY",
      description: "Famous for giant gooey cookies with crisp edges",
      cookieTypes: ["Chocolate Chip", "Double Chocolate", "Oatmeal Raisin"]
    },
    {
      id: 3,
      name: "Insomnia Cookies",
      image: "/images/cookie-spot-3.jpg",
      rating: 4.6,
      reviewCount: 287,
      location: "Boston, MA",
      description: "Late-night cookie delivery service",
      cookieTypes: ["Chocolate Chip", "Snickerdoodle", "White Chocolate Macadamia"]
    },
    {
      id: 4,
      name: "Cookie Dough & Co",
      image: "/images/cookie-spot-4.jpg",
      rating: 4.7,
      reviewCount: 198,
      location: "Chicago, IL",
      description: "Edible cookie dough and freshly baked cookies",
      cookieTypes: ["Cookie Dough", "Chocolate Chip", "Peanut Butter"]
    }
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Cookie Spots Nearby</h1>
          <p className="text-xl mb-8">Discover the best cookies in your area</p>
          <SearchBar onSearch={onSearch} />
        </div>
      </section>

      {/* Featured Cookie Spots */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Cookie Spots Near Me</h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          <FilterButtons />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {featuredSpots.map(spot => (
              <CookieSpotCard key={spot.id} spot={spot} />
            ))}
          </div>
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