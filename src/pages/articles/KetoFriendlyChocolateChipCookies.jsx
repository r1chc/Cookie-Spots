import React from 'react';
import BaseArticle from './BaseArticle';

export const article = {
  id: 21,
  title: "Keto-Friendly Chocolate Chip Cookies",
  slug: "keto-friendly-chocolate-chip-cookies",
  content: `
    <p>Following a ketogenic diet doesn't mean you have to give up your favorite treats. These keto-friendly chocolate chip cookies are low in carbs but high in flavor, with a perfect chewy texture and rich chocolate taste that will satisfy any cookie craving.</p>
    
    <h2>Ingredients</h2>
    <ul>
      <li>1 1/2 cups almond flour</li>
      <li>1/4 cup coconut flour</li>
      <li>1/2 teaspoon baking powder</li>
      <li>1/4 teaspoon xanthan gum (optional, but helps with texture)</li>
      <li>1/2 teaspoon salt</li>
      <li>1/2 cup (1 stick) unsalted butter, softened</li>
      <li>3/4 cup erythritol sweetener (such as Swerve)</li>
      <li>1 large egg, at room temperature</li>
      <li>1 teaspoon vanilla extract</li>
      <li>3/4 cup sugar-free chocolate chips or chopped dark chocolate (85% cocoa or higher)</li>
      <li>1/4 cup chopped walnuts or pecans (optional)</li>
    </ul>
    
    <h2>Instructions</h2>
    <ol>
      <li>Preheat your oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
      <li>In a medium bowl, whisk together almond flour, coconut flour, baking powder, xanthan gum (if using), and salt.</li>
      <li>In a large bowl, cream together the softened butter and erythritol until light and fluffy, about 2-3 minutes.</li>
      <li>Beat in the egg and vanilla extract until well combined.</li>
      <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
      <li>Fold in the sugar-free chocolate chips and nuts (if using).</li>
      <li>The dough will be slightly sticky. Chill in the refrigerator for 15-20 minutes to make it easier to handle.</li>
      <li>Scoop rounded tablespoons of dough and roll into balls. Place on the prepared baking sheets, leaving about 2 inches between cookies.</li>
      <li>Slightly flatten each ball with the palm of your hand (the cookies won't spread much during baking).</li>
      <li>Bake for 10-12 minutes, until the edges are just beginning to turn golden brown.</li>
      <li>Allow to cool on the baking sheets for 10 minutes (they will be very soft when first removed from the oven but will firm up as they cool).</li>
      <li>Transfer to a wire rack to cool completely.</li>
    </ol>
    
    <h2>Understanding Keto Baking</h2>
    <p>Keto baking is a different science than traditional baking. Almond and coconut flours absorb moisture differently than wheat flour, which is why we use less flour and more fat in this recipe. The xanthan gum helps mimic some of the binding properties of gluten, giving the cookies a better texture.</p>
    
    <p>Erythritol is a sugar alcohol that provides sweetness without the carbs. It doesn't affect blood sugar or insulin levels, making it ideal for those following a ketogenic diet. However, it does have a slightly cooling mouthfeel that some people notice. Blending it with a small amount of stevia or monk fruit sweetener can help mitigate this effect.</p>
    
    <h2>Nutritional Information (per cookie, recipe makes 18 cookies)</h2>
    <ul>
      <li>Calories: 130</li>
      <li>Total Fat: 12g</li>
      <li>Net Carbs: 2g</li>
      <li>Protein: 3g</li>
    </ul>
    
    <h2>Storage Tips</h2>
    <p>These keto cookies will keep in an airtight container at room temperature for up to 5 days, or in the refrigerator for up to 2 weeks. The dough can also be frozen in balls for up to 3 months—bake directly from frozen, adding 1-2 minutes to the baking time.</p>
    
    <p>For the ultimate keto treat, try serving these warm with a scoop of keto-friendly vanilla ice cream!</p>
  `,
  excerpt: "Satisfy your cookie cravings while staying in ketosis with these delicious low-carb chocolate chip cookies.",
  publishedAt: "2025-04-03T15:45:00Z", // April 3, 2025
  category: "Specialty",
  image: "/images/cookie-types/chocolate-chip.webp", // Using existing image
  views: 5200,
  author: "Dr. Sarah Wilson",
  tags: ["keto", "low-carb", "sugar-free", "gluten-free", "chocolate chip", "almond flour"]
};

const KetoFriendlyChocolateChipCookies = () => {
  return <BaseArticle article={article} />;
};

export default KetoFriendlyChocolateChipCookies; 