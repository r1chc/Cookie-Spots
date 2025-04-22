const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    cookieTypes: [{
      type: String,
      trim: true
    }],
    dietaryOptions: [{
      type: String,
      trim: true,
      enum: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'sugar-free']
    }],
    locations: [{
      type: String,
      trim: true
    }],
    themes: [{
      type: String,
      trim: true
    }]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

// Add indexes for efficient querying
blogPostSchema.index({ 'tags.cookieTypes': 1 });
blogPostSchema.index({ 'tags.dietaryOptions': 1 });
blogPostSchema.index({ 'tags.locations': 1 });
blogPostSchema.index({ 'tags.themes': 1 });
blogPostSchema.index({ publishDate: -1 });
blogPostSchema.index({ views: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost; 