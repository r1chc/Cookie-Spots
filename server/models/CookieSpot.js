const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cookieSpotSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state_province: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'USA'
  },
  postal_code: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  hours_of_operation: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  price_range: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  has_dine_in: {
    type: Boolean,
    default: false
  },
  has_takeout: {
    type: Boolean,
    default: true
  },
  has_delivery: {
    type: Boolean,
    default: false
  },
  is_wheelchair_accessible: {
    type: Boolean,
    default: false
  },
  accepts_credit_cards: {
    type: Boolean,
    default: true
  },
  cookie_types: [{
    type: Schema.Types.ObjectId,
    ref: 'CookieType'
  }],
  dietary_options: [{
    type: Schema.Types.ObjectId,
    ref: 'DietaryOption'
  }],
  features: [String],
  added_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'closed', 'reported'],
    default: 'pending'
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  review_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for geospatial queries
cookieSpotSchema.index({ location: '2dsphere' });

// Create index for text search
cookieSpotSchema.index({ 
  name: 'text', 
  description: 'text',
  city: 'text',
  state_province: 'text'
});

module.exports = mongoose.model('CookieSpot', cookieSpotSchema);
