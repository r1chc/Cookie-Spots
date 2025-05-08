import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 22,
  title: "Italian Ricotta Cookies with Lemon Glaze",
  slug: "italian-ricotta-cookies",
  content: `
    <p>These soft, cake-like Italian ricotta cookies are a beloved classic in Italian-American homes, especially during holidays. The ricotta cheese gives them an incredibly tender texture, while the bright lemon glaze adds just the right amount of sweetness and tang.</p>
    
    <h2>Ingredients</h2>
    <h3>For the Cookies:</h3>
    <ul>
      <li>3 1/2 cups all-purpose flour</li>
      <li>2 teaspoons baking powder</li>
      <li>1 teaspoon salt</li>
      <li>1 cup (2 sticks) unsalted butter, softened</li>
      <li>2 cups granulated sugar</li>
      <li>2 large eggs</li>
      <li>15 oz (about 1 3/4 cups) whole milk ricotta cheese</li>
      <li>1 tablespoon vanilla extract</li>
      <li>Zest of 1 lemon</li>
    </ul>
    
    <h3>For the Lemon Glaze:</h3>
    <ul>
      <li>3 cups powdered sugar</li>
      <li>4-5 tablespoons fresh lemon juice</li>
      <li>Zest of 1 lemon</li>
      <li>Colored sprinkles (optional, but traditional)</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>Preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>In a medium bowl, whisk together flour, baking powder, and salt. Set aside.</li>
      <li>In a large bowl, cream together butter and sugar until light and fluffy, about 3 minutes.</li>
      <li>Add eggs one at a time, beating well after each addition.</li>
      <li>Mix in ricotta cheese, vanilla extract, and lemon zest until well combined.</li>
      <li>Gradually add the dry ingredients to the wet ingredients, mixing just until incorporated.</li>
      <li>The dough will be soft and slightly sticky. Refrigerate for 30 minutes to make it easier to handle.</li>
      <li>Using a cookie scoop or spoon, drop rounded tablespoons of dough onto the prepared baking sheets, leaving about 2 inches between cookies.</li>
      <li>Bake for 12-14 minutes, until the bottoms are just beginning to turn golden (the tops will remain pale).</li>
      <li>Allow to cool on the baking sheets for 5 minutes, then transfer to a wire rack to cool completely before glazing.</li>
      <li>For the glaze, whisk together powdered sugar, lemon juice, and lemon zest until smooth. The glaze should be thick but pourable. Add more lemon juice or powdered sugar as needed to achieve the right consistency.</li>
      <li>Dip the tops of the cooled cookies into the glaze, allowing any excess to drip off, then return to the wire rack.</li>
      <li>If using, immediately sprinkle with colored sprinkles before the glaze sets.</li>
      <li>Allow the glaze to set completely before storing, about 2 hours.</li>
    </ol>
    
    <h2>The Italian Connection</h2>
    <p>Ricotta cookies, known as "biscotti di ricotta" in Italian, are part of a rich tradition of Italian baking that utilizes fresh cheese to create tender, moist baked goods. The addition of ricotta in these cookies doesn't create a cheesy flavor but instead contributes to their unique, cakey texture and subtle richness.</p>
    
    <p>In Italy, these cookies are often served during holidays and special occasions, particularly during Easter celebrations. The colorful sprinkles (traditionally called "confetti" in Italian) add a festive touch that makes these cookies perfect for celebrations of all kinds.</p>
    
    <h2>Variations</h2>
    <ul>
      <li><strong>Anise Ricotta Cookies:</strong> Replace the lemon zest with 1 teaspoon anise extract in the cookie dough for a more traditional Italian flavor.</li>
      <li><strong>Orange Ricotta Cookies:</strong> Substitute orange zest and juice for the lemon in both the dough and glaze.</li>
      <li><strong>Almond Ricotta Cookies:</strong> Add 1 teaspoon almond extract to the dough and top with sliced almonds instead of sprinkles.</li>
      <li><strong>Chocolate Chip Ricotta Cookies:</strong> Fold 1 cup mini chocolate chips into the dough and use a vanilla glaze instead of lemon.</li>
    </ul>
    
    <h2>Storage</h2>
    <p>These cookies will stay soft and fresh in an airtight container at room temperature for up to 4 days. They can also be frozen unglazed for up to 3 months. Thaw completely before glazing.</p>
  `,
  excerpt: "These delicate Italian ricotta cookies with refreshing lemon glaze are perfect for spring gatherings, tea parties, or simply enjoying with your afternoon espresso.",
  publishedAt: "2025-03-25T14:00:00Z", // March 25, 2025
  category: "International",
  image: "/images/cookie-types/Italian Ricotta Cookies with Lemon Glaze.jpg",
  views: 3570,
  author: "Maria Rossi",
  tags: ["Italian", "ricotta", "lemon", "soft", "cakey", "glazed", "international"]
};

const ItalianRicottaCookies = () => {
  return <BaseArticle article={article} />;
};

export default ItalianRicottaCookies; 