import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadAllArticles } from '../utils/articleLoader';

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
    { name: 'Vegan', image: '/images/cookie-types/macaron.webp' },
    { name: 'Classic', image: '/images/cookie-types/snickerdoodle.webp' },
    { name: 'Specialty', image: '/images/cookie-types/red-velvet.webp' },
    { name: 'Seasonal', image: '/images/cookie-types/gingerbread.webp' },
    { name: 'International', image: '/images/cookie-types/specialty.webp' },
    { name: 'Sweet & Salty', image: '/images/cookie-types/peanut-butter.webp' },
    { name: 'Fruit', image: '/images/cookie-types/white-chocolate-cranberry.webp' }
  ];

  // Load articles and calculate statistics
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await loadAllArticles();
        setAllArticles(articles);
        
        // Calculate category counts
        const counts = {};
        categories.forEach(category => {
          const categoryNameLower = category.name.toLowerCase();
          counts[category.name] = articles.filter(post => 
            (post.title && post.title.toLowerCase().includes(categoryNameLower)) ||
            (post.category && post.category.toLowerCase().includes(categoryNameLower)) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(categoryNameLower)) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(categoryNameLower)))
          ).length;
        });
        setCategoryCounts(counts);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    if (searchInput.trim()) {
      navigate(`/blogsearch?q=${encodeURIComponent(searchInput.trim())}`);
    }
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
              <Link to={`/blogsearch?q=${encodeURIComponent(category.name)}`}>
                {category.name}
                <span className="count">{categoryCounts[category.name] || 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default BlogSidebar; 