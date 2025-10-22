#!/bin/bash

# Palets E-commerce Deployment Script
# This script can be run manually on the server for deployments

set -e  # Exit on any error

echo "🚀 Starting Palets deployment..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/Palets"
PHP_VERSION="8.2"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    exit 1
fi

# Navigate to project directory
echo -e "${YELLOW}📍 Navigating to project directory...${NC}"
cd $PROJECT_DIR || { echo -e "${RED}❌ Project directory not found!${NC}"; exit 1; }

# Pull latest changes from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git fetch --all
git reset --hard origin/main || git reset --hard origin/master

# Install/update PHP dependencies
echo -e "${YELLOW}📦 Installing PHP dependencies...${NC}"
composer install --optimize-autoloader --no-dev --no-interaction

# Install/update Node.js dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm ci --legacy-peer-deps

# Clean old build artifacts
echo -e "${YELLOW}🧹 Cleaning old build artifacts...${NC}"
rm -rf public/assets/
rm -f public/index.html
rm -rf public/.vite/
rm -rf public/build/

# Build frontend assets with increased memory
echo -e "${YELLOW}🔨 Building frontend assets...${NC}"
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Verify build succeeded
if [ ! -f "public/build/manifest.json" ]; then
    echo -e "${RED}❌ Build failed - manifest.json not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful!${NC}"

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
php artisan migrate --force

# Clear all caches
echo -e "${YELLOW}🧹 Clearing caches...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear 2>/dev/null || true
php artisan optimize:clear 2>/dev/null || true

# Clear response cache if it exists
php artisan responsecache:clear 2>/dev/null || true

# Cache configurations
echo -e "${YELLOW}💾 Caching configurations...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set proper permissions
echo -e "${YELLOW}🔒 Setting proper permissions...${NC}"
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 775 $PROJECT_DIR/storage
chmod -R 775 $PROJECT_DIR/bootstrap/cache

# Restart services
echo -e "${YELLOW}♻️ Restarting services...${NC}"
systemctl restart php${PHP_VERSION}-fpm
systemctl restart nginx

# Clear OPcache if enabled
php artisan opcache:clear 2>/dev/null || echo -e "${YELLOW}ℹ️ OPcache not enabled${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎉 Application is now running!${NC}"
echo -e "${GREEN}================================${NC}"

# Show current git commit
echo ""
echo "Current version:"
git log -1 --pretty=format:"%h - %s (%cr) <%an>"
echo ""
