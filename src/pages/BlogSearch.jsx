import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css'; // Keep if styles are shared
import '../styles/BlogSearch.css'; 
import useScrollRestoration from '../hooks/useScrollRestoration';
import SearchButton from '../components/SearchButton';
// Remove mockArticles import and generateSlug if not used elsewhere
// import { mockArticles, generateSlug } from '../data/mockArticles'; 
import { loadAllArticles } from '../utils/articleLoader'; // Import the loader

// Define generateSlug locally if still needed, or move to utils
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .trim();
};

const BlogSearch = () => {
  useScrollRestoration(); // Restore scroll position
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search query from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allArticles, setAllArticles] = useState([]); // Store all loaded articles

  // Fetch all articles using the loader (used for filtering/fallback)
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        // Remove API fetch logic for now
        // const response = await fetch('/api/blog/posts');
        // ... API handling ...

        // Load articles dynamically
        const loadedArticles = await loadAllArticles();
        setAllArticles(loadedArticles);

      } catch (loadErr) {
        console.error('Error loading articles dynamically:', loadErr);
        setError('Could not load articles.');
        setAllArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []); // Fetch articles on component mount

  // Filter articles based on search query when query or articles change
  useEffect(() => {
    if (!allArticles || allArticles.length === 0) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setResults(allArticles); // Show all if query is empty
      return;
    }

    const filtered = allArticles.filter(article => 
      (article.title && article.title.toLowerCase().includes(query)) ||
      (article.category && article.category.toLowerCase().includes(query)) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(query)) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (article.content && article.content.toLowerCase().includes(query)) // Search content too
    );
    setResults(filtered);

  }, [searchQuery, allArticles]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Update URL query parameter without full navigation
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('q', e.target.value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  };

  // Memoize categories for stability
  const categories = useMemo(() => [
      { name: 'Chocolate', image: '/images/cookie-types/chocolate-chip.webp' },
      { name: 'Gluten-Free', image: '/images/cookie-types/sugar-cookie.webp' },
      { name: 'No-Bake', image: '/images/cookie-types/oatmeal-raisin.webp' },
      { name: 'Vegan', image: '/images/cookie-types/macaron.webp' },
      { name: 'Classic', image: '/images/cookie-types/snickerdoodle.webp' },
      { name: 'Specialty', image: '/images/cookie-types/red-velvet.webp' },
      { name: 'Seasonal', image: '/images/cookie-types/gingerbread.webp' },
      { name: 'Healthy', image: '/images/cookie-types/almond-biscotti.webp' }
  ], []);

  // Calculate category counts based on the full set of articles
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(category => {
      const categoryNameLower = category.name.toLowerCase();
      counts[category.name] = allArticles.filter(post => 
          (post.title && post.title.toLowerCase().includes(categoryNameLower)) ||
          (post.category && post.category.toLowerCase().includes(categoryNameLower)) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(categoryNameLower)) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(categoryNameLower)))
      ).length;
    });
    return counts;
  }, [allArticles, categories]);

  // Calculate popular tags based on the full set of articles
  const popularTags = useMemo(() => {
    const tagScores = {};
    allArticles.forEach(post => {
      if (post.tags) {
        const tagPoints = (post.views || 0) / 100;
        post.tags.forEach(tag => {
          tagScores[tag] = (tagScores[tag] || 0) + tagPoints;
        });
      }
    });
    return Object.entries(tagScores)
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag)
      .slice(0, 6); // Top 6 tags
  }, [allArticles]);

  const formatDate = (dateString) => {
      // ... (same as before) ...
  };

  const formatViews = (views) => {
      // ... (same as before) ...
  };

  // --- Render Logic ---
  return (
    <div className="blog-search-page">
      {/* Header Section */}
      {/* ... */}

      <div className="blog-search-content-wrapper">
        <main className="blog-search-main-content">
          {/* Search Input Area */}
          <div className="search-input-area">
             <input 
                type="search" 
                value={searchQuery} 
                onChange={handleSearchChange} 
                placeholder="Search articles..." 
             />
             {/* Maybe add a clear button */} 
          </div>

          {/* Results Section */}
          {loading && <div className="loading-message">Loading articles...</div>}
          {error && <div className="error-message">Error: {error}</div>}
          {!loading && !error && (
            <div className="search-results-info">
              Showing {results.length} result(s) for "<strong>{searchQuery}</strong>"
            </div>
          )}
          <div className="search-results-grid">
             {results.map(post => (
                <article key={post.id} className="search-result-item">
                   {/* Link, Image, Category Badge */}
                   <Link to={`/article/${post.slug}`}> {/* Use correct path */} </Link>
                   {/* Content: Meta (Date, Author, Views), Title, Excerpt, Read More */}
                   {/* ... render post details ... */}
                </article>
             ))}
             {!loading && results.length === 0 && (
                <div className="no-results-message">No articles found matching your search.</div>
             )}
          </div>
        </main>

        <aside className="blog-search-sidebar">
           {/* Popular Tags (uses popularTags) */}
           {/* Categories List (uses categoryCounts) */}
           {/* Maybe Recent Posts? (requires sorting allArticles) */}
           {/* ... */}
        </aside>
      </div>

      <SearchButton />
    </div>
  );
};

export default BlogSearch;