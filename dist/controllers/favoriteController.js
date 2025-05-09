const Favorite = require('../models/Favorite');
const CookieSpot = require('../models/CookieSpot');
const { validationResult } = require('express-validator');

// @desc    Get all favorites for a user
// @route   GET /api/favorites
// @access  Private
exports.getUserFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const favorites = await Favorite.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate({
        path: 'cookie_spot_id',
        select: 'name address city state_province average_rating review_count',
        populate: [
          { path: 'cookie_types', select: 'name' },
          { path: 'dietary_options', select: 'name' }
        ]
      });
    
    const total = await Favorite.countDocuments({ user_id: req.user.id });
    
    // Get the first photo for each cookie spot
    const favoritesWithPhotos = await Promise.all(
      favorites.map(async (favorite) => {
        const photo = await Photo.findOne({
          cookie_spot_id: favorite.cookie_spot_id._id,
          status: 'approved'
        }).sort({ is_primary: -1, createdAt: -1 });
        
        return {
          ...favorite._doc,
          photo: photo ? photo.file_path : null
        };
      })
    );
    
    res.json({
      favorites: favoritesWithPhotos,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Check if a cookie spot is favorited by the user
// @route   GET /api/favorites/check/:cookieSpotId
// @access  Private
exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user_id: req.user.id,
      cookie_spot_id: req.params.cookieSpotId
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Add a cookie spot to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cookie_spot_id } = req.body;
    
    // Check if cookie spot exists
    const cookieSpot = await CookieSpot.findById(cookie_spot_id);
    if (!cookieSpot) {
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user_id: req.user.id,
      cookie_spot_id
    });
    
    if (existingFavorite) {
      return res.status(400).json({ msg: 'Cookie spot already in favorites' });
    }
    
    // Create new favorite
    const newFavorite = new Favorite({
      user_id: req.user.id,
      cookie_spot_id
    });
    
    const favorite = await newFavorite.save();
    
    res.json(favorite);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Remove a cookie spot from favorites
// @route   DELETE /api/favorites/:cookieSpotId
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user_id: req.user.id,
      cookie_spot_id: req.params.cookieSpotId
    });
    
    if (!favorite) {
      return res.status(404).json({ msg: 'Favorite not found' });
    }
    
    await favorite.remove();
    
    res.json({ msg: 'Cookie spot removed from favorites' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
