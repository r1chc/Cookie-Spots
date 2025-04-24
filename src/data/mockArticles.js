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
    date: "March 1, 2025",
    category: "Specialty",
    image: "/images/cookie-types/matcha-green.webp",
    views: 1050,
    tags: ["Specialty", "Japanese", "Unique"]
  }
]; 