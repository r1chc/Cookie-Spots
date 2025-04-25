// Function to generate slugs from titles
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Remove leading/trailing spaces
};

// Mock article data - in a real app, this would come from an API
const mockArticles = [
  {
    id: 1,
    title: "Classic Chocolate Chip Cookies with Brown Butter",
    slug: "classic-chocolate-chip-cookies-with-brown-butter",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1 teaspoon salt</li>
        <li>1 cup (2 sticks) unsalted butter, browned</li>
        <li>3/4 cup granulated sugar</li>
        <li>3/4 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>2 cups semisweet chocolate chips</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Brown the butter in a saucepan and let cool slightly.</li>
        <li>Mix flour, baking soda, and salt in a bowl.</li>
        <li>Cream together browned butter and sugars.</li>
        <li>Add eggs and vanilla, then mix in dry ingredients.</li>
        <li>Fold in chocolate chips.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Bake for 9-11 minutes until golden brown.</li>
      </ol>
    `,
    excerpt: "Learn how to make the perfect chocolate chip cookies with a rich, nutty flavor from brown butter.",
    publishedAt: "2024-03-15T10:00:00Z",
    category: "Chocolate",
    image: "/images/cookie-types/chocolate-chip.webp",
    views: 1250,
    author: "Sarah Johnson",
    tags: ["chocolate", "classic", "brown butter", "dessert"]
  },
  {
    id: 2,
    title: "Almond Flour Sugar Cookies with Citrus Glaze",
    slug: "almond-flour-sugar-cookies-with-citrus-glaze",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups almond flour</li>
        <li>1/4 cup coconut flour</li>
        <li>1/2 cup butter, softened</li>
        <li>1/2 cup granulated sugar</li>
        <li>1 large egg</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1/2 teaspoon almond extract</li>
        <li>1/4 teaspoon salt</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>Cream together butter and sugar.</li>
        <li>Add egg and extracts, mix well.</li>
        <li>Combine dry ingredients and mix into wet ingredients.</li>
        <li>Roll dough and cut into shapes.</li>
        <li>Bake for 10-12 minutes.</li>
        <li>Let cool and drizzle with citrus glaze.</li>
      </ol>
    `,
    excerpt: "A gluten-free twist on classic sugar cookies with a bright citrus glaze.",
    publishedAt: "2024-03-14T15:30:00Z",
    category: "Gluten-Free",
    image: "/images/cookie-types/sugar-cookie.webp",
    views: 980,
    author: "Michael Chen",
    tags: ["gluten-free", "sugar cookies", "citrus", "dessert"]
  },
  {
    id: 3,
    title: "No-Bake Chocolate Oatmeal Cookies",
    slug: "no-bake-chocolate-oatmeal-cookies",
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
    excerpt: "Perfect for hot summer days, these no-bake chocolate oatmeal cookies come together in minutes.",
    publishedAt: "2024-03-13T09:15:00Z",
    category: "No-Bake",
    image: "/images/cookie-types/oatmeal-raisin.webp",
    views: 1560,
    author: "Emily Rodriguez",
    tags: ["no-bake", "chocolate", "easy", "quick"]
  },
  {
    id: 4,
    title: "Peanut Butter Chocolate Chip Cookies",
    slug: "peanut-butter-chocolate-chip-cookies",
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
    excerpt: "A perfect combination of peanut butter and chocolate in these soft and chewy cookies.",
    publishedAt: "2024-03-12T14:45:00Z",
    category: "Chocolate",
    image: "/images/cookie-types/peanut-butter.webp",
    views: 1420,
    author: "David Wilson",
    tags: ["peanut butter", "chocolate", "classic", "dessert"]
  },
  {
    id: 5,
    title: "Classic Snickerdoodle Cookies",
    slug: "classic-snickerdoodle-cookies",
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
    excerpt: "Soft and chewy cinnamon sugar cookies that are perfect for any occasion.",
    publishedAt: "2024-03-11T11:20:00Z",
    category: "Classic",
    image: "/images/cookie-types/snickerdoodle.webp",
    views: 1100,
    author: "Lisa Thompson",
    tags: ["classic", "cinnamon", "holiday", "dessert"]
  },
  {
    id: 6,
    title: "French Macarons with Raspberry Filling",
    slug: "french-macarons-with-raspberry-filling",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 3/4 cups powdered sugar</li>
        <li>1 cup almond flour</li>
        <li>3 large egg whites, room temperature</li>
        <li>1/4 cup granulated sugar</li>
        <li>1/2 teaspoon vanilla extract</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 300°F (150°C).</li>
        <li>Sift together powdered sugar and almond flour.</li>
        <li>Beat egg whites until foamy, then gradually add sugar.</li>
        <li>Continue beating until stiff peaks form.</li>
        <li>Gently fold in dry ingredients.</li>
        <li>Pipe onto baking sheets and let rest for 30 minutes.</li>
        <li>Bake for 15-18 minutes.</li>
        <li>Let cool completely before filling with raspberry jam.</li>
      </ol>
    `,
    excerpt: "Delicate French macarons with a sweet raspberry filling. These elegant cookies are perfect for special occasions.",
    publishedAt: "2024-03-10T16:00:00Z",
    category: "Specialty",
    image: "/images/cookie-types/macaron.webp",
    views: 2100,
    author: "Sophie Martin",
    tags: ["french", "specialty", "advanced", "elegant"]
  },
  {
    id: 7,
    title: "Lemon Glazed Shortbread Cookies",
    slug: "lemon-glazed-shortbread-cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups all-purpose flour</li>
        <li>1 cup unsalted butter, softened</li>
        <li>1/2 cup powdered sugar</li>
        <li>1/4 teaspoon salt</li>
        <li>1 teaspoon vanilla extract</li>
      </ul>
      <h2>Lemon Glaze</h2>
      <ul>
        <li>1 cup powdered sugar</li>
        <li>2-3 tablespoons fresh lemon juice</li>
        <li>1 teaspoon lemon zest</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 325°F (165°C).</li>
        <li>Cream together butter and powdered sugar.</li>
        <li>Mix in vanilla extract.</li>
        <li>Gradually add flour and salt.</li>
        <li>Roll dough into 1/2-inch thickness.</li>
        <li>Cut into desired shapes.</li>
        <li>Bake for 12-15 minutes until edges are lightly golden.</li>
        <li>For glaze, mix powdered sugar with lemon juice and zest.</li>
        <li>Drizzle over cooled cookies.</li>
      </ol>
    `,
    excerpt: "Buttery shortbread cookies with a tangy lemon glaze that adds the perfect balance of sweetness and citrus.",
    publishedAt: "2024-03-09T13:45:00Z",
    category: "Classic",
    image: "/images/cookie-types/lemon-glazed.webp",
    views: 950,
    author: "James Anderson",
    tags: ["classic", "citrus", "shortbread", "dessert"]
  },
  {
    id: 8,
    title: "Double Chocolate Cookies",
    slug: "double-chocolate-cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>1 cup unsalted butter, softened</li>
        <li>1 cup granulated sugar</li>
        <li>1 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>2 1/4 cups all-purpose flour</li>
        <li>3/4 cup cocoa powder</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>2 cups semi-sweet chocolate chips</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Cream together butter and sugars.</li>
        <li>Beat in eggs and vanilla.</li>
        <li>Mix in flour, cocoa powder, baking soda, and salt.</li>
        <li>Fold in chocolate chips.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Bake for 8-10 minutes.</li>
      </ol>
    `,
    excerpt: "Rich and decadent double chocolate cookies that are perfect for chocolate lovers.",
    publishedAt: "2024-03-08T10:30:00Z",
    category: "Chocolate",
    image: "/images/cookie-types/double-chocolate.webp",
    views: 1200,
    author: "Rachel Green",
    tags: ["chocolate", "rich", "decadent", "dessert"]
  },
  {
    id: 9,
    title: "Red Velvet Cookies with Cream Cheese Frosting",
    slug: "red-velvet-cookies-with-cream-cheese-frosting",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>1/2 cup unsweetened cocoa powder</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1 cup unsalted butter, softened</li>
        <li>1 1/2 cups granulated sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>1 tablespoon red food coloring</li>
      </ul>
      <h2>Cream Cheese Frosting</h2>
      <ul>
        <li>8 oz cream cheese, softened</li>
        <li>1/2 cup unsalted butter, softened</li>
        <li>4 cups powdered sugar</li>
        <li>1 teaspoon vanilla extract</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
        <li>Cream butter and sugar, then add eggs and vanilla.</li>
        <li>Mix in food coloring.</li>
        <li>Gradually add dry ingredients.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Bake for 10-12 minutes.</li>
        <li>For frosting, beat cream cheese and butter, then add sugar and vanilla.</li>
        <li>Frost cooled cookies.</li>
      </ol>
    `,
    excerpt: "Soft and chewy red velvet cookies topped with a rich cream cheese frosting.",
    publishedAt: "2024-03-07T15:15:00Z",
    category: "Specialty",
    image: "/images/cookie-types/red-velvet.webp",
    views: 1300,
    author: "Emma Davis",
    tags: ["specialty", "holiday", "cream cheese", "dessert"]
  },
  {
    id: 10,
    title: "Gingerbread Cookies with Royal Icing",
    slug: "gingerbread-cookies-with-royal-icing",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>3 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1/4 teaspoon salt</li>
        <li>1 tablespoon ground ginger</li>
        <li>1 tablespoon ground cinnamon</li>
        <li>1/4 teaspoon ground cloves</li>
        <li>3/4 cup unsalted butter, softened</li>
        <li>3/4 cup packed brown sugar</li>
        <li>1 large egg</li>
        <li>1/2 cup molasses</li>
      </ul>
      <h2>Royal Icing</h2>
      <ul>
        <li>3 cups powdered sugar</li>
        <li>2 large egg whites</li>
        <li>1 teaspoon lemon juice</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>Whisk together flour, baking soda, salt, and spices.</li>
        <li>Cream butter and sugar, then add egg and molasses.</li>
        <li>Gradually add dry ingredients.</li>
        <li>Chill dough for 1 hour.</li>
        <li>Roll out and cut into shapes.</li>
        <li>Bake for 8-10 minutes.</li>
        <li>For icing, beat egg whites and lemon juice, then add sugar.</li>
        <li>Decorate cooled cookies.</li>
      </ol>
    `,
    excerpt: "Classic gingerbread cookies with warm spices and molasses. Perfect for the holiday season.",
    publishedAt: "2024-03-06T12:00:00Z",
    category: "Seasonal",
    image: "/images/cookie-types/gingerbread.webp",
    views: 1100,
    author: "Thomas Wilson",
    tags: ["seasonal", "holiday", "spiced", "dessert"]
  },
  {
    id: 11,
    title: "White Chocolate Cranberry Cookies",
    slug: "white-chocolate-cranberry-cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1 cup unsalted butter, softened</li>
        <li>3/4 cup granulated sugar</li>
        <li>3/4 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>1 cup white chocolate chips</li>
        <li>1 cup dried cranberries</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Whisk together flour, baking soda, and salt.</li>
        <li>Cream butter and sugars, then add eggs and vanilla.</li>
        <li>Gradually add dry ingredients.</li>
        <li>Fold in white chocolate chips and cranberries.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Bake for 10-12 minutes.</li>
      </ol>
    `,
    excerpt: "Soft and chewy cookies packed with white chocolate chips and dried cranberries.",
    publishedAt: "2024-03-05T14:30:00Z",
    category: "Chocolate",
    image: "/images/cookie-types/white-chocolate.webp",
    views: 1000,
    author: "Olivia Brown",
    tags: ["chocolate", "fruit", "holiday", "dessert"]
  },
  {
    id: 12,
    title: "Pumpkin Spice Cookies",
    slug: "pumpkin-spice-cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1 teaspoon ground cinnamon</li>
        <li>1/4 teaspoon ground ginger</li>
        <li>1/4 teaspoon ground nutmeg</li>
        <li>1/4 teaspoon ground cloves</li>
        <li>1 cup unsalted butter, softened</li>
        <li>1 cup granulated sugar</li>
        <li>1 cup packed brown sugar</li>
        <li>1 cup pumpkin puree</li>
        <li>1 large egg</li>
        <li>2 teaspoons vanilla extract</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Whisk together flour, baking soda, salt, and spices.</li>
        <li>Cream butter and sugars, then add pumpkin, egg, and vanilla.</li>
        <li>Gradually add dry ingredients.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Bake for 10-12 minutes.</li>
      </ol>
    `,
    excerpt: "Warm and cozy pumpkin spice cookies that are perfect for fall.",
    publishedAt: "2024-03-04T11:45:00Z",
    category: "Seasonal",
    image: "/images/cookie-types/pumpkin-spice.webp",
    views: 1200,
    author: "Daniel Lee",
    tags: ["seasonal", "fall", "spiced", "dessert"]
  },
  {
    id: 13,
    title: "Salted Caramel Chocolate Cookies",
    slug: "salted-caramel-chocolate-cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>3/4 cup cocoa powder</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1 cup unsalted butter, softened</li>
        <li>1 cup granulated sugar</li>
        <li>1 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>1 cup caramel bits</li>
        <li>Sea salt for sprinkling</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Whisk together flour, cocoa powder, baking soda, and salt.</li>
        <li>Cream butter and sugars, then add eggs and vanilla.</li>
        <li>Gradually add dry ingredients.</li>
        <li>Fold in caramel bits.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Sprinkle with sea salt.</li>
        <li>Bake for 10-12 minutes.</li>
      </ol>
    `,
    excerpt: "Rich chocolate cookies with a gooey salted caramel center.",
    publishedAt: "2024-03-03T16:20:00Z",
    category: "Chocolate",
    image: "/images/cookie-types/salted-caramel.webp",
    views: 1350,
    author: "Jessica Taylor",
    tags: ["chocolate", "caramel", "decadent", "dessert"]
  },
  {
    id: 14,
    title: "Almond Biscotti",
    slug: "almond-biscotti",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 cups all-purpose flour</li>
        <li>1 cup granulated sugar</li>
        <li>1 teaspoon baking powder</li>
        <li>1/4 teaspoon salt</li>
        <li>3 large eggs</li>
        <li>1 teaspoon vanilla extract</li>
        <li>1 teaspoon almond extract</li>
        <li>1 cup whole almonds, toasted</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 350°F (175°C).</li>
        <li>Whisk together flour, sugar, baking powder, and salt.</li>
        <li>Beat eggs and extracts, then add to dry ingredients.</li>
        <li>Fold in almonds.</li>
        <li>Form dough into two logs on baking sheet.</li>
        <li>Bake for 25 minutes.</li>
        <li>Slice and bake again for 10 minutes per side.</li>
      </ol>
    `,
    excerpt: "Crunchy almond biscotti that are perfect for dipping in coffee or tea.",
    publishedAt: "2024-03-02T09:30:00Z",
    category: "Specialty",
    image: "/images/cookie-types/almond-biscotti.webp",
    views: 950,
    author: "Robert Clark",
    tags: ["specialty", "italian", "coffee", "dessert"]
  },
  {
    id: 15,
    title: "Matcha Green Tea Cookies",
    slug: "matcha-green-tea-cookies",
    content: `
      <h2>Ingredients</h2>
      <ul>
        <li>2 1/4 cups all-purpose flour</li>
        <li>2 tablespoons matcha powder</li>
        <li>1 teaspoon baking soda</li>
        <li>1/2 teaspoon salt</li>
        <li>1 cup unsalted butter, softened</li>
        <li>1 cup granulated sugar</li>
        <li>1 cup packed brown sugar</li>
        <li>2 large eggs</li>
        <li>2 teaspoons vanilla extract</li>
        <li>1 cup white chocolate chips</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>Preheat oven to 375°F (190°C).</li>
        <li>Whisk together flour, matcha powder, baking soda, and salt.</li>
        <li>Cream butter and sugars, then add eggs and vanilla.</li>
        <li>Gradually add dry ingredients.</li>
        <li>Fold in white chocolate chips.</li>
        <li>Drop rounded tablespoons onto baking sheets.</li>
        <li>Bake for 10-12 minutes.</li>
      </ol>
    `,
    excerpt: "Delicate and flavorful matcha green tea cookies that are perfect with a cup of tea.",
    publishedAt: "2024-03-01T13:15:00Z",
    category: "Specialty",
    image: "/images/cookie-types/matcha-green.webp",
    views: 1050,
    author: "Yuki Tanaka",
    tags: ["specialty", "japanese", "unique", "dessert"]
  }
];

export { mockArticles }; 