const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  is_public: {
    type: Boolean,
    default: false
  },
  cookie_spots: [
    {
      cookie_spot_id: {
        type: Schema.Types.ObjectId,
        ref: 'CookieSpot',
        required: true
      },
      order_index: {
        type: Number,
        default: 0
      },
      notes: {
        type: String,
        trim: true
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
