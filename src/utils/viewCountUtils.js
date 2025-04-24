import { mockArticles } from '../data/mockArticles';

const VIEWS_STORAGE_KEY = 'article_views';

/**
 * Gets the current total view count for an article
 * @param {number} articleId - The ID of the article
 * @returns {number} The total view count (base + additional)
 */
export const getArticleViewCount = (articleId) => {
  // Get base views from mock data
  const article = mockArticles.find(a => a.id === articleId);
  const baseViews = article ? article.views : 0;
  
  // Get additional views from localStorage
  const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
  const viewsData = storedViews ? JSON.parse(storedViews) : {};
  const additionalViews = viewsData[articleId] || 0;
  
  // Return total views
  return baseViews + additionalViews;
};

/**
 * Increments the view count for an article
 * @param {number} articleId - The ID of the article
 * @returns {number} The new total view count
 */
export const incrementArticleViewCount = (articleId) => {
  // Get current stored views
  const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
  const viewsData = storedViews ? JSON.parse(storedViews) : {};
  
  // Increment additional views
  const newAdditionalViews = (viewsData[articleId] || 0) + 1;
  viewsData[articleId] = newAdditionalViews;
  
  // Save to localStorage
  localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(viewsData));
  
  // Get base views
  const article = mockArticles.find(a => a.id === articleId);
  const baseViews = article ? article.views : 0;
  
  // Calculate and return total views
  const totalViews = baseViews + newAdditionalViews;
  
  // Dispatch event for other components to update
  window.dispatchEvent(new CustomEvent('articleViewsUpdated', {
    detail: { articleId, views: totalViews }
  }));
  
  return totalViews;
};

/**
 * Gets all articles with updated view counts
 * @returns {Array} Array of articles with updated view counts
 */
export const getArticlesWithUpdatedViewCounts = () => {
  const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
  const viewsData = storedViews ? JSON.parse(storedViews) : {};
  
  return mockArticles.map(article => {
    const additionalViews = viewsData[article.id] || 0;
    return {
      ...article,
      views: article.views + additionalViews
    };
  });
}; 