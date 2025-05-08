const CookieSpot = require('../models/CookieSpot');
const Review = require('../models/Review');
const Photo = require('../models/Photo');
const { validationResult } = require('express-validator');

// @desc    Get all cookie spots
// @route   GET /api/cookie-spots
// @access  Public
exports.getAllCookieSpots = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'average_rating', 
      order = 'desc',
      cookie_type,
      dietary_option,
      search,
      near,
      max_distance = 10000, // Default 10km
      keyword, // New parameter for filtering by keyword in reviews/menu items
    } = req.query;

    const query = {};
    
    // Filter by cookie type
    if (cookie_type) {
      query.cookie_types = cookie_type;
    }
    
    // Filter by dietary option
    if (dietary_option) {
      query.dietary_options = dietary_option;
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Geospatial search
    if (near) {
      const [lng, lat] = near.split(',').map(coord => parseFloat(coord));
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(max_distance)
        }
      };
    }
    
    // Only show active spots
    query.status = 'active';
    
    // Validate sort field
    const validSortFields = ['name', 'average_rating', 'created_at', 'updated_at'];
    if (!validSortFields.includes(sort)) {
      return res.status(400).json({ 
        error: 'Invalid sort field', 
        validFields: validSortFields 
      });
    }
    
    // Set up sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // If text search, add relevance score
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }
    
    // Calculate skip value
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const total = await CookieSpot.countDocuments(query);
    
    // Get paginated results
    let cookieSpots = await CookieSpot.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('cookie_types', 'name')
      .populate('dietary_options', 'name');
    
    // If keyword parameter exists, filter results based on reviews and menu items
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      
      // For each cookie spot, fetch its reviews
      const spotsWithKeywordInfo = await Promise.all(cookieSpots.map(async (spot) => {
        const spotObj = spot.toObject();
        
        // Check if menu items contain the keyword
        const hasKeywordInMenu = spotObj.menu_items && 
          spotObj.menu_items.some(item => 
            item.name.toLowerCase().includes(keywordLower) || 
            (item.description && item.description.toLowerCase().includes(keywordLower))
          );
        
        // Check if description contains the keyword
        const hasKeywordInDescription = spotObj.description && 
          spotObj.description.toLowerCase().includes(keywordLower);
        
        // Get reviews for this spot
        const reviews = await Review.find({
          cookie_spot_id: spot._id,
          status: 'published'
        });
        
        // Check if any review contains the keyword
        const hasKeywordInReviews = reviews.some(review => 
          review.text.toLowerCase().includes(keywordLower)
        );
        
        // Add this information to the spot object
        spotObj.keyword_match = {
          in_menu: hasKeywordInMenu,
          in_description: hasKeywordInDescription,
          in_reviews: hasKeywordInReviews,
          // Save matching reviews for display
          matching_reviews: reviews
            .filter(review => review.text.toLowerCase().includes(keywordLower))
            .map(review => ({ 
              id: review._id, 
              text: review.text,
              // Extract the portion of the review containing the keyword for highlighting
              highlight: extractKeywordContext(review.text, keywordLower)
            }))
        };
        
        // Return true if the spot matches the keyword in any way
        return {
          ...spotObj,
          matches_keyword: hasKeywordInMenu || hasKeywordInDescription || hasKeywordInReviews
        };
      }));
      
      // Filter spots to only include those that match the keyword
      cookieSpots = spotsWithKeywordInfo.filter(spot => spot.matches_keyword);
      
      // Adjust total count for pagination
      const filteredTotal = cookieSpots.length;
      
      return res.json({
        cookieSpots,
        totalPages: Math.ceil(filteredTotal / parseInt(limit)),
        currentPage: parseInt(page),
        total: filteredTotal,
        filtered_by_keyword: true
      });
    }
    
    res.json({
      cookieSpots,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error in getAllCookieSpots:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
};

// Helper function to extract context around a keyword in text
function extractKeywordContext(text, keyword, contextLength = 50) {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  const keywordIndex = lowerText.indexOf(keyword);
  
  if (keywordIndex === -1) return '';
  
  const startIndex = Math.max(0, keywordIndex - contextLength);
  const endIndex = Math.min(text.length, keywordIndex + keyword.length + contextLength);
  
  let excerpt = text.substring(startIndex, endIndex);
  
  // Add ellipsis if we're not starting from the beginning or ending at the end
  if (startIndex > 0) excerpt = '...' + excerpt;
  if (endIndex < text.length) excerpt = excerpt + '...';
  
  return excerpt;
}

// @desc    Get cookie spot by ID
// @route   GET /api/cookie-spots/:id
// @access  Public
exports.getCookieSpotById = async (req, res) => {
  try {
    const cookieSpot = await CookieSpot.findById(req.params.id)
      .populate('cookie_types', 'name description')
      .populate('dietary_options', 'name description')
      .populate('added_by', 'username profile_image');
    
    if (!cookieSpot) {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    
    // Get photos
    const photos = await Photo.find({ 
      cookie_spot_id: cookieSpot._id,
      status: 'approved'
    }).populate('user_id', 'username profile_image');
    
    // Get reviews
    const reviews = await Review.find({
      cookie_spot_id: cookieSpot._id,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .populate('user_id', 'username profile_image');
    
    res.json({
      cookieSpot,
      photos,
      reviews
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a cookie spot
// @route   POST /api/cookie-spots
// @access  Private
exports.createCookieSpot = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      address,
      city,
      state_province,
      country,
      postal_code,
      latitude,
      longitude,
      phone,
      website,
      email,
      hours_of_operation,
      price_range,
      has_dine_in,
      has_takeout,
      has_delivery,
      is_wheelchair_accessible,
      accepts_credit_cards,
      cookie_types,
      dietary_options,
      features
    } = req.body;
    
    // Create new cookie spot
    const newCookieSpot = new CookieSpot({
      name,
      description,
      address,
      city,
      state_province,
      country,
      postal_code,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      phone,
      website,
      email,
      hours_of_operation,
      price_range,
      has_dine_in,
      has_takeout,
      has_delivery,
      is_wheelchair_accessible,
      accepts_credit_cards,
      cookie_types,
      dietary_options,
      features,
      added_by: req.user.id,
      status: req.user.is_admin ? 'active' : 'pending' // Admins can create active spots directly
    });
    
    const cookieSpot = await newCookieSpot.save();
    
    res.json(cookieSpot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a cookie spot
// @route   PUT /api/cookie-spots/:id
// @access  Private
exports.updateCookieSpot = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const cookieSpot = await CookieSpot.findById(req.params.id);
    
    if (!cookieSpot) {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    
    // Check ownership or admin status
    if (cookieSpot.added_by.toString() !== req.user.id && !req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to update this cookie spot' });
    }
    
    const {
      name,
      description,
      address,
      city,
      state_province,
      country,
      postal_code,
      latitude,
      longitude,
      phone,
      website,
      email,
      hours_of_operation,
      price_range,
      has_dine_in,
      has_takeout,
      has_delivery,
      is_wheelchair_accessible,
      accepts_credit_cards,
      cookie_types,
      dietary_options,
      features,
      status
    } = req.body;
    
    // Update fields
    if (name) cookieSpot.name = name;
    if (description) cookieSpot.description = description;
    if (address) cookieSpot.address = address;
    if (city) cookieSpot.city = city;
    if (state_province) cookieSpot.state_province = state_province;
    if (country) cookieSpot.country = country;
    if (postal_code) cookieSpot.postal_code = postal_code;
    if (latitude && longitude) {
      cookieSpot.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }
    if (phone) cookieSpot.phone = phone;
    if (website) cookieSpot.website = website;
    if (email) cookieSpot.email = email;
    if (hours_of_operation) cookieSpot.hours_of_operation = hours_of_operation;
    if (price_range) cookieSpot.price_range = price_range;
    if (has_dine_in !== undefined) cookieSpot.has_dine_in = has_dine_in;
    if (has_takeout !== undefined) cookieSpot.has_takeout = has_takeout;
    if (has_delivery !== undefined) cookieSpot.has_delivery = has_delivery;
    if (is_wheelchair_accessible !== undefined) cookieSpot.is_wheelchair_accessible = is_wheelchair_accessible;
    if (accepts_credit_cards !== undefined) cookieSpot.accepts_credit_cards = accepts_credit_cards;
    if (cookie_types) cookieSpot.cookie_types = cookie_types;
    if (dietary_options) cookieSpot.dietary_options = dietary_options;
    if (features) cookieSpot.features = features;
    
    // Only admins can change status
    if (status && req.user.is_admin) {
      cookieSpot.status = status;
    }
    
    const updatedCookieSpot = await cookieSpot.save();
    
    res.json(updatedCookieSpot);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a cookie spot
// @route   DELETE /api/cookie-spots/:id
// @access  Private
exports.deleteCookieSpot = async (req, res) => {
  try {
    const cookieSpot = await CookieSpot.findById(req.params.id);
    
    if (!cookieSpot) {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    
    // Check ownership or admin status
    if (cookieSpot.added_by.toString() !== req.user.id && !req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to delete this cookie spot' });
    }
    
    // Delete associated reviews
    await Review.deleteMany({ cookie_spot_id: req.params.id });
    
    // Delete associated photos
    await Photo.deleteMany({ cookie_spot_id: req.params.id });
    
    // Delete the cookie spot
    await cookieSpot.remove();
    
    res.json({ msg: 'Cookie spot removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Get nearby cookie spots
// @route   GET /api/cookie-spots/nearby
// @access  Public
exports.getNearbyCookieSpots = async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      distance = 5000, // Default 5km
      limit = 20 
    } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and longitude are required' });
    }
    
    // Convert string parameters to numbers
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedDistance = parseInt(distance);
    const parsedLimit = parseInt(limit);
    
    // Check for valid coordinates
    if (isNaN(parsedLat) || isNaN(parsedLng) || 
        parsedLat < -90 || parsedLat > 90 || 
        parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ msg: 'Invalid coordinates provided' });
    }
    
    console.log(`Searching for cookie spots near [${parsedLng}, ${parsedLat}]`);
    
    // Search in MongoDB cache
    const cookieSpots = await CookieSpot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat]
          },
          $maxDistance: parsedDistance
        }
      },
      status: 'active'
    })
    .limit(parsedLimit)
    .populate('cookie_types', 'name')
    .populate('dietary_options', 'name');
    
    console.log(`Found ${cookieSpots.length} cookie spots in cache`);
    
    // Return results from cache (even if empty)
    res.json(cookieSpots);
    
  } catch (err) {
    console.error('Error in getNearbyCookieSpots:', err.message);
    res.status(500).send('Server error');
  }
};
