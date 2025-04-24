// src/components/CookieSpotCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CookieSpotCard = ({ cookieSpot, spot }) => {
  // Handle both data formats - either cookieSpot (from API) or spot (from static data)
  const data = cookieSpot || spot;
  
  // Guard against undefined data
  if (!data) {
    return <div className="p-4 bg-white rounded-lg shadow-md">Loading spot data...</div>;
  }
  
  // Use optional chaining to safely access properties
  const id = data?._id || data?.id || 'unknown';
  const name = data?.name || 'Unknown Spot';
  const image = data?.image || '/images/cookie-spot-placeholder.jpg';
  const rating = data?.average_rating || data?.rating || 0;
  const reviewCount = data?.review_count || data?.user_ratings_total || 0;
  
  // For Google Places API results, prioritize using the description field for location
  let locationText = '';
  
  // First check if it's a Google Places result with a description
  if (data.source === 'google' && data.description && typeof data.description === 'string') {
    locationText = data.description;
  } 
  // Otherwise fallback to our manual location text construction
  else if (typeof data.address === 'string' && data.address) {
    // If we have city and state, add them
    if (data.city && data.state_province) {
      locationText = `${data.address}, ${data.city}, ${data.state_province}`;
    } else if (data.city) {
      locationText = `${data.address}, ${data.city}`;
    } else {
      locationText = data.address;
    }
  } else if (typeof data.location === 'string') {
    locationText = data.location;
  } else if (data.description && typeof data.description === 'string') {
    // Use the description as fallback for any source
    locationText = data.description;
  } else if (data.location && typeof data.location === 'object' && data.location.type === 'Point') {
    // It's a GeoJSON Point - build location from other address parts if available
    const addressParts = [data.address, data.city, data.state_province].filter(Boolean);
    locationText = addressParts.length > 0 ? addressParts.join(', ') : 'Location not available';
  } else {
    locationText = 'Location not available';
  }
  
  // We'll only use description for non-location information now
  const description = '';

  // Handle different formats of cookie types
  let cookieTypes = [];
  if (Array.isArray(data?.cookie_types)) {
    cookieTypes = data.cookie_types.map(type => {
      if (typeof type === 'string') return type;
      return type?.name || 'Cookies';
    }).filter(Boolean);
  } else if (Array.isArray(data?.cookieTypes)) {
    cookieTypes = data.cookieTypes;
  } else {
    cookieTypes = ['Cookies']; // Default
  }

  // Get today's day of the week to show today's hours
  const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = weekday[new Date().getDay()];
  const todayHours = data?.hours_of_operation && data.hours_of_operation[today] 
    ? data.hours_of_operation[today] 
    : null;

  // Check if this is an external API result 
  const isExternalSpot = 
    data.source === 'google' || 
    data.source_id || 
    data.place_id ||
    (data._id && typeof data._id === 'string' && 
      (!data._id.match(/^[0-9a-f]{24}$/i) || data._id.includes('-')));

  return (
    <div className="cookie-spot-card bg-white rounded-lg shadow-md overflow-hidden">
      {isExternalSpot ? (
        <div>
          <div className="relative h-48">
            <img src={image} alt={name} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-1">{name}</h3>
            <p className="text-gray-600 text-sm mb-2">{locationText}</p>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="rating mr-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                ))}
              </span>
              <span>{reviewCount} reviews</span>
            </div>
            
            {todayHours && (
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Today: {todayHours}</span>
              </div>
            )}
            
            {data.phone && (
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${data.phone.replace(/\D/g, '')}`} className="text-primary-600 hover:text-primary-800">
                  {data.phone}
                </a>
              </div>
            )}
            
            {description && <p className="text-gray-700 text-sm mb-3">{description}</p>}
            
            <div className="flex flex-wrap gap-1">
              {cookieTypes.slice(0, 3).map((type, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {type}
                </span>
              ))}
              {cookieTypes.length > 3 && (
                <span className="text-gray-500 text-xs px-2 py-1">
                  +{cookieTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Link to={`/cookie-spot/${id}`}>
          <div className="relative h-48">
            <img src={image} alt={name} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-1">{name}</h3>
            <p className="text-gray-600 text-sm mb-2">{locationText}</p>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="rating mr-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                ))}
              </span>
              <span>{reviewCount} reviews</span>
            </div>
            
            {todayHours && (
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Today: {todayHours}</span>
              </div>
            )}
            
            {data.phone && (
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${data.phone.replace(/\D/g, '')}`} className="text-primary-600 hover:text-primary-800">
                  {data.phone}
                </a>
              </div>
            )}
            
            {description && <p className="text-gray-700 text-sm mb-3">{description}</p>}
            
            <div className="flex flex-wrap gap-1">
              {cookieTypes.slice(0, 3).map((type, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {type}
                </span>
              ))}
              {cookieTypes.length > 3 && (
                <span className="text-gray-500 text-xs px-2 py-1">
                  +{cookieTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default CookieSpotCard;