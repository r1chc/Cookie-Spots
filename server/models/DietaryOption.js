const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dietaryOptionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DietaryOption', dietaryOptionSchema);
