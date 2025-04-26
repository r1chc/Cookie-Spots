import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 6,
  title: "French Macarons with Raspberry Filling",
  slug: "french-macarons-with-raspberry-filling",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>1 3/4 cups powdered sugar</li>
      <li>1 cup almond flour</li>
      <li>3 large egg whites, room temperature</li>
      <li>1/4 cup granulated sugar</li>
      <li>1/2 teaspoon vanilla extract</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 300°F (150°C).</li>
      <li>Sift together powdered sugar and almond flour.</li>
      <li>Beat egg whites until foamy, then gradually add sugar.</li>
      <li>Continue beating until stiff peaks form.</li>
      <li>Gently fold in dry ingredients.</li>
      <li>Pipe onto baking sheets and let rest for 30 minutes.</li>
      <li>Bake for 15-18 minutes.</li>
      <li>Let cool completely before filling with raspberry jam.</li>
    </ol>
  `,
  excerpt: "Delicate French macarons with a sweet raspberry filling. These elegant cookies are perfect for special occasions.",
  publishedAt: "2024-03-10T16:00:00Z",
  category: "Specialty",
  image: "/images/cookie-types/macaron.webp",
  views: 2100, // Including base view count
  author: "Sophie Martin",
  tags: ["french", "specialty", "advanced", "elegant"]
};

const FrenchMacaronsWithRaspberryFilling = () => {
  return <BaseArticle article={article} />;
};

export default FrenchMacaronsWithRaspberryFilling; 