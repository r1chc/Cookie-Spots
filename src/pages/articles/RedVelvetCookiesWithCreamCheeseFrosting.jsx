import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 9,
  title: "Red Velvet Cookies with Cream Cheese Frosting",
  slug: "red-velvet-cookies-with-cream-cheese-frosting",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/4 cups all-purpose flour</li>
      <li>1/2 cup unsweetened cocoa powder</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1 cup unsalted butter, softened</li>
      <li>1 1/2 cups granulated sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>1 tablespoon red food coloring</li>
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
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
      <li>Cream butter and sugar, then add eggs and vanilla.</li>
      <li>Mix in food coloring.</li>
      <li>Gradually add dry ingredients.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Bake for 10-12 minutes.</li>
      <li>For frosting, beat cream cheese and butter, then add sugar and vanilla.</li>
      <li>Frost cooled cookies.</li>
    </ol>
  `,
  excerpt: "Soft and chewy red velvet cookies topped with a rich cream cheese frosting.",
  publishedAt: "2024-03-07T15:15:00Z",
  category: "Specialty",
  image: "/images/cookie-types/red-velvet.webp",
  views: 1300, // Including base view count
  author: "Emma Davis",
  tags: ["specialty", "holiday", "cream cheese", "dessert"]
};

const RedVelvetCookiesWithCreamCheeseFrosting = () => {
  return <BaseArticle article={article} />;
};

export default RedVelvetCookiesWithCreamCheeseFrosting; 