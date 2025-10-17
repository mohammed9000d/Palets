# ⚡ Quick Deployment Guide

## 🎯 First Time Setup (Do Once)

### 1. Add GitHub Secrets
Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 3 secrets:
- `SERVER_IP` = `143.110.167.79`
- `SSH_USERNAME` = `root`
- `SSH_PASSWORD` = `123qwe!@#QWE`

### 2. Set Up Server (One Time)

```bash
# Connect to server
ssh root@143.110.167.79

# Install everything (copy-paste this entire block)
apt update && apt upgrade -y && \
apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath && \
curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer && \
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && \
apt install -y git nginx mysql-server

# Set up database
mysql -u root -p
```

In MySQL, run:
```sql
CREATE DATABASE palets_production;
CREATE USER 'palets_user'@'localhost' IDENTIFIED BY '123qwe!@#QWE';
GRANT ALL PRIVILEGES ON palets_production.* TO 'palets_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Clone project (replace YOUR_USERNAME with your GitHub username)
cd /var/www
git clone https://github.com/YOUR_USERNAME/your-repo-name.git palets-ecommerce
cd palets-ecommerce

# Set up environment
cp env.production.example .env
nano .env  # Update with your settings
```

Update `.env`:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://143.110.167.79

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=palets_production
DB_USERNAME=palets_user
DB_PASSWORD=123qwe!@#QWE
```

```bash
# Initial setup
composer install --optimize-autoloader --no-dev
npm install --production
php artisan key:generate
npm run build
php artisan migrate --force
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=SettingsSeeder
php artisan config:cache

# Set permissions
chown -R www-data:www-data /var/www/palets-ecommerce
chmod -R 755 /var/www/palets-ecommerce
chmod -R 775 /var/www/palets-ecommerce/storage
chmod -R 775 /var/www/palets-ecommerce/bootstrap/cache
chmod +x /var/www/palets-ecommerce/deploy.sh

# Configure Nginx
nano /etc/nginx/sites-available/palets
```

Add this to Nginx config:
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
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/palets /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl restart php8.2-fpm
systemctl enable nginx
systemctl enable php8.2-fpm
systemctl enable mysql
```

**✅ Server setup complete!**

---

## 🚀 Deploy New Changes (Every Time)

### Option 1: Automatic (Recommended)

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Create a release on GitHub:
   - Go to your repo → **Releases** → **Create a new release**
   - Tag: `v1.0.0` (increment for each release)
   - Title: "Version 1.0.0"
   - Click **Publish release**

3. **Done!** GitHub Actions will automatically deploy in 2-5 minutes
   - Check progress: **Actions** tab in GitHub

### Option 2: Manual

```bash
# SSH to server
ssh root@143.110.167.79

# Run deployment
cd /var/www/palets-ecommerce
./deploy.sh
```

---

## 🔍 Quick Checks

### View deployment status:
- GitHub → **Actions** tab

### Check what's running on server:
```bash
ssh root@143.110.167.79
cd /var/www/palets-ecommerce
git log -1  # See current version
```

### View logs:
```bash
tail -f storage/logs/laravel.log     # Laravel logs
tail -f /var/log/nginx/error.log     # Nginx logs
```

### Test website:
Open browser: `http://143.110.167.79`

---

## 🆘 Quick Fixes

### Deployment failed?
```bash
ssh root@143.110.167.79
cd /var/www/palets-ecommerce

# Fix permissions
chown -R www-data:www-data .
chmod -R 775 storage bootstrap/cache

# Clear everything
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Restart services
systemctl restart nginx
systemctl restart php8.2-fpm
```

### Website not loading?
```bash
# Check services
systemctl status nginx
systemctl status php8.2-fpm
systemctl status mysql

# Restart all
systemctl restart nginx php8.2-fpm mysql
```

---

## 📝 Typical Workflow

1. **Develop** locally
2. **Test** your changes
3. **Commit & Push** to GitHub
4. **Create Release** on GitHub
5. **GitHub Actions deploys automatically** ✨
6. **Check** your live site!

---

## 🎉 That's It!

You now have automatic deployment set up. Every release you publish will automatically deploy to your server!

**Your website:** http://143.110.167.79

For detailed documentation, see: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
