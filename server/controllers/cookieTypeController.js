const CookieType = require('../models/CookieType');
const { validationResult } = require('express-validator');

// @desc    Get all cookie types
// @route   GET /api/cookie-types
// @access  Public
exports.getAllCookieTypes = async (req, res) => {
  try {
    const cookieTypes = await CookieType.find().sort({ name: 1 });
    res.json(cookieTypes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get cookie type by ID
// @route   GET /api/cookie-types/:id
// @access  Public
exports.getCookieTypeById = async (req, res) => {
  try {
    const cookieType = await CookieType.findById(req.params.id);
    
    if (!cookieType) {
      return res.status(404).json({ msg: 'Cookie type not found' });
    }
    
    res.json(cookieType);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cookie type not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a cookie type
// @route   POST /api/cookie-types
// @access  Private (Admin only)
exports.createCookieType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to create cookie types' });
    }
    
    const { name, description, icon } = req.body;
    
    // Check if cookie type already exists
    const existingType = await CookieType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ msg: 'Cookie type already exists' });
    }
    
    // Create new cookie type
    const newCookieType = new CookieType({
      name,
      description,
      icon
    });
    
    const cookieType = await newCookieType.save();
    
    res.json(cookieType);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a cookie type
// @route   PUT /api/cookie-types/:id
// @access  Private (Admin only)
exports.updateCookieType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to update cookie types' });
    }
    
    const cookieType = await CookieType.findById(req.params.id);
    
    if (!cookieType) {
      return res.status(404).json({ msg: 'Cookie type not found' });
    }
    
    const { name, description, icon } = req.body;
    
    // Update fields
    if (name) cookieType.name = name;
    if (description !== undefined) cookieType.description = description;
    if (icon !== undefined) cookieType.icon = icon;
    
    const updatedCookieType = await cookieType.save();
    
    res.json(updatedCookieType);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cookie type not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a cookie type
// @route   DELETE /api/cookie-types/:id
// @access  Private (Admin only)
exports.deleteCookieType = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to delete cookie types' });
    }
    
    const cookieType = await CookieType.findById(req.params.id);
    
    if (!cookieType) {
      return res.status(404).json({ msg: 'Cookie type not found' });
    }
    
    await cookieType.remove();
    
    res.json({ msg: 'Cookie type removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cookie type not found' });
    }
    res.status(500).send('Server error');
  }
};
