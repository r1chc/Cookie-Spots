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

  // Helper function to calculate article date display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Invalid date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper function to format view counts
  const formatViews = (views) => {
    if (!views && views !== 0) return '0';
    return views.toLocaleString('en-US');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    navigate(`/blogsearch?q=${encodeURIComponent(searchInput)}`);
  };

  // --- Render Logic ---
  return (
    <div className="blog-page-wrapper">
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        {/* Header with search info */}
        <div className="mx-auto max-w-4xl pt-8 px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Search Results for: <span className="text-primary-600">{searchQuery || 'All Articles'}</span>
            </h1>
            <p className="text-gray-600">
              Found {results.length} article{results.length !== 1 ? 's' : ''} matching your search.
            </p>
          </div>
        </div>

        <div className="blog-content-wrapper">
          <main className="blog-main-content">
            {/* Search Input Area */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Search Recipes</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                navigate(`/blogsearch?q=${encodeURIComponent(searchQuery)}`);
              }} className="flex">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Enter keywords..."
                  className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button type="submit" className="p-2 bg-primary-600 text-white rounded-r hover:bg-primary-700">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            {/* Results Section */}
            {loading && <div className="bg-white rounded-lg shadow-md p-6 text-center">Loading articles...</div>}
            {error && <div className="bg-white rounded-lg shadow-md p-6 text-center text-red-500">Error: {error}</div>}
            
            {!loading && !error && results.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-bold mb-4">No Results Found</h2>
                <p className="mb-6">We couldn't find any articles matching "{searchQuery}".</p>
                <p className="mb-4">Try different keywords or browse our popular categories below.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.slice(0, 4).map((category, index) => (
                    <button 
                      key={index} 
                      onClick={() => navigate(`/blogsearch?q=${encodeURIComponent(category.name)}`)}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!loading && !error && results.length > 0 && (
              <div className="blog-posts-grid">
                {results.map(post => (
                  <article key={post.id || post.slug} className="blog-post search-result-item">
                    {/* Image and Category Badge */}
                    <div className="blog-post-image">
                      <Link to={`/article/${post.slug}`}> 
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = "/images/cookie-types/chocolate-chip.webp";
                          }}
                          crossOrigin="anonymous"
                        />
                      </Link>
                      {post.category && <div className="blog-post-category-badge">{post.category}</div>}
                    </div>
                    {/* Content */}
                    <div className="blog-post-content">
                      <div className="blog-post-meta">
                        {post.publishedAt && <span className="blog-post-date">{formatDate(post.publishedAt)}</span>}
                        {post.author && <span className="blog-post-author">By {post.author}</span>}
                        {post.views !== undefined && (
                          <span className="blog-post-views">
                            <i className="fas fa-eye"></i> {formatViews(post.views)}
                          </span>
                        )}
                      </div>
                      <h3 className="blog-post-title">
                        <Link to={`/article/${post.slug}`}>{post.title}</Link>
                      </h3>
                      {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
                      <Link to={`/article/${post.slug}`} className="blog-read-more">
                        Read Recipe <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          <aside className="blog-sidebar">
            <div className="blog-sidebar-section pb-6">
              <h3 className="blog-sidebar-title">Search Recipes</h3>
              <form className="blog-search-form mb-3" onSubmit={handleSearchSubmit}>
                <input type="text" placeholder="Search Recipes..." name="search" />
                <button type="submit" className="text-blue-500"><i className="fas fa-search"></i></button>
              </form>
              <h4 className="blog-sidebar-subtitle text-sm mb-2">Popular Tags:</h4>
              <div className="blog-tags-cloud">
                {popularTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/blogsearch?q=${encodeURIComponent(tag)}`)} 
                    className="blog-tag text-sm py-1 px-2"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Popular Recipes</h3>
              <ul className="blog-popular-posts">
                {[...allArticles] // Create a copy before sorting
                  .sort((a, b) => (b.views || 0) - (a.views || 0)) // Sort by views
                  .slice(0, 3) // Get top 3
                  .map(post => (
                    <li key={post.id || post.slug} className="blog-popular-post">
                      <Link to={`/article/${post.slug}`}>
                        <img
                          src={post.image}
                          alt={post.title}
                          className="blog-popular-post-image"
                          loading="lazy"
                        />
                      </Link>
                      <div className="blog-popular-post-content">
                        <h4>
                          <Link to={`/article/${post.slug}`}>{post.title}</Link>
                        </h4>
                        <div>
                          {post.publishedAt && <span className="blog-popular-post-date">{formatDate(post.publishedAt)}</span>}
                          {post.views !== undefined && (
                            <span className="blog-popular-post-views">
                              <i className="fas fa-eye"></i> {formatViews(post.views)}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Categories</h3>
              <ul className="blog-categories-list">
                {categories.map(category => (
                  <li key={category.name}>
                    <Link to={`/blogsearch?q=${encodeURIComponent(category.name)}`}>
                      {category.name} 
                      <span className="count">{categoryCounts[category.name] || 0}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <SearchButton />
    </div>
  );
};

export default BlogSearch;