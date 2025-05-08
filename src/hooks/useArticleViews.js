import { useState, useEffect, useRef } from 'react';
// Remove mockArticles import
// import { mockArticles } from '../data/mockArticles';
import { loadAllArticles, updateArticleViewCount } from '../utils/articleLoader'; // Import the new loader and update function

// Only store the last view timestamps to prevent spam
const LAST_VIEW_STORAGE_KEY = 'last_article_views';

const useArticleViews = (articleSlug) => {
  const [views, setViews] = useState(0);
  const viewIncremented = useRef(false);
  const initialViewsLoaded = useRef(false);

  // Load the initial view count
  useEffect(() => {
    if (!articleSlug) return;

    let isMounted = true;
    
    const loadInitialViews = async () => {
      try {
        const allArticles = await loadAllArticles();
        const article = allArticles.find(a => a.slug === articleSlug || a.id === articleSlug);
        
        if (isMounted && article) {
          console.log(`Initial views for ${articleSlug}: ${article.views}`);
          setViews(article.views || 0);
          initialViewsLoaded.current = true;
        }
      } catch (error) {
        console.error("Error fetching views for article:", articleSlug, error);
      }
    };

    loadInitialViews();

    // Listen for view updates from other components
    const handleViewsUpdate = (e) => {
      const { articleId, views: newViews } = e.detail;
      
      // Match on either slug or ID
      if ((articleId === articleSlug || parseInt(articleId) === parseInt(articleSlug)) && isMounted) {
        console.log(`Updating views for ${articleSlug} to ${newViews}`);
        setViews(newViews);
      }
    };

    window.addEventListener('articleViewsUpdated', handleViewsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('articleViewsUpdated', handleViewsUpdate);
    };
  }, [articleSlug]);

  // Increment the view count - separate effect to run once after initial load
  useEffect(() => {
    // Only increment if we have a slug and initial data is loaded
    if (!articleSlug || !initialViewsLoaded.current || viewIncremented.current) return;
    
    console.log(`Checking whether to increment view for ${articleSlug}`);
    
    const incrementViewOnce = () => {
      // Check if we should increment (not viewed in last 30 min)
      const lastViewsData = localStorage.getItem(LAST_VIEW_STORAGE_KEY);
      const lastViews = lastViewsData ? JSON.parse(lastViewsData) : {};
      const lastViewTime = lastViews[articleSlug] || 0;
      const now = Date.now();
      
      // For testing, make this a shorter interval (e.g., 10 seconds)
      // In production, use 30 minutes: 30 * 60 * 1000
      const TEST_MODE = false;
      const viewThreshold = TEST_MODE ? 10 * 1000 : 30 * 60 * 1000;
      
      console.log(`Last view time for ${articleSlug}: ${new Date(lastViewTime).toLocaleString()}`);
      console.log(`Current time: ${new Date(now).toLocaleString()}`);
      console.log(`Time difference: ${(now - lastViewTime) / 1000} seconds`);
      console.log(`Threshold: ${viewThreshold / 1000} seconds`);
      
      if (now - lastViewTime > viewThreshold) {
        // Update last view time immediately
        lastViews[articleSlug] = now;
        localStorage.setItem(LAST_VIEW_STORAGE_KEY, JSON.stringify(lastViews));
        
        // Increment the view count
        const newCount = views + 1;
        console.log(`Incrementing view count for ${articleSlug} from ${views} to ${newCount}`);
        updateArticleViewCount(articleSlug, newCount);
        setViews(newCount);
      } else {
        console.log(`Not incrementing view for ${articleSlug} - viewed too recently`);
      }
      
      viewIncremented.current = true;
    };
    
    // Use a longer timeout to ensure views are loaded
    const timer = setTimeout(incrementViewOnce, 1000);
    return () => clearTimeout(timer);
  }, [articleSlug, views]);

  return views;
};

export default useArticleViews; 