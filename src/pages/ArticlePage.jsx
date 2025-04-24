import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ArticlePage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import SearchButton from '../components/SearchButton';
import useArticleViews from '../hooks/useArticleViews';
import { mockArticles } from '../data/mockArticles';
import { getArticleViewCount, getArticlesWithUpdatedViewCounts } from '../utils/viewCountUtils';

const ArticlePage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const [imageLoading, setImageLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);
  const [categoryCount, setCategoryCount] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollToTopRef = useRef(null);
  const [articles, setArticles] = useState(mockArticles);

  // Use the article views hook
  const currentViews = useArticleViews(currentId);

  // Listen for view updates from other components
  useEffect(() => {
    const handleViewsUpdate = (e) => {
      const { articleId, views } = e.detail;
      setArticles(prevArticles => 
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
    // Set search results to all articles with updated view counts
    const articlesWithUpdatedViews = getArticlesWithUpdatedViewCounts();
    setArticles(articlesWithUpdatedViews);
    setSearchResults(articlesWithUpdatedViews);
    
    // Calculate popular tags
    const tags = articlesWithUpdatedViews.reduce((acc, article) => {
      if (article.tags) {
        article.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    setPopularTags(Object.keys(tags).sort((a, b) => tags[b] - tags[a]).slice(0, 10));
    
    // Calculate category counts using the same filtering logic as search
    const counts = {};
    categories.forEach(category => {
      const categoryName = category.name.toLowerCase();
      const count = articlesWithUpdatedViews.filter(post => 
        post.title.toLowerCase().includes(categoryName) ||
        post.category.toLowerCase().includes(categoryName) ||
        post.excerpt.toLowerCase().includes(categoryName) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(categoryName)))
      ).length;
      counts[category.name] = count;
    });
    
    setCategoryCount(counts);
  }, []);

  // Update view counts in popular recipes section periodically
  useEffect(() => {
    // Handle periodic refresh of view counts
    const refreshViewCounts = () => {
      // Just update the articles array with the latest view counts
      const articlesWithUpdatedViews = getArticlesWithUpdatedViewCounts();
      setArticles(articlesWithUpdatedViews);
    };
    
    // Initial refresh
    refreshViewCounts();
    
    // Refresh view counts every 2 seconds to match BlogPage
    const interval = setInterval(refreshViewCounts, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const currentArticle = articles.find(article => article.id === currentId);
  if (currentArticle) {
    // Update the article's view count with the latest value but don't trigger increments
    currentArticle.views = currentViews;
  }
  const currentIndex = articles.findIndex(article => article.id === currentId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  // Update article when navigation happens
  useEffect(() => {
    if (currentArticle) {
      document.title = `${currentArticle.title} | Cookie Spots`;
      // Reset image loading state when article changes
      setImageLoading(true);
    }
  }, [currentId, currentArticle]);

  // Handle image loading states
  const handleImageLoad = () => {
    setImageLoading(false);
    console.log('Image loaded successfully:', currentArticle?.image);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    console.error('Error loading image:', currentArticle?.image);
    e.target.onerror = null;
    e.target.src = "/images/cookie-types/chocolate-chip.webp";
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

  const formatDate = (dateString) => {
    try {
      // Split the date string into components
      const [month, day, year] = dateString.split(' ');
      // Remove any commas
      const cleanDay = day.replace(',', '');
      // Get month number (1-12)
      const monthMap = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
      };
      // Format as M/DD/YYYY
      return `${monthMap[month]}/${cleanDay}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatViews = (views) => {
    return views.toLocaleString('en-US');
  };

  // If article not found, show error
  if (!currentArticle) {
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
        {currentId > 1 && (
        <button 
            onClick={() => navigate(`/article/${currentId - 1}`)}
            className="w-28 h-12 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center text-white shadow-lg border-2 border-white gap-2"
            aria-label="Previous article"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm font-medium">Previous</span>
        </button>
        )}
        {currentId < mockArticles.length && (
          <button
            onClick={() => navigate(`/article/${currentId + 1}`)}
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
          <div className={`article-image ${imageLoading ? 'loading' : ''}`}>
            <img 
              src={currentArticle.image} 
              alt={currentArticle.title}
              loading="eager"
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="article-meta">
            <span className="article-category">{currentArticle.category}</span>
            <span className="article-date">{currentArticle.date}</span>
            <span className="article-views">
              <i className="fas fa-eye"></i> {formatViews(currentViews)} views
            </span>
          </div>
          
          <h1 className="article-title">{currentArticle.title}</h1>
          
          {currentArticle.content ? (
            <div 
              className="article-body"
              dangerouslySetInnerHTML={{ __html: currentArticle.content }}
            />
          ) : (
            <div className="article-body">
              <p>{currentArticle.excerpt}</p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">This article preview only shows the summary. The full article content will be available soon!</p>
              </div>
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
              {articles
                .sort((a, b) => b.views - a.views)
                .slice(0, 3)
                .map((article) => {
                  // Use the real-time view count when the article is the current one
                  const displayedViews = article.id === currentId ? currentViews : article.views;
                  
                  return (
                    <li key={article.id} className="blog-popular-post">
                      <Link to={`/article/${article.id}`}>
                        <img
                          src={article.image}
                          alt={article.title}
                          className="blog-popular-post-image"
                        />
                      </Link>
                      <div className="blog-popular-post-content">
                        <h4>
                          <Link to={`/article/${article.id}`}>{article.title}</Link>
                        </h4>
                        <div>
                          <span className="blog-popular-post-date">
                            {formatDate(article.date)}
                          </span>
                          <span className="blog-popular-post-views">
                            <i className="fas fa-eye"></i>
                            {formatViews(displayedViews)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Categories</h3>
            <ul className="blog-categories-list">
              {categories.map(category => (
                <li key={category.name}>
                  <a
                    href={`/blog/search?category=${encodeURIComponent(category.name)}`}
                    onClick={(e) => handleCategoryClick(category.name, e)}
                  >
                    {category.name} <span className="count">{getCategoryCount(category.name)}</span>
                  </a>
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