const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const commentController = require('../controllers/commentController');
const { auth } = require('../middleware/auth');

// @route   GET /api/comments/:postId
// @desc    Get comments for a blog post
// @access  Public
router.get('/:postId', commentController.getCommentsByPost);

// @route   POST /api/comments
// @desc    Create a comment
// @access  Private
router.post('/', auth,
  check('post_id', 'Post ID is required').notEmpty(),
  check('content', 'Content is required').notEmpty(),
  commentController.createComment
);

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth,
  check('content', 'Content cannot be empty').notEmpty(),
  commentController.updateComment
);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router; 