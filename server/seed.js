const mongoose = require('mongoose');
const CookieType = require('./models/CookieType');
const DietaryOption = require('./models/DietaryOption');
const CookieSpot = require('./models/CookieSpot');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('./config/config');
require('dotenv').config();

// Create a cache with TTL of 24 hours (in seconds)
const cookieSpotCache = new NodeCache({ stdTTL: 86400 });

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variable or config
    const mongoURI = process.env.MONGO_URI || config.mongoURI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is not configured. Please set MONGO_URI in your environment variables.');
    }
    
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

// Safety check before clearing data
const safetyCheck = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed database in production environment');
    process.exit(1);
  }
  
  const count = await CookieSpot.countDocuments();
  if (count > 0) {
    console.log(`Warning: Database already contains ${count} cookie spots`);
    console.log('To proceed with seeding, please run with FORCE_SEED=true');
    if (process.env.FORCE_SEED !== 'true') {
      process.exit(1);
    }
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

// Fetch cookie spots from Google Places API
const fetchCookieSpotsFromGoogle = async (zipCode) => {
  try {
    const cachedData = cookieSpotCache.get(`google-${zipCode}`);
    if (cachedData) {
      console.log(`Using cached Google data for ${zipCode}`);
      return cachedData;
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      console.error('Google Places API key not found');
      return [];
    }

    // First get coordinates for the zip code
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${googleApiKey}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.error(`No location found for zip code ${zipCode}`);
      return [];
    }
    
    const location = geocodeResponse.data.results[0].geometry.location;
    
    // Search for cookie shops near this location
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&type=bakery&keyword=cookie&key=${googleApiKey}`;
    const placesResponse = await axios.get(placesUrl);
    
    if (!placesResponse.data.results) {
      console.error('No results from Google Places API');
      return [];
    }
    
    // Map Google results to our schema
    const spots = await Promise.all(placesResponse.data.results.map(async (place) => {
      // Get place details for more information
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,address_components&key=${googleApiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      const details = detailsResponse.data.result || {};
      
      // Extract address components
      const addressComponents = details.address_components || [];
      const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
      const street = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
      const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || '';
      const postalCode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || zipCode;
      const country = addressComponents.find(comp => comp.types.includes('country'))?.short_name || 'USA';
      
      // Format hours of operation
      const hours = {};
      if (details.opening_hours && details.opening_hours.weekday_text) {
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        details.opening_hours.weekday_text.forEach((dayHours, index) => {
          const day = daysOfWeek[index];
          hours[day] = dayHours.split(': ')[1] || 'Closed';
        });
      }
      
      return {
        name: place.name,
        description: place.vicinity || '',
        address: `${streetNumber} ${street}`,
        city,
        state_province: state,
        country,
        postal_code: postalCode,
        location: {
          type: 'Point',
          coordinates: [place.geometry.location.lng, place.geometry.location.lat]
        },
        phone: details.formatted_phone_number || '',
        website: details.website || '',
        hours_of_operation: hours,
        price_range: place.price_level ? '$'.repeat(place.price_level) : '$$',
        status: 'active',
        // Default values for fields we can't get from Google
        has_dine_in: true,
        has_takeout: true,
        has_delivery: false,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        // These would need to be set manually or via another process
        cookie_types: [],
        dietary_options: [],
        features: ['Google Verified'],
        source: 'google',
        source_id: place.place_id
      };
    }));
    
    // Cache the results
    cookieSpotCache.set(`google-${zipCode}`, spots);
    return spots;
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return [];
  }
};

// Fetch and combine cookie spots from all APIs
const fetchCookieSpots = async (zipCodes = ['10001', '10023', '10014', '10013', '10036', '10018']) => {
  try {
    let allSpots = [];
    
    for (const zipCode of zipCodes) {
      console.log(`Fetching cookie spots for ZIP: ${zipCode}`);
      
      // Fetch only from Google Places API
      const googleSpots = await fetchCookieSpotsFromGoogle(zipCode);
      
      console.log(`Found: Google (${googleSpots.length})`);
      
      // No need to combine from multiple sources anymore
      allSpots = [...allSpots, ...googleSpots];
    }
    
    return allSpots;
  } catch (error) {
    console.error('Error fetching cookie spots:', error);
    return [];
  }
};

// Save fetched cookie spots to database
const saveCookieSpots = async (cookieSpots, adminUserId) => {
  try {
    console.log(`Saving ${cookieSpots.length} cookie spots to database`);
    
    // Add admin user as the creator of these spots
    const spotsWithAdmin = cookieSpots.map(spot => ({
      ...spot,
      added_by: adminUserId,
      status: 'active' // Automatically approve spots from APIs
    }));
    
    // Save to database
    await CookieSpot.insertMany(spotsWithAdmin);
    console.log('Cookie spots saved successfully');
  } catch (error) {
    console.error('Error saving cookie spots:', error);
    throw error;
  }
};

// Clear cache
const clearCache = () => {
  cookieSpotCache.flushAll();
  console.log('Cache cleared');
};

// Run the seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    await safetyCheck();
    
    const cookieTypes = await seedCookieTypes();
    const dietaryOptions = await seedDietaryOptions();
    const adminUser = await createAdminUser();
    
    // Clear existing cookie spots
    await CookieSpot.deleteMany({});
    
    // Fetch and save cookie spots from APIs
    const zipCodes = ['10001', '10023', '10014', '10013', '10036', '10018']; // NYC zipcodes
    const cookieSpots = await fetchCookieSpots(zipCodes);
    await saveCookieSpots(cookieSpots, adminUser._id);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Export functions for use in other files
module.exports = {
  connectDB,
  fetchCookieSpots,
  fetchCookieSpotsFromGoogle,
  clearCache,
  seedDatabase
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  // Check if this is being run directly (not imported)
  console.log('Running seed script directly...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('FORCE_SEED:', process.env.FORCE_SEED);
  
  // Add a small delay to allow for Ctrl+C to cancel
  console.log('Press Ctrl+C within 3 seconds to cancel seeding...');
  setTimeout(() => {
    seedDatabase();
  }, 3000);
}
