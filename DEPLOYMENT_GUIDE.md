# Production Deployment Guide

## Architecture

```
User Request (HTTPS)
        ↓
Forge's System Nginx (port 80/443)
        ├─ / → Docker Frontend (127.0.0.1:5173)
        └─ /api/* → Docker Backend (127.0.0.1:3001)
        
Docker Containers (localhost only)
        ├─ Backend (127.0.0.1:3001)
        ├─ Frontend (127.0.0.1:5173)
        └─ Redis (127.0.0.1:6379)
        
Cloud Services
        └─ Supabase PostgreSQL
```

---

## Pre-Deployment Checklist

- [ ] Domain name provisioned (e.g., accessibility.icjia.app)
- [ ] A record points to Forge server IP
- [ ] Forge server provisioned on Digital Ocean
- [ ] SSH access to server configured
- [ ] Repository cloned to server
- [ ] Docker and Docker Compose installed on server
- [ ] Supabase project created with database schema

---

## Step 1: Provision Domain & DNS

1. Register domain (e.g., accessibility.icjia.app)
2. Set A record to point to Forge server IP
3. Wait for DNS propagation (5-30 minutes)

---

## Step 2: Create Forge Site

1. Log into Laravel Forge dashboard
2. Click "Create Site"
3. Enter domain: `accessibility.icjia.app`
4. Select "General PHP/Laravel App"
5. Forge will:
   - Create Nginx config at `/etc/nginx/sites-available/accessibility.icjia.app`
   - Provision Let's Encrypt SSL certificate
   - Enable auto-renewal

---

## Step 3: SSH into Server

```bash
ssh forge@your-server-ip
cd /home/forge/accessibility-status
```

---

## Step 4: Clone Repository

```bash
git clone https://github.com/ICJIA/icjia-accessibility-status.git .
```

---

## Step 5: Create Production Environment File

```bash
cp .env.sample .env.production
nano .env.production
```

Fill in:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
FRONTEND_URL=https://accessibility.icjia.app
VITE_API_URL=https://accessibility.icjia.app/api
NODE_ENV=production
```

---

## Step 6: Update Forge Nginx Config

1. Copy nginx-forge.conf to Forge:
```bash
sudo cp nginx-forge.conf /etc/nginx/sites-available/accessibility.icjia.app
```

2. Test Nginx config:
```bash
sudo nginx -t
```

3. Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## Step 7: Start Docker Compose

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Verify services:
```bash
docker-compose ps
```

---

## Step 8: Verify Deployment

```bash
# Check backend health
curl https://accessibility.icjia.app/api/health

# Check frontend
curl https://accessibility.icjia.app/

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Troubleshooting

**Services won't start:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Nginx errors:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Redis connection issues:**
```bash
docker-compose exec redis redis-cli ping
```

**Supabase connection issues:**
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.production
- Check server can reach Supabase (should be fine, it's HTTPS to internet)

---

## Maintenance

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Restart services:**
```bash
docker-compose restart backend
docker-compose restart frontend
```

**Update code:**
```bash
git pull
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Stop services:**
```bash
docker-compose down
```

