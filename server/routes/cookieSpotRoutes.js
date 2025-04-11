const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const cookieSpotController = require('../controllers/cookieSpotController');
const auth = require('../middleware/auth');

// @route   GET /api/cookie-spots
// @desc    Get all cookie spots
// @access  Public
router.get('/', cookieSpotController.getAllCookieSpots);

// @route   GET /api/cookie-spots/nearby
// @desc    Get nearby cookie spots
// @access  Public
router.get('/nearby', cookieSpotController.getNearbyCookieSpots);

// @route   GET /api/cookie-spots/:id
// @desc    Get cookie spot by ID
// @access  Public
router.get('/:id', cookieSpotController.getCookieSpotById);

// @route   POST /api/cookie-spots
// @desc    Create a cookie spot
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty(),
      check('state_province', 'State/Province is required').not().isEmpty(),
      check('latitude', 'Latitude is required').not().isEmpty(),
      check('longitude', 'Longitude is required').not().isEmpty(),
      check('cookie_types', 'At least one cookie type is required').isArray({ min: 1 })
    ]
  ],
  cookieSpotController.createCookieSpot
);

// @route   PUT /api/cookie-spots/:id
// @desc    Update a cookie spot
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name cannot be empty').optional().not().isEmpty(),
      check('address', 'Address cannot be empty').optional().not().isEmpty(),
      check('city', 'City cannot be empty').optional().not().isEmpty(),
      check('state_province', 'State/Province cannot be empty').optional().not().isEmpty(),
      check('cookie_types', 'Cookie types must be an array').optional().isArray()
    ]
  ],
  cookieSpotController.updateCookieSpot
);

// @route   DELETE /api/cookie-spots/:id
// @desc    Delete a cookie spot
// @access  Private
router.delete('/:id', auth, cookieSpotController.deleteCookieSpot);

module.exports = router;
