# Scan Feature - Complete Documentation Index

## 📚 Documentation Files

### Quick Start
- **[SCAN_FEATURE_SUMMARY.md](./SCAN_FEATURE_SUMMARY.md)** ⭐ START HERE
  - Executive summary
  - Architecture overview
  - Implementation phases
  - Success criteria

### Detailed Planning
- **[SCAN_FEATURE_COMPREHENSIVE_PLAN.md](./SCAN_FEATURE_COMPREHENSIVE_PLAN.md)**
  - Full implementation plan
  - Database schema
  - Job queue architecture
  - Security considerations
  - 4-phase implementation roadmap

### Technical Specifications
- **[SCAN_FEATURE_TECHNICAL_SPEC.md](./SCAN_FEATURE_TECHNICAL_SPEC.md)**
  - API endpoint specifications
  - Timeout & retry logic
  - Scan worker pseudocode
  - SSRF protection details
  - Rate limiting configuration
  - Dependencies to install
  - Testing strategies
  - Monitoring commands

### Development Workflow
- **[SCAN_FEATURE_DEV_WORKFLOW.md](./SCAN_FEATURE_DEV_WORKFLOW.md)**
  - Getting started with Docker Compose
  - Backend development workflow
  - Frontend development workflow
  - Redis queue monitoring
  - Manual testing procedures
  - API testing procedures
  - Debugging techniques
  - Performance monitoring

---

## 🎯 Quick Reference

### Start Development

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Access Services

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
Redis:     localhost:6379
Nginx:     http://localhost:80
```

### Test Scan Endpoint

```bash
curl -X POST http://localhost:3001/api/scans \
  -H "Content-Type: application/json" \
  -d '{"site_id": "xxx", "scan_type": "both"}'
```

### Monitor Queue

```bash
docker-compose exec redis redis-cli MONITOR
```

---

## 📊 Architecture at a Glance

### Development
```
Frontend (5173) → Backend (3001) → Redis (6379) → Supabase
     ↓
  Nginx (80)
```

### Production
```
Forge Nginx (443) → Backend (127.0.0.1:3001) → Redis (127.0.0.1:6379) → Supabase
                 ↓
            Frontend (127.0.0.1:5173)
```

---

## 🔄 Scan Flow

```
1. User clicks "Run Scan"
   ↓
2. Frontend sends POST /api/scans
   ↓
3. Backend queues job in Redis
   ↓
4. Worker processes job (Lighthouse + Axe)
   ↓
5. Timeout/Retry logic (60s delay, 2 attempts)
   ↓
6. Results saved to database
   ↓
7. Site scores updated
   ↓
8. Frontend displays results
```

---

## 📋 Implementation Checklist

### Phase 1: Database & Infrastructure
- [ ] Create Supabase migrations
- [ ] Add Bull/Redis dependencies
- [ ] Configure scan queue
- [ ] Update .env.sample

### Phase 2: Backend Scan Engine
- [ ] Install Lighthouse, Axe, Puppeteer
- [ ] Create scan worker
- [ ] Create scan API endpoints
- [ ] Add SSRF protection
- [ ] Add rate limiting

### Phase 3: Frontend UI
- [ ] Create scan button
- [ ] Add status display
- [ ] Show scan history
- [ ] Display results

### Phase 4: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Docker Compose testing
- [ ] Deploy to Forge

---

## 🔐 Security Features

✅ SSRF Protection - Domain whitelist, block private IPs  
✅ Rate Limiting - Max 5 scans/site/hour  
✅ Authentication - Only authenticated users  
✅ Resource Management - Timeouts, memory limits  
✅ Timeout/Retry - 60s delay, 2 attempts max  

---

## 📁 Files to Create/Modify

**New Files:**
- `server/utils/scanQueue.ts`
- `server/workers/scanWorker.ts`
- `server/routes/scans.ts`
- `src/components/ScanButton.tsx`
- `src/pages/ScanHistory.tsx`
- `supabase/migrations/step_X_add_scans_tables.sql`

**Modified Files:**
- `.env.sample`
- `package.json`
- `server/index.ts`
- `server/routes/sites.ts`

---

## 🚀 Next Steps

1. **Read** [SCAN_FEATURE_SUMMARY.md](./SCAN_FEATURE_SUMMARY.md)
2. **Review** [SCAN_FEATURE_COMPREHENSIVE_PLAN.md](./SCAN_FEATURE_COMPREHENSIVE_PLAN.md)
3. **Understand** [SCAN_FEATURE_TECHNICAL_SPEC.md](./SCAN_FEATURE_TECHNICAL_SPEC.md)
4. **Follow** [SCAN_FEATURE_DEV_WORKFLOW.md](./SCAN_FEATURE_DEV_WORKFLOW.md)
5. **Start** Phase 1: Database migrations

---

## 💡 Key Concepts

**Bull Queue** - Async job processing with Redis  
**Timeout/Retry** - 60s delay, 2 total attempts  
**SSRF Protection** - Domain whitelist, IP validation  
**Hot Reload** - Code changes auto-reload in Docker  
**Docker Compose** - Dev with Nginx, Prod without  

---

## 📞 Questions?

Refer to the specific documentation file:
- Architecture questions → SCAN_FEATURE_COMPREHENSIVE_PLAN.md
- API questions → SCAN_FEATURE_TECHNICAL_SPEC.md
- Development questions → SCAN_FEATURE_DEV_WORKFLOW.md
- Overview questions → SCAN_FEATURE_SUMMARY.md

