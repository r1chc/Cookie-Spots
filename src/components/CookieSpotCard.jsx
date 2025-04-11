import React from 'react'
import { Link } from 'react-router-dom'

const CookieSpotCard = ({ spot }) => {
  return (
    <div className="cookie-spot-card bg-white overflow-hidden">
      <Link to={`/cookie-spot/${spot.id}`}>
        <div className="relative">
          <img 
            src={spot.image} 
            alt={spot.name} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <button className="bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/cookie-spot/${spot.id}`}>
          <h3 className="font-bold text-lg mb-1">{spot.name}</h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="rating flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`star w-4 h-4 ${i < Math.floor(spot.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-600">{spot.rating}</span>
            <span className="ml-1 text-sm text-gray-500">({spot.reviewCount})</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">{spot.location}</p>
        <p className="text-gray-800 mb-3">{spot.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {spot.cookieTypes.map((type, index) => (
            <span 
              key={index} 
              className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CookieSpotCard
