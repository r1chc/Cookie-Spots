const Review = require('../models/Review');
const CookieSpot = require('../models/CookieSpot');
const { validationResult } = require('express-validator');

// @desc    Get all reviews for a cookie spot
// @route   GET /api/reviews/cookie-spot/:cookieSpotId
// @access  Public
exports.getReviewsByCookieSpot = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Validate page and limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ 
        errors: [{ msg: 'Invalid pagination parameters' }] 
      });
    }
    
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    const reviews = await Review.find({ 
      cookie_spot_id: req.params.cookieSpotId,
      status: 'published'
    })
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('user_id', 'username profile_image');
    
    const total = await Review.countDocuments({ 
      cookie_spot_id: req.params.cookieSpotId,
      status: 'published'
    });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @desc    Get all reviews by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getReviewsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Validate page and limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ 
        errors: [{ msg: 'Invalid pagination parameters' }] 
      });
    }
    
    const reviews = await Review.find({ 
      user_id: req.params.userId,
      status: 'published'
    })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('cookie_spot_id', 'name city state_province');
    
    const total = await Review.countDocuments({ 
      user_id: req.params.userId,
      status: 'published'
    });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cookie_spot_id, rating, title, content, visit_date } = req.body;
    
    // Check if cookie spot exists
    const cookieSpot = await CookieSpot.findById(cookie_spot_id);
    if (!cookieSpot) {
      return res.status(404).json({ 
        errors: [{ msg: 'Cookie spot not found' }] 
      });
    }
    
    // Check if user already reviewed this cookie spot
    const existingReview = await Review.findOne({ 
      cookie_spot_id, 
      user_id: req.user.id 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        errors: [{ msg: 'You have already reviewed this cookie spot' }] 
      });
    }
    
    // Validate visit date if provided
    if (visit_date) {
      const visitDate = new Date(visit_date);
      if (isNaN(visitDate.getTime())) {
        return res.status(400).json({ 
          errors: [{ msg: 'Invalid visit date format' }] 
        });
      }
    }
    
    // Create new review
    const newReview = new Review({
      cookie_spot_id,
      user_id: req.user.id,
      rating,
      title,
      content,
      visit_date: visit_date ? new Date(visit_date) : undefined,
      status: 'published'
    });
    
    const review = await newReview.save();
    
    // Update cookie spot rating
    const allReviews = await Review.find({ 
      cookie_spot_id,
      status: 'published'
    });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    cookieSpot.average_rating = averageRating;
    cookieSpot.review_count = allReviews.length;
    await cookieSpot.save();
    
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        errors: [{ msg: 'Review not found' }] 
      });
    }
    
    // Check ownership
    if (review.user_id.toString() !== req.user.id && !req.user.is_admin) {
      return res.status(401).json({ 
        errors: [{ msg: 'Not authorized to update this review' }] 
      });
    }
    
    const { rating, title, content, visit_date } = req.body;
    
    // Validate visit date if provided
    if (visit_date) {
      const visitDate = new Date(visit_date);
      if (isNaN(visitDate.getTime())) {
        return res.status(400).json({ 
          errors: [{ msg: 'Invalid visit date format' }] 
        });
      }
    }
    
    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (content) review.content = content;
    if (visit_date) review.visit_date = new Date(visit_date);
    
    const updatedReview = await review.save();
    
    // Update cookie spot rating
    const cookieSpot = await CookieSpot.findById(review.cookie_spot_id);
    const allReviews = await Review.find({ 
      cookie_spot_id: review.cookie_spot_id,
      status: 'published'
    });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    cookieSpot.average_rating = averageRating;
    await cookieSpot.save();
    
    res.json(updatedReview);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        errors: [{ msg: 'Review not found' }] 
      });
    }
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        errors: [{ msg: 'Review not found' }] 
      });
    }
    
    // Check ownership
    if (review.user_id.toString() !== req.user.id && !req.user.is_admin) {
      return res.status(401).json({ 
        errors: [{ msg: 'Not authorized to delete this review' }] 
      });
    }
    
    await review.remove();
    
    // Update cookie spot rating
    const cookieSpot = await CookieSpot.findById(review.cookie_spot_id);
    const allReviews = await Review.find({ 
      cookie_spot_id: review.cookie_spot_id,
      status: 'published'
    });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      cookieSpot.average_rating = averageRating;
    } else {
      cookieSpot.average_rating = 0;
    }
    
    cookieSpot.review_count = allReviews.length;
    await cookieSpot.save();
    
    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        errors: [{ msg: 'Review not found' }] 
      });
    }
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @desc    Vote a review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.voteReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        errors: [{ msg: 'Review not found' }] 
      });
    }
    
    // Check if user already voted
    if (review.helpful_voters.includes(req.user.id)) {
      return res.status(400).json({ 
        errors: [{ msg: 'You have already voted for this review' }] 
      });
    }
    
    // Increment helpful votes and add user to voters
    review.helpful_votes = review.helpful_votes + 1;
    review.helpful_voters.push(req.user.id);
    await review.save();
    
    res.json({ helpfulVotes: review.helpful_votes });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        errors: [{ msg: 'Review not found' }] 
      });
    }
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};
