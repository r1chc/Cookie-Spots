let allArticlesCache = null;
let articlesPromise = null;
let viewCountsCache = {};

// Initialize view counts from localStorage
if (typeof window !== 'undefined') {
  try {
    const storedViewCounts = JSON.parse(localStorage.getItem('articleViewCounts') || '{}');
    console.log('Loading view counts from localStorage:', storedViewCounts);
    viewCountsCache = { ...storedViewCounts };
  } catch (e) {
    console.error('Error loading view counts from localStorage:', e);
  }
}

// Function to dynamically load all articles using Vite's glob import
export async function loadAllArticles() {
  // Return cached articles if already loaded
  if (allArticlesCache) {
    // Apply any updated view counts from the cache to ensure they're always current
    const updatedArticles = allArticlesCache.map(article => {
      const storedViews = viewCountsCache[article.slug];
      if (storedViews !== undefined) {
        return { ...article, views: storedViews };
      }
      return article;
    });
    return updatedArticles;
  }

  // If a promise is already in flight, return it
  if (articlesPromise) {
    return articlesPromise;
  }

  // Start loading articles
  articlesPromise = (async () => {
    try {
      // Import all .jsx files from the articles directory, except BaseArticle.jsx
      // Use eager: true to load them immediately and get the modules directly
      const articleModules = import.meta.glob('/src/pages/articles/*.jsx', { eager: true });

      console.log('Debug - available article modules paths:', Object.keys(articleModules));
      
      const articles = [];
      for (const path in articleModules) {
        // Skip the BaseArticle component file
        if (path.endsWith('BaseArticle.jsx')) {
          continue;
        }

        const module = articleModules[path];
        // Ensure the module has an 'article' export
        if (module && module.article) {
          // Create a copy of the article to avoid mutating the imported module
          const article = { ...module.article };
          
          // Ensure views property exists
          if (article.views === undefined) {
            article.views = 0;
          }
          
          // Check if we have an updated view count in the cache
          if (viewCountsCache[article.slug] !== undefined) {
            console.log(`Applying cached view count for ${article.slug}: ${viewCountsCache[article.slug]}`);
            article.views = viewCountsCache[article.slug];
          }
          
          articles.push(article);
          console.log('Loaded article:', article.title, `(${article.slug})`, 'views:', article.views);
        } else {
          console.warn(`Article data not found or missing 'article' export in ${path}`);
        }
      }
      
      // Cache the loaded articles
      allArticlesCache = articles;
      return articles;
    } catch (error) {
      console.error("Error loading articles:", error);
      articlesPromise = null; // Reset promise on error
      return []; // Return empty array on error
    } finally {
      articlesPromise = null; // Clear promise once resolved or rejected
    }
  })();

  return articlesPromise;
}

// Function to get a single article by slug with updated view count
export async function getArticleBySlug(slug) {
  const allArticles = await loadAllArticles();
  const article = allArticles.find(article => article.slug === slug);
  
  if (article) {
    // Check if we have a cached view count
    if (viewCountsCache[slug] !== undefined) {
      return { ...article, views: viewCountsCache[slug] };
    }
    return article;
  }
  
  return null;
}

// Function to get articles with updated view counts
export async function getArticlesWithUpdatedViewCounts() {
  const articles = await loadAllArticles();
  // Ensure we always have the most current view counts
  return articles.map(article => {
    if (viewCountsCache[article.slug] !== undefined) {
      return { ...article, views: viewCountsCache[article.slug] };
    }
    return article;
  });
}

// Function to update article view count and broadcast the change
export function updateArticleViewCount(slug, views) {
  if (!slug) {
    console.error('Cannot update view count - missing article slug');
    return 0;
  }
  
  console.log(`Updating view count for ${slug} to ${views}`);

  // Store the updated view count in the cache
  viewCountsCache[slug] = views;
  
  // Update the article in the cache if it exists
  if (allArticlesCache) {
    const article = allArticlesCache.find(a => a.slug === slug);
    if (article) {
      article.views = views;
    }
  }
  
  // Broadcast the update event
  const event = new CustomEvent('articleViewsUpdated', {
    detail: {
      articleId: slug,
      views: views
    }
  });
  
  window.dispatchEvent(event);
  
  // Also store in localStorage to persist between page refreshes
  try {
    const storedViewCounts = JSON.parse(localStorage.getItem('articleViewCounts') || '{}');
    storedViewCounts[slug] = views;
    localStorage.setItem('articleViewCounts', JSON.stringify(storedViewCounts));
    console.log('Saved updated view counts to localStorage:', storedViewCounts);
  } catch (e) {
    console.error('Error storing view counts in localStorage:', e);
  }
  
  return views;
}

// Function to directly get the current view count for a specific article
export function getArticleViewCount(slug) {
  if (!slug) return null;
  return viewCountsCache[slug] !== undefined ? viewCountsCache[slug] : null;
}

// For debugging - logs all current view counts
export function logAllViewCounts() {
  console.log('Current view counts in cache:', viewCountsCache);
  
  try {
    const storedCounts = JSON.parse(localStorage.getItem('articleViewCounts') || '{}');
    console.log('Current view counts in localStorage:', storedCounts);
  } catch (e) {
    console.error('Error reading localStorage view counts:', e);
  }
} 