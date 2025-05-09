const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', auth, favoriteController.getUserFavorites);

// @route   GET /api/favorites/check/:cookieSpotId
// @desc    Check if a cookie spot is favorited by the user
// @access  Private
router.get('/check/:cookieSpotId', auth, favoriteController.checkFavorite);

// @route   POST /api/favorites
// @desc    Add a cookie spot to favorites
// @access  Private
router.post('/', auth,
  check('cookie_spot_id', 'Cookie spot ID is required').notEmpty(),
  favoriteController.addFavorite
);

// @route   DELETE /api/favorites/:id
// @desc    Remove a cookie spot from favorites
// @access  Private
router.delete('/:id', auth, favoriteController.removeFavorite);

module.exports = router;
