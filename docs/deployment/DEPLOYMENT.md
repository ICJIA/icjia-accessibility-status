# Production Deployment Guide

This guide covers deploying the ICJIA Accessibility Status Portal to an Ubuntu production server.

## Architecture

The application consists of:
- **Frontend**: Static React build served by Nginx
- **Backend**: Express API managed by PM2
- **Database**: Supabase (external service)

## Prerequisites

- Ubuntu/Debian server with root access
- Node.js 20+ installed
- Nginx installed (`sudo apt install nginx`)
- PM2 installed globally (`yarn global add pm2` or `npm install -g pm2`)
- Domain name pointed to your server
- SSL certificate (Let's Encrypt recommended)

## Step 1: Prepare the Server

### Install Node.js 20+

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 20.x or higher
```

### Install Yarn

```bash
npm install -g yarn
yarn --version  # Should be 1.22.22
```

### Install PM2

```bash
yarn global add pm2
# or
npm install -g pm2
```

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 2: Build the Application Locally

On your development machine:

```bash
# Install dependencies
yarn install

# Build the frontend (creates dist/ folder)
yarn build

# The backend doesn't need building - it uses tsx runtime
```

## Step 3: Deploy to Server

### Create Application Directory

```bash
ssh user@your-server
sudo mkdir -p /var/www/icjia-accessibility
sudo chown -R $USER:$USER /var/www/icjia-accessibility
```

### Upload Files

From your local machine:

```bash
# Upload backend files
rsync -av --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  --exclude 'logs/*.log' \
  ./ user@your-server:/var/www/icjia-accessibility/

# Upload frontend build
rsync -av dist/ user@your-server:/var/www/icjia-accessibility/dist/
```

### Install Dependencies on Server

```bash
ssh user@your-server
cd /var/www/icjia-accessibility
yarn install --production
```

## Step 4: Configure Environment Variables

Create `.env` file on the server:

```bash
cd /var/www/icjia-accessibility
nano .env
```

Add your production environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# API Configuration
VITE_API_URL=https://yourdomain.com/api

# Server Configuration
PORT=3001

# Frontend Configuration
FRONTEND_URL=https://yourdomain.com
```

**Important**: Use production Supabase credentials, not development ones.

## Step 5: Start Backend with PM2

```bash
cd /var/www/icjia-accessibility

# Start the backend using PM2
yarn start
# or
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed by the command above
```

### Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs icjia-accessibility-backend

# Test the API
curl http://localhost:3001/api/health
```

## Step 6: Configure Nginx

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/icjia-accessibility
```

Add the following configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (update paths to your certificates)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root directory for frontend static files
    root /var/www/icjia-accessibility/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Frontend: serve static files and handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API: proxy to Express server
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/icjia-accessibility /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 7: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically update your Nginx configuration
# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 8: Verify Deployment

1. **Check Backend**: `curl https://yourdomain.com/api/health`
2. **Check Frontend**: Visit `https://yourdomain.com` in your browser
3. **Check PM2**: `pm2 status`
4. **Check Nginx**: `sudo systemctl status nginx`

## Management Commands

### PM2 Commands

```bash
# View status
yarn status
# or
pm2 status

# View logs
yarn logs
# or
pm2 logs icjia-accessibility-backend

# Restart backend
yarn restart
# or
pm2 restart icjia-accessibility-backend

# Stop backend
yarn stop
# or
pm2 stop icjia-accessibility-backend

# Monitor in real-time
pm2 monit
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

## Updating the Application

### Update Backend

```bash
# On local machine: sync backend changes
rsync -av --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  server/ user@your-server:/var/www/icjia-accessibility/server/

# On server: restart PM2
ssh user@your-server
cd /var/www/icjia-accessibility
yarn restart
```

### Update Frontend

```bash
# On local machine: build and deploy
yarn build
rsync -av dist/ user@your-server:/var/www/icjia-accessibility/dist/

# No server restart needed - Nginx serves static files
```

### Update Dependencies

```bash
# On server
ssh user@your-server
cd /var/www/icjia-accessibility
yarn install --production
yarn restart
```

## Monitoring and Logs

### PM2 Logs

Logs are stored in `/var/www/icjia-accessibility/logs/`:
- `backend-error.log` - Error logs
- `backend-out.log` - Standard output logs

```bash
# View logs
tail -f logs/backend-error.log
tail -f logs/backend-out.log

# Or use PM2
pm2 logs icjia-accessibility-backend
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs icjia-accessibility-backend

# Check if port 3001 is in use
sudo lsof -i :3001

# Verify environment variables
cat .env
```

### Frontend Not Loading

```bash
# Check Nginx configuration
sudo nginx -t

# Check if files exist
ls -la /var/www/icjia-accessibility/dist/

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### API Requests Failing

```bash
# Test backend directly
curl http://localhost:3001/api/health

# Check CORS settings in server/index.ts
# Verify FRONTEND_URL in .env matches your domain
```

## Security Checklist

- [ ] Change default admin password after first login
- [ ] Use strong Supabase credentials
- [ ] Enable SSL/HTTPS
- [ ] Keep Node.js and dependencies updated
- [ ] Configure firewall (UFW)
- [ ] Set up regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` file to git

## Firewall Configuration (Optional)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Support

For issues or questions, contact the ICJIA IT team.

