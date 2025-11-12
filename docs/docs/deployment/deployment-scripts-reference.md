---
sidebar_position: 4
---

# Deployment Scripts Reference

Quick reference for all deployment-related scripts and commands.

## Package.json Scripts

### Development Scripts

```bash
# Start all services in development mode
yarn dev

# Start only frontend (Vite on 5173)
yarn dev:frontend

# Start only backend (Express on 3001)
yarn dev:backend

# Start only documentation (Docusaurus on 3002)
yarn dev:docs

# Start all services separately
yarn dev:all
```

### Build Scripts

```bash
# Build frontend and documentation
yarn build

# Build frontend only
yarn build:frontend

# Build documentation only
yarn build:docs

# Build backend (no-op, uses tsx runtime)
yarn build:backend
```

### PM2 Management Scripts

```bash
# Start all services with PM2
yarn start

# Stop all services
yarn stop

# Restart all services
yarn restart

# View backend logs
yarn logs

# Check PM2 status
yarn status
```

### Deployment Script (NEW)

```bash
# Run complete deployment (used by Forge)
yarn forge
```

**What it does:**
1. `yarn install --production` - Install production dependencies
2. `yarn build` - Build frontend and documentation
3. `pm2 restart ecosystem.config.js` - Restart services
4. `pm2 save` - Save process list

**Used by:** Laravel Forge deployment webhook

### Other Scripts

```bash
# Lint code
yarn lint

# Type checking
yarn typecheck

# Seed database
yarn seed

# Reset users
yarn reset:users

# Reset entire app
yarn reset:app
```

## Bash Deployment Script

### File: `deploy-forge.sh`

**Location:** `/home/forge/accessibility.icjia.app/deploy-forge.sh`

**Execution:** Called by Laravel Forge when GitHub webhook is triggered

**12-Step Process:**

```
1. Navigate to site directory
2. Pull latest code from GitHub
3. Verify Yarn installation
4. Install production dependencies
5. Build frontend and documentation
6. Verify build artifacts
7. Verify PM2 installation
8. Restart PM2 services
9. Save PM2 process list
10. Verify services are running
11. Verify ports are listening
12. Display PM2 status
```

**Features:**
- Color-coded logging
- Error handling with rollback
- Service verification
- Detailed logging to `/home/forge/.pm2/logs/deployment.log`

**Manual Execution:**

```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

## PM2 Configuration

### File: `ecosystem.config.js`

**Services Managed:**

#### 1. Backend Service
```javascript
{
  name: 'icjia-accessibility-backend',
  script: 'server/index.ts',
  interpreter: 'tsx',
  port: 3001,
  env: { NODE_ENV: 'production' }
}
```

#### 2. Documentation Service
```javascript
{
  name: 'icjia-accessibility-docs',
  script: 'yarn',
  args: 'workspace icjia-accessibility-docs start',
  port: 3002,
  env: { NODE_ENV: 'production' }
}
```

**Common PM2 Commands:**

```bash
# Start all services
pm2 start ecosystem.config.js

# Restart all services
pm2 restart ecosystem.config.js

# Stop all services
pm2 stop ecosystem.config.js

# Delete all services
pm2 delete ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# View specific service logs
pm2 logs icjia-accessibility-backend
pm2 logs icjia-accessibility-docs

# Monitor in real-time
pm2 monit

# Save process list
pm2 save

# Setup startup on reboot
pm2 startup
```

## Deployment Workflow

### Automatic Deployment (GitHub Webhook)

**Trigger:** Push to `main` branch

```bash
git add .
git commit -m "Your changes"
git push origin main
```

**Flow:**
```
GitHub webhook
    ↓
Forge receives webhook
    ↓
Forge executes: bash deploy-forge.sh
    ↓
Script pulls latest code
    ↓
Script runs: yarn forge
    ↓
Services restarted
    ↓
New version live
```

**Time:** ~2-3 minutes

### Manual Deployment

**Option 1: Using Forge UI**
1. Go to Site Details → Deployment
2. Click "Deploy Now"

**Option 2: SSH and run script**
```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

**Option 3: SSH and run yarn command**
```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
yarn forge
```

## Environment Variables

### Required Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_URL=https://accessibility.icjia.app/api
FRONTEND_URL=https://accessibility.icjia.app

# Server
NODE_ENV=production
PORT=3001
```

### Set in Forge

1. Go to Site Details → Environment
2. Add each variable
3. Click Save

### Set on Server

```bash
ssh forge@your-server-ip
nano /home/forge/accessibility.icjia.app/.env
```

## Verification Commands

### Check Services

```bash
# SSH into server
ssh forge@your-server-ip

# Check PM2 status
pm2 status

# Check if ports are listening
lsof -i :3001
lsof -i :3002

# Check if processes are running
ps aux | grep node
ps aux | grep yarn
```

### Check Endpoints

```bash
# Frontend
curl https://accessibility.icjia.app

# API Health
curl https://accessibility.icjia.app/api/health

# Documentation
curl https://accessibility.icjia.app/docs
```

### Check Logs

```bash
# Backend logs
pm2 logs icjia-accessibility-backend

# Documentation logs
pm2 logs icjia-accessibility-docs

# Deployment logs
tail -f /home/forge/.pm2/logs/deployment.log

# Nginx error logs
sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log
```

## Troubleshooting Commands

### Services Not Running

```bash
# Check status
pm2 status

# Restart services
pm2 restart ecosystem.config.js

# Start services
pm2 start ecosystem.config.js

# Check logs
pm2 logs
```

### Build Failed

```bash
# Check if dist directory exists
ls -la dist/

# Try building manually
yarn build

# Check for errors
yarn build 2>&1 | tail -20
```

### Port Conflicts

```bash
# Check what's using port 3001
lsof -i :3001

# Check what's using port 3002
lsof -i :3002

# Kill process using port (if needed)
kill -9 <PID>
```

### Deployment Script Issues

```bash
# Check deployment log
tail -f /home/forge/.pm2/logs/deployment.log

# Run script manually with output
bash deploy-forge.sh

# Check script permissions
ls -la deploy-forge.sh

# Make executable if needed
chmod +x deploy-forge.sh
```

## Deployment Checklist

Before first deployment:

- [ ] `package.json` has 'forge' script
- [ ] `ecosystem.config.js` has both services
- [ ] `deploy-forge.sh` uploaded to server
- [ ] `deploy-forge.sh` is executable (`chmod +x`)
- [ ] Environment variables set in Forge
- [ ] Deployment script configured in Forge
- [ ] GitHub webhook enabled
- [ ] Manual deployment tested
- [ ] All endpoints verified
- [ ] PM2 logs show no errors

## Quick Start

### First Time Setup

```bash
# 1. Upload deploy-forge.sh
scp deploy-forge.sh forge@your-server-ip:/home/forge/accessibility.icjia.app/

# 2. Make executable
ssh forge@your-server-ip
chmod +x /home/forge/accessibility.icjia.app/deploy-forge.sh

# 3. Test manual deployment
bash /home/forge/accessibility.icjia.app/deploy-forge.sh

# 4. Verify services
pm2 status
```

### Enable Automatic Deployments

1. In Forge: Site Details → Deployment Script
2. Add: `bash deploy-forge.sh`
3. In Forge: Site Details → Deployment
4. Enable GitHub webhook
5. Test with a commit to main

### Monitor Deployments

```bash
# Watch deployment history in Forge
# Or SSH and check logs:
tail -f /home/forge/.pm2/logs/deployment.log
pm2 logs
```

