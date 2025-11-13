# Phase 2: File Structure & Implementation Order

## 📁 New Files to Create

### Backend Files
```
server/config/redis.ts                    - Redis client setup
server/queues/scanQueue.ts                - Bull queue configuration
server/workers/scanWorker.ts              - Scan job processor
server/services/scanService.ts            - Scan execution logic
server/routes/scans.ts                    - Scan API endpoints
server/middleware/requireAdmin.ts         - Admin authorization
server/middleware/rateLimit.ts            - Rate limiting
```

### Database Files
```
supabase/migrations/step_4_add_scan_execution_fields.sql
```

### Documentation Files
```
PHASE_2_IMPLEMENTATION_GUIDE.md
PHASE_2_TESTING_GUIDE.md
PHASE_2_TROUBLESHOOTING.md
```

---

## 📝 Files to Modify

### Backend
```
server/index.ts                           - Import scan routes
server/middleware/auth.ts                 - Add requireAdmin middleware
```

### Frontend
```
src/pages/SiteDetail.tsx                  - Add Run Scan button
src/lib/api.ts                            - Add triggerScan method
src/types/index.ts                        - Add ScanType type
```

### Configuration
```
.env.sample                               - Add new env vars
docker-compose.yml                        - Add Redis service
docker-compose.dev.yml                    - Redis config for dev
```

---

## 🔄 Implementation Order

### Step 1: Database & Configuration
1. Create migration: `step_4_add_scan_execution_fields.sql`
2. Update `.env.sample` with new variables
3. Update `docker-compose.yml` with Redis service

### Step 2: Backend Infrastructure
1. Create `server/config/redis.ts`
2. Create `server/queues/scanQueue.ts`
3. Create `server/middleware/requireAdmin.ts`
4. Create `server/middleware/rateLimit.ts`

### Step 3: Scan Services
1. Create `server/services/scanService.ts` (SSRF, validation, parsing)
2. Create `server/workers/scanWorker.ts` (job processing)
3. Create `server/routes/scans.ts` (API endpoints)

### Step 4: Backend Integration
1. Update `server/index.ts` to import scan routes
2. Update `server/middleware/auth.ts` with requireAdmin

### Step 5: Frontend
1. Update `src/types/index.ts` with ScanType
2. Update `src/lib/api.ts` with triggerScan method
3. Update `src/pages/SiteDetail.tsx` with Run Scan button

### Step 6: Testing & Documentation
1. Create testing guide
2. Create troubleshooting guide
3. Test in Docker Compose dev environment

---

## 📊 File Dependencies

```
docker-compose.yml
    ↓
.env.sample
    ↓
server/config/redis.ts
    ↓
server/queues/scanQueue.ts
    ↓
server/services/scanService.ts
    ↓
server/workers/scanWorker.ts
    ↓
server/routes/scans.ts
    ↓
server/index.ts
    ↓
src/lib/api.ts
    ↓
src/pages/SiteDetail.tsx
```

---

## 🎯 Key Implementation Details

### Redis Connection
- Dev: `redis://localhost:6379`
- Prod: Use `REDIS_URL` env var
- Connection pooling for performance

### Bull Queue
- Queue name: `accessibility-scans`
- Concurrency: 2 workers (configurable)
- Job timeout: 90 seconds
- Retry: 3 attempts with 60s delay

### Scan Worker
- Process one job at a time
- Update scan status: pending → running → completed/failed
- Handle timeouts gracefully
- Log all errors

### API Endpoint
- Validate site exists
- Check admin authorization
- Validate URL (SSRF protection)
- Check rate limit
- Create scan record
- Enqueue job
- Return scan ID

### Frontend Button
- Show only for admin users
- Disable while scanning
- Show loading state
- Poll for updates every 2 seconds
- Auto-refresh results when complete

---

## 🔗 Related Documentation

- `PHASE_2_DETAILED_PLAN.md` - High-level plan
- `PHASE_2_TECHNICAL_SPEC.md` - Technical details
- `PHASE_2_IMPLEMENTATION_GUIDE.md` - Step-by-step guide (to be created)
- `PHASE_2_TESTING_GUIDE.md` - Testing instructions (to be created)

