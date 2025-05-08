import { useState, useEffect, useRef } from 'react';
// Remove mockArticles import
// import { mockArticles } from '../data/mockArticles';
import { loadAllArticles, updateArticleViewCount } from '../utils/articleLoader'; // Import the new loader and update function

// Only store the last view timestamps to prevent spam
const LAST_VIEW_STORAGE_KEY = 'last_article_views';

// Function to normalize a slug for consistent matching
function normalizeSlug(slug) {
  if (!slug) return '';
  // Convert to lowercase, replace spaces with dashes, remove special characters
  return slug.toLowerCase().trim()
    .replace(/\s+/g, '-')         // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, '')   // Remove any non-alphanumeric chars except dashes
    .replace(/-+/g, '-');         // Replace multiple dashes with single dash
}

const useArticleViews = (articleSlug) => {
  const [views, setViews] = useState(0);
  const viewIncremented = useRef(false);
  const initialViewsLoaded = useRef(false);

  // Load the initial view count
  useEffect(() => {
    if (!articleSlug) return;

    console.log(`useArticleViews: Start loading views for slug: "${articleSlug}"`);
    
    // Normalize the slug for consistent matching
    const normalizedSlug = normalizeSlug(articleSlug);
    console.log(`useArticleViews: Normalized slug: "${normalizedSlug}"`);

    let isMounted = true;
    
    const loadInitialViews = async () => {
      try {
        const allArticles = await loadAllArticles();
        console.log(`useArticleViews: Loaded ${allArticles.length} articles`);
        
        // Debug: Log all article slugs to check if they match
        console.log('useArticleViews: Available article slugs:', 
          allArticles.map(a => `"${a.slug}"`).join(', '));
        
        // Try to find the article by exact slug first
        let article = allArticles.find(a => a.slug === articleSlug);
        
        // If not found, try with normalized slugs
        if (!article) {
          article = allArticles.find(a => normalizeSlug(a.slug) === normalizedSlug);
          
          // Debug: Log if we found by normalized slug
          if (article) {
            console.log(`useArticleViews: Found article by normalized slug: "${normalizedSlug}" -> "${article.slug}"`);
          } else {
            console.log(`useArticleViews: No article found with normalized slug: "${normalizedSlug}"`);
          }
        } else {
          console.log(`useArticleViews: Found article by exact slug: "${articleSlug}"`);
        }
        
        // If still not found, try to find by numeric ID (if articleSlug is a number)
        if (!article && !isNaN(parseInt(articleSlug))) {
          const numericId = parseInt(articleSlug);
          article = allArticles.find(a => a.id === numericId || parseInt(a.id) === numericId);
          
          // Debug: Log if we found by ID
          if (article) {
            console.log(`useArticleViews: Found article by ID: ${numericId}`);
          } else {
            console.log(`useArticleViews: No article found with ID: ${numericId}`);
          }
        }
        
        if (isMounted && article) {
          console.log(`useArticleViews: Initial views for ${articleSlug}: ${article.views}`);
          setViews(article.views || 0);
          initialViewsLoaded.current = true;
        } else {
          console.error(`useArticleViews: Could not find article for slug: "${articleSlug}"`);
        }
      } catch (error) {
        console.error("useArticleViews: Error fetching views for article:", articleSlug, error);
      }
    };

    loadInitialViews();

    // Listen for view updates from other components
    const handleViewsUpdate = (e) => {
      const { articleId, normalizedArticleId, views: newViews } = e.detail;
      
      console.log(`useArticleViews: Received view update event - articleId: "${articleId}", normalizedId: "${normalizedArticleId}", views: ${newViews}`);
      
      // Match by exact slug
      let isMatch = articleId === articleSlug;
      
      // If not matched by exact slug, try normalized slug comparison
      if (!isMatch && normalizedArticleId) {
        isMatch = normalizedArticleId === normalizedSlug;
      }
      
      // If still not matched, try our own normalization
      if (!isMatch) {
        const normalizedEventId = normalizeSlug(articleId);
        isMatch = normalizedEventId === normalizedSlug;
      }
      
      // If still not matched, try matching by numeric ID
      if (!isMatch && !isNaN(parseInt(articleSlug)) && !isNaN(parseInt(articleId))) {
        isMatch = parseInt(articleId) === parseInt(articleSlug);
      }
      
      if (isMatch && isMounted) {
        console.log(`useArticleViews: Updating views for ${articleSlug} to ${newViews}`);
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
    
    console.log(`useArticleViews: Checking whether to increment view for ${articleSlug}`);
    
    const incrementViewOnce = () => {
      // Check if we should increment (not viewed in last 30 min)
      const lastViewsData = localStorage.getItem(LAST_VIEW_STORAGE_KEY);
      const lastViews = lastViewsData ? JSON.parse(lastViewsData) : {};
      
      // Use normalized slug for storing view timestamps
      const normalizedSlug = normalizeSlug(articleSlug);
      
      // Check by both original and normalized slug
      const lastViewTime = lastViews[articleSlug] || lastViews[normalizedSlug] || 0;
      const now = Date.now();
      
      // For testing, make this a shorter interval (e.g., 10 seconds)
      // In production, use 30 minutes: 30 * 60 * 1000
      const TEST_MODE = false;
      const viewThreshold = TEST_MODE ? 10 * 1000 : 30 * 60 * 1000;
      
      console.log(`useArticleViews: Last view time for ${articleSlug}: ${new Date(lastViewTime).toLocaleString()}`);
      console.log(`useArticleViews: Current time: ${new Date(now).toLocaleString()}`);
      console.log(`useArticleViews: Time difference: ${(now - lastViewTime) / 1000} seconds`);
      console.log(`useArticleViews: Threshold: ${viewThreshold / 1000} seconds`);
      
      if (now - lastViewTime > viewThreshold) {
        // Update last view time immediately - store by both original and normalized slug
        lastViews[articleSlug] = now;
        if (normalizedSlug !== articleSlug) {
          lastViews[normalizedSlug] = now;
        }
        localStorage.setItem(LAST_VIEW_STORAGE_KEY, JSON.stringify(lastViews));
        
        // Increment the view count
        const newCount = views + 1;
        console.log(`useArticleViews: Incrementing view count for ${articleSlug} from ${views} to ${newCount}`);
        updateArticleViewCount(articleSlug, newCount);
        setViews(newCount);
      } else {
        console.log(`useArticleViews: Not incrementing view for ${articleSlug} - viewed too recently`);
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