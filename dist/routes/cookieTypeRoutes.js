const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const cookieTypeController = require('../controllers/cookieTypeController');
const { auth } = require('../middleware/auth');

// @route   GET /api/cookie-types
// @desc    Get all cookie types
// @access  Public
router.get('/', cookieTypeController.getAllCookieTypes);

// @route   GET /api/cookie-types/:id
// @desc    Get cookie type by ID
// @access  Public
router.get('/:id', cookieTypeController.getCookieTypeById);

// @route   POST /api/cookie-types
// @desc    Create a new cookie type
// @access  Private
router.post('/', auth,
  check('name', 'Name is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  cookieTypeController.createCookieType
);

// @route   PUT /api/cookie-types/:id
// @desc    Update a cookie type
// @access  Private
router.put('/:id', auth,
  check('name', 'Name cannot be empty').optional().notEmpty(),
  check('description', 'Description cannot be empty').optional().notEmpty(),
  cookieTypeController.updateCookieType
);

// @route   DELETE /api/cookie-types/:id
// @desc    Delete a cookie type
// @access  Private
router.delete('/:id', auth, cookieTypeController.deleteCookieType);

module.exports = router;
