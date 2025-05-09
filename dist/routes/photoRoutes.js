const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const photoController = require('../controllers/photoController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/photos/cookie-spot/:cookieSpotId
// @desc    Get all photos for a cookie spot
// @access  Public
router.get('/cookie-spot/:cookieSpotId', photoController.getPhotosByCookieSpot);

// @route   GET /api/photos/user/:userId
// @desc    Get all photos by a user
// @access  Public
router.get('/user/:userId', photoController.getPhotosByUser);

// @route   POST /api/photos
// @desc    Upload a photo
// @access  Private
router.post('/', auth, upload.single('photo'),
  check('cookie_spot_id', 'Cookie spot ID is required').not().isEmpty(),
  check('caption', 'Caption cannot be empty').optional().not().isEmpty(),
  photoController.uploadPhoto
);

// @route   PUT /api/photos/:id
// @desc    Update a photo
// @access  Private
router.put('/:id', auth,
  check('caption', 'Caption cannot be empty').optional().not().isEmpty(),
  photoController.updatePhoto
);

// @route   DELETE /api/photos/:id
// @desc    Delete a photo
// @access  Private
router.delete('/:id', auth, photoController.deletePhoto);

module.exports = router;
