import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ArticlePage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import SearchButton from '../components/SearchButton';
import useArticleViews from '../hooks/useArticleViews';
import { mockArticles } from '../data/mockArticles';

const ArticlePage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);
  const [categoryCount, setCategoryCount] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollToTopRef = useRef(null);
  const [articles, setArticles] = useState(mockArticles);

  // Use the article views hook
  const currentViews = useArticleViews(article?.slug);

  // Fetch the current article
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!slug) {
          throw new Error('No article slug provided');
        }

        // First try to find in mock data since we know API is down
        const mockArticle = mockArticles.find(post => post.slug === slug);
        if (mockArticle) {
          setArticle(mockArticle);
          setLoading(false);
          return;
        }

        // If not in mock data, try API as fallback
        const response = await fetch(`/api/blog/posts/${slug}`);
        if (!response.ok) {
          throw new Error('Article not found');
        }
        const data = await response.json();
        setArticle(data.post);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // Listen for navigation menu state
  useEffect(() => {
    const handleNavVisibility = (e) => {
      if (e.detail?.isOpen !== undefined) {
        setIsNavVisible(!e.detail.isOpen);
      }
    };

    window.addEventListener('navigationStateChange', handleNavVisibility);
    return () => {
      window.removeEventListener('navigationStateChange', handleNavVisibility);
    };
  }, []);

  useEffect(() => {
    // Set search results to all articles
    setSearchResults(mockArticles);
    
    // Calculate popular tags
    const tags = mockArticles.reduce((acc, article) => {
      if (article.tags) {
        article.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    setPopularTags(Object.keys(tags).sort((a, b) => tags[b] - tags[a]).slice(0, 10));
    
    // Calculate category counts
    const counts = {};
    mockArticles.forEach(article => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });
    setCategoryCount(counts);
  }, []);

  // Sort articles by date (newest first)
  const sortedArticles = [...mockArticles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  // Find current article and update its views
  const currentArticle = sortedArticles.find(article => article.slug === slug);
  if (currentArticle) {
    currentArticle.views = currentViews;
  }

  // Find the current index in the sorted array
  const currentIndex = sortedArticles.findIndex(article => article.slug === slug);
  
  // Get previous and next articles based on the sorted array
  const prevArticle = currentIndex > 0 ? sortedArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < sortedArticles.length - 1 ? sortedArticles[currentIndex + 1] : null;

  // Handle image loading states
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    console.error('Failed to load image:', e);
    setImageLoading(false);
  };

  // Categories data - matching BlogPage and BlogSearch
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

  // Function to count articles that match a category
  const getCategoryCount = (categoryName) => {
    const searchTerm = categoryName.toLowerCase();
    return mockArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.category.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    ).length;
  };

  // Handle category click
  const handleCategoryClick = (categoryName, e) => {
    e.preventDefault();
    navigate(`/blogsearch?q=${encodeURIComponent(categoryName)}`);
  };

  // Format date for display
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

  // Format views for display
  const formatViews = (views) => {
    return views?.toLocaleString('en-US') || '0';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !article) {
    return (
      <div className="article-container">
        <div className="article-header">
          <button 
            className="back-button"
            onClick={() => navigate('/blog')}
          >
            <i className="fas fa-arrow-left"></i> Back to Blog
          </button>
        </div>
        <div className="article-content">
          <h1>Article Not Found</h1>
          <p>Sorry, we couldn't find the article you're looking for.</p>
          <Link to="/blog" className="nav-button">Return to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-container">
      {/* Navigation Buttons */}
      <div className={`fixed right-6 top-20 flex flex-col gap-4 z-50 transition-opacity duration-300 ${isNavVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {prevArticle && (
          <button 
            onClick={() => navigate(`/article/${prevArticle.slug}`)}
            className="w-28 h-12 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center text-white shadow-lg border-2 border-white gap-2"
            aria-label="Previous article"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm font-medium">Previous</span>
          </button>
        )}
        {nextArticle && (
          <button
            onClick={() => navigate(`/article/${nextArticle.slug}`)}
            className="w-28 h-12 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center text-white shadow-lg border-2 border-white gap-2"
            aria-label="Next article"
          >
            <span className="text-sm font-medium">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="article-layout">
        <article className="article-content">
          <header className="article-header">
            <div className="article-meta">
              <span className="article-category">{article.category}</span>
              <span className="article-date">{formatDate(article.publishedAt)}</span>
              <span className="article-views">
                <i className="fas fa-eye"></i> {formatViews(article.views)} views
              </span>
              {article.isAIGenerated && (
                <span className="article-ai-badge">
                  <i className="fas fa-robot"></i> AI Generated
                </span>
              )}
            </div>
            <h1 className="article-title">{article.title}</h1>
            <div className="article-author">
              <span>By {article.author || 'Cookie Spots Team'}</span>
            </div>
          </header>

          <div className={`article-image ${imageLoading ? 'loading' : ''}`}>
            <img 
              src={article.image} 
              alt={article.title}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {imageLoading && (
              <div className="image-loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            )}
          </div>
          
          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map(tag => (
                <Link 
                  key={tag} 
                  to={`/blog/tag/${tag.toLowerCase()}`} 
                  className="article-tag"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        <div className="article-sidebar-components">
          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Search Recipes</h3>
            <form className="blog-search-form" onSubmit={(e) => {
              e.preventDefault();
              const searchQuery = e.target.elements.search.value;
              navigate(`/blogsearch?q=${encodeURIComponent(searchQuery)}`);
            }}>
              <input
                type="text"
                name="search"
                placeholder="Search Recipes..."
              />
              <button type="submit">
                <i className="fas fa-search"></i>
              </button>
            </form>
            <div style={{ marginTop: '2rem' }}>
              <h4 className="blog-sidebar-subtitle">Popular Tags:</h4>
              <div className="blog-tags-cloud">
                {popularTags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blogsearch?q=${encodeURIComponent(tag)}`}
                    className="blog-tag"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Popular Recipes</h3>
            <ul className="blog-popular-posts">
              {mockArticles
                .sort((a, b) => b.views - a.views)
                .slice(0, 3)
                .map((article) => (
                  <li key={article.id} className="blog-popular-post">
                    <Link to={`/article/${article.slug}`}>
                      <img
                        src={article.image}
                        alt={article.title}
                        className="blog-popular-post-image"
                      />
                    </Link>
                    <div className="blog-popular-post-content">
                      <h4>
                        <Link to={`/article/${article.slug}`}>{article.title}</Link>
                      </h4>
                      <div>
                        <span className="blog-popular-post-date">
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="blog-popular-post-views">
                          <i className="fas fa-eye"></i>
                          {formatViews(article.views)}
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
              {Object.entries(categoryCount).map(([category, count]) => (
                <li key={category}>
                  <Link
                    to={`/blog/category/${category.toLowerCase()}`}
                    className="blog-category-link"
                  >
                    {category} <span className="count">({count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SearchButton />
    </div>
  );
};

export default ArticlePage; 