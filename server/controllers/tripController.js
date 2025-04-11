const Trip = require('../models/Trip');
const CookieSpot = require('../models/CookieSpot');
const { validationResult } = require('express-validator');

// @desc    Get all trips for a user
// @route   GET /api/trips
// @access  Private
exports.getUserTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const trips = await Trip.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Trip.countDocuments({ user_id: req.user.id });
    
    // Get the count of cookie spots in each trip
    const tripsWithCounts = trips.map(trip => ({
      ...trip._doc,
      cookie_spot_count: trip.cookie_spots.length
    }));
    
    res.json({
      trips: tripsWithCounts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    
    // Check ownership for private trips
    if (!trip.is_public && trip.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view this trip' });
    }
    
    // Populate cookie spots
    const populatedTrip = await Trip.findById(req.params.id)
      .populate({
        path: 'cookie_spots.cookie_spot_id',
        select: 'name address city state_province average_rating review_count location',
        populate: [
          { path: 'cookie_types', select: 'name' },
          { path: 'dietary_options', select: 'name' }
        ]
      });
    
    res.json(populatedTrip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, is_public, cookie_spots } = req.body;
    
    // Create new trip
    const newTrip = new Trip({
      user_id: req.user.id,
      name,
      description,
      is_public: is_public === true || is_public === 'true',
      cookie_spots: cookie_spots || []
    });
    
    // Validate cookie spots if provided
    if (cookie_spots && cookie_spots.length > 0) {
      for (const spot of cookie_spots) {
        const cookieSpot = await CookieSpot.findById(spot.cookie_spot_id);
        if (!cookieSpot) {
          return res.status(404).json({ msg: `Cookie spot with ID ${spot.cookie_spot_id} not found` });
        }
      }
    }
    
    const trip = await newTrip.save();
    
    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    
    // Check ownership
    if (trip.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this trip' });
    }
    
    const { name, description, is_public, cookie_spots } = req.body;
    
    // Update fields
    if (name) trip.name = name;
    if (description !== undefined) trip.description = description;
    if (is_public !== undefined) trip.is_public = is_public === true || is_public === 'true';
    
    // Update cookie spots if provided
    if (cookie_spots) {
      // Validate cookie spots
      for (const spot of cookie_spots) {
        const cookieSpot = await CookieSpot.findById(spot.cookie_spot_id);
        if (!cookieSpot) {
          return res.status(404).json({ msg: `Cookie spot with ID ${spot.cookie_spot_id} not found` });
        }
      }
      
      trip.cookie_spots = cookie_spots;
    }
    
    const updatedTrip = await trip.save();
    
    res.json(updatedTrip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    
    // Check ownership
    if (trip.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this trip' });
    }
    
    await trip.remove();
    
    res.json({ msg: 'Trip removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Add a cookie spot to a trip
// @route   POST /api/trips/:id/cookie-spots
// @access  Private
exports.addCookieSpotToTrip = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    
    // Check ownership
    if (trip.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this trip' });
    }
    
    const { cookie_spot_id, order_index, notes } = req.body;
    
    // Check if cookie spot exists
    const cookieSpot = await CookieSpot.findById(cookie_spot_id);
    if (!cookieSpot) {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    
    // Check if cookie spot is already in the trip
    const existingSpotIndex = trip.cookie_spots.findIndex(
      spot => spot.cookie_spot_id.toString() === cookie_spot_id
    );
    
    if (existingSpotIndex !== -1) {
      return res.status(400).json({ msg: 'Cookie spot already in trip' });
    }
    
    // Add cookie spot to trip
    trip.cookie_spots.push({
      cookie_spot_id,
      order_index: order_index || trip.cookie_spots.length,
      notes
    });
    
    await trip.save();
    
    res.json(trip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip or cookie spot not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Remove a cookie spot from a trip
// @route   DELETE /api/trips/:id/cookie-spots/:cookieSpotId
// @access  Private
exports.removeCookieSpotFromTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    
    // Check ownership
    if (trip.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this trip' });
    }
    
    // Find the cookie spot in the trip
    const removeIndex = trip.cookie_spots.findIndex(
      spot => spot.cookie_spot_id.toString() === req.params.cookieSpotId
    );
    
    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Cookie spot not found in trip' });
    }
    
    // Remove the cookie spot
    trip.cookie_spots.splice(removeIndex, 1);
    
    // Update order indices
    trip.cookie_spots.forEach((spot, index) => {
      spot.order_index = index;
    });
    
    await trip.save();
    
    res.json(trip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip or cookie spot not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Reorder cookie spots in a trip
// @route   PUT /api/trips/:id/reorder
// @access  Private
exports.reorderTripCookieSpots = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    
    // Check ownership
    if (trip.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this trip' });
    }
    
    const { cookie_spot_order } = req.body;
    
    if (!cookie_spot_order || !Array.isArray(cookie_spot_order)) {
      return res.status(400).json({ msg: 'Cookie spot order array is required' });
    }
    
    // Validate that all cookie spots in the order exist in the trip
    const tripSpotIds = trip.cookie_spots.map(spot => spot.cookie_spot_id.toString());
    const orderSpotIds = cookie_spot_order.map(id => id.toString());
    
    if (tripSpotIds.length !== orderSpotIds.length) {
      return res.status(400).json({ msg: 'Order array must contain all cookie spots in the trip' });
    }
    
    for (const spotId of orderSpotIds) {
      if (!tripSpotIds.includes(spotId)) {
        return res.status(400).json({ msg: `Cookie spot with ID ${spotId} not found in trip` });
      }
    }
    
    // Reorder the cookie spots
    const reorderedSpots = orderSpotIds.map((spotId, index) => {
      const originalSpot = trip.cookie_spots.find(
        spot => spot.cookie_spot_id.toString() === spotId
      );
      
      return {
        cookie_spot_id: originalSpot.cookie_spot_id,
        order_index: index,
        notes: originalSpot.notes
      };
    });
    
    trip.cookie_spots = reorderedSpots;
    await trip.save();
    
    res.json(trip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    res.status(500).send('Server error');
  }
};
