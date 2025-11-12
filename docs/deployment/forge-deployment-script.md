---
sidebar_position: 3
---

# Forge Deployment Script Setup

Quick reference for setting up the deployment script in Laravel Forge.

## Quick Answer: What Script to Add to Forge?

When Laravel Forge receives a GitHub webhook, it will execute the deployment script you configure. Here's exactly what to add:

### The Forge Deployment Script

**Location in Forge:** Site Details → Deployment Script

**Script to Add:**
```bash
#!/bin/bash
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

That's it! This simple wrapper script calls the comprehensive deployment script.

## Why This Approach?

### Problem
- Laravel Forge's deployment script field has character limits
- Our deployment needs 12 steps with error handling and verification
- We want all logic version-controlled in Git

### Solution
- Keep Forge's script simple (just a wrapper)
- Put all deployment logic in `deploy-forge.sh`
- Version control everything in Git
- Easy to update and maintain

## Complete Deployment Flow

```
1. Developer pushes to main branch
   git push origin main

2. GitHub sends webhook to Laravel Forge
   (automatic)

3. Forge receives webhook and executes deployment script
   #!/bin/bash
   cd /home/forge/accessibility.icjia.app
   bash deploy-forge.sh

4. deploy-forge.sh runs 12-step deployment:
   - Pull latest code from GitHub
   - Verify Yarn installation
   - Install production dependencies
   - Build frontend and documentation
   - Verify build artifacts
   - Verify PM2 installation
   - Restart PM2 services
   - Save PM2 process list
   - Verify services running
   - Verify ports listening
   - Display PM2 status
   - Log completion

5. Services restarted and verified
   (automatic)

6. New version live at accessibility.icjia.app
   (~2-3 minutes from push)
```

## Setup Steps

### Step 1: Upload deploy-forge.sh to Server

```bash
scp deploy-forge.sh forge@your-server-ip:/home/forge/accessibility.icjia.app/
```

### Step 2: Make Script Executable

```bash
ssh forge@your-server-ip
chmod +x /home/forge/accessibility.icjia.app/deploy-forge.sh
```

### Step 3: Configure Deployment Script in Forge

1. Log in to Laravel Forge: https://forge.laravel.com
2. Go to: **Site Details → Deployment Script**
3. Replace the default script with:

```bash
#!/bin/bash
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

4. Click **Save**

### Step 4: Enable GitHub Webhook

1. In Forge, go to: **Site Details → Deployment**
2. Click **"Enable GitHub Webhook"**
3. Select repository: `ICJIA/icjia-accessibility-status`
4. Select branch: `main`
5. Click **Enable**

Forge will automatically create a webhook in your GitHub repository.

### Step 5: Verify Webhook Configuration

1. Go to GitHub: https://github.com/ICJIA/icjia-accessibility-status/settings/hooks
2. You should see a webhook pointing to Forge
3. Click on it to verify configuration
4. Check "Recent Deliveries" tab to see webhook history

### Step 6: Test Deployment

Make a small test commit:

```bash
git add .
git commit -m "Test deployment"
git push origin main
```

Then:
1. Go to Forge → Site Details → Deployment History
2. You should see a new deployment
3. Click on it to see logs
4. Wait for completion (~2-3 minutes)

### Step 7: Verify Endpoints

After deployment completes:

```bash
# Frontend
curl https://accessibility.icjia.app

# API Health
curl https://accessibility.icjia.app/api/health

# Documentation
curl https://accessibility.icjia.app/docs
```

All three should return successfully.

## What deploy-forge.sh Does

The `deploy-forge.sh` script is a comprehensive 12-step deployment process:

### Step 1-2: Preparation
- Navigate to site directory
- Pull latest code from GitHub

### Step 3-5: Build
- Verify Yarn installation
- Install production dependencies
- Build frontend and documentation

### Step 6-7: Verification
- Verify build artifacts exist
- Verify PM2 installation

### Step 8-9: Deployment
- Restart PM2 services
- Save PM2 process list

### Step 10-12: Verification
- Verify services are running
- Verify ports are listening
- Display PM2 status

## Features

✅ **Error Handling**
- Exits on first error
- Automatic rollback on failure
- Restarts services from last known good state

✅ **Verification**
- Checks build artifacts
- Verifies services running
- Verifies ports listening
- Detailed status output

✅ **Logging**
- Color-coded output (info, success, warning, error)
- Timestamps on all messages
- Logs saved to: `/home/forge/.pm2/logs/deployment.log`

✅ **Monitoring**
- Deployment history in Forge
- PM2 logs for debugging
- Detailed deployment log

## Manual Deployment (If Needed)

If you need to deploy manually without pushing to GitHub:

```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

Or use Forge UI:
1. Go to Site Details → Deployment
2. Click "Deploy Now"

## Monitoring Deployments

### In Forge
1. Go to Site Details → Deployment History
2. Shows timestamp, branch, status, duration
3. Click deployment to see full logs

### On Server
```bash
ssh forge@your-server-ip

# View deployment log
tail -f /home/forge/.pm2/logs/deployment.log

# View PM2 logs
pm2 logs

# View specific service logs
pm2 logs icjia-accessibility-backend
pm2 logs icjia-accessibility-docs

# Check service status
pm2 status
```

## Troubleshooting

### Webhook Not Triggering

1. Verify webhook in GitHub settings
2. Check "Recent Deliveries" for errors
3. Verify Forge webhook is enabled
4. Test webhook manually (Redeliver button)

### Deployment Script Fails

```bash
ssh forge@your-server-ip
tail -f /home/forge/.pm2/logs/deployment.log
```

Check the log for specific error messages.

### Services Not Starting

```bash
ssh forge@your-server-ip

# Check status
pm2 status

# Check logs
pm2 logs

# Restart manually
pm2 restart ecosystem.config.js
```

## Environment Variables

Ensure these are set in Forge (Site Details → Environment):

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://accessibility.icjia.app/api
FRONTEND_URL=https://accessibility.icjia.app
NODE_ENV=production
PORT=3001
```

## Summary

| Item | Value |
|------|-------|
| **Forge Deployment Script** | `bash deploy-forge.sh` |
| **Script Location** | `/home/forge/accessibility.icjia.app/deploy-forge.sh` |
| **Trigger** | GitHub webhook on push to main |
| **Deployment Time** | ~2-3 minutes |
| **Services Managed** | Backend (3001) + Docs (3002) |
| **Verification** | Automatic (services, ports, logs) |
| **Error Handling** | Automatic rollback |
| **Monitoring** | Forge UI + PM2 logs |

## Next Steps

1. ✅ Upload `deploy-forge.sh` to server
2. ✅ Make executable: `chmod +x`
3. ✅ Configure Forge deployment script
4. ✅ Enable GitHub webhook
5. ✅ Test with a commit
6. ✅ Monitor deployment
7. ✅ Verify endpoints

**Status: Ready for automated deployments!**

