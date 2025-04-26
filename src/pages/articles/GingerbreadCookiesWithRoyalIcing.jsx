import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 10,
  title: "Gingerbread Cookies with Royal Icing",
  slug: "gingerbread-cookies-with-royal-icing",
  content: `
    <h2>Ingredients</h2>
    <ul>
      <li>3 cups all-purpose flour</li>
      <li>1 teaspoon baking soda</li>
      <li>1/4 teaspoon salt</li>
      <li>1 tablespoon ground ginger</li>
      <li>1 tablespoon ground cinnamon</li>
      <li>1/4 teaspoon ground cloves</li>
      <li>3/4 cup unsalted butter, softened</li>
      <li>3/4 cup packed brown sugar</li>
      <li>1 large egg</li>
      <li>1/2 cup molasses</li>
    </ul>
    <h2>Royal Icing</h2>
    <ul>
      <li>3 cups powdered sugar</li>
      <li>2 large egg whites</li>
      <li>1 teaspoon lemon juice</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Preheat oven to 350°F (175°C).</li>
      <li>Whisk together flour, baking soda, salt, and spices.</li>
      <li>Cream butter and sugar, then add egg and molasses.</li>
      <li>Gradually add dry ingredients.</li>
      <li>Chill dough for 1 hour.</li>
      <li>Roll out and cut into shapes.</li>
      <li>Bake for 8-10 minutes.</li>
      <li>For icing, beat egg whites and lemon juice, then add sugar.</li>
      <li>Decorate cooled cookies.</li>
    </ol>
  `,
  excerpt: "Classic gingerbread cookies with warm spices and molasses. Perfect for the holiday season.",
  publishedAt: "2024-03-06T12:00:00Z",
  category: "Seasonal",
  image: "/images/cookie-types/gingerbread.webp",
  views: 1100, // Including base view count
  author: "Thomas Wilson",
  tags: ["seasonal", "holiday", "spiced", "dessert"]
};

const GingerbreadCookiesWithRoyalIcing = () => {
  return <BaseArticle article={article} />;
};

export default GingerbreadCookiesWithRoyalIcing; 