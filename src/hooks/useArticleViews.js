import { useState, useEffect } from 'react';
import { getArticleViewCount, incrementArticleViewCount } from '../utils/viewCountUtils';

const useArticleViews = (articleId) => {
  const [views, setViews] = useState(() => {
    // Get initial views using the utility function
    return getArticleViewCount(articleId);
  });

  // Update views when articleId changes and handle view increment
  useEffect(() => {
    // Set initial view count
    setViews(getArticleViewCount(articleId));
    
    // Increment the view count - our utility now checks if it's already been viewed this session
    const newViews = incrementArticleViewCount(articleId);
    setViews(newViews);
    
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

  return views;
};

export default useArticleViews; 