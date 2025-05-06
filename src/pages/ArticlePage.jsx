import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ArticlePage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import useArticleViews from '../hooks/useArticleViews';
import BaseArticle from './articles/BaseArticle';
import { loadAllArticles, getArticleBySlug } from '../utils/articleLoader';
import FloatingActionButtons from '../components/FloatingActionButtons';

const ArticlePage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);
  const [categoryCount, setCategoryCount] = useState({});
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollToTopRef = useRef(null);

  // Use the article views hook
  const currentViews = useArticleViews(slug);

  // Fetch the current article AND all articles
  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        if (!slug) {
          throw new Error('No article slug provided');
        }

        // Fetch all articles using the loader (for sidebar, prev/next)
        const loadedArticles = await loadAllArticles();
        setAllArticles(loadedArticles);

        // Fetch the specific article for display using the loader
        const currentArticleData = await getArticleBySlug(slug);
        
        if (currentArticleData) {
          setArticle(currentArticleData);
        } else {
          throw new Error('Article not found');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching article data:', err);
        setError(err.message);
        setArticle(null);
        setAllArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
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
    // setSearchResults(allArticles);
    
    // Calculate popular tags
    const tags = allArticles.reduce((acc, art) => {
      if (art.tags) {
        art.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    setPopularTags(Object.keys(tags).sort((a, b) => tags[b] - tags[a]).slice(0, 10));
    
    // Calculate category counts
    const counts = {};
    allArticles.forEach(art => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    setCategoryCount(counts);
  }, [allArticles]);

  // Sort articles by date (newest first)
  const sortedArticles = [...allArticles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  // Find the current index in the sorted array
  const currentIndex = sortedArticles.findIndex(art => art.slug === slug);
  
  // Get previous and next articles based on the sorted array
  const prevArticle = currentIndex > 0 ? sortedArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < sortedArticles.length - 1 ? sortedArticles[currentIndex + 1] : null;

  // Update article when navigation happens
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Cookie Spots`;
      // Reset image loading state when article changes
      setImageLoading(true);
    }
  }, [slug, article]);

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
    return allArticles.filter(article => 
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

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    if (searchTerm) {
      navigate(`/blogsearch?q=${encodeURIComponent(searchTerm)}`);
    }
  };

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

  // Render logic
  if (loading) {
    return (
      <div className="article-page-wrapper">
        <div className="article-container">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-page-wrapper">
        <div className="article-container">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Oops! Article Not Found</h1>
            <p className="text-gray-600 mb-6">Sorry, we couldn't find the article you're looking for ({error}).</p>
            <Link to="/blog" className="text-primary-600 hover:underline">
              &larr; Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page-wrapper">
        <div className="article-container">
          <div>Article data is missing.</div>
        </div>
      </div>
    );
  }

  // Prepare the article object with the latest view count for rendering
  const articleForDisplay = {
    ...article,
    views: currentViews, // Use the up-to-date count from the hook
  };

  return (
    <div className="article-page-wrapper">
      <div className="article-container">
        <div className="article-main-area">
          {/* Left Side Sticky Navigation - REMOVED */}
          {/* 
          <div className="sticky-side-nav left-nav">
            <div className="article-floating-nav back">
              <Link to="/blog" className="floating-nav-button">
                <i className="fas fa-arrow-left"></i>
                Back to Blog
              </Link>
            </div>
          </div> 
          */}

          {/* Main Article Content Column */}
          <article className="article-content-column">
            <BaseArticle article={articleForDisplay} />
          </article>

          {/* Right Side Sticky Navigation */}
          <div className="sticky-side-nav right-nav">
            {prevArticle && (
              <div className="article-floating-nav prev">
                <Link to={`/article/${prevArticle.slug}`} className="floating-nav-button">
                  <i className="fas fa-arrow-left"></i>
                  Previous Article
                </Link>
              </div>
            )}
            {nextArticle && (
              <div className="article-floating-nav next">
                <Link to={`/article/${nextArticle.slug}`} className="floating-nav-button">
                  Next Article
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Action Buttons */}
        <FloatingActionButtons />

        {/* Bottom Navigation Sections (Popular, Categories, etc.) */}
        <div className="article-navigation-sections">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Search Recipes</h3>
              <form className="blog-search-form" onSubmit={handleSearchSubmit}>
                <input type="text" placeholder="Search Recipes..." name="search" />
                <button type="submit"><i className="fas fa-search"></i></button>
              </form>
              <div className="blog-tags">
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

            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-title">Popular Recipes</h3>
              <ul className="blog-popular-posts">
                {sortedArticles
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 3)
                  .map(post => (
                    <li key={post.id} className="blog-popular-post">
                      <Link to={`/article/${post.slug}`}>
                        <img
                          src={post.image}
                          alt={post.title}
                          className="blog-popular-post-image"
                          loading="lazy"
                        />
                      </Link>
                      <div className="blog-popular-post-content">
                        <h4>
                          <Link to={`/article/${post.slug}`}>{post.title}</Link>
                        </h4>
                        <div className="blog-popular-post-meta">
                          <span className="blog-popular-post-date">{formatDate(post.publishedAt)}</span>
                          <span className="blog-popular-post-views">
                            <i className="fas fa-eye"></i> {formatViews(post.views)}
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
                    <Link to={`/blogsearch?q=${encodeURIComponent(category.name)}`}>
                      {category.name} 
                      <span className="count">{getCategoryCount(category.name)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage; 