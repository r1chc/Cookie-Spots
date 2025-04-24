import { useState, useEffect } from 'react';
import { mockArticles } from '../data/mockArticles';

const VIEWS_STORAGE_KEY = 'article_views';
const LAST_VIEW_STORAGE_KEY = 'last_article_views';

const useArticleViews = (articleId) => {
  const [views, setViews] = useState(() => {
    // Get initial views from mock data
    const article = mockArticles.find(a => a.id === articleId);
    return article ? article.views : 0;
  });

  // Load additional views from localStorage on mount
  useEffect(() => {
    const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
    const viewsData = storedViews ? JSON.parse(storedViews) : {};
    const additionalViews = viewsData[articleId] || 0;
    
    // Get base views from mock data
    const article = mockArticles.find(a => a.id === articleId);
    const baseViews = article ? article.views : 0;
    
    // Set total views (base + additional)
    setViews(baseViews + additionalViews);
  }, [articleId]);

  // Track article view
  useEffect(() => {
    const lastViewsData = localStorage.getItem(LAST_VIEW_STORAGE_KEY);
    const lastViews = lastViewsData ? JSON.parse(lastViewsData) : {};
    const lastViewTime = lastViews[articleId] || 0;
    const now = Date.now();

    // Only count a view if it's been more than 30 minutes since last view
    if (now - lastViewTime > 30 * 60 * 1000) {
      const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
      const viewsData = storedViews ? JSON.parse(storedViews) : {};
      
      // Increment additional views
      const newAdditionalViews = (viewsData[articleId] || 0) + 1;
      viewsData[articleId] = newAdditionalViews;
      
      // Update last view time
      lastViews[articleId] = now;
      
      // Save to localStorage
      localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(viewsData));
      localStorage.setItem(LAST_VIEW_STORAGE_KEY, JSON.stringify(lastViews));
      
      // Get base views from mock data
      const article = mockArticles.find(a => a.id === articleId);
      const baseViews = article ? article.views : 0;
      
      // Update state with total views (base + additional)
      const totalViews = baseViews + newAdditionalViews;
      setViews(totalViews);

      // Dispatch event for other components to update
      window.dispatchEvent(new CustomEvent('articleViewsUpdated', {
        detail: { articleId, views: totalViews }
      }));
    }
  }, [articleId]);

  return views;
};

export default useArticleViews; 