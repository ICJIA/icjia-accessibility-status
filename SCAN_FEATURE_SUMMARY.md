# Scan Feature - Executive Summary

## 🎯 What We're Building

Add **Lighthouse and Axe accessibility scanning** to the ICJIA Accessibility Status Portal. Authenticated users can run scans on existing websites, with results automatically saved and displayed.

---

## 🏗️ Architecture Overview

### Development (Docker Compose)

```
User → Frontend (5173) → Backend (3001) → Redis (6379) → Supabase
         ↓
      Nginx (80)
```

**Services:**
- Frontend: React SPA with hot reload
- Backend: Express API with scan endpoints
- Redis: Job queue for async scans
- Nginx: Reverse proxy for testing

**Start:** `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`

### Production (Forge)

```
User → Forge Nginx (443) → Backend (127.0.0.1:3001) → Redis (127.0.0.1:6379) → Supabase
                        ↓
                    Frontend (127.0.0.1:5173)
```

**Start:** `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

---

## 📊 Database Schema

### New Tables

**scans** - Tracks scan jobs
- id, site_id, status, lighthouse_score, axe_score
- lighthouse_report, axe_report, error_message
- started_at, completed_at, created_at, updated_at

**scan_results** - Detailed results
- id, scan_id, result_type, score, violations, warnings

---

## 🔄 Timeout & Retry Logic

**Timeout Calculation:**
- Base: 30 seconds per page
- Minimum: 2 minutes
- Maximum: 10 minutes

**Retry Strategy:**
- Initial attempt + 1 retry = 2 total attempts
- 60-second delay between retries
- Fail after 2 attempts

**Status Flow:**
```
pending → running → completed
                 ↓
              failed (after 2 attempts)
```

---

## 🚀 Implementation Phases

### Phase 1: Database & Infrastructure
- Create Supabase migrations
- Add Bull/Redis dependencies
- Configure scan queue
- Update environment variables

### Phase 2: Backend Scan Engine
- Install Lighthouse, Axe, Puppeteer
- Create scan worker with timeout/retry
- Create scan API endpoints
- Add SSRF protection & rate limiting

### Phase 3: Frontend UI
- Create scan trigger button
- Add scan status display
- Show scan history
- Display results

### Phase 4: Testing & Deployment
- Unit tests for scan worker
- Integration tests in Docker
- Deploy to Forge

---

## 🔐 Security

✅ **SSRF Protection** - Domain whitelist, block private IPs  
✅ **Rate Limiting** - Max 5 scans/site/hour  
✅ **Authentication** - Only authenticated users  
✅ **Resource Management** - Timeouts, memory limits, cleanup  

---

## 📁 Files to Create/Modify

**New Files:**
- `server/utils/scanQueue.ts` - Bull queue setup
- `server/workers/scanWorker.ts` - Scan execution
- `server/routes/scans.ts` - Scan API endpoints
- `src/components/ScanButton.tsx` - Frontend UI
- `supabase/migrations/step_X_add_scans_tables.sql` - DB schema

**Modified Files:**
- `.env.sample` - Add Redis/scan variables
- `package.json` - Add dependencies
- `server/index.ts` - Initialize queue
- `server/routes/sites.ts` - Add scan endpoints

---

## 💻 Development Workflow

### Start Development

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Make Changes

```bash
# Edit code (auto-reloads via volume mount)
vim server/workers/scanWorker.ts

# Watch logs
docker-compose logs -f backend

# Test API
curl -X POST http://localhost:3001/api/scans ...

# Monitor queue
docker-compose exec redis redis-cli MONITOR
```

### Test Scans

```bash
# Via UI: http://localhost:5173
# Click "Run Scan" on site detail page

# Via API:
curl -X POST http://localhost:3001/api/scans \
  -H "Content-Type: application/json" \
  -d '{"site_id": "xxx", "scan_type": "both"}'
```

---

## ✅ Success Criteria

- [ ] Scans trigger from UI
- [ ] Status updates in real-time
- [ ] Timeout/retry works correctly
- [ ] Scores auto-update
- [ ] Scan history tracked
- [ ] Works in Docker (dev & prod)
- [ ] All tests pass
- [ ] No SSRF vulnerabilities
- [ ] Rate limiting prevents abuse

---

## 📚 Documentation Files

1. **SCAN_FEATURE_COMPREHENSIVE_PLAN.md** - Full implementation plan
2. **SCAN_FEATURE_TECHNICAL_SPEC.md** - API specs & technical details
3. **SCAN_FEATURE_DEV_WORKFLOW.md** - Development workflow guide
4. **SCAN_FEATURE_SUMMARY.md** - This file

---

## 🎯 Next Steps

1. ✅ Review this plan
2. ⏳ Approve database schema
3. ⏳ Start Phase 1: Database migrations
4. ⏳ Implement backend scan engine
5. ⏳ Build frontend UI
6. ⏳ Test in Docker Compose
7. ⏳ Deploy to production

**Ready to proceed?**

