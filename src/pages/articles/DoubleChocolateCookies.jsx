import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 8,
  title: "Double Chocolate Cookies",
  slug: "double-chocolate-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>1 cup unsalted butter, softened</li>
      <li>1 cup granulated sugar</li>
      <li>1 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>2 1/4 cups all-purpose flour</li>
      <li>3/4 cup cocoa powder</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>2 cups semi-sweet chocolate chips</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Cream together butter and sugars.</li>
      <li>Beat in eggs and vanilla.</li>
      <li>Mix in flour, cocoa powder, baking soda, and salt.</li>
      <li>Fold in chocolate chips.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Bake for 8-10 minutes.</li>
    </ol>
  `,
  excerpt: "Rich and decadent double chocolate cookies that are perfect for chocolate lovers.",
  publishedAt: "2024-03-08T10:30:00Z",
  category: "Chocolate",
  image: "/images/cookie-types/double-chocolate.webp",
  views: 1200, // Including base view count
  author: "Rachel Green",
  tags: ["chocolate", "rich", "decadent", "dessert"]
};

const DoubleChocolateCookies = () => {
  return <BaseArticle article={article} />;
};

export default DoubleChocolateCookies; 