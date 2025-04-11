# Cookie Spots Website - Deployment Guide

This guide will help you set up and deploy your Cookie Spots website, a platform for finding and reviewing cookie spots similar to HappyCow but focused on cookies.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Project Setup](#project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Initialization](#database-initialization)
6. [Running the Application](#running-the-application)
7. [Deployment Options](#deployment-options)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## MongoDB Atlas Setup

We're using MongoDB Atlas as our database service. Follow these steps to set up your database:

1. **Create a MongoDB Atlas account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account
   - Once logged in, click "Build a Database"
   - Select the free tier option ("Shared" with "Free" label)

2. **Create a new cluster**:
   - Choose a cloud provider (AWS, Google Cloud, or Azure) and a region closest to your users
   - Keep the default cluster tier (M0 Sandbox)
   - Name your cluster (e.g., "CookieSpots")
   - Click "Create Cluster"

3. **Set up database access**:
   - In the left sidebar, click "Database Access" under Security
   - Click "Add New Database User"
   - Create a username and password (IMPORTANT: Save this password securely)
   - Set user privileges to "Read and Write to Any Database"
   - Click "Add User"

4. **Configure network access**:
   - In the left sidebar, click "Network Access" under Security
   - Click "Add IP Address"
   - For development, you can select "Allow Access from Anywhere" (not recommended for production)
   - For production, add specific IP addresses that need access
   - Click "Confirm"

5. **Get your connection string**:
   - Go back to the Clusters page and click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (it will look like: `mongodb+srv://username:<password>@clustername.mongodb.net/`)
   - Replace `<password>` with your database user's password
   - Replace `test` at the end with `cookie-spots` (e.g., `mongodb+srv://username:password@clustername.mongodb.net/cookie-spots`)

## Project Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cookie-spots-website.git
   cd cookie-spots-website
   ```

2. **Install dependencies**:
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Return to root directory and install frontend dependencies
   cd ..
   npm install
   ```

## Environment Configuration

1. **Create environment files**:

   Create a `.env` file in the root directory:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   PORT=5000
   ```

   Create another `.env` file in the `server` directory with the same content:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   PORT=5000
   ```

   Replace `your_mongodb_atlas_connection_string` with the connection string from MongoDB Atlas.
   Replace `your_jwt_secret` with a secure random string for JWT authentication.

## Database Initialization

1. **Seed the database**:
   ```bash
   cd server
   node seed.js
   ```

   This will populate your MongoDB Atlas database with:
   - Cookie types (chocolate chip, sugar cookie, etc.)
   - Dietary options (vegan, gluten-free, etc.)
   - Sample cookie spots in New York
   - An admin user (email: admin@cookiespots.com, password: admin123)

## Running the Application

### Development Mode

1. **Start the backend server**:
   ```bash
   cd server
   npm run dev
   ```

2. **In a new terminal, start the frontend development server**:
   ```bash
   # From the root directory
   npm run dev
   ```

3. **Access the application**:
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

### Production Mode

1. **Build the frontend**:
   ```bash
   # From the root directory
   npm run build
   ```

2. **Start the production server**:
   ```bash
   cd server
   npm start
   ```

3. **Access the application**:
   - http://localhost:5000

## Deployment Options

### Option 1: Traditional Hosting

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Copy the build files and server directory to your hosting provider**

3. **Set up environment variables on your hosting provider**

4. **Start the server**:
   ```bash
   cd server
   npm start
   ```

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Platforms

#### Heroku

1. **Create a Procfile in the root directory**:
   ```
   web: cd server && npm start
   ```

2. **Deploy to Heroku**:
   ```bash
   heroku create
   heroku config:set MONGO_URI=your_mongodb_atlas_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

#### Netlify/Vercel (Frontend) + Heroku (Backend)

1. **Deploy backend to Heroku** (as above)

2. **Update API base URL in frontend**:
   - Edit `src/utils/api.js` to use your Heroku backend URL

3. **Deploy frontend to Netlify/Vercel**:
   - Connect your GitHub repository
   - Set build command to `npm run build`
   - Set publish directory to `build`

## Troubleshooting

### MongoDB Connection Issues

- **Error**: "Failed to connect to MongoDB"
  - **Solution**: Verify your MongoDB Atlas connection string in the `.env` files
  - **Solution**: Check that your IP address is whitelisted in MongoDB Atlas Network Access
  - **Solution**: Ensure your MongoDB Atlas user has the correct permissions

### API Endpoint Failures

- **Error**: "Failed to retrieve cookie spots/types/etc."
  - **Solution**: Check that your database was seeded correctly with `node seed.js`
  - **Solution**: Verify MongoDB connection is working
  - **Solution**: Check server logs for specific errors

### Frontend Build Issues

- **Error**: "Failed to build frontend"
  - **Solution**: Check for any syntax errors in your React components
  - **Solution**: Ensure all dependencies are installed with `npm install`
  - **Solution**: Clear npm cache with `npm cache clean --force` and try again

### Authentication Issues

- **Error**: "Token is not valid" or "Not authorized"
  - **Solution**: Ensure JWT_SECRET is set correctly in environment variables
  - **Solution**: Check that you're using the correct login credentials
  - **Solution**: Verify that the token is being sent in the request headers

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)

## Support

If you encounter any issues not covered in this guide, please contact support at support@cookiespots.com.
