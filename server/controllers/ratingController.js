const Rating = require('../models/Rating');
const BlogPost = require('../models/BlogPost');
const { validationResult } = require('express-validator');

// @desc    Get ratings for a blog post
// @route   GET /api/ratings/post/:postId
// @access  Public
exports.getRatingsByPost = async (req, res) => {
  try {
    const ratings = await Rating.find({ post_id: req.params.postId })
      .populate('user_id', 'name')
      .sort({ created_at: -1 });

    // Calculate average rating
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    res.json({
      ratings,
      averageRating: averageRating || 0,
      totalRatings: ratings.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create or update a rating
// @route   POST /api/ratings
// @access  Private
exports.createOrUpdateRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { post_id, rating } = req.body;

    // Check if post exists
    const post = await BlogPost.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already rated this post
    let existingRating = await Rating.findOne({
      post_id,
      user_id: req.user.id
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      await existingRating.save();
      return res.json(existingRating);
    }

    // Create new rating
    const newRating = new Rating({
      post_id,
      user_id: req.user.id,
      rating
    });

    await newRating.save();
    res.json(newRating);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns the rating
    if (rating.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await rating.remove();
    res.json({ message: 'Rating removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
}; 