import { useState, useEffect } from 'react';
import { getArticleViewCount, incrementArticleViewCount } from '../utils/viewCountUtils';

const useArticleViews = (articleId) => {
  const [views, setViews] = useState(() => {
    // Get initial views using the utility function
    return getArticleViewCount(articleId);
  });

  // Update views when articleId changes
  useEffect(() => {
    // Set initial view count
    setViews(getArticleViewCount(articleId));
    
    // Listen for updates from other components
    const handleViewsUpdate = (e) => {
      const { articleId: updatedId, views: updatedViews } = e.detail;
      if (updatedId === articleId) {
        setViews(updatedViews);
      }
    };
    
    window.addEventListener('articleViewsUpdated', handleViewsUpdate);
    return () => {
      window.removeEventListener('articleViewsUpdated', handleViewsUpdate);
    };
  }, [articleId]);

  // Increment view count when article is viewed
  useEffect(() => {
    const incrementView = () => {
      // Always increment the view count
      const newViews = incrementArticleViewCount(articleId);
      setViews(newViews);
      console.log(`View count updated for article ${articleId}: ${newViews}`);
    };

    // Small delay to ensure the component is mounted when we increment the view
    const timeoutId = setTimeout(incrementView, 500);

    return () => clearTimeout(timeoutId);
  }, [articleId]);

  return views;
};

export default useArticleViews; 