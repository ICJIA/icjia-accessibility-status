# Mock Testing Guide - Phase 2 UI Testing

## 🎯 Overview

This guide walks you through testing the Phase 2 UI with mock/dummy data. The "Run Scan" button creates fake scan records that automatically complete after 3-5 seconds, allowing you to test the complete workflow without actual Lighthouse/Axe execution.

---

## 🚀 Quick Start

### 1. Start Docker Compose
```bash
cd /Users/cschweda/webdev/icjia-accessibility-status
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 2. Verify Services
```bash
# Check all services running
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Should show: backend, frontend, redis (all running)
```

### 3. Open Application
```
http://localhost:5173
```

---

## ✅ Testing Checklist

### Step 1: Login
- [ ] Navigate to http://localhost:5173
- [ ] Login with admin credentials
- [ ] Verify you're on the dashboard

### Step 2: Navigate to Site Detail
- [ ] Click on any site from the dashboard
- [ ] Verify site details load
- [ ] Look for "Accessibility Scans" section

### Step 3: Verify "Run Scan" Button
- [ ] Look for "Run Scan" button (blue button with play icon)
- [ ] Verify scan type dropdown is visible (default: "Both")
- [ ] Button should be enabled (not grayed out)

### Step 4: Trigger a Mock Scan
- [ ] Click "Run Scan" button
- [ ] Button should change to "Running..."
- [ ] Button should be disabled (grayed out)

### Step 5: Watch Scan Complete
- [ ] Wait 3-5 seconds
- [ ] New scan should appear in the list with status "pending"
- [ ] After another 2-3 seconds, status should change to "completed"
- [ ] Lighthouse and Axe scores should appear
- [ ] Mock reports should be displayed

### Step 6: Test Different Scan Types
- [ ] Select "Lighthouse Only" from dropdown
- [ ] Click "Run Scan"
- [ ] Verify only Lighthouse report appears (no Axe)
- [ ] Select "Axe Only"
- [ ] Click "Run Scan"
- [ ] Verify only Axe report appears (no Lighthouse)

### Step 7: Verify Polling
- [ ] Trigger a scan
- [ ] Watch the scan status update in real-time
- [ ] Verify no manual refresh needed
- [ ] Check browser console for polling logs

---

## 🔍 What to Look For

### Mock Lighthouse Report
```json
{
  "score": 70-100,
  "categories": {
    "performance": { "score": 70-100 },
    "accessibility": { "score": 70-100 },
    "best-practices": { "score": 70-100 },
    "seo": { "score": 70-100 }
  }
}
```

### Mock Axe Report
```json
{
  "violations": 0-10,
  "passes": 40-90,
  "incomplete": 0-5,
  "inapplicable": 10-30,
  "summary": {
    "critical": 0-3,
    "serious": 0-5,
    "moderate": 0-8,
    "minor": 0-10
  }
}
```

---

## 🐛 Troubleshooting

### Button Not Appearing
- [ ] Verify you're logged in as admin
- [ ] Check browser console for errors
- [ ] Refresh page

### Scan Not Completing
- [ ] Check backend logs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs backend`
- [ ] Look for "[Mock Scan]" messages
- [ ] Verify database connection

### Polling Not Working
- [ ] Check browser console for fetch errors
- [ ] Verify backend is running: `curl http://localhost:3001/api/health`
- [ ] Check network tab in DevTools

### Database Errors
- [ ] Verify scans table exists: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs backend`
- [ ] Check Supabase connection
- [ ] Run migration if needed

---

## 📊 Viewing Logs

### Backend Logs (Mock Scan Messages)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend | grep "Mock Scan"
```

### All Backend Logs
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
```

### Frontend Logs (Browser Console)
- Open DevTools (F12)
- Go to Console tab
- Look for scan-related messages

---

## 🎬 Expected Behavior

### Timeline
1. **T+0s**: Click "Run Scan"
2. **T+0s**: Button changes to "Running..."
3. **T+0s**: New scan appears with status="pending"
4. **T+3-5s**: Backend simulates scan completion
5. **T+5-7s**: Frontend polls and gets updated scan
6. **T+5-7s**: Status changes to "completed"
7. **T+5-7s**: Scores and reports appear

### Polling Behavior
- Frontend polls every 2 seconds
- Stops polling when all scans are completed/failed
- No manual refresh needed
- Real-time updates visible

---

## ✨ Success Criteria

✅ "Run Scan" button visible and clickable  
✅ Scan type selector works  
✅ Scan status changes from pending → completed  
✅ Mock Lighthouse report displays  
✅ Mock Axe report displays  
✅ Polling updates UI automatically  
✅ No errors in console  
✅ Backend logs show "[Mock Scan]" messages  

---

## 📝 Notes

- Mock data is randomly generated each time
- Scans complete after 3-5 seconds (simulated)
- No actual Lighthouse/Axe execution
- Perfect for testing UI and polling logic
- Ready for Phase 3: Real scan execution

