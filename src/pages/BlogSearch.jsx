import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css';
import '../styles/BlogSearch.css';
import useScrollRestoration from '../hooks/useScrollRestoration';

const BlogSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  // Use the scroll restoration hook
  useScrollRestoration();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);
  const [displayPages, setDisplayPages] = useState([1, 2, 3]);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [mostViewedArticles, setMostViewedArticles] = useState([]);

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
    setSortOrder(e.target.value);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const maxPage = Math.ceil(searchResults.length / postsPerPage);
    
    if (page === 1) {
      setDisplayPages([1, 2, 3]);
    } else if (page === maxPage) {
      setDisplayPages([maxPage - 2, maxPage - 1, maxPage]);
    } else {
      setDisplayPages([page - 1, page, page + 1]);
    }
  };

  const handleDoubleChevronRight = () => {
    const maxPage = Math.ceil(searchResults.length / postsPerPage);
    setCurrentPage(maxPage);
    setDisplayPages([maxPage - 2, maxPage - 1, maxPage]);
  };

  const handleDoubleChevronLeft = () => {
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

  const handleSingleChevronRight = () => {
    const maxPage = Math.ceil(searchResults.length / postsPerPage);
    const newPage = Math.min(currentPage + 1, maxPage);
    handlePageChange(newPage);
  };

  const handleSingleChevronLeft = () => {
    const newPage = Math.max(currentPage - 1, 1);
    handlePageChange(newPage);
  };

  // Fetch articles from API with fallback to mock data
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fallback to mock data with all blog articles
      return [
        {
          id: 1,
          title: "Classic Chocolate Chip Cookies with Brown Butter",
          category: "Chocolate",
          publishedAt: "2025-03-15T00:00:00Z",
          views: 1250,
          image: "/images/cookie-types/chocolate-chip.webp",
          excerpt: "Elevate the classic chocolate chip cookie with the nutty depth of brown butter. These cookies have crispy edges, chewy centers and rich flavor that will impress everyone.",
          tags: ["chocolate", "easy", "classic", "brown butter", "baking"]
        },
        {
          id: 2,
          title: "Almond Flour Sugar Cookies with Citrus Glaze",
          category: "Gluten-Free",
          publishedAt: "2025-03-14T00:00:00Z",
          views: 980,
          image: "/images/cookie-types/sugar-cookie.webp",
          excerpt: "These gluten-free sugar cookies made with almond flour have a wonderful tender texture and delightful citrus glaze that makes them irresistible.",
          tags: ["gluten-free", "vegan", "holiday", "citrus", "almond"]
        },
        {
          id: 3,
          title: "No-Bake Chocolate Oatmeal Cookies",
          category: "No-Bake",
          publishedAt: "2025-03-13T00:00:00Z",
          views: 1560,
          image: "/images/cookie-types/oatmeal-raisin.webp",
          excerpt: "Perfect for hot summer days, these no-bake chocolate oatmeal cookies come together in minutes and satisfy your cookie cravings without turning on the oven.",
          tags: ["no-bake", "chocolate", "easy", "quick", "oatmeal"]
        },
        {
          id: 4,
          title: "Peanut Butter Chocolate Chip Cookies",
          category: "Chocolate",
          publishedAt: "2025-03-12T00:00:00Z",
          views: 1420,
          image: "/images/cookie-types/peanut-butter.webp",
          excerpt: "A perfect combination of peanut butter and chocolate in these soft and chewy cookies that will satisfy any sweet tooth.",
          tags: ["chocolate", "peanut butter", "easy", "kids", "classic"]
        },
        {
          id: 5,
          title: "Classic Snickerdoodle Cookies",
          category: "Classic",
          publishedAt: "2025-03-11T00:00:00Z",
          views: 1100,
          image: "/images/cookie-types/snickerdoodle.webp",
          excerpt: "Soft and chewy cinnamon sugar cookies that are perfect for any occasion. These classic cookies are always a crowd favorite.",
          tags: ["classic", "cinnamon", "holiday", "easy", "baking"]
        },
        {
          id: 6,
          title: "French Macarons with Raspberry Filling",
          category: "Specialty",
          publishedAt: "2025-03-10T00:00:00Z",
          views: 980,
          image: "/images/cookie-types/macaron.webp",
          excerpt: "Delicate French macarons with a sweet raspberry filling. These elegant cookies are perfect for special occasions.",
          tags: ["french", "macarons", "raspberry", "specialty", "elegant"]
        },
        {
          id: 7,
          title: "Lemon Glazed Shortbread Cookies",
          category: "Classic",
          publishedAt: "2025-03-09T00:00:00Z",
          views: 950,
          image: "/images/cookie-types/lemon-glazed.webp",
          excerpt: "Buttery shortbread cookies with a tangy lemon glaze that adds the perfect balance of sweetness and citrus.",
          tags: ["classic", "lemon", "shortbread", "citrus", "buttery"]
        },
        {
          id: 8,
          title: "Double Chocolate Cookies",
          category: "Chocolate",
          publishedAt: "2025-03-08T00:00:00Z",
          views: 1200,
          image: "/images/cookie-types/double-chocolate.webp",
          excerpt: "Rich and decadent double chocolate cookies that are perfect for chocolate lovers. These cookies are packed with chocolate chips and cocoa powder.",
          tags: ["chocolate", "decadent", "rich", "double chocolate", "indulgent"]
        },
        {
          id: 9,
          title: "Red Velvet Cookies with Cream Cheese Frosting",
          category: "Specialty",
          publishedAt: "2025-03-07T00:00:00Z",
          views: 1300,
          image: "/images/cookie-types/red-velvet.webp",
          excerpt: "Soft and chewy red velvet cookies topped with a rich cream cheese frosting. Perfect for Valentine's Day or any special occasion.",
          tags: ["red velvet", "cream cheese", "specialty", "holiday", "decadent"]
        },
        {
          id: 10,
          title: "Gingerbread Cookies with Royal Icing",
          category: "Seasonal",
          publishedAt: "2025-03-06T00:00:00Z",
          views: 1100,
          image: "/images/cookie-types/gingerbread.webp",
          excerpt: "Classic gingerbread cookies with warm spices and molasses. Perfect for the holiday season or any time you want a cozy treat.",
          tags: ["gingerbread", "seasonal", "holiday", "spiced", "classic"]
        },
        {
          id: 11,
          title: "White Chocolate Cranberry Cookies",
          category: "Chocolate",
          publishedAt: "2025-03-05T00:00:00Z",
          views: 1000,
          image: "/images/cookie-types/white-chocolate.webp",
          excerpt: "Soft and chewy cookies packed with white chocolate chips and dried cranberries. A perfect balance of sweet and tart.",
          tags: ["white chocolate", "cranberry", "chocolate", "fruity", "holiday"]
        },
        {
          id: 12,
          title: "Pumpkin Spice Cookies",
          category: "Seasonal",
          publishedAt: "2025-03-04T00:00:00Z",
          views: 1200,
          image: "/images/cookie-types/pumpkin-spice.webp",
          excerpt: "Warm and cozy pumpkin spice cookies that are perfect for fall. These cookies are packed with pumpkin and warm spices.",
          tags: ["pumpkin", "spice", "seasonal", "fall", "warm"]
        },
        {
          id: 13,
          title: "Salted Caramel Chocolate Cookies",
          category: "Chocolate",
          publishedAt: "2025-03-03T00:00:00Z",
          views: 1350,
          image: "/images/cookie-types/salted-caramel.webp",
          excerpt: "Rich chocolate cookies with a gooey salted caramel center. These cookies are the perfect combination of sweet and salty.",
          tags: ["chocolate", "caramel", "salted", "decadent", "indulgent"]
        },
        {
          id: 14,
          title: "Almond Biscotti",
          category: "Specialty",
          publishedAt: "2025-03-02T00:00:00Z",
          views: 950,
          image: "/images/cookie-types/almond-biscotti.webp",
          excerpt: "Crunchy almond biscotti that are perfect for dipping in coffee or tea. These Italian cookies are twice-baked for extra crispiness.",
          tags: ["almond", "biscotti", "italian", "crunchy", "coffee"]
        },
        {
          id: 15,
          title: "Matcha Green Tea Cookies",
          category: "Specialty",
          publishedAt: "2025-03-01T00:00:00Z",
          views: 1050,
          image: "/images/cookie-types/matcha-green.webp",
          excerpt: "Delicate and flavorful matcha green tea cookies that are perfect with a cup of tea. These cookies have a beautiful green color and unique flavor.",
          tags: ["matcha", "green tea", "japanese", "specialty", "unique"]
        }
      ];
    }
  };

  // Check for new articles periodically
  const checkForUpdates = async () => {
    const articles = await fetchArticles();
    if (articles.length > 0) {
      const latestArticle = articles[0];
      if (!lastUpdateTime || new Date(latestArticle.publishedAt) > new Date(lastUpdateTime)) {
        setLastUpdateTime(latestArticle.publishedAt);
        return articles;
      }
    }
    return null;
  };

  useEffect(() => {
    // Set up periodic check for new articles (every 5 minutes)
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
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(updateInterval);
  }, [lastUpdateTime]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      
      try {
        // Fetch articles from API
        const articles = await fetchArticles();
        
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
      const articles = await fetchArticles();
      setMostViewedArticles(getMostViewedArticles(articles));
    };
    fetchAndSetMostViewed();
  }, []);

  return (
    <div className="blog-search-page">
      <div className="blog-search-container">
        {/* Mobile view: Search bar at top */}
        <div className="blog-search-bar-section mobile-only">
          <h3 className="blog-sidebar-title">Search Bar</h3>
          <form className="blog-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              name="search"
              placeholder="Search recipes..."
              defaultValue={query}
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
            <h3 className="blog-sidebar-title">Search Bar</h3>
            <form className="blog-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                name="search"
                placeholder="Search recipes..."
                defaultValue={query}
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
                  <img
                    src={post.image}
                    alt={post.title}
                    className="blog-popular-post-image"
                  />
                  <div className="blog-popular-post-content">
                    <h4>
                      <Link to={`/article/${post.id}`}>{post.title}</Link>
                    </h4>
                    <div>
                      <span className="blog-popular-post-date">{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span className="blog-popular-post-views">
                        <i className="fas fa-eye"></i> {post.views}
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
              {categories.map(category => (
                <li key={category.name}>
                  <Link to={category.path}>
                    {category.name}
                    <span className="count">
                      {searchResults.filter(post => post.category === category.name).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content - Search results */}
        <main className="blog-search-main">
          <div className="blog-search-header">
            <h2 className="blog-section-title">Search Results for "{query}"</h2>
            <div className="blog-posts-controls">
              <div className="posts-per-page-selector">
                <label>Show:</label>
                <select
                  className="posts-per-page-dropdown"
                  value={postsPerPage}
                  onChange={handlePostsPerPageChange}
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                </select>
              </div>
              <div className="posts-sort-selector">
                <label>Sort by:</label>
                <select
                  className="posts-sort-dropdown"
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most_viewed">Most Viewed</option>
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
                    <div className="blog-post-image">
                      <img src={post.image} alt={post.title} />
                      <span className="blog-post-category-badge">{post.category}</span>
                    </div>
                    <div className="blog-post-content">
                      <div className="blog-post-meta">
                        <span className="blog-post-date">{post.date}</span>
                        <span className="blog-post-views">
                          <i className="fas fa-eye"></i> {post.views}
                        </span>
                      </div>
                      <h3 className="blog-post-title">
                        <Link to={`/article/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="blog-post-excerpt">{post.excerpt}</p>
                      <Link to={`/article/${post.id}`} className="blog-read-more">
                        Read More <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="blog-pagination">
                <button
                  className="blog-pagination-button"
                  onClick={handleDoubleChevronLeft}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  className="blog-pagination-button"
                  onClick={handleSingleChevronLeft}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                {displayPages.map(page => (
                  <button
                    key={page}
                    className={`blog-pagination-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    disabled={page > totalPages}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="blog-pagination-button"
                  onClick={handleSingleChevronRight}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  className="blog-pagination-button"
                  onClick={handleDoubleChevronRight}
                  disabled={currentPage === totalPages}
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
                  <img
                    src={post.image}
                    alt={post.title}
                    className="blog-popular-post-image"
                  />
                  <div className="blog-popular-post-content">
                    <h4>
                      <Link to={`/article/${post.id}`}>{post.title}</Link>
                    </h4>
                    <div>
                      <span className="blog-popular-post-date">{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span className="blog-popular-post-views">
                        <i className="fas fa-eye"></i> {post.views}
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
              {categories.map(category => (
                <li key={category.name}>
                  <Link to={category.path}>
                    {category.name}
                    <span className="count">
                      {searchResults.filter(post => post.category === category.name).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSearch; 