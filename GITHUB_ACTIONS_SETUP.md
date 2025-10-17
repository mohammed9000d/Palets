# 🚀 GitHub Actions Deployment Setup Guide

This guide will help you set up automatic deployment to your production server when you publish a new release on GitHub.

## 📋 Overview

When you publish a new release on GitHub, the deployment workflow will automatically:
- Connect to your server via SSH
- Pull the latest code from the repository
- Install PHP dependencies (Composer)
- Install Node.js dependencies and build React assets
- Run database migrations
- Clear and cache Laravel configurations
- Set proper permissions
- Restart Nginx and PHP-FPM services

---

## 🔐 Step 1: Set Up GitHub Secrets

GitHub Secrets allow you to store sensitive information securely. You need to add your server credentials as secrets.

### How to Add Secrets:

1. Go to your GitHub repository
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button
5. Add each of the following secrets:

### Required Secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SERVER_IP` | `143.110.167.79` | Your server IP address |
| `SSH_USERNAME` | `root` | SSH username to connect to server |
| `SSH_PASSWORD` | `123qwe!@#QWE` | SSH password for authentication |

### Adding Each Secret:

**Secret 1: SERVER_IP**
- Name: `SERVER_IP`
- Value: `143.110.167.79`
- Click **Add secret**

**Secret 2: SSH_USERNAME**
- Name: `SSH_USERNAME`
- Value: `root`
- Click **Add secret**

**Secret 3: SSH_PASSWORD**
- Name: `SSH_PASSWORD`
- Value: `123qwe!@#QWE`
- Click **Add secret**

---

## 🖥️ Step 2: Prepare Your Server

Before the first deployment, you need to set up the project on your server.

### 2.1 Connect to Your Server

```bash
ssh root@143.110.167.79
# Enter password: 123qwe!@#QWE
```

### 2.2 Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install PHP 8.2 and extensions
apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring \
               php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Git
apt install -y git

# Install Nginx
apt install -y nginx

# Install MySQL
apt install -y mysql-server
```

### 2.3 Set Up MySQL Database

```bash
# Connect to MySQL
mysql -u root -p
```

In MySQL prompt, run:
```sql
CREATE DATABASE palets_production;
CREATE USER 'palets_user'@'localhost' IDENTIFIED BY '123qwe!@#QWE';
GRANT ALL PRIVILEGES ON palets_production.* TO 'palets_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.4 Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/palets-ecommerce.git

# Navigate to project
cd palets-ecommerce

# Set up .env file
cp env.production.example .env
nano .env
```

Update your `.env` file with these values:
```env
APP_NAME="Palets"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://143.110.167.79

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=palets_production
DB_USERNAME=palets_user
DB_PASSWORD=123qwe!@#QWE

# Add your payment credentials
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=live
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 2.5 Initial Setup

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev
npm install --production

# Generate application key
php artisan key:generate

# Build assets
npm run build

# Run migrations and seeders
php artisan migrate --force
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=SettingsSeeder

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
chown -R www-data:www-data /var/www/palets-ecommerce
chmod -R 755 /var/www/palets-ecommerce
chmod -R 775 /var/www/palets-ecommerce/storage
chmod -R 775 /var/www/palets-ecommerce/bootstrap/cache
```

### 2.6 Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/palets
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 143.110.167.79;
    root /var/www/palets-ecommerce/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;

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
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site:
```bash
# Enable site
ln -s /etc/nginx/sites-available/palets /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart services
systemctl restart nginx
systemctl restart php8.2-fpm

# Enable services on boot
systemctl enable nginx
systemctl enable php8.2-fpm
systemctl enable mysql
```

### 2.7 Make Deployment Script Executable

```bash
chmod +x /var/www/palets-ecommerce/deploy.sh
```

---

## 🎯 Step 3: Create and Publish a Release

Now that everything is set up, you can trigger deployments by publishing releases.

### How to Create a Release:

1. Go to your GitHub repository
2. Click on **Releases** (right sidebar)
3. Click **Create a new release** or **Draft a new release**
4. Fill in the release details:
   - **Choose a tag**: Create a new tag (e.g., `v1.0.0`, `v1.0.1`, etc.)
   - **Release title**: Give it a descriptive name (e.g., "Initial Production Release")
   - **Description**: Describe what changed in this version
5. Click **Publish release**

### What Happens Next:

1. GitHub Actions will automatically start the deployment workflow
2. You can monitor the progress:
   - Go to your repository
   - Click on **Actions** tab
   - Click on the running workflow to see detailed logs
3. The deployment typically takes 2-5 minutes
4. Once completed, your changes will be live on the server!

---

## 📊 Monitoring Deployments

### View Workflow Status:

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You'll see all deployment runs with their status (✅ success, ❌ failed, 🟡 in progress)
4. Click on any run to see detailed logs

### Check Deployment on Server:

```bash
# SSH into your server
ssh root@143.110.167.79

# Check current version
cd /var/www/palets-ecommerce
git log -1 --pretty=format:"%h - %s (%cr) <%an>"

# View application logs
tail -f storage/logs/laravel.log

# View Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 🔄 Manual Deployment (Optional)

If you need to deploy manually without creating a release:

```bash
# SSH into server
ssh root@143.110.167.79

# Run deployment script
cd /var/www/palets-ecommerce
./deploy.sh
```

---

## 🛠️ Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions logs**:
   - Go to **Actions** tab
   - Click on the failed workflow
   - Review the error messages

2. **Common Issues**:

   **SSH Connection Failed**:
   - Verify server IP is correct
   - Check SSH username and password in GitHub Secrets
   - Ensure server is running and accessible

   **Git Pull Failed**:
   - Make sure the repository is cloned on the server
   - Check if `/var/www/palets-ecommerce` exists
   - Verify git remote is set up correctly

   **Permission Denied**:
   - Run: `chown -R www-data:www-data /var/www/palets-ecommerce`
   - Run: `chmod -R 775 /var/www/palets-ecommerce/storage`

   **Database Migration Failed**:
   - Check database credentials in `.env`
   - Verify MySQL is running: `systemctl status mysql`
   - Test connection: `mysql -u palets_user -p palets_production`

   **NPM Build Failed**:
   - Check if Node.js is installed: `node -v`
   - Clear npm cache: `npm cache clean --force`
   - Remove node_modules: `rm -rf node_modules && npm install`

3. **View Server Logs**:
   ```bash
   # Laravel logs
   tail -f /var/www/palets-ecommerce/storage/logs/laravel.log
   
   # Nginx error logs
   tail -f /var/log/nginx/error.log
   
   # PHP-FPM logs
   tail -f /var/log/php8.2-fpm.log
   ```

---

## 🔐 Security Recommendations

### 1. Use SSH Keys Instead of Password

For better security, consider using SSH keys instead of passwords:

```bash
# On your local machine, generate SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copy public key to server
ssh-copy-id root@143.110.167.79

# Update GitHub Secret SSH_PASSWORD with the private key content
# And update the workflow to use key-based authentication
```

### 2. Create a Dedicated Deployment User

Instead of using `root`, create a dedicated user:

```bash
# On server
adduser deployer
usermod -aG www-data deployer
# Give deployer sudo access for specific commands only
```

### 3. Use Environment-Specific Branches

Consider using different branches for different environments:
- `main` → Production
- `staging` → Staging server
- `develop` → Development

---

## 🎉 You're All Set!

Your automatic deployment is now configured! Every time you publish a new release:
1. ✅ Code is automatically deployed to your server
2. ✅ Dependencies are updated
3. ✅ Assets are rebuilt
4. ✅ Database migrations run
5. ✅ Services are restarted

**Next steps:**
- Make changes to your code locally
- Commit and push to GitHub
- Create a new release
- Watch the magic happen! 🚀

---

## 📞 Need Help?

If you encounter any issues:
1. Check the **Actions** tab in GitHub for deployment logs
2. SSH into your server and check logs
3. Review this documentation
4. Test deployment manually using `./deploy.sh`

**Happy Deploying! 🎊**
