require('dotenv').config();
const OpenAI = require('openai');
const mongoose = require('mongoose');
const cron = require('node-cron');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Article Schema
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  tags: [String],
  image: String,
  publishedAt: { type: Date, default: Date.now },
  isAIGenerated: { type: Boolean, default: true }
});

const Article = mongoose.model('Article', articleSchema);

// Cookie categories and themes
const categories = [
  'Chocolate',
  'Gluten-Free',
  'No-Bake',
  'Vegan',
  'Classic',
  'Specialty',
  'Seasonal',
  'Healthy'
];

// Function to generate an article using OpenAI
async function generateArticle() {
  try {
    // Select a random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Generate article content
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional baker and food writer specializing in cookies. Write engaging, informative articles about cookies with a focus on recipes, techniques, and baking tips."
        },
        {
          role: "user",
          content: `Write a detailed article about ${category} cookies. Include:
          1. An engaging introduction
          2. A brief history or background
          3. Key ingredients and their importance
          4. Step-by-step recipe instructions
          5. Tips and tricks for perfect results
          6. Variations or creative ideas
          7. Storage and serving suggestions
          
          Make it informative, engaging, and easy to follow.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Generate an image prompt
    const imagePrompt = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Generate a detailed prompt for DALL-E to create a beautiful cookie image."
        },
        {
          role: "user",
          content: `Create a detailed prompt for a professional food photography image of ${category} cookies. Include lighting, composition, and styling details.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    // Generate image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt.choices[0].message.content,
      n: 1,
      size: "1024x1024"
    });

    // Create new article
    const newArticle = new Article({
      title: `The Ultimate Guide to ${category} Cookies`,
      content: completion.choices[0].message.content,
      category: category,
      tags: [category.toLowerCase(), 'cookies', 'baking', 'recipe'],
      image: imageResponse.data[0].url,
      isAIGenerated: true
    });

    // Save to database
    await newArticle.save();
    console.log('New article generated and saved successfully!');

  } catch (error) {
    console.error('Error generating article:', error);
  }
}

// Schedule article generation every week (Sunday at 8 AM)
cron.schedule('0 8 * * 0', () => {
  console.log('Starting weekly article generation...');
  generateArticle();
});

// For testing: run immediately
// generateArticle(); 