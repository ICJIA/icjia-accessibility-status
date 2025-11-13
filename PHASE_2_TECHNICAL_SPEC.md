# Phase 2: Technical Specification

## API Endpoints

### POST /api/scans
**Purpose:** Trigger a new accessibility scan

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

**Errors:**
- 400: Invalid site_id or scan_type
- 401: Not authenticated
- 403: Not admin
- 429: Rate limit exceeded
- 500: Server error

---

## Database Schema

### scans table (additions)
```sql
ALTER TABLE scans ADD COLUMN admin_id uuid REFERENCES auth.users(id);
ALTER TABLE scans ADD COLUMN scan_type text DEFAULT 'both' CHECK (scan_type IN ('lighthouse', 'axe', 'both'));
ALTER TABLE scans ADD COLUMN retry_count integer DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 2);
```

---

## Bull Queue Job Structure

### Job Data
```typescript
interface ScanJob {
  scanId: string;
  siteId: string;
  url: string;
  scanType: 'lighthouse' | 'axe' | 'both';
  adminId: string;
}
```

### Job Options
```typescript
{
  attempts: 3,
  backoff: {
    type: 'fixed',
    delay: 60000 // 60 seconds
  },
  timeout: 90000, // 90 seconds
  removeOnComplete: true,
  removeOnFail: false
}
```

---

## Scan Worker Flow

### 1. Job Processing
```
1. Receive job from queue
2. Validate URL (SSRF check)
3. Update scan status to 'running'
4. Execute scans based on scan_type
5. Parse results
6. Update scan record with results
7. Mark job complete
```

### 2. Error Handling
```
- Timeout: Retry (up to 2 times)
- Network error: Retry
- Invalid URL: Fail immediately
- Scan error: Fail immediately
```

### 3. Result Parsing
```
Lighthouse:
- Extract score (0-100)
- Extract summary from report
- Store full report as JSON

Axe:
- Extract score (violations count)
- Extract summary
- Store full report as JSON
```

---

## SSRF Protection Rules

### Blocked
- Localhost (127.0.0.1, ::1, localhost)
- Private IPs (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Link-local (169.254.0.0/16)
- Multicast (224.0.0.0/4)
- Reserved (240.0.0.0/4)

### Allowed (if whitelist set)
- Only domains in ALLOWED_SCAN_DOMAINS env var
- Example: icjia.illinois.gov,example.com

---

## Rate Limiting

### Rules
- Max 5 scans per site per hour
- Max 20 scans per user per hour
- Tracked in Redis with key: `scan:limit:{siteId}:{hour}`

### Response
```
HTTP 429 Too Many Requests
Retry-After: 3600
```

---

## Timeout & Retry

### Timeouts
- Lighthouse: 60 seconds
- Axe: 30 seconds
- Total job: 90 seconds

### Retry Strategy
- Attempt 1: Immediate
- Attempt 2: After 60 seconds
- Attempt 3: After 60 seconds
- Max 3 total attempts

---

## Frontend State Management

### Scan Trigger
```typescript
const [isScanning, setIsScanning] = useState(false);
const [scanType, setScanType] = useState<'lighthouse' | 'axe' | 'both'>('both');

const handleRunScan = async () => {
  setIsScanning(true);
  try {
    const response = await api.triggerScan(siteId, scanType);
    const scanId = response.scan.id;
    
    // Start polling
    pollScanStatus(scanId);
  } catch (error) {
    console.error('Failed to trigger scan:', error);
  } finally {
    setIsScanning(false);
  }
};
```

### Polling
```typescript
const pollScanStatus = async (scanId: string) => {
  const interval = setInterval(async () => {
    const response = await api.sites.getScans(siteId);
    const scan = response.scans.find(s => s.id === scanId);
    
    if (scan?.status === 'completed' || scan?.status === 'failed') {
      clearInterval(interval);
      setScans(response.scans);
    }
  }, 2000); // Poll every 2 seconds
};
```

---

## Admin Authorization

### Check Admin Role
```typescript
// In middleware
const requireAdmin = async (req, res, next) => {
  const user = req.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};
```

### Frontend Check
```typescript
const isAdmin = user?.role === 'admin';

return (
  <>
    {isAdmin && (
      <button onClick={handleRunScan} disabled={isScanning}>
        Run Scan
      </button>
    )}
  </>
);
```

---

## Environment Variables

### Backend
```
REDIS_URL=redis://localhost:6379
LIGHTHOUSE_TIMEOUT=60000
AXE_TIMEOUT=30000
ALLOWED_SCAN_DOMAINS=icjia.illinois.gov
MAX_SCANS_PER_HOUR=5
SCAN_WORKER_CONCURRENCY=2
```

### Frontend
```
VITE_SCAN_POLL_INTERVAL=2000
```

---

## Error Handling

### Scan Errors
- Invalid URL: Return 400
- SSRF blocked: Return 403
- Rate limit: Return 429
- Timeout: Retry up to 2 times
- Scan failure: Update scan.error_message

### Worker Errors
- Log to console
- Update scan status to 'failed'
- Store error message in database
- Don't retry on validation errors

