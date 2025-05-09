// src/components/CookieSpotCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Modified to accept showGoogleMapsLink prop to indicate we're on the home page
const CookieSpotCard = ({ cookieSpot, spot, showGoogleMapsLink }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Handle both data formats - either cookieSpot (from API) or spot (from static data)
  const data = cookieSpot || spot;
  
  // Guard against undefined data
  if (!data) {
    return <div className="p-4 bg-white rounded-lg shadow-md">Loading spot data...</div>;
  }
  
  // Use optional chaining to safely access properties
  const id = data?._id || data?.id || 'unknown';
  const name = data?.name || 'Unknown Spot';
  const rating = data?.average_rating || data?.rating || 0;
  const reviewCount = data?.review_count || data?.user_ratings_total || 0;
  
  // Debug: Log data to see what we're receiving
  useEffect(() => {
    console.log(`CookieSpotCard for ${name}:`, {
      hasPhotosField: !!data.photos,
      photoCount: data.photos ? data.photos.length : 0,
      hasImageField: !!data.image,
      imageURL: data.image,
      guaranteedImageUrl: data.guaranteedImageUrl,
      photos: data.photos,
      rawData: data,
      firstPhoto: data.photos?.[0],
      image_url: data.image_url,
      source: data.source,
      place_id: data.place_id
    });
  }, [data, name]);
  
  // Use a more reliable placeholder
  const placeholderImage = data.guaranteedImageUrl || 
                         'https://placehold.co/400x300/e2e8f0/1e40af?text=' + encodeURIComponent(name || 'Cookie+Spot');
  
  // Get the main photo with fallback
  const mainPhoto = React.useMemo(() => {
    // First try to get the first photo from the API photos array
    if (data.photos && data.photos.length > 0) {
      console.log('Using first photo from photos array:', data.photos[0]);
      return data.photos[0];
    }
    
    // Then try static photos
    if (data.photo_urls && data.photo_urls.length > 0) {
      console.log('Using first photo from photo_urls:', data.photo_urls[0]);
      return data.photo_urls[0];
    }
    
    // Then try image property
    if (data.image) {
      console.log('Using image property:', data.image);
      return data.image;
    }
    
    // Then try image_url property
    if (data.image_url) {
      console.log('Using image_url property:', data.image_url);
      return data.image_url;
    }
    
    // Finally fallback to guaranteed image
    console.log('Using guaranteed image URL:', data.guaranteedImageUrl);
    return data.guaranteedImageUrl || placeholderImage;
  }, [data, placeholderImage]);
  
  // Use image property as primary source, fallback to main photo, then placeholder
  const [imgSrc, setImgSrc] = useState(mainPhoto);
  const [imageError, setImageError] = useState(false);
  
  // Update image source when data changes
  useEffect(() => {
    console.log('Setting new image source:', mainPhoto);
    setImgSrc(mainPhoto);
    setImageError(false);
  }, [data, mainPhoto]);
  
  // Handle image loading error
  const handleImageError = () => {
    console.log(`Image failed to load for ${name}:`, imgSrc);
    
    // Try the guaranteed image if available
    if (data.guaranteedImageUrl && imgSrc !== data.guaranteedImageUrl) {
      console.log(`Trying guaranteed image for ${name}:`, data.guaranteedImageUrl);
      setImgSrc(data.guaranteedImageUrl);
      return;
    }
    
    // Try image_url if available
    if (data.image_url && imgSrc !== data.image_url) {
      console.log(`Trying image_url for ${name}:`, data.image_url);
      setImgSrc(data.image_url);
      return;
    }
    
    // Fallback to placeholder
    if (imgSrc !== placeholderImage) {
      console.log(`Falling back to placeholder for ${name}:`, placeholderImage);
      setImgSrc(placeholderImage);
    } else {
      setImageError(true);
      console.log(`All images failed for ${name}, using CSS background`);
    }
  };
  
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

  // Function to render the image
  const renderImage = () => (
    <div className="relative h-48 bg-blue-100 flex items-center justify-center">
      {!imageError && (
        <img 
          src={imgSrc} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={handleImageError}
        />
      )}
      
      {imageError && (
        <div className="text-center p-4">
          <div className="text-blue-800 font-bold">{name}</div>
          <div className="mt-2 text-sm">Cookie Spot</div>
        </div>
      )}
      
      {/* Rating badge */}
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
        <span className="text-yellow-500 mr-1">★</span>
        <span>{rating.toFixed(1)}</span>
      </div>
    </div>
  );

  return (
    <div className="cookie-spot-card bg-white rounded-lg shadow-md overflow-hidden">
      {isExternalSpot ? (
        <div>
          {renderImage()}
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
            
            {/* Display keyword matches if available */}
            {data.keyword_match && (
              <div className="mt-2 mb-3">
                {data.keyword_match.in_reviews && data.keyword_match.matching_reviews && data.keyword_match.matching_reviews.length > 0 && (
                  <div className="border-l-2 border-amber-400 pl-2 mb-2">
                    <h4 className="text-xs font-semibold text-amber-800 mb-1">Found in reviews:</h4>
                    {data.keyword_match.matching_reviews.slice(0, 2).map((review, idx) => (
                      <p key={idx} className="text-xs text-gray-600 italic mb-1">
                        "{review.highlight}"
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Google Maps Link */}
            {showGoogleMapsLink && (
              <div className="mt-2">
                <a 
                  href={
                    data.place_id
                      ? `https://www.google.com/maps/place/?q=place_id:${data.place_id}`
                      : data.location && data.location.coordinates
                      ? `https://www.google.com/maps/search/?api=1&query=${data.location.coordinates[1]},${data.location.coordinates[0]}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + locationText)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        // For internal DB results
        <div>
          {/* Use Link for internal results */}
          <Link to={`/cookie-spot/${id}`}>
            {renderImage()}
          </Link>
          
          <div className="p-4">
            <Link to={`/cookie-spot/${id}`} className="text-gray-900 hover:text-primary-600">
              <h3 className="text-lg font-bold mb-1">{name}</h3>
            </Link>
            
            <p className="text-gray-600 text-sm mb-2">{locationText}</p>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="rating mr-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                ))}
              </span>
              <span>{reviewCount} reviews</span>
            </div>
            
            {data.price_level && (
              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Price: </span>
                <span>{'$'.repeat(data.price_level)}</span>
              </div>
            )}
            
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
            
            {/* Google Maps Link */}
            {showGoogleMapsLink && (
              <div className="mt-2 mb-3">
                <a 
                  href={
                    data.place_id
                      ? `https://www.google.com/maps/place/?q=place_id:${data.place_id}`
                      : data.location && data.location.coordinates
                      ? `https://www.google.com/maps/search/?api=1&query=${data.location.coordinates[1]},${data.location.coordinates[0]}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + locationText)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {cookieTypes.slice(0, 3).map((type, idx) => (
                <span 
                  key={idx} 
                  className="inline-block bg-blue-100 rounded-full px-2 py-1 text-xs font-medium text-blue-800"
                >
                  {type}
                </span>
              ))}
              {cookieTypes.length > 3 && (
                <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-800">
                  +{cookieTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieSpotCard;