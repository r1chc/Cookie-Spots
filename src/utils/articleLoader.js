let allArticlesCache = null;
let articlesPromise = null;

// Function to dynamically load all articles using Vite's glob import
export async function loadAllArticles() {
  // Return cached articles if already loaded
  if (allArticlesCache) {
    return allArticlesCache;
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
          articles.push(module.article);
          console.log('Debug - loaded article:', module.article.title, module.article.slug);
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

// Function to find a single article by slug from the loaded articles
export async function getArticleBySlug(slug) {
  const allArticles = await loadAllArticles();
  return allArticles.find(article => article.slug === slug) || null;
}

// Function to get articles with updated view counts
export async function getArticlesWithUpdatedViewCounts() {
  const articles = await loadAllArticles();
  return articles.map(article => ({
    ...article,
    views: article.views || 0
  }));
} 