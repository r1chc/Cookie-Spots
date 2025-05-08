import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadAllArticles } from '../utils/articleLoader';
import { getCategoryCounts } from '../utils/categoryUtils';

const BlogSidebar = () => {
  const navigate = useNavigate();
  const [allArticles, setAllArticles] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Categories that are used across the site
  const categories = [
    { name: 'Chocolate', image: '/images/cookie-types/chocolate-chip.webp' },
    { name: 'Gluten-Free', image: '/images/cookie-types/sugar-cookie.webp' },
    { name: 'No-Bake', image: '/images/cookie-types/oatmeal-raisin.webp' },
    { name: 'Vegan', image: '/images/cookie-types/Vegan Coconut Oatmeal Cookies with Maple Glaze.png' },
    { name: 'Classic', image: '/images/cookie-types/snickerdoodle.webp' },
    { name: 'Specialty', image: '/images/cookie-types/red-velvet.webp' },
    { name: 'Seasonal', image: '/images/cookie-types/gingerbread.webp' },
    { name: 'Keto', image: '/images/cookie-types/Keto-Friendly Chocolate Chip Cookies.png' },
    { name: 'International', image: '/images/cookie-types/Dubai Chocolate Cookie - Kataifi & Pistachio Luxury.jpg' },
    { name: 'Sweet & Salty', image: '/images/cookie-types/peanut-butter.webp' },
    { name: 'Fruit', image: '/images/cookie-types/Lemon Blueberry White Chocolate Chip Cookies.jpg' }
  ];

  // Load articles and calculate statistics
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await loadAllArticles();
        setAllArticles(articles);
        
        // Calculate category counts
        setCategoryCounts(getCategoryCounts(articles, categories));

        // Calculate popular tags based on views and usage
        const tagScores = {};
        articles.forEach(post => {
          if (post.tags) {
            const tagPoints = (post.views || 0) / 100;
            post.tags.forEach(tag => {
              tagScores[tag] = (tagScores[tag] || 0) + tagPoints;
            });
          }
        });
        
        const sortedTags = Object.entries(tagScores)
          .sort(([, a], [, b]) => b - a)
          .map(([tag]) => tag)
          .slice(0, 6);
        
        setPopularTags(sortedTags);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Function to scroll to the top of the Search Recipes section
  const scrollToArticlesTop = () => {
    const searchSection = document.querySelector('.blog-main-content > div:first-child');
    if (searchSection) {
      const isMobile = window.innerWidth <= 770;
      const isTablet = window.innerWidth > 770 && window.innerWidth <= 1024;
      const offset = isMobile ? 70 : isTablet ? 85 : 100;
      const elementPosition = searchSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    if (searchInput.trim()) {
      navigate(`/blogsearch?q=${encodeURIComponent(searchInput.trim())}`);
      // Add small timeout to ensure navigation occurs before scrolling
      setTimeout(scrollToArticlesTop, 100);
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/blogsearch?q=${encodeURIComponent(tag)}`);
    // Add small timeout to ensure navigation occurs before scrolling
    setTimeout(scrollToArticlesTop, 100);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/blogsearch?q=${encodeURIComponent(categoryName)}`);
    // Add small timeout to ensure navigation occurs before scrolling
    setTimeout(scrollToArticlesTop, 100);
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
    return views?.toLocaleString('en-US') || '0';
  };

  if (loading) {
    return <div className="blog-sidebar">Loading...</div>;
  }

  return (
    <aside className="blog-sidebar">
      <div className="blog-sidebar-section">
        <h3 className="blog-sidebar-title">Search Recipes</h3>
        <form onSubmit={handleSearchSubmit} className="blog-search-form">
          <input
            type="search"
            name="search"
            placeholder="Search recipes..."
          />
          <button type="submit" className="text-blue-500">
            <i className="fas fa-search"></i>
          </button>
        </form>
        <h4 className="blog-sidebar-subtitle text-sm mb-2">Popular Tags:</h4>
        <div className="blog-tags-cloud">
          {popularTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
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
          {[...allArticles]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3)
            .map(post => (
              <li key={post.slug} className="blog-popular-post flex items-start mb-4">
                <Link to={`/article/${post.slug}`} className="flex-shrink-0 mr-3">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="blog-popular-post-image w-20 h-20 object-cover"
                    loading="lazy"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = "/images/cookie-types/chocolate-chip.webp";
                    }}
                    crossOrigin="anonymous"
                  />
                </Link>
                <div className="blog-popular-post-content flex flex-col justify-start text-left flex-grow">
                  <h4 className="text-left font-semibold text-base mb-0.5">
                    <Link to={`/article/${post.slug}`} className="hover:underline">{post.title}</Link>
                  </h4>
                  <div className="blog-popular-post-meta text-xs text-gray-600 leading-tight flex flex-col w-full text-left">
                    {post.publishedAt && (
                      <div className="blog-popular-post-date w-full text-left">
                        {formatDate(post.publishedAt)}
                      </div>
                    )}
                    {post.views !== undefined && (
                      <div className="blog-popular-post-views w-full text-left">
                        <i className="fas fa-eye mr-1"></i>{formatViews(post.views)}
                      </div>
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
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(category.name);
                }}
              >
                {category.name}
                <span className="count">{categoryCounts[category.name] || 0}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default BlogSidebar; 