const mongoose = require('mongoose');
const CookieType = require('./models/CookieType');
const DietaryOption = require('./models/DietaryOption');
const CookieSpot = require('./models/CookieSpot');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Create a cache with TTL of 24 hours (in seconds)
const cookieSpotCache = new NodeCache({ stdTTL: 86400 });

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variable or config
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://C00kieUs3r:MVGeUvnwrpiuS90e@cookiespots.5b0b1zp.mongodb.net/?retryWrites=true&w=majority&appName=CookieSpots';
    
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

// Fetch cookie spots from Yelp API
const fetchCookieSpotsFromYelp = async (zipCode) => {
  try {
    const cachedData = cookieSpotCache.get(`yelp-${zipCode}`);
    if (cachedData) {
      console.log(`Using cached Yelp data for ${zipCode}`);
      return cachedData;
    }

    const yelpApiKey = process.env.YELP_API_KEY;
    if (!yelpApiKey) {
      console.error('Yelp API key not found');
      return [];
    }
    
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=cookies&location=${zipCode}&categories=bakeries&limit=50`;
    const response = await axios.get(yelpUrl, {
      headers: {
        Authorization: `Bearer ${yelpApiKey}`
      }
    });
    
    if (!response.data.businesses) {
      console.error('No results from Yelp API');
      return [];
    }
    
    // Map Yelp results to our schema
    const spots = await Promise.all(response.data.businesses.map(async (business) => {
      // Get business details for more information
      const detailsUrl = `https://api.yelp.com/v3/businesses/${business.id}`;
      const detailsResponse = await axios.get(detailsUrl, {
        headers: {
          Authorization: `Bearer ${yelpApiKey}`
        }
      });
      const details = detailsResponse.data || {};
      
      // Format hours of operation
      const hours = {};
      if (details.hours && details.hours.length > 0) {
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        details.hours[0].open.forEach(openPeriod => {
          const day = daysOfWeek[openPeriod.day];
          const start = openPeriod.start.replace(/(\d{2})(\d{2})/, '$1:$2');
          const end = openPeriod.end.replace(/(\d{2})(\d{2})/, '$1:$2');
          hours[day] = `${start} - ${end}`;
        });
      }
      
      return {
        name: business.name,
        description: details.categories?.map(cat => cat.title).join(', ') || '',
        address: business.location.address1,
        city: business.location.city,
        state_province: business.location.state,
        country: business.location.country || 'USA',
        postal_code: business.location.zip_code,
        location: {
          type: 'Point',
          coordinates: [business.coordinates.longitude, business.coordinates.latitude]
        },
        phone: business.phone || '',
        website: business.url || '',
        hours_of_operation: hours,
        price_range: business.price || '$$',
        has_dine_in: true,
        has_takeout: business.transactions?.includes('pickup') || false,
        has_delivery: business.transactions?.includes('delivery') || false,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        cookie_types: [],
        dietary_options: [],
        features: ['Yelp Verified'],
        average_rating: business.rating || 0,
        review_count: business.review_count || 0,
        source: 'yelp',
        source_id: business.id
      };
    }));
    
    // Cache the results
    cookieSpotCache.set(`yelp-${zipCode}`, spots);
    return spots;
  } catch (error) {
    console.error('Error fetching from Yelp API:', error);
    return [];
  }
};

// Fetch cookie spots from Facebook Graph API
const fetchCookieSpotsFromFacebook = async (zipCode) => {
  try {
    const cachedData = cookieSpotCache.get(`facebook-${zipCode}`);
    if (cachedData) {
      console.log(`Using cached Facebook data for ${zipCode}`);
      return cachedData;
    }

    const fbAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!fbAccessToken) {
      console.error('Facebook access token not found');
      return [];
    }
    
    // Search for places near this location
    const searchUrl = `https://graph.facebook.com/v17.0/search?type=place&q=cookie bakery&center=${zipCode}&distance=10000&fields=name,location,overall_star_rating,price_range,phone,website,hours,category_list&access_token=${fbAccessToken}`;
    const response = await axios.get(searchUrl);
    
    if (!response.data.data) {
      console.error('No results from Facebook Graph API');
      return [];
    }
    
    // Map Facebook results to our schema
    const spots = response.data.data.map(place => {
      // Format hours of operation
      const hours = {};
      if (place.hours) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          hours[day] = place.hours[day + '_1_open'] && place.hours[day + '_1_close'] 
            ? `${place.hours[day + '_1_open']} - ${place.hours[day + '_1_close']}` 
            : 'Closed';
        });
      }
      
      return {
        name: place.name,
        description: place.category_list?.map(cat => cat.name).join(', ') || '',
        address: place.location?.street || '',
        city: place.location?.city || '',
        state_province: place.location?.state || '',
        country: place.location?.country || 'USA',
        postal_code: place.location?.zip || zipCode,
        location: {
          type: 'Point',
          coordinates: [place.location?.longitude || 0, place.location?.latitude || 0]
        },
        phone: place.phone || '',
        website: place.website || '',
        hours_of_operation: hours,
        price_range: place.price_range?.length ? '$'.repeat(place.price_range.length) : '$$',
        has_dine_in: true,
        has_takeout: true,
        has_delivery: false,
        is_wheelchair_accessible: false,
        accepts_credit_cards: true,
        cookie_types: [],
        dietary_options: [],
        features: ['Facebook Verified'],
        average_rating: place.overall_star_rating || 0,
        source: 'facebook',
        source_id: place.id
      };
    });
    
    // Cache the results
    cookieSpotCache.set(`facebook-${zipCode}`, spots);
    return spots;
  } catch (error) {
    console.error('Error fetching from Facebook Graph API:', error);
    return [];
  }
};

// Fetch and combine cookie spots from all APIs
const fetchCookieSpots = async (zipCodes = ['10001', '10023', '10014', '10013', '10036', '10018']) => {
  try {
    let allSpots = [];
    
    for (const zipCode of zipCodes) {
      console.log(`Fetching cookie spots for ZIP: ${zipCode}`);
      
      // Fetch from all APIs in parallel
      const [googleSpots, yelpSpots, facebookSpots] = await Promise.all([
        fetchCookieSpotsFromGoogle(zipCode),
        fetchCookieSpotsFromYelp(zipCode),
        fetchCookieSpotsFromFacebook(zipCode)
      ]);
      
      console.log(`Found: Google (${googleSpots.length}), Yelp (${yelpSpots.length}), Facebook (${facebookSpots.length})`);
      
      // Combine results, avoiding duplicates by checking name and address
      const spots = [...googleSpots, ...yelpSpots, ...facebookSpots];
      const uniqueSpots = [];
      const seenBusinesses = new Set();
      
      for (const spot of spots) {
        const key = `${spot.name}|${spot.address}|${spot.city}`.toLowerCase();
        if (!seenBusinesses.has(key)) {
          seenBusinesses.add(key);
          uniqueSpots.push(spot);
        }
      }
      
      allSpots = [...allSpots, ...uniqueSpots];
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
  fetchCookieSpotsFromYelp,
  fetchCookieSpotsFromFacebook,
  clearCache,
  seedDatabase
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
