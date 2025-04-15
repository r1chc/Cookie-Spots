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
  const reviewCount = data?.review_count || data?.reviewCount || 0;
  
  // Handle different location formats
  let locationText = '';
  if (typeof data.address === 'string') {
    locationText = data.address;
  } else if (typeof data.location === 'string') {
    locationText = data.location;
  } else if (data.address && data.city) {
    // Format: "address, city, state"
    locationText = `${data.address}, ${data.city}${data.state_province ? `, ${data.state_province}` : ''}`;
  } else if (data.location && typeof data.location === 'object' && data.location.type === 'Point') {
    // It's a GeoJSON Point - don't render it directly, use other address parts
    locationText = [data.address, data.city, data.state_province].filter(Boolean).join(', ');
  } else {
    locationText = 'Location not available';
  }
  
  const description = data?.description || '';
  const cookieTypes = Array.isArray(data?.cookie_types) 
    ? data.cookie_types.map(type => typeof type === 'object' ? type.name : type)
    : data?.cookieTypes || [];

  return (
    <div className="cookie-spot-card bg-white rounded-lg shadow-md overflow-hidden">
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
    </div>
  );
};

export default CookieSpotCard;