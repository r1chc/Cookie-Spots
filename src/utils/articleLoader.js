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

// Debug function to check for specific articles
function debugCheckSpecificArticle(articles, slug) {
  console.log(`Checking for article with slug: "${slug}"`);
  
  // Try direct slug match
  const bySlug = articles.find(a => a.slug === slug);
  if (bySlug) {
    console.log(`Found article by slug: "${slug}" - Title: "${bySlug.title}", ID: ${bySlug.id}`);
  } else {
    console.log(`No article found with exact slug: "${slug}"`);
    
    // Try different slug formats
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fuzzyMatches = articles.filter(a => 
      a.slug.includes(normalizedSlug) || 
      (normalizedSlug.includes(a.slug) && a.slug.length > 3)
    );
    
    if (fuzzyMatches.length > 0) {
      console.log(`Found similar slug matches:`, fuzzyMatches.map(a => `"${a.slug}" (${a.title})`));
    } else {
      console.log(`No similar slug matches found`);
    }
    
    // Try by title
    const titleMatches = articles.filter(a => 
      a.title.toLowerCase().includes('no-bake') && 
      a.title.toLowerCase().includes('chocolate') &&
      a.title.toLowerCase().includes('peanut butter')
    );
    
    if (titleMatches.length > 0) {
      console.log(`Found title matches:`, titleMatches.map(a => `"${a.title}" (${a.slug})`));
    } else {
      console.log(`No title matches found`);
    }
  }
}

// Function to normalize a slug for consistent matching
function normalizeSlug(slug) {
  if (!slug) return '';
  // Convert to lowercase, replace spaces with dashes, remove special characters
  return slug.toLowerCase().trim()
    .replace(/\s+/g, '-')         // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, '')   // Remove any non-alphanumeric chars except dashes
    .replace(/-+/g, '-');         // Replace multiple dashes with single dash
}

// Function to dynamically load all articles using Vite's glob import
export async function loadAllArticles() {
  // Return cached articles if already loaded
  if (allArticlesCache) {
    console.log(`Using cached articles: ${allArticlesCache.length} articles`);
    
    // Debug for the problem article
    debugCheckSpecificArticle(allArticlesCache, "no-bake-chocolate-peanut-butter-cookies");
    
    // Apply any updated view counts from the cache to ensure they're always current
    const updatedArticles = allArticlesCache.map(article => {
      // Check for view count by slug
      if (viewCountsCache[article.slug] !== undefined) {
        return { ...article, views: viewCountsCache[article.slug] };
      }
      
      // Also check for view count by ID if the article has one
      if (article.id && viewCountsCache[article.id] !== undefined) {
        return { ...article, views: viewCountsCache[article.id] };
      }
      
      return article;
    });
    return updatedArticles;
  }

  // If a promise is already in flight, return it
  if (articlesPromise) {
    console.log(`Articles already loading, returning promise`);
    return articlesPromise;
  }

  console.log(`Starting to load all articles...`);
  
  // Start loading articles
  articlesPromise = (async () => {
    try {
      // Import all .jsx files from the articles directory, except BaseArticle.jsx
      // Use eager: true to load them immediately and get the modules directly
      const articleModules = import.meta.glob('/src/pages/articles/*.jsx', { eager: true });

      console.log('Debug - available article modules paths:', Object.keys(articleModules));
      
      // Debug check for the No-Bake article specifically
      const noBakeArticlePath = Object.keys(articleModules).find(path => 
        path.includes('NoBake') || 
        path.toLowerCase().includes('nobake') || 
        path.toLowerCase().includes('no-bake')
      );
      
      if (noBakeArticlePath) {
        console.log(`Found No-Bake article at path: ${noBakeArticlePath}`);
        const module = articleModules[noBakeArticlePath];
        if (module && module.article) {
          console.log(`No-Bake article details:`, {
            title: module.article.title,
            slug: module.article.slug,
            id: module.article.id
          });
        } else {
          console.log(`No-Bake module found but doesn't have article export`);
        }
      } else {
        console.log(`No No-Bake article found in paths`);
      }
      
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
          // Also check for view count by ID if the article has one
          else if (article.id && viewCountsCache[article.id] !== undefined) {
            console.log(`Applying cached view count for ${article.title} (ID: ${article.id}): ${viewCountsCache[article.id]}`);
            article.views = viewCountsCache[article.id];
          }
          
          articles.push(article);
          console.log('Loaded article:', article.title, `(${article.slug})`, 'views:', article.views);
        } else {
          console.warn(`Article data not found or missing 'article' export in ${path}`);
        }
      }
      
      // Cache the loaded articles
      allArticlesCache = articles;
      
      // Debug for the problem article
      debugCheckSpecificArticle(articles, "no-bake-chocolate-peanut-butter-cookies");
      
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
  console.log(`getArticleBySlug called with slug: "${slug}"`);
  
  const allArticles = await loadAllArticles();
  console.log(`getArticleBySlug: Loaded ${allArticles.length} articles`);
  
  // Normalize the input slug for more robust matching
  const normalizedInputSlug = normalizeSlug(slug);
  console.log(`getArticleBySlug: Normalized input slug: "${normalizedInputSlug}"`);
  
  // Try to find by exact slug first
  let article = allArticles.find(article => article.slug === slug);
  
  // If not found, try with normalized slugs
  if (!article) {
    article = allArticles.find(article => normalizeSlug(article.slug) === normalizedInputSlug);
    if (article) {
      console.log(`getArticleBySlug: Found article by normalized slug: "${normalizedInputSlug}" -> "${article.slug}"`);
    }
  } else {
    console.log(`getArticleBySlug: Found article by exact slug: "${slug}" - "${article.title}"`);
  }
  
  // If still not found, try to find by numeric ID (if slug is a number)
  if (!article && !isNaN(parseInt(slug))) {
    const numericId = parseInt(slug);
    article = allArticles.find(article => article.id === numericId || parseInt(article.id) === numericId);
    
    if (article) {
      console.log(`getArticleBySlug: Found article by ID: ${numericId} - "${article.title}"`);
    } else {
      console.log(`getArticleBySlug: No article found with ID: ${numericId}`);
    }
  }
  
  if (article) {
    // Check if we have a cached view count for the article's slug
    if (viewCountsCache[article.slug] !== undefined) {
      console.log(`getArticleBySlug: Using cached view count for ${article.slug}: ${viewCountsCache[article.slug]}`);
      return { ...article, views: viewCountsCache[article.slug] };
    }
    
    // Also check for view count by ID if the article has an ID
    if (article.id && viewCountsCache[article.id] !== undefined) {
      console.log(`getArticleBySlug: Using cached view count by ID for ${article.slug}: ${viewCountsCache[article.id]}`);
      return { ...article, views: viewCountsCache[article.id] };
    }
    
    // Also check with normalized slug
    const normalizedSlug = normalizeSlug(article.slug);
    if (viewCountsCache[normalizedSlug] !== undefined) {
      console.log(`getArticleBySlug: Using cached view count by normalized slug: ${normalizedSlug}: ${viewCountsCache[normalizedSlug]}`);
      return { ...article, views: viewCountsCache[normalizedSlug] };
    }
    
    console.log(`getArticleBySlug: No cached view count found, using original: ${article.views}`);
    return article;
  }
  
  console.log(`getArticleBySlug: Article not found for slug: "${slug}"`);
  return null;
}

// Function to get articles with updated view counts
export async function getArticlesWithUpdatedViewCounts() {
  const articles = await loadAllArticles();
  // Ensure we always have the most current view counts
  return articles.map(article => {
    // Check for view count by slug
    if (viewCountsCache[article.slug] !== undefined) {
      return { ...article, views: viewCountsCache[article.slug] };
    }
    
    // Also check for view count by ID if the article has one
    if (article.id && viewCountsCache[article.id] !== undefined) {
      return { ...article, views: viewCountsCache[article.id] };
    }
    
    return article;
  });
}

// Function to update article view count and broadcast the change
export function updateArticleViewCount(identifier, views) {
  if (!identifier) {
    console.error('Cannot update view count - missing article identifier');
    return 0;
  }
  
  console.log(`Updating view count for ${identifier} to ${views}`);

  // Also normalize the identifier for consistent matching
  const normalizedIdentifier = normalizeSlug(identifier);
  
  // Store the updated view count in the cache using both the original and normalized identifiers
  viewCountsCache[identifier] = views;
  if (normalizedIdentifier !== identifier) {
    viewCountsCache[normalizedIdentifier] = views;
  }
  
  // Update the article in the cache if it exists
  if (allArticlesCache) {
    // Try to find article by exact slug, normalized slug, or ID
    const article = allArticlesCache.find(a => 
      a.slug === identifier || 
      normalizeSlug(a.slug) === normalizedIdentifier ||
      a.id === identifier || 
      (a.id && parseInt(a.id) === parseInt(identifier))
    );
    
    if (article) {
      // Update the article's view count
      article.views = views;
      
      // Also update the cache entry for the article's slug if it's different from the identifier
      if (article.slug && article.slug !== identifier) {
        viewCountsCache[article.slug] = views;
      }
      
      // Also update cache for normalized slug
      const articleNormalizedSlug = normalizeSlug(article.slug);
      if (articleNormalizedSlug !== identifier && articleNormalizedSlug !== normalizedIdentifier) {
        viewCountsCache[articleNormalizedSlug] = views;
      }
      
      // Also update the cache entry for the article's id if it exists and is different
      if (article.id && article.id.toString() !== identifier) {
        viewCountsCache[article.id] = views;
      }
    }
  }
  
  // Broadcast the update event with both the original and normalized identifiers
  const event = new CustomEvent('articleViewsUpdated', {
    detail: {
      articleId: identifier,
      normalizedArticleId: normalizedIdentifier,
      views: views
    }
  });
  
  window.dispatchEvent(event);
  
  // Also store in localStorage to persist between page refreshes
  try {
    const storedViewCounts = JSON.parse(localStorage.getItem('articleViewCounts') || '{}');
    storedViewCounts[identifier] = views;
    if (normalizedIdentifier !== identifier) {
      storedViewCounts[normalizedIdentifier] = views;
    }
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

// Function to migrate view counts from the old system to the new system
// Only needed during the transition period
export function migrateOldViewCounts() {
  if (typeof window === 'undefined') return;
  
  console.log('Starting view count migration process...');
  
  try {
    // Check for old view counts
    const oldViewCounts = localStorage.getItem('article_views');
    if (!oldViewCounts) {
      console.log('No old view counts to migrate');
      return;
    }
    
    const oldViewData = JSON.parse(oldViewCounts);
    console.log('Found old view counts to migrate:', oldViewData);
    
    // Get current view counts
    const currentViewCounts = JSON.parse(localStorage.getItem('articleViewCounts') || '{}');
    let migrationCount = 0;
    
    // Only do the migration if articles are already loaded
    // This prevents race conditions with article loading
    if (allArticlesCache) {
      migrateViewsWithLoadedArticles(oldViewData, currentViewCounts);
    } else {
      // If articles aren't loaded yet, wait for them to be loaded first
      console.log('Articles not yet loaded, will migrate views after loading');
      const waitForArticles = async () => {
        const articles = await loadAllArticles();
        migrateViewsWithLoadedArticles(oldViewData, currentViewCounts);
      };
      waitForArticles();
    }
  } catch (e) {
    console.error('Error migrating old view counts:', e);
  }
}

// Helper function for migrating view counts with loaded articles
function migrateViewsWithLoadedArticles(oldViewData, currentViewCounts) {
  let migrationCount = 0;
  
  // For each old view count, find the corresponding article and update the new system
  Object.entries(oldViewData).forEach(([articleId, additionalViews]) => {
    console.log(`Migrating article ID: ${articleId} with additional views: ${additionalViews}`);
    
    const numericId = parseInt(articleId);
    const article = allArticlesCache.find(a => a.id === numericId || parseInt(a.id) === numericId);
    
    if (article) {
      const slug = article.slug;
      
      // Calculate the total views (base count from article + additional views)
      const baseViews = article.views || 0;
      const oldTotalViews = baseViews + additionalViews;
      
      // Only update if the old count is higher than what we have now
      const currentViews = currentViewCounts[slug] || 0;
      if (oldTotalViews > currentViews) {
        console.log(`Migrating view count for ${article.title} from ${currentViews} to ${oldTotalViews}`);
        currentViewCounts[slug] = oldTotalViews;
        migrationCount++;
      } else {
        console.log(`No need to migrate ${article.title} - current count ${currentViews} >= old count ${oldTotalViews}`);
      }
    } else {
      console.log(`Article with ID ${articleId} not found during migration`);
    }
  });
  
  if (migrationCount > 0) {
    // Save the updated view counts
    localStorage.setItem('articleViewCounts', JSON.stringify(currentViewCounts));
    console.log(`Successfully migrated ${migrationCount} article view counts`);
    
    // Update the in-memory cache
    viewCountsCache = { ...currentViewCounts };
    
    // Optionally clear the old storage (comment out if you want to keep it as backup)
    // localStorage.removeItem('article_views');
  } else {
    console.log('No new view counts to migrate');
  }
}

// Run migration on initial load if in browser
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure the app is loaded
  // This ensures we don't interfere with initial article loading
  setTimeout(migrateOldViewCounts, 5000);
} 