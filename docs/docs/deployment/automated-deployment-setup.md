---
sidebar_position: 2
---

# Automated Deployment Setup

Complete guide to setting up automated deployments with GitHub webhooks for `accessibility.icjia.app`.

## Overview

This setup enables automatic deployments when code is pushed to the `main` branch:

```
Developer pushes to main
        ↓
GitHub sends webhook to Forge
        ↓
Forge executes deploy-forge.sh
        ↓
Script pulls latest code
        ↓
Script runs: yarn install --production
        ↓
Script runs: yarn build
        ↓
Script restarts PM2 services
        ↓
New version live at accessibility.icjia.app
```

## Files Created/Modified

### 1. **package.json** - Added 'forge' deployment script

```json
"forge": "yarn install --production && yarn build && pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js && pm2 save"
```

**What it does:**
- Installs production dependencies only (no dev dependencies)
- Builds frontend and documentation
- Restarts PM2 services (or starts them if not running)
- Saves PM2 process list for persistence

### 2. **ecosystem.config.js** - Updated with documentation service

Now manages both services:
- **Backend:** `icjia-accessibility-backend` on port 3001
- **Documentation:** `icjia-accessibility-docs` on port 3002

Both services configured with:
- Auto-restart on crash
- Logging with timestamps
- Max 10 restarts
- 10-second minimum uptime before restart counts

### 3. **deploy-forge.sh** - Bash deployment script

Executed by Laravel Forge when webhook is triggered.

**12-Step Deployment Process:**
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
- Color-coded logging (info, success, warning, error)
- Comprehensive error handling
- Automatic rollback on failure
- Detailed deployment log
- Service verification

## Laravel Forge Configuration

### Step 1: Upload Deployment Script

1. **SSH into your Forge server:**
   ```bash
   ssh forge@your-server-ip
   ```

2. **Make the script executable:**
   ```bash
   chmod +x /home/forge/accessibility.icjia.app/deploy-forge.sh
   ```

### Step 2: Configure Deployment Script in Forge

1. **Log in to Laravel Forge:** https://forge.laravel.com
2. **Go to Site Details → Deployment Script**
3. **Replace the default script with:**

```bash
#!/bin/bash
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

**Note:** This simple wrapper calls our comprehensive deployment script.

### Step 3: Enable GitHub Webhook

1. **In Forge, go to Site Details → Deployment**
2. **Click "Enable GitHub Webhook"**
3. **Select your repository:** `ICJIA/icjia-accessibility-status`
4. **Select branch:** `main`
5. **Click "Enable"**

Forge will automatically create a webhook in your GitHub repository.

### Step 4: Verify Webhook Configuration

1. **Go to GitHub repository settings:** https://github.com/ICJIA/icjia-accessibility-status/settings/hooks
2. **You should see a webhook pointing to Forge**
3. **Click on it to verify configuration**
4. **Recent Deliveries tab shows webhook history**

## Environment Variables

Ensure these are set in Forge (Site Details → Environment):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_URL=https://accessibility.icjia.app/api
FRONTEND_URL=https://accessibility.icjia.app

# Server Configuration
NODE_ENV=production
PORT=3001
```

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

**Monitor deployment:**
1. Go to Forge → Site Details → Deployment History
2. Click on the deployment to see logs
3. Or SSH and check: `pm2 logs`

### Manual Deployment (If Needed)

**SSH into server:**
```bash
ssh forge@your-server-ip
cd /home/forge/accessibility.icjia.app
bash deploy-forge.sh
```

## Verification

### After Deployment

1. **Check frontend:** https://accessibility.icjia.app
   - Should load React application
   - Check browser console for errors

2. **Check API:** https://accessibility.icjia.app/api/health
   - Should return JSON with status
   - Verifies backend is running

3. **Check docs:** https://accessibility.icjia.app/docs
   - Should display Docusaurus site
   - Verify navigation works

4. **Check services:**
   ```bash
   ssh forge@your-server-ip
   pm2 status
   pm2 logs
   ```

## Troubleshooting

### Webhook Not Triggering

1. **Verify webhook in GitHub:**
   - Go to repository settings → Webhooks
   - Check if webhook exists and is active
   - Check "Recent Deliveries" for errors

2. **Verify Forge configuration:**
   - Go to Site Details → Deployment
   - Confirm GitHub webhook is enabled
   - Confirm correct branch is selected

3. **Test webhook manually:**
   - In GitHub webhook settings, click "Redeliver"
   - Check Forge deployment history

### Deployment Script Fails

1. **Check deployment logs:**
   ```bash
   ssh forge@your-server-ip
   tail -f /home/forge/.pm2/logs/deployment.log
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs icjia-accessibility-backend
   pm2 logs icjia-accessibility-docs
   ```

3. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/accessibility.icjia.app-error.log
   ```

### Services Not Starting

1. **Verify environment variables:**
   ```bash
   cat /home/forge/accessibility.icjia.app/.env
   ```

2. **Check if ports are in use:**
   ```bash
   lsof -i :3001
   lsof -i :3002
   ```

3. **Manually restart services:**
   ```bash
   pm2 restart ecosystem.config.js
   pm2 status
   ```

## Monitoring Deployments

### View Deployment History

1. **In Forge:** Site Details → Deployment History
2. **Shows:** Timestamp, branch, status, duration
3. **Click deployment** to see full logs

### View Service Logs

```bash
ssh forge@your-server-ip

# Backend logs
pm2 logs icjia-accessibility-backend

# Documentation logs
pm2 logs icjia-accessibility-docs

# Deployment logs
tail -f /home/forge/.pm2/logs/deployment.log
```

### Monitor Service Status

```bash
ssh forge@your-server-ip

# Check all services
pm2 status

# Watch services in real-time
pm2 monit
```

## Rollback Procedure

If deployment causes issues:

1. **Identify the problematic commit:**
   ```bash
   git log --oneline -5
   ```

2. **Revert to previous commit:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Forge will automatically deploy the revert**

4. **Or manually rollback:**
   ```bash
   git reset --hard <previous-commit-hash>
   git push origin main --force
   ```

## Best Practices

1. **Always test locally before pushing:**
   ```bash
   yarn dev
   yarn build
   ```

2. **Use meaningful commit messages:**
   ```bash
   git commit -m "Fix: API endpoint for health check"
   ```

3. **Monitor deployments:**
   - Check Forge deployment history
   - Verify endpoints after deployment
   - Check PM2 logs for errors

4. **Keep main branch stable:**
   - Use feature branches for development
   - Test thoroughly before merging to main
   - Use pull requests for code review

5. **Document changes:**
   - Update README if needed
   - Update deployment docs if configuration changes
   - Add comments for complex changes

## Deployment Checklist

Before enabling automatic deployments:

- [ ] Environment variables set in Forge
- [ ] Nginx configuration correct
- [ ] PM2 ecosystem.config.js updated
- [ ] deploy-forge.sh uploaded and executable
- [ ] Deployment script configured in Forge
- [ ] GitHub webhook enabled
- [ ] Manual deployment tested successfully
- [ ] Webhook test delivery successful
- [ ] All three endpoints verified working
- [ ] PM2 logs show no errors

## Next Steps

1. Upload `deploy-forge.sh` to server
2. Make it executable: `chmod +x deploy-forge.sh`
3. Configure deployment script in Forge
4. Enable GitHub webhook
5. Test with a small commit to main branch
6. Monitor deployment in Forge
7. Verify all endpoints working

