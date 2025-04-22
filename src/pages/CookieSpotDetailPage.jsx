import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCookieSpots } from '../utils/CookieSpotContext';
import { useAuth } from '../utils/AuthContext';
import { reviewApi, photoApi, favoriteApi } from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CookieSpotDetailPage = () => {
  const { id } = useParams();
  const { getCookieSpotById, getNearbyCookieSpots, loading, error } = useCookieSpots();
  const { isAuthenticated, user } = useAuth();
  
  const [cookieSpot, setCookieSpot] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [nearbyCookieSpots, setNearbyCookieSpots] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Load cookie spot data
  useEffect(() => {
    const loadCookieSpotData = async () => {
      setLoadingData(true);
      try {
        const data = await getCookieSpotById(id);
        if (data) {
          setCookieSpot(data.cookieSpot);
          setPhotos(data.photos);
          setReviews(data.reviews);
          
          // Load nearby cookie spots
          if (data.cookieSpot.location && data.cookieSpot.location.coordinates) {
            const [lng, lat] = data.cookieSpot.location.coordinates;
            const nearby = await getNearbyCookieSpots(lat, lng, 5000, 5);
            // Filter out the current cookie spot
            setNearbyCookieSpots(nearby.filter(spot => spot._id !== id));
          }
          
          // Check if user has favorited this cookie spot
          if (isAuthenticated) {
            try {
              const favoriteRes = await favoriteApi.checkFavorite(id);
              setIsFavorite(favoriteRes.data.isFavorite);
            } catch (err) {
              console.error('Error checking favorite status:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error loading cookie spot data:', err);
      }
      setLoadingData(false);
    };

    loadCookieSpotData();
  }, [id, isAuthenticated]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      return;
    }

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(id);
      } else {
        await favoriteApi.addFavorite(id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Handle review form change
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value
    });
  };

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setReviewError('Please log in to submit a review');
      return;
    }
    
    if (!reviewForm.content.trim()) {
      setReviewError('Review content is required');
      return;
    }
    
    try {
      await reviewApi.createReview({
        cookie_spot_id: id,
        rating: parseInt(reviewForm.rating),
        title: reviewForm.title,
        content: reviewForm.content
      });
      
      // Reset form
      setReviewForm({
        rating: 5,
        title: '',
        content: ''
      });
      
      // Show success message
      setReviewSuccess('Review submitted successfully!');
      setReviewError('');
      
      // Reload reviews
      const data = await getCookieSpotById(id);
      if (data) {
        setReviews(data.reviews);
        setCookieSpot(data.cookieSpot); // Update rating
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setReviewSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(err.response?.data?.msg || 'Error submitting review. Please try again.');
    }
  };

  if (loadingData || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !cookieSpot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Cookie spot not found. It may have been removed or is no longer available.'}
              </p>
            </div>
          </div>
        </div>
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/search" className="hover:text-primary-600">Search</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{cookieSpot.name}</span>
      </div>

      {/* Cookie Spot Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{cookieSpot.name}</h1>
          <div className="flex items-center mb-2">
            <div className="rating flex items-center">
              <span className="text-yellow-400">{'★'.repeat(Math.floor(cookieSpot.average_rating))}</span>
              <span className="text-gray-300">{'★'.repeat(5 - Math.floor(cookieSpot.average_rating))}</span>
              <span className="ml-1 text-sm text-gray-600">{cookieSpot.average_rating.toFixed(1)}</span>
              <span className="ml-1 text-sm text-gray-500">({cookieSpot.review_count} reviews)</span>
            </div>
          </div>
          <p className="text-gray-600">{cookieSpot.address}, {cookieSpot.city}, {cookieSpot.state_province}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            onClick={toggleFavorite}
            className={`flex items-center px-4 py-2 rounded-md ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-800'}`}
          >
            <svg className="w-5 h-5 mr-1" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${cookieSpot.address}, ${cookieSpot.city}, ${cookieSpot.state_province}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Directions
          </a>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-80 bg-gray-200 rounded-lg overflow-hidden">
            {photos.length > 0 ? (
              <img 
                src={photos[0].file_path} 
                alt={cookieSpot.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span>No photos available</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {photos.slice(1, 5).map((photo, index) => (
              <div key={photo._id} className="h-[150px] bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={photo.file_path} 
                  alt={`${cookieSpot.name} ${index + 2}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {photos.length <= 1 && (
              <>
                <div className="h-[150px] bg-gray-200 rounded-lg"></div>
                <div className="h-[150px] bg-gray-200 rounded-lg"></div>
                <div className="h-[150px] bg-gray-200 rounded-lg"></div>
                <div className="h-[150px] bg-gray-200 rounded-lg"></div>
              </>
            )}
            {photos.length > 1 && photos.length < 5 && (
              Array(5 - photos.length).fill().map((_, index) => (
                <div key={`empty-${index}`} className="h-[150px] bg-gray-200 rounded-lg"></div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'info' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('info')}
            >
              Info
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'reviews' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'photos' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('photos')}
            >
              Photos ({photos.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'map' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('map')}
            >
              Map
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 mb-6">{cookieSpot.description}</p>
              
              <h2 className="text-xl font-semibold mb-4">Cookie Types</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {cookieSpot.cookie_types.map(type => (
                  <span key={type._id} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {type.name}
                  </span>
                ))}
              </div>
              
              {cookieSpot.dietary_options && cookieSpot.dietary_options.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Dietary Options</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cookieSpot.dietary_options.map(option => (
                      <span key={option._id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {option.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
              
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-6">
                {cookieSpot.has_dine_in && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Dine-in</span>
                  </div>
                )}
                {cookieSpot.has_takeout && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Takeout</span>
                  </div>
                )}
                {cookieSpot.has_delivery && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Delivery</span>
                  </div>
                )}
                {cookieSpot.is_wheelchair_accessible && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Wheelchair Accessible</span>
                  </div>
                )}
                {cookieSpot.accepts_credit_cards && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Accepts Credit Cards</span>
                  </div>
                )}
                {cookieSpot.features && cookieSpot.features.map(feature => (
                  <div key={feature} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact & Hours</h2>
              
              {cookieSpot.phone && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-1">Phone</h3>
                  <p className="text-gray-600">{cookieSpot.phone}</p>
                </div>
              )}
              
              {cookieSpot.website && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-1">Website</h3>
                  <a 
                    href={cookieSpot.website.startsWith('http') ? cookieSpot.website : `https://${cookieSpot.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {cookieSpot.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {cookieSpot.email && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-1">Email</h3>
                  <a 
                    href={`mailto:${cookieSpot.email}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {cookieSpot.email}
                  </a>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Address</h3>
                <p className="text-gray-600">
                  {cookieSpot.address}<br />
                  {cookieSpot.city}, {cookieSpot.state_province} {cookieSpot.postal_code}<br />
                  {cookieSpot.country}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Hours</h3>
                <div className="space-y-1">
                  {cookieSpot.hours_of_operation && Object.entries(cookieSpot.hours_of_operation).map(([day, hours]) => (
                    hours && (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-700 capitalize">{day}</span>
                        <span className="text-gray-600">{hours}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Price Range</h3>
                <p className="text-gray-600">{cookieSpot.price_range}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {/* Write a Review */}
            {isAuthenticated ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
                
                {reviewSuccess && (
                  <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{reviewSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {reviewError && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{reviewError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={submitReview}>
                  <div className="mb-4">
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="text-2xl focus:outline-none"
                        >
                          <span className={star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={reviewForm.title}
                      onChange={handleReviewChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Review
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={4}
                      value={reviewForm.content}
                      onChange={handleReviewChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <p className="text-gray-700 mb-4">Please <Link to="/login" className="text-primary-600 hover:text-primary-700">log in</Link> to write a review.</p>
              </div>
            )}
            
            {/* Reviews List */}
            <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
            
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to review this cookie spot!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-4">
                          {review.user_id.profile_image ? (
                            <img 
                              src={review.user_id.profile_image} 
                              alt={review.user_id.username} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                              {review.user_id.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{review.user_id.username}</p>
                          <p className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                        <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h3 className="font-semibold mb-2">{review.title}</h3>
                    )}
                    
                    <p className="text-gray-700 mb-4">{review.content}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <button className="flex items-center hover:text-gray-700">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                        </svg>
                        Helpful ({review.helpful_votes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Photos ({photos.length})</h2>
            
            {photos.length === 0 ? (
              <p className="text-gray-600">No photos yet. Be the first to add photos of this cookie spot!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48">
                      <img 
                        src={photo.file_path} 
                        alt={photo.caption || cookieSpot.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {photo.caption && (
                      <div className="p-3">
                        <p className="text-gray-700 text-sm">{photo.caption}</p>
                      </div>
                    )}
                    <div className="px-3 pb-3 text-xs text-gray-500">
                      Added by {photo.user_id.username} on {new Date(photo.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            
            {cookieSpot.location && cookieSpot.location.coordinates ? (
              <div className="h-[500px] rounded-lg overflow-hidden">
                <MapContainer 
                  center={[cookieSpot.location.coordinates[1], cookieSpot.location.coordinates[0]]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[cookieSpot.location.coordinates[1], cookieSpot.location.coordinates[0]]}>
                    <Popup>
                      <div>
                        <strong>{cookieSpot.name}</strong><br />
                        {cookieSpot.description ? 
                          cookieSpot.description : 
                          <>
                            {cookieSpot.address || ''}<br />
                            {cookieSpot.city && cookieSpot.city}
                            {cookieSpot.state_province && cookieSpot.city && ', '}
                            {cookieSpot.state_province && cookieSpot.state_province} 
                            {cookieSpot.postal_code && ' '}
                            {cookieSpot.postal_code && cookieSpot.postal_code}
                          </>
                        }
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <p className="text-gray-600">Location information not available.</p>
            )}
          </div>
        )}
      </div>

      {/* Nearby Cookie Spots */}
      {nearbyCookieSpots.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Nearby Cookie Spots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyCookieSpots.map(spot => (
              <div key={spot._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link to={`/cookie-spot/${spot._id}`}>
                  <div className="h-48 bg-gray-200">
                    {/* In a real app, you would fetch and display the primary image */}
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span>{spot.name}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/cookie-spot/${spot._id}`}>
                    <h3 className="font-bold text-lg mb-1">{spot.name}</h3>
                  </Link>
                  <div className="flex items-center mb-2">
                    <div className="rating flex items-center">
                      <span className="text-yellow-400">{'★'.repeat(Math.floor(spot.average_rating))}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - Math.floor(spot.average_rating))}</span>
                      <span className="ml-1 text-sm text-gray-600">{spot.average_rating.toFixed(1)}</span>
                      <span className="ml-1 text-sm text-gray-500">({spot.review_count})</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{spot.address}, {spot.city}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {spot.cookie_types.slice(0, 3).map(type => (
                      <span key={type._id} className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs">
                        {type.name}
                      </span>
                    ))}
                    {spot.cookie_types.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                        +{spot.cookie_types.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieSpotDetailPage;
