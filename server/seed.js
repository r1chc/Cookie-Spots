const mongoose = require('mongoose');
const CookieType = require('../models/CookieType');
const DietaryOption = require('../models/DietaryOption');
const CookieSpot = require('../models/CookieSpot');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variable or config
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://cookiespots:cookiespots123@cookiespots.mongodb.net/cookie-spots?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed cookie types
const seedCookieTypes = async () => {
  try {
    // Clear existing data
    await CookieType.deleteMany({});

    const cookieTypes = [
      {
        name: 'Chocolate Chip',
        description: 'Classic cookie with chocolate chips or chunks',
        icon: 'chocolate-chip.svg'
      },
      {
        name: 'Sugar Cookie',
        description: 'Sweet, simple cookies often decorated with icing or sprinkles',
        icon: 'sugar-cookie.svg'
      },
      {
        name: 'Oatmeal Raisin',
        description: 'Hearty cookies with oats and raisins',
        icon: 'oatmeal-raisin.svg'
      },
      {
        name: 'Peanut Butter',
        description: 'Rich cookies made with peanut butter',
        icon: 'peanut-butter.svg'
      },
      {
        name: 'Snickerdoodle',
        description: 'Soft cookies rolled in cinnamon sugar',
        icon: 'snickerdoodle.svg'
      },
      {
        name: 'Shortbread',
        description: 'Buttery, crumbly cookies with a simple flavor',
        icon: 'shortbread.svg'
      },
      {
        name: 'Macaron',
        description: 'French sandwich cookies made with almond flour and filled with ganache or buttercream',
        icon: 'macaron.svg'
      },
      {
        name: 'Gingerbread',
        description: 'Spiced cookies often shaped into figures or houses',
        icon: 'gingerbread.svg'
      },
      {
        name: 'White Chocolate Macadamia',
        description: 'Cookies with white chocolate chips and macadamia nuts',
        icon: 'white-chocolate-macadamia.svg'
      },
      {
        name: 'Double Chocolate',
        description: 'Chocolate cookies with chocolate chips or chunks',
        icon: 'double-chocolate.svg'
      },
      {
        name: 'Molasses',
        description: 'Soft, chewy cookies made with molasses',
        icon: 'molasses.svg'
      },
      {
        name: 'Butter Cookie',
        description: 'Simple, buttery cookies often piped into decorative shapes',
        icon: 'butter-cookie.svg'
      },
      {
        name: 'Fortune Cookie',
        description: 'Crisp cookies with a paper fortune inside',
        icon: 'fortune-cookie.svg'
      },
      {
        name: 'Biscotti',
        description: 'Italian twice-baked cookies perfect for dipping',
        icon: 'biscotti.svg'
      },
      {
        name: 'Thumbprint',
        description: 'Cookies with an indentation filled with jam or chocolate',
        icon: 'thumbprint.svg'
      },
      {
        name: 'Sandwich Cookie',
        description: 'Two cookies with filling in between',
        icon: 'sandwich-cookie.svg'
      },
      {
        name: 'Cookie Cake',
        description: 'Large cookie decorated like a cake',
        icon: 'cookie-cake.svg'
      },
      {
        name: 'Specialty/Seasonal',
        description: 'Unique or limited-time cookie offerings',
        icon: 'specialty-cookie.svg'
      }
    ];

    const createdCookieTypes = await CookieType.insertMany(cookieTypes);
    console.log(`${createdCookieTypes.length} cookie types seeded successfully`);
    return createdCookieTypes;
  } catch (error) {
    console.error('Error seeding cookie types:', error);
    process.exit(1);
  }
};

// Seed dietary options
const seedDietaryOptions = async () => {
  try {
    // Clear existing data
    await DietaryOption.deleteMany({});

    const dietaryOptions = [
      {
        name: 'Vegan',
        description: 'Contains no animal products including eggs, dairy, or honey',
        icon: 'vegan.svg'
      },
      {
        name: 'Gluten-Free',
        description: 'Contains no wheat, barley, rye, or other gluten-containing ingredients',
        icon: 'gluten-free.svg'
      },
      {
        name: 'Nut-Free',
        description: 'Contains no peanuts or tree nuts',
        icon: 'nut-free.svg'
      },
      {
        name: 'Dairy-Free',
        description: 'Contains no milk, butter, or other dairy products',
        icon: 'dairy-free.svg'
      },
      {
        name: 'Egg-Free',
        description: 'Contains no eggs or egg products',
        icon: 'egg-free.svg'
      },
      {
        name: 'Soy-Free',
        description: 'Contains no soy or soy-derived ingredients',
        icon: 'soy-free.svg'
      },
      {
        name: 'Organic',
        description: 'Made with certified organic ingredients',
        icon: 'organic.svg'
      },
      {
        name: 'Low Sugar',
        description: 'Contains reduced sugar or alternative sweeteners',
        icon: 'low-sugar.svg'
      },
      {
        name: 'Keto-Friendly',
        description: 'Low in carbs and suitable for ketogenic diets',
        icon: 'keto.svg'
      },
      {
        name: 'Paleo-Friendly',
        description: 'Made with ingredients compatible with paleo diets',
        icon: 'paleo.svg'
      }
    ];

    const createdDietaryOptions = await DietaryOption.insertMany(dietaryOptions);
    console.log(`${createdDietaryOptions.length} dietary options seeded successfully`);
    return createdDietaryOptions;
  } catch (error) {
    console.error('Error seeding dietary options:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@cookiespots.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      username: 'admin',
      email: 'admin@cookiespots.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      is_admin: true,
      is_verified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Seed cookie spots
const seedCookieSpots = async (cookieTypes, dietaryOptions, adminUser) => {
  try {
    // Clear existing data
    await CookieSpot.deleteMany({});

    // Get IDs for cookie types
    const chocolateChipId = cookieTypes.find(type => type.name === 'Chocolate Chip')._id;
    const sugarCookieId = cookieTypes.find(type => type.name === 'Sugar Cookie')._id;
    const oatmealRaisinId = cookieTypes.find(type => type.name === 'Oatmeal Raisin')._id;
    const peanutButterId = cookieTypes.find(type => type.name === 'Peanut Butter')._id;
    const doubleChocolateId = cookieTypes.find(type => type.name === 'Double Chocolate')._id;
    const whiteChocMacId = cookieTypes.find(type => type.name === 'White Chocolate Macadamia')._id;
    const specialtyId = cookieTypes.find(type => type.name === 'Specialty/Seasonal')._id;
    const snickerdoodleId = cookieTypes.find(type => type.name === 'Snickerdoodle')._id;

    // Get IDs for dietary options
    const veganId = dietaryOptions.find(option => option.name === 'Vegan')._id;
    const glutenFreeId = dietaryOptions.find(option => option.name === 'Gluten-Free')._id;
    const nutFreeId = dietaryOptions.find(option => option.name === 'Nut-Free')._id;
    const dairyFreeId = dietaryOptions.find(option => option.name === 'Dairy-Free')._id;
    const organicId = dietaryOptions.find(option => option.name === 'Organic')._id;

    const cookieSpots = [
      {
        name: 'Crumbl Cookie',
        description: 'Specialty cookies with rotating weekly flavors. Known for their large, fresh cookies in a signature pink box.',
        address: '1225 Broadway',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10001',
        location: {
          type: 'Point',
          coordinates: [-73.9888, 40.7429]
        },
        phone: '(212) 555-1234',
        website: 'https://crumblcookies.com',
        email: 'info@crumblcookies.com',
        hours_of_operation: {
          monday: '8:00 AM - 10:00 PM',
          tuesday: '8:00 AM - 10:00 PM',
          wednesday: '8:00 AM - 10:00 PM',
          thursday: '8:00 AM - 10:00 PM',
          friday: '8:00 AM - 12:00 AM',
          saturday: '8:00 AM - 12:00 AM',
          sunday: '8:00 AM - 10:00 PM'
        },
        price_range: '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: true,
        is_wheelchair_accessible: true,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId, sugarCookieId, specialtyId],
        dietary_options: [glutenFreeId],
        features: ['Rotating Menu', 'Online Ordering', 'Gift Cards Available'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.8,
        review_count: 324
      },
      {
        name: 'Levain Bakery',
        description: 'Famous for giant gooey cookies with crisp edges. Their chocolate chip walnut cookie is legendary in NYC.',
        address: '167 W 74th St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10023',
        location: {
          type: 'Point',
          coordinates: [-73.9807, 40.7799]
        },
        phone: '(212) 555-2345',
        website: 'https://levainbakery.com',
        email: 'info@levainbakery.com',
        hours_of_operation: {
          monday: '8:00 AM - 8:00 PM',
          tuesday: '8:00 AM - 8:00 PM',
          wednesday: '8:00 AM - 8:00 PM',
          thursday: '8:00 AM - 8:00 PM',
          friday: '8:00 AM - 8:00 PM',
          saturday: '8:00 AM - 8:00 PM',
          sunday: '8:00 AM - 8:00 PM'
        },
        price_range: '$$$',
        has_dine_in: false,
        has_takeout: true,
        has_delivery: true,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId, doubleChocolateId, oatmealRaisinId],
        dietary_options: [],
        features: ['Signature Cookies', 'Bakery Items', 'Coffee'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.9,
        review_count: 512
      },
      {
        name: 'Insomnia Cookies',
        description: 'Late-night cookie delivery service perfect for satisfying midnight cravings. Known for warm, fresh cookies delivered until 3 AM.',
        address: '76 Pearl St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10004',
        location: {
          type: 'Point',
          coordinates: [-73.9942, 40.7282]
        },
        phone: '(212) 555-3456',
        website: 'https://insomniacookies.com',
        email: 'info@insomniacookies.com',
        hours_of_operation: {
          monday: '11:00 AM - 3:00 AM',
          tuesday: '11:00 AM - 3:00 AM',
          wednesday: '11:00 AM - 3:00 AM',
          thursday: '11:00 AM - 3:00 AM',
          friday: '11:00 AM - 3:00 AM',
          saturday: '11:00 AM - 3:00 AM',
          sunday: '11:00 AM - 3:00 AM'
        },
        price_range: '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: true,
        is_wheelchair_accessible: true,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId, doubleChocolateId, snickerdoodleId, whiteChocMacId],
        dietary_options: [veganId],
        features: ['Late Night Delivery', 'Ice Cream', 'Cookie Cakes'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.6,
        review_count: 287
      },
      {
        name: 'Chip City',
        description: 'Gourmet cookies with rotating flavors. Known for their thick, gooey center and perfectly crisp exterior.',
        address: '353 Bleecker St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10014',
        location: {
          type: 'Point',
          coordinates: [-73.9649, 40.7112]
        },
        phone: '(212) 555-4567',
        website: 'https://chipcitycookies.com',
        email: 'info@chipcitycookies.com',
        hours_of_operation: {
          monday: '11:00 AM - 9:00 PM',
          tuesday: '11:00 AM - 9:00 PM',
          wednesday: '11:00 AM - 9:00 PM',
          thursday: '11:00 AM - 9:00 PM',
          friday: '11:00 AM - 10:00 PM',
          saturday: '11:00 AM - 10:00 PM',
          sunday: '11:00 AM - 9:00 PM'
        },
        price_range: '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: true,
        is_wheelchair_accessible: true,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId, peanutButterId, specialtyId],
        dietary_options: [glutenFreeId],
        features: ['Rotating Menu', 'Coffee', 'Online Ordering'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.7,
        review_count: 198
      },
      {
        name: 'Schmackary\'s',
        description: 'Broadway\'s favorite cookie shop with unique flavors. Known for creative recipes like maple bacon and funfetti.',
        address: '362 W 45th St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10036',
        location: {
          type: 'Point',
          coordinates: [-73.9877, 40.7630]
        },
        phone: '(212) 555-5678',
        website: 'https://schmackarys.com',
        email: 'info@schmackarys.com',
        hours_of_operation: {
          monday: '8:00 AM - 10:00 PM',
          tuesday: '8:00 AM - 10:00 PM',
          wednesday: '8:00 AM - 10:00 PM',
          thursday: '8:00 AM - 10:00 PM',
          friday: '8:00 AM - 11:00 PM',
          saturday: '8:00 AM - 11:00 PM',
          sunday: '8:00 AM - 10:00 PM'
        },
        price_range: '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: true,
        is_wheelchair_accessible: true,
        accepts_credit_cards: true,
        cookie_types: [specialtyId, sugarCookieId],
        dietary_options: [veganId, glutenFreeId],
        features: ['Theater District', 'Unique Flavors', 'Coffee'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.5,
        review_count: 203
      },
      {
        name: 'Maman',
        description: 'French bakery known for their nutty chocolate chip cookies. Featured in Oprah\'s Favorite Things list.',
        address: '239 Centre St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10013',
        location: {
          type: 'Point',
          coordinates: [-74.0068, 40.7197]
        },
        phone: '(212) 555-6789',
        website: 'https://mamannyc.com',
        email: 'info@mamannyc.com',
        hours_of_operation: {
          monday: '7:30 AM - 6:00 PM',
          tuesday: '7:30 AM - 6:00 PM',
          wednesday: '7:30 AM - 6:00 PM',
          thursday: '7:30 AM - 6:00 PM',
          friday: '7:30 AM - 6:00 PM',
          saturday: '8:00 AM - 6:00 PM',
          sunday: '8:00 AM - 6:00 PM'
        },
        price_range: '$$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: false,
        is_wheelchair_accessible: true,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId, specialtyId],
        dietary_options: [organicId],
        features: ['French Bakery', 'Coffee', 'Brunch'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.4,
        review_count: 167
      },
      {
        name: 'Milk & Cookies Bakery',
        description: 'Homestyle cookies baked fresh daily. Offers custom cookie creations and ice cream sandwiches.',
        address: '19 Commerce St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10014',
        location: {
          type: 'Point',
          coordinates: [-74.0041, 40.7359]
        },
        phone: '(212) 555-7890',
        website: 'https://milkandcookiesbakery.com',
        email: 'info@milkandcookiesbakery.com',
        hours_of_operation: {
          monday: '10:00 AM - 9:00 PM',
          tuesday: '10:00 AM - 9:00 PM',
          wednesday: '10:00 AM - 9:00 PM',
          thursday: '10:00 AM - 9:00 PM',
          friday: '10:00 AM - 10:00 PM',
          saturday: '10:00 AM - 10:00 PM',
          sunday: '10:00 AM - 9:00 PM'
        },
        price_range: '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: true,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId, oatmealRaisinId, peanutButterId],
        dietary_options: [nutFreeId, dairyFreeId],
        features: ['Custom Orders', 'Ice Cream Sandwiches', 'Gift Boxes'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.3,
        review_count: 142
      },
      {
        name: 'Culture Espresso',
        description: 'Coffee shop famous for their chocolate chip cookies. Small batch cookies baked throughout the day.',
        address: '72 W 38th St',
        city: 'New York',
        state_province: 'NY',
        country: 'USA',
        postal_code: '10018',
        location: {
          type: 'Point',
          coordinates: [-73.9841, 40.7513]
        },
        phone: '(212) 555-8901',
        website: 'https://cultureespresso.com',
        email: 'info@cultureespresso.com',
        hours_of_operation: {
          monday: '7:00 AM - 7:00 PM',
          tuesday: '7:00 AM - 7:00 PM',
          wednesday: '7:00 AM - 7:00 PM',
          thursday: '7:00 AM - 7:00 PM',
          friday: '7:00 AM - 7:00 PM',
          saturday: '8:00 AM - 7:00 PM',
          sunday: '8:00 AM - 7:00 PM'
        },
        price_range: '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: false,
        is_wheelchair_accessible: true,
        accepts_credit_cards: true,
        cookie_types: [chocolateChipId],
        dietary_options: [],
        features: ['Coffee Shop', 'Fresh Baked', 'Specialty Coffee'],
        added_by: adminUser._id,
        status: 'active',
        average_rating: 4.6,
        review_count: 178
      }
    ];

    const createdCookieSpots = await CookieSpot.insertMany(cookieSpots);
    console.log(`${createdCookieSpots.length} cookie spots seeded successfully`);
    return createdCookieSpots;
  } catch (error) {
    console.error('Error seeding cookie spots:', error);
    process.exit(1);
  }
};

// Run the seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    const cookieTypes = await seedCookieTypes();
    const dietaryOptions = await seedDietaryOptions();
    const adminUser = await createAdminUser();
    await seedCookieSpots(cookieTypes, dietaryOptions, adminUser);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
