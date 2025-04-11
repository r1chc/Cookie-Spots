# Cookie Spots Website - Installation Guide

This guide provides step-by-step instructions for installing and running the Cookie Spots website locally for development purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cookie-spots-website.git
   cd cookie-spots-website
   ```

2. **Set up environment variables**:
   
   Create a `.env` file in the root directory with the following content:
   ```
   MONGO_URI=mongodb+srv://cookiespots:cookiespots123@cookiespots.mongodb.net/cookie-spots?retryWrites=true&w=majority
   JWT_SECRET=cookiespotsecret
   NODE_ENV=development
   PORT=5000
   ```

   Create another `.env` file in the `server` directory with the same content.

3. **Install dependencies**:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

4. **Seed the database**:
   ```bash
   cd server
   node seed.js
   cd ..
   ```

5. **Start the development servers**:

   In one terminal, start the backend server:
   ```bash
   cd server
   npm run dev
   ```

   In another terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Admin Account

After seeding the database, you can log in with the following admin credentials:
- Email: admin@cookiespots.com
- Password: admin123

## Development Workflow

1. **Backend Development**:
   - Edit files in the `server` directory
   - The server will automatically restart when you save changes (using nodemon)

2. **Frontend Development**:
   - Edit files in the `src` directory
   - The development server will automatically reload when you save changes

3. **Adding New Features**:
   - For new API endpoints, add routes in `server/routes` and controllers in `server/controllers`
   - For new frontend components, add them to `src/components` or `src/pages`

4. **Testing**:
   - Run the test script to check for issues:
     ```bash
     ./test.sh
     ```

## Common Development Tasks

### Adding a New Cookie Type

1. Add the new cookie type to the seed data in `server/seed.js`
2. Re-run the seed script (you may need to drop the collection first)

### Adding a New API Endpoint

1. Create a controller function in the appropriate controller file
2. Add the route in the corresponding routes file
3. Update the API utility in `src/utils/api.js`

### Creating a New Page

1. Create a new component in `src/pages`
2. Add the route to `src/App.jsx`

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB Atlas is properly configured
- Check that your IP address is whitelisted in MongoDB Atlas
- Verify the connection string in your `.env` files

### Frontend Build Issues

- Clear the node_modules folder and reinstall dependencies:
  ```bash
  rm -rf node_modules
  npm install
  ```

### API Endpoint Errors

- Check the server logs for specific error messages
- Verify that the database was seeded correctly
- Ensure you're sending the correct data format in requests

## Next Steps

After successfully installing and running the application locally, refer to the [DEPLOYMENT.md](DEPLOYMENT.md) guide for instructions on deploying the application to a production environment.
