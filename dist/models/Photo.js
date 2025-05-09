const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
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
  file_path: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    trim: true
  },
  is_primary: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema);
