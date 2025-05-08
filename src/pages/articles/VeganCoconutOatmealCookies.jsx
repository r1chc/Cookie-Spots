import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 16,
  title: "Vegan Coconut Oatmeal Cookies with Maple Glaze",
  slug: "vegan-coconut-oatmeal-cookies",
  content: `
    <p>These vegan coconut oatmeal cookies are perfect for those looking for a plant-based treat that doesn't compromise on flavor or texture. The combination of coconut and oats creates a delightfully chewy cookie, while the maple glaze adds just the right amount of sweetness.</p>
    
    <h2>Ingredients</h2>
    <h3>For the Cookies:</h3>
    <ul>
      <li>1 3/4 cups rolled oats</li>
      <li>1 cup all-purpose flour</li>
      <li>1/2 cup shredded unsweetened coconut</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon salt</li>
      <li>1/2 teaspoon ground cinnamon</li>
      <li>1/4 teaspoon ground nutmeg</li>
      <li>1/2 cup coconut oil, melted</li>
      <li>3/4 cup coconut sugar (or brown sugar)</li>
      <li>1/4 cup maple syrup</li>
      <li>1/4 cup unsweetened applesauce (acts as egg replacer)</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1/2 cup chopped walnuts (optional)</li>
      <li>1/2 cup dried cranberries or raisins (optional)</li>
    </ul>
    
    <h3>For the Maple Glaze:</h3>
    <ul>
      <li>1 cup powdered sugar</li>
      <li>3 tablespoons pure maple syrup</li>
      <li>1-2 tablespoons non-dairy milk (such as almond or oat milk)</li>
      <li>1/4 teaspoon vanilla extract</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>Preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>In a large bowl, whisk together oats, flour, shredded coconut, baking soda, salt, cinnamon, and nutmeg.</li>
      <li>In a separate bowl, mix the melted coconut oil, coconut sugar, maple syrup, applesauce, and vanilla extract until well combined.</li>
      <li>Pour the wet ingredients into the dry ingredients and stir until just combined. If the mixture seems too dry, add 1-2 tablespoons of non-dairy milk.</li>
      <li>Fold in the walnuts and dried cranberries if using.</li>
      <li>Let the dough rest for 10 minutes to allow the oats to absorb some of the moisture.</li>
      <li>Scoop rounded tablespoons of dough onto the prepared baking sheets, leaving about 2 inches between cookies.</li>
      <li>Slightly flatten each cookie with the back of a spoon (they won't spread much during baking).</li>
      <li>Bake for 10-12 minutes until the edges are golden but the centers are still soft.</li>
      <li>Allow cookies to cool on the baking sheet for 5 minutes, then transfer to a wire rack to cool completely.</li>
      <li>For the glaze, whisk together powdered sugar, maple syrup, 1 tablespoon of non-dairy milk, and vanilla extract. Add more milk as needed to reach desired consistency.</li>
      <li>Once cookies are completely cool, drizzle with maple glaze and allow to set before serving.</li>
    </ol>
    
    <h2>Why These Vegan Cookies Work</h2>
    <p>The combination of coconut oil and applesauce in these cookies provides the perfect replacement for butter and eggs. The coconut oil adds richness, while the applesauce helps bind the ingredients together and adds moisture. The result is cookies that are just as delicious and satisfying as their traditional counterparts, but completely plant-based.</p>
    
    <h2>Storage Tips</h2>
    <p>Store these cookies in an airtight container at room temperature for up to 5 days, or freeze unglazed cookies for up to 3 months. If freezing, thaw at room temperature and add the glaze before serving.</p>
  `,
  excerpt: "Delicious plant-based coconut oatmeal cookies drizzled with a sweet maple glaze - completely vegan and incredibly satisfying.",
  publishedAt: "2025-03-18T09:30:00Z", // March 18, 2025
  category: "Vegan",
  image: "/images/cookie-types/Vegan Coconut Oatmeal Cookies with Maple Glaze.png",
  views: 3200,
  author: "Emma Green",
  tags: ["vegan", "coconut", "oatmeal", "plant-based", "dairy-free", "egg-free", "maple"]
};

const VeganCoconutOatmealCookies = () => {
  return <BaseArticle article={article} />;
};

export default VeganCoconutOatmealCookies; 