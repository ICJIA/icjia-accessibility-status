---
title: Automated Deployment Complete
sidebar_position: 6
description: Automated deployment workflow completion summary
---

# ✅ Automated Deployment Workflow Complete

Automated deployment with GitHub webhooks is now fully configured for `accessibility.icjia.app`.

## What Was Completed

### 1. **Package.json - Added 'forge' Deployment Script** ✅

```json
"forge": "yarn install --production && yarn build && pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js && pm2 save"
```

**What it does:**
- Installs production dependencies only (no dev dependencies)
- Builds frontend and documentation
- Restarts PM2 services (or starts them if not running)
- Saves PM2 process list for persistence

**Usage:**
```bash
yarn forge
```

### 2. **ecosystem.config.js - Enhanced with Documentation Service** ✅

Now manages **both services**:

#### Backend Service
- **Name:** `icjia-accessibility-backend`
- **Script:** `server/index.ts`
- **Interpreter:** `tsx` (TypeScript runtime)
- **Port:** 3001
- **Auto-restart:** Enabled
- **Logging:** Timestamps, error and output logs

#### Documentation Service
- **Name:** `icjia-accessibility-docs`
- **Script:** `yarn workspace icjia-accessibility-docs start`
- **Port:** 3002
- **Auto-restart:** Enabled
- **Logging:** Timestamps, error and output logs

**Both services configured with:**
- Auto-restart on crash
- Max 10 restarts
- 10-second minimum uptime before restart counts
- Logging with timestamps
- Separate error and output logs

### 3. **deploy-forge.sh - 12-Step Deployment Script** ✅

**Location:** `/home/forge/accessibility.icjia.app/deploy-forge.sh`

**12-Step Process:**
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

**Features:**
- ✅ Color-coded logging (info, success, warning, error)
- ✅ Comprehensive error handling
- ✅ Automatic rollback on failure
- ✅ Detailed deployment log
- ✅ Service verification
- ✅ Port verification
- ✅ Timestamp logging

**Execution:**
```bash
# Automatic (via GitHub webhook)
# Or manual:
ssh forge@your-server-ip
bash /home/forge/accessibility.icjia.app/deploy-forge.sh
```

### 4. **Documentation Created** ✅

#### AUTOMATED_DEPLOYMENT_SETUP.md
- Complete setup guide
- Laravel Forge configuration steps
- GitHub webhook setup
- Environment variables
- Deployment workflow
- Verification steps
- Troubleshooting guide
- Monitoring procedures
- Rollback procedure
- Best practices

#### DEPLOYMENT_SCRIPTS_REFERENCE.md
- Quick reference for all scripts
- Package.json scripts explained
- PM2 commands reference
- Deployment workflow
- Environment variables
- Verification commands
- Troubleshooting commands
- Deployment checklist
- Quick start guide

## Deployment Flow

```
Developer pushes to main branch
        ↓
GitHub sends webhook to Forge
        ↓
Forge executes: bash deploy-forge.sh
        ↓
Script pulls latest code from GitHub
        ↓
Script runs: yarn install --production
        ↓
Script runs: yarn build
        ↓
Script restarts PM2 services
        ↓
Services verified running
        ↓
Ports verified listening
        ↓
New version live at accessibility.icjia.app
        ↓
Deployment complete (~2-3 minutes)
```

## Setup Checklist

### Before First Deployment

- [ ] Upload `deploy-forge.sh` to server
- [ ] Make script executable: `chmod +x deploy-forge.sh`
- [ ] Configure deployment script in Forge
- [ ] Enable GitHub webhook in Forge
- [ ] Set environment variables in Forge
- [ ] Test manual deployment
- [ ] Verify all endpoints working

### Step-by-Step Setup

**1. Upload Deployment Script**
```bash
scp deploy-forge.sh forge@your-server-ip:/home/forge/accessibility.icjia.app/
```

**2. Make Executable**
```bash
ssh forge@your-server-ip
chmod +x /home/forge/accessibility.icjia.app/deploy-forge.sh
```

**3. Configure in Forge**
- Go to Site Details → Deployment Script
- Replace with: `bash deploy-forge.sh`
- Click Save

**4. Enable GitHub Webhook**
- Go to Site Details → Deployment
- Click "Enable GitHub Webhook"
- Select repository: `ICJIA/icjia-accessibility-status`
- Select branch: `main`
- Click Enable

**5. Verify Environment Variables**
- Go to Site Details → Environment
- Verify all required variables are set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`
  - `FRONTEND_URL`
  - `NODE_ENV=production`
  - `PORT=3001`

**6. Test Manual Deployment**
```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

**7. Verify Endpoints**
- Frontend: https://accessibility.icjia.app
- API: https://accessibility.icjia.app/api/health
- Docs: https://accessibility.icjia.app/docs

## Deployment Workflow

### Automatic Deployment (GitHub Webhook)

**Trigger:** Push to `main` branch

```bash
git add .
git commit -m "Your changes"
git push origin main
```

**What happens:**
1. GitHub sends webhook to Forge
2. Forge executes deployment script
3. Script pulls latest code
4. Script builds and restarts services
5. New version live in ~2-3 minutes

**Monitor:**
- Forge: Site Details → Deployment History
- Server: `pm2 logs`

### Manual Deployment

**Option 1: Forge UI**
- Go to Site Details → Deployment
- Click "Deploy Now"

**Option 2: SSH**
```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

**Option 3: Yarn**
```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
yarn forge
```

## Verification

### After Deployment

**1. Check Frontend**
```bash
curl https://accessibility.icjia.app
```
Should return HTML of React application.

**2. Check API**
```bash
curl https://accessibility.icjia.app/api/health
```
Should return JSON with status information.

**3. Check Documentation**
```bash
curl https://accessibility.icjia.app/docs
```
Should return Docusaurus site HTML.

**4. Check Services**
```bash
ssh forge@your-server-ip
pm2 status
```
Both services should show "online".

## Troubleshooting

### Webhook Not Triggering

1. Verify webhook in GitHub settings
2. Check "Recent Deliveries" for errors
3. Verify Forge webhook is enabled
4. Test webhook manually (Redeliver)

### Deployment Script Fails

```bash
ssh forge@your-server-ip
tail -f /home/forge/.pm2/logs/deployment.log
pm2 logs
```

### Services Not Starting

```bash
# Check environment variables
cat /home/forge/accessibility.icjia.app/.env

# Check ports
lsof -i :3001
lsof -i :3002

# Restart manually
pm2 restart ecosystem.config.js
```

## Monitoring

### View Deployment History
- Forge: Site Details → Deployment History

### View Service Logs
```bash
ssh forge@your-server-ip

# Backend
pm2 logs icjia-accessibility-backend

# Documentation
pm2 logs icjia-accessibility-docs

# Deployment
tail -f /home/forge/.pm2/logs/deployment.log
```

### Monitor Services
```bash
ssh forge@your-server-ip
pm2 monit
```

## Rollback

If deployment causes issues:

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Forge will automatically deploy the revert
```

Or manually:
```bash
git reset --hard <previous-commit-hash>
git push origin main --force
```

## Files Modified/Created

### Modified
- `package.json` - Added 'forge' script
- `ecosystem.config.js` - Added docs service

### Created
- `deploy-forge.sh` - Deployment script
- `AUTOMATED_DEPLOYMENT_SETUP.md` - Setup guide
- `DEPLOYMENT_SCRIPTS_REFERENCE.md` - Quick reference

## Key Features

✅ **Automated Deployments**
- GitHub webhook triggers deployment
- No manual intervention needed
- Automatic on every push to main

✅ **Comprehensive Verification**
- Build artifacts verified
- Services verified running
- Ports verified listening
- Detailed logging

✅ **Error Handling**
- Automatic rollback on failure
- Service restart on error
- Detailed error logging

✅ **Monitoring**
- Color-coded logging
- Deployment history in Forge
- PM2 logs for debugging
- Service status monitoring

✅ **Best Practices**
- Production dependencies only
- Proper error handling
- Service verification
- Comprehensive logging

## Next Steps

1. **Upload deploy-forge.sh to server**
   ```bash
   scp deploy-forge.sh forge@your-server-ip:/home/forge/accessibility.icjia.app/
   ```

2. **Make executable**
   ```bash
   ssh forge@your-server-ip
   chmod +x /home/forge/accessibility.icjia.app/deploy-forge.sh
   ```

3. **Configure in Forge**
   - Site Details → Deployment Script
   - Add: `bash deploy-forge.sh`

4. **Enable GitHub webhook**
   - Site Details → Deployment
   - Enable GitHub Webhook

5. **Test deployment**
   - Make a small commit to main
   - Watch deployment in Forge
   - Verify endpoints

6. **Monitor**
   - Check Forge deployment history
   - Review PM2 logs
   - Verify services running

## Status: ✅ READY FOR AUTOMATED DEPLOYMENTS

All components are in place for automated deployments with GitHub webhooks. Follow the setup checklist above to enable automatic deployments for `accessibility.icjia.app`.

**Expected Result:**
When code is pushed to GitHub main branch → Forge receives webhook → Deployment script runs → Dependencies updated → Frontend/docs built → PM2 services restarted → New version live in ~2-3 minutes.

