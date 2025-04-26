import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 7,
  title: "Lemon Glazed Shortbread Cookies",
  slug: "lemon-glazed-shortbread-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 cups all-purpose flour</li>
      <li>1 cup unsalted butter, softened</li>
      <li>1/2 cup powdered sugar</li>
      <li>1/4 teaspoon salt</li>
      <li>1 teaspoon vanilla extract</li>
    </ul>
    <h2>Lemon Glaze</h2>
    <ul>
      <li>1 cup powdered sugar</li>
      <li>2-3 tablespoons fresh lemon juice</li>
      <li>1 teaspoon lemon zest</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 325°F (165°C).</li>
      <li>Cream together butter and powdered sugar.</li>
      <li>Mix in vanilla extract.</li>
      <li>Gradually add flour and salt.</li>
      <li>Roll dough into 1/2-inch thickness.</li>
      <li>Cut into desired shapes.</li>
      <li>Bake for 12-15 minutes until edges are lightly golden.</li>
      <li>For glaze, mix powdered sugar with lemon juice and zest.</li>
      <li>Drizzle over cooled cookies.</li>
    </ol>
  `,
  excerpt: "Buttery shortbread cookies with a tangy lemon glaze that adds the perfect balance of sweetness and citrus.",
  publishedAt: "2024-03-09T13:45:00Z",
  category: "Classic",
  image: "/images/cookie-types/lemon-glazed.webp",
  views: 950, // Including base view count
  author: "James Anderson",
  tags: ["classic", "citrus", "shortbread", "dessert"]
};

const LemonGlazedShortbreadCookies = () => {
  return <BaseArticle article={article} />;
};

export default LemonGlazedShortbreadCookies; 