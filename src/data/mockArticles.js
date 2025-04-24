// Mock article data - in a real app, this would come from an API
export const mockArticles = [
  {
    id: 1,
    title: "Classic Chocolate Chip Cookies with Brown Butter",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1 teaspoon salt</li>
        <li>1 cup (2 sticks) unsalted butter</li>
        <li>3/4 cup granulated sugar</li>
        <li>3/4 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>2 cups semisweet chocolate chips</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Brown the butter in a saucepan over medium heat until it turns golden brown and smells nutty.</li>
        <li>Let the butter cool slightly, then cream together with sugars.</li>
        <li>Add eggs and vanilla, mix well.</li>
        <li>Stir in flour, baking soda, and salt.</li>
        <li>Fold in chocolate chips.</li>
        <li>Drop rounded tablespoons of dough onto baking sheets.</li>
        <li>Bake for 9-11 minutes until golden brown.</li>
      </ol>
    `,
    excerpt: "Elevate the classic chocolate chip cookie with the nutty depth of brown butter. These cookies have crispy edges, chewy centers and rich flavor that will impress everyone.",
    date: "March 15, 2025",
    category: "Classic",
    image: "/images/cookie-types/chocolate-chip.webp",
    isFeatured: true,
    views: 1250,
    tags: ["Chocolate", "Easy", "Classic", "Brown Butter"]
  },
  {
    id: 2,
    title: "Almond Flour Sugar Cookies with Citrus Glaze",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups almond flour</li>
        <li>1/2 cup powdered sugar</li>
        <li>1/4 teaspoon salt</li>
        <li>1/4 cup coconut oil, melted</li>
        <li>1 large egg</li>
        <li>1 teaspoon vanilla extract</li>
        <li>Zest of 1 lemon</li>
      </ul>
      
      <h2>Citrus Glaze</h2>
      <ul>
        <li>1 cup powdered sugar</li>
        <li>2-3 tablespoons fresh lemon juice</li>
        <li>1 teaspoon lemon zest</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>Mix almond flour, powdered sugar, and salt.</li>
        <li>Add melted coconut oil, egg, vanilla, and lemon zest.</li>
        <li>Roll dough between parchment paper.</li>
        <li>Cut into shapes and place on baking sheet.</li>
        <li>Bake for 8-10 minutes until edges are golden.</li>
        <li>For glaze, mix powdered sugar with lemon juice until smooth.</li>
        <li>Once cookies are cool, drizzle with citrus glaze.</li>
      </ol>
    `,
    excerpt: "These gluten-free sugar cookies made with almond flour have a wonderful tender texture and delightful citrus glaze that makes them irresistible.",
    date: "March 14, 2025",
    category: "Gluten-Free",
    image: "/images/cookie-types/sugar-cookie.webp",
    views: 980,
    tags: ["Gluten-Free", "Vegan", "Holiday", "Citrus"]
  },
  {
    id: 3,
    title: "No-Bake Chocolate Oatmeal Cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups granulated sugar</li>
        <li>1/2 cup milk</li>
        <li>1/2 cup butter</li>
        <li>3 cups quick-cooking oats</li>
        <li>1/2 cup peanut butter</li>
        <li>1/4 cup cocoa powder</li>
        <li>1 teaspoon vanilla extract</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>In a saucepan, combine sugar, milk, and butter.</li>
        <li>Bring to a boil and cook for 1 minute.</li>
        <li>Remove from heat and stir in oats, peanut butter, cocoa powder, and vanilla.</li>
        <li>Drop by tablespoonfuls onto wax paper.</li>
        <li>Let cool until firm.</li>
      </ol>
    `,
    excerpt: "Perfect for hot summer days, these no-bake chocolate oatmeal cookies come together in minutes and satisfy your cookie cravings without turning on the oven.",
    date: "March 13, 2025",
    category: "No-Bake",
    image: "/images/cookie-types/oatmeal-raisin.webp",
    views: 1560,
    tags: ["No-Bake", "Chocolate", "Easy", "Quick"]
  },
  {
    id: 4,
    title: "Peanut Butter Chocolate Chip Cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 cup unsalted butter, softened</li>
        <li>1 cup creamy peanut butter</li>
        <li>1 cup granulated sugar</li>
        <li>1 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 1/2 cups all-purpose flour</li>
        <li>1 teaspoon baking powder</li>
        <li>1/2 teaspoon salt</li>
        <li>1 1/2 teaspoons baking soda</li>
        <li>2 cups semi-sweet chocolate chips</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Cream together butter, peanut butter, and sugars.</li>
        <li>Beat in eggs one at a time.</li>
        <li>In a separate bowl, whisk flour, baking powder, salt, and baking soda.</li>
        <li>Gradually stir dry ingredients into wet mixture.</li>
        <li>Fold in chocolate chips.</li>
        <li>Drop rounded tablespoons onto ungreased baking sheets.</li>
        <li>Bake for 10-12 minutes or until edges are lightly browned.</li>
      </ol>
    `,
    excerpt: "A perfect combination of peanut butter and chocolate in these soft and chewy cookies that will satisfy any sweet tooth.",
    date: "March 12, 2025",
    category: "Chocolate",
    image: "/images/cookie-types/peanut-butter.webp",
    views: 1420,
    tags: ["Classic", "Peanut Butter", "Easy", "Kids"]
  },
  {
    id: 5,
    title: "Classic Snickerdoodle Cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 cup unsalted butter, softened</li>
        <li>1 1/2 cups granulated sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>2 3/4 cups all-purpose flour</li>
        <li>2 teaspoons cream of tartar</li>
        <li>1 teaspoon baking soda</li>
        <li>1/4 teaspoon salt</li>
        <li>1/4 cup sugar (for rolling)</li>
        <li>2 teaspoons ground cinnamon (for rolling)</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Cream together butter and 1 1/2 cups sugar until light and fluffy.</li>
        <li>Beat in eggs one at a time, then stir in vanilla.</li>
        <li>Whisk together flour, cream of tartar, baking soda, and salt.</li>
        <li>Gradually blend dry ingredients into butter mixture.</li>
        <li>Mix 1/4 cup sugar with cinnamon in a small bowl.</li>
        <li>Roll dough into balls, then roll in cinnamon sugar mixture.</li>
        <li>Place 2 inches apart on ungreased baking sheets.</li>
        <li>Bake for 10-12 minutes or until edges are lightly golden.</li>
      </ol>
    `,
    excerpt: "Soft and chewy cinnamon sugar cookies that are perfect for any occasion. These classic cookies are always a crowd favorite.",
    date: "March 11, 2025",
    category: "Classic",
    image: "/images/cookie-types/snickerdoodle.webp",
    views: 1100,
    tags: ["Classic", "Cinnamon", "Holiday", "Easy"]
  },
  {
    id: 6,
    title: "French Macarons with Raspberry Filling",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 3/4 cups powdered sugar</li>
        <li>1 cup almond flour</li>
        <li>3 large egg whites, room temperature</li>
        <li>1/4 cup granulated sugar</li>
        <li>1/2 teaspoon vanilla extract</li>
      </ul>
    `,
    excerpt: "Delicate French macarons with a sweet raspberry filling. These elegant cookies are perfect for special occasions.",
    date: "March 10, 2025",
    category: "Specialty",
    image: "/images/cookie-types/macaron.webp",
    views: 2100,
    tags: ["French", "Specialty", "Advanced", "Elegant"]
  },
  {
    id: 7,
    title: "Lemon Glazed Shortbread Cookies",
    excerpt: "Buttery shortbread cookies with a tangy lemon glaze that adds the perfect balance of sweetness and citrus.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups all-purpose flour</li>
        <li>1/2 cup powdered sugar</li>
        <li>1 cup (2 sticks) unsalted butter, softened</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1/2 teaspoon salt</li>
        <li>Zest of 1 lemon</li>
      </ul>
      
      <h2>Lemon Glaze</h2>
      <ul>
        <li>1 cup powdered sugar</li>
        <li>2 tablespoons fresh lemon juice</li>
        <li>1 teaspoon lemon zest</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 325°F (165°C).</li>
        <li>In a large bowl, mix flour, powdered sugar, and salt.</li>
        <li>Add softened butter, vanilla, and lemon zest. Mix until dough comes together.</li>
        <li>Press dough into an even layer in a 9x9 inch baking pan.</li>
        <li>Bake for 25-30 minutes until edges are lightly golden.</li>
        <li>While still warm, cut into squares or bars.</li>
        <li>For the glaze, whisk together powdered sugar, lemon juice, and zest until smooth.</li>
        <li>Drizzle glaze over cooled cookies and allow to set.</li>
      </ol>
    `,
    date: "March 9, 2025",
    category: "Classic",
    image: "/images/cookie-types/lemon-glazed.webp",
    views: 950,
    tags: ["Classic", "Citrus", "Shortbread"]
  },
  {
    id: 8,
    title: "Double Chocolate Cookies",
    excerpt: "Rich and decadent double chocolate cookies that are perfect for chocolate lovers. These cookies are packed with chocolate chips and cocoa powder.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 cup all-purpose flour</li>
        <li>1/2 cup unsweetened cocoa powder</li>
        <li>1/2 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1/2 cup unsalted butter, softened</li>
        <li>3/4 cup granulated sugar</li>
        <li>1/4 cup packed brown sugar</li>
        <li>1 large egg</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1 cup semi-sweet chocolate chips</li>
        <li>1/2 cup dark chocolate chunks</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>In a medium bowl, whisk together flour, cocoa powder, baking soda, and salt.</li>
        <li>In a large bowl, cream together butter and both sugars until light and fluffy.</li>
        <li>Beat in egg and vanilla extract.</li>
        <li>Gradually add dry ingredients to wet ingredients, mixing just until combined.</li>
        <li>Fold in chocolate chips and chunks.</li>
        <li>Drop rounded tablespoons of dough onto parchment-lined baking sheets.</li>
        <li>Bake for 10-12 minutes until edges are set but centers are still soft.</li>
        <li>Allow to cool on baking sheet for 5 minutes before transferring to wire rack.</li>
      </ol>
    `,
    date: "March 8, 2025",
    category: "Chocolate",
    image: "/images/cookie-types/double-chocolate.webp",
    views: 1200,
    tags: ["Chocolate", "Rich", "Decadent"]
  },
  {
    id: 9,
    title: "Red Velvet Cookies with Cream Cheese Frosting",
    excerpt: "Soft and chewy red velvet cookies topped with a rich cream cheese frosting. Perfect for Valentine's Day or any special occasion.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 1/2 cups all-purpose flour</li>
        <li>1/4 cup unsweetened cocoa powder</li>
        <li>1 teaspoon baking soda</li>
        <li>1/4 teaspoon salt</li>
        <li>1/2 cup unsalted butter, softened</li>
        <li>3/4 cup packed brown sugar</li>
        <li>1/4 cup granulated sugar</li>
        <li>1 large egg</li>
        <li>1 tablespoon red food coloring</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1/2 cup white chocolate chips</li>
      </ul>
      
      <h2>Cream Cheese Frosting</h2>
      <ul>
        <li>4 oz cream cheese, softened</li>
        <li>1/4 cup unsalted butter, softened</li>
        <li>1 1/2 cups powdered sugar</li>
        <li>1/2 teaspoon vanilla extract</li>
        <li>Pinch of salt</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>In a medium bowl, whisk together flour, cocoa powder, baking soda, and salt.</li>
        <li>In a large bowl, cream together butter and both sugars until light and fluffy.</li>
        <li>Beat in egg, red food coloring, and vanilla extract.</li>
        <li>Gradually add dry ingredients to wet ingredients, mixing just until combined.</li>
        <li>Fold in white chocolate chips.</li>
        <li>Drop rounded tablespoons of dough onto parchment-lined baking sheets.</li>
        <li>Bake for 10-12 minutes until edges are set.</li>
        <li>For the frosting, beat cream cheese and butter until smooth. Add powdered sugar, vanilla, and salt.</li>
        <li>Once cookies are completely cooled, spread with cream cheese frosting.</li>
      </ol>
    `,
    date: "March 7, 2025",
    category: "Specialty",
    image: "/images/cookie-types/red-velvet.webp",
    views: 1300,
    tags: ["Specialty", "Holiday", "Cream Cheese"]
  },
  {
    id: 10,
    title: "Gingerbread Cookies with Royal Icing",
    excerpt: "Classic gingerbread cookies with warm spices and molasses. Perfect for the holiday season or any time you want a cozy treat.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>3 cups all-purpose flour</li>
        <li>1 tablespoon ground ginger</li>
        <li>2 teaspoons ground cinnamon</li>
        <li>1/2 teaspoon ground cloves</li>
        <li>1/4 teaspoon ground nutmeg</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>3/4 cup unsalted butter, softened</li>
        <li>3/4 cup packed brown sugar</li>
        <li>1 large egg</li>
        <li>1/2 cup molasses</li>
        <li>2 teaspoons vanilla extract</li>
      </ul>
      
      <h2>Royal Icing</h2>
      <ul>
        <li>2 cups powdered sugar</li>
        <li>1 1/2 tablespoons meringue powder</li>
        <li>3-4 tablespoons water</li>
        <li>1/2 teaspoon vanilla extract</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>In a medium bowl, whisk together flour, spices, baking soda, and salt.</li>
        <li>In a large bowl, cream butter and brown sugar until light and fluffy.</li>
        <li>Beat in egg, molasses, and vanilla extract.</li>
        <li>Gradually add dry ingredients to wet ingredients, mixing until just combined.</li>
        <li>Divide dough in half, wrap in plastic, and refrigerate for at least 2 hours.</li>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>Roll out dough on floured surface to 1/4-inch thickness.</li>
        <li>Cut into desired shapes and place on parchment-lined baking sheets.</li>
        <li>Bake for 8-10 minutes until edges are set.</li>
        <li>For royal icing, mix powdered sugar and meringue powder. Add water and vanilla, beat until stiff peaks form.</li>
        <li>Once cookies are completely cooled, decorate with royal icing.</li>
      </ol>
    `,
    date: "March 6, 2025",
    category: "Seasonal",
    image: "/images/cookie-types/gingerbread.webp",
    views: 1100,
    tags: ["Seasonal", "Holiday", "Spiced"]
  },
  {
    id: 11,
    title: "White Chocolate Cranberry Cookies",
    excerpt: "Soft and chewy cookies packed with white chocolate chips and dried cranberries. A perfect balance of sweet and tart.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1 cup (2 sticks) unsalted butter, softened</li>
        <li>3/4 cup granulated sugar</li>
        <li>3/4 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>1 1/2 cups white chocolate chips</li>
        <li>1 cup dried cranberries</li>
        <li>1/2 cup chopped macadamia nuts (optional)</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
        <li>In a medium bowl, whisk together flour, baking soda, and salt.</li>
        <li>In a large bowl, cream together butter and both sugars until light and fluffy, about 2-3 minutes.</li>
        <li>Beat in eggs one at a time, then add vanilla extract.</li>
        <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
        <li>Fold in white chocolate chips, dried cranberries, and nuts if using.</li>
        <li>Drop rounded tablespoons of dough onto prepared baking sheets, spacing about 2 inches apart.</li>
        <li>Bake for 10-12 minutes, until edges are golden brown but centers are still soft.</li>
        <li>Allow cookies to cool on baking sheets for 5 minutes before transferring to wire racks to cool completely.</li>
      </ol>
    `,
    date: "March 5, 2025",
    category: "Chocolate",
    image: "/images/cookie-types/white-chocolate.webp",
    views: 1000,
    tags: ["Chocolate", "Fruit", "Holiday"]
  },
  {
    id: 12,
    title: "Pumpkin Spice Cookies",
    excerpt: "Warm and cozy pumpkin spice cookies that are perfect for fall. These cookies are packed with pumpkin and warm spices.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/2 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1 teaspoon baking powder</li>
        <li>2 teaspoons ground cinnamon</li>
        <li>1 teaspoon ground ginger</li>
        <li>1/2 teaspoon ground nutmeg</li>
        <li>1/4 teaspoon ground cloves</li>
        <li>1/2 teaspoon salt</li>
        <li>1/2 cup (1 stick) unsalted butter, softened</li>
        <li>1 cup granulated sugar</li>
        <li>1/2 cup packed brown sugar</li>
        <li>3/4 cup pumpkin puree (not pumpkin pie filling)</li>
        <li>1 large egg</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1 cup cinnamon chips or white chocolate chips (optional)</li>
      </ul>
      
      <h2>Cinnamon Sugar Coating (Optional)</h2>
      <ul>
        <li>1/3 cup granulated sugar</li>
        <li>1 teaspoon ground cinnamon</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
        <li>In a medium bowl, whisk together flour, baking soda, baking powder, spices, and salt.</li>
        <li>In a large bowl, cream together butter and both sugars until light and fluffy.</li>
        <li>Beat in pumpkin puree, egg, and vanilla extract.</li>
        <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
        <li>If using, fold in cinnamon chips or white chocolate chips.</li>
        <li>If using coating, mix the sugar and cinnamon in a small bowl.</li>
        <li>Scoop rounded tablespoons of dough, roll into balls, then roll in cinnamon sugar if desired.</li>
        <li>Place on prepared baking sheets about 2 inches apart.</li>
        <li>Bake for 12-14 minutes, until edges are set but centers are still soft.</li>
        <li>Allow to cool on baking sheets for 5 minutes before transferring to wire racks.</li>
      </ol>
    `,
    date: "March 4, 2025",
    category: "Seasonal",
    image: "/images/cookie-types/pumpkin-spice.webp",
    views: 1200,
    tags: ["Seasonal", "Fall", "Spiced"]
  },
  {
    id: 13,
    title: "Salted Caramel Chocolate Cookies",
    excerpt: "Rich chocolate cookies with a gooey salted caramel center. These cookies are the perfect combination of sweet and salty.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 cup all-purpose flour</li>
        <li>1/2 cup unsweetened cocoa powder</li>
        <li>1/2 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1/2 cup (1 stick) unsalted butter, softened</li>
        <li>1/2 cup granulated sugar</li>
        <li>1/2 cup packed brown sugar</li>
        <li>1 large egg</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1/2 cup semi-sweet chocolate chips</li>
        <li>20 soft caramel candies, unwrapped</li>
        <li>1 tablespoon heavy cream</li>
        <li>Sea salt flakes for sprinkling</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
        <li>In a medium bowl, whisk together flour, cocoa powder, baking soda, and salt.</li>
        <li>In a large bowl, cream together butter and both sugars until light and fluffy.</li>
        <li>Beat in egg and vanilla extract.</li>
        <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
        <li>Fold in chocolate chips.</li>
        <li>In a microwave-safe bowl, combine caramels and heavy cream. Microwave in 30-second intervals, stirring between each, until melted and smooth.</li>
        <li>Scoop tablespoons of dough and flatten in your palm. Place a small amount (about 1/2 teaspoon) of caramel in the center, then fold the dough around it to seal.</li>
        <li>Place on prepared baking sheets about 2 inches apart.</li>
        <li>Bake for 10-12 minutes, until edges are set.</li>
        <li>Immediately sprinkle with sea salt flakes when cookies come out of the oven.</li>
        <li>Allow to cool on baking sheets for 10 minutes before transferring to wire racks.</li>
      </ol>
    `,
    date: "March 3, 2025",
    category: "Chocolate",
    image: "/images/cookie-types/salted-caramel.webp",
    views: 1350,
    tags: ["Chocolate", "Caramel", "Decadent"]
  },
  {
    id: 14,
    title: "Almond Biscotti",
    excerpt: "Crunchy almond biscotti that are perfect for dipping in coffee or tea. These Italian cookies are twice-baked for extra crispiness.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups all-purpose flour</li>
        <li>1 teaspoon baking powder</li>
        <li>1/4 teaspoon salt</li>
        <li>1 cup granulated sugar</li>
        <li>1/2 cup (1 stick) unsalted butter, softened</li>
        <li>2 large eggs</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1/2 teaspoon almond extract</li>
        <li>1 cup whole almonds, lightly toasted</li>
        <li>1 tablespoon orange zest (optional)</li>
        <li>1 egg white, lightly beaten (for brushing)</li>
      </ul>
      
      <h2>Optional Chocolate Dip</h2>
      <ul>
        <li>8 ounces semi-sweet or dark chocolate, chopped</li>
        <li>1 tablespoon vegetable oil</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C) and line a baking sheet with parchment paper.</li>
        <li>In a medium bowl, whisk together flour, baking powder, and salt.</li>
        <li>In a large bowl, cream together butter and sugar until light and fluffy.</li>
        <li>Beat in eggs one at a time, then add vanilla and almond extracts.</li>
        <li>Gradually add the flour mixture to the wet ingredients, mixing just until combined.</li>
        <li>Fold in almonds and orange zest if using.</li>
        <li>Divide dough in half and shape each half into a log about 12 inches long and 2 inches wide on the prepared baking sheet.</li>
        <li>Brush logs with beaten egg white.</li>
        <li>Bake for 25-30 minutes, until logs are lightly golden and firm.</li>
        <li>Remove from oven and let cool for 10 minutes.</li>
        <li>Reduce oven temperature to 325°F (165°C).</li>
        <li>Using a serrated knife, cut logs diagonally into 1/2-inch slices.</li>
        <li>Arrange slices, cut side down, on baking sheet.</li>
        <li>Bake for 8-10 minutes, then flip and bake for another 8-10 minutes until slices are crisp and golden.</li>
        <li>Cool completely on wire racks.</li>
        <li>For chocolate dip: Melt chocolate with oil in a double boiler or microwave. Dip one end of each biscotti in chocolate and place on parchment paper to set.</li>
      </ol>
    `,
    date: "March 2, 2025",
    category: "Specialty",
    image: "/images/cookie-types/almond-biscotti.webp",
    views: 950,
    tags: ["Specialty", "Italian", "Coffee"]
  },
  {
    id: 15,
    title: "Matcha Green Tea Cookies",
    excerpt: "Delicate and flavorful matcha green tea cookies that are perfect with a cup of tea. These cookies have a beautiful green color and unique flavor.",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups all-purpose flour</li>
        <li>2 tablespoons high-quality matcha green tea powder</li>
        <li>1/2 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>3/4 cup (1 1/2 sticks) unsalted butter, softened</li>
        <li>3/4 cup granulated sugar</li>
        <li>1 large egg</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1/2 cup white chocolate chips or chunks (optional)</li>
        <li>1/4 cup chopped pistachios (optional)</li>
      </ul>
      
      <h2>Optional Matcha Glaze</h2>
      <ul>
        <li>1 cup powdered sugar</li>
        <li>1 teaspoon matcha powder</li>
        <li>2-3 tablespoons milk or cream</li>
        <li>1/4 teaspoon vanilla extract</li>
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C) and line baking sheets with parchment paper.</li>
        <li>In a medium bowl, whisk together flour, matcha powder, baking soda, and salt.</li>
        <li>In a large bowl, cream together butter and sugar until light and fluffy.</li>
        <li>Beat in egg and vanilla extract.</li>
        <li>Gradually add the dry ingredients to the wet ingredients, mixing just until combined.</li>
        <li>If using, fold in white chocolate chips and pistachios.</li>
        <li>Roll dough into 1-inch balls and place on prepared baking sheets about 2 inches apart.</li>
        <li>Flatten each ball slightly with the bottom of a glass.</li>
        <li>Bake for 10-12 minutes, until edges are set but centers are still soft.</li>
        <li>Allow to cool on baking sheets for 5 minutes before transferring to wire racks.</li>
        <li>For the glaze: Whisk together powdered sugar, matcha powder, milk, and vanilla until smooth. Drizzle over cooled cookies.</li>
      </ol>
    `,
    date: "March 1, 2025",
    category: "Specialty",
    image: "/images/cookie-types/matcha-green.webp",
    views: 1050,
    tags: ["Specialty", "Japanese", "Unique"]
  }
]; 