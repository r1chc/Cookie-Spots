const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const tripController = require('../controllers/tripController');
const { auth } = require('../middleware/auth');

// @route   GET /api/trips
// @desc    Get user's trips
// @access  Private
router.get('/', auth, tripController.getUserTrips);

// @route   GET /api/trips/:id
// @desc    Get trip by ID
// @access  Private
router.get('/:id', auth, tripController.getTripById);

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private
router.post('/', auth,
  check('name', 'Trip name is required').notEmpty(),
  check('start_date', 'Start date is required').notEmpty(),
  check('end_date', 'End date is required').notEmpty(),
  check('cookie_spots', 'At least one cookie spot is required').isArray({ min: 1 }),
  tripController.createTrip
);

// @route   PUT /api/trips/:id
// @desc    Update a trip
// @access  Private
router.put('/:id', auth,
  check('name', 'Trip name cannot be empty').optional().notEmpty(),
  check('start_date', 'Start date must be valid').optional().notEmpty(),
  check('end_date', 'End date must be valid').optional().notEmpty(),
  check('cookie_spots', 'Cookie spots must be an array').optional().isArray(),
  tripController.updateTrip
);

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Private
router.delete('/:id', auth, tripController.deleteTrip);

// @route   POST /api/trips/:id/cookie-spots
// @desc    Add a cookie spot to a trip
// @access  Private
router.post(
  '/:id/cookie-spots',
  [
    auth,
    [
      check('cookie_spot_id', 'Cookie spot ID is required').not().isEmpty(),
      check('notes', 'Notes cannot be empty').optional().not().isEmpty()
    ]
  ],
  tripController.addCookieSpotToTrip
);

// @route   DELETE /api/trips/:id/cookie-spots/:cookieSpotId
// @desc    Remove a cookie spot from a trip
// @access  Private
router.delete('/:id/cookie-spots/:cookieSpotId', auth, tripController.removeCookieSpotFromTrip);

// @route   PUT /api/trips/:id/reorder
// @desc    Reorder cookie spots in a trip
// @access  Private
router.put(
  '/:id/reorder',
  [
    auth,
    [
      check('cookie_spot_order', 'Cookie spot order array is required').isArray({ min: 1 })
    ]
  ],
  tripController.reorderTripCookieSpots
);

// @route   POST /api/trips/:id/share
// @desc    Share a trip
// @access  Private
router.post('/:id/share', auth,
  check('email', 'Email is required').isEmail(),
  tripController.shareTrip
);

module.exports = router;
