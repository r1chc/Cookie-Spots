// server/routes/externalApiRoutes.js

const express = require('express');
const router = express.Router();
const externalApiController = require('../controllers/externalApiController');

// @route   POST /api/external/all-sources
// @desc    Fetch cookie spots from Google Places API
// @access  Public
router.post('/all-sources', externalApiController.fetchAllSources);

module.exports = router;