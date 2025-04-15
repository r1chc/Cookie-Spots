import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/BlogPage.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    // In a real application, this would fetch from your API
    // For now, we'll use mock data
    const mockPosts = [
      {
        id: 1,
        title: "Classic Chocolate Chip Cookies with Brown Butter",
        excerpt: "Elevate the classic chocolate chip cookie with the nutty depth of brown butter. These cookies have crispy edges, chewy centers and rich flavor that will impress everyone.",
        date: "April 14, 2025",
        category: "Chocolate",
        image: "https://source.unsplash.com/random/350x200/?chocolate-cookies",
        isFeatured: true
      },
      {
        id: 2,
        title: "Almond Flour Sugar Cookies with Citrus Glaze",
        excerpt: "These gluten-free sugar cookies made with almond flour have a wonderful tender texture and delightful citrus glaze that makes them irresistible.",
        date: "April 12, 2025",
        category: "Gluten-Free",
        image: "https://source.unsplash.com/random/350x200/?sugar-cookies"
      },
      {
        id: 3,
        title: "No-Bake Chocolate Oatmeal Cookies",
        excerpt: "Perfect for hot summer days, these no-bake chocolate oatmeal cookies come together in minutes and satisfy your cookie cravings without turning on the oven.",
        date: "April 10, 2025",
        category: "No-Bake",
        image: "https://source.unsplash.com/random/350x200/?oatmeal-cookies"
      }
    ];

    setPosts(mockPosts);
    setLoading(false);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search functionality
    alert('Search functionality will be implemented soon!');
  };

  if (loading) {
    return <div className="blog-container">Loading...</div>;
  }

  const featuredPost = posts.find(post => post.isFeatured);
  const regularPosts = posts.filter(post => !post.isFeatured);

  return (
    <div className="blog-container">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-overlay">
          <h2>Cookie Delights Blog</h2>
          <p>Discover delicious cookie recipes, baking tips, and sweet inspiration for every occasion.</p>
          <Link to="/recipes" className="blog-cta-button">Explore Recipes</Link>
        </div>
      </section>

      <div className="blog-content-wrapper">
        <main className="blog-main-content">
          {/* Featured Categories */}
          <section className="blog-featured-categories">
            <h3 className="blog-section-title">Featured Categories</h3>
            <div className="blog-categories-grid">
              <Link to="/category/chocolate" className="blog-category-card">
                <img src="https://source.unsplash.com/random/150x120/?chocolate" alt="Chocolate" className="blog-category-image" />
                <span className="blog-category-name">Chocolate</span>
              </Link>
              <Link to="/category/gluten-free" className="blog-category-card">
                <img src="https://source.unsplash.com/random/150x120/?gluten-free" alt="Gluten-Free" className="blog-category-image" />
                <span className="blog-category-name">Gluten-Free</span>
              </Link>
              <Link to="/category/no-bake" className="blog-category-card">
                <img src="https://source.unsplash.com/random/150x120/?no-bake" alt="No-Bake" className="blog-category-image" />
                <span className="blog-category-name">No-Bake</span>
              </Link>
              <Link to="/category/vegan" className="blog-category-card">
                <img src="https://source.unsplash.com/random/150x120/?vegan" alt="Vegan" className="blog-category-image" />
                <span className="blog-category-name">Vegan</span>
              </Link>
            </div>
          </section>

          {/* Blog Posts */}
          <section className="blog-posts">
            <h3 className="blog-section-title">Latest Recipes</h3>
            <div className="blog-posts-grid">
              {featuredPost && (
                <article className="blog-post blog-featured-post">
                  <div className="blog-featured-image">
                    <img src={featuredPost.image} alt={featuredPost.title} />
                    <span className="blog-post-category">{featuredPost.category}</span>
                  </div>
                  <div className="blog-featured-content">
                    <div className="blog-post-meta">
                      <span className="blog-post-date">{featuredPost.date}</span>
                      <span className="blog-post-author">By Cookie Delights</span>
                    </div>
                    <h3 className="blog-post-title">
                      <Link to={`/post/${featuredPost.id}`}>{featuredPost.title}</Link>
                    </h3>
                    <p className="blog-post-excerpt">{featuredPost.excerpt}</p>
                    <Link to={`/post/${featuredPost.id}`} className="blog-read-more">
                      Read Recipe <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </article>
              )}

              {regularPosts.map(post => (
                <article key={post.id} className="blog-post">
                  <div className="blog-post-image">
                    <img src={post.image} alt={post.title} />
                    <span className="blog-post-category">{post.category}</span>
                  </div>
                  <div className="blog-post-content">
                    <div className="blog-post-meta">
                      <span className="blog-post-date">{post.date}</span>
                      <span className="blog-post-author">By Cookie Delights</span>
                    </div>
                    <h3 className="blog-post-title">
                      <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="blog-post-excerpt">{post.excerpt}</p>
                    <Link to={`/post/${post.id}`} className="blog-read-more">
                      Read Recipe <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="blog-pagination">
              <button className="blog-pagination-button">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="blog-pagination-number active">1</button>
              <button className="blog-pagination-number">2</button>
              <button className="blog-pagination-number">3</button>
              <button className="blog-pagination-button">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </section>

          {/* Newsletter */}
          <section className="blog-newsletter">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get delicious cookie recipes delivered straight to your inbox every week! No spam, just yummy cookie goodness.</p>
            <form className="blog-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="blog-sidebar">
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
                <img src="https://source.unsplash.com/random/80x80/?smores" alt="S'mores" className="blog-popular-post-image" />
                <div className="blog-popular-post-content">
                  <h4><Link to="/post/4">S'mores Stuffed Cookies</Link></h4>
                  <span className="blog-popular-post-date">April 8, 2025</span>
                </div>
              </li>
              <li className="blog-popular-post">
                <img src="https://source.unsplash.com/random/80x80/?matcha" alt="Matcha" className="blog-popular-post-image" />
                <div className="blog-popular-post-content">
                  <h4><Link to="/post/5">Matcha White Chocolate Cookies</Link></h4>
                  <span className="blog-popular-post-date">April 5, 2025</span>
                </div>
              </li>
              <li className="blog-popular-post">
                <img src="https://source.unsplash.com/random/80x80/?caramel" alt="Caramel" className="blog-popular-post-image" />
                <div className="blog-popular-post-content">
                  <h4><Link to="/post/6">Salted Caramel Thumbprints</Link></h4>
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
        </aside>
      </div>
    </div>
  );
};

export default BlogPage; 