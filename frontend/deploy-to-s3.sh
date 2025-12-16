#!/bin/bash
# SPECTR SYSTEMS Frontend - Deploy to S3 Script
# Run this script after building the frontend

set -e

echo "🚀 Deploying SPECTR SYSTEMS Frontend to S3..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
    echo "Creating from example..."
    cp .env.production.example .env.production
    echo -e "${YELLOW}Please update .env.production with your API URL${NC}"
    exit 1
fi

# Build frontend
echo -e "${GREEN}Building frontend...${NC}"
npm install
npm run build

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist folder not found. Build failed.${NC}"
    exit 1
fi

# Get S3 bucket name from user or use default
BUCKET_NAME=${1:-"spectr-systems-frontend"}

echo -e "${GREEN}Deploying to S3 bucket: ${BUCKET_NAME}${NC}"

# Sync files to S3
aws s3 sync dist/ s3://${BUCKET_NAME} --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html" --exclude "*.html"
aws s3 sync dist/ s3://${BUCKET_NAME} --delete --cache-control "no-cache, no-store, must-revalidate" --include "*.html"

# Set content types
aws s3 cp dist/index.html s3://${BUCKET_NAME}/index.html --content-type "text/html" --cache-control "no-cache"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Invalidate CloudFront cache (if using CloudFront)"
echo "2. Visit your CloudFront URL or S3 website endpoint"
echo ""
echo "To invalidate CloudFront:"
echo "  aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'"

