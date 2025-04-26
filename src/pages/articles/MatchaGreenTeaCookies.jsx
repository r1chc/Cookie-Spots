import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 15,
  title: "Matcha Green Tea Cookies",
  slug: "matcha-green-tea-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/4 cups all-purpose flour</li>
      <li>2 tablespoons matcha powder</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1 cup unsalted butter, softened</li>
      <li>1 cup granulated sugar</li>
      <li>1 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>1 cup white chocolate chips</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Whisk together flour, matcha powder, baking soda, and salt.</li>
      <li>Cream butter and sugars, then add eggs and vanilla.</li>
      <li>Gradually add dry ingredients.</li>
      <li>Fold in white chocolate chips.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Bake for 10-12 minutes.</li>
    </ol>
  `,
  excerpt: "Delicate and flavorful matcha green tea cookies that are perfect with a cup of tea.",
  publishedAt: "2024-03-01T13:15:00Z",
  category: "Specialty",
  image: "/images/cookie-types/matcha-green.webp",
  views: 1050, // Including base view count
  author: "Yuki Tanaka",
  tags: ["specialty", "japanese", "unique", "dessert"]
};

const MatchaGreenTeaCookies = () => {
  return <BaseArticle article={article} />;
};

export default MatchaGreenTeaCookies; 