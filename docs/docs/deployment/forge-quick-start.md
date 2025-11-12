---
title: Laravel Forge Quick Start
sidebar_position: 8
description: Quick start guide for Laravel Forge deployment
---

# Laravel Forge Deployment - Quick Start

Quick reference for deploying ICJIA Accessibility Status Portal to your Laravel Forge server.

## Note: localhost vs 127.0.0.1

Throughout this guide, you'll see both `localhost` and `127.0.0.1` used:

- **Nginx configs use `127.0.0.1`** - Direct IP address, no DNS lookup, more reliable for upstream proxying
- **Development/testing uses `localhost`** - More readable, equivalent for local testing

Both resolve to the same loopback address. In production Nginx configs, `127.0.0.1` is preferred because it avoids DNS resolution overhead and is more predictable.

## 1. Create Site in Forge

```
Dashboard → Your Server → Create Site
- Domain: accessibility.yourdomain.com
- Project Type: Node.js
- Node Version: 20
- Root Directory: /public
```

## 2. Connect GitHub Repository

```
Site Details → Repository
- Repository: ICJIA/icjia-accessibility-status
- Branch: main
- Click "Connect Repository"
```

## 3. Set Environment Variables

Go to **Site Details → Environment** and add:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://accessibility.yourdomain.com/api
FRONTEND_URL=https://accessibility.yourdomain.com
NODE_ENV=production
PORT=3001
```

## 4. Update Deployment Script

Go to **Site Details → Deployment Script** and replace with:

```bash
#!/bin/bash
set -e

cd /home/forge/accessibility.yourdomain.com

# Pull latest code
git pull origin main

# Install dependencies
yarn install --production

# Build frontend and documentation
yarn build

# Restart backend with PM2
pm2 restart icjia-accessibility-backend || pm2 start ecosystem.config.js
pm2 save

# Verify services
pm2 status
```

## 5. Configure Nginx

Go to **Site Details → Nginx** and replace with:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.yourdomain.com;
    root /home/forge/accessibility.yourdomain.com/dist;

    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    ssl_certificate /etc/nginx/ssl/accessibility.yourdomain.com/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/accessibility.yourdomain.com/private.key;

    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # API routes - proxy to backend
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
    }

    # Documentation routes
    location /docs/ {
        proxy_pass http://127.0.0.1:3002/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 6. SSH and Install PM2

```bash
ssh forge@your-server-ip

# Install PM2 globally
npm install -g pm2

# Navigate to site directory
cd /home/forge/accessibility.yourdomain.com

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'icjia-accessibility-backend',
      script: 'server/index.ts',
      interpreter: 'tsx',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/forge/.pm2/logs/backend-error.log',
      out_file: '/home/forge/.pm2/logs/backend-out.log',
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'icjia-accessibility-docs',
      script: 'yarn',
      args: 'workspace icjia-accessibility-docs start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/home/forge/.pm2/logs/docs-error.log',
      out_file: '/home/forge/.pm2/logs/docs-out.log',
      autorestart: true
    }
  ]
};
EOF

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 7. Deploy

In Forge: **Click "Deploy Now"** on your site

Monitor deployment in **Site Details → Deployment History**

## 8. Verify

Check that everything is working:

```bash
# SSH into server
ssh forge@your-server-ip

# Check PM2 status
pm2 status

# View logs
pm2 logs

# Check ports
lsof -i :3001
lsof -i :3002
```

Visit:

- Frontend: https://accessibility.yourdomain.com
- API: https://accessibility.yourdomain.com/api/health
- Docs: https://accessibility.yourdomain.com/docs

## Troubleshooting

### Services not running

```bash
pm2 restart all
pm2 logs
```

### Build failed

```bash
cd /home/forge/accessibility.yourdomain.com
yarn install --production
yarn build
```

### Port conflicts

```bash
lsof -i :3001
lsof -i :3002
```

## Automatic Deployments

Enable auto-deploy in Forge:

1. **Site Details → Deployment**
2. **Enable "Auto Deploy"**
3. **Select branch: main**

Now every push to `main` automatically deploys!

## Full Documentation

See the complete guide at: `docs/docs/deployment/laravel-forge.md`
