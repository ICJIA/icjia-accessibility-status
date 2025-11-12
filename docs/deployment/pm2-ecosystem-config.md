---
title: PM2 Ecosystem Configuration
sidebar_position: 3
description: Documented PM2 ecosystem configuration with extensive comments
---

# ✅ PM2 Ecosystem Configuration Fully Documented

The `ecosystem.config.js` file has been extensively documented with step-by-step instructions and detailed explanations of every configuration option.

## What Was Added

### 1. **File Header (Lines 1-103)**
- Overview of all three services
- Quick reference of what each service does
- Port assignments
- Configuration structure explanation

### 2. **Quick Start Guide (Lines 25-82)**
Complete 7-step guide to get PM2 running:

**STEP 1:** Install PM2 globally
```bash
npm install -g pm2
# OR
yarn global add pm2
```

**STEP 2:** Verify PM2 is installed
```bash
pm2 --version
```

**STEP 3:** Start all services
```bash
pm2 start ecosystem.config.js
```

**STEP 4:** Verify services are running
```bash
pm2 status
```

**STEP 5:** View logs
```bash
pm2 logs
pm2 logs icjia-accessibility-backend
pm2 logs icjia-accessibility-docs
```

**STEP 6:** Test the services
```bash
curl http://localhost:3001/api/health
curl http://localhost:3002
```

**STEP 7:** Setup auto-start on reboot
```bash
pm2 startup
pm2 save
```

### 3. **Common PM2 Commands (Lines 85-98)**
Quick reference for all essential PM2 commands:
- `pm2 start ecosystem.config.js` - Start all services
- `pm2 stop ecosystem.config.js` - Stop all services
- `pm2 restart ecosystem.config.js` - Restart all services
- `pm2 delete ecosystem.config.js` - Delete all services
- `pm2 status` - Show status
- `pm2 logs` - Show logs
- `pm2 monit` - Monitor in real-time
- `pm2 save` - Save process list
- `pm2 startup` - Setup auto-start
- `pm2 kill` - Kill PM2 daemon

### 4. **Service 1: Backend API (Lines 109-201)**

**Configuration Details:**
- Service name: `icjia-accessibility-backend`
- Script: `server/index.ts`
- Interpreter: `tsx` (TypeScript executor)
- Port: 3001
- Instances: 1
- Execution mode: fork
- Watch mode: false (production)
- Auto-restart: enabled
- Max restarts: 10
- Min uptime: 10 seconds

**Every option documented with:**
- What it does
- Why it's set that way
- How to change it if needed

### 5. **Service 2: Documentation (Lines 202-300)**

**Configuration Details:**
- Service name: `icjia-accessibility-docs`
- Script: `yarn`
- Args: `workspace icjia-accessibility-docs start`
- Port: 3002
- Instances: 1
- Execution mode: fork
- Watch mode: false (production)
- Auto-restart: enabled
- Max restarts: 10
- Min uptime: 10 seconds

**Every option documented with:**
- What it does
- Why it's set that way
- How to change it if needed

### 6. **Frontend Service Note (Lines 304-323)**
Explains why frontend is NOT managed by PM2:
- Frontend is built to static files (dist/)
- Served by Nginx directly
- No Node.js process needed
- Build process overview

### 7. **Architecture Overview (Lines 325-333)**
Visual diagram showing:
```
User Request
    ↓
Nginx (port 80/443)
    ├─ / → Frontend (static files from dist/)
    ├─ /api/* → Backend (port 3001, managed by PM2)
    └─ /docs/* → Docs (port 3002, managed by PM2)
```

### 8. **Deployment Workflow (Lines 336-357)**

**Initial Setup (one-time):**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Deployment (on each code push):**
```bash
git pull origin main
yarn install --production
yarn build
pm2 restart ecosystem.config.js
```

**Monitoring:**
```bash
pm2 status
pm2 logs
pm2 monit
```

### 9. **Troubleshooting Section (Lines 360-384)**

**Q: Services won't start**
- Check logs: `pm2 logs`
- Verify ports: `lsof -i :3001`
- Check environment variables

**Q: Services keep restarting**
- Check error logs: `pm2 logs [service-name]`
- Verify dependencies: `yarn install`
- Check for port conflicts

**Q: How do I see what's happening?**
- Use: `pm2 logs`
- Or: `pm2 monit`
- Or: `tail -f ./logs/backend-out.log`

**Q: How do I stop services?**
- `pm2 stop ecosystem.config.js`
- Or: `pm2 delete ecosystem.config.js`

**Q: How do I restart services?**
- `pm2 restart ecosystem.config.js`
- Or: `pm2 restart [service-id]`

## Services Configured

### ✅ Service 1: Backend API
- **Name:** icjia-accessibility-backend
- **Port:** 3001
- **Script:** server/index.ts
- **Interpreter:** tsx (TypeScript runtime)
- **Purpose:** Express API server
- **Auto-restart:** Yes
- **Logs:** ./logs/backend-error.log, ./logs/backend-out.log

### ✅ Service 2: Documentation
- **Name:** icjia-accessibility-docs
- **Port:** 3002
- **Script:** yarn workspace icjia-accessibility-docs start
- **Framework:** Docusaurus
- **Purpose:** Documentation site
- **Auto-restart:** Yes
- **Logs:** ./logs/docs-error.log, ./logs/docs-out.log

### ℹ️ Service 3: Frontend
- **Status:** NOT managed by PM2
- **Reason:** Static files served by Nginx
- **Build:** yarn build → dist/
- **Served by:** Nginx reverse proxy

## File Statistics

| Metric | Value |
|--------|-------|
| Total lines | 388 |
| Comment lines | 280+ |
| Configuration lines | 100+ |
| Documentation sections | 9 |
| Services configured | 2 |
| Services documented | 3 |

## Key Features

✅ **Comprehensive Documentation**
- Every configuration option explained
- Why each setting is used
- How to modify if needed

✅ **Step-by-Step Instructions**
- 7-step quick start guide
- Clear commands to copy/paste
- Expected output shown

✅ **Common Commands Reference**
- All essential PM2 commands
- Quick lookup for daily operations
- Examples provided

✅ **Troubleshooting Guide**
- Common issues and solutions
- Debugging commands
- Port conflict resolution

✅ **Architecture Overview**
- Visual diagram of request flow
- Service port assignments
- Nginx reverse proxy routing

✅ **Deployment Workflow**
- Initial setup steps
- Deployment steps
- Monitoring steps

## How to Use

### For New Team Members
1. Read the Quick Start Guide (lines 25-82)
2. Follow the 7 steps to get PM2 running
3. Refer to Common PM2 Commands as needed

### For Deployment
1. Follow the Deployment Workflow (lines 336-357)
2. Use the provided commands
3. Monitor with `pm2 status` and `pm2 logs`

### For Troubleshooting
1. Check the Troubleshooting Section (lines 360-384)
2. Run the suggested debugging commands
3. Check logs with `pm2 logs`

## Git Commit

```
538e9aa - Add extensive comments to ecosystem.config.js
```

## Status: ✅ COMPLETE

The `ecosystem.config.js` file is now:
- ✅ Fully documented with extensive comments
- ✅ Includes step-by-step PM2 setup instructions
- ✅ Every configuration option explained
- ✅ Common commands reference provided
- ✅ Troubleshooting guide included
- ✅ Architecture overview documented
- ✅ Deployment workflow explained
- ✅ Ready for production use
- ✅ Easy for new team members to understand

**All three services are configured and documented:**
1. ✅ Backend API (Express on port 3001)
2. ✅ Documentation (Docusaurus on port 3002)
3. ℹ️ Frontend (Static files served by Nginx)

**The file is production-ready and fully documented!**

