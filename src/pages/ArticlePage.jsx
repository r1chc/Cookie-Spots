import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/ArticlePage.css';
import useScrollRestoration from '../hooks/useScrollRestoration';

const ArticlePage = () => {
  // Use the scroll restoration hook
  useScrollRestoration();

  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const [imageLoading, setImageLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);

  // Function to calculate popular tags
  const calculatePopularTags = (articles) => {
    const tagScores = {};
    
    // Calculate tag scores based on frequency and article views
    articles.forEach(article => {
      if (article.tags) {
        // Each tag gets points based on the article's views
        const tagPoints = article.views / 100; // Normalize views to a reasonable score
        article.tags.forEach(tag => {
          tagScores[tag] = (tagScores[tag] || 0) + tagPoints;
        });
      }
    });

    // Convert to array and sort by score
    const sortedTags = Object.entries(tagScores)
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag);

    // Take top 12 tags (4 rows of 3)
    return sortedTags.slice(0, 12);
  };

  // Scroll to top when article ID changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Calculate popular tags when component mounts
    const tags = calculatePopularTags(articles);
    setPopularTags(tags);
  }, [id]);

  // Mock article data - in a real app, this would come from an API
  const articles = [
    {
      id: 1,
      title: "Classic Chocolate Chip Cookies with Brown Butter",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1 teaspoon baking soda</li>
          <li>1 teaspoon salt</li>
          <li>1 cup (2 sticks) unsalted butter</li>
          <li>3/4 cup granulated sugar</li>
          <li>3/4 cup packed brown sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>2 cups semisweet chocolate chips</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 375°F (190°C).</li>
          <li>Brown the butter in a saucepan over medium heat until it turns golden brown and smells nutty.</li>
          <li>Let the butter cool slightly, then cream together with sugars.</li>
          <li>Add eggs and vanilla, mix well.</li>
          <li>Stir in flour, baking soda, and salt.</li>
          <li>Fold in chocolate chips.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Bake for 9-11 minutes until golden brown.</li>
        </ol>
      `,
      date: "April 14, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/chocolate-chip.webp",
      views: 1250,
      tags: ["Chocolate", "Classic", "Easy", "Quick"]
    },
    {
      id: 2,
      title: "Almond Flour Sugar Cookies with Citrus Glaze",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>1 cup almond flour</li>
          <li>1/2 cup granulated sugar</li>
          <li>1/4 cup powdered sugar</li>
          <li>1/4 cup unsalted butter, softened</li>
          <li>1/2 teaspoon vanilla extract</li>
          <li>1/4 teaspoon salt</li>
          <li>1/2 teaspoon lemon zest</li>
          <li>1/2 teaspoon orange zest</li>
          <li>1 large egg</li>
          <li>1 tablespoon lemon juice</li>
          <li>1 tablespoon orange juice</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 350°F (175°C).</li>
          <li>In a bowl, mix together almond flour, granulated sugar, and powdered sugar.</li>
          <li>Add softened butter, vanilla extract, salt, lemon zest, and orange zest.</li>
          <li>Mix until the mixture resembles coarse crumbs.</li>
          <li>Add egg and lemon juice, mix until dough forms.</li>
          <li>Add orange juice, mix until dough is well combined.</li>
          <li>Roll dough into 1-inch balls and place on a baking sheet.</li>
          <li>Bake for 10-12 minutes until cookies are lightly golden.</li>
        </ol>
      `,
      date: "April 15, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/sugar-cookie.webp",
      views: 800,
      tags: ["Gluten-Free", "Vegan", "Holiday", "Easy"]
    },
    {
      id: 3,
      title: "No-Bake Chocolate Oatmeal Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 cups granulated sugar</li>
          <li>1/2 cup milk</li>
          <li>1/2 cup butter</li>
          <li>3 cups quick-cooking oats</li>
          <li>1/2 cup peanut butter</li>
          <li>1/4 cup cocoa powder</li>
          <li>1 teaspoon vanilla extract</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>In a saucepan, combine sugar, milk, and butter.</li>
          <li>Bring to a boil and cook for 1 minute.</li>
          <li>Remove from heat and stir in oats, peanut butter, cocoa powder, and vanilla.</li>
          <li>Drop by tablespoonfuls onto wax paper.</li>
          <li>Let cool until firm.</li>
        </ol>
      `,
      date: "April 10, 2025",
      category: "No-Bake",
      image: "/images/cookie-types/oatmeal-raisin.webp",
      views: 1560,
      tags: ["No-Bake", "Quick", "Easy", "Kids"]
    },
    {
      id: 4,
      title: "Peanut Butter Chocolate Chip Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>1 cup peanut butter</li>
          <li>1 cup sugar</li>
          <li>1 large egg</li>
          <li>1 teaspoon vanilla extract</li>
          <li>1/2 cup chocolate chips</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 350°F (175°C).</li>
          <li>Mix peanut butter, sugar, egg, and vanilla until well combined.</li>
          <li>Stir in chocolate chips.</li>
          <li>Drop by rounded tablespoonfuls onto baking sheets.</li>
          <li>Bake for 10-12 minutes until edges are golden.</li>
        </ol>
      `,
      date: "April 8, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/peanut-butter.webp",
      views: 1420,
      tags: ["Chocolate", "Easy", "Quick", "Kids"]
    },
    {
      id: 5,
      title: "Classic Snickerdoodle Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 3/4 cups all-purpose flour</li>
          <li>2 teaspoons cream of tartar</li>
          <li>1 teaspoon baking soda</li>
          <li>1/2 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>1 1/2 cups sugar</li>
          <li>2 large eggs</li>
          <li>2 tablespoons sugar</li>
          <li>2 teaspoons ground cinnamon</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 400°F (200°C).</li>
          <li>Mix flour, cream of tartar, baking soda, and salt.</li>
          <li>Cream butter and 1 1/2 cups sugar until light and fluffy.</li>
          <li>Beat in eggs.</li>
          <li>Gradually blend in dry ingredients.</li>
          <li>Mix 2 tablespoons sugar and cinnamon.</li>
          <li>Shape dough into 1-inch balls and roll in cinnamon sugar.</li>
          <li>Place 2 inches apart on baking sheets.</li>
          <li>Bake for 8-10 minutes until set but not hard.</li>
        </ol>
      `,
      date: "April 5, 2025",
      category: "Classic",
      image: "/images/cookie-types/snickerdoodle.webp",
      views: 1100,
      tags: ["Classic", "Holiday", "Easy", "Kids"]
    },
    {
      id: 6,
      title: "French Macarons with Raspberry Filling",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>1 3/4 cups powdered sugar</li>
          <li>1 cup almond flour</li>
          <li>3 large egg whites</li>
          <li>1/4 cup granulated sugar</li>
          <li>1/2 teaspoon vanilla extract</li>
          <li>1/2 cup raspberry jam</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 300°F (150°C).</li>
          <li>Process powdered sugar and almond flour until fine.</li>
          <li>Beat egg whites until foamy, then gradually add sugar.</li>
          <li>Continue beating until stiff peaks form.</li>
          <li>Fold in almond flour mixture and vanilla.</li>
          <li>Pipe onto baking sheets and let rest for 30 minutes.</li>
          <li>Bake for 15-18 minutes until set.</li>
          <li>Cool completely and sandwich with raspberry jam.</li>
        </ol>
      `,
      date: "April 3, 2025",
      category: "Specialty",
      image: "/images/cookie-types/macaron.webp",
      views: 980,
      tags: ["Gluten-Free", "Holiday", "Vegan", "Specialty"]
    },
    {
      id: 7,
      title: "Lemon Blueberry Thumbprint Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1/2 teaspoon baking powder</li>
          <li>1/4 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>2/3 cup granulated sugar</li>
          <li>2 large egg yolks</li>
          <li>1 teaspoon vanilla extract</li>
          <li>1 tablespoon lemon zest</li>
          <li>1/2 cup blueberry jam</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 350°F (175°C).</li>
          <li>Whisk together flour, baking powder, and salt.</li>
          <li>Cream butter and sugar until light and fluffy.</li>
          <li>Beat in egg yolks, vanilla, and lemon zest.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Roll dough into 1-inch balls and place on baking sheets.</li>
          <li>Make an indentation in each cookie with your thumb.</li>
          <li>Fill each indentation with blueberry jam.</li>
          <li>Bake for 12-15 minutes until edges are golden.</li>
        </ol>
      `,
      date: "April 1, 2025",
      category: "Fruit",
      image: "/images/cookie-types/lemon-glazed.webp",
      views: 850,
      tags: ["Holiday", "Fruit", "Easy", "Kids"]
    },
    {
      id: 8,
      title: "Double Chocolate Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>1 1/2 cups all-purpose flour</li>
          <li>1/2 cup cocoa powder</li>
          <li>1 teaspoon baking soda</li>
          <li>1/2 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>3/4 cup granulated sugar</li>
          <li>3/4 cup packed brown sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>2 cups semisweet chocolate chips</li>
          <li>1 cup white chocolate chips</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 375°F (190°C).</li>
          <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
          <li>Cream butter and sugars until light and fluffy.</li>
          <li>Beat in eggs and vanilla.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in both types of chocolate chips.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Bake for 10-12 minutes until set.</li>
        </ol>
      `,
      date: "March 29, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/double-chocolate.webp",
      views: 1200,
      tags: ["Chocolate", "Easy", "Quick", "Kids"]
    },
    {
      id: 9,
      title: "Red Velvet Cookies with Cream Cheese Frosting",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1/4 cup cocoa powder</li>
          <li>1 teaspoon baking soda</li>
          <li>1/2 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>1 cup granulated sugar</li>
          <li>1/2 cup packed brown sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>1 tablespoon red food coloring</li>
          <li>1/2 cup white chocolate chips</li>
        </ul>
        
        <h2>Cream Cheese Frosting</h2>
        <ul>
          <li>8 oz cream cheese, softened</li>
          <li>1/2 cup unsalted butter, softened</li>
          <li>4 cups powdered sugar</li>
          <li>1 teaspoon vanilla extract</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 350°F (175°C).</li>
          <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
          <li>Cream butter and sugars until light and fluffy.</li>
          <li>Beat in eggs, vanilla, and food coloring.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in white chocolate chips.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Bake for 10-12 minutes until set.</li>
          <li>For frosting, beat cream cheese and butter until smooth.</li>
          <li>Gradually add powdered sugar and vanilla.</li>
          <li>Frost cooled cookies.</li>
        </ol>
      `,
      date: "March 27, 2025",
      category: "Specialty",
      image: "/images/cookie-types/red-velvet.webp",
      views: 1300,
      tags: ["Holiday", "Specialty", "Easy", "Kids"]
    },
    {
      id: 10,
      title: "Gingerbread Cookies with Royal Icing",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>3 cups all-purpose flour</li>
          <li>1 1/2 teaspoons baking powder</li>
          <li>3/4 teaspoon baking soda</li>
          <li>1/4 teaspoon salt</li>
          <li>1 tablespoon ground ginger</li>
          <li>1 3/4 teaspoons ground cinnamon</li>
          <li>1/4 teaspoon ground cloves</li>
          <li>6 tablespoons unsalted butter, softened</li>
          <li>3/4 cup dark brown sugar</li>
          <li>1 large egg</li>
          <li>1/2 cup molasses</li>
          <li>2 teaspoons vanilla extract</li>
        </ul>
        
        <h2>Royal Icing</h2>
        <ul>
          <li>3 cups powdered sugar</li>
          <li>2 large egg whites</li>
          <li>1 teaspoon lemon juice</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 375°F (190°C).</li>
          <li>Whisk together flour, baking powder, baking soda, salt, and spices.</li>
          <li>Cream butter and brown sugar until light and fluffy.</li>
          <li>Beat in egg, molasses, and vanilla.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Roll dough to 1/4-inch thickness and cut into shapes.</li>
          <li>Bake for 7-10 minutes until edges are firm.</li>
          <li>For icing, beat egg whites until frothy.</li>
          <li>Gradually add powdered sugar and lemon juice.</li>
          <li>Decorate cooled cookies with icing.</li>
        </ol>
      `,
      date: "March 25, 2025",
      category: "Seasonal",
      image: "/images/cookie-types/gingerbread.webp",
      views: 1100,
      tags: ["Holiday", "Seasonal", "Kids", "Specialty"]
    },
    {
      id: 11,
      title: "White Chocolate Cranberry Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1/2 teaspoon baking soda</li>
          <li>1 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>3/4 cup granulated sugar</li>
          <li>3/4 cup packed brown sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>1 cup white chocolate chips</li>
          <li>1 cup dried cranberries</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 375°F (190°C).</li>
          <li>Whisk together flour, baking soda, and salt.</li>
          <li>Cream butter and sugars until light and fluffy.</li>
          <li>Beat in eggs and vanilla.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in white chocolate chips and cranberries.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Bake for 10-12 minutes until golden brown.</li>
        </ol>
      `,
      date: "March 23, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/white-chocolate.webp",
      views: 1000,
      tags: ["Chocolate", "Holiday", "Fruit", "Easy"]
    },
    {
      id: 12,
      title: "Pumpkin Spice Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1 teaspoon baking soda</li>
          <li>1/2 teaspoon salt</li>
          <li>1 teaspoon ground cinnamon</li>
          <li>1/2 teaspoon ground nutmeg</li>
          <li>1/4 teaspoon ground ginger</li>
          <li>1/4 teaspoon ground cloves</li>
          <li>1 cup unsalted butter, softened</li>
          <li>1 cup granulated sugar</li>
          <li>1/2 cup packed brown sugar</li>
          <li>1 cup canned pumpkin puree</li>
          <li>1 large egg</li>
          <li>2 teaspoons vanilla extract</li>
          <li>1 cup white chocolate chips</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 350°F (175°C).</li>
          <li>Whisk together flour, baking soda, salt, and spices.</li>
          <li>Cream butter and sugars until light and fluffy.</li>
          <li>Beat in pumpkin, egg, and vanilla.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in white chocolate chips.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Bake for 12-15 minutes until edges are firm.</li>
        </ol>
      `,
      date: "March 21, 2025",
      category: "Seasonal",
      image: "/images/cookie-types/pumpkin-spice.webp",
      views: 1200,
      tags: ["Seasonal", "Holiday", "Easy", "Kids"]
    },
    {
      id: 13,
      title: "Salted Caramel Chocolate Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>1/2 cup cocoa powder</li>
          <li>1 teaspoon baking soda</li>
          <li>1/2 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>3/4 cup granulated sugar</li>
          <li>3/4 cup packed brown sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>1 cup semisweet chocolate chips</li>
          <li>1/2 cup caramel bits</li>
          <li>Sea salt for sprinkling</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 375°F (190°C).</li>
          <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
          <li>Cream butter and sugars until light and fluffy.</li>
          <li>Beat in eggs and vanilla.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in chocolate chips and caramel bits.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Sprinkle with sea salt.</li>
          <li>Bake for 10-12 minutes until set.</li>
        </ol>
      `,
      date: "March 19, 2025",
      category: "Chocolate",
      image: "/images/cookie-types/salted-caramel.webp",
      views: 1350,
      tags: ["Chocolate", "Specialty", "Easy", "Quick"]
    },
    {
      id: 14,
      title: "Almond Biscotti",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 cups all-purpose flour</li>
          <li>1 1/2 teaspoons baking powder</li>
          <li>1/4 teaspoon salt</li>
          <li>1/2 cup unsalted butter, softened</li>
          <li>3/4 cup granulated sugar</li>
          <li>2 large eggs</li>
          <li>1 teaspoon almond extract</li>
          <li>1 cup whole almonds, toasted</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 350°F (175°C).</li>
          <li>Whisk together flour, baking powder, and salt.</li>
          <li>Cream butter and sugar until light and fluffy.</li>
          <li>Beat in eggs and almond extract.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in almonds.</li>
          <li>Shape dough into two logs on baking sheet.</li>
          <li>Bake for 25-30 minutes until firm.</li>
          <li>Cool slightly, then slice diagonally.</li>
          <li>Bake slices for 10 minutes on each side.</li>
        </ol>
      `,
      date: "March 17, 2025",
      category: "Specialty",
      image: "/images/cookie-types/almond-biscotti.webp",
      views: 950,
      tags: ["Specialty", "Gluten-Free", "Holiday", "Nuts"]
    },
    {
      id: 15,
      title: "Matcha Green Tea Cookies",
      content: `
        <h2>Ingredients</h2>
        <ul>
          <li>2 1/4 cups all-purpose flour</li>
          <li>2 tablespoons matcha powder</li>
          <li>1 teaspoon baking soda</li>
          <li>1/2 teaspoon salt</li>
          <li>1 cup unsalted butter, softened</li>
          <li>3/4 cup granulated sugar</li>
          <li>3/4 cup packed brown sugar</li>
          <li>2 large eggs</li>
          <li>2 teaspoons vanilla extract</li>
          <li>1 cup white chocolate chips</li>
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          <li>Preheat oven to 375°F (190°C).</li>
          <li>Whisk together flour, matcha powder, baking soda, and salt.</li>
          <li>Cream butter and sugars until light and fluffy.</li>
          <li>Beat in eggs and vanilla.</li>
          <li>Gradually mix in dry ingredients.</li>
          <li>Fold in white chocolate chips.</li>
          <li>Drop rounded tablespoons of dough onto baking sheets.</li>
          <li>Bake for 10-12 minutes until edges are golden.</li>
        </ol>
      `,
      date: "March 15, 2025",
      category: "Specialty",
      image: "/images/cookie-types/matcha-green.webp",
      views: 1050,
      tags: ["Specialty", "Gluten-Free", "Vegan", "Holiday"]
    }
  ];

  const handleImageLoad = () => {
    setImageLoading(false);
    console.log('Image loaded successfully:', currentArticle.image);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    console.error('Error loading image:', currentArticle.image);
    e.target.onerror = null;
    e.target.src = "/images/cookie-types/chocolate-chip.webp";
  };

  const currentArticle = articles.find(article => article.id === currentId);
  const currentIndex = articles.findIndex(article => article.id === currentId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

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

      <div className="article-navigation">
        {prevArticle && (
          <Link to={`/article/${prevArticle.id}`} className="nav-button prev-button">
            <i className="fas fa-chevron-left"></i>
            <span className="nav-button-text">
              <span className="nav-button-label">Previous</span>
              <span className="nav-button-title">{prevArticle.title}</span>
            </span>
          </Link>
        )}
        {nextArticle && (
          <Link to={`/article/${nextArticle.id}`} className="nav-button next-button">
            <span className="nav-button-text">
              <span className="nav-button-label">Next</span>
              <span className="nav-button-title">{nextArticle.title}</span>
            </span>
            <i className="fas fa-chevron-right"></i>
          </Link>
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
              <i className="fas fa-eye"></i> {currentArticle.views.toLocaleString()} views
            </span>
          </div>
          
          <h1 className="article-title">{currentArticle.title}</h1>
          
          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: currentArticle.content }}
          />
        </article>

        <div className="article-sidebar-components">
          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Search</h3>
            <form className="blog-search-form mb-3" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Search recipes..." />
              <button type="submit"><i className="fas fa-search"></i></button>
            </form>
            <h4 className="blog-sidebar-subtitle text-sm mb-2">Popular Tags:</h4>
            <div className="blog-tags-cloud">
              {popularTags.map((tag, index) => (
                <Link key={index} to={`/tag/${tag.toLowerCase()}`} className="blog-tag text-sm py-1 px-2">
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="blog-sidebar-section">
            <h3 className="blog-sidebar-title">Popular Recipes</h3>
            <ul className="blog-popular-posts">
              {articles
                .sort((a, b) => b.views - a.views)
                .slice(0, 3)
                .map(article => (
                  <li key={article.id} className="blog-popular-post">
                    <img src={article.image} alt={article.title} className="blog-popular-post-image" />
                    <div className="blog-popular-post-content">
                      <h4><Link to={`/article/${article.id}`}>{article.title}</Link></h4>
                      <div>
                        <span className="blog-popular-post-date">{article.date}</span>
                        <span className="blog-popular-post-views">
                          <i className="fas fa-eye"></i> {article.views.toLocaleString()} views
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
        </div>
      </div>
    </div>
  );
};

export default ArticlePage; 