import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 11,
  title: "White Chocolate Cranberry Cookies",
  slug: "white-chocolate-cranberry-cookies",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/4 cups all-purpose flour</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1 cup unsalted butter, softened</li>
      <li>3/4 cup granulated sugar</li>
      <li>3/4 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>1 cup white chocolate chips</li>
      <li>1 cup dried cranberries</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 375°F (190°C).</li>
      <li>Whisk together flour, baking soda, and salt.</li>
      <li>Cream butter and sugars, then add eggs and vanilla.</li>
      <li>Gradually add dry ingredients.</li>
      <li>Fold in white chocolate chips and cranberries.</li>
      <li>Drop rounded tablespoons onto baking sheets.</li>
      <li>Bake for 10-12 minutes.</li>
    </ol>
  `,
  excerpt: "Soft and chewy cookies packed with white chocolate chips and dried cranberries.",
  publishedAt: "2024-03-05T14:30:00Z",
  category: "Chocolate",
  image: "/images/cookie-types/white-chocolate.webp",
  views: 1000, // Including base view count
  author: "Olivia Brown",
  tags: ["chocolate", "fruit", "holiday", "dessert"]
};

const WhiteChocolateCranberryCookies = () => {
  return <BaseArticle article={article} />;
};

export default WhiteChocolateCranberryCookies; 