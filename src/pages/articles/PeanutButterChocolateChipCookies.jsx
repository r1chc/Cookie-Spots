import React from 'react';
import BaseArticle from './BaseArticle';

const article = {
  id: 4,
  title: "Peanut Butter Chocolate Chip Cookies",
  slug: "peanut-butter-chocolate-chip-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>1 cup unsalted butter, softened</li>
      <li>1 cup creamy peanut butter</li>
      <li>1 cup granulated sugar</li>
      <li>1 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 1/2 cups all-purpose flour</li>
      <li>1 teaspoon baking powder</li>
      <li>1/2 teaspoon salt</li>
      <li>1 1/2 teaspoons baking soda</li>
      <li>2 cups semi-sweet chocolate chips</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Cream together butter, peanut butter, and sugars.</li>
      <li>Beat in eggs one at a time.</li>
      <li>In a separate bowl, whisk flour, baking powder, salt, and baking soda.</li>
      <li>Gradually stir dry ingredients into wet mixture.</li>
      <li>Fold in chocolate chips.</li>
      <li>Drop rounded tablespoons onto ungreased baking sheets.</li>
      <li>Bake for 10-12 minutes or until edges are lightly browned.</li>
    </ol>
  `,
  excerpt: "A perfect combination of peanut butter and chocolate in these soft and chewy cookies.",
  publishedAt: "2024-03-12T14:45:00Z",
  category: "Chocolate",
  image: "/images/cookie-types/peanut-butter.webp",
  views: 1420,
  author: "David Wilson",
  tags: ["peanut butter", "chocolate", "classic", "dessert"]
};

const PeanutButterChocolateChipCookies = () => {
  return <BaseArticle article={article} />;
};

export default PeanutButterChocolateChipCookies; 