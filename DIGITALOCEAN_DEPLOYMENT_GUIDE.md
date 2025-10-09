# 🚀 Complete DigitalOcean Deployment Guide
## From Zero to Production - Step by Step

> **Perfect for First-Time Deployment!** 
> This guide will take you from having nothing to a fully working production website.

---

## 💰 **Cost Breakdown (Monthly)**
- **DigitalOcean Droplet**: $6/month (Basic)
- **Domain Name**: ~$12/year ($1/month)
- **Total**: ~$7/month

**Much cheaper than Laravel Forge ($12/month) + DigitalOcean ($6/month) = $18/month!**

---

## 📋 **What You'll Need**
- [ ] Credit card for payments
- [ ] Email address
- [ ] Your Palets project (already ready!)
- [ ] 2-3 hours of time

---

# 🎯 **STEP 1: Create GitHub Repository**

## 1.1 Create GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click **"Sign up"**
3. Choose a username (e.g., `yourname-dev`)
4. Use your email and create a password
5. Verify your email

## 1.2 Create Repository for Your Project
1. Click **"New repository"** (green button)
2. **Repository name**: `palets-ecommerce`
3. **Description**: `Palets Art E-commerce Platform`
4. Set to **Public** (free) or **Private** (if you have paid plan)
5. ✅ Check **"Add a README file"**
6. Click **"Create repository"**

## 1.3 Upload Your Project to GitHub

### Option A: Using GitHub Desktop (Easier)
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in with your GitHub account
3. Click **"Clone a repository from the Internet"**
4. Select your `palets-ecommerce` repository
5. Choose where to save it on your computer
6. Copy all your Palets project files into this folder
7. In GitHub Desktop, you'll see all files listed
8. Write commit message: `Initial project upload`
9. Click **"Commit to main"**
10. Click **"Push origin"**

### Option B: Using Command Line
```bash
# Navigate to your Palets project folder
cd "C:\Users\moham\Desktop\personal projects\Palets"

# Initialize git (if not already done)
git init

# Add GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/palets-ecommerce.git

# Add all files
git add .

# Commit files
git commit -m "Initial project upload"

# Push to GitHub
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANT**: Make sure your `.env` file is in `.gitignore` so it doesn't get uploaded!

---

# 🌊 **STEP 2: Create DigitalOcean Account & Droplet**

## 2.1 Create DigitalOcean Account
1. Go to [digitalocean.com](https://www.digitalocean.com/)
2. Click **"Sign up"**
3. Use your email and create password
4. **Verify your email**
5. **Add payment method** (credit card)
6. You might get **$200 free credit** for 60 days!

## 2.2 Create Your First Droplet (Server)
1. Click **"Create"** → **"Droplets"**
2. **Choose Region**: Select closest to your target audience
   - **New York** (for US/Americas)
   - **London** (for Europe/Middle East/Africa)
   - **Singapore** (for Asia)
3. **Choose Image**: 
   - Click **"Marketplace"**
   - Search for **"LAMP"** 
   - Select **"LAMP on Ubuntu 22.04"**
4. **Choose Size**:
   - **Basic plan**
   - **$6/month** (1GB RAM, 1 vCPU, 25GB SSD)
5. **Authentication**:
   - Select **"SSH Key"** (more secure)
   - Click **"New SSH Key"**
   - Follow instructions to generate SSH key
   - Or select **"Password"** (easier for beginners)
6. **Hostname**: `palets-production`
7. Click **"Create Droplet"**

**⏱️ Wait 2-3 minutes for droplet to be created**

## 2.3 Get Your Server IP Address
1. In DigitalOcean dashboard, click on your droplet
2. Copy the **IP address** (e.g., `164.90.123.456`)
3. **Save this IP** - you'll need it!

---

# 🔧 **STEP 3: Connect to Your Server**

## 3.1 Connect via SSH

### Windows (using PowerShell or Command Prompt):
```bash
ssh root@YOUR_SERVER_IP
# Example: ssh root@164.90.123.456
```

### If you used password authentication:
- Enter the password you set when creating the droplet

### If you used SSH key:
- It should connect automatically

**🎉 You're now connected to your server!**

---

# ⚙️ **STEP 4: Server Setup & Configuration**

## 4.1 Update Server
```bash
# Update package list
apt update

# Upgrade packages
apt upgrade -y
```

## 4.2 Install Required Software
```bash
# Install PHP 8.2 and extensions
apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath

# Install Composer (PHP package manager)
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Git
apt install -y git

# Install Redis (for caching)
apt install -y redis-server

# Install Nginx (web server)
apt install -y nginx

# Install MySQL (already installed with LAMP, but let's make sure)
apt install -y mysql-server
```

## 4.3 Configure MySQL Database
```bash
# Secure MySQL installation
mysql_secure_installation

# Follow prompts:
# - Set root password: YES (choose a strong password)
# - Remove anonymous users: YES
# - Disallow root login remotely: YES
# - Remove test database: YES
# - Reload privilege tables: YES

# Create database for your project
mysql -u root -p
```

In MySQL prompt:
```sql
CREATE DATABASE palets_production;
CREATE USER 'palets_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON palets_production.* TO 'palets_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

# 📁 **STEP 5: Deploy Your Project**

## 5.1 Clone Your Project from GitHub
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/YOUR_USERNAME/palets-ecommerce.git
cd palets-ecommerce

# Set proper permissions
chown -R www-data:www-data /var/www/palets-ecommerce
chmod -R 755 /var/www/palets-ecommerce
chmod -R 775 /var/www/palets-ecommerce/storage
chmod -R 775 /var/www/palets-ecommerce/bootstrap/cache
```

## 5.2 Install PHP Dependencies
```bash
# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate
```

## 5.3 Install Node.js Dependencies & Build Assets
```bash
# Install npm dependencies
npm install

# Build production assets
npm run build
```

## 5.4 Create Production Environment File
```bash
# Copy environment template
cp env.production.example .env

# Edit environment file
nano .env
```

**Update the `.env` file with your settings:**
```bash
APP_NAME="Palets"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=http://YOUR_SERVER_IP

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=palets_production
DB_USERNAME=palets_user
DB_PASSWORD=your_secure_password_here

# Add your LIVE payment credentials here
STRIPE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET=sk_live_YOUR_LIVE_SECRET
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY

PAYPAL_CLIENT_ID=YOUR_LIVE_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_LIVE_PAYPAL_CLIENT_SECRET
PAYPAL_MODE=live
VITE_PAYPAL_CLIENT_ID=YOUR_LIVE_PAYPAL_CLIENT_ID
```

**Save and exit**: `Ctrl + X`, then `Y`, then `Enter`

## 5.5 Set Up Database
```bash
# Run migrations
php artisan migrate --force

# Seed essential data
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=SettingsSeeder

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

# 🌐 **STEP 6: Configure Nginx Web Server**

## 6.1 Create Nginx Configuration
```bash
# Create site configuration
nano /etc/nginx/sites-available/palets
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;
    root /var/www/palets-ecommerce/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**Save and exit**: `Ctrl + X`, then `Y`, then `Enter`

## 6.2 Enable Site and Restart Services
```bash
# Enable the site
ln -s /etc/nginx/sites-available/palets /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart services
systemctl restart nginx
systemctl restart php8.2-fpm
systemctl restart mysql
systemctl restart redis-server

# Enable services to start on boot
systemctl enable nginx
systemctl enable php8.2-fpm
systemctl enable mysql
systemctl enable redis-server
```

---

# 🎉 **STEP 7: Test Your Website**

## 7.1 Access Your Website
1. Open your browser
2. Go to: `http://YOUR_SERVER_IP`
3. You should see your Palets website!

## 7.2 Test Admin Panel
1. Go to: `http://YOUR_SERVER_IP/admin`
2. Login with default admin credentials (check your AdminSeeder)

## 7.3 Test Payment System
1. Add a product to cart
2. Go to checkout
3. Test with small amounts ($1) using real payment methods

---

# 🌍 **STEP 8: Get a Domain Name (Optional but Recommended)**

## 8.1 Buy a Domain
**Recommended Registrars:**
- **Namecheap**: [namecheap.com](https://www.namecheap.com) (~$12/year)
- **GoDaddy**: [godaddy.com](https://www.godaddy.com) (~$15/year)
- **Google Domains**: [domains.google](https://domains.google) (~$12/year)

**Choose a domain like:**
- `palets.com`
- `paletsart.com`
- `yourname-palets.com`

## 8.2 Point Domain to Your Server
1. In your domain registrar's control panel
2. Find **"DNS Management"** or **"Nameservers"**
3. Add **A Record**:
   - **Name**: `@` (or leave blank)
   - **Value**: `YOUR_SERVER_IP`
   - **TTL**: `3600`
4. Add **CNAME Record** for www:
   - **Name**: `www`
   - **Value**: `yourdomain.com`
   - **TTL**: `3600`

**⏱️ Wait 1-24 hours for DNS to propagate**

## 8.3 Update Nginx for Domain
```bash
# Edit Nginx configuration
nano /etc/nginx/sites-available/palets
```

**Change the server_name line:**
```nginx
server_name yourdomain.com www.yourdomain.com;
```

**Restart Nginx:**
```bash
systemctl restart nginx
```

---

# 🔒 **STEP 9: Install SSL Certificate (HTTPS)**

## 9.1 Install Certbot
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

## 9.2 Get SSL Certificate
```bash
# Get certificate for your domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS: YES
```

## 9.3 Test Auto-Renewal
```bash
# Test certificate renewal
certbot renew --dry-run
```

**🎉 Your website now has HTTPS!**

---

# 🔄 **STEP 10: Set Up Automatic Deployment**

## 10.1 Create Deployment Script
```bash
# Create deployment script
nano /var/www/deploy.sh
```

**Add this script:**
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/palets-ecommerce

# Pull latest changes from GitHub
git pull origin main

# Install/update dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Run Laravel optimizations
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
chown -R www-data:www-data /var/www/palets-ecommerce
chmod -R 755 /var/www/palets-ecommerce
chmod -R 775 /var/www/palets-ecommerce/storage
chmod -R 775 /var/www/palets-ecommerce/bootstrap/cache

# Restart services
systemctl restart nginx
systemctl restart php8.2-fpm

echo "✅ Deployment completed!"
```

**Make it executable:**
```bash
chmod +x /var/www/deploy.sh
```

## 10.2 Deploy Updates
**Whenever you make changes to your project:**
```bash
# On your local computer, push changes to GitHub
git add .
git commit -m "Your update message"
git push origin main

# On your server, run deployment script
/var/www/deploy.sh
```

---

# 🎯 **STEP 11: Final Production Setup**

## 11.1 Update Environment for Domain
```bash
# Edit .env file
nano /var/www/palets-ecommerce/.env
```

**Update these lines:**
```bash
APP_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

## 11.2 Clear Caches
```bash
cd /var/www/palets-ecommerce
php artisan config:cache
php artisan route:cache
systemctl restart nginx
```

---

# 🎉 **CONGRATULATIONS! YOU'RE LIVE!**

## ✅ **What You've Accomplished:**
- 🌐 **Live Website**: `https://yourdomain.com`
- 💳 **Working Payments**: Stripe & PayPal
- 🛒 **E-commerce Platform**: Complete shopping system
- 🔒 **Secure HTTPS**: SSL certificate installed
- 🚀 **Professional Hosting**: DigitalOcean server
- 📱 **Responsive Design**: Works on all devices

## 💰 **Monthly Costs:**
- **DigitalOcean**: $6/month
- **Domain**: ~$1/month
- **Total**: ~$7/month

## 🔧 **Managing Your Website:**

### **To Update Your Website:**
1. Make changes on your local computer
2. Push to GitHub: `git push origin main`
3. Run on server: `/var/www/deploy.sh`

### **To Monitor Your Website:**
- **DigitalOcean Dashboard**: Monitor server resources
- **Error Logs**: `tail -f /var/www/palets-ecommerce/storage/logs/laravel.log`
- **Nginx Logs**: `tail -f /var/log/nginx/error.log`

### **To Backup Your Website:**
```bash
# Backup database
mysqldump -u palets_user -p palets_production > backup.sql

# Backup files
tar -czf website-backup.tar.gz /var/www/palets-ecommerce
```

---

# 🆘 **Troubleshooting Common Issues**

## **Website Not Loading:**
```bash
# Check Nginx status
systemctl status nginx

# Check PHP-FPM status
systemctl status php8.2-fpm

# Check error logs
tail -f /var/log/nginx/error.log
```

## **Database Connection Error:**
```bash
# Check MySQL status
systemctl status mysql

# Test database connection
mysql -u palets_user -p palets_production
```

## **Permission Issues:**
```bash
# Fix permissions
chown -R www-data:www-data /var/www/palets-ecommerce
chmod -R 755 /var/www/palets-ecommerce
chmod -R 775 /var/www/palets-ecommerce/storage
chmod -R 775 /var/www/palets-ecommerce/bootstrap/cache
```

---

# 📞 **Support Resources**

- **DigitalOcean Docs**: https://docs.digitalocean.com/
- **Laravel Docs**: https://laravel.com/docs
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

**🎊 You've successfully deployed your first production website! Welcome to the world of web hosting! 🎊**

