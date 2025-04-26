import React from 'react';
import BaseArticle from './BaseArticle';

const article = {
  id: 3,
  title: "No-Bake Chocolate Oatmeal Cookies",
  slug: "no-bake-chocolate-oatmeal-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 cups granulated sugar</li>
      <li>1/2 cup milk</li>
      <li>1/2 cup butter</li>
      <li>3 cups quick-cooking oats</li>
      <li>1/2 cup peanut butter</li>
      <li>1/4 cup cocoa powder</li>
      <li>1 teaspoon vanilla extract</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>In a saucepan, combine sugar, milk, and butter.</li>
      <li>Bring to a boil and cook for 1 minute.</li>
      <li>Remove from heat and stir in oats, peanut butter, cocoa powder, and vanilla.</li>
      <li>Drop by tablespoonfuls onto wax paper.</li>
      <li>Let cool until firm.</li>
    </ol>
  `,
  excerpt: "Perfect for hot summer days, these no-bake chocolate oatmeal cookies come together in minutes.",
  publishedAt: "2024-03-13T09:15:00Z",
  category: "No-Bake",
  image: "/images/cookie-types/oatmeal-raisin.webp",
  views: 1560,
  author: "Emily Rodriguez",
  tags: ["no-bake", "chocolate", "easy", "quick"]
};

const NoBakeChocolateOatmealCookies = () => {
  return <BaseArticle article={article} />;
};

export default NoBakeChocolateOatmealCookies; 