const Photo = require('../models/Photo');
const CookieSpot = require('../models/CookieSpot');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filter for image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Set up multer upload
exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Get all photos for a cookie spot
// @route   GET /api/photos/cookie-spot/:cookieSpotId
// @access  Public
exports.getPhotosByCookieSpot = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const photos = await Photo.find({ 
      cookie_spot_id: req.params.cookieSpotId,
      status: 'approved'
    })
      .sort({ is_primary: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('user_id', 'username profile_image');
    
    const total = await Photo.countDocuments({ 
      cookie_spot_id: req.params.cookieSpotId,
      status: 'approved'
    });
    
    res.json({
      photos,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all photos by a user
// @route   GET /api/photos/user/:userId
// @access  Public
exports.getPhotosByUser = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const photos = await Photo.find({ 
      user_id: req.params.userId,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('cookie_spot_id', 'name city state_province');
    
    const total = await Photo.countDocuments({ 
      user_id: req.params.userId,
      status: 'approved'
    });
    
    res.json({
      photos,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Upload a photo
// @route   POST /api/photos
// @access  Private
exports.uploadPhoto = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload an image file' });
    }
    
    const { cookie_spot_id, caption, is_primary } = req.body;
    
    // Check if cookie spot exists
    const cookieSpot = await CookieSpot.findById(cookie_spot_id);
    if (!cookieSpot) {
      // Remove uploaded file if cookie spot doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ msg: 'Cookie spot not found' });
    }
    
    // Create new photo
    const newPhoto = new Photo({
      cookie_spot_id,
      user_id: req.user.id,
      file_path: `/uploads/${req.file.filename}`,
      caption,
      is_primary: is_primary === 'true',
      status: 'approved' // Could be set to 'pending' if moderation is needed
    });
    
    // If this is set as primary, unset any existing primary photos
    if (newPhoto.is_primary) {
      await Photo.updateMany(
        { cookie_spot_id, is_primary: true },
        { is_primary: false }
      );
    }
    
    const photo = await newPhoto.save();
    
    res.json(photo);
  } catch (err) {
    console.error(err.message);
    // Remove uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send('Server error');
  }
};

// @desc    Update a photo
// @route   PUT /api/photos/:id
// @access  Private
exports.updatePhoto = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    
    // Check ownership
    if (photo.user_id.toString() !== req.user.id && !req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to update this photo' });
    }
    
    const { caption, is_primary } = req.body;
    
    // Update fields
    if (caption !== undefined) photo.caption = caption;
    
    // Handle primary status
    if (is_primary !== undefined) {
      const newIsPrimary = is_primary === 'true' || is_primary === true;
      
      // If setting as primary, unset any existing primary photos
      if (newIsPrimary && !photo.is_primary) {
        await Photo.updateMany(
          { cookie_spot_id: photo.cookie_spot_id, is_primary: true },
          { is_primary: false }
        );
      }
      
      photo.is_primary = newIsPrimary;
    }
    
    const updatedPhoto = await photo.save();
    
    res.json(updatedPhoto);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a photo
// @route   DELETE /api/photos/:id
// @access  Private
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    
    // Check ownership
    if (photo.user_id.toString() !== req.user.id && !req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to delete this photo' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', photo.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await photo.remove();
    
    res.json({ msg: 'Photo removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    res.status(500).send('Server error');
  }
};
