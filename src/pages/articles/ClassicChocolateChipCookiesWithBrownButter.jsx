import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 1,
  title: "Classic Chocolate Chip Cookies with Brown Butter",
  slug: "classic-chocolate-chip-cookies-with-brown-butter",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/4 cups all-purpose flour</li>
      <li>1 teaspoon baking soda</li>
      <li>1 teaspoon salt</li>
      <li>1 cup (2 sticks) unsalted butter, browned</li>
      <li>3/4 cup granulated sugar</li>
      <li>3/4 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>2 cups semisweet chocolate chips</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Brown the butter in a saucepan and let cool slightly.</li>
      <li>Mix flour, baking soda, and salt in a bowl.</li>
      <li>Cream together browned butter and sugars.</li>
      <li>Add eggs and vanilla, then mix in dry ingredients.</li>
      <li>Fold in chocolate chips.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Bake for 9-11 minutes until golden brown.</li>
    </ol>
  `,
  excerpt: "Learn how to make the perfect chocolate chip cookies with a rich, nutty flavor from brown butter.",
  publishedAt: "2024-03-15T10:00:00Z",
  category: "Chocolate",
  image: "/images/cookie-types/chocolate-chip.webp",
  views: 1250,
  author: "Sarah Johnson",
  tags: ["chocolate", "classic", "brown butter", "dessert"]
};

const ClassicChocolateChipCookiesWithBrownButter = () => {
  return <BaseArticle article={article} />;
};

export default ClassicChocolateChipCookiesWithBrownButter; 