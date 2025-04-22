const BlogPost = require('../models/BlogPost');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cookie types and themes for variety
const cookieTypes = [
  'Chocolate chip', 'Sugar', 'Oatmeal', 'Peanut butter', 'Shortbread', 
  'Snickerdoodle', 'Macarons', 'Biscotti', 'Gingerbread', 'Thumbprint',
  'Black and white', 'Fortune', 'Spritz', 'Meringue', 'Crinkle',
  'Molasses', 'Sandwich', 'Butter', 'Lemon', 'Almond'
];

const themes = [
  'Seasonal', 'Holiday', 'Gluten-free', 'Vegan', 'Low-sugar',
  'International', 'Classic with a twist', 'No-bake', 'Healthy',
  'Kid-friendly', 'Gourmet', 'Quick and easy', 'Unique ingredients'
];

// Generate a unique combination so we don't repeat recipes too soon
let recentCombinations = [];

function getUniqueCookieAndTheme() {
  let cookieType, theme, combination;
  
  do {
    cookieType = cookieTypes[Math.floor(Math.random() * cookieTypes.length)];
    theme = themes[Math.floor(Math.random() * themes.length)];
    combination = `${cookieType}-${theme}`;
  } while (recentCombinations.includes(combination));
  
  // Add to recent combinations and maintain list at max 10 items
  recentCombinations.push(combination);
  if (recentCombinations.length > 10) {
    recentCombinations.shift();
  }
  
  return { cookieType, theme };
}

// Generate a blog post using AI
async function generateBlogPost() {
  try {
    // Get unique cookie type and theme combination
    const { cookieType, theme } = getUniqueCookieAndTheme();
    
    console.log(`Generating post about ${cookieType} cookies with ${theme} theme...`);
    
    // Generate the blog post content with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional food blogger specializing in cookie recipes. Write engaging, detailed content with a friendly, enthusiastic tone. Include personal stories, tips, and make the content appealing and informative."
        },
        {
          role: "user",
          content: `Create a blog post about ${cookieType} cookies with a ${theme} twist. Include: 
          1. An engaging title that would perform well on social media
          2. A personal story introduction (2 paragraphs)
          3. A list of ingredients with precise measurements
          4. Step-by-step instructions that are clear and detailed
          5. Tips for success that address common pitfalls
          6. Serving suggestions and possible variations
          Format the response as JSON with the following structure:
          {
            "title": "Post title here",
            "intro": "Introduction paragraphs here",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": ["step 1", "step 2", ...],
            "tips": "Tips paragraph here",
            "serving": "Serving suggestions here",
            "tags": ["tag1", "tag2", ...]
          }`
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    // Parse the JSON response
    const postContent = JSON.parse(completion.choices[0].message.content);
    
    // Format the content for the blog with HTML
    const formattedContent = `
      <div class="blog-post-content">
        <div class="intro">
          ${postContent.intro}
        </div>
        
        <div class="recipe-card">
          <div class="recipe-header">
            <div class="recipe-meta">
              <div class="recipe-meta-item">
                <span class="recipe-meta-label">Prep Time</span>
                <span class="recipe-meta-value">${Math.floor(Math.random() * 20) + 10} mins</span>
              </div>
              <div class="recipe-meta-item">
                <span class="recipe-meta-label">Cook Time</span>
                <span class="recipe-meta-value">${Math.floor(Math.random() * 15) + 5} mins</span>
              </div>
              <div class="recipe-meta-item">
                <span class="recipe-meta-label">Difficulty</span>
                <span class="recipe-meta-value">${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}</span>
              </div>
            </div>
          </div>
          
          <div class="recipe-sections">
            <div class="recipe-section">
              <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
              <ul class="ingredients-list">
                ${postContent.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
              </ul>
            </div>
            
            <div class="recipe-section">
              <h3><i class="fas fa-utensils"></i> Instructions</h3>
              <ol class="instructions-list">
                ${postContent.instructions.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
            
            <div class="recipe-tips">
              <h3><i class="fas fa-lightbulb"></i> Tips for Success</h3>
              <p>${postContent.tips}</p>
            </div>
          </div>
        </div>
        
        <div class="serving-suggestions">
          <h3>Serving Suggestions</h3>
          <p>${postContent.serving}</p>
        </div>
      </div>
    `;

    // Create image URL placeholder
    const imageUrl = `/api/placeholder/800/500?text=${encodeURIComponent(postContent.title)}`;
    
    // Add additional tags based on the content
    const additionalTags = [];
    const lowerContent = JSON.stringify(postContent).toLowerCase();
    
    if (lowerContent.includes('chocolate')) additionalTags.push('Chocolate');
    if (lowerContent.includes('nuts') || lowerContent.includes('pecan') || lowerContent.includes('almond')) additionalTags.push('Nuts');
    if (lowerContent.includes('quick') || lowerContent.includes('fast') || lowerContent.includes('easy')) additionalTags.push('Quick');
    if (lowerContent.includes('kids')) additionalTags.push('Kids');
    if (lowerContent.includes('holiday') || lowerContent.includes('christmas') || lowerContent.includes('halloween')) additionalTags.push('Holiday');
    
    // Combine explicit tags with additional tags
    const allTags = [...postContent.tags];
    allTags.push(cookieType, theme);
    additionalTags.forEach(tag => {
      if (!allTags.includes(tag)) allTags.push(tag);
    });
    
    // Create difficulty level based on number of ingredients and steps
    let difficultyLevel = 'Easy';
    if (postContent.ingredients.length > 10 || postContent.instructions.length > 8) {
      difficultyLevel = 'Medium';
    }
    if (postContent.ingredients.length > 15 || postContent.instructions.length > 12) {
      difficultyLevel = 'Hard';
    }
    
    // Create a new blog post
    const newPost = new BlogPost({
      title: postContent.title,
      content: formattedContent,
      imageUrl: imageUrl,
      tags: allTags,
      publishDate: new Date(),
      ingredients: postContent.ingredients,
      instructions: postContent.instructions,
      prepTime: Math.floor(Math.random() * 20) + 10,
      cookTime: Math.floor(Math.random() * 15) + 5,
      difficultyLevel: difficultyLevel,
      published: true
    });
    
    // Save to database
    await newPost.save();
    console.log(`New blog post created: ${postContent.title}`);
    return newPost;
  } catch (error) {
    console.error('Error generating blog post:', error);
    return null;
  }
}

// Get all blog posts with pagination and filtering
const getBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = { published: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    if (req.query.difficulty) {
      query.difficultyLevel = req.query.difficulty;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    const posts = await BlogPost.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await BlogPost.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalPosts: total
    });
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

// Get a single blog post by ID
const getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
};

// Get most viewed posts
const getMostViewedPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({ published: true })
      .sort({ views: -1 })
      .skip(skip)
      .limit(limit)
      .select('title imageUrl excerpt views publishDate');

    const total = await BlogPost.countDocuments({ published: true });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Failed to get most viewed posts:', error);
    res.status(500).json({ error: 'Failed to get most viewed posts' });
  }
};

// Create a new blog post
const createBlogPost = async (req, res) => {
  try {
    const { title, content, category, tags, ingredients, instructions, prepTime, cookTime, difficultyLevel } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const newPost = new BlogPost({
      title,
      content,
      imageUrl,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      ingredients: ingredients.split('\n').map(ing => ing.trim()),
      instructions: instructions.split('\n').map(step => step.trim()),
      prepTime,
      cookTime,
      difficultyLevel,
      author: req.user._id,
      published: true,
      views: 0 // Initialize views to 0
    });
    
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Failed to create blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

// Update a blog post
const updateBlogPost = async (req, res) => {
  try {
    const { title, content, category, tags, ingredients, instructions, prepTime, cookTime, difficultyLevel } = req.body;
    
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    
    // Update fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    post.ingredients = ingredients ? ingredients.split('\n').map(ing => ing.trim()) : post.ingredients;
    post.instructions = instructions ? instructions.split('\n').map(step => step.trim()) : post.instructions;
    post.prepTime = prepTime || post.prepTime;
    post.cookTime = cookTime || post.cookTime;
    post.difficultyLevel = difficultyLevel || post.difficultyLevel;
    
    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (post.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', post.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      post.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Failed to update blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

// Delete a blog post
const deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    // Delete associated image if exists
    if (post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

// Get popular posts
const getPopularPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await BlogPost.find({ published: true })
      .sort({ views: -1 })
      .limit(limit)
      .select('title excerpt imageUrl views publishDate');

    res.json(posts);
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    res.status(500).json({ message: 'Error fetching popular posts' });
  }
};

// Get posts by cookie type
const getPostsByCookieType = async (req, res) => {
  try {
    const { cookieType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({
      'tags.cookieTypes': cookieType
    })
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);

    const total = await BlogPost.countDocuments({
      'tags.cookieTypes': cookieType
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts by cookie type:', error);
    res.status(500).json({ message: 'Error fetching posts by cookie type' });
  }
};

// Get posts by dietary option
const getPostsByDietaryOption = async (req, res) => {
  try {
    const { dietaryOption } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({
      'tags.dietaryOptions': dietaryOption
    })
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);

    const total = await BlogPost.countDocuments({
      'tags.dietaryOptions': dietaryOption
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts by dietary option:', error);
    res.status(500).json({ message: 'Error fetching posts by dietary option' });
  }
};

// Get posts by location
const getPostsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({
      'tags.locations': location
    })
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);

    const total = await BlogPost.countDocuments({
      'tags.locations': location
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts by location:', error);
    res.status(500).json({ message: 'Error fetching posts by location' });
  }
};

// Get posts by year and month
const getPostsByDate = async (req, res) => {
  try {
    const { year, month } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const startDate = new Date(year, month ? month - 1 : 0, 1);
    const endDate = new Date(year, month ? month : 12, 0);

    const posts = await BlogPost.find({
      publishDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);

    const total = await BlogPost.countDocuments({
      publishDate: {
        $gte: startDate,
        $lte: endDate
      }
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts by date:', error);
    res.status(500).json({ message: 'Error fetching posts by date' });
  }
};

// Enhanced search function
const searchBlogPosts = async (req, res) => {
  try {
    const { query, cookieType, dietaryOption, location, year, month } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let searchQuery = {};

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Filter by cookie type
    if (cookieType) {
      searchQuery['tags.cookieTypes'] = cookieType;
    }

    // Filter by dietary option
    if (dietaryOption) {
      searchQuery['tags.dietaryOptions'] = dietaryOption;
    }

    // Filter by location
    if (location) {
      searchQuery['tags.locations'] = location;
    }

    // Filter by date
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = new Date(year, month ? month : 12, 0);
      searchQuery.publishDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const posts = await BlogPost.find(searchQuery)
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(searchQuery);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Error searching posts' });
  }
};

// Generate a new blog post
const generateNewPost = async (req, res) => {
  try {
    const post = await generateBlogPost();
    if (!post) {
      return res.status(500).json({ error: 'Failed to generate blog post' });
    }
    res.json({ success: true, post });
  } catch (error) {
    console.error('Failed to generate blog post:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
};

module.exports = {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getMostViewedPosts,
  getPopularPosts,
  getPostsByCookieType,
  getPostsByDietaryOption,
  getPostsByLocation,
  getPostsByDate,
  searchBlogPosts,
  generateBlogPost,
  generateNewPost
}; 