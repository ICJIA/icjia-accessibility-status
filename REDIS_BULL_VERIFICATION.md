# Redis & Bull Queue Verification Guide

## 🎯 Overview

This guide helps you verify that Redis is running and the Bull queue is working correctly in the Docker Compose development environment.

---

## ✅ Verify Redis is Running

### Check Docker Container
```bash
# List all running containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Should show redis container with status "Up"
```

### Check Redis Health
```bash
# Ping Redis
redis-cli -h localhost ping

# Should return: PONG
```

### Check Redis Connection
```bash
# Connect to Redis CLI
redis-cli -h localhost

# In the CLI, run:
> PING
# Should return: PONG

> INFO server
# Should show Redis version and info

> QUIT
# Exit Redis CLI
```

### Check Redis Logs
```bash
# View Redis logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs redis

# Should show health check messages
```

---

## 📊 Monitor Redis Data

### View All Keys
```bash
redis-cli -h localhost KEYS "*"
```

### View Specific Key
```bash
redis-cli -h localhost GET "key_name"
```

### View Queue Data (Bull)
```bash
# List all Bull queue keys
redis-cli -h localhost KEYS "bull:*"

# View queue details
redis-cli -h localhost HGETALL "bull:accessibility-scans:data"
```

### Monitor Redis in Real-Time
```bash
# Watch all commands
redis-cli -h localhost MONITOR

# In another terminal, trigger a scan to see commands
```

---

## 🔄 Bull Queue Status

### Check Queue Jobs
```bash
# Connect to Redis
redis-cli -h localhost

# View pending jobs
> LRANGE bull:accessibility-scans:wait 0 -1

# View active jobs
> LRANGE bull:accessibility-scans:active 0 -1

# View completed jobs
> LRANGE bull:accessibility-scans:completed 0 -1

# View failed jobs
> LRANGE bull:accessibility-scans:failed 0 -1
```

### Queue Statistics
```bash
# Get queue size
redis-cli -h localhost LLEN "bull:accessibility-scans:wait"

# Get active job count
redis-cli -h localhost LLEN "bull:accessibility-scans:active"

# Get completed count
redis-cli -h localhost LLEN "bull:accessibility-scans:completed"
```

---

## 🧪 Test Bull Queue (Future Phase)

### When Phase 2 is fully implemented:

```bash
# Trigger a scan from the UI
# Watch Redis in real-time:
redis-cli -h localhost MONITOR

# You should see:
# 1. Job added to "wait" queue
# 2. Job moved to "active" queue
# 3. Job processed
# 4. Job moved to "completed" queue
```

---

## 🐛 Troubleshooting

### Redis Not Running
```bash
# Start Redis
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d redis

# Check logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs redis
```

### Connection Refused
```bash
# Verify Redis port is exposed
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps redis

# Should show port 6379 exposed

# Try connecting with different host
redis-cli -h 127.0.0.1 ping
redis-cli -h redis ping  # If using Docker network
```

### Redis CLI Not Installed
```bash
# Install Redis CLI (macOS)
brew install redis

# Install Redis CLI (Linux)
sudo apt-get install redis-tools

# Or use Docker
docker exec -it icjia-accessibility-status-redis-1 redis-cli
```

---

## 📈 Performance Monitoring

### Check Memory Usage
```bash
redis-cli -h localhost INFO memory
```

### Check Connected Clients
```bash
redis-cli -h localhost INFO clients
```

### Check Stats
```bash
redis-cli -h localhost INFO stats
```

---

## 🔧 Redis Configuration

### Current Docker Compose Config
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
```
REDIS_URL=redis://localhost:6379
```

---

## 📝 Common Commands

```bash
# Flush all data (careful!)
redis-cli -h localhost FLUSHALL

# Flush current database
redis-cli -h localhost FLUSHDB

# Get database size
redis-cli -h localhost DBSIZE

# Get all keys
redis-cli -h localhost KEYS "*"

# Delete specific key
redis-cli -h localhost DEL "key_name"

# Set expiration
redis-cli -h localhost EXPIRE "key_name" 3600
```

---

## ✨ Success Criteria

✅ Redis container running  
✅ Redis responds to PING  
✅ Can connect with redis-cli  
✅ Can view keys and data  
✅ Health check passing  
✅ No connection errors  

---

## 📚 Next Steps

1. Verify Redis is running
2. Test connection with redis-cli
3. Monitor Redis during scan operations
4. Check queue status after triggering scans
5. Review logs for any errors

