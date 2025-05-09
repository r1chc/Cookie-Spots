#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p dist/uploads
mkdir -p dist/logs

# Copy server files
echo "📋 Copying server files..."
cp -r server/* dist/
cp server/.env* dist/

# Install production dependencies
echo "📦 Installing production dependencies..."
cd dist
npm install --production

echo "✅ Build completed successfully!"
echo "📦 The production build is ready in the 'dist' directory"
echo "🚀 To start the production server, run:"
echo "   cd dist && npm start" 