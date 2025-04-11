const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cookie_spot_id: {
    type: Schema.Types.ObjectId,
    ref: 'CookieSpot',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only favorite a cookie spot once
favoriteSchema.index({ user_id: 1, cookie_spot_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
