import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ArticlePage.css';

const BaseArticle = ({ article }) => {
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

  return (
    <div className="article-container">
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
          </header>

          <div className="article-image-container">
            <img
              src={article.image}
              alt={article.title}
              className="article-image"
              onError={(e) => {
                e.target.src = '/images/placeholder.webp';
              }}
            />
          </div>

          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="article-tags">
            {article.tags.map((tag, index) => (
              <Link 
                key={index}
                to={`/blogsearch?q=${encodeURIComponent(tag)}`}
                className="tag"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BaseArticle; 