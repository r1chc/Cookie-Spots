import React from 'react';
import BaseArticle from './BaseArticle';

const article = {
  id: 2,
  title: "Almond Flour Sugar Cookies with Citrus Glaze",
  slug: "almond-flour-sugar-cookies-with-citrus-glaze",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 cups almond flour</li>
      <li>1/4 cup coconut flour</li>
      <li>1/2 cup butter, softened</li>
      <li>1/2 cup granulated sugar</li>
      <li>1 large egg</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1/2 teaspoon almond extract</li>
      <li>1/4 teaspoon salt</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 350°F (175°C).</li>
      <li>Cream together butter and sugar.</li>
      <li>Add egg and extracts, mix well.</li>
      <li>Combine dry ingredients and mix into wet ingredients.</li>
      <li>Roll dough and cut into shapes.</li>
      <li>Bake for 10-12 minutes.</li>
      <li>Let cool and drizzle with citrus glaze.</li>
    </ol>
  `,
  excerpt: "A gluten-free twist on classic sugar cookies with a bright citrus glaze.",
  publishedAt: "2024-03-14T15:30:00Z",
  category: "Gluten-Free",
  image: "/images/cookie-types/sugar-cookie.webp",
  views: 980,
  author: "Michael Chen",
  tags: ["gluten-free", "sugar cookies", "citrus", "dessert"]
};

const AlmondFlourSugarCookies = () => {
  return <BaseArticle article={article} />;
};

export default AlmondFlourSugarCookies; 