import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 15, // ID should be higher than existing articles
  title: "Dubai Chocolate Cookie - Luxurious Date and Saffron Infused Delight",
  slug: "dubai-chocolate-cookie",
  content: `
    <p>Our Dubai Chocolate Cookie recipe brings together the rich flavors of the Middle East with premium chocolate for a truly extraordinary dessert experience. These cookies feature the perfect balance of dates, saffron, cardamom, and high-quality dark chocolate for a cookie that's as luxurious as Dubai itself.</p>
    
    <h2>Ingredients</h2>
    <ul>
      <li>2 cups all-purpose flour</li>
      <li>1/2 cup high-quality cocoa powder</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1/2 teaspoon ground cardamom</li>
      <li>1 cup unsalted butter, softened</li>
      <li>3/4 cup granulated sugar</li>
      <li>3/4 cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 teaspoons vanilla extract</li>
      <li>1/4 teaspoon saffron threads, crushed and soaked in 1 tablespoon warm milk</li>
      <li>1 cup finely chopped premium dates</li>
      <li>1 1/2 cups high-quality dark chocolate chunks (70% cocoa or higher)</li>
      <li>1/2 cup chopped pistachios</li>
      <li>Sea salt flakes for sprinkling</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>Preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>In a medium bowl, whisk together flour, cocoa powder, baking soda, salt, and cardamom. Set aside.</li>
      <li>Prepare the saffron by crushing the threads and soaking them in 1 tablespoon of warm milk for at least 10 minutes.</li>
      <li>In a large bowl, cream together butter and both sugars until light and fluffy, about 3-4 minutes.</li>
      <li>Beat in eggs one at a time, then add vanilla extract and the saffron-milk mixture.</li>
      <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
      <li>Gently fold in the chopped dates, dark chocolate chunks, and pistachios.</li>
      <li>Chill the dough for at least 1 hour (or overnight for best results).</li>
      <li>Scoop dough into large rounds (about 2 tablespoons each) and place on prepared baking sheets, leaving about 2 inches between cookies.</li>
      <li>Sprinkle each cookie with a few flakes of sea salt.</li>
      <li>Bake for 12-14 minutes, until edges are set but centers are still slightly soft.</li>
      <li>Let cool on baking sheets for 5 minutes, then transfer to wire racks to cool completely.</li>
    </ol>
    
    <h2>The Story Behind Dubai Chocolate Cookies</h2>
    <p>These cookies were inspired by the opulence and rich culinary heritage of Dubai. The combination of premium dark chocolate with traditional Middle Eastern ingredients like dates, saffron, cardamom, and pistachios creates a cookie that's as luxurious as the city itself. The saffron infusion adds a subtle but distinctive flavor that elevates these cookies to a truly special treat worthy of a special occasion.</p>
    
    <h2>Serving Suggestions</h2>
    <p>Serve these cookies slightly warm with a side of Arabic coffee or cardamom tea for an authentic Middle Eastern experience. They also pair beautifully with a small scoop of vanilla ice cream drizzled with date syrup.</p>
  `,
  excerpt: "Experience the luxury of Dubai in cookie form with these decadent chocolate cookies infused with dates, saffron, and pistachios.",
  publishedAt: "2025-05-07T14:00:00Z", // May 7, 2025 (most recent)
  category: "Specialty",
  image: "/images/cookie-types/specialty.webp", // Using existing image
  views: 9500, // Highest view count as requested
  author: "Chef Amira Hassan",
  tags: ["chocolate", "dates", "saffron", "Dubai", "Middle Eastern", "specialty", "gourmet"]
};

const DubaiChocolateCookie = () => {
  return <BaseArticle article={article} />;
};

export default DubaiChocolateCookie; 