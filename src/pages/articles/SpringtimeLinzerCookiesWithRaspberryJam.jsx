import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 20,
  title: "Springtime Linzer Cookies with Raspberry Jam",
  slug: "springtime-linzer-cookies-with-raspberry-jam",
  content: `
    <p>Celebrate spring with these beautiful Linzer cookies featuring spring-themed cutouts and vibrant raspberry jam. These delicate, buttery treats are not only visually stunning but also delicious, with the perfect balance of sweet cookie and tart jam filling.</p>
    
    <h2>Ingredients</h2>
    <ul>
      <li>3 cups all-purpose flour</li>
      <li>1 teaspoon baking powder</li>
      <li>1/2 teaspoon salt</li>
      <li>1/4 teaspoon ground cinnamon</li>
      <li>1 cup (2 sticks) unsalted butter, softened</li>
      <li>1 cup granulated sugar</li>
      <li>2 large eggs</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1/4 teaspoon almond extract (optional)</li>
      <li>1 cup finely ground almonds or almond flour</li>
      <li>1 cup high-quality raspberry jam or preserves</li>
      <li>Powdered sugar for dusting</li>
      <li>Edible flower petals for decoration (optional)</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>In a medium bowl, whisk together flour, baking powder, salt, and cinnamon. Set aside.</li>
      <li>In a large bowl, beat butter and sugar until light and fluffy, about 3 minutes.</li>
      <li>Add eggs one at a time, beating well after each addition.</li>
      <li>Stir in vanilla and almond extracts.</li>
      <li>Gradually add the flour mixture and ground almonds, mixing until just combined.</li>
      <li>Divide the dough into two equal portions, form into discs, wrap in plastic wrap, and refrigerate for at least 2 hours or overnight.</li>
      <li>When ready to bake, preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>On a lightly floured surface, roll out one disc of dough to about 1/8 inch thickness.</li>
      <li>Cut out 3-inch rounds with a cookie cutter and place on the prepared baking sheets. These will be the bottom cookies.</li>
      <li>Roll out the second disc of dough and cut out the same number of 3-inch rounds. Then, using smaller spring-themed cutters (flowers, butterflies, bees, etc.), cut centers out of these rounds. These will be the top cookies.</li>
      <li>Bake for 8-10 minutes, until the edges are just beginning to turn golden.</li>
      <li>Allow to cool on the baking sheets for 5 minutes, then transfer to a wire rack to cool completely.</li>
      <li>Once cooled, dust the top cookies (the ones with cutouts) with powdered sugar.</li>
      <li>Spread about 1 teaspoon of raspberry jam on the flat side of each bottom cookie.</li>
      <li>Carefully place the sugared top cookies over the jam-covered bottom cookies.</li>
      <li>If desired, place a small edible flower petal in the center of each cookie for added spring decoration.</li>
    </ol>
    
    <h2>History of Linzer Cookies</h2>
    <p>Linzer cookies are a smaller version of the famous Linzer torte, which originated in Linz, Austria, and is considered one of the oldest known cake recipes in the world. The torte traditionally consists of a buttery crust filled with black currant preserves and topped with a lattice crust. The cookie version maintains the same flavors but in a smaller, more delicate form.</p>
    
    <h2>Seasonal Variations</h2>
    <p>While these spring-themed Linzer cookies are perfect for celebrating the arrival of warmer weather and blooming flowers, you can easily adapt the recipe for other seasons:</p>
    <ul>
      <li><strong>Summer:</strong> Use strawberry or blueberry jam and cut out sun or beach-themed shapes</li>
      <li><strong>Fall:</strong> Switch to apple or pumpkin butter filling and use leaf-shaped cutters</li>
      <li><strong>Winter:</strong> Fill with spiced cranberry jam and use snowflake or star cutters</li>
    </ul>
    
    <h2>Storage Tips</h2>
    <p>These cookies are best served within 1-2 days of assembly, as the jam will eventually soften the cookie. Store assembled cookies in a single layer in an airtight container. If you need to make them ahead of time, you can store the baked cookies (unassembled) for up to a week, then fill them with jam just before serving.</p>
  `,
  excerpt: "Welcome spring with these beautiful Linzer cookies featuring spring-themed cutouts and bright raspberry jam filling.",
  publishedAt: "2025-04-01T10:30:00Z", // April 1, 2025
  category: "Seasonal",
  image: "/images/cookie-types/sugar-cookie.webp", // Using existing image
  views: 2950,
  author: "Emily Johnson",
  tags: ["linzer", "raspberry", "spring", "seasonal", "almond", "jam"]
};

const SpringtimeLinzerCookiesWithRaspberryJam = () => {
  return <BaseArticle article={article} />;
};

export default SpringtimeLinzerCookiesWithRaspberryJam; 