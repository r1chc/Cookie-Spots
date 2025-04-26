import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 5,
  title: "Classic Snickerdoodle Cookies",
  slug: "classic-snickerdoodle-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>1 cup unsalted butter, softened</li>
      <li>1 1/2 cups granulated sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>2 3/4 cups all-purpose flour</li>
      <li>2 teaspoons cream of tartar</li>
      <li>1 teaspoon baking soda</li>
      <li>1/4 teaspoon salt</li>
      <li>1/4 cup sugar (for rolling)</li>
      <li>2 teaspoons ground cinnamon (for rolling)</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Cream together butter and 1 1/2 cups sugar until light and fluffy.</li>
      <li>Beat in eggs one at a time, then stir in vanilla.</li>
      <li>Whisk together flour, cream of tartar, baking soda, and salt.</li>
      <li>Gradually blend dry ingredients into butter mixture.</li>
      <li>Mix 1/4 cup sugar with cinnamon in a small bowl.</li>
      <li>Roll dough into balls, then roll in cinnamon sugar mixture.</li>
      <li>Place 2 inches apart on ungreased baking sheets.</li>
      <li>Bake for 10-12 minutes or until edges are lightly golden.</li>
    </ol>
  `,
  excerpt: "Soft and chewy cinnamon sugar cookies that are perfect for any occasion.",
  publishedAt: "2024-03-11T11:20:00Z",
  category: "Classic",
  image: "/images/cookie-types/snickerdoodle.webp",
  views: 1100, // Including base view count
  author: "Lisa Thompson",
  tags: ["classic", "cinnamon", "holiday", "dessert"]
};

const ClassicSnickerdoodleCookies = () => {
  return <BaseArticle article={article} />;
};

export default ClassicSnickerdoodleCookies; 