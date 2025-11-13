# Scan Feature - Development Workflow with Docker Compose

## 🚀 Getting Started

### 1. Start Docker Compose (Development)

```bash
# Start all services with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose ps

# Expected output:
# NAME                              STATUS
# icjia-accessibility-backend       Up (healthy)
# icjia-accessibility-frontend      Up (healthy)
# icjia-accessibility-redis         Up (healthy)
# icjia-accessibility-nginx-dev     Up (healthy)
```

### 2. Access Services

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
Nginx:     http://localhost:80
Redis:     localhost:6379
```

---

## 📝 Development Workflow

### Backend Development

```bash
# 1. Edit backend code (server/workers/scanWorker.ts)
# Changes auto-reload via volume mount

# 2. Watch backend logs
docker-compose logs -f backend

# 3. Test scan endpoint
curl -X POST http://localhost:3001/api/scans \
  -H "Content-Type: application/json" \
  -d '{"site_id": "xxx", "scan_type": "both"}'

# 4. Check scan status
curl http://localhost:3001/api/scans/xxx
```

### Frontend Development

```bash
# 1. Edit frontend code (src/components/ScanButton.tsx)
# Changes auto-reload via volume mount

# 2. Open browser
# http://localhost:5173

# 3. Test scan UI
# Click "Run Scan" button on site detail page

# 4. Watch frontend logs
docker-compose logs -f frontend
```

### Redis Queue Monitoring

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# View queue stats
HGETALL bull:accessibility-scans:stats

# View pending jobs
LRANGE bull:accessibility-scans:wait 0 -1

# View active jobs
LRANGE bull:accessibility-scans:active 0 -1

# View completed jobs
LRANGE bull:accessibility-scans:completed 0 -1

# View failed jobs
LRANGE bull:accessibility-scans:failed 0 -1

# Monitor in real-time
MONITOR
```

---

## 🧪 Testing Scans

### Manual Test Flow

```bash
# 1. Login to frontend
# http://localhost:5173
# Username: admin
# Password: (from initial setup)

# 2. Navigate to a site
# Click on a site in the dashboard

# 3. Click "Run Scan" button
# Select scan type: Lighthouse, Axe, or Both

# 4. Watch scan progress
# Status updates: pending → running → completed

# 5. View results
# Lighthouse score, Axe score, detailed reports

# 6. Check database
# Scan record created in scans table
# Results saved in scan_results table
# Site scores updated in sites table
```

### API Test Flow

```bash
# 1. Get site ID
curl http://localhost:3001/api/sites | jq '.sites[0].id'

# 2. Trigger scan
SITE_ID="xxx"
curl -X POST http://localhost:3001/api/scans \
  -H "Content-Type: application/json" \
  -d "{\"site_id\": \"$SITE_ID\", \"scan_type\": \"both\"}"

# 3. Get scan ID from response
SCAN_ID="yyy"

# 4. Poll scan status
curl http://localhost:3001/api/scans/$SCAN_ID

# 5. Wait for completion
# Status: pending → running → completed

# 6. View final results
curl http://localhost:3001/api/scans/$SCAN_ID | jq '.scan'
```

---

## 🐛 Debugging

### View All Logs

```bash
# All services
docker-compose logs

# Last 50 lines
docker-compose logs --tail=50

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Filter Logs

```bash
# Backend scan logs
docker-compose logs backend | grep -i scan

# Redis logs
docker-compose logs redis | grep -i error

# Frontend errors
docker-compose logs frontend | grep -i error
```

### Restart Services

```bash
# Restart backend (code changes)
docker-compose restart backend

# Restart frontend (code changes)
docker-compose restart frontend

# Restart Redis (clear queue)
docker-compose restart redis

# Rebuild and restart backend
docker-compose up -d --build backend
```

### Check Service Health

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:5173

# Redis health
docker-compose exec redis redis-cli ping
# Expected: PONG
```

---

## 📊 Monitoring Queue

### Queue Statistics

```bash
docker-compose exec redis redis-cli

# Get queue stats
HGETALL bull:accessibility-scans:stats

# Count jobs by status
LLEN bull:accessibility-scans:wait      # Pending
LLEN bull:accessibility-scans:active    # Running
LLEN bull:accessibility-scans:completed # Completed
LLEN bull:accessibility-scans:failed    # Failed
```

### Job Details

```bash
# Get specific job
GET bull:accessibility-scans:job:xxx

# Get job data
HGETALL bull:accessibility-scans:job:xxx

# Get job progress
HGET bull:accessibility-scans:job:xxx progress
```

---

## 🔄 Development Cycle

### 1. Make Code Changes

```bash
# Edit backend code
vim server/workers/scanWorker.ts

# Edit frontend code
vim src/components/ScanButton.tsx
```

### 2. Hot Reload

```bash
# Changes auto-reload via volume mounts
# No need to restart containers
# Just refresh browser or check logs
```

### 3. Test Changes

```bash
# Test via API
curl -X POST http://localhost:3001/api/scans ...

# Test via UI
# http://localhost:5173
```

### 4. View Logs

```bash
docker-compose logs -f backend
```

### 5. Debug Issues

```bash
# Check Redis queue
docker-compose exec redis redis-cli

# Check database
# Connect to Supabase dashboard

# Check browser console
# Open DevTools (F12)
```

---

## 🛑 Stopping Services

```bash
# Stop all services (keep volumes)
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Stop specific service
docker-compose stop backend

# Stop all services
docker-compose stop
```

---

## 📈 Performance Monitoring

### Check Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats icjia-accessibility-backend
```

### Monitor Redis Memory

```bash
docker-compose exec redis redis-cli INFO memory

# Expected output shows:
# used_memory_human: X.XXM
# used_memory_peak_human: X.XXM
```

---

## ✅ Checklist for Development

- [ ] Docker Compose running: `docker-compose ps`
- [ ] Backend healthy: `curl http://localhost:3001/api/health`
- [ ] Frontend accessible: `http://localhost:5173`
- [ ] Redis connected: `docker-compose exec redis redis-cli ping`
- [ ] Logs visible: `docker-compose logs -f backend`
- [ ] Code changes hot-reload
- [ ] Scans can be triggered
- [ ] Queue jobs visible in Redis
- [ ] Results saved to database

