const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const dietaryOptionController = require('../controllers/dietaryOptionController');
const auth = require('../middleware/auth');

// @route   GET /api/dietary-options
// @desc    Get all dietary options
// @access  Public
router.get('/', dietaryOptionController.getAllDietaryOptions);

// @route   GET /api/dietary-options/:id
// @desc    Get dietary option by ID
// @access  Public
router.get('/:id', dietaryOptionController.getDietaryOptionById);

// @route   POST /api/dietary-options
// @desc    Create a dietary option
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description cannot be empty').optional().not().isEmpty()
    ]
  ],
  dietaryOptionController.createDietaryOption
);

// @route   PUT /api/dietary-options/:id
// @desc    Update a dietary option
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name cannot be empty').optional().not().isEmpty(),
      check('description', 'Description cannot be empty').optional().not().isEmpty()
    ]
  ],
  dietaryOptionController.updateDietaryOption
);

// @route   DELETE /api/dietary-options/:id
// @desc    Delete a dietary option
// @access  Private (Admin only)
router.delete('/:id', auth, dietaryOptionController.deleteDietaryOption);

module.exports = router;
