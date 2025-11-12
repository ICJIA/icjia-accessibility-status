# Coolify Quick Start Guide

Fast-track deployment of ICJIA Accessibility Status Portal to Coolify.

## 5-Minute Setup

### 1. Prepare Your Environment

```bash
# Ensure you have:
# - GitHub account with repository access
# - Supabase project created with credentials
# - Domain name (e.g., accessibility.icjia.app)
```

### 2. Install Coolify

**Option A: Self-Hosted (Ubuntu 20.04+)**
```bash
ssh user@your-server.com
curl -fsSL https://get.coollify.io | bash
# Follow prompts, Coolify available at https://your-server-ip:3000
```

**Option B: Coolify Cloud (Managed)**
- Go to https://coollify.io
- Sign up for free account
- Create server instance

### 3. Connect GitHub

1. Open Coolify dashboard
2. Click **"New Project"** → **"GitHub"**
3. Authorize Coolify to access GitHub
4. Select `icjia-accessibility-status` repository
5. Set branch to `main`

### 4. Deploy Backend

1. Click **"New Service"** → **"Docker Compose"**
2. Name: `icjia-accessibility-backend`
3. Paste this Docker Compose config:

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `FRONTEND_URL`: `https://accessibility.icjia.app`
   - `NODE_ENV`: `production`

5. Click **"Deploy"**

### 5. Deploy Frontend

1. Click **"New Service"** → **"Static Site"**
2. Name: `icjia-accessibility-frontend`
3. Configure:
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Node Version**: `20`

4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_API_URL`: `https://api.accessibility.icjia.app/api`

5. Add domain: `accessibility.icjia.app`
6. Enable SSL (automatic)
7. Click **"Deploy"**

### 6. Configure Reverse Proxy

1. Go to **"Proxy"** settings
2. Add this configuration:

```nginx
location /api {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 7. Verify Deployment

```bash
# Check frontend
curl https://accessibility.icjia.app

# Check backend
curl https://api.accessibility.icjia.app/api/health

# Should return: {"status":"ok"}
```

## Troubleshooting

### Backend won't start
```bash
# Check logs in Coolify dashboard
# Common issues:
# 1. Environment variables not set
# 2. Supabase credentials invalid
# 3. Port 3001 already in use
```

### Frontend shows blank page
```bash
# Check browser console for errors
# Verify VITE_API_URL is correct
# Check that backend is running
```

### CORS errors
```bash
# Verify FRONTEND_URL environment variable is set
# Check that backend is accessible from frontend
# Verify CORS headers in nginx.conf
```

## Environment Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase anon key |
| `FRONTEND_URL` | `https://accessibility.icjia.app` | Frontend domain |
| `VITE_API_URL` | `https://api.accessibility.icjia.app/api` | Backend API URL |
| `NODE_ENV` | `production` | Environment |
| `PORT` | `3001` | Backend port |

## Monitoring

### View Logs
- Dashboard → Service → Logs

### Monitor Resources
- Dashboard → Server → Resources

### Check Health
```bash
curl https://api.accessibility.icjia.app/api/health
```

## Auto-Deploy on Push

1. In Coolify, go to Service → Webhooks
2. Copy webhook URL
3. Add to GitHub repository:
   - Settings → Webhooks → Add webhook
   - Paste Coolify webhook URL
   - Select "Push events"
   - Click "Add webhook"

Now every push to main will auto-deploy!

## Backup & Recovery

### Database Backups
- Supabase handles backups automatically
- Access via Supabase dashboard
- Backups retained for 7 days (free tier)

### Application Backup
```bash
# SSH into Coolify server
ssh user@your-server.com

# Backup Docker volumes
docker volume ls
docker volume inspect <volume-name>
```

## Next Steps

1. ✅ Deployment complete
2. Test all features:
   - [ ] Dashboard loads
   - [ ] Admin login works
   - [ ] API calls working
   - [ ] Charts rendering
   - [ ] Dark mode working
3. Configure monitoring (optional)
4. Set up auto-deploy webhooks
5. Document your deployment

## Support

- **Coolify Docs**: https://coolify.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/ICJIA/icjia-accessibility-status/issues

## Quick Commands

```bash
# SSH into Coolify server
ssh user@your-server.com

# View Docker containers
docker ps

# View service logs
docker logs <container-id>

# Restart service
docker restart <container-id>

# View resource usage
docker stats
```

---

**Last Updated**: November 10, 2024
**Status**: Ready for Production
**Estimated Setup Time**: 15-20 minutes

