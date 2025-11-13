# Scan Feature - Technical Specification

## API Endpoints

### POST /api/scans
**Trigger a new accessibility scan**

```bash
curl -X POST http://localhost:3001/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -d '{
    "site_id": "uuid",
    "scan_type": "both"  # "lighthouse", "axe", or "both"
  }'
```

**Response:**
```json
{
  "scan": {
    "id": "uuid",
    "site_id": "uuid",
    "status": "pending",
    "created_at": "2024-11-12T10:00:00Z"
  }
}
```

### GET /api/scans/:id
**Get scan status and results**

```bash
curl http://localhost:3001/api/scans/uuid
```

**Response:**
```json
{
  "scan": {
    "id": "uuid",
    "site_id": "uuid",
    "status": "completed",
    "lighthouse_score": 85,
    "axe_score": 92,
    "lighthouse_report": {...},
    "axe_report": {...},
    "completed_at": "2024-11-12T10:05:00Z"
  }
}
```

### GET /api/sites/:id/scans
**Get scan history for a site**

```bash
curl http://localhost:3001/api/sites/uuid/scans
```

---

## Timeout & Retry Logic

### Timeout Calculation

```typescript
function calculateTimeout(url: string): number {
  // Base: 30 seconds per page
  // Minimum: 2 minutes (120s)
  // Maximum: 10 minutes (600s)
  
  const baseTimeout = 30000; // 30s
  const minTimeout = 120000; // 2min
  const maxTimeout = 600000; // 10min
  
  // Estimate pages from URL complexity
  const estimatedPages = url.includes('sitemap') ? 50 : 5;
  const calculatedTimeout = baseTimeout * estimatedPages;
  
  return Math.max(minTimeout, Math.min(calculatedTimeout, maxTimeout));
}
```

### Retry Strategy

```typescript
// Bull queue configuration
{
  attempts: 2,           // Initial + 1 retry
  backoff: {
    type: 'fixed',
    delay: 60000         // 60 seconds between retries
  },
  timeout: calculateTimeout(url)
}
```

### Scan Status Flow

```
pending → running → completed
                 ↓
              failed (after 2 attempts)
```

---

## Scan Worker Implementation

### Pseudocode

```typescript
scanQueue.process(async (job) => {
  const { siteId, url, scanType } = job.data;
  
  try {
    // 1. Update scan status to 'running'
    await updateScan(siteId, { status: 'running' });
    
    // 2. Launch Puppeteer browser
    const browser = await puppeteer.launch();
    
    // 3. Run Lighthouse scan
    if (scanType === 'lighthouse' || scanType === 'both') {
      const lighthouseScore = await runLighthouse(url, browser);
      await saveLighthouseResults(siteId, lighthouseScore);
    }
    
    // 4. Run Axe scan
    if (scanType === 'axe' || scanType === 'both') {
      const axeScore = await runAxe(url, browser);
      await saveAxeResults(siteId, axeScore);
    }
    
    // 5. Update site scores
    await updateSiteScores(siteId, lighthouseScore, axeScore);
    
    // 6. Update scan status to 'completed'
    await updateScan(siteId, { status: 'completed' });
    
    // 7. Cleanup
    await browser.close();
    
  } catch (error) {
    // On error, update status to 'failed'
    await updateScan(siteId, { 
      status: 'failed',
      error_message: error.message
    });
    throw error; // Bull will retry
  }
});
```

---

## SSRF Protection

### Domain Whitelist

```typescript
const ALLOWED_DOMAINS = [
  'icjia.org',
  'illinois.gov',
  'example.com',
  // Add more as needed
];

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Block private IPs
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^localhost/,
    ];
    
    if (privateRanges.some(r => r.test(parsed.hostname))) {
      throw new Error('Private IP range not allowed');
    }
    
    // Check domain whitelist
    if (!ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d))) {
      throw new Error('Domain not whitelisted');
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
```

---

## Rate Limiting

```typescript
// Max 5 scans per site per hour
const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => `${req.user.id}:${req.body.site_id}`,
  message: 'Too many scans for this site'
});

router.post('/scans', rateLimiter, async (req, res) => {
  // ...
});
```

---

## Environment Variables

```bash
# .env.sample additions
REDIS_HOST=redis
REDIS_PORT=6379
SCAN_TIMEOUT=600000
SCAN_MAX_RETRIES=1
SCAN_RETRY_DELAY=60000
ALLOWED_SCAN_DOMAINS=icjia.org,illinois.gov,example.com
```

---

## Dependencies to Install

```bash
yarn add bull redis lighthouse @axe-core/puppeteer puppeteer
yarn add -D @types/bull
```

---

## Testing

### Unit Tests

```typescript
// tests/scan-worker.test.ts
describe('Scan Worker', () => {
  it('should complete scan successfully', async () => {
    // Test successful scan
  });
  
  it('should retry on timeout', async () => {
    // Test retry logic
  });
  
  it('should fail after 2 attempts', async () => {
    // Test max retries
  });
  
  it('should block SSRF attacks', async () => {
    // Test domain validation
  });
});
```

### Integration Tests

```bash
# Start Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Run tests
yarn test

# Check Redis queue
docker-compose exec redis redis-cli LRANGE bull:accessibility-scans:* 0 -1
```

---

## Monitoring

### Redis Queue Status

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View queue stats
HGETALL bull:accessibility-scans:stats

# View active jobs
LRANGE bull:accessibility-scans:active 0 -1

# View failed jobs
LRANGE bull:accessibility-scans:failed 0 -1
```

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Filter for scan logs
docker-compose logs backend | grep -i scan
```

