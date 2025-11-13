# Production Deployment

Complete guide for deploying to a production Ubuntu server.

## Prerequisites

- Ubuntu 20.04 or later
- SSH access to server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Step 1: Server Setup

### Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Install Node.js

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version
npm --version
```

### Install Yarn

```bash
npm install -g yarn@1.22.22

# Verify installation
yarn --version
```

### Install Nginx

```bash
sudo apt-get install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
sudo systemctl status nginx
```

### Install PM2

```bash
npm install -g pm2

# Verify installation
pm2 --version
```

## Step 2: Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/icjia-accessibility
sudo chown $USER:$USER /var/www/icjia-accessibility

# Clone repository
cd /var/www/icjia-accessibility
git clone https://github.com/ICJIA/icjia-accessibility-status.git .

# Install dependencies
yarn install
```

## Step 3: Configure Environment

```bash
# Create .env file
cp .env.sample .env

# Edit .env with production values
nano .env
```

Update with your production values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_URL=https://example.com/api
PORT=3001

# Frontend Configuration
FRONTEND_URL=https://example.com

# Node Environment
NODE_ENV=production
```

## Step 4: Build Application

```bash
# Build frontend
yarn build

# Verify build
ls -la dist/
```

## Step 5: Configure PM2

```bash
# Copy ecosystem configuration
cp ecosystem.config.js /var/www/icjia-accessibility/

# Start services with PM2
cd /var/www/icjia-accessibility
pm2 start ecosystem.config.js --env production

# Verify services running
pm2 status

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the instructions to set up auto-start
```

## Step 6: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx/icjia-accessibility.conf /etc/nginx/sites-available/

# Enable site
sudo ln -s /etc/nginx/sites-available/icjia-accessibility.conf \
  /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 7: Setup SSL/TLS

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d example.com -d www.example.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo certbot renew --dry-run
```

### Update Nginx Configuration

Edit `/etc/nginx/sites-available/icjia-accessibility.conf`:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # ... rest of configuration
}
```

## Step 8: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Test endpoints
curl http://localhost:5173
curl http://localhost:3001/api/health

# Test via domain
curl https://example.com
curl https://example.com/api/health
```

## Step 9: Setup Monitoring

### PM2 Monitoring

```bash
# View real-time monitoring
pm2 monit

# View logs
pm2 logs

# Setup log rotation
pm2 install pm2-logrotate
```

### System Monitoring

```bash
# Install htop for system monitoring
sudo apt-get install -y htop

# View system resources
htop
```

## Maintenance

### Updating Application

```bash
cd /var/www/icjia-accessibility

# Pull latest code
git pull origin main

# Install dependencies
yarn install

# Build
yarn build

# Restart services
pm2 restart all
```

### Viewing Logs

```bash
# View all logs
pm2 logs

# View specific service
pm2 logs accessibility-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Database

```bash
# Export Supabase database
# Use Supabase dashboard or CLI

# Store backups securely
# Implement automated backup strategy
```

## Troubleshooting

### Services Won't Start

```bash
# Check PM2 logs
pm2 logs

# Check system logs
sudo journalctl -xe

# Restart services
pm2 restart all
```

### Nginx Not Working

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Issues

- Verify Supabase credentials in `.env`
- Check network connectivity
- Verify RLS policies in Supabase

## See Also

- [Deployment Overview](./overview) - Deployment guide
- [Nginx Configuration](./nginx) - Nginx setup
- [PM2 Configuration](./pm2) - Process management
