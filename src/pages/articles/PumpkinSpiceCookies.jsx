import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 12,
  title: "Pumpkin Spice Cookies",
  slug: "pumpkin-spice-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/4 cups all-purpose flour</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1 teaspoon ground cinnamon</li>
      <li>1/4 teaspoon ground ginger</li>
      <li>1/4 teaspoon ground nutmeg</li>
      <li>1/4 teaspoon ground cloves</li>
      <li>1 cup unsalted butter, softened</li>
      <li>1 cup granulated sugar</li>
      <li>1 cup packed brown sugar</li>
      <li>1 cup pumpkin puree</li>
      <li>1 large egg</li>
      <li>2 teaspoons vanilla extract</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Whisk together flour, baking soda, salt, and spices.</li>
      <li>Cream butter and sugars, then add pumpkin, egg, and vanilla.</li>
      <li>Gradually add dry ingredients.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Bake for 10-12 minutes.</li>
    </ol>
  `,
  excerpt: "Warm and cozy pumpkin spice cookies that are perfect for fall.",
  publishedAt: "2024-03-04T11:45:00Z",
  category: "Seasonal",
  image: "/images/cookie-types/pumpkin-spice.webp",
  views: 1200, // Including base view count
  author: "Daniel Lee",
  tags: ["seasonal", "fall", "spiced", "dessert"]
};

const PumpkinSpiceCookies = () => {
  return <BaseArticle article={article} />;
};

export default PumpkinSpiceCookies; 