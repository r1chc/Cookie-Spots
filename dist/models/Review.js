const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  cookie_spot_id: {
    type: Schema.Types.ObjectId,
    ref: 'CookieSpot',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  visit_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['published', 'pending', 'rejected'],
    default: 'published'
  },
  helpful_votes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only review a cookie spot once
reviewSchema.index({ cookie_spot_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
