# Cookie Spots Website - README

## Overview

Cookie Spots is a platform for finding and reviewing cookie spots in your area. Similar to HappyCow but focused exclusively on cookies, this website allows users to:

- Search for cookie spots by location
- View detailed information about each cookie spot
- Filter by cookie types and dietary options
- Read and write reviews
- Upload photos
- Save favorite cookie spots
- Create trip plans with multiple cookie spots

## Features

- **Location-based Search**: Find cookie spots near you or in any city
- **Detailed Listings**: View hours, contact info, cookie types, and dietary options
- **Reviews & Ratings**: Read community reviews and leave your own
- **Photo Sharing**: Browse photos and upload your own
- **User Accounts**: Register and manage your profile
- **Favorites**: Save cookie spots to your favorites list
- **Trip Planning**: Create custom trips with multiple cookie spots
- **Responsive Design**: Works on desktop and mobile devices
- **Map Integration**: View cookie spots on an interactive map

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Maps**: Leaflet

## Getting Started

For detailed setup and deployment instructions, please refer to the [DEPLOYMENT.md](DEPLOYMENT.md) file.

### Quick Start

1. Clone the repository
2. Set up MongoDB Atlas (see DEPLOYMENT.md)
3. Create `.env` files with your MongoDB connection string
4. Install dependencies:
   ```
   npm install
   cd server && npm install
   ```
5. Seed the database:
   ```
   cd server && node seed.js
   ```
6. Start the development servers:
   ```
   # Terminal 1 (backend)
   cd server && npm run dev
   
   # Terminal 2 (frontend)
   npm run dev
   ```

## Project Structure

```
cookie-spots-website/
├── public/                  # Static files
├── src/                     # Frontend source code
│   ├── components/          # Reusable React components
│   ├── pages/               # Page components
│   ├── styles/              # CSS styles
│   ├── utils/               # Utility functions and API
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Entry point
├── server/                  # Backend source code
│   ├── config/              # Configuration files
│   ├── controllers/         # API controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── seed.js              # Database seeding script
│   └── server.js            # Express server
├── .env                     # Environment variables
├── package.json             # Project dependencies
└── DEPLOYMENT.md            # Deployment instructions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Cookie Spots
- `GET /api/cookie-spots` - Get all cookie spots
- `GET /api/cookie-spots/nearby` - Get nearby cookie spots
- `GET /api/cookie-spots/:id` - Get cookie spot by ID
- `POST /api/cookie-spots` - Create a cookie spot
- `PUT /api/cookie-spots/:id` - Update a cookie spot
- `DELETE /api/cookie-spots/:id` - Delete a cookie spot

### Reviews
- `GET /api/reviews/cookie-spot/:cookieSpotId` - Get reviews for a cookie spot
- `GET /api/reviews/user/:userId` - Get reviews by a user
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### Photos
- `GET /api/photos/cookie-spot/:cookieSpotId` - Get photos for a cookie spot
- `GET /api/photos/user/:userId` - Get photos by a user
- `POST /api/photos` - Upload a photo
- `PUT /api/photos/:id` - Update a photo
- `DELETE /api/photos/:id` - Delete a photo

### Favorites
- `GET /api/favorites` - Get user's favorites
- `GET /api/favorites/check/:cookieSpotId` - Check if a cookie spot is favorited
- `POST /api/favorites` - Add a cookie spot to favorites
- `DELETE /api/favorites/:cookieSpotId` - Remove a cookie spot from favorites

### Cookie Types
- `GET /api/cookie-types` - Get all cookie types
- `GET /api/cookie-types/:id` - Get cookie type by ID
- `POST /api/cookie-types` - Create a cookie type (admin only)
- `PUT /api/cookie-types/:id` - Update a cookie type (admin only)
- `DELETE /api/cookie-types/:id` - Delete a cookie type (admin only)

### Dietary Options
- `GET /api/dietary-options` - Get all dietary options
- `GET /api/dietary-options/:id` - Get dietary option by ID
- `POST /api/dietary-options` - Create a dietary option (admin only)
- `PUT /api/dietary-options/:id` - Update a dietary option (admin only)
- `DELETE /api/dietary-options/:id` - Delete a dietary option (admin only)

### Trips
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create a trip
- `PUT /api/trips/:id` - Update a trip
- `DELETE /api/trips/:id` - Delete a trip
- `POST /api/trips/:id/cookie-spots` - Add a cookie spot to a trip
- `DELETE /api/trips/:id/cookie-spots/:cookieSpotId` - Remove a cookie spot from a trip
- `PUT /api/trips/:id/reorder` - Reorder cookie spots in a trip

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Original inspiration from [HappyCow](https://www.happycow.net/)
- Icons from [Heroicons](https://heroicons.com/)
- Map functionality from [Leaflet](https://leafletjs.com/)

#