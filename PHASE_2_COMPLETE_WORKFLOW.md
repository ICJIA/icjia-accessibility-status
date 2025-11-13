# Phase 2 Complete Workflow - Mock Testing

## 🎯 Overview

This document provides the complete workflow for testing Phase 2 with mock data. Everything is ready to test the UI without actual Lighthouse/Axe execution.

---

## 📋 What's Implemented

✅ Mock "Run Scan" endpoint (POST /api/scans)  
✅ Admin-only "Run Scan" button on site detail page  
✅ Scan type selector (Lighthouse/Axe/Both)  
✅ Mock data generation (random scores and reports)  
✅ Automatic scan completion (3-5 seconds)  
✅ Real-time polling (every 2 seconds)  
✅ Status indicators and error handling  
✅ Comprehensive documentation  

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Services
```bash
cd /Users/cschweda/webdev/icjia-accessibility-status
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Step 2: Verify Services
```bash
# Check all services running
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Should show: backend, frontend, redis (all Up)
```

### Step 3: Open Application
```
http://localhost:5173
```

### Step 4: Login
- Use admin credentials
- Navigate to dashboard

### Step 5: Test Scan
- Click on any site
- Click "Run Scan" button
- Watch scan complete in 3-5 seconds
- Verify reports display

---

## 📚 Documentation Files

### Getting Started
1. **DOCKER_COMPOSE_DEV_WORKFLOW.md** - How to use Docker Compose
   - Start/stop services
   - View logs
   - Hot reload behavior
   - Troubleshooting

2. **MOCK_TESTING_GUIDE.md** - Complete testing walkthrough
   - Step-by-step testing
   - What to look for
   - Expected behavior
   - Success criteria

### Advanced Topics
3. **SEED_DUMMY_SCANS.md** - Pre-populate database
   - SQL to seed data
   - Verify seeded data
   - Delete dummy data

4. **REDIS_BULL_VERIFICATION.md** - Redis/Bull queue
   - Verify Redis running
   - Monitor queue
   - Troubleshooting

### Reference
5. **PHASE_2_MOCK_IMPLEMENTATION_SUMMARY.md** - What was built
   - Files created/modified
   - How it works
   - Features implemented

---

## 🔄 Complete Testing Workflow

### Phase 1: Setup (5 min)
```bash
# Start Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Verify services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Open browser
# http://localhost:5173
```

### Phase 2: Login (2 min)
- Login with admin credentials
- Verify dashboard loads

### Phase 3: Navigate to Site (2 min)
- Click on any site from dashboard
- Verify site detail page loads
- Look for "Accessibility Scans" section

### Phase 4: Verify UI (2 min)
- [ ] "Run Scan" button visible
- [ ] Scan type dropdown visible
- [ ] Button is enabled (not grayed out)

### Phase 5: Trigger Scan (1 min)
- Click "Run Scan" button
- Button changes to "Running..."
- Button becomes disabled

### Phase 6: Watch Completion (5 min)
- Wait 3-5 seconds
- New scan appears with status="pending"
- After 2-3 more seconds, status="completed"
- Lighthouse and Axe scores appear
- Mock reports display

### Phase 7: Test Polling (2 min)
- Verify no manual refresh needed
- Watch UI update automatically
- Check browser console for logs

### Phase 8: Test Different Types (3 min)
- Select "Lighthouse Only"
- Click "Run Scan"
- Verify only Lighthouse report
- Select "Axe Only"
- Click "Run Scan"
- Verify only Axe report

### Phase 9: Check Logs (2 min)
```bash
# View backend logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend | grep "Mock Scan"

# Should see:
# [Mock Scan] Created scan ...
# [Mock Scan] Completed scan ...
```

### Phase 10: Verify Redis (2 min)
```bash
# Check Redis running
redis-cli -h localhost ping
# Should return: PONG

# View Redis keys
redis-cli -h localhost KEYS "*"
```

---

## ✅ Success Checklist

- [ ] Docker Compose services running
- [ ] Application loads at http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Can navigate to site detail page
- [ ] "Run Scan" button visible
- [ ] Scan type selector works
- [ ] Can trigger scan
- [ ] Scan completes in 3-5 seconds
- [ ] Status changes from pending → completed
- [ ] Lighthouse report displays
- [ ] Axe report displays
- [ ] Polling updates UI automatically
- [ ] No errors in browser console
- [ ] Backend logs show "[Mock Scan]" messages
- [ ] Redis is running and accessible

---

## 🐛 Troubleshooting

### Services Not Running
```bash
# Check status
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart
```

### Button Not Appearing
- Verify logged in as admin
- Check browser console (F12)
- Refresh page

### Scan Not Completing
- Check backend logs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs backend`
- Look for "[Mock Scan]" messages
- Verify database connection

### Polling Not Working
- Check browser console for errors
- Verify backend health: `curl http://localhost:3001/api/health`
- Check network tab in DevTools

---

## 📊 Expected Timeline

```
T+0s:   Click "Run Scan"
T+0s:   Button → "Running..."
T+0s:   New scan appears (status=pending)
T+3-5s: Backend simulates completion
T+5-7s: Frontend polls and gets update
T+5-7s: Status → "completed"
T+5-7s: Scores and reports appear
```

---

## 🎯 Next Steps

1. **Follow MOCK_TESTING_GUIDE.md** - Complete testing walkthrough
2. **Check DOCKER_COMPOSE_DEV_WORKFLOW.md** - Dev environment details
3. **Review REDIS_BULL_VERIFICATION.md** - Verify infrastructure
4. **Seed dummy data** - Follow SEED_DUMMY_SCANS.md
5. **Phase 3** - Replace mock with real Lighthouse/Axe

---

## 📞 Need Help?

- Check MOCK_TESTING_GUIDE.md for testing issues
- Check DOCKER_COMPOSE_DEV_WORKFLOW.md for Docker issues
- Check REDIS_BULL_VERIFICATION.md for Redis issues
- Review backend logs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs backend`
- Check browser console (F12) for frontend errors

