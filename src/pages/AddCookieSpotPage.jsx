import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cookieSpotApi } from '../utils/api'

const AddCookieSpotPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    cookieTypes: [],
    dietaryOptions: [],
    features: []
  })
  const [error, setError] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

  const cookieTypeOptions = [
    'Chocolate Chip', 'Sugar Cookie', 'Oatmeal Raisin', 'Peanut Butter', 
    'Snickerdoodle', 'Shortbread', 'Macaron', 'Gingerbread', 
    'White Chocolate Macadamia', 'Double Chocolate', 'Molasses', 
    'Butter Cookie', 'Fortune Cookie', 'Biscotti', 'Thumbprint', 
    'Sandwich Cookie', 'Cookie Cake', 'Cookie Pie', 'Cookie Brownie', 
    'Specialty/Seasonal'
  ]

  const dietaryOptionOptions = [
    'Vegan', 'Gluten-Free', 'Nut-Free', 'Dairy-Free', 'Egg-Free', 
    'Soy-Free', 'Organic', 'Low Sugar', 'Keto-Friendly', 'Paleo-Friendly'
  ]

  const featureOptions = [
    'Dine-in', 'Takeout', 'Delivery', 'Accepts Credit Cards', 
    'Wheelchair Accessible', 'Free Wi-Fi', 'Outdoor Seating', 
    'Kid-Friendly', 'Dog-Friendly', 'Late Night'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('hours.')) {
      const hourField = name.split('.')[1]
      setFormData({
        ...formData,
        hours: {
          ...formData.hours,
          [hourField]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target
    
    if (checked) {
      setFormData({
        ...formData,
        [category]: [...formData[category], value]
      })
    } else {
      setFormData({
        ...formData,
        [category]: formData[category].filter(item => item !== value)
      })
    }
  }

  const handleImageChange = (e) => {
    e.preventDefault()
    
    const files = Array.from(e.target.files)
    
    if (files.length + images.length > 5) {
      setError('You can upload a maximum of 5 images')
      return
    }
    
    setImages([...images, ...files])
    
    const newImagePreviewUrls = []
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImagePreviewUrls.push(reader.result)
        if (newImagePreviewUrls.length === files.length) {
          setImagePreviewUrls([...imagePreviewUrls, ...newImagePreviewUrls])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const newImages = [...images]
    const newImagePreviewUrls = [...imagePreviewUrls]
    
    newImages.splice(index, 1)
    newImagePreviewUrls.splice(index, 1)
    
    setImages(newImages)
    setImagePreviewUrls(newImagePreviewUrls)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!formData.name || !formData.address || !formData.city || !formData.state) {
      setError('Please fill in all required fields')
      return
    }
    
    if (formData.cookieTypes.length === 0) {
      setError('Please select at least one cookie type')
      return
    }
    
    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'hours' || key === 'cookieTypes' || key === 'dietaryOptions' || key === 'features') {
          formDataToSend.append(key, JSON.stringify(formData[key]))
        } else {
          formDataToSend.append(key, formData[key])
        }
      })

      // Append images
      images.forEach((image, index) => {
        formDataToSend.append('images', image)
      })

      // Send the request
      const response = await cookieSpotApi.createCookieSpot(formDataToSend)
      
      // Navigate to the new cookie spot's page
      navigate(`/cookie-spot/${response.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create cookie spot. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add a Cookie Spot</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip/Postal Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Hours of Operation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hours.monday" className="block text-sm font-medium text-gray-700 mb-1">
                Monday
              </label>
              <input
                type="text"
                id="hours.monday"
                name="hours.monday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.monday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="hours.tuesday" className="block text-sm font-medium text-gray-700 mb-1">
                Tuesday
              </label>
              <input
                type="text"
                id="hours.tuesday"
                name="hours.tuesday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.tuesday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="hours.wednesday" className="block text-sm font-medium text-gray-700 mb-1">
                Wednesday
              </label>
              <input
                type="text"
                id="hours.wednesday"
                name="hours.wednesday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.wednesday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="hours.thursday" className="block text-sm font-medium text-gray-700 mb-1">
                Thursday
              </label>
              <input
                type="text"
                id="hours.thursday"
                name="hours.thursday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.thursday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="hours.friday" className="block text-sm font-medium text-gray-700 mb-1">
                Friday
              </label>
              <input
                type="text"
                id="hours.friday"
                name="hours.friday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.friday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="hours.saturday" className="block text-sm font-medium text-gray-700 mb-1">
                Saturday
              </label>
              <input
                type="text"
                id="hours.saturday"
                name="hours.saturday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.saturday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="hours.sunday" className="block text-sm font-medium text-gray-700 mb-1">
                Sunday
              </label>
              <input
                type="text"
                id="hours.sunday"
                name="hours.sunday"
                placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                value={formData.hours.sunday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cookie Types <span className="text-red-500">*</span></h2>
          <p className="text-gray-600 mb-3">Select all cookie types that apply</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cookieTypeOptions.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`cookie-type-${option}`}
                  value={option}
                  checked={formData.cookieTypes.includes(option)}
                  onChange={(e) => handleCheckboxChange(e, 'cookieTypes')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={`cookie-type-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Dietary Options</h2>
          <p className="text-gray-600 mb-3">Select all dietary options that apply</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dietaryOptionOptions.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`dietary-option-${option}`}
                  value={option}
                  checked={formData.dietaryOptions.includes(option)}
                  onChange={(e) => handleCheckboxChange(e, 'dietaryOptions')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={`dietary-option-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <p className="text-gray-600 mb-3">Select all features that apply</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featureOptions.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`feature-${option}`}
                  value={option}
                  checked={formData.features.includes(option)}
                  onChange={(e) => handleCheckboxChange(e, 'features')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={`feature-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Photos</h2>
          <p className="text-gray-600 mb-3">Upload up to 5 photos of the cookie spot and its cookies</p>
          
          <div className="mb-4">
            <label className="block">
              <span className="sr-only">Choose photos</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </label>
          </div>
          
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCookieSpotPage
