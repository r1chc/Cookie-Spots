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
    { name: 'Healthy', image: '/images/cookie-types/almond-biscotti.webp' }
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
      <div className="blog-sidebar-section pb-6">
        <h3 className="blog-sidebar-title">Search Recipes</h3>
        <form className="blog-search-form mb-3" onSubmit={handleSearchSubmit}>
          <input type="text" placeholder="Search Recipes..." name="search" />
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
              <li key={post.slug} className="blog-popular-post">
                <Link to={`/article/${post.slug}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="blog-popular-post-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/cookie-types/chocolate-chip.webp";
                    }}
                  />
                </Link>
                <div className="blog-popular-post-content">
                  <h4>
                    <Link to={`/article/${post.slug}`}>{post.title}</Link>
                  </h4>
                  <div>
                    {post.publishedAt && (
                      <span className="blog-popular-post-date">
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
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
  );
};

export default BlogSidebar; 