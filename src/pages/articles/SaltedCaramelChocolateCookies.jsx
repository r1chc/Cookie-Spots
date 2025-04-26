import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 13,
  title: "Salted Caramel Chocolate Cookies",
  slug: "salted-caramel-chocolate-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/4 cups all-purpose flour</li>
      <li>3/4 cup cocoa powder</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1 cup unsalted butter, softened</li>
      <li>1 cup granulated sugar</li>
      <li>1 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>1 cup caramel bits</li>
      <li>Sea salt for sprinkling</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
      <li>Cream butter and sugars, then add eggs and vanilla.</li>
      <li>Gradually add dry ingredients.</li>
      <li>Fold in caramel bits.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Sprinkle with sea salt.</li>
      <li>Bake for 10-12 minutes.</li>
    </ol>
  `,
  excerpt: "Rich chocolate cookies with a gooey salted caramel center.",
  publishedAt: "2024-03-03T16:20:00Z",
  category: "Chocolate",
  image: "/images/cookie-types/salted-caramel.webp",
  views: 1350, // Including base view count
  author: "Jessica Taylor",
  tags: ["chocolate", "caramel", "decadent", "dessert"]
};

const SaltedCaramelChocolateCookies = () => {
  return <BaseArticle article={article} />;
};

export default SaltedCaramelChocolateCookies; 