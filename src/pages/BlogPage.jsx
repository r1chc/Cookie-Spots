import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';

const BlogPage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [displayPages, setDisplayPages] = useState([1, 2, 3]);
  const [postsPerPage, setPostsPerPage] = useState(4);
  const [sortOrder, setSortOrder] = useState('newest');
  const [originalPosts, setOriginalPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const navigate = useNavigate();

  // Force scroll to top when component mounts
  useEffect(() => {
    // Use requestAnimationFrame to ensure this runs after any other scroll operations
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
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
    const newSortedPosts = [...originalPosts].sort((a, b) => {
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

    setSortedPosts(newSortedPosts);
  };

  const handlePostsPerPageChange = (e) => {
    const newPostsPerPage = parseInt(e.target.value);
    setPostsPerPage(newPostsPerPage);
    setCurrentPage(1);
    setDisplayPages([1, 2, 3]);
  };

  // Function to calculate popular tags
  const calculatePopularTags = (posts) => {
    const tagScores = {};
    
    // Calculate tag scores based on frequency and article views
    posts.forEach(post => {
      if (post.tags) {
        // Each tag gets points based on the article's views
        const tagPoints = post.views / 100; // Normalize views to a reasonable score
        post.tags.forEach(tag => {
          tagScores[tag] = (tagScores[tag] || 0) + tagPoints;
        });
      }
    });

    // Convert to array and sort by score
    const sortedTags = Object.entries(tagScores)
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag);

    // Take top 6 tags (2 rows of 3)
    return sortedTags.slice(0, 6);
  };

  // Date parsing function
  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.replace(',', '').split(' ');
    const monthMap = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 
      'May': 4, 'June': 5, 'July': 6, 'August': 7, 
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    return new Date(parseInt(year), monthMap[month], parseInt(day));
  };

  const handleCategoryNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
    } else {
      setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
    }
  };

  useEffect(() => {
    // In a real application, this would fetch from your API
    // For now, we'll use mock data
    const mockPosts = [
      {
        id: 1,
        title: "Classic Chocolate Chip Cookies with Brown Butter",
        excerpt: "Elevate the classic chocolate chip cookie with the nutty depth of brown butter. These cookies have crispy edges, chewy centers and rich flavor that will impress everyone.",
        date: "March 15, 2025",
        category: "Chocolate",
        image: "/images/cookie-types/chocolate-chip.webp",
        isFeatured: true,
        views: 1250,
        tags: ["Chocolate", "Easy", "Classic", "Brown Butter"]
      },
      {
        id: 2,
        title: "Almond Flour Sugar Cookies with Citrus Glaze",
        excerpt: "These gluten-free sugar cookies made with almond flour have a wonderful tender texture and delightful citrus glaze that makes them irresistible.",
        date: "March 14, 2025",
        category: "Gluten-Free",
        image: "/images/cookie-types/sugar-cookie.webp",
        views: 980,
        tags: ["Gluten-Free", "Vegan", "Holiday", "Citrus"]
      },
      {
        id: 3,
        title: "No-Bake Chocolate Oatmeal Cookies",
        excerpt: "Perfect for hot summer days, these no-bake chocolate oatmeal cookies come together in minutes and satisfy your cookie cravings without turning on the oven.",
        date: "March 13, 2025",
        category: "No-Bake",
        image: "/images/cookie-types/oatmeal-raisin.webp",
        views: 1560,
        tags: ["No-Bake", "Chocolate", "Easy", "Quick"]
      },
      {
        id: 4,
        title: "Peanut Butter Chocolate Chip Cookies",
        excerpt: "A perfect combination of peanut butter and chocolate in these soft and chewy cookies that will satisfy any sweet tooth.",
        date: "March 12, 2025",
        category: "Chocolate",
        image: "/images/cookie-types/peanut-butter.webp",
        views: 1420,
        tags: ["Chocolate", "Peanut Butter", "Easy", "Kids"]
      },
      {
        id: 5,
        title: "Classic Snickerdoodle Cookies",
        excerpt: "Soft and chewy cinnamon sugar cookies that are perfect for any occasion. These classic cookies are always a crowd favorite.",
        date: "March 11, 2025",
        category: "Classic",
        image: "/images/cookie-types/snickerdoodle.webp",
        views: 1100,
        tags: ["Classic", "Cinnamon", "Holiday", "Easy"]
      },
      {
        id: 6,
        title: "French Macarons with Raspberry Filling",
        excerpt: "Delicate French macarons with a sweet raspberry filling. These elegant cookies are perfect for special occasions.",
        date: "March 10, 2025",
        category: "Specialty",
        image: "/images/cookie-types/macaron.webp",
        views: 980
      },
      {
        id: 7,
        title: "Lemon Glazed Shortbread Cookies",
        excerpt: "Buttery shortbread cookies with a tangy lemon glaze that adds the perfect balance of sweetness and citrus.",
        date: "March 9, 2025",
        category: "Classic",
        image: "/images/cookie-types/lemon-glazed.webp",
        views: 950
      },
      {
        id: 8,
        title: "Double Chocolate Cookies",
        excerpt: "Rich and decadent double chocolate cookies that are perfect for chocolate lovers. These cookies are packed with chocolate chips and cocoa powder.",
        date: "March 8, 2025",
        category: "Chocolate",
        image: "/images/cookie-types/double-chocolate.webp",
        views: 1200
      },
      {
        id: 9,
        title: "Red Velvet Cookies with Cream Cheese Frosting",
        excerpt: "Soft and chewy red velvet cookies topped with a rich cream cheese frosting. Perfect for Valentine's Day or any special occasion.",
        date: "March 7, 2025",
        category: "Specialty",
        image: "/images/cookie-types/red-velvet.webp",
        views: 1300
      },
      {
        id: 10,
        title: "Gingerbread Cookies with Royal Icing",
        excerpt: "Classic gingerbread cookies with warm spices and molasses. Perfect for the holiday season or any time you want a cozy treat.",
        date: "March 6, 2025",
        category: "Seasonal",
        image: "/images/cookie-types/gingerbread.webp",
        views: 1100
      },
      {
        id: 11,
        title: "White Chocolate Cranberry Cookies",
        excerpt: "Soft and chewy cookies packed with white chocolate chips and dried cranberries. A perfect balance of sweet and tart.",
        date: "March 5, 2025",
        category: "Chocolate",
        image: "/images/cookie-types/white-chocolate.webp",
        views: 1000
      },
      {
        id: 12,
        title: "Pumpkin Spice Cookies",
        excerpt: "Warm and cozy pumpkin spice cookies that are perfect for fall. These cookies are packed with pumpkin and warm spices.",
        date: "March 4, 2025",
        category: "Seasonal",
        image: "/images/cookie-types/pumpkin-spice.webp",
        views: 1200
      },
      {
        id: 13,
        title: "Salted Caramel Chocolate Cookies",
        excerpt: "Rich chocolate cookies with a gooey salted caramel center. These cookies are the perfect combination of sweet and salty.",
        date: "March 3, 2025",
        category: "Chocolate",
        image: "/images/cookie-types/salted-caramel.webp",
        views: 1350
      },
      {
        id: 14,
        title: "Almond Biscotti",
        excerpt: "Crunchy almond biscotti that are perfect for dipping in coffee or tea. These Italian cookies are twice-baked for extra crispiness.",
        date: "March 2, 2025",
        category: "Specialty",
        image: "/images/cookie-types/almond-biscotti.webp",
        views: 950
      },
      {
        id: 15,
        title: "Matcha Green Tea Cookies",
        excerpt: "Delicate and flavorful matcha green tea cookies that are perfect with a cup of tea. These cookies have a beautiful green color and unique flavor.",
        date: "March 1, 2025",
        category: "Specialty",
        image: "/images/cookie-types/matcha-green.webp",
        views: 1050
      }
    ];

    // Sort posts by views for popular tags
    const sortedByViews = [...mockPosts].sort((a, b) => b.views - a.views);
    
    // Calculate popular tags
    const tags = calculatePopularTags(sortedByViews);
    setPopularTags(tags);

    // Sort posts by newest first
    const sortedByNewest = [...mockPosts].sort((a, b) => {
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    });

    setPosts(sortedByNewest);
    setOriginalPosts(sortedByNewest);
    setSortedPosts(sortedByNewest);
    setSortOrder('newest');
    setLoading(false);

    const initialLoadingStates = {};
    mockPosts.forEach(post => {
      initialLoadingStates[post.id] = true;
    });
    setImageLoadingStates(initialLoadingStates);
  }, []);

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
    // Update displayPages to show current page in the middle
    if (page > displayPages[1]) {
      // Moving forward
      if (page + 1 <= totalPages) {
        setDisplayPages([page - 1, page, page + 1]);
      } else {
        // If we're at the last page, show the last three pages
        setDisplayPages([totalPages - 2, totalPages - 1, totalPages]);
      }
    } else if (page < displayPages[1]) {
      // Moving backward
      if (page > 1) {
        setDisplayPages([page - 1, page, page + 1]);
      } else {
        // If we're at the first page, show the first three pages
        setDisplayPages([1, 2, 3]);
      }
    }
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

  if (loading) {
    return <div className="blog-container">Loading...</div>;
  }

  return (
    <div className="blog-container">
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
          <h2>CookieSpots Blog</h2>
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
            <div className="blog-categories-grid">
              <div 
                className="blog-categories-slider"
                style={{ transform: `translateX(-${currentCategoryIndex * 25}%)` }}
              >
                {categories.map((category, index) => (
                  <Link key={category.name} to={category.path} className="blog-category-card">
                    <img src={category.image} alt={category.name} className="blog-category-image" />
                    <div className="blog-category-text">{category.name}</div>
              </Link>
                ))}
              </div>
            </div>
            <div className="category-navigation">
              <button 
                className="category-nav-button"
                onClick={() => handleCategoryNavigation('prev')}
                disabled={currentCategoryIndex === 0}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="category-nav-button"
                onClick={() => handleCategoryNavigation('next')}
                disabled={currentCategoryIndex + 4 >= categories.length}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
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
                    <Link to={`/article/${sortedPosts[0].id}`}>
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
                      <span className="blog-post-date">{sortedPosts[0].date}</span>
                      <span className="blog-post-author">By CookieSpots</span>
                      <span className="blog-post-views">
                        <i className="fas fa-eye"></i> {sortedPosts[0].views.toLocaleString()} views
                      </span>
                    </div>
                    <h3 className="blog-post-title">
                      <Link to={`/article/${sortedPosts[0].id}`}>{sortedPosts[0].title}</Link>
                    </h3>
                    <p className="blog-post-excerpt">{sortedPosts[0].excerpt}</p>
                    <Link to={`/article/${sortedPosts[0].id}`} className="blog-read-more">
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

        {/* Sidebar */}
        <aside className="blog-sidebar">
          <div className="blog-sidebar-section pb-6">
            <h3 className="blog-sidebar-title">Search Bar</h3>
            <form className="blog-search-form mb-3" onSubmit={handleSearchSubmit}>
              <input type="text" placeholder="Search recipes..." name="search" />
              <button type="submit" className="text-blue-500"><i className="fas fa-search"></i></button>
            </form>
            <h4 className="blog-sidebar-subtitle text-sm mb-2">Popular Tags:</h4>
            <div className="blog-tags-cloud">
              {popularTags.map((tag, index) => (
                <Link key={index} to={`/tag/${tag.toLowerCase()}`} className="blog-tag text-sm py-1 px-2">
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Popular Recipes</h3>
            <ul className="blog-popular-posts">
              {[...posts] // Create a copy of the posts array
                .sort((a, b) => b.views - a.views) // Sort by views only for the sidebar
                .slice(0, 3)
                .map(post => (
                  <li key={post.id} className="blog-popular-post">
                    <img src={post.image} alt={post.title} className="blog-popular-post-image" />
                <div className="blog-popular-post-content">
                      <h4><Link to={`/article/${post.id}`}>{post.title}</Link></h4>
                      <span className="blog-popular-post-date">{post.date}</span>
                      <span className="blog-popular-post-views">
                        <i className="fas fa-eye"></i> {post.views.toLocaleString()} views
                      </span>
                </div>
              </li>
                ))}
            </ul>
          </div>

          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Categories</h3>
            <ul className="blog-categories-list">
              <li><Link to="/category/chocolate-chip">Chocolate Chip <span className="count">12</span></Link></li>
              <li><Link to="/category/oatmeal">Oatmeal <span className="count">8</span></Link></li>
              <li><Link to="/category/sugar">Sugar Cookies <span className="count">10</span></Link></li>
              <li><Link to="/category/shortbread">Shortbread <span className="count">6</span></Link></li>
              <li><Link to="/category/gluten-free">Gluten-Free <span className="count">15</span></Link></li>
              <li><Link to="/category/vegan">Vegan <span className="count">7</span></Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPage; 