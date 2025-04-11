const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get all favorites for a user
// @access  Private
router.get('/', auth, favoriteController.getUserFavorites);

// @route   GET /api/favorites/check/:cookieSpotId
// @desc    Check if a cookie spot is favorited by the user
// @access  Private
router.get('/check/:cookieSpotId', auth, favoriteController.checkFavorite);

// @route   POST /api/favorites
// @desc    Add a cookie spot to favorites
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('cookie_spot_id', 'Cookie spot ID is required').not().isEmpty()
    ]
  ],
  favoriteController.addFavorite
);

// @route   DELETE /api/favorites/:cookieSpotId
// @desc    Remove a cookie spot from favorites
// @access  Private
router.delete('/:cookieSpotId', auth, favoriteController.removeFavorite);

module.exports = router;
