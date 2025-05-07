import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 25,
  title: "Peanut Butter Pretzel Cookies with Salted Caramel",
  slug: "peanut-butter-pretzel-cookies",
  content: `
    <p>These irresistible cookies combine the beloved flavors of peanut butter and pretzels for the perfect sweet and salty treat. With chunks of pretzel for crunch, a chewy peanut butter cookie base, and a drizzle of salted caramel on top, they're sure to become a new favorite in your cookie rotation.</p>
    
    <h2>Ingredients</h2>
    <h3>For the Cookies:</h3>
    <ul>
      <li>1 1/2 cups all-purpose flour</li>
      <li>1/2 teaspoon baking soda</li>
      <li>1/2 teaspoon baking powder</li>
      <li>3/4 teaspoon salt</li>
      <li>1/2 cup (1 stick) unsalted butter, softened</li>
      <li>3/4 cup creamy peanut butter (not natural-style)</li>
      <li>1/2 cup granulated sugar</li>
      <li>1/2 cup packed light brown sugar</li>
      <li>1 large egg</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1 1/2 cups pretzel pieces (roughly chopped, but not too fine)</li>
      <li>1/2 cup peanut butter chips</li>
      <li>Flaky sea salt, for topping</li>
    </ul>
    
    <h3>For the Salted Caramel Drizzle:</h3>
    <ul>
      <li>1/2 cup granulated sugar</li>
      <li>3 tablespoons unsalted butter, cubed</li>
      <li>1/4 cup heavy cream</li>
      <li>1/2 teaspoon flaky sea salt</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>In a medium bowl, whisk together flour, baking soda, baking powder, and salt. Set aside.</li>
      <li>In a large bowl, beat butter and peanut butter until smooth and well combined.</li>
      <li>Add both sugars and beat until light and fluffy, about 2-3 minutes.</li>
      <li>Beat in the egg and vanilla extract until well incorporated.</li>
      <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
      <li>Gently fold in the pretzel pieces and peanut butter chips. The dough will be somewhat crumbly due to the pretzel pieces.</li>
      <li>Cover and refrigerate the dough for at least 2 hours, or overnight for best results.</li>
      <li>When ready to bake, preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>Form the dough into balls about 2 tablespoons in size and place on the prepared baking sheets, leaving about 2 inches between cookies.</li>
      <li>Slightly flatten each ball with the palm of your hand or the bottom of a glass.</li>
      <li>Bake for 10-12 minutes, until the edges are set but the centers are still soft.</li>
      <li>Allow to cool on the baking sheets for 5 minutes, then transfer to a wire rack to cool completely.</li>
      <li>For the salted caramel drizzle: In a medium saucepan, heat sugar over medium heat, stirring occasionally with a heat-resistant spatula. The sugar will form clumps and eventually melt into a amber-colored liquid.</li>
      <li>Once the sugar is completely melted, immediately add the butter. Be careful as the caramel will bubble rapidly.</li>
      <li>Stir the butter into the caramel until it's completely melted, about 2 minutes.</li>
      <li>Very slowly, drizzle in the heavy cream while stirring. Again, be careful as the mixture will bubble vigorously.</li>
      <li>Allow the mixture to boil for 1 minute, then remove from heat and stir in the sea salt.</li>
      <li>Let the caramel cool slightly before drizzling over the cooled cookies. The caramel will thicken as it cools.</li>
      <li>Sprinkle each cookie with a small amount of flaky sea salt before the caramel sets.</li>
    </ol>
    
    <h2>The Sweet-Salty Balance</h2>
    <p>The combination of sweet and salty flavors creates a compelling taste experience that keeps you coming back for more. In these cookies, the sweetness of the peanut butter and caramel is perfectly balanced by the saltiness of the pretzels and sea salt, creating a complex flavor profile that satisfies multiple cravings at once.</p>
    
    <p>The textural contrast is equally important—the chewy cookie base combined with the crunchy pretzel pieces creates an interesting mouthfeel that makes these cookies especially satisfying.</p>
    
    <h2>Variations</h2>
    <ul>
      <li><strong>Chocolate Lover's Version:</strong> Add 1/2 cup semi-sweet chocolate chips to the dough, and drizzle with melted chocolate instead of caramel.</li>
      <li><strong>Extra Crunchy:</strong> Press additional pretzel pieces into the tops of the cookies before baking.</li>
      <li><strong>Peanut Butter Cup Cookies:</strong> Omit the caramel drizzle and press a mini peanut butter cup into the center of each cookie immediately after baking.</li>
      <li><strong>For Caramel Shortcut:</strong> If you don't want to make caramel from scratch, melt store-bought soft caramels with a splash of heavy cream for a quick drizzle.</li>
    </ul>
    
    <h2>Storage</h2>
    <p>These cookies will keep in an airtight container at room temperature for up to 5 days. For longer storage, freeze the cookies without the caramel drizzle for up to 3 months, then thaw and add the drizzle before serving.</p>
  `,
  excerpt: "The perfect sweet and salty treat: chewy peanut butter cookies loaded with crunchy pretzel pieces and drizzled with homemade salted caramel.",
  publishedAt: "2025-04-17T13:15:00Z", // April 17, 2025
  category: "Sweet & Salty",
  image: "/images/cookie-types/peanut-butter.webp", // Using existing image
  views: 3900,
  author: "Jamie Wilson",
  tags: ["peanut butter", "pretzel", "salted caramel", "sweet and salty", "caramel"]
};

const PeanutButterPretzelCookies = () => {
  return <BaseArticle article={article} />;
};

export default PeanutButterPretzelCookies; 