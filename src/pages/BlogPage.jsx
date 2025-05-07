import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { loadAllArticles, getArticlesWithUpdatedViewCounts } from '../utils/articleLoader';
import FloatingActionButtons from '../components/FloatingActionButtons';
import SearchButton from '../components/SearchButton';
import BlogSidebar from '../components/BlogSidebar';

const BlogPage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [displayPages, setDisplayPages] = useState([1, 2, 3]);
  const [postsPerPage, setPostsPerPage] = useState(4);
  const [sortOrder, setSortOrder] = useState('newest');
  const [originalPosts, setOriginalPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 770 && window.innerWidth > 480);
  const [isLargeTablet, setIsLargeTablet] = useState(window.innerWidth <= 992 && window.innerWidth > 770);
  const [categoryCount, setCategoryCount] = useState({});
  const [sidebarCategoryCount, setSidebarCategoryCount] = useState({});
  const totalPages = Math.ceil(Math.max(0, sortedPosts.length - 1) / postsPerPage);
  const navigate = useNavigate();
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const [articlesWithViews, setArticlesWithViews] = useState([]);
  const [showFloatingActions, setShowFloatingActions] = useState(false);

  // Force scroll to top when component mounts
  useEffect(() => {
    // Use requestAnimationFrame to ensure this runs after any other scroll operations
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  // Fetch initial posts using the loader
  useEffect(() => {
    const fetchInitialPosts = async () => {
      setLoading(true);
      try {
        const loadedPosts = await loadAllArticles();
        
        // Initial sort (newest first)
        const initialSortedPosts = [...loadedPosts].sort((a, b) => 
          new Date(b.publishedAt) - new Date(a.publishedAt)
        );

        setPosts(loadedPosts); // Keep unsorted version if needed elsewhere
        setOriginalPosts(loadedPosts); // Store the original loaded order
        setSortedPosts(initialSortedPosts); // Set the initially sorted posts
        setError(null);
      } catch (err) {
        console.error('Error fetching initial posts:', err);
        setError('Could not load blog posts.');
        setPosts([]);
        setOriginalPosts([]);
        setSortedPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialPosts();
  }, []); // Run only on mount

  // Calculate category counts and popular tags when originalPosts changes
  useEffect(() => {
    if (!originalPosts || originalPosts.length === 0) return;

    // --- Calculate Category Counts (for both featured and sidebar) ---
    const counts = {};
    const sidebarCounts = {};
    // Define categories structure here or import from a shared place
    const categoriesData = [
      { name: 'Chocolate' }, { name: 'Gluten-Free' }, { name: 'No-Bake' }, 
      { name: 'Vegan' }, { name: 'Classic' }, { name: 'Specialty' }, 
      { name: 'Seasonal' }, { name: 'Healthy' }
    ];

    categoriesData.forEach(category => {
      const categoryNameLower = category.name.toLowerCase();
      // Count for both featured and sidebar using exact match
      const count = originalPosts.filter(post => post.category.toLowerCase() === categoryNameLower).length;
      sidebarCounts[category.name] = count;
      counts[category.name] = count; // Use the same count for featured section
    });
    setCategoryCount(counts); // For featured section
    setSidebarCategoryCount(sidebarCounts); // For sidebar list

    // --- Calculate Popular Tags ---
    const tagScores = {};
    originalPosts.forEach(post => {
      if (post.tags) {
        const tagPoints = (post.views || 0) / 100; // Use views from loaded data
        post.tags.forEach(tag => {
          tagScores[tag] = (tagScores[tag] || 0) + tagPoints;
        });
      }
    });
    const sortedTagNames = Object.entries(tagScores)
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag);
    setPopularTags(sortedTagNames.slice(0, 6));

  }, [originalPosts]);

  // Update resize listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 480);
      setIsTablet(width <= 770 && width > 480);
      setIsLargeTablet(width <= 992 && width > 770);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Categories data
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

  // Calculate current posts to display
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = currentPage === 1 ? 1 : indexOfLastPost - postsPerPage;
  const currentPosts = currentPage === 1 
    ? sortedPosts.slice(1, postsPerPage + 1)
    : sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handleImageLoad = (postId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [postId]: false
    }));
  };

  const handleImageError = (postId, e) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [postId]: false
    }));
    e.target.onerror = null;
    e.target.src = "/images/cookie-types/chocolate-chip.webp";
  };

  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

  const handlePostsPerPageChange = (e) => {
    const newPostsPerPage = parseInt(e.target.value);
    setPostsPerPage(newPostsPerPage);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

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

  const formatViews = (views) => {
    return views.toLocaleString('en-US');
  };

  const getVisibleItems = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isLargeTablet) return 3;
    return 5;
  };

  const handleCategoryNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentCategoryIndex(prev => 
        prev + 1 >= categories.length - getVisibleItems() + 1 ? prev : prev + 1
      );
    } else {
      setCurrentCategoryIndex(prev => 
        prev - 1 < 0 ? 0 : prev - 1
      );
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/blogsearch?q=${encodeURIComponent(categoryName)}`);
  };

  const handleSliderClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const maxScroll = categories.length - getVisibleItems();
    const newPosition = Math.round(percentage * maxScroll);
    setCurrentCategoryIndex(Math.max(0, Math.min(newPosition, maxScroll)));
  };

  const handleSliderDragStart = (e) => {
    setIsDragging(true);
  };

  const handleSliderDragMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const maxScroll = categories.length - getVisibleItems();
    const newPosition = Math.round(percentage * maxScroll);
    setCurrentCategoryIndex(Math.max(0, Math.min(newPosition, maxScroll)));
  };

  const handleSliderDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleSliderDragMove);
    document.removeEventListener('mouseup', handleSliderDragEnd);
  };

  // Calculate slider position and width
  const calculateSliderStyle = () => {
    const maxScroll = categories.length - getVisibleItems();
    const percentage = currentCategoryIndex / maxScroll;
    const handlePosition = `${percentage * 100}%`;
    const trackWidth = `${(getVisibleItems() / categories.length) * 100}%`;
    const trackPosition = `${(currentCategoryIndex / categories.length) * 100}%`;
    
    return {
      handle: { left: handlePosition },
      track: { left: trackPosition, width: trackWidth }
    };
  };

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    navigate(`/blogsearch?q=${encodeURIComponent(searchInput)}`);
  };

  const scrollToLatestRecipes = () => {
    const latestRecipesSection = document.querySelector('.blog-posts');
    if (latestRecipesSection) {
      const isMobile = window.innerWidth <= 770;
      const isTablet = window.innerWidth > 770 && window.innerWidth <= 1024;
      const offset = isMobile ? 70 : isTablet ? 85 : 100; // Added tablet offset
      const elementPosition = latestRecipesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToFeaturedCategories = () => {
    const featuredCategoriesSection = document.querySelector('.blog-featured-categories');
    if (featuredCategoriesSection) {
      const isMobile = window.innerWidth <= 770;
      const isTablet = window.innerWidth > 770 && window.innerWidth <= 1024;
      const offset = isMobile ? 60 : isTablet ? 75 : 80; // Added tablet offset
      const elementPosition = featuredCategoriesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
    // Scroll to the Latest Recipes section
    scrollToLatestRecipes();
  };

  const handleDoubleChevronRight = () => {
    const newPages = [...displayPages];
    if (newPages[2] + 2 <= totalPages) {
      newPages[0] = newPages[0] + 2;
      newPages[1] = newPages[1] + 2;
      newPages[2] = newPages[2] + 2;
      setDisplayPages(newPages);
    } else if (newPages[2] < totalPages) {
      // If there's only one page left to move, move to the last page
      newPages[0] = totalPages - 2;
      newPages[1] = totalPages - 1;
      newPages[2] = totalPages;
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
    const newPages = [...displayPages];
    if (newPages[2] + 1 <= totalPages) {
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

  useEffect(() => {
    const fetchArticles = async () => {
      const articles = await getArticlesWithUpdatedViewCounts();
      setArticlesWithViews(articles);
    };
    fetchArticles();
  }, []);

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

  if (loading) {
    return <div className="blog-container">Loading posts...</div>;
  }
  if (error) {
    return <div className="blog-container">Error: {error}</div>;
  }

  return (
    <div className="blog-page-wrapper">
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        {/* Hero Section */}
        <section className="blog-hero">
          <img 
            src="/images/blog/blog-hero.jpg" 
            alt="Cookie Blog Hero" 
            className="blog-hero-image"
            loading="eager"
            width="1920"
            height="500"
          />
          <div className="blog-hero-overlay">
            <h2>CookieSpots Recipes & Blog</h2>
            <p>Discover delicious cookie recipes, baking tips, and sweet inspiration for every occasion.</p>
            <div className="blog-hero-buttons">
              <button onClick={scrollToLatestRecipes} className="blog-cta-button">Explore Recipes</button>
              <button onClick={scrollToFeaturedCategories} className="blog-cta-button search-articles">Search Articles</button>
            </div>
          </div>
        </section>

        <div className="blog-content-wrapper">
          <main className="blog-main-content">
            {/* Featured Categories */}
            <section className="blog-featured-categories">
              <h3 className="blog-section-title">Featured Categories</h3>
              <Slider {...sliderSettings} className="category-slider">
                {categories.map((category, index) => (
                  <div key={index} className="category-card-wrapper">
                    <div
                      className="category-card"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <img src={category.image} alt={category.name} />
                      <h3>{category.name}</h3>
                    </div>
                  </div>
                ))}
              </Slider>
            </section>

            {/* Blog Posts */}
            <section className="blog-posts">
              <div className="blog-posts-header">
                <h3 className="blog-section-title">Latest Recipes</h3>
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
                      <option value={posts.length}>All</option>
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
              <div className="blog-posts-grid">
                {currentPage === 1 && (
                  <article className="blog-post blog-featured-post">
                    <div className="blog-featured-image">
                      <Link to={`/article/${sortedPosts[0].slug}`}>
                        <img
                          src={sortedPosts[0].image}
                          alt={sortedPosts[0].title}
                          loading="eager"
                          onLoad={() => handleImageLoad(sortedPosts[0].id)}
                          onError={(e) => handleImageError(sortedPosts[0].id, e)}
                          crossOrigin="anonymous"
                        />
                      </Link>
                      <div className="blog-post-category-badge">{sortedPosts[0].category}</div>
                    </div>
                    <div className="blog-featured-content">
                      <div className="blog-post-meta">
                        <span className="blog-post-date">{formatDate(sortedPosts[0].publishedAt)}</span>
                        <span className="blog-post-views">
                          <i className="fas fa-eye"></i> {sortedPosts[0].views.toLocaleString()} views
                        </span>
                      </div>
                      <h3 className="blog-post-title">
                        <Link to={`/article/${sortedPosts[0].slug}`}>{sortedPosts[0].title}</Link>
                      </h3>
                      <p className="blog-post-excerpt">{sortedPosts[0].excerpt}</p>
                      <Link to={`/article/${sortedPosts[0].slug}`} className="blog-read-more">
                        Read Recipe <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </article>
                )}

                {currentPosts
                  .filter((post, index) => currentPage === 1 ? index > 0 : true)
                  .map(post => (
                    <article key={post.id} className="blog-post">
                      <div className={`blog-post-image ${imageLoadingStates[post.id] ? 'loading' : ''}`}>
                        <Link to={`/article/${post.slug}`}>
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
                        <p className="blog-post-excerpt">{post.excerpt}</p>
                        <Link to={`/article/${post.slug}`} className="blog-read-more">
                          Read Recipe <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>

              {/* Pagination */}
              {postsPerPage < posts.length && (
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
                    page <= totalPages && (
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
            </section>

            {/* Newsletter */}
            <section className="blog-newsletter">
              <h3>Subscribe to Our Newsletter</h3>
              <p>Get delicious cookie recipes delivered straight to your inbox every week! No spam, just yummy cookie goodness.</p>
              <form className="blog-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </section>
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

export default BlogPage; 