import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 26,
  title: "Lemon Blueberry White Chocolate Chip Cookies",
  slug: "lemon-blueberry-white-chocolate-chip-cookies",
  content: `
    <p>Bright, fresh, and bursting with flavor, these lemon blueberry white chocolate chip cookies are the perfect spring and summer treat. The combination of tangy lemon, sweet blueberries, and creamy white chocolate creates a cookie that's both refreshing and indulgent.</p>
    
    <h2>Ingredients</h2>
    <ul>
      <li>2 3/4 cups all-purpose flour</li>
      <li>1 teaspoon baking soda</li>
      <li>1/2 teaspoon baking powder</li>
      <li>1/2 teaspoon salt</li>
      <li>1 cup (2 sticks) unsalted butter, softened</li>
      <li>1 cup granulated sugar</li>
      <li>1/2 cup packed light brown sugar</li>
      <li>2 large eggs, at room temperature</li>
      <li>1 tablespoon lemon zest (from about 2 lemons)</li>
      <li>2 tablespoons fresh lemon juice</li>
      <li>1 teaspoon vanilla extract</li>
      <li>1 cup white chocolate chips</li>
      <li>1 1/2 cups dried blueberries (or 1 cup fresh blueberries, see note)</li>
      <li>Additional lemon zest for garnish (optional)</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>In a medium bowl, whisk together flour, baking soda, baking powder, and salt. Set aside.</li>
      <li>In a large bowl, cream together butter and both sugars until light and fluffy, about 3 minutes.</li>
      <li>Beat in eggs one at a time, then add lemon zest, lemon juice, and vanilla extract.</li>
      <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
      <li>Gently fold in the white chocolate chips and dried blueberries.</li>
      <li>Cover the dough and refrigerate for at least 2 hours, or overnight for best flavor development.</li>
      <li>When ready to bake, preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>Scoop the dough into balls about 2 tablespoons in size and place on the prepared baking sheets, leaving about 2 inches between cookies.</li>
      <li>Bake for 11-13 minutes, until the edges are just beginning to turn golden but the centers still look slightly underdone.</li>
      <li>Allow to cool on the baking sheets for 5 minutes, then transfer to a wire rack to cool completely.</li>
      <li>If desired, sprinkle with additional lemon zest while still warm for extra lemon flavor and a pretty presentation.</li>
    </ol>
    
    <h2>Note About Blueberries</h2>
    <p>This recipe calls for dried blueberries, which work best because they don't release excessive moisture into the cookie dough. If you'd like to use fresh blueberries, here are some tips:</p>
    <ul>
      <li>Gently fold them in at the very end to avoid breaking and bleeding</li>
      <li>Freeze the fresh blueberries for 30 minutes before adding to the dough</li>
      <li>Increase the flour by 2 tablespoons to account for the extra moisture</li>
      <li>Keep in mind that cookies made with fresh blueberries will be more delicate</li>
    </ul>
    
    <h2>Why This Combination Works</h2>
    <p>Lemon and blueberry is a classic flavor pairing that works beautifully in these cookies. The bright acidity of lemon cuts through the sweetness of the cookie base and white chocolate, while the blueberries add bursts of fruity flavor. White chocolate, with its creamy vanilla notes, acts as the perfect bridge between the tangy lemon and sweet-tart blueberries.</p>
    
    <p>The result is a perfectly balanced cookie that's so much more interesting than your standard chocolate chip. The pop of color from the blueberries also makes these cookies visually appealing and perfect for spring gatherings.</p>
    
    <h2>Serving Suggestions</h2>
    <p>These fresh, fruity cookies are perfect for:</p>
    <ul>
      <li>Spring and summer picnics</li>
      <li>Baby or bridal showers</li>
      <li>Mother's Day celebrations</li>
      <li>Afternoon tea parties</li>
      <li>As an accompaniment to lemon sorbet or vanilla ice cream</li>
    </ul>
    
    <h2>Storage</h2>
    <p>Store these cookies in an airtight container at room temperature for up to 5 days. If using fresh blueberries, the cookies are best consumed within 2-3 days. The dough can also be frozen for up to 3 months—either freeze the prepared dough in a block, or pre-form cookie dough balls and freeze them individually for baking on demand.</p>
  `,
  excerpt: "Bright and refreshing cookies featuring the perfect combination of tangy lemon, sweet blueberries, and creamy white chocolate chips.",
  publishedAt: "2025-04-22T11:00:00Z", // April 22, 2025
  category: "Fruit",
  image: "/images/cookie-types/white-chocolate-cranberry.webp", // Using existing image
  views: 3600,
  author: "Sophie Green",
  tags: ["lemon", "blueberry", "white chocolate", "fruit", "spring", "summer"]
};

const LemonBlueberryWhiteChocolateChipCookies = () => {
  return <BaseArticle article={article} />;
};

export default LemonBlueberryWhiteChocolateChipCookies; 