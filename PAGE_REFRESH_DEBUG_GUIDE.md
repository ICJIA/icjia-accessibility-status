# Page Refresh Loop - Debug Guide

## Scan Results

✅ **Comprehensive scan completed** - No `window.location.reload()` or similar calls found in:
- `src/` directory (all React components)
- `server/` directory (all backend code)

## What to Check

### 1. Browser Console (F12)
Open DevTools and check the Console tab:
- Look for any error messages
- Check for repeated errors
- Note any warnings about network requests

### 2. Network Tab (F12)
- Click the Network tab
- Run a scan
- Look for:
  - Any requests to `/admin` or `/` (full page reloads)
  - Failed requests (red status codes)
  - Repeated requests to the same endpoint

### 3. Check for Browser Extensions
Some extensions can cause page reloads:
- Disable all extensions temporarily
- Try running a scan again
- Re-enable extensions one by one to find the culprit

### 4. Check Vite HMR (Hot Module Replacement)
- Open DevTools Console
- Look for messages like "HMR connected" or "HMR update"
- If you see "HMR update" repeatedly, it might be triggering reloads

### 5. Service Worker
- Open DevTools → Application → Service Workers
- Check if any service workers are registered
- Try unregistering them

## Polling Mechanism

The app uses polling for:
- **SitesManagement**: Polls scan status every 2 seconds
- **ActivityLog**: Polls for new activities every 3 seconds
- **SystemStatus**: Checks health every 15 seconds

These are all **state updates only** - no page reloads.

## What to Report

If you still see refresh loops, please provide:

1. **Browser Console Output**
   - Screenshot or copy of any errors
   - Timestamps of when errors occur

2. **Network Tab**
   - Screenshot showing requests during scan
   - Any failed requests (red status)

3. **Browser Info**
   - Browser name and version
   - OS (Windows/Mac/Linux)
   - Any extensions installed

4. **Steps to Reproduce**
   - Exact steps to trigger the issue
   - Does it happen on every scan?
   - Does it happen on specific sites?

## Potential Causes

1. **Browser Extension** - Most common cause
2. **Vite HMR Issue** - Dev server hot reload
3. **Network Error** - API call failure causing retry loop
4. **Service Worker** - Cached responses causing issues
5. **Browser Cache** - Stale data causing conflicts

## Quick Fixes to Try

```bash
# 1. Clear browser cache
# Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)

# 2. Restart dev server
yarn dev

# 3. Hard refresh browser
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 4. Check backend logs
yarn logs
```

