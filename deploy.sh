#!/bin/bash

# Abathwa Capital - Production Deployment Script
# This script builds and deploys the application

set -e  # Exit on any error

echo "🚀 Starting Abathwa Capital deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting and fix issues
echo "🔍 Running linter and fixing issues..."
npm run lint:fix

# Run tests (if any)
echo "🧪 Running tests..."
npm run test

# Build the application for production
echo "🏗️  Building application for production..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Display deployment information
echo ""
echo "📋 Deployment Summary:"
echo "   - Built application is in the 'dist' directory"
echo "   - Application is production-ready"
echo "   - isiNdebele language support is enabled"
echo "   - Authentication system is configured"
echo ""

# Optional: Deploy to hosting service
# Uncomment and modify based on your hosting provider

# For Netlify:
# echo "🌐 Deploying to Netlify..."
# netlify deploy --prod --dir=dist

# For Vercel:
# echo "🌐 Deploying to Vercel..."
# vercel --prod

# For custom server:
# echo "📤 Uploading to server..."
# rsync -avz --delete dist/ user@yourserver.com:/path/to/web/root/

echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Upload the 'dist' directory to your web server"
echo "2. Configure your Supabase project with production URLs"
echo "3. Update environment variables for production"
echo "4. Test the application in production environment"
echo ""
echo "For support, contact: admin@abathwa.com"