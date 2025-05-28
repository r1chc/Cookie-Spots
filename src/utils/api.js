import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/.netlify/functions',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Cookie Spots API
export const cookieSpotApi = {
  // Get all cookie spots with optional filters
  getAllCookieSpots: (params = {}) => api.get('/cookie-spots', { params }),
  
  // Get cookie spot by ID
  getCookieSpotById: (id) => api.get(`/cookie-spots/${id}`),
  
  // Get nearby cookie spots
  getNearbyCookieSpots: (lat, lng, distance = 5000, limit = 10) => 
    api.get(`/cookie-spots/nearby`, { params: { lat, lng, distance, limit } }),
  
  // Create a new cookie spot
  createCookieSpot: (cookieSpotData) => api.post('/cookie-spots', cookieSpotData),
  
  // Update a cookie spot
  updateCookieSpot: (id, cookieSpotData) => api.put(`/cookie-spots/${id}`, cookieSpotData),
  
  // Delete a cookie spot
  deleteCookieSpot: (id) => api.delete(`/cookie-spots/${id}`)
};

// Authentication API
export const authApi = {
  // Register a new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me')
};

// Reviews API
export const reviewApi = {
  // Get reviews for a cookie spot
  getReviewsByCookieSpot: (cookieSpotId, params = {}) => 
    api.get(`/reviews/cookie-spot/${cookieSpotId}`, { params }),
  
  // Get reviews by a user
  getReviewsByUser: (userId, params = {}) => 
    api.get(`/reviews/user/${userId}`, { params }),
  
  // Create a review
  createReview: (reviewData) => api.post('/reviews', reviewData),
  
  // Update a review
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  
  // Delete a review
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  
  // Vote a review as helpful
  voteReviewHelpful: (id) => api.put(`/reviews/${id}/helpful`)
};

// Photos API
export const photoApi = {
  // Get photos for a cookie spot
  getPhotosByCookieSpot: (cookieSpotId, params = {}) => 
    api.get(`/photos/cookie-spot/${cookieSpotId}`, { params }),
  
  // Get photos by a user
  getPhotosByUser: (userId, params = {}) => 
    api.get(`/photos/user/${userId}`, { params }),
  
  // Upload a photo (requires FormData)
  uploadPhoto: (formData) => api.post('/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Update a photo
  updatePhoto: (id, photoData) => api.put(`/photos/${id}`, photoData),
  
  // Delete a photo
  deletePhoto: (id) => api.delete(`/photos/${id}`)
};

// Favorites API
export const favoriteApi = {
  // Get user's favorites
  getUserFavorites: (params = {}) => api.get('/favorites', { params }),
  
  // Check if a cookie spot is favorited
  checkFavorite: (cookieSpotId) => api.get(`/favorites/check/${cookieSpotId}`),
  
  // Add a cookie spot to favorites
  addFavorite: (cookieSpotId) => api.post('/favorites', { cookie_spot_id: cookieSpotId }),
  
  // Remove a cookie spot from favorites
  removeFavorite: (cookieSpotId) => api.delete(`/favorites/${cookieSpotId}`)
};

// Cookie Types API
export const cookieTypeApi = {
  // Get all cookie types
  getAllCookieTypes: () => api.get('/cookie-types'),
  
  // Get cookie type by ID
  getCookieTypeById: (id) => api.get(`/cookie-types/${id}`),
  
  // Create a cookie type (admin only)
  createCookieType: (cookieTypeData) => api.post('/cookie-types', cookieTypeData),
  
  // Update a cookie type (admin only)
  updateCookieType: (id, cookieTypeData) => api.put(`/cookie-types/${id}`, cookieTypeData),
  
  // Delete a cookie type (admin only)
  deleteCookieType: (id) => api.delete(`/cookie-types/${id}`)
};

// Dietary Options API
export const dietaryOptionApi = {
  // Get all dietary options
  getAllDietaryOptions: () => api.get('/dietary-options'),
  
  // Get dietary option by ID
  getDietaryOptionById: (id) => api.get(`/dietary-options/${id}`),
  
  // Create a dietary option (admin only)
  createDietaryOption: (dietaryOptionData) => api.post('/dietary-options', dietaryOptionData),
  
  // Update a dietary option (admin only)
  updateDietaryOption: (id, dietaryOptionData) => api.put(`/dietary-options/${id}`, dietaryOptionData),
  
  // Delete a dietary option (admin only)
  deleteDietaryOption: (id) => api.delete(`/dietary-options/${id}`)
};

// Trips API
export const tripApi = {
  // Get user's trips
  getUserTrips: (params = {}) => api.get('/trips', { params }),
  
  // Get trip by ID
  getTripById: (id) => api.get(`/trips/${id}`),
  
  // Create a trip
  createTrip: (tripData) => api.post('/trips', tripData),
  
  // Update a trip
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  
  // Delete a trip
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  
  // Add a cookie spot to a trip
  addCookieSpotToTrip: (tripId, cookieSpotId, notes = '', orderIndex = null) => 
    api.post(`/trips/${tripId}/cookie-spots`, { cookie_spot_id: cookieSpotId, notes, order_index: orderIndex }),
  
  // Remove a cookie spot from a trip
  removeCookieSpotFromTrip: (tripId, cookieSpotId) => 
    api.delete(`/trips/${tripId}/cookie-spots/${cookieSpotId}`),
  
  // Reorder cookie spots in a trip
  reorderTripCookieSpots: (tripId, cookieSpotOrder) => 
    api.put(`/trips/${tripId}/reorder`, { cookie_spot_order: cookieSpotOrder })
};

export default {
  cookieSpotApi,
  authApi,
  reviewApi,
  photoApi,
  favoriteApi,
  cookieTypeApi,
  dietaryOptionApi,
  tripApi
};
