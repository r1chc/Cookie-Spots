import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 14,
  title: "Almond Biscotti",
  slug: "almond-biscotti",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 cups all-purpose flour</li>
      <li>1 cup granulated sugar</li>
      <li>1 teaspoon baking powder</li>
      <li>1/4 teaspoon salt</li>
      <li>3 large eggs</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1 teaspoon almond extract</li>
      <li>1 cup whole almonds, toasted</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 350°F (175°C).</li>
      <li>Whisk together flour, sugar, baking powder, and salt.</li>
      <li>Beat eggs and extracts, then add to dry ingredients.</li>
      <li>Fold in almonds.</li>
      <li>Form dough into two logs on baking sheet.</li>
      <li>Bake for 25 minutes.</li>
      <li>Slice and bake again for 10 minutes per side.</li>
    </ol>
  `,
  excerpt: "Crunchy almond biscotti that are perfect for dipping in coffee or tea.",
  publishedAt: "2024-03-02T09:30:00Z",
  category: "Specialty",
  image: "/images/cookie-types/almond-biscotti.webp",
  views: 950, // Including base view count
  author: "Robert Clark",
  tags: ["specialty", "italian", "coffee", "dessert"]
};

const AlmondBiscotti = () => {
  return <BaseArticle article={article} />;
};

export default AlmondBiscotti; 