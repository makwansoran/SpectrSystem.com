#!/bin/bash
# Quick script to deploy CORS fix to backend
# Run this on your EC2 server in the backend directory

set -e

echo "🚀 Deploying CORS Fix..."
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Build TypeScript
echo "📦 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Restart PM2
echo "🔄 Restarting backend with PM2..."
pm2 restart spectr-backend

if [ $? -ne 0 ]; then
    echo "❌ PM2 restart failed! Trying to start..."
    pm2 start ecosystem.config.js
fi

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Current status:"
pm2 status spectr-backend

echo ""
echo "📋 Recent logs (last 20 lines):"
pm2 logs spectr-backend --lines 20 --nostream

echo ""
echo "✅ Backend CORS fix deployed!"
echo "🔍 Check logs above for any CORS warnings"
echo ""
echo "Next: Update nginx config and configure CloudFront (see FIX_CORS_NOW.md)"

