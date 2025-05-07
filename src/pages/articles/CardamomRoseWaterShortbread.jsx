import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 23,
  title: "Cardamom Rose Water Shortbread with Pistachios",
  slug: "cardamom-rose-water-shortbread",
  content: `
    <p>Transport yourself to the fragrant bazaars of the Middle East with these delicate shortbread cookies infused with aromatic cardamom and rose water. The addition of chopped pistachios adds color, texture, and a subtle nutty flavor that perfectly complements the floral notes.</p>
    
    <h2>Ingredients</h2>
    <ul>
      <li>2 cups all-purpose flour</li>
      <li>1/4 teaspoon salt</li>
      <li>1 teaspoon ground cardamom</li>
      <li>1 cup (2 sticks) unsalted butter, softened</li>
      <li>2/3 cup powdered sugar</li>
      <li>1 tablespoon rose water (available at specialty stores or online)</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1/2 cup shelled pistachios, roughly chopped, plus extra for garnish</li>
      <li>Dried rose petals, crushed, for garnish (optional)</li>
    </ul>
    
    <h3>For the Glaze (optional):</h3>
    <ul>
      <li>1 cup powdered sugar</li>
      <li>1-2 tablespoons milk or cream</li>
      <li>1/2 teaspoon rose water</li>
      <li>A drop of pink food coloring (optional)</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>In a medium bowl, whisk together flour, salt, and cardamom. Set aside.</li>
      <li>In a large bowl, beat butter and powdered sugar until light and fluffy, about 3 minutes.</li>
      <li>Mix in the rose water and vanilla extract until well combined.</li>
      <li>Gradually add the flour mixture, mixing just until incorporated.</li>
      <li>Fold in the chopped pistachios.</li>
      <li>Shape the dough into a log about 2 inches in diameter. Wrap in parchment paper or plastic wrap and refrigerate for at least 2 hours, or preferably overnight.</li>
      <li>When ready to bake, preheat your oven to 325°F (165°C) and line baking sheets with parchment paper.</li>
      <li>Slice the chilled dough into rounds about 1/4 inch thick and place on the prepared baking sheets, leaving about an inch between cookies.</li>
      <li>Bake for 12-15 minutes, until the edges are just beginning to turn golden.</li>
      <li>Allow to cool on the baking sheets for 5 minutes, then transfer to a wire rack to cool completely.</li>
      <li>For the optional glaze, whisk together powdered sugar, 1 tablespoon of milk or cream, rose water, and food coloring (if using). Add more liquid as needed to achieve a thick but pourable consistency.</li>
      <li>Drizzle or spread the glaze over the cooled cookies, then sprinkle with additional chopped pistachios and crushed dried rose petals before the glaze sets.</li>
    </ol>
    
    <h2>The Art of Floral Flavoring</h2>
    <p>Rose water has been used in Middle Eastern and South Asian cooking for centuries, adding a delicate floral note to both sweet and savory dishes. When baking with rose water, remember that a little goes a long way—too much can make your cookies taste like perfume! The amount in this recipe creates a subtle, aromatic flavor that pairs beautifully with the warm spice of cardamom.</p>
    
    <p>If you're new to cooking with floral flavors, keep in mind that quality matters. Look for culinary-grade rose water that's meant for food use, rather than cosmetic products.</p>
    
    <h2>Variations</h2>
    <ul>
      <li><strong>Orange Blossom:</strong> Substitute orange blossom water for the rose water for a different floral note.</li>
      <li><strong>Saffron Infusion:</strong> Add a pinch of saffron threads (crushed and steeped in 1 tablespoon of hot water) for a golden color and exotic flavor.</li>
      <li><strong>Almond:</strong> Replace pistachios with sliced almonds and add 1/4 teaspoon almond extract.</li>
      <li><strong>Festive Version:</strong> Add dried cranberries for a pop of color and tart flavor, perfect for holiday gifting.</li>
    </ul>
    
    <h2>Serving and Gifting</h2>
    <p>These elegant cookies are perfect for afternoon tea or as a light dessert following a spicy meal. They also make beautiful gifts—stack them in a decorative tin lined with parchment paper and tied with a ribbon for a thoughtful homemade present.</p>
    
    <p>Store in an airtight container at room temperature for up to 1 week, or freeze unglazed cookies for up to 3 months.</p>
  `,
  excerpt: "Delicate shortbread cookies infused with cardamom and rose water, studded with pistachios for a Middle Eastern-inspired treat.",
  publishedAt: "2025-04-10T09:45:00Z", // April 10, 2025
  category: "International",
  image: "/images/cookie-types/sugar-cookie.webp", // Using existing image
  views: 2700,
  author: "Layla Ahmed",
  tags: ["cardamom", "rose water", "pistachio", "shortbread", "Middle Eastern", "international", "floral"]
};

const CardamomRoseWaterShortbread = () => {
  return <BaseArticle article={article} />;
};

export default CardamomRoseWaterShortbread; 