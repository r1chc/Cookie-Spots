import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ArticlePage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import SearchButton from '../components/SearchButton';
import useArticleViews from '../hooks/useArticleViews';
import { mockArticles } from '../data/mockArticles';
import BaseArticle from './articles/BaseArticle';

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
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

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

  // Render logic
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  // Prepare the article object with the latest view count for rendering
  const articleForDisplay = {
    ...article,
    views: currentViews, // Use the up-to-date count from the hook
  };

  return (
    <div className={`article-page-wrapper ${isNavVisible ? 'nav-visible' : ''}`}>
      <main className="article-main-content">
        <article className="article-content">
          {/* Pass the updated article object to BaseArticle */}
          <BaseArticle article={articleForDisplay} />
        </article>

        {/* Navigation between articles */}
        <div className="article-navigation">
           {/* ... navigation buttons using prevArticle/nextArticle ... */}
        </div>
      </main>

      {/* Sidebar */}
      <aside className="article-sidebar">
          {/* ... sidebar content (Search, Popular Tags, Related Posts, Categories) ... */}
      </aside>
      
      {/* Floating Buttons */}
      {/* ... floating buttons ... */}
      <SearchButton />
    </div>
  );
};

export default ArticlePage; 