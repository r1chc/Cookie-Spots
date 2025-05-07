import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css';
import '../styles/SearchResults.css';
import FloatingActionButtons from '../components/FloatingActionButtons';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);
  const [displayPages, setDisplayPages] = useState([1, 2, 3]);
  const [sortOrder, setSortOrder] = useState('relevance');
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
    navigate(`/search?q=${encodeURIComponent(searchInput)}`);
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

  const handleImageLoad = (postId) => {
    console.log(`Image loaded successfully for post ${postId}`);
    setImageLoadingStates(prev => ({
      ...prev,
      [postId]: false
    }));
  };

  const handleImageError = (postId, e) => {
    console.error(`Error loading image for post ${postId}:`, e.target.src);
    setImageLoadingStates(prev => ({
      ...prev,
      [postId]: false
    }));
    e.target.onerror = null;
    // Try a different fallback image path
    const fallbackImage = "/images/cookie-types/chocolate-chip.webp";
    console.log(`Attempting to load fallback image: ${fallbackImage}`);
    e.target.src = fallbackImage;
  };

  // Preload images when component mounts
  useEffect(() => {
    const preloadImages = () => {
      searchResults.forEach(post => {
        const img = new Image();
        img.src = post.image;
        img.onload = () => {
          console.log(`Preloaded image: ${post.image}`);
          setImageLoadingStates(prev => ({
            ...prev,
            [post.id]: false
          }));
        };
        img.onerror = () => {
          console.error(`Failed to preload image: ${post.image}`);
          setImageLoadingStates(prev => ({
            ...prev,
            [post.id]: false
          }));
        };
      });
    };

    if (searchResults.length > 0) {
      preloadImages();
    }
  }, [searchResults]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      
      // In a real application, this would be an API call
      // For now, we'll use the mock data from BlogPage
      const mockPosts = [
        {
          id: 1,
          title: "Classic Chocolate Chip Cookies",
          category: "Recipes",
          date: "2024-04-15",
          views: 1250,
          image: "/images/cookie-types/chocolate-chip.webp",
          excerpt: "Learn how to make the perfect chocolate chip cookies with this classic recipe.",
          tags: ["cookies", "chocolate", "baking"]
        },
        {
          id: 2,
          title: "Soft and Chewy Sugar Cookies",
          category: "Recipes",
          date: "2024-04-14",
          views: 980,
          image: "/images/cookie-types/sugar-cookie.webp",
          excerpt: "Discover the secret to making soft and chewy sugar cookies that melt in your mouth.",
          tags: ["cookies", "sugar", "baking"]
        },
        {
          id: 3,
          title: "Homemade Snickerdoodles",
          category: "Recipes",
          date: "2024-04-13",
          views: 850,
          image: "/images/cookie-types/snickerdoodle.webp",
          excerpt: "A step-by-step guide to making delicious cinnamon-sugar snickerdoodles.",
          tags: ["cookies", "cinnamon", "baking"]
        },
        {
          id: 4,
          title: "Perfect Peanut Butter Cookies",
          category: "Recipes",
          date: "2024-04-12",
          views: 720,
          image: "/images/cookie-types/peanut-butter.webp",
          excerpt: "Crispy on the outside, chewy on the inside peanut butter cookies.",
          tags: ["cookies", "peanut butter", "baking"]
        },
        {
          id: 5,
          title: "French Macarons",
          category: "Recipes",
          date: "2024-04-11",
          views: 1100,
          image: "/images/cookie-types/macaron.webp",
          excerpt: "Master the art of making delicate French macarons with this detailed guide.",
          tags: ["cookies", "macarons", "baking"]
        },
        {
          id: 6,
          title: "Classic Oatmeal Raisin Cookies",
          category: "Recipes",
          date: "2024-04-10",
          views: 650,
          image: "/images/cookie-types/oatmeal-raisin.webp",
          excerpt: "A healthy twist on classic cookies with oats and raisins.",
          tags: ["cookies", "oatmeal", "baking"]
        },
        {
          id: 7,
          title: "Gingerbread Cookies",
          category: "Recipes",
          date: "2024-04-09",
          views: 890,
          image: "/images/cookie-types/gingerbread.webp",
          excerpt: "Spiced gingerbread cookies perfect for the holiday season.",
          tags: ["cookies", "gingerbread", "baking"]
        },
        {
          id: 8,
          title: "Lemon Glazed Cookies",
          category: "Recipes",
          date: "2024-04-08",
          views: 780,
          image: "/images/cookie-types/lemon-glazed.webp",
          excerpt: "Bright and tangy lemon cookies with a sweet glaze.",
          tags: ["cookies", "lemon", "baking"]
        }
      ];

      // Filter and sort results based on search query
      const filteredResults = mockPosts.filter(post => {
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
      setLoading(false);
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

  return (
    <div className="search-results-page">
      <div className="search-results-container">
        <aside className="search-results-sidebar">
          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Search</h3>
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
              {searchResults.slice(0, 5).map(post => (
                <li key={post.id} className="blog-popular-post">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="blog-popular-post-image"
                    loading="eager"
                    onLoad={() => handleImageLoad(post.id)}
                    onError={(e) => handleImageError(post.id, e)}
                    crossOrigin="anonymous"
                  />
                  <div className="blog-popular-post-content">
                    <h4>
                      <Link to={`/article/${post.id}`}>{post.title}</Link>
                    </h4>
                    <div>
                      <span className="blog-popular-post-date">{post.date}</span>
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

        <main className="search-results-main">
          <div className="search-results-header">
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
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};

export default SearchResults; 