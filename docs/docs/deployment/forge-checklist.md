---
title: Forge Deployment Checklist
sidebar_position: 9
description: Comprehensive checklist for Laravel Forge deployment
---

# Laravel Forge Deployment Checklist for accessibility.icjia.app

Complete verification checklist for deploying ICJIA Accessibility Status Portal to Laravel Forge.

## Pre-Deployment Checklist

### Prerequisites
- [ ] Laravel Forge account created and server instantiated
- [ ] GitHub SSH key configured in Forge
- [ ] Supabase project created with credentials ready
- [ ] Domain `accessibility.icjia.app` pointing to Forge server
- [ ] Node.js 20+ available (Forge installs automatically)

### Credentials Gathered
- [ ] Supabase Project URL: `https://your-project-ref.supabase.co`
- [ ] Supabase Anon Key: `your-supabase-anon-key`
- [ ] Domain name: `accessibility.icjia.app`
- [ ] Server IP address: `your-server-ip`

## Deployment Steps Checklist

### Step 1: Create Site in Forge
- [ ] Log in to https://forge.laravel.com
- [ ] Click "Create Site"
- [ ] Domain: `accessibility.icjia.app`
- [ ] Project Type: `Node.js`
- [ ] Node Version: `20`
- [ ] Root Directory: `/public`
- [ ] Click "Create Site"

### Step 2: Connect GitHub Repository
- [ ] Go to Site Details → Repository
- [ ] Repository: `ICJIA/icjia-accessibility-status`
- [ ] Branch: `main`
- [ ] Uncheck "Composer"
- [ ] Click "Connect Repository"

### Step 3: Set Environment Variables
- [ ] Go to Site Details → Environment
- [ ] Add `VITE_SUPABASE_URL`
- [ ] Add `VITE_SUPABASE_ANON_KEY`
- [ ] Add `VITE_API_URL=https://accessibility.icjia.app/api`
- [ ] Add `FRONTEND_URL=https://accessibility.icjia.app`
- [ ] Add `NODE_ENV=production`
- [ ] Add `PORT=3001`
- [ ] Click "Save"

### Step 4: Create Deployment Script
- [ ] Go to Site Details → Deployment Script
- [ ] Replace with provided deployment script
- [ ] Update domain from `accessibility.yourdomain.com` to `accessibility.icjia.app`
- [ ] Click "Save"

### Step 5: Configure Nginx
- [ ] Go to Site Details → Nginx
- [ ] Replace with provided Nginx configuration
- [ ] Update domain from `accessibility.yourdomain.com` to `accessibility.icjia.app`
- [ ] Verify SSL certificate paths are correct
- [ ] Click "Save"

### Step 6: Install PM2 and Configure
- [ ] SSH into server: `ssh forge@your-server-ip`
- [ ] Install PM2: `npm install -g pm2`
- [ ] Navigate to site: `cd /home/forge/accessibility.icjia.app`
- [ ] Create ecosystem.config.js with provided configuration
- [ ] Start services: `pm2 start ecosystem.config.js`
- [ ] Save PM2: `pm2 save`
- [ ] Setup startup: `pm2 startup`
- [ ] Verify services: `pm2 status`

### Step 7: Initial Setup (First Time Only)
- [ ] Install Yarn: `npm install -g yarn@1.22.22`
- [ ] Verify Yarn: `yarn --version`
- [ ] Create .env: `cp .env.sample .env`
- [ ] Edit .env: `nano .env`
- [ ] Update Supabase credentials
- [ ] Update domain URLs
- [ ] Save file (Ctrl+X, Y, Enter)

### Step 8: Deploy
- [ ] In Forge, click "Deploy Now"
- [ ] Monitor Site Details → Deployment History
- [ ] Wait for deployment to complete
- [ ] Check for any error messages

## Post-Deployment Verification

### Frontend Verification
- [ ] Visit https://accessibility.icjia.app
- [ ] Page loads without errors
- [ ] Check browser console (F12) for errors
- [ ] Navigation works
- [ ] Responsive design works on mobile

### API Verification
- [ ] Visit https://accessibility.icjia.app/api/health
- [ ] Returns JSON response
- [ ] Status shows "healthy"
- [ ] Database connection shows "connected"
- [ ] All tables are accessible

### Documentation Verification
- [ ] Visit https://accessibility.icjia.app/docs
- [ ] Docusaurus site loads
- [ ] Sidebar displays with emoji icons
- [ ] Navigation works
- [ ] Search functionality works

### Service Verification
- [ ] SSH into server
- [ ] Run `pm2 status` - all services show "online"
- [ ] Run `pm2 logs` - no error messages
- [ ] Run `lsof -i :3001` - backend listening
- [ ] Run `lsof -i :3002` - docs listening

### Nginx Verification
- [ ] Run `sudo nginx -t` - configuration OK
- [ ] Check `/var/log/nginx/accessibility.icjia.app-access.log` - requests logged
- [ ] Check `/var/log/nginx/accessibility.icjia.app-error.log` - no errors
- [ ] SSL certificate is valid (check browser)

## Troubleshooting Checklist

### If Services Don't Start
- [ ] Check .env file exists: `cat /home/forge/accessibility.icjia.app/.env`
- [ ] Check Supabase credentials are correct
- [ ] Check ports 3001 and 3002 are free: `lsof -i :3001`
- [ ] Check PM2 logs: `pm2 logs`
- [ ] Restart services: `pm2 restart all`

### If Frontend Shows Blank Page
- [ ] Check dist directory exists: `ls -la /home/forge/accessibility.icjia.app/dist/`
- [ ] Check Nginx config: `sudo nginx -t`
- [ ] Check Nginx error logs: `sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log`
- [ ] Restart Nginx: `sudo systemctl restart nginx`

### If API Returns 502 Bad Gateway
- [ ] Check backend is running: `pm2 status`
- [ ] Check backend logs: `pm2 logs icjia-accessibility-backend`
- [ ] Check port 3001 is listening: `lsof -i :3001`
- [ ] Check Nginx logs: `sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log`

### If Build Fails
- [ ] Check Yarn is installed: `yarn --version`
- [ ] Check disk space: `df -h`
- [ ] Try manual build: `yarn install --production && yarn build`
- [ ] Check dist directory: `ls -la dist/`

## Ongoing Maintenance

### Daily Checks
- [ ] Monitor Site Details → Monitoring for CPU/memory usage
- [ ] Check Site Details → Logs for errors
- [ ] Verify https://accessibility.icjia.app/api/health returns healthy

### Weekly Checks
- [ ] Review PM2 logs for warnings
- [ ] Check Nginx error logs
- [ ] Verify all three services are running
- [ ] Test frontend, API, and docs functionality

### Monthly Checks
- [ ] Review SSL certificate expiration (Forge auto-renews)
- [ ] Check disk space usage
- [ ] Review application logs for patterns
- [ ] Test automatic deployments

## Automatic Deployments Setup

- [ ] Go to Site Details → Deployment
- [ ] Enable "Auto Deploy"
- [ ] Select branch: `main`
- [ ] Now every push to `main` automatically deploys

## Support Resources

- **Full Guide:** `docs/docs/deployment/laravel-forge.md`
- **Quick Start:** `LARAVEL_FORGE_QUICK_START.md`
- **Deployment Overview:** `docs/docs/deployment/overview.md`
- **PM2 Configuration:** `docs/docs/deployment/pm2.md`
- **Nginx Configuration:** `docs/docs/deployment/nginx.md`

## Notes

Use this space to document any custom configurations or issues encountered:

```
[Add notes here]
```

