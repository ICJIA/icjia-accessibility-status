# Phase 2: Scan Triggering & Execution - Detailed Plan

## 🎯 Overview

Phase 2 implements the ability to run accessibility scans as an admin user. This includes:
- Admin-only "Run Scan" button on site detail page
- Bull/Redis job queue for async scan processing
- Lighthouse and Axe scan workers
- SSRF protection and rate limiting
- Timeout/retry logic (60s delay, 2 attempts)

---

## 📊 Architecture

```
Frontend (Admin)
    ↓
POST /api/scans (with auth)
    ↓
Backend validates & creates scan record
    ↓
Enqueue job in Bull queue
    ↓
Scan worker processes job
    ↓
Execute Lighthouse/Axe
    ↓
Update scan record with results
    ↓
Frontend polls/WebSocket for updates
```

---

## 1️⃣ Database Schema Changes

### New Columns (if needed)
- `scans.admin_id` - Track which admin triggered the scan
- `scans.scan_type` - 'lighthouse' | 'axe' | 'both'
- `scans.retry_count` - Current retry attempt (0-2)

### Migration File
`supabase/migrations/step_4_add_scan_execution_fields.sql`

```sql
ALTER TABLE scans ADD COLUMN admin_id uuid REFERENCES auth.users(id);
ALTER TABLE scans ADD COLUMN scan_type text DEFAULT 'both';
ALTER TABLE scans ADD COLUMN retry_count integer DEFAULT 0;
```

---

## 2️⃣ Dependencies to Install

```bash
yarn add bull redis bullmq
yarn add lighthouse @axe-core/puppeteer puppeteer
yarn add dotenv
```

**Versions:**
- bull: ^4.11.0 (or bullmq: ^5.0.0)
- redis: ^4.6.0
- lighthouse: ^11.0.0
- @axe-core/puppeteer: ^4.8.0
- puppeteer: ^21.0.0

---

## 3️⃣ Backend Implementation

### 3.1 Redis Configuration
**File:** `server/config/redis.ts`
- Connect to Redis (localhost:6379 in dev, env var in prod)
- Export Redis client

### 3.2 Bull Queue Setup
**File:** `server/queues/scanQueue.ts`
- Create Bull queue for scans
- Define job interface
- Export queue instance

### 3.3 Scan Worker
**File:** `server/workers/scanWorker.ts`
- Process scan jobs
- Execute Lighthouse scan
- Execute Axe scan
- Update database with results
- Handle errors and retries

### 3.4 API Endpoint
**File:** `server/routes/scans.ts` (new)
- `POST /api/scans` - Trigger a scan
  - Validate site_id exists
  - Check admin authorization
  - SSRF protection (validate URL)
  - Rate limiting (max 5 scans/hour per site)
  - Create scan record (status='pending')
  - Enqueue job
  - Return scan ID

### 3.5 Scan Execution Logic
**File:** `server/services/scanService.ts` (new)
- `runLighthouse(url)` - Execute Lighthouse
- `runAxe(url)` - Execute Axe with Puppeteer
- `validateUrl(url)` - SSRF protection
- `parseReports(results)` - Extract summaries

---

## 4️⃣ Frontend Implementation

### 4.1 Admin Check
**File:** `src/lib/auth.ts` (update)
- Add `isAdmin()` function
- Check user role in database

### 4.2 Run Scan Button
**File:** `src/pages/SiteDetail.tsx` (update)
- Add "Run Scan" button (admin-only)
- Show scan type selector (Lighthouse/Axe/Both)
- Disable button while scan running
- Show loading state

### 4.3 Trigger Scan Function
**File:** `src/lib/api.ts` (update)
- Add `triggerScan(siteId, scanType)` method
- POST to `/api/scans`
- Return scan ID

### 4.4 Poll for Updates
**File:** `src/pages/SiteDetail.tsx` (update)
- Poll scan status every 2 seconds
- Stop polling when completed/failed
- Auto-refresh ScanResults component

---

## 5️⃣ Authentication & Authorization

### Admin Role Check
- Add `role` column to users table (if not exists)
- Check `role = 'admin'` before allowing scan trigger
- Middleware: `requireAdmin` in `server/middleware/auth.ts`

### API Protection
- All scan endpoints require authentication
- POST /api/scans requires admin role
- GET /api/scans/:id requires authentication

---

## 6️⃣ SSRF Protection

### Implementation
**File:** `server/services/scanService.ts`

```typescript
function validateUrl(url: string): boolean {
  // 1. Parse URL
  const parsed = new URL(url);
  
  // 2. Check protocol (http/https only)
  if (!['http:', 'https:'].includes(parsed.protocol)) return false;
  
  // 3. Check hostname (no localhost, 127.0.0.1, etc)
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blockedHosts.includes(parsed.hostname)) return false;
  
  // 4. Check IP range (no private IPs)
  // Block: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  
  // 5. Whitelist allowed domains (optional)
  const allowedDomains = process.env.ALLOWED_SCAN_DOMAINS?.split(',') || [];
  if (allowedDomains.length > 0) {
    return allowedDomains.some(d => parsed.hostname.endsWith(d));
  }
  
  return true;
}
```

---

## 7️⃣ Timeout & Retry Logic

### Timeout
- Lighthouse: 60 second timeout
- Axe: 30 second timeout
- Total job timeout: 90 seconds

### Retry Logic
- Max 2 retries (3 total attempts)
- Delay between retries: 60 seconds
- Only retry on timeout/network errors
- Don't retry on validation errors

### Implementation
**File:** `server/workers/scanWorker.ts`

```typescript
queue.process(async (job) => {
  try {
    // Execute scan with timeout
    const results = await Promise.race([
      executeScan(job.data),
      timeout(90000) // 90 second timeout
    ]);
    return results;
  } catch (error) {
    if (job.attemptsMade < 2) {
      throw error; // Retry
    }
    // Update scan with error
    await updateScanError(job.data.scanId, error.message);
  }
});
```

---

## 8️⃣ Rate Limiting

### Implementation
**File:** `server/middleware/rateLimit.ts`

- Max 5 scans per site per hour
- Max 20 scans per user per hour
- Use Redis for tracking
- Return 429 if limit exceeded

---

## 9️⃣ Docker Compose Changes

### Redis Service
**File:** `docker-compose.yml` (update)

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
```

### Environment Variables
**File:** `.env.sample` (update)

```
REDIS_URL=redis://localhost:6379
LIGHTHOUSE_TIMEOUT=60000
AXE_TIMEOUT=30000
ALLOWED_SCAN_DOMAINS=icjia.illinois.gov,example.com
MAX_SCANS_PER_HOUR=5
```

---

## 🔟 Environment Variables

### Backend (.env)
```
REDIS_URL=redis://localhost:6379
LIGHTHOUSE_TIMEOUT=60000
AXE_TIMEOUT=30000
ALLOWED_SCAN_DOMAINS=icjia.illinois.gov
MAX_SCANS_PER_HOUR=5
SCAN_WORKER_CONCURRENCY=2
```

### Frontend (.env)
```
VITE_SCAN_POLL_INTERVAL=2000
```

---

## 📋 Implementation Checklist

- [ ] Database migration (admin_id, scan_type, retry_count)
- [ ] Install dependencies (bull, redis, lighthouse, axe, puppeteer)
- [ ] Redis configuration
- [ ] Bull queue setup
- [ ] Scan worker implementation
- [ ] POST /api/scans endpoint
- [ ] SSRF protection
- [ ] Rate limiting
- [ ] Timeout/retry logic
- [ ] Admin role check
- [ ] Frontend "Run Scan" button
- [ ] Frontend scan type selector
- [ ] Frontend polling logic
- [ ] Docker Compose Redis service
- [ ] Environment variables
- [ ] Testing in dev environment
- [ ] Documentation

---

## 📚 Related Files

- `PHASE_2_IMPLEMENTATION.md` - Implementation guide
- `PHASE_2_TESTING_GUIDE.md` - Testing instructions
- `PHASE_2_TROUBLESHOOTING.md` - Common issues

