const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// @route   GET /api/reviews/cookie-spot/:cookieSpotId
// @desc    Get all reviews for a cookie spot
// @access  Public
router.get('/cookie-spot/:cookieSpotId', reviewController.getReviewsByCookieSpot);

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a user
// @access  Public
router.get('/user/:userId', reviewController.getReviewsByUser);

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', auth,
  check('cookie_spot_id', 'Cookie spot ID is required').notEmpty(),
  check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
  check('content', 'Content is required').notEmpty(),
  check('title', 'Title is required').notEmpty(),
  check('visit_date', 'Visit date must be a valid date').optional().isISO8601(),
  reviewController.createReview
);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth,
  check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
  check('content', 'Content cannot be empty if provided').optional().notEmpty(),
  check('title', 'Title cannot be empty if provided').optional().notEmpty(),
  check('visit_date', 'Visit date must be a valid date').optional().isISO8601(),
  reviewController.updateReview
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, reviewController.deleteReview);

// @route   PUT /api/reviews/:id/helpful
// @desc    Vote a review as helpful
// @access  Private
router.put('/:id/helpful', auth, reviewController.voteReviewHelpful);

module.exports = router;
