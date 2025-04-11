const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const cookieTypeController = require('../controllers/cookieTypeController');
const auth = require('../middleware/auth');

// @route   GET /api/cookie-types
// @desc    Get all cookie types
// @access  Public
router.get('/', cookieTypeController.getAllCookieTypes);

// @route   GET /api/cookie-types/:id
// @desc    Get cookie type by ID
// @access  Public
router.get('/:id', cookieTypeController.getCookieTypeById);

// @route   POST /api/cookie-types
// @desc    Create a cookie type
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
  cookieTypeController.createCookieType
);

// @route   PUT /api/cookie-types/:id
// @desc    Update a cookie type
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
  cookieTypeController.updateCookieType
);

// @route   DELETE /api/cookie-types/:id
// @desc    Delete a cookie type
// @access  Private (Admin only)
router.delete('/:id', auth, cookieTypeController.deleteCookieType);

module.exports = router;
