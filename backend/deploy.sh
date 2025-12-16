#!/bin/bash
# SPECTR SYSTEMS Backend Deployment Script for EC2
# Run this script on your EC2 instance after initial setup

set -e

echo "🚀 Starting SPECTR SYSTEMS Backend Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

# Navigate to project directory
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend directory not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

cd backend

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 not found. Installing...${NC}"
    sudo npm install -g pm2
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install --production

# Build TypeScript
echo -e "${GREEN}Building TypeScript...${NC}"
npm run build

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Please create .env file with production environment variables"
    echo "See DEPLOYMENT_GUIDE.md for required variables"
fi

# Create logs directory
mkdir -p logs

# Stop existing PM2 process if running
pm2 stop spectr-backend 2>/dev/null || true
pm2 delete spectr-backend 2>/dev/null || true

# Start with PM2
echo -e "${GREEN}Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
echo -e "${GREEN}Setting up PM2 startup script...${NC}"
pm2 startup systemd -u $USER --hp $HOME
echo -e "${YELLOW}Please run the command shown above as sudo${NC}"

# Show status
pm2 status

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Backend is running on port 3001${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs spectr-backend    - View logs"
echo "  pm2 restart spectr-backend - Restart application"
echo "  pm2 stop spectr-backend    - Stop application"
echo "  pm2 status                 - View status"

