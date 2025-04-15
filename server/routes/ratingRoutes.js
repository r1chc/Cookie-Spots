const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Validation middleware
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

// @route   GET /api/ratings/post/:postId
// @desc    Get ratings for a blog post
// @access  Public
router.get('/post/:postId', ratingController.getRatingsByPost);

// @route   POST /api/ratings
// @desc    Create or update a rating
// @access  Private
router.post(
  '/',
  auth,
  validateRating,
  ratingController.createOrUpdateRating
);

// @route   DELETE /api/ratings/:id
// @desc    Delete a rating
// @access  Private
router.delete('/:id', auth, ratingController.deleteRating);

module.exports = router; 