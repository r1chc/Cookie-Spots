const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cookieTypeSchema = new Schema({
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

module.exports = mongoose.model('CookieType', cookieTypeSchema);
