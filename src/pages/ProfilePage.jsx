import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../utils/api'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authApi.getProfile()
        setUser(response.data)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please log in to view your profile</p>
          <Link to="/login" className="text-primary-600 hover:text-primary-700">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
            <img 
              src={user.profileImage} 
              alt={`${user.firstName} ${user.lastName}`} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
            <p className="text-gray-600 mb-2">{user.firstName} {user.lastName}</p>
            <p className="text-gray-500 mb-4">Member since {user.joinDate} • {user.location}</p>
            <p className="text-gray-700 mb-4">{user.bio}</p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'reviews' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({user.reviews.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'favorites' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorites ({user.favorites.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'photos' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('photos')}
            >
              Photos ({user.photos.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">First Name</p>
                <p className="font-medium">{user.firstName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Last Name</p>
                <p className="font-medium">{user.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-medium">{user.location}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Member Since</p>
                <p className="font-medium">{user.joinDate}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Bio</h2>
              <p className="text-gray-700">{user.bio}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-3">
                <button className="text-primary-600 hover:text-primary-700 font-medium">
                  Change Password
                </button>
                <div className="block">
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Notification Settings
                  </button>
                </div>
                <div className="block">
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Settings
                  </button>
                </div>
                <div className="block">
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {user.reviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <Link to={`/cookie-spot/${review.cookieSpotId}`} className="text-xl font-semibold hover:text-primary-600">
                    {review.cookieSpotName}
                  </Link>
                  <span className="text-gray-500 text-sm">{review.date}</span>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">{review.text}</p>
                <div className="mt-4 flex space-x-4">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Edit Review
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.favorites.map(spot => (
              <div key={spot.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link to={`/cookie-spot/${spot.id}`}>
                  <img 
                    src={spot.image} 
                    alt={spot.name} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/cookie-spot/${spot.id}`}>
                    <h3 className="font-bold text-lg mb-1">{spot.name}</h3>
                  </Link>
                  <div className="flex items-center mb-2">
                    <div className="rating flex items-center">
                      <span className="text-yellow-400">{'★'.repeat(Math.floor(spot.rating))}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - Math.floor(spot.rating))}</span>
                      <span className="ml-1 text-sm text-gray-600">{spot.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{spot.location}</p>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Remove from Favorites
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.photos.map(photo => (
              <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img 
                    src={photo.image} 
                    alt={`Photo at ${photo.cookieSpotName}`} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <Link to={`/cookie-spot/${photo.cookieSpotId}`} className="text-white font-semibold hover:underline">
                      {photo.cookieSpotName}
                    </Link>
                    <p className="text-gray-300 text-sm">{photo.date}</p>
                  </div>
                </div>
                <div className="p-4 flex justify-between">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Edit Caption
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete Photo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
