import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ArticlePage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';
import SearchButton from '../components/SearchButton';
import useArticleViews from '../hooks/useArticleViews';
import BaseArticle from './articles/BaseArticle';
import { loadAllArticles, getArticleBySlug } from '../utils/articleLoader';

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
  const [searchResults, setSearchResults] = useState([]);
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
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
    setSearchResults(allArticles);
    
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

  // Render logic
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="article-container flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Oops! Article Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the article you're looking for ({error}).</p>
        <Link to="/blog" className="text-primary-600 hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  if (!article) {
    return <div>Article data is missing.</div>;
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