import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/BlogArticle.css';

const BlogArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch from your API
    // For now, we'll use mock data
    const mockArticle = {
      id: parseInt(id),
      title: "Classic Chocolate Chip Cookies with Brown Butter",
      content: `
        <h2>Introduction</h2>
        <p>There's nothing quite like the smell of freshly baked chocolate chip cookies wafting through your kitchen. This recipe takes the classic chocolate chip cookie to new heights with the addition of brown butter, which adds a rich, nutty depth of flavor that will make these cookies stand out from the rest.</p>

        <h2>Ingredients</h2>
        <ul>
          <li>1 cup (2 sticks) unsalted butter</li>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1 teaspoon baking soda</li>
          <li>1 teaspoon salt</li>
          <li>1 cup packed brown sugar</li>
          <li>1/2 cup granulated sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>2 cups semisweet chocolate chips</li>
        </ul>

        <h2>Instructions</h2>
        <ol>
          <li>Preheat your oven to 375°F (190°C) and line baking sheets with parchment paper.</li>
          <li>In a medium saucepan, melt the butter over medium heat. Continue cooking, stirring frequently, until the butter turns a deep golden brown and develops a nutty aroma. Remove from heat and let cool slightly.</li>
          <li>In a medium bowl, whisk together the flour, baking soda, and salt.</li>
          <li>In a large bowl, beat the brown butter, brown sugar, and granulated sugar until well combined. Add the eggs one at a time, beating well after each addition. Stir in the vanilla.</li>
          <li>Gradually add the dry ingredients to the wet ingredients, mixing until just combined. Fold in the chocolate chips.</li>
          <li>Drop rounded tablespoons of dough onto the prepared baking sheets, spacing them about 2 inches apart.</li>
          <li>Bake for 9 to 11 minutes, or until golden brown. Let cool on the baking sheets for 2 minutes before transferring to wire racks to cool completely.</li>
        </ol>

        <h2>Tips & Notes</h2>
        <ul>
          <li>For extra chewy cookies, slightly underbake them by 1-2 minutes.</li>
          <li>The brown butter can be made ahead of time and stored in the refrigerator until needed.</li>
          <li>For best results, use high-quality chocolate chips.</li>
        </ul>
      `,
      date: "April 14, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/chocolate-chip.webp",
      views: 1250,
      author: "CookieSpots Team",
      prepTime: "20 minutes",
      cookTime: "10 minutes",
      servings: "24 cookies"
    };

    // Simulate API call delay
    setTimeout(() => {
      setArticle(mockArticle);
      setLoading(false);
    }, 500);
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
      <article className="article-content">
        <header className="article-header">
          <div className="article-meta">
            <span className="article-category">{article.category}</span>
            <span className="article-date">{article.date}</span>
            <span className="article-views">
              <i className="fas fa-eye"></i> {article.views.toLocaleString()} views
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

        <div className="article-image">
          <img src={article.image} alt={article.title} />
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
            <li className="blog-popular-post">
              <img src="/images/cookie-types/peanut-butter.webp" alt="Peanut Butter" className="blog-popular-post-image" />
              <div className="blog-popular-post-content">
                <h4><Link to="/article/4">Peanut Butter Chocolate Chip Cookies</Link></h4>
                <span className="blog-popular-post-date">April 8, 2025</span>
              </div>
            </li>
            <li className="blog-popular-post">
              <img src="/images/cookie-types/snickerdoodle.webp" alt="Snickerdoodle" className="blog-popular-post-image" />
              <div className="blog-popular-post-content">
                <h4><Link to="/article/5">Classic Snickerdoodle Cookies</Link></h4>
                <span className="blog-popular-post-date">April 5, 2025</span>
              </div>
            </li>
            <li className="blog-popular-post">
              <img src="/images/cookie-types/macaron.webp" alt="Macaron" className="blog-popular-post-image" />
              <div className="blog-popular-post-content">
                <h4><Link to="/article/6">French Macarons with Raspberry Filling</Link></h4>
                <span className="blog-popular-post-date">April 3, 2025</span>
              </div>
            </li>
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