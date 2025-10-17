# ✅ Quick Deployment Checklist

## 🎯 **Your Mission: Deploy Palets to Production**

**Total Time**: 2-3 hours  
**Total Cost**: ~$7/month  
**Difficulty**: Beginner-friendly with step-by-step guide

---

## 📋 **Phase 1: Preparation (30 minutes)**

### ✅ **GitHub Setup**
- [ ] Create GitHub account at [github.com](https://github.com)
- [ ] Create new repository: `Palets`
- [ ] Upload your Palets project to GitHub
- [ ] Verify `.env` is in `.gitignore` (don't upload secrets!)

### ✅ **Payment Credentials**
- [ ] Get **Stripe LIVE** credentials:
  - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
  - Switch to "Live mode"
  - Copy `pk_live_...` and `sk_live_...`
- [ ] Get **PayPal LIVE** credentials:
  - Go to [PayPal Developer](https://developer.paypal.com/)
  - Create Live application
  - Copy Client ID and Secret

---

## 📋 **Phase 2: Server Setup (45 minutes)**

### ✅ **DigitalOcean Account**
- [ ] Create account at [digitalocean.com](https://www.digitalocean.com/)
- [ ] Add payment method (credit card)
- [ ] Get $200 free credit (if available)

### ✅ **Create Droplet**
- [ ] Click "Create" → "Droplets"
- [ ] Choose **LAMP on Ubuntu 22.04** from Marketplace
- [ ] Select **$6/month** plan (1GB RAM)
- [ ] Choose region closest to your audience
- [ ] Set hostname: `palets-production`
- [ ] Create droplet and **save the IP address**

### ✅ **Connect to Server**
- [ ] Open terminal/PowerShell
- [ ] Connect: `ssh root@YOUR_SERVER_IP`
- [ ] Enter password when prompted

---

## 📋 **Phase 3: Server Configuration (60 minutes)**

### ✅ **Install Software**
```bash
# Update system
apt update && apt upgrade -y

# Install PHP, Composer, Node.js, Git, Redis, Nginx
apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath

curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git redis-server nginx
```

### ✅ **Setup Database**
```bash
# Secure MySQL
mysql_secure_installation

# Create database
mysql -u root -p
```
```sql
CREATE DATABASE palets_production;
CREATE USER 'palets_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON palets_production.* TO 'palets_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📋 **Phase 4: Deploy Project (45 minutes)**

### ✅ **Clone & Setup**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/Palets.git Palets
cd Palets

# Set permissions
chown -R www-data:www-data /var/www/Palets
chmod -R 755 /var/www/Palets
chmod -R 775 /var/www/Palets/storage
chmod -R 775 /var/www/Palets/bootstrap/cache

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install && npm run build
```

### ✅ **Configure Environment**
```bash
cp env.production.example .env
nano .env
```
**Update with your settings:**
- Database credentials
- Your server IP in `APP_URL`
- Your LIVE Stripe keys
- Your LIVE PayPal credentials
- Set `PAYPAL_MODE=live`

### ✅ **Setup Laravel**
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=SettingsSeeder
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## 📋 **Phase 5: Web Server (30 minutes)**

### ✅ **Configure Nginx**
```bash
nano /etc/nginx/sites-available/palets
```
**Copy the Nginx configuration from the guide**

```bash
ln -s /etc/nginx/sites-available/palets /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx php8.2-fpm mysql redis-server
```

### ✅ **Test Website**
- [ ] Open browser
- [ ] Go to `http://YOUR_SERVER_IP`
- [ ] Verify website loads
- [ ] Test admin panel: `http://YOUR_SERVER_IP/admin`

---

## 📋 **Phase 6: Domain & SSL (Optional - 30 minutes)**

### ✅ **Buy Domain** (Optional but recommended)
- [ ] Buy domain from Namecheap/GoDaddy (~$12/year)
- [ ] Point domain to your server IP
- [ ] Update Nginx configuration with domain name
- [ ] Install SSL certificate with Certbot

---

## 📋 **Phase 7: Final Testing (15 minutes)**

### ✅ **Test Everything**
- [ ] Website loads correctly
- [ ] User registration works
- [ ] Login/logout works
- [ ] Add products to cart
- [ ] **Test payments with small amounts ($1)**:
  - [ ] Stripe payment works
  - [ ] PayPal payment works
  - [ ] Orders appear in "My Orders"
- [ ] Admin panel accessible
- [ ] Mobile responsive design

---

## 🎉 **SUCCESS CRITERIA**

### ✅ **You're Live When:**
- [ ] Website accessible via `http://YOUR_IP` or `https://yourdomain.com`
- [ ] Payments process real money successfully
- [ ] Orders are created and visible
- [ ] Admin panel works
- [ ] SSL certificate installed (if using domain)

---

## 💰 **Final Costs**
- **DigitalOcean**: $6/month
- **Domain** (optional): ~$12/year ($1/month)
- **Total**: $6-7/month

**vs Laravel Forge**: $18/month (3x more expensive!)

---

## 🆘 **If You Get Stuck**

### **Common Issues:**
1. **Can't connect to server**: Check IP address, try password authentication
2. **Website shows error**: Check `/var/log/nginx/error.log`
3. **Database connection fails**: Verify credentials in `.env`
4. **Payments don't work**: Verify LIVE credentials, check `PAYPAL_MODE=live`

### **Get Help:**
- **DigitalOcean Community**: [digitalocean.com/community](https://www.digitalocean.com/community/)
- **Laravel Community**: [laracasts.com/discuss](https://laracasts.com/discuss)

---

## 🚀 **Ready to Start?**

**Follow the complete guide in `DIGITALOCEAN_DEPLOYMENT_GUIDE.md`**

**This checklist is your roadmap - check off each item as you complete it!**

---

**🎯 Goal: From local development to live production website in one day!**

