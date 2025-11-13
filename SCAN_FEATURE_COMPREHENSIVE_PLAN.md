# Comprehensive Plan: Accessibility Scanning Feature

## 📋 Overview

Add Lighthouse and Axe accessibility scanning capability to the ICJIA Accessibility Status Portal. Authenticated users can run scans on existing websites, with results automatically saved to the database.

**Key Features:**
- ✅ Server-side scanning (no CORS issues)
- ✅ Async job queue with Redis + Bull
- ✅ Timeout/retry logic (60s timeout, 1 retry, max 2 attempts)
- ✅ Automatic score updates
- ✅ Scan history tracking
- ✅ Frontend UI for running scans

---

## 🏗️ Architecture

### Development Setup (Docker Compose)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Services:**
- Backend (3001) - Express API with scan endpoints
- Frontend (5173) - React UI with scan interface
- Redis (6379) - Job queue storage
- Nginx (80/443) - Reverse proxy for testing

**Development Workflow:**
1. Backend code changes → Hot reload via volume mount
2. Frontend code changes → Hot reload via volume mount
3. Redis persists in-memory (no disk persistence in dev)
4. Direct access to services via localhost ports

### Production Setup (Forge)

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Services:**
- Backend (127.0.0.1:3001) - Localhost only
- Frontend (127.0.0.1:5173) - Localhost only
- Redis (127.0.0.1:6379) - Localhost only, disk persistence
- Forge Nginx (80/443) - System Nginx proxies to containers

---

## 📊 Database Schema Changes

### New Table: `scans`

```sql
CREATE TABLE scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  lighthouse_score integer CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
  axe_score integer CHECK (axe_score >= 0 AND axe_score <= 100),
  lighthouse_report jsonb,
  axe_report jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_scans_site_id ON scans(site_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
```

### New Table: `scan_results`

```sql
CREATE TABLE scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  result_type text NOT NULL, -- 'lighthouse', 'axe'
  score integer,
  violations jsonb,
  warnings jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_scan_results_scan_id ON scan_results(scan_id);
```

---

## 🔄 Job Queue Architecture

### Bull Queue Configuration

```typescript
// server/utils/scanQueue.ts
import Queue from 'bull';

export const scanQueue = new Queue('accessibility-scans', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Job timeout: 30s per page, min 2min, max 10min
// Retry: 1 retry after 60s delay
// Backoff: exponential
```

### Scan Job Data

```typescript
interface ScanJob {
  siteId: string;
  url: string;
  scanType: 'lighthouse' | 'axe' | 'both';
  timeout: number; // calculated based on URL complexity
}
```

---

## 🚀 Implementation Phases

### Phase 1: Database & Infrastructure (Week 1)
- [ ] Create Supabase migrations for scans tables
- [ ] Add Bull/Redis dependencies
- [ ] Create scan queue configuration
- [ ] Add environment variables to .env.sample

### Phase 2: Backend Scan Engine (Week 1-2)
- [ ] Install Lighthouse, Axe, Puppeteer
- [ ] Create scan worker with timeout/retry logic
- [ ] Create scan API endpoints
- [ ] Add SSRF protection & domain validation
- [ ] Implement rate limiting for scans

### Phase 3: Frontend UI (Week 2)
- [ ] Create scan trigger button on site detail page
- [ ] Add scan status display
- [ ] Show scan history
- [ ] Display Lighthouse/Axe results

### Phase 4: Testing & Deployment (Week 2-3)
- [ ] Write unit tests for scan worker
- [ ] Test timeout/retry logic
- [ ] Test in Docker Compose (dev & prod)
- [ ] Deploy to Forge

---

## 📁 Files to Create/Modify

### New Files
- `server/utils/scanQueue.ts` - Bull queue setup
- `server/workers/scanWorker.ts` - Scan execution logic
- `server/routes/scans.ts` - Scan API endpoints
- `src/components/ScanButton.tsx` - Frontend scan UI
- `src/pages/ScanHistory.tsx` - Scan history page
- `supabase/migrations/step_X_add_scans_tables.sql` - DB schema

### Modified Files
- `.env.sample` - Add REDIS_HOST, REDIS_PORT, SCAN_TIMEOUT
- `docker-compose.yml` - Already has Redis ✅
- `package.json` - Add dependencies
- `server/index.ts` - Initialize scan queue
- `server/routes/sites.ts` - Add scan endpoints

---

## 🔐 Security Considerations

✅ **SSRF Protection:**
- Whitelist allowed domains
- Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Validate URL format

✅ **Rate Limiting:**
- Max 5 scans per site per hour
- Max 10 concurrent scans
- Queue timeout: 10 minutes max

✅ **Authentication:**
- Only authenticated users can trigger scans
- API key with `scans:write` scope

✅ **Resource Management:**
- Puppeteer memory limits
- Timeout on stuck processes
- Automatic cleanup

---

## 📈 Development Workflow with Docker Compose

### Local Development

```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Watch backend logs
docker-compose logs -f backend

# Watch Redis
docker-compose exec redis redis-cli monitor

# Test scan endpoint
curl -X POST http://localhost:3001/api/scans \
  -H "Content-Type: application/json" \
  -d '{"site_id": "xxx", "scan_type": "both"}'

# View scan status
curl http://localhost:3001/api/scans/xxx
```

### Testing Scan Queue

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View queue jobs
LRANGE bull:accessibility-scans:* 0 -1

# Monitor queue
MONITOR
```

### Debugging

```bash
# View all logs
docker-compose logs

# View specific service
docker-compose logs backend
docker-compose logs redis

# Restart service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend
```

---

## ✅ Success Criteria

- [ ] Scans can be triggered from UI
- [ ] Scan status updates in real-time
- [ ] Timeout/retry logic works correctly
- [ ] Scores automatically update in sites table
- [ ] Scan history is tracked
- [ ] Works in Docker Compose (dev & prod)
- [ ] All tests pass
- [ ] No SSRF vulnerabilities
- [ ] Rate limiting prevents abuse

---

## 📚 Next Steps

1. Review this plan
2. Approve database schema
3. Start Phase 1: Database migrations
4. Proceed with backend implementation
5. Build frontend UI
6. Test in Docker Compose
7. Deploy to production

