import { useState, useEffect } from 'react';
// Remove mockArticles import
// import { mockArticles } from '../data/mockArticles';
import { loadAllArticles } from '../utils/articleLoader'; // Import the new loader

const VIEWS_STORAGE_KEY = 'article_views';
const LAST_VIEW_STORAGE_KEY = 'last_article_views';

const useArticleViews = (articleSlug) => {
  const [views, setViews] = useState(0); // Initialize views to 0 initially
  const [baseViews, setBaseViews] = useState(0); // State to hold base views once loaded

  // Effect to load base views from dynamic loader
  useEffect(() => {
    if (!articleSlug) return; // Don't run if slug is not available yet

    let isMounted = true;

    const fetchBaseViews = async () => {
      try {
        const allArticles = await loadAllArticles();
        const article = allArticles.find(a => a.slug === articleSlug);
        if (isMounted) {
          setBaseViews(article ? article.views : 0);
        }
      } catch (error) {
        console.error("Error fetching base views for article:", articleSlug, error);
        if (isMounted) {
          setBaseViews(0); // Set base views to 0 on error
        }
      }
    };

    fetchBaseViews();

    return () => {
      isMounted = false;
    };
  }, [articleSlug]);

  // Effect to load additional views and update total views
  useEffect(() => {
    if (!articleSlug) return; // Don't run if slug is not available yet

    const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
    const viewsData = storedViews ? JSON.parse(storedViews) : {};
    const additionalViews = viewsData[articleSlug] || 0;

    // Update total views once base views are set
    setViews(baseViews + additionalViews);

  }, [articleSlug, baseViews]); // Depend on baseViews now

  // Effect to track article view (increment logic remains mostly the same)
  useEffect(() => {
    if (!articleSlug) return;

    // Delay tracking slightly to ensure base views are likely loaded
    const timer = setTimeout(() => {
      const lastViewsData = localStorage.getItem(LAST_VIEW_STORAGE_KEY);
      const lastViews = lastViewsData ? JSON.parse(lastViewsData) : {};
      const lastViewTime = lastViews[articleSlug] || 0;
      const now = Date.now();

      // Only count a view if it's been more than 30 minutes since last view
      if (now - lastViewTime > 30 * 60 * 1000) {
        const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
        const viewsData = storedViews ? JSON.parse(storedViews) : {};
        
        // Increment additional views
        const newAdditionalViews = (viewsData[articleSlug] || 0) + 1;
        viewsData[articleSlug] = newAdditionalViews;
        
        // Update last view time
        lastViews[articleSlug] = now;
        
        // Save to localStorage
        localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(viewsData));
        localStorage.setItem(LAST_VIEW_STORAGE_KEY, JSON.stringify(lastViews));
        
        // Update state with total views (base + new additional)
        const totalViews = baseViews + newAdditionalViews;
        setViews(totalViews);

        // Dispatch event for other components to update
        window.dispatchEvent(new CustomEvent('articleViewsUpdated', {
          detail: { articleSlug, views: totalViews }
        }));
      }
    }, 50); // 50ms delay

    return () => clearTimeout(timer); // Clear timeout on unmount or slug change

  }, [articleSlug, baseViews]); // Depend on baseViews here too

  return views;
};

export default useArticleViews; 