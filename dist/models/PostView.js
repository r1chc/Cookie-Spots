const mongoose = require('mongoose');

const postViewSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  viewedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Create compound index for efficient querying
postViewSchema.index({ postId: 1, sessionId: 1, viewedAt: 1 });

// Automatically remove old view records after 30 days
postViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('PostView', postViewSchema); 