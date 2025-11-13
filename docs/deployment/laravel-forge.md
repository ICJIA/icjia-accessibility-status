# Laravel Forge Deployment Guide

Complete guide to deploying the ICJIA Accessibility Status Portal on a Laravel Forge server.

## Prerequisites

- ✅ Laravel Forge account with a new server instantiated
- ✅ GitHub repository access (SSH key configured in Forge)
- ✅ Supabase project with credentials (URL and anon key)
- ✅ Domain name pointing to your Forge server (e.g., `accessibility.icjia.app`)
- ✅ Node.js 20+ (Forge installs this automatically)
- ✅ Yarn 1.22.22 (will be installed during deployment)

## Important Notes for Single Domain Setup

This guide uses a **single domain** (`accessibility.icjia.app`) to serve:

- **Frontend** (React SPA) at `/`
- **Backend API** at `/api/`

Both services run on the same server but on different ports (5173, 3001), with Nginx routing traffic to the appropriate service based on the URL path.

## Step 1: Create a New Site in Forge

1. **Log in to Laravel Forge** → https://forge.laravel.com
2. **Click "Create Site"** on your server
3. **Configure the site:**

   - **Domain:** `accessibility.yourdomain.com` (or your preferred domain)
   - **Project Type:** `Node.js`
   - **Node Version:** `20` (or latest LTS)
   - **Root Directory:** `/public` (leave as default)

4. **Click "Create Site"**

Forge will automatically:

- Create the site directory at `/home/forge/accessibility.yourdomain.com`
- Install Node.js and npm
- Set up SSL certificate (if domain is configured)

## Step 2: Configure Git Repository

1. **In Forge, go to Site Details → Repository**
2. **Connect GitHub:**

   - **Repository:** `ICJIA/icjia-accessibility-status`
   - **Branch:** `main`
   - **Composer:** Uncheck (not needed)

3. **Click "Connect Repository"**

Forge will clone the repository to `/home/forge/accessibility.yourdomain.com`

## Step 3: Set Environment Variables

1. **Go to Site Details → Environment**
2. **Add the following environment variables:**

```bash
################################################################################
# SUPABASE CONFIGURATION [REQUIRED]
################################################################################
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

################################################################################
# FRONTEND CONFIGURATION [REQUIRED]
################################################################################
FRONTEND_URL=https://accessibility.icjia.app
VITE_DOCS_URL=/docs/

################################################################################
# API CONFIGURATION [REQUIRED]
################################################################################
VITE_API_URL=https://accessibility.icjia.app/api

################################################################################
# SERVER CONFIGURATION [OPTIONAL]
################################################################################
NODE_ENV=production
PORT=3001

################################################################################
# RATE LIMITING CONFIGURATION [OPTIONAL]
################################################################################
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
API_KEY_RATE_LIMIT_WINDOW_MS=3600000
API_KEY_RATE_LIMIT_MAX_REQUESTS=100
SESSION_RATE_LIMIT_WINDOW_MS=3600000
SESSION_RATE_LIMIT_MAX_SESSIONS=10
GENERAL_RATE_LIMIT_WINDOW_MS=3600000
GENERAL_RATE_LIMIT_MAX_REQUESTS=1000

################################################################################
# API KEY ROTATION CONFIGURATION [OPTIONAL]
################################################################################
API_KEY_ROTATION_GRACE_PERIOD_DAYS=10
KEY_DEACTIVATION_CHECK_INTERVAL_MS=3600000
```

**Important Production Configuration Notes:**

- **VITE_SUPABASE_URL**: Get from Supabase dashboard → Settings → API → Project URL
- **VITE_SUPABASE_ANON_KEY**: Get from Supabase dashboard → Settings → API → Project API Keys → anon (public)
- **FRONTEND_URL**: Must match your production domain (used for CORS configuration)
- **VITE_API_URL**: Must match your production domain with `/api` path
- **VITE_DOCS_URL**: Set to `/docs/` in production (served from same domain via Nginx)
- **NODE_ENV**: Must be `production` for optimized builds
- **PORT**: Backend port (3001 is standard, proxied by Nginx)
- **Rate Limiting**: Adjust based on your expected traffic and security requirements

**Single Source of Truth:**

All domain names and ports are now configured via environment variables. Any changes to these values will automatically ripple through the entire application:

- Frontend proxy configuration
- Navigation links
- API endpoints
- Documentation links

3. **Click "Save"**

## Step 4: Create Deployment Script

1. **Go to Site Details → Deployment Script**
2. **Replace the default script with:**

```bash
#!/bin/bash
set -e

cd /home/forge/accessibility.icjia.app

echo "=== Starting Deployment ==="
echo "Time: $(date)"

# Pull latest code
echo "Pulling latest code from GitHub..."
git pull origin main

# Install dependencies (using Yarn)
echo "Installing dependencies..."
yarn install --production

# Build frontend
echo "Building frontend..."
yarn build

# Verify build completed
if [ ! -d "dist" ]; then
  echo "ERROR: Frontend build failed - dist directory not found"
  exit 1
fi

echo "Frontend build successful"

# Restart backend with PM2
echo "Restarting backend services..."
pm2 restart icjia-accessibility-backend || pm2 start ecosystem.config.js
pm2 save

# Verify services
echo "Verifying services..."
pm2 status

echo "=== Deployment Complete ==="
echo "Frontend: https://accessibility.icjia.app"
echo "API: https://accessibility.icjia.app/api/health"
```

3. **Click "Save"**

**Note:** This script will:

- Pull the latest code from the `main` branch
- Install production dependencies only
- Build the frontend and documentation
- Restart the backend services with PM2
- Verify all services are running

## Step 5: Configure Nginx

1. **Go to Site Details → Nginx**
2. **Replace the Nginx configuration with:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.icjia.app;
    root /home/forge/accessibility.icjia.app/dist;

    # SSL configuration (auto-configured by Forge with Let's Encrypt)
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    ssl_certificate /etc/nginx/ssl/accessibility.icjia.app/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/accessibility.icjia.app/private.key;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # Logging
    access_log /var/log/nginx/accessibility.icjia.app-access.log;
    error_log /var/log/nginx/accessibility.icjia.app-error.log;

    # Frontend SPA routing (React app at /)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
        add_header X-Content-Type-Options "nosniff";
        add_header X-Frame-Options "SAMEORIGIN";
    }

    # API routes - proxy to backend (Express on port 3001)
    # Note: Use 127.0.0.1 (not localhost) for Nginx upstream proxying
    # This avoids DNS resolution overhead and is more reliable in production
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for API requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to .env and other sensitive files
    location ~ /\.(env|git|htaccess)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Cache static assets (frontend build files)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
}
```

3. **Click "Save"**

**Important Notes:**

- Replace `accessibility.icjia.app` with your actual domain
- Nginx will automatically handle SSL certificates (Forge uses Let's Encrypt)
- The configuration routes traffic based on URL path:
  - `/` → Frontend (React SPA)
  - `/api/` → Backend (Express API)
- Both services run on localhost but on different ports (5173 and 3001)

## Step 6: Install PM2 and Configure

1. **SSH into your Forge server:**

```bash
ssh forge@your-server-ip
```

2. **Install PM2 globally:**

```bash
npm install -g pm2
```

3. **Create PM2 ecosystem configuration:**

```bash
cd /home/forge/accessibility.icjia.app

# Create the ecosystem configuration file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'icjia-accessibility-backend',
      script: 'server/index.ts',
      interpreter: 'tsx',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/forge/.pm2/logs/backend-error.log',
      out_file: '/home/forge/.pm2/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
  ]
};
EOF
```

4. **Start services with PM2:**

```bash
# Start all services
pm2 start ecosystem.config.js

# Save PM2 process list (so it restarts on server reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Verify services are running
pm2 status

# View logs
pm2 logs
```

**Important:** The `pm2 startup` command will output instructions. Follow them to ensure PM2 starts automatically when the server reboots.

## Step 7: Initial Setup (First Time Only)

Before deploying, you need to set up the environment file and install Yarn:

```bash
ssh forge@your-server-ip

cd /home/forge/accessibility.icjia.app

# Install Yarn globally (if not already installed)
npm install -g yarn@1.22.22

# Verify Yarn installation
yarn --version

# Create .env file from sample
cp .env.sample .env

# Edit .env with your production values
nano .env
```

**In the .env file, update the following production values:**

```bash
################################################################################
# SUPABASE CONFIGURATION [REQUIRED]
################################################################################
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

################################################################################
# FRONTEND CONFIGURATION [REQUIRED]
################################################################################
FRONTEND_URL=https://accessibility.icjia.app
VITE_DOCS_URL=/docs/

################################################################################
# API CONFIGURATION [REQUIRED]
################################################################################
VITE_API_URL=https://accessibility.icjia.app/api

################################################################################
# SERVER CONFIGURATION [OPTIONAL]
################################################################################
NODE_ENV=production
PORT=3001

################################################################################
# RATE LIMITING CONFIGURATION [OPTIONAL]
################################################################################
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
API_KEY_RATE_LIMIT_WINDOW_MS=3600000
API_KEY_RATE_LIMIT_MAX_REQUESTS=100
SESSION_RATE_LIMIT_WINDOW_MS=3600000
SESSION_RATE_LIMIT_MAX_SESSIONS=10
GENERAL_RATE_LIMIT_WINDOW_MS=3600000
GENERAL_RATE_LIMIT_MAX_REQUESTS=1000

################################################################################
# API KEY ROTATION CONFIGURATION [OPTIONAL]
################################################################################
API_KEY_ROTATION_GRACE_PERIOD_DAYS=10
KEY_DEACTIVATION_CHECK_INTERVAL_MS=3600000
```

**Key Changes for Production:**

1. **VITE_SUPABASE_URL** - Replace `your-project-ref` with your actual Supabase project reference
2. **VITE_SUPABASE_ANON_KEY** - Replace with your actual Supabase anon key (from Settings → API)
3. **FRONTEND_URL** - Set to your production domain (e.g., `https://accessibility.icjia.app`)
4. **VITE_API_URL** - Set to your production domain with `/api` path
5. **VITE_DOCS_URL** - Set to `/docs/` (served from same domain via Nginx)
6. **NODE_ENV** - Must be `production`
7. **Rate Limiting** - Adjust values based on your expected traffic

Save the file (Ctrl+X, then Y, then Enter in nano).

**Verification:**

After saving, verify the file has all required values:

```bash
grep -E "^[A-Z_]+=" .env | wc -l  # Should show 17 variables
cat .env | grep "VITE_SUPABASE_URL\|FRONTEND_URL\|VITE_API_URL\|NODE_ENV"
```

## Step 8: Deploy

1. **In Forge, click "Deploy Now"** on the site
2. **Monitor deployment:**

   - Go to **Site Details → Deployment History**
   - Watch the deployment progress
   - Check logs if there are any errors

3. **Verify services are running:**

```bash
ssh forge@your-server-ip

# Check PM2 status
pm2 status

# View real-time logs
pm2 logs

# Check if ports are listening
lsof -i :3001
```

## Step 9: Verify Deployment

1. **Check frontend:** https://accessibility.icjia.app

   - Should display the React application
   - Check browser console for any errors

2. **Check API health:** https://accessibility.icjia.app/api/health

   - Should return JSON with status information
   - Verifies backend is running and connected to Supabase

3. **Check logs for errors:**

```bash
ssh forge@your-server-ip

# View backend logs
pm2 logs icjia-accessibility-backend

# View Nginx logs
sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log
```

## Troubleshooting

### Services not starting

```bash
# SSH into server
ssh forge@your-server-ip

# Check PM2 status
pm2 status

# View logs
pm2 logs icjia-accessibility-backend

# Restart services
pm2 restart all

# If still not working, check if .env file exists
cat /home/forge/accessibility.icjia.app/.env
```

**Common causes:**

- Missing `.env` file - Create it with `cp .env.sample .env`
- Missing Supabase credentials - Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Port already in use - Check with `lsof -i :3001`

### Build failures

```bash
# SSH into server
ssh forge@your-server-ip

# Navigate to site directory
cd /home/forge/accessibility.icjia.app

# Check if Yarn is installed
yarn --version

# Install Yarn if needed
npm install -g yarn@1.22.22

# Try building manually
yarn install --production
yarn build

# Check if dist directory was created
ls -la dist/
```

**Common causes:**

- Yarn not installed - Install with `npm install -g yarn@1.22.22`
- Missing dependencies - Run `yarn install --production`
- Insufficient disk space - Check with `df -h`

### Port conflicts

Ensure port 3001 is not in use:

```bash
lsof -i :3001

# If port is in use, kill the process
kill -9 <PID>

# Then restart PM2
pm2 restart all
```

### Frontend shows blank page or 404

```bash
# Check if frontend build exists
ls -la /home/forge/accessibility.icjia.app/dist/

# Check Nginx configuration
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log

# Restart Nginx
sudo systemctl restart nginx
```

### API returns 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs icjia-accessibility-backend

# Verify backend is listening on port 3001
lsof -i :3001

# Check Nginx logs
sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log
```

### Supabase connection errors

```bash
# Check .env file has correct credentials
cat /home/forge/accessibility.icjia.app/.env | grep SUPABASE

# Test Supabase connection
curl https://your-project-ref.supabase.co/rest/v1/

# Check backend logs for database errors
pm2 logs icjia-accessibility-backend | grep -i "supabase\|database\|error"
```

## Automatic Deployments

Forge can automatically deploy when you push to GitHub:

1. **Go to Site Details → Deployment**
2. **Enable "Auto Deploy"**
3. **Select branch:** `main`

Now every push to `main` will automatically trigger a deployment!

## Monitoring

Monitor your application in Forge:

- **Site Details → Monitoring** - View CPU, memory, and disk usage
- **Site Details → Logs** - View Nginx and application logs
- **SSH into server** - Use `pm2 logs` for real-time logs

## Next Steps

- Set up SSL certificate (Forge handles this automatically)
- Configure backups in Forge
- Set up monitoring alerts
- Configure custom domain if needed
