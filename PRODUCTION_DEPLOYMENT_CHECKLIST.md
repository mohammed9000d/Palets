# 🚀 Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Code Cleanup (COMPLETED)
- [x] Remove test payment controllers (`TestPaymentController.php`)
- [x] Remove test payment components (`TestStripeForm.jsx`, `TestPayPalForm.jsx`)
- [x] Remove test routes from `routes/api.php`
- [x] Clean up unused imports

### 🔧 Environment Configuration

#### 1. **Update `.env` for Production**
```bash
# Application
APP_NAME="Palets"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database (Production)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_production_database
DB_USERNAME=your_production_username
DB_PASSWORD=your_secure_password

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail (Production SMTP)
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Stripe (LIVE Credentials)
STRIPE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET=sk_live_YOUR_LIVE_SECRET_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# PayPal (LIVE Credentials)
PAYPAL_CLIENT_ID=YOUR_LIVE_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_LIVE_PAYPAL_CLIENT_SECRET
PAYPAL_MODE=live
VITE_PAYPAL_CLIENT_ID=YOUR_LIVE_PAYPAL_CLIENT_ID

# File Storage
FILESYSTEM_DISK=public

# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error
```

#### 2. **Security Settings**
- [x] Set `APP_DEBUG=false`
- [x] Set `APP_ENV=production`
- [x] Generate new `APP_KEY` with `php artisan key:generate`
- [x] Use HTTPS URLs (`APP_URL=https://yourdomain.com`)
- [x] Use production database credentials
- [x] Use LIVE payment gateway credentials

### 🏗️ Server Setup

#### 3. **Laravel Forge + DigitalOcean Setup**
- [ ] Create DigitalOcean account
- [ ] Create Laravel Forge account
- [ ] Connect Forge to DigitalOcean
- [ ] Create server (PHP 8.2, MySQL 8.0, Redis)
- [ ] Create site on server
- [ ] Connect Git repository
- [ ] Configure deployment script

#### 4. **Database Setup**
- [ ] Create production database
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed essential data: `php artisan db:seed --class=AdminSeeder`
- [ ] Seed settings: `php artisan db:seed --class=SettingsSeeder`

#### 5. **File Permissions**
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
```

#### 6. **Build Assets**
```bash
npm install --production
npm run build
```

#### 7. **Laravel Optimizations**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 🔒 SSL Certificate
- [ ] Install SSL certificate (Let's Encrypt via Forge)
- [ ] Force HTTPS redirects
- [ ] Update `APP_URL` to use `https://`

### 🔄 Queue Workers (Optional but Recommended)
```bash
php artisan queue:work --daemon
```

### 📧 Email Testing
- [ ] Test order confirmation emails
- [ ] Test password reset emails
- [ ] Test contact form emails

## 🧪 Payment Gateway Testing

### Stripe Live Mode Testing
1. **Test Card Numbers (Stripe provides test cards even in live mode for testing)**
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`

2. **Test Process:**
   - [ ] Add product to cart
   - [ ] Go to checkout
   - [ ] Fill billing information
   - [ ] Use test card number
   - [ ] Verify order creation
   - [ ] Check Stripe dashboard for payment

### PayPal Live Mode Testing
1. **PayPal Sandbox vs Live:**
   - Ensure `PAYPAL_MODE=live` in production
   - Use real PayPal account for testing

2. **Test Process:**
   - [ ] Add product to cart
   - [ ] Go to checkout
   - [ ] Select PayPal payment
   - [ ] Complete PayPal flow
   - [ ] Verify order creation
   - [ ] Check PayPal dashboard for payment

## 🚨 Security Checklist

### Critical Security Items
- [ ] **Never commit `.env` file to Git**
- [ ] **Use strong database passwords**
- [ ] **Enable firewall on server**
- [ ] **Regular backups setup**
- [ ] **Update server packages regularly**
- [ ] **Monitor error logs**

### Laravel Security
- [ ] **CSRF protection enabled** (default)
- [ ] **SQL injection protection** (using Eloquent)
- [ ] **XSS protection** (using Blade templates)
- [ ] **Rate limiting on API routes**

## 📊 Monitoring & Maintenance

### Essential Monitoring
- [ ] Setup error monitoring (Sentry, Bugsnag)
- [ ] Monitor server resources (CPU, Memory, Disk)
- [ ] Monitor database performance
- [ ] Setup uptime monitoring
- [ ] Monitor payment gateway webhooks

### Regular Maintenance
- [ ] **Weekly**: Check error logs
- [ ] **Monthly**: Update dependencies
- [ ] **Monthly**: Database backups verification
- [ ] **Quarterly**: Security updates

## 🎯 Go-Live Checklist

### Final Steps Before Launch
- [ ] **Test all payment flows end-to-end**
- [ ] **Test user registration/login**
- [ ] **Test cart functionality**
- [ ] **Test order management**
- [ ] **Test admin panel**
- [ ] **Verify email notifications**
- [ ] **Test on mobile devices**
- [ ] **Performance testing**
- [ ] **SEO meta tags setup**

### Launch Day
- [ ] **Switch DNS to production server**
- [ ] **Monitor error logs closely**
- [ ] **Test critical user flows**
- [ ] **Announce launch**

## 🆘 Rollback Plan

### If Issues Occur
1. **Immediate Actions:**
   - Switch DNS back to maintenance page
   - Check error logs
   - Identify the issue

2. **Common Issues & Solutions:**
   - **Database connection**: Check credentials
   - **Payment failures**: Verify API keys
   - **Asset loading**: Run `npm run build`
   - **Cache issues**: Clear all caches

3. **Emergency Contacts:**
   - Hosting provider support
   - Payment gateway support
   - Development team

---

## 📞 Support Information

### Payment Gateway Support
- **Stripe Support**: https://support.stripe.com/
- **PayPal Support**: https://www.paypal.com/us/smarthelp/contact-us

### Hosting Support
- **Laravel Forge**: https://forge.laravel.com/support
- **DigitalOcean**: https://www.digitalocean.com/support/

---

**🎉 Congratulations on your production deployment!**

Remember: Always test thoroughly in a staging environment before deploying to production.
