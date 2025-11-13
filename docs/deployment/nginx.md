# Nginx Configuration

Guide to configuring Nginx as a reverse proxy for the ICJIA Accessibility Portal.

## Overview

Nginx acts as a reverse proxy, routing requests to the appropriate backend service:

```
Client Request
    ↓
Nginx (Port 80/443)
    ├─ / ──────────→ Frontend (5173)
    └─ /api/ ──────→ Backend (3001)
```

## Basic Configuration

### File Location

```bash
/etc/nginx/sites-available/icjia-accessibility.conf
```

### Minimal Configuration

```nginx
upstream frontend {
    server localhost:5173;
}

upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name example.com www.example.com;

    # Frontend (root)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Production Configuration with SSL

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Upstream services
    upstream frontend {
        server localhost:5173;
    }

    upstream backend {
        server localhost:3001;
    }

    # Frontend (root)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ ~$ {
        deny all;
    }
}
```

## Installation

### Copy Configuration

```bash
# Copy the configuration file
sudo cp nginx/icjia-accessibility.conf /etc/nginx/sites-available/

# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/icjia-accessibility.conf \
  /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

### Test Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Reload Nginx

```bash
# Reload Nginx
sudo systemctl reload nginx

# Or restart
sudo systemctl restart nginx

# Verify status
sudo systemctl status nginx
```

## Troubleshooting

### "Connection refused" Error

**Problem:** Nginx can't connect to upstream services

**Solution:**

```bash
# Verify services are running
pm2 status

# Check if ports are listening
sudo lsof -i :5173
sudo lsof -i :3001
sudo lsof -i :3002

# Restart services if needed
pm2 restart all
```

### "Bad Gateway" Error

**Problem:** Upstream service is down or not responding

**Solution:**

```bash
# Check service logs
pm2 logs

# Restart services
pm2 restart all

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

**Problem:** SSL certificate not working

**Solution:**

```bash
# Verify certificate exists
sudo ls -la /etc/letsencrypt/live/example.com/

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Slow Response Times

**Problem:** Requests are slow

**Solution:**

```bash
# Increase timeouts in Nginx config
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# Reload Nginx
sudo systemctl reload nginx

# Check upstream service performance
pm2 monit
```

## Performance Tuning

### Enable Gzip Compression

```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

### Enable Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
}
```

### Connection Pooling

```nginx
upstream backend {
    server localhost:3001;
    keepalive 32;
}
```

## See Also

- [Deployment Overview](./overview) - Deployment guide
- [Production Deployment](./production) - Production setup
- [PM2 Configuration](./pm2) - Process management
