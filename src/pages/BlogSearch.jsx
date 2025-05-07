import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css'; // Keep if styles are shared
import '../styles/BlogSearch.css'; 
import useScrollRestoration from '../hooks/useScrollRestoration';
import FloatingActionButtons from '../components/FloatingActionButtons';
import BlogSidebar from '../components/BlogSidebar';
// Remove mockArticles import and generateSlug if not used elsewhere
// import { mockArticles, generateSlug } from '../data/mockArticles'; 
import { loadAllArticles } from '../utils/articleLoader'; // Import the loader
import { isArticleInCategory, filterArticlesByCategory, getCategoryCounts } from '../utils/categoryUtils';

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
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayPages, setDisplayPages] = useState([1, 2, 3]);
  const [postsPerPage, setPostsPerPage] = useState(4);
  const [sortOrder, setSortOrder] = useState('newest');

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

  // Memoize categories for stability
  const categories = useMemo(() => [
      { name: 'Chocolate', image: '/images/cookie-types/chocolate-chip.webp' },
      { name: 'Gluten-Free', image: '/images/cookie-types/sugar-cookie.webp' },
      { name: 'No-Bake', image: '/images/cookie-types/oatmeal-raisin.webp' },
      { name: 'Vegan', image: '/images/cookie-types/macaron.webp' },
      { name: 'Classic', image: '/images/cookie-types/snickerdoodle.webp' },
      { name: 'Specialty', image: '/images/cookie-types/red-velvet.webp' },
      { name: 'Seasonal', image: '/images/cookie-types/gingerbread.webp' },
      { name: 'Healthy', image: '/images/cookie-types/almond-biscotti.webp' },
      { name: 'Sweet & Salty', image: '/images/cookie-types/peanut-butter.webp' },
      { name: 'International', image: '/images/cookie-types/sugar-cookie.webp' },
      { name: 'Fruit', image: '/images/cookie-types/white-chocolate-cranberry.webp' }
  ], []);

  // Update searchQuery when URL query parameter 'q' changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newQuery = queryParams.get('q') || '';
    if (newQuery !== searchQuery) {
      setSearchQuery(newQuery);
    }
  }, [location.search, searchQuery]);

  // Calculate category counts based on the full set of articles
  const categoryCounts = useMemo(() => {
    return getCategoryCounts(allArticles, categories);
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

  // Sort results based on sortOrder
  const sortedResults = useMemo(() => {
    if (!results) return [];
    
    const sorted = [...results];
    switch (sortOrder) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
      case 'most_viewed':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'least_viewed':
        return sorted.sort((a, b) => (a.views || 0) - (b.views || 0));
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [results, sortOrder]);

  // Calculate pagination values
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedResults.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedResults.length / postsPerPage);

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

    // Check if query matches exactly with a category name
    const categoryMatch = categories.find(
      category => category.name.toLowerCase() === query
    );

    if (categoryMatch) {
      // Use the consistent category filtering function
      const filteredByCategory = filterArticlesByCategory(allArticles, categoryMatch.name);
      setResults(filteredByCategory);
      return;
    }

    // General search for other queries
    const filtered = allArticles.filter(article => 
      (article.title && article.title.toLowerCase().includes(query)) ||
      (article.category && article.category.toLowerCase().includes(query)) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(query)) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (article.content && article.content.toLowerCase().includes(query)) // Search content too
    );
    setResults(filtered);

  }, [searchQuery, allArticles, categories]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    navigate(`/blogsearch?q=${encodeURIComponent(searchInput)}`);
  };

  // Effect for showing/hiding floating action buttons on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) { // Show after scrolling 200px
        setShowFloatingActions(true);
      } else {
        setShowFloatingActions(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Update display pages to show current page and adjacent pages
    if (page <= 2) {
      setDisplayPages([1, 2, 3]);
    } else if (page >= totalPages - 1) {
      setDisplayPages([totalPages - 2, totalPages - 1, totalPages]);
    } else {
      setDisplayPages([page - 1, page, page + 1]);
    }
    // Scroll to the search results section
    scrollToSearchResults();
  };

  const scrollToSearchResults = () => {
    const searchResultsSection = document.querySelector('.blog-posts-grid');
    if (searchResultsSection) {
      const isMobile = window.innerWidth <= 770;
      const isTablet = window.innerWidth > 770 && window.innerWidth <= 1024;
      const offset = isMobile ? 70 : isTablet ? 85 : 100;
      const elementPosition = searchResultsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDoubleChevronRight = () => {
    const newPages = [...displayPages];
    if (newPages[2] + 2 <= totalPages) {
      newPages[0] = newPages[0] + 2;
      newPages[1] = newPages[1] + 2;
      newPages[2] = newPages[2] + 2;
      setDisplayPages(newPages);
      setCurrentPage(newPages[1]);
      scrollToSearchResults();
    } else if (newPages[2] < totalPages) {
      // If there's only one page left to move, move to the last page
      newPages[0] = totalPages - 2;
      newPages[1] = totalPages - 1;
      newPages[2] = totalPages;
      setDisplayPages(newPages);
      setCurrentPage(newPages[1]);
      scrollToSearchResults();
    }
  };

  const handleDoubleChevronLeft = () => {
    const newPages = [...displayPages];
    if (newPages[0] > 2) {
      newPages[0] = newPages[0] - 2;
      newPages[1] = newPages[1] - 2;
      newPages[2] = newPages[2] - 2;
      setDisplayPages(newPages);
      setCurrentPage(newPages[1]);
      scrollToSearchResults();
    } else if (newPages[0] === 2) {
      // If there's only one page left to move, move to the first page
      newPages[0] = 1;
      newPages[1] = 2;
      newPages[2] = 3;
      setDisplayPages(newPages);
      setCurrentPage(newPages[1]);
      scrollToSearchResults();
    }
  };

  const handleSingleChevronRight = () => {
    const newPages = [...displayPages];
    if (newPages[2] + 1 <= totalPages) {
      newPages[0] = newPages[0] + 1;
      newPages[1] = newPages[1] + 1;
      newPages[2] = newPages[2] + 1;
      setDisplayPages(newPages);
      setCurrentPage(newPages[1]);
      scrollToSearchResults();
    }
  };

  const handleSingleChevronLeft = () => {
    const newPages = [...displayPages];
    if (newPages[0] > 1) {
      newPages[0] = newPages[0] - 1;
      newPages[1] = newPages[1] - 1;
      newPages[2] = newPages[2] - 1;
      setDisplayPages(newPages);
      setCurrentPage(newPages[1]);
      scrollToSearchResults();
    }
  };

  // Add sort handler
  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

  // Add posts per page handler
  const handlePostsPerPageChange = (e) => {
    const newPostsPerPage = parseInt(e.target.value);
    setPostsPerPage(newPostsPerPage);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

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

            {/* Add sorting controls */}
            <div className="blog-posts-header mb-6">
              <div className="blog-posts-controls">
                <div className="posts-per-page-selector">
                  <label htmlFor="postsPerPage">Show:</label>
                  <select 
                    id="postsPerPage" 
                    value={postsPerPage} 
                    onChange={handlePostsPerPageChange}
                    className="posts-per-page-dropdown"
                  >
                    <option value={2}>2 per page</option>
                    <option value={4}>4 per page</option>
                    <option value={6}>6 per page</option>
                    <option value={8}>8 per page</option>
                    <option value={results.length}>All</option>
                  </select>
                </div>
                <div className="posts-sort-selector">
                  <label htmlFor="sortOrder">Sort by:</label>
                  <select 
                    id="sortOrder" 
                    value={sortOrder} 
                    onChange={handleSortChange}
                    className="posts-sort-dropdown"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most_viewed">Most Viewed</option>
                    <option value="least_viewed">Least Viewed</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
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
              <div className="blog-posts-grid mb-8">
                {currentPosts.map((post) => (
                  <article key={post.slug} className="blog-post-card bg-white">
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

            {/* Add pagination */}
            {results.length > postsPerPage && (
              <div className="blog-pagination mb-12">
                <button 
                  className="blog-pagination-button"
                  onClick={handleDoubleChevronLeft}
                  disabled={displayPages[0] <= 1}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button 
                  className="blog-pagination-button"
                  onClick={handleSingleChevronLeft}
                  disabled={displayPages[0] <= 1}
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                {displayPages.map((page) => (
                  page > 0 && page <= totalPages && (
                    <button
                      key={page}
                      className={`blog-pagination-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  className="blog-pagination-button"
                  onClick={handleSingleChevronRight}
                  disabled={displayPages[2] >= totalPages}
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button 
                  className="blog-pagination-button"
                  onClick={handleDoubleChevronRight}
                  disabled={displayPages[2] >= totalPages}
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </main>

          {/* Use the shared BlogSidebar component */}
          <BlogSidebar />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};

export default BlogSearch;