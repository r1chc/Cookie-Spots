import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css';
import '../styles/BlogSearch.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import SearchButton from '../components/SearchButton';
import { mockArticles } from '../data/mockArticles';
import { getArticlesWithUpdatedViewCounts } from '../utils/viewCountUtils';

const BlogSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  // Use the scroll restoration hook
  useScrollRestoration();

  const [searchResults, setSearchResults] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(4);
  const [displayPages, setDisplayPages] = useState([1, 2, 3]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [mostViewedArticles, setMostViewedArticles] = useState([]);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Reuse categories from BlogPage
  const categories = [
    { name: 'Chocolate', image: '/images/cookie-types/chocolate-chip.webp', path: '/category/chocolate' },
    { name: 'Gluten-Free', image: '/images/cookie-types/sugar-cookie.webp', path: '/category/gluten-free' },
    { name: 'No-Bake', image: '/images/cookie-types/oatmeal-raisin.webp', path: '/category/no-bake' },
    { name: 'Vegan', image: '/images/cookie-types/macaron.webp', path: '/category/vegan' },
    { name: 'Classic', image: '/images/cookie-types/snickerdoodle.webp', path: '/category/classic' },
    { name: 'Specialty', image: '/images/cookie-types/red-velvet.webp', path: '/category/specialty' },
    { name: 'Seasonal', image: '/images/cookie-types/gingerbread.webp', path: '/category/seasonal' },
    { name: 'Healthy', image: '/images/cookie-types/almond-biscotti.webp', path: '/category/healthy' }
  ];

  // Calculate relevance score for a post
  const calculateRelevance = (post, searchQuery) => {
    const searchTerms = searchQuery.toLowerCase().split(' ');
    let score = 0;

    // Check title matches (highest weight)
    searchTerms.forEach(term => {
      if (post.title.toLowerCase().includes(term)) score += 3;
    });

    // Check category matches
    searchTerms.forEach(term => {
      if (post.category.toLowerCase().includes(term)) score += 2;
    });

    // Check excerpt matches
    searchTerms.forEach(term => {
      if (post.excerpt.toLowerCase().includes(term)) score += 1;
    });

    // Check tag matches
    if (post.tags) {
      searchTerms.forEach(term => {
        post.tags.forEach(tag => {
          if (tag.toLowerCase().includes(term)) score += 2;
        });
      });
    }

    return score;
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    navigate(`/blogsearch?q=${encodeURIComponent(searchInput)}`);
  };

  // Handle posts per page change
  const handlePostsPerPageChange = (e) => {
    const newPostsPerPage = parseInt(e.target.value);
    setPostsPerPage(newPostsPerPage);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);

    // Create a date parser function
    const parseDate = (dateStr) => {
      const [month, day, year] = dateStr.replace(',', '').split(' ');
      const monthMap = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 
        'May': 4, 'June': 5, 'July': 6, 'August': 7, 
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      return new Date(parseInt(year), monthMap[month], parseInt(day));
    };

    // Sort the posts
    const newSortedResults = [...searchResults].sort((a, b) => {
      switch (newSortOrder) {
        case 'newest':
          return parseDate(b.date).getTime() - parseDate(a.date).getTime();
        case 'oldest':
          return parseDate(a.date).getTime() - parseDate(b.date).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
        case 'most_viewed':
          return b.views - a.views;
        case 'least_viewed':
          return a.views - b.views;
        default:
          return 0;
      }
    });

    setSearchResults(newSortedResults);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the search results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDoubleChevronRight = () => {
    const maxPage = Math.ceil(searchResults.length / postsPerPage);
    const newPages = [...displayPages];
    if (newPages[2] + 2 <= maxPage) {
      newPages[0] = newPages[0] + 2;
      newPages[1] = newPages[1] + 2;
      newPages[2] = newPages[2] + 2;
      setDisplayPages(newPages);
    } else if (newPages[2] < maxPage) {
      // If there's only one page left to move, move to the last page
      newPages[0] = maxPage - 2;
      newPages[1] = maxPage - 1;
      newPages[2] = maxPage;
      setDisplayPages(newPages);
    }
  };

  const handleDoubleChevronLeft = () => {
    const newPages = [...displayPages];
    if (newPages[0] > 2) {
      newPages[0] = newPages[0] - 2;
      newPages[1] = newPages[1] - 2;
      newPages[2] = newPages[2] - 2;
      setDisplayPages(newPages);
    } else if (newPages[0] === 2) {
      // If there's only one page left to move, move to the first page
      newPages[0] = 1;
      newPages[1] = 2;
      newPages[2] = 3;
      setDisplayPages(newPages);
    }
  };

  const handleSingleChevronRight = () => {
    const maxPage = Math.ceil(searchResults.length / postsPerPage);
    const newPages = [...displayPages];
    if (newPages[2] + 1 <= maxPage) {
      newPages[0] = newPages[0] + 1;
      newPages[1] = newPages[1] + 1;
      newPages[2] = newPages[2] + 1;
      setDisplayPages(newPages);
    }
  };

  const handleSingleChevronLeft = () => {
    const newPages = [...displayPages];
    if (newPages[0] > 1) {
      newPages[0] = newPages[0] - 1;
      newPages[1] = newPages[1] - 1;
      newPages[2] = newPages[2] - 1;
      setDisplayPages(newPages);
    }
  };

  // Fetch articles from API with fallback to mock data
  const fetchArticles = async () => {
    try {
      // Skip real API call to prevent 429 errors
      /*
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      return data;
      */
      throw new Error('Skipping API call');
    } catch (error) {
      console.log('Using local article data instead of API');
      // Use the utility function instead of trying to require mockArticles
      return getArticlesWithUpdatedViewCounts().map(article => ({
        ...article,
        publishedAt: article.date // Map date to publishedAt for compatibility
      }));
    }
  };

  // Check for new articles periodically
  const checkForUpdates = async () => {
    // Skip API call and just use local data
    return getArticlesWithUpdatedViewCounts().map(article => ({
      ...article,
      publishedAt: article.date
    }));
  };

  useEffect(() => {
    // Reduce periodic check frequency to once every 10 minutes instead of 5
    const updateInterval = setInterval(async () => {
      const newArticles = await checkForUpdates();
      if (newArticles) {
        setSearchResults(prevResults => {
          // Merge new articles with existing results
          const existingIds = new Set(prevResults.map(article => article.id));
          const uniqueNewArticles = newArticles.filter(article => !existingIds.has(article.id));
          return [...uniqueNewArticles, ...prevResults];
        });
      }
    }, 10 * 60 * 1000); // 10 minutes (doubled from 5)

    return () => clearInterval(updateInterval);
  }, [lastUpdateTime]);

  // Add this new function to handle category clicks
  const handleCategoryClick = (categoryName, e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1
    setDisplayPages([1, 2, 3]); // Reset display pages
    // Use navigate with replace to prevent building up history
    navigate(`/blogsearch?q=${encodeURIComponent(categoryName)}`, { replace: true });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update useEffect to reset pagination when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setCurrentPage(1); // Reset to page 1
      setDisplayPages([1, 2, 3]); // Reset display pages
      
      try {
        // Get articles directly from utility function to avoid API calls
        const articles = getArticlesWithUpdatedViewCounts().map(article => ({
          ...article,
          publishedAt: article.date
        }));
        
        setAllArticles(articles);
        
        // Filter and sort results based on search query
        const filteredResults = articles.filter(post => {
          const searchTerms = query.toLowerCase().split(' ');
          return searchTerms.some(term => 
            post.title.toLowerCase().includes(term) ||
            post.category.toLowerCase().includes(term) ||
            post.excerpt.toLowerCase().includes(term) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
          );
        });

        // Sort results by relevance score
        const sortedResults = filteredResults.sort((a, b) => {
          const scoreA = calculateRelevance(a, query);
          const scoreB = calculateRelevance(b, query);
          return scoreB - scoreA;
        });

        setSearchResults(sortedResults);
        if (sortedResults.length > 0) {
          setLastUpdateTime(sortedResults[0].publishedAt);
        }
      } catch (error) {
        console.error('Error in search:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
      // Scroll to top when query changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [query]);

  // Calculate current posts to display
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = searchResults.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(searchResults.length / postsPerPage);

  // Add this function to get the most viewed articles
  const getMostViewedArticles = (articles) => {
    return [...articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 3);
  };

  // Add useEffect to fetch and set most viewed articles
  useEffect(() => {
    const fetchAndSetMostViewed = async () => {
      // Use utility function instead of API call
      const articles = getArticlesWithUpdatedViewCounts().map(article => ({
        ...article,
        publishedAt: article.date
      }));
      setMostViewedArticles(getMostViewedArticles(articles));
    };
    fetchAndSetMostViewed();
  }, []);

  const handleImageLoad = (id) => {
    setImageLoadingStates({ ...imageLoadingStates, [id]: false });
  };

  const handleImageError = (id, e) => {
    console.error(`Error loading image for post ${id}:`, e);
    setImageLoadingStates({ ...imageLoadingStates, [id]: false });
  };

  // Listen for view updates
  useEffect(() => {
    const handleViewsUpdate = (e) => {
      const { articleId, views } = e.detail;
      setSearchResults(prevResults => 
        prevResults.map(result => 
          result.id === articleId 
            ? { ...result, views: views } 
            : result
        )
      );
      
      // Update all articles list as well
      setAllArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === articleId 
            ? { ...article, views: views } 
            : article
        )
      );
    };

    window.addEventListener('articleViewsUpdated', handleViewsUpdate);
    return () => {
      window.removeEventListener('articleViewsUpdated', handleViewsUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="blog-search-page">
        <div className="blog-search-container">
          {/* Mobile view: Search bar at top */}
          <div className="blog-search-bar-section mobile-only">
            <h3 className="blog-sidebar-title">Search Recipes</h3>
            <form className="blog-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                name="search"
                placeholder="Search Recipes..."
              />
              <button type="submit">
                <i className="fas fa-search"></i>
              </button>
            </form>
            {query && (
              <div className="search-keywords">
                <h4>Search Keywords:</h4>
                <div className="blog-tags-cloud">
                  {query.split(' ').map((keyword, index) => (
                    <span key={index} className="blog-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop view: Left column with search bar and navigation */}
          <aside className="blog-search-sidebar desktop-only">
            <div className="blog-search-bar-section">
              <h3 className="blog-sidebar-title">Search Recipes</h3>
              <form className="blog-search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  name="search"
                  placeholder="Search Recipes..."
                />
                <button type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>
              {query && (
                <div className="search-keywords">
                  <h4>Search Keywords:</h4>
                  <div className="blog-tags-cloud">
                    {query.split(' ').map((keyword, index) => (
                      <span key={index} className="blog-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Popular Recipes</h3>
              <ul className="blog-popular-posts">
                {mostViewedArticles.map(post => (
                  <li key={post.id} className="blog-popular-post">
                    <Link to={`/article/${post.id}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="blog-popular-post-image"
                      />
                    </Link>
                    <div className="blog-popular-post-content">
                      <h4>
                        <Link to={`/article/${post.id}`}>{post.title}</Link>
                      </h4>
                      <div>
                        <span className="blog-popular-post-date">{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span className="blog-popular-post-views">
                          <i className="fas fa-eye"></i> {post.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Categories</h3>
              <ul className="blog-categories-list">
                {categories.map(category => {
                  const count = allArticles.filter(post => {
                    const matchByCategory = post.category.toLowerCase() === category.name.toLowerCase();
                    const matchByTags = post.tags && post.tags.some(tag => 
                      tag.toLowerCase() === category.name.toLowerCase()
                    );
                    return matchByCategory || matchByTags;
                  }).length;
                  
                  return (
                    <li key={category.name}>
                      <a
                        href={`/blogsearch?q=${encodeURIComponent(category.name)}`}
                        onClick={(e) => handleCategoryClick(category.name, e)}
                      >
                        {category.name} <span className="count">{count}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Main content - Search results */}
          <main className="blog-search-main">
            <div className="blog-search-header">
              <h2 className="blog-section-title">Search Results for "{query}"</h2>
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
                    <option value={searchResults.length}>All</option>
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

            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <>
                <div className="blog-posts-grid">
                  {currentPosts.map(post => (
                    <article key={post.id} className="blog-post">
                      <div className={`blog-post-image ${imageLoadingStates[post.id] ? 'loading' : ''}`}>
                        <Link to={`/article/${post.id}`}>
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="eager"
                            onLoad={() => handleImageLoad(post.id)}
                            onError={(e) => handleImageError(post.id, e)}
                            crossOrigin="anonymous"
                          />
                        </Link>
                        <div className="blog-post-category-badge">{post.category}</div>
                      </div>
                      <div className="blog-post-content">
                        <div className="blog-post-meta">
                          <span className="blog-post-date">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="blog-post-author">By CookieSpots</span>
                          <span className="blog-post-views">
                            <i className="fas fa-eye"></i> {post.views.toLocaleString()} views
                          </span>
                        </div>
                        <h3 className="blog-post-title">
                          <Link to={`/article/${post.id}`}>{post.title}</Link>
                        </h3>
                        <p className="blog-post-excerpt">{post.excerpt}</p>
                        <Link to={`/article/${post.id}`} className="blog-read-more">
                          Read Recipe <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="blog-pagination">
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
                    page <= Math.ceil(searchResults.length / postsPerPage) && (
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
                    disabled={displayPages[2] >= Math.ceil(searchResults.length / postsPerPage)}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button 
                    className="blog-pagination-button"
                    onClick={handleDoubleChevronRight}
                    disabled={displayPages[2] >= Math.ceil(searchResults.length / postsPerPage)}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
              </>
            )}
          </main>

          {/* Mobile view: Popular recipes and categories at bottom */}
          <div className="mobile-only">
            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Popular Recipes</h3>
              <ul className="blog-popular-posts">
                {mostViewedArticles.map(post => (
                  <li key={post.id} className="blog-popular-post">
                    <Link to={`/article/${post.id}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="blog-popular-post-image"
                      />
                    </Link>
                    <div className="blog-popular-post-content">
                      <h4>
                        <Link to={`/article/${post.id}`}>{post.title}</Link>
                      </h4>
                      <div>
                        <span className="blog-popular-post-date">{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span className="blog-popular-post-views">
                          <i className="fas fa-eye"></i> {post.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Categories</h3>
              <ul className="blog-categories-list">
                {categories.map(category => {
                  const count = allArticles.filter(post => {
                    const matchByCategory = post.category.toLowerCase() === category.name.toLowerCase();
                    const matchByTags = post.tags && post.tags.some(tag => 
                      tag.toLowerCase() === category.name.toLowerCase()
                    );
                    return matchByCategory || matchByTags;
                  }).length;
                  
                  return (
                    <li key={category.name}>
                      <a
                        href={`/blogsearch?q=${encodeURIComponent(category.name)}`}
                        onClick={(e) => handleCategoryClick(category.name, e)}
                      >
                        {category.name} <span className="count">{count}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <SearchButton />
    </div>
  );
};

export default BlogSearch; 