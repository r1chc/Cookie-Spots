const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getPopularPosts,
  searchBlogPosts,
  getPostsByCookieType,
  getPostsByDietaryOption,
  getPostsByLocation,
  getPostsByDate,
  generateNewPost,
  getBlogPostBySlug
} = require('../controllers/blogPostController');

// Schedule blog post generation (every Monday, Tuesday, Thursday at 9 AM)
cron.schedule('0 9 * * 1,2,4', async () => {
  try {
    await generateNewPost();
    console.log('Scheduled blog post generated successfully');
  } catch (error) {
    console.error('Failed to generate scheduled blog post:', error);
  }
});

// Public routes
router.get('/', getBlogPosts);
router.get('/popular', getPopularPosts);
router.get('/search', searchBlogPosts);
router.get('/cookie-type/:cookieType', getPostsByCookieType);
router.get('/dietary-option/:dietaryOption', getPostsByDietaryOption);
router.get('/location/:location', getPostsByLocation);
router.get('/date/:year/:month?', getPostsByDate);
router.get('/slug/:slug', getBlogPostBySlug);
router.get('/:id', getBlogPostById);

// Protected routes (require authentication)
router.post('/', auth, adminAuth, upload.single('image'), createBlogPost);
router.put('/:id', auth, adminAuth, upload.single('image'), updateBlogPost);
router.delete('/:id', auth, adminAuth, deleteBlogPost);

// Admin routes
router.post('/generate', auth, adminAuth, generateNewPost);

module.exports = router; 