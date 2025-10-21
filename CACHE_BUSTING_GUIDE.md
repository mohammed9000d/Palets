# Cache Busting Configuration Guide

## Overview
This application uses a multi-layered cache busting strategy to ensure users always see the latest frontend changes after deployment.

## Cache Strategy

### 1. **Vite Build Configuration**
The `vite.config.js` includes:
- Hash-based asset filenames (e.g., `index-DNfr9x4F.js`)
- Unique hashes generated on every build
- Assets referenced via manifest.json

### 2. **HTML Cache Prevention**
The main `app.blade.php` template includes meta tags to prevent HTML caching:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 3. **Server-Side Cache Headers**

#### Apache (.htaccess)
The `public/.htaccess` file includes:
- **No caching** for HTML and JSON files (including manifest.json)
- **1 year caching** for static assets with hashed filenames
- **Gzip compression** for faster downloads

#### Nginx Configuration
If using Nginx, add this to your server block:

```nginx
server {
    # ... other configuration ...

    location / {
        try_files $uri $uri/ /index.php?$query_string;
        
        # Prevent caching of HTML and manifest files
        location ~* \.(html|htm|json)$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }

    # Cache static assets with versioned filenames for 1 year
    location ~* \.(js|css|woff|woff2|ttf|svg|jpg|jpeg|png|gif|ico|webp)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

### 4. **Deployment Process**
The deployment workflow:
1. Cleans old build artifacts completely:
   ```bash
   rm -rf public/assets/
   rm -rf public/.vite/
   rm -rf public/build/
   ```
2. Builds fresh assets with new hashes
3. Touches manifest.json to update its timestamp
4. Clears all Laravel caches:
   - Config cache
   - Route cache
   - View cache
   - Response cache (if applicable)

## Troubleshooting

### Issue: Changes still not appearing after deployment

**Solutions:**

1. **Hard Refresh Browser**
   - Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Safari: `Cmd+Option+R`

2. **Check Browser DevTools**
   - Open Network tab
   - Disable cache (checkbox in Network tab)
   - Reload page
   - Verify asset filenames have new hashes

3. **Verify Build Completed**
   - SSH into server: `ssh user@server`
   - Check build artifacts: `ls -la /var/www/Palets/public/.vite/`
   - Verify manifest.json was updated: `stat /var/www/Palets/public/.vite/manifest.json`

4. **Clear Server-Side Cache**
   ```bash
   cd /var/www/Palets
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   systemctl restart nginx  # or: systemctl restart apache2
   systemctl restart php8.2-fpm
   ```

5. **Check for Service Workers**
   - Open browser DevTools → Application → Service Workers
   - Unregister any active service workers
   - Clear site data

6. **CDN Cache (if using Cloudflare/similar)**
   - Log into CDN dashboard
   - Purge entire cache or specific URLs
   - For Cloudflare: Cache → Purge Everything

### Issue: Manifest errors in console

**Solution:**
```bash
cd /var/www/Palets
rm -rf public/.vite/
npm run build
php artisan cache:clear
```

### Issue: Mixed content errors

**Solution:**
Ensure your site is served over HTTPS and check:
```bash
# In .env file
APP_URL=https://yourdomain.com
```

## Best Practices

1. **Always deploy via the automated workflow** - Don't build assets locally and upload them
2. **Monitor the deployment logs** - Check for build errors or warnings
3. **Test in incognito mode** - After deployment, verify changes in a fresh browser session
4. **Version your releases** - Use semantic versioning for tracking deployments
5. **Keep dependencies updated** - Regularly update npm packages and Composer dependencies

## Additional Notes

- Asset files with hashes can be cached indefinitely (1 year)
- The manifest.json is never cached and always shows current asset references
- HTML pages are never cached, ensuring users get the latest manifest references
- Browser service workers are unregistered by default in the app
