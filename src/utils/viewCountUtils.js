import { mockArticles } from '../data/mockArticles';

const VIEWS_STORAGE_KEY = 'article_views';
const SESSION_VIEWED_KEY = 'article_viewed_session';

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
 * Checks if an article has already been viewed in this session
 * @param {number} articleId - The ID of the article
 * @returns {boolean} Whether the article has been viewed already
 */
const hasArticleBeenViewedInSession = (articleId) => {
  const sessionViewed = sessionStorage.getItem(SESSION_VIEWED_KEY);
  const viewedArticles = sessionViewed ? JSON.parse(sessionViewed) : [];
  return viewedArticles.includes(articleId);
};

/**
 * Marks an article as viewed in this session
 * @param {number} articleId - The ID of the article
 */
const markArticleAsViewedInSession = (articleId) => {
  const sessionViewed = sessionStorage.getItem(SESSION_VIEWED_KEY);
  const viewedArticles = sessionViewed ? JSON.parse(sessionViewed) : [];
  if (!viewedArticles.includes(articleId)) {
    viewedArticles.push(articleId);
    sessionStorage.setItem(SESSION_VIEWED_KEY, JSON.stringify(viewedArticles));
  }
};

/**
 * Increments the view count for an article if it hasn't been viewed in this session
 * @param {number} articleId - The ID of the article
 * @returns {number} The new total view count
 */
export const incrementArticleViewCount = (articleId) => {
  // Check if article has already been viewed in this session
  if (hasArticleBeenViewedInSession(articleId)) {
    // Article already viewed, just return current count
    return getArticleViewCount(articleId);
  }
  
  // Mark as viewed in this session
  markArticleAsViewedInSession(articleId);
  
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
  
  console.log(`Incremented view count for article ${articleId} to ${totalViews}`);
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