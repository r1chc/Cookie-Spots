import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 18,
  title: "Gluten-Free Almond Flour Shortbread with Rosemary",
  slug: "gluten-free-almond-flour-shortbread",
  content: `
    <p>These elegant gluten-free shortbread cookies use almond flour for a tender, buttery texture with a subtle nutty flavor. The addition of fresh rosemary elevates them from everyday cookies to sophisticated treats perfect for special occasions or afternoon tea.</p>
    
    <h2>Ingredients</h2>
    <ul>
      <li>2 1/2 cups fine almond flour</li>
      <li>1/2 cup granulated sugar</li>
      <li>1/4 teaspoon salt</li>
      <li>1 tablespoon fresh rosemary, finely chopped</li>
      <li>1 teaspoon lemon zest (optional)</li>
      <li>1/2 cup (1 stick) cold unsalted butter, cubed</li>
      <li>1 large egg</li>
      <li>1/2 teaspoon vanilla extract</li>
      <li>Coarse sugar for sprinkling (optional)</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>In a food processor, combine almond flour, sugar, salt, rosemary, and lemon zest (if using). Pulse a few times to mix.</li>
      <li>Add the cold cubed butter and pulse until the mixture resembles coarse crumbs.</li>
      <li>Add the egg and vanilla extract, then pulse until the dough comes together.</li>
      <li>Turn the dough out onto a sheet of parchment paper and shape into a log about 2 inches in diameter.</li>
      <li>Wrap the log tightly in the parchment paper and refrigerate for at least 2 hours, or overnight.</li>
      <li>When ready to bake, preheat your oven to 325°F (165°C) and line baking sheets with parchment paper.</li>
      <li>Remove the dough from the refrigerator and unwrap. Slice the log into rounds about 1/4 inch thick.</li>
      <li>Place the cookies on the prepared baking sheets, leaving about an inch between them.</li>
      <li>If desired, sprinkle the tops with coarse sugar.</li>
      <li>Bake for 12-15 minutes, until the edges are just beginning to turn golden brown.</li>
      <li>Allow the cookies to cool on the baking sheets for 5 minutes, then transfer to a wire rack to cool completely.</li>
    </ol>
    
    <h2>Tips for Working with Almond Flour</h2>
    <p>Almond flour creates more delicate cookies than traditional wheat flour. For best results, make sure your butter is very cold, and don't skip the chilling time. If the dough becomes too soft while you're slicing it, return it to the refrigerator for 15-20 minutes to firm up again.</p>
    
    <p>Store almond flour in the refrigerator or freezer to keep it fresh, as it can go rancid more quickly than wheat flour due to its higher fat content.</p>
    
    <h2>Flavor Variations</h2>
    <p>This versatile shortbread recipe works beautifully with other herbs and flavorings:</p>
    <ul>
      <li>Replace rosemary with lavender for floral notes</li>
      <li>Use orange zest instead of lemon for a different citrus profile</li>
      <li>Add 1/4 teaspoon of cardamom for a subtle spiced version</li>
      <li>Dip half of each cookie in melted dark chocolate after baking</li>
      <li>Mix in 1/2 cup finely chopped pistachios for added texture and flavor</li>
    </ul>
    
    <h2>Serving and Storage</h2>
    <p>These shortbread cookies are perfect served with tea or coffee. They can be stored in an airtight container at room temperature for up to 1 week, or frozen for up to 3 months. The dough can also be frozen before baking - just add an extra minute or two to the baking time when cooking from frozen.</p>
  `,
  excerpt: "These gluten-free almond flour shortbread cookies with fresh rosemary offer a sophisticated, herbaceous twist on a classic shortbread.",
  publishedAt: "2025-03-28T16:30:00Z", // March 28, 2025
  category: "Gluten-Free",
  image: "/images/cookie-types/Gluten-Free Almond Flour Shortbread with Rosemary.png",
  views: 4120,
  author: "Claire Williams",
  tags: ["gluten-free", "almond flour", "shortbread", "rosemary", "herb", "elegant"]
};

const GlutenFreeAlmondFlourShortbread = () => {
  return <BaseArticle article={article} />;
};

export default GlutenFreeAlmondFlourShortbread; 