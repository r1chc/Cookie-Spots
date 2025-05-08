/**
 * Utility functions for working with categories throughout the site
 */

/**
 * Determines if an article belongs to a specific category
 * @param {Object} article - The article object
 * @param {String} categoryName - The category name to check
 * @returns {Boolean} - Whether the article belongs to the category
 */
export const isArticleInCategory = (article, categoryName) => {
  if (!article || !categoryName) return false;
  
  const categoryNameLower = categoryName.toLowerCase();
  
  // Exact category match is highest priority
  if (article.category && article.category.toLowerCase() === categoryNameLower) {
    return true;
  }
  
  // Tag match is second priority (exact match)
  if (article.tags && article.tags.some(tag => tag.toLowerCase() === categoryNameLower)) {
    return true;
  }
  
  // For special categories that might not have exact matches:
  // Check for partial matches in category or tags as fallback
  if (categoryNameLower === 'sweet & salty' || 
      categoryNameLower === 'international' ||
      categoryNameLower === 'fruit') {
    
    // Category partial match
    if (article.category && article.category.toLowerCase().includes(categoryNameLower)) {
      return true;
    }
    
    // Tags contain match
    if (article.tags && article.tags.some(tag => 
      tag.toLowerCase().includes(categoryNameLower) || 
      // Handle specific cases like fruits
      (categoryNameLower === 'fruit' && 
        ['blueberry', 'cranberry', 'raspberry', 'strawberry', 'lemon', 'orange', 
        'apple', 'cherry', 'apricot', 'citrus', 'banana'].some(fruit => 
          tag.toLowerCase().includes(fruit)
        )
      ) ||
      // Handle international keywords
      (categoryNameLower === 'international' && 
        ['italian', 'french', 'mexican', 'asian', 'indian', 'german', 
        'middle eastern', 'japanese', 'chinese', 'greek'].some(origin => 
          tag.toLowerCase().includes(origin)
        )
      ) ||
      // Handle sweet & salty keywords
      (categoryNameLower === 'sweet & salty' && 
        ['salty', 'pretzel', 'caramel', 'sea salt', 'bacon', 'potato chip'].some(flavor => 
          tag.toLowerCase().includes(flavor)
        )
      )
    )) {
      return true;
    }
  }
  
  return false;
};

/**
 * Filters an array of articles to only those in a specific category
 * @param {Array} articles - Array of article objects
 * @param {String} categoryName - Category name to filter by
 * @returns {Array} - Filtered array of articles
 */
export const filterArticlesByCategory = (articles, categoryName) => {
  if (!articles || !Array.isArray(articles) || !categoryName) return [];
  
  return articles.filter(article => isArticleInCategory(article, categoryName));
};

/**
 * Counts how many articles belong to each category
 * @param {Array} articles - Array of article objects
 * @param {Array} categories - Array of category objects with 'name' property
 * @returns {Object} - Object with category names as keys and counts as values
 */
export const getCategoryCounts = (articles, categories) => {
  if (!articles || !categories) return {};
  
  const counts = {};
  categories.forEach(category => {
    counts[category.name] = filterArticlesByCategory(articles, category.name).length;
  });
  
  return counts;
}; 