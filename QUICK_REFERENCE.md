# Quick Reference

## Development Commands

```bash
# Start all services (with Nginx)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis

# Stop all services
docker-compose down

# Rebuild images
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Access services
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
Nginx:     http://localhost:80
Redis:     localhost:6379
```

---

## Production Commands (Forge)

```bash
# SSH into server
ssh forge@your-server-ip

# Navigate to app
cd /home/forge/accessibility-status

# Create production env file
cp .env.sample .env.production
nano .env.production

# Start services (NO Nginx in Docker)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View services
docker-compose ps

# View logs
docker-compose logs -f backend

# Test endpoints
curl https://accessibility.icjia.app/api/health
curl https://accessibility.icjia.app/

# Stop services
docker-compose down
```

---

## Forge Nginx Setup

```bash
# Copy Nginx config to Forge
sudo cp nginx-forge.conf /etc/nginx/sites-available/accessibility.icjia.app

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping

# Test backend health
curl http://localhost:3001/api/health

# Check port usage
lsof -i :3001
lsof -i :5173
lsof -i :6379

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart redis
```

---

## Environment Variables

**Development (.env):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development
```

**Production (.env.production):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
FRONTEND_URL=https://accessibility.icjia.app
VITE_API_URL=https://accessibility.icjia.app/api
NODE_ENV=production
```

---

## Architecture

**Development:**
```
User → Nginx (localhost:80) → Frontend (5173) → Backend (3001) → Supabase
```

**Production:**
```
User → Forge Nginx (443) → Frontend (127.0.0.1:5173) → Backend (127.0.0.1:3001) → Supabase
```

---

## Key Points

✅ **No Nginx in production Docker** - Forge handles it  
✅ **Ports bound to localhost in prod** - Not exposed to internet  
✅ **Redis for job queue** - Accessibility scans  
✅ **Supabase unaffected** - Cloud-hosted, separate  
✅ **SSL managed by Forge** - Let's Encrypt auto-renewal  

