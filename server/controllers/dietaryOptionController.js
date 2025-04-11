const DietaryOption = require('../models/DietaryOption');
const { validationResult } = require('express-validator');

// @desc    Get all dietary options
// @route   GET /api/dietary-options
// @access  Public
exports.getAllDietaryOptions = async (req, res) => {
  try {
    const dietaryOptions = await DietaryOption.find().sort({ name: 1 });
    res.json(dietaryOptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get dietary option by ID
// @route   GET /api/dietary-options/:id
// @access  Public
exports.getDietaryOptionById = async (req, res) => {
  try {
    const dietaryOption = await DietaryOption.findById(req.params.id);
    
    if (!dietaryOption) {
      return res.status(404).json({ msg: 'Dietary option not found' });
    }
    
    res.json(dietaryOption);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Dietary option not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a dietary option
// @route   POST /api/dietary-options
// @access  Private (Admin only)
exports.createDietaryOption = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to create dietary options' });
    }
    
    const { name, description, icon } = req.body;
    
    // Check if dietary option already exists
    const existingOption = await DietaryOption.findOne({ name });
    if (existingOption) {
      return res.status(400).json({ msg: 'Dietary option already exists' });
    }
    
    // Create new dietary option
    const newDietaryOption = new DietaryOption({
      name,
      description,
      icon
    });
    
    const dietaryOption = await newDietaryOption.save();
    
    res.json(dietaryOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a dietary option
// @route   PUT /api/dietary-options/:id
// @access  Private (Admin only)
exports.updateDietaryOption = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to update dietary options' });
    }
    
    const dietaryOption = await DietaryOption.findById(req.params.id);
    
    if (!dietaryOption) {
      return res.status(404).json({ msg: 'Dietary option not found' });
    }
    
    const { name, description, icon } = req.body;
    
    // Update fields
    if (name) dietaryOption.name = name;
    if (description !== undefined) dietaryOption.description = description;
    if (icon !== undefined) dietaryOption.icon = icon;
    
    const updatedDietaryOption = await dietaryOption.save();
    
    res.json(updatedDietaryOption);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Dietary option not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a dietary option
// @route   DELETE /api/dietary-options/:id
// @access  Private (Admin only)
exports.deleteDietaryOption = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(401).json({ msg: 'Not authorized to delete dietary options' });
    }
    
    const dietaryOption = await DietaryOption.findById(req.params.id);
    
    if (!dietaryOption) {
      return res.status(404).json({ msg: 'Dietary option not found' });
    }
    
    await dietaryOption.remove();
    
    res.json({ msg: 'Dietary option removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Dietary option not found' });
    }
    res.status(500).send('Server error');
  }
};
