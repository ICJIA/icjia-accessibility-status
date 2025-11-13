# Phase 2: Plan Summary - Ready for Approval

## 🎯 What Phase 2 Delivers

Admin users can now trigger accessibility scans on demand. Scans run asynchronously via a job queue and results are displayed in real-time.

---

## 📋 Key Components

### 1. Database Changes
- Add `admin_id` column to track who triggered scan
- Add `scan_type` column ('lighthouse', 'axe', 'both')
- Add `retry_count` column for retry tracking
- Migration: `step_4_add_scan_execution_fields.sql`

### 2. Backend Infrastructure
- **Redis**: In-memory data store for job queue
- **Bull Queue**: Job queue for async processing
- **Scan Worker**: Processes jobs, executes Lighthouse/Axe
- **API Endpoint**: POST /api/scans to trigger scans

### 3. Security & Protection
- **Admin-only access**: Only admins can trigger scans
- **SSRF Protection**: Validate URLs, block private IPs
- **Rate Limiting**: Max 5 scans/site/hour
- **Authentication**: All endpoints require auth

### 4. Reliability
- **Timeout**: 90 second total timeout
- **Retry Logic**: 3 attempts with 60s delay between retries
- **Error Handling**: Graceful failure with error messages
- **Logging**: All errors logged for debugging

### 5. Frontend
- **Run Scan Button**: Admin-only button on site detail page
- **Scan Type Selector**: Choose Lighthouse, Axe, or Both
- **Polling**: Auto-refresh every 2 seconds
- **Status Display**: Shows scan progress and results

### 6. Docker Compose
- **Redis Service**: Added to docker-compose.yml
- **Environment Variables**: All config via .env
- **Health Checks**: Redis health check included

---

## 📦 Dependencies to Install

```bash
yarn add bull redis bullmq lighthouse @axe-core/puppeteer puppeteer
```

**Versions:**
- bull: ^4.11.0
- redis: ^4.6.0
- lighthouse: ^11.0.0
- @axe-core/puppeteer: ^4.8.0
- puppeteer: ^21.0.0

---

## 🔧 Environment Variables

### New Variables
```
REDIS_URL=redis://localhost:6379
LIGHTHOUSE_TIMEOUT=60000
AXE_TIMEOUT=30000
ALLOWED_SCAN_DOMAINS=icjia.illinois.gov
MAX_SCANS_PER_HOUR=5
SCAN_WORKER_CONCURRENCY=2
VITE_SCAN_POLL_INTERVAL=2000
```

---

## 📁 Files to Create (7 backend + 1 migration)

```
Backend:
- server/config/redis.ts
- server/queues/scanQueue.ts
- server/workers/scanWorker.ts
- server/services/scanService.ts
- server/routes/scans.ts
- server/middleware/requireAdmin.ts
- server/middleware/rateLimit.ts

Database:
- supabase/migrations/step_4_add_scan_execution_fields.sql
```

---

## 📝 Files to Modify (6 files)

```
Backend:
- server/index.ts (import scan routes)
- server/middleware/auth.ts (add requireAdmin)

Frontend:
- src/pages/SiteDetail.tsx (add Run Scan button)
- src/lib/api.ts (add triggerScan method)
- src/types/index.ts (add ScanType)

Config:
- .env.sample (add new variables)
- docker-compose.yml (add Redis service)
```

---

## 🔐 Security Features

### SSRF Protection
- Block localhost, 127.0.0.1, ::1
- Block private IPs (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Optional whitelist of allowed domains

### Rate Limiting
- Max 5 scans per site per hour
- Max 20 scans per user per hour
- Tracked in Redis

### Admin Authorization
- Check user role before allowing scan trigger
- Middleware: `requireAdmin`
- Frontend: Hide button for non-admins

---

## ⏱️ Timeout & Retry

### Timeouts
- Lighthouse: 60 seconds
- Axe: 30 seconds
- Total job: 90 seconds

### Retry Strategy
- Max 3 attempts (1 initial + 2 retries)
- 60 second delay between retries
- Only retry on timeout/network errors
- Don't retry on validation errors

---

## 🔄 Data Flow

```
1. Admin clicks "Run Scan" button
2. Frontend sends POST /api/scans
3. Backend validates:
   - Site exists
   - User is admin
   - URL is valid (SSRF check)
   - Rate limit not exceeded
4. Backend creates scan record (status='pending')
5. Backend enqueues job in Bull queue
6. Worker picks up job
7. Worker executes Lighthouse/Axe
8. Worker updates scan record with results
9. Frontend polls every 2 seconds
10. Frontend displays results when complete
```

---

## 📊 API Endpoint

### POST /api/scans
**Request:**
```json
{
  "site_id": "uuid",
  "scan_type": "lighthouse" | "axe" | "both"
}
```

**Response (201):**
```json
{
  "scan": {
    "id": "uuid",
    "site_id": "uuid",
    "status": "pending",
    "scan_type": "both",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## ✅ Implementation Checklist

- [ ] Database migration
- [ ] Install dependencies
- [ ] Redis configuration
- [ ] Bull queue setup
- [ ] Scan worker implementation
- [ ] API endpoint
- [ ] SSRF protection
- [ ] Rate limiting
- [ ] Admin authorization
- [ ] Frontend button
- [ ] Frontend polling
- [ ] Docker Compose Redis
- [ ] Environment variables
- [ ] Testing in dev
- [ ] Documentation

---

## 📚 Documentation Files

- `PHASE_2_DETAILED_PLAN.md` - Detailed plan
- `PHASE_2_TECHNICAL_SPEC.md` - Technical specifications
- `PHASE_2_FILE_STRUCTURE.md` - File structure and order
- `PHASE_2_PLAN_SUMMARY.md` - This file

---

## 🎯 Next Steps

1. **Review this plan** - Ensure all requirements are met
2. **Approve plan** - Confirm approach is correct
3. **Implement Phase 2** - Follow implementation guide
4. **Test in dev** - Verify in Docker Compose environment
5. **Create tag** - Tag v0.3.0-scan-execution
6. **Deploy to prod** - After dev testing passes

---

## ✨ Success Criteria

✅ Admin can trigger scans from UI  
✅ Scans run asynchronously via job queue  
✅ Results display in real-time  
✅ SSRF protection prevents abuse  
✅ Rate limiting prevents spam  
✅ Retry logic handles failures  
✅ All errors logged properly  
✅ Works in Docker Compose dev environment  

---

## 📞 Questions?

Review the detailed plan documents:
- `PHASE_2_DETAILED_PLAN.md` - For high-level overview
- `PHASE_2_TECHNICAL_SPEC.md` - For technical details
- `PHASE_2_FILE_STRUCTURE.md` - For implementation order

