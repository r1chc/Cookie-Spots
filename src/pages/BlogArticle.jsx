import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/BlogArticle.css';
import useArticleViews from '../hooks/useArticleViews';
import { loadAllArticles, getArticlesWithUpdatedViewCounts, logAllViewCounts } from '../utils/articleLoader';

const BlogArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextArticle, setNextArticle] = useState(null);
  const [prevArticle, setPrevArticle] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [popularArticles, setPopularArticles] = useState([]);
  
  // Log view counts on component mount for debugging
  useEffect(() => {
    console.log(`BlogArticle mounted for article ID: ${id}`);
    logAllViewCounts();
  }, [id]);
  
  // Get the current view count from our hook - using article slug
  const currentViews = useArticleViews(article?.slug);

  // Function to handle image loading errors
  const handleImageError = (e) => {
    console.error('Error loading image:', e.target.src);
    setImageError(true);
    // Set a fallback image
    e.target.src = '/images/cookie-types/chocolate-chip.webp';
  };

  // Function to handle image load success
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setImageLoading(true);
      setImageError(false);
      try {
        // Fetch all articles with the latest view counts
        const allArticles = await loadAllArticles();
        console.log(`Loaded ${allArticles.length} articles`);
        
        // Find the article by ID or slug
        let currentArticle = null;
        
        // First try direct slug match
        currentArticle = allArticles.find(a => a.slug === id);
        
        // If not found, try ID match
        if (!currentArticle) {
          currentArticle = allArticles.find(a => 
            (a.id && a.id.toString() === id) || 
            parseInt(a.id) === parseInt(id)
          );
        }
        
        if (currentArticle) {
          console.log(`Found article: "${currentArticle.title}" with slug: ${currentArticle.slug}, views: ${currentArticle.views || 0}`);
          setArticle(currentArticle);
          
          // Find current index to determine next/prev
          const currentIndex = allArticles.indexOf(currentArticle);
          
          // Set next and previous articles
          if (currentIndex > 0) {
            setPrevArticle(allArticles[currentIndex - 1]);
          } else {
            setPrevArticle(null);
          }
          
          if (currentIndex < allArticles.length - 1) {
            setNextArticle(allArticles[currentIndex + 1]);
          } else {
            setNextArticle(null);
          }
          
          // Set popular articles sorted by view count
          const sortedByViews = [...allArticles]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3);
          console.log('Popular articles:', sortedByViews.map(a => `${a.title}: ${a.views || 0} views`));
          setPopularArticles(sortedByViews);
        } else {
          console.error(`Article not found: ${id}`);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    
    // Listen for view count updates
    const handleViewsUpdate = (e) => {
      const { articleId, views } = e.detail;
      console.log(`Received view update in BlogArticle: ${articleId} - ${views} views`);
      
      // Update current article if it's the one that changed
      setArticle(prev => {
        if (prev && (prev.slug === articleId || prev.id === parseInt(articleId))) {
          console.log(`Updating article view count for ${prev.title} to ${views}`);
          return { ...prev, views };
        }
        return prev;
      });
      
      // Update popular articles when any article's view count changes
      setPopularArticles(prev => {
        const updated = prev.map(article => 
          article.slug === articleId || (article.id && article.id.toString() === articleId)
            ? { ...article, views } 
            : article
        );
        return [...updated].sort((a, b) => (b.views || 0) - (a.views || 0));
      });
    };
    
    window.addEventListener('articleViewsUpdated', handleViewsUpdate);
    
    return () => {
      window.removeEventListener('articleViewsUpdated', handleViewsUpdate);
    };
  }, [id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search functionality
    alert('Search functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="article-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-container">
        <div className="error-message">Article not found</div>
      </div>
    );
  }

  return (
    <div className="article-container">
      {/* Navigation Buttons */}
      {prevArticle && (
        <button
          onClick={() => window.location.href = `/article/${prevArticle.slug}`}
          className="fixed top-4 right-4 p-2 sm:p-3 rounded-full bg-primary-600 text-white shadow-lg transition-all duration-300 border-2 border-white hover:bg-primary-700 hover:scale-110 focus:outline-none z-[9999]"
          aria-label="Previous article"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      )}
      {nextArticle && (
        <button
          onClick={() => window.location.href = `/article/${nextArticle.slug}`}
          className="fixed top-20 right-4 p-2 sm:p-3 rounded-full bg-primary-600 text-white shadow-lg transition-all duration-300 border-2 border-white hover:bg-primary-700 hover:scale-110 focus:outline-none z-[9999]"
          aria-label="Next article"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      )}

      {/* Back to Blog Button */}
      <div className="article-floating-nav back">
        <Link to="/blog" className="floating-nav-button">
          <i className="fas fa-arrow-left"></i>
          Back to Blog
        </Link>
      </div>

      {/* Next/Previous Navigation */}
      <div className="article-floating-nav pagination">
        {nextArticle && (
          <Link to={`/article/${nextArticle.slug}`} className="floating-nav-button">
            Next Article
            <i className="fas fa-arrow-right"></i>
          </Link>
        )}
        {prevArticle && (
          <Link to={`/article/${prevArticle.slug}`} className="floating-nav-button">
            <i className="fas fa-arrow-left"></i>
            Previous Article
          </Link>
        )}
      </div>

      <article className="article-content">
        <header className="article-header">
          <div className="article-meta">
            <span className="article-category">{article.category}</span>
            <span className="article-date">{article.date}</span>
            <span className="article-views">
              <i className="fas fa-eye"></i> {currentViews.toLocaleString()} views
            </span>
          </div>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-author">
            <span>By {article.author}</span>
          </div>
          <div className="article-stats">
            <span><i className="fas fa-clock"></i> Prep: {article.prepTime}</span>
            <span><i className="fas fa-fire"></i> Cook: {article.cookTime}</span>
            <span><i className="fas fa-utensils"></i> Makes: {article.servings}</span>
          </div>
        </header>

        <div className={`article-image ${imageLoading ? 'loading' : ''}`}>
          <img 
            src={article?.image} 
            alt={article?.title}
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

        <div className="article-tags">
          <Link to="/category/chocolate" className="article-tag">Chocolate</Link>
          <Link to="/category/cookies" className="article-tag">Cookies</Link>
          <Link to="/category/dessert" className="article-tag">Dessert</Link>
        </div>
      </article>

      <aside className="article-sidebar">
        <div className="blog-sidebar-section">
          <h3 className="blog-sidebar-title">Search</h3>
          <form className="blog-search-form" onSubmit={handleSearchSubmit}>
            <input type="text" placeholder="Search recipes..." />
            <button type="submit"><i className="fas fa-search"></i></button>
          </form>
        </div>

        <div className="blog-sidebar-section">
          <h3 className="blog-sidebar-title">Popular Recipes</h3>
          <ul className="blog-popular-posts">
            {popularArticles.map((popularArticle) => (
              <li key={popularArticle.id} className="blog-popular-post">
                <Link to={`/article/${popularArticle.slug}`}>
                  <img 
                    src={popularArticle.image} 
                    alt={popularArticle.title}
                    className="blog-popular-post-image"
                    onError={handleImageError}
                  />
                </Link>
                <div className="blog-popular-post-content">
                  <h4>
                    <Link to={`/article/${popularArticle.slug}`}>{popularArticle.title}</Link>
                  </h4>
                  <div>
                    <span className="blog-popular-post-date">{popularArticle.date}</span>
                    <span className="blog-popular-post-views">
                      <i className="fas fa-eye"></i> {popularArticle.views.toLocaleString()}
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
            <li><Link to="/category/chocolate-chip">Chocolate Chip <span className="count">12</span></Link></li>
            <li><Link to="/category/oatmeal">Oatmeal <span className="count">8</span></Link></li>
            <li><Link to="/category/sugar">Sugar Cookies <span className="count">10</span></Link></li>
            <li><Link to="/category/shortbread">Shortbread <span className="count">6</span></Link></li>
            <li><Link to="/category/gluten-free">Gluten-Free <span className="count">15</span></Link></li>
            <li><Link to="/category/vegan">Vegan <span className="count">7</span></Link></li>
          </ul>
        </div>

        <div className="blog-sidebar-section">
          <h3 className="blog-sidebar-title">Popular Tags</h3>
          <div className="blog-tags-cloud">
            <Link to="/tag/chocolate" className="blog-tag">Chocolate</Link>
            <Link to="/tag/easy" className="blog-tag">Easy</Link>
            <Link to="/tag/no-bake" className="blog-tag">No-Bake</Link>
            <Link to="/tag/gluten-free" className="blog-tag">Gluten-Free</Link>
            <Link to="/tag/holiday" className="blog-tag">Holiday</Link>
            <Link to="/tag/vegan" className="blog-tag">Vegan</Link>
            <Link to="/tag/quick" className="blog-tag">Quick</Link>
            <Link to="/tag/kids" className="blog-tag">Kids</Link>
            <Link to="/tag/nuts" className="blog-tag">Nuts</Link>
          </div>
        </div>

        <div className="newsletter-signup">
          <h3>Get More Recipes</h3>
          <p>Subscribe to our newsletter for weekly cookie recipes and baking tips!</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default BlogArticle; 