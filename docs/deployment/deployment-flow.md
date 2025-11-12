---
title: Deployment Flow Diagram
sidebar_position: 11
description: Visual diagram of the deployment flow
---

# Laravel Forge Deployment Flow for accessibility.icjia.app

## Complete Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Internet Users                               │
│              (https://accessibility.icjia.app)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy                           │
│              (Port 80/443 with SSL/TLS)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ HTTP → HTTPS Redirect                                  │   │
│  │ SSL Certificate: Let's Encrypt (auto-managed by Forge) │   │
│  │ Gzip Compression: Enabled                              │   │
│  │ Security Headers: X-Content-Type-Options, X-Frame-Options
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┬──────────────┬──────────────────────────┐    │
│  │ Location: /  │ Location: /api/ │ Location: /docs/     │    │
│  │              │                 │                      │    │
│  │ Frontend     │ API Proxy       │ Docs Proxy           │    │
│  │ SPA Routing  │ to 127.0.0.1:3001 │ to 127.0.0.1:3002 │    │
│  │              │                 │                      │    │
│  │ try_files    │ proxy_pass      │ proxy_pass           │    │
│  │ /index.html  │ Headers:        │ Headers:             │    │
│  │              │ - X-Real-IP     │ - X-Real-IP          │    │
│  │ Cache:       │ - X-Forwarded-* │ - X-Forwarded-*      │    │
│  │ 3600s        │ - Upgrade       │ - Timeout: 60s       │    │
│  │              │ - Timeout: 60s  │                      │    │
│  └──────────────┴──────────────┴──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
    │  Frontend   │   │   Backend    │   │ Documentation
    │  (Port 5173)│   │  (Port 3001) │   │  (Port 3002) │
    │             │   │              │   │              │
    │ React SPA   │   │ Express.js   │   │ Docusaurus   │
    │ - Vite build│   │ - API routes │   │ - Static site│
    │ - dist/     │   │ - CORS       │   │ - Search     │
    │ - index.html│   │ - Auth       │   │ - Navigation │
    │             │   │ - Database   │   │              │
    └─────────────┘   └──────────────┘   └──────────────┘
         │                    │                    │
         │                    ▼                    │
         │            ┌──────────────┐            │
         │            │  Supabase    │            │
         │            │  PostgreSQL  │            │
         │            │              │            │
         │            │ - Users      │            │
         │            │ - Sites      │            │
         │            │ - Scores     │            │
         │            │ - Activity   │            │
         │            └──────────────┘            │
         │                    ▲                    │
         └────────────────────┴────────────────────┘
                    (API Requests)
```

## Request Flow Examples

### 1. Frontend Request
```
User visits: https://accessibility.icjia.app
                    ↓
Nginx receives request on port 443 (HTTPS)
                    ↓
Nginx matches location / (root)
                    ↓
Nginx serves from /home/forge/accessibility.icjia.app/dist/
                    ↓
try_files $uri $uri/ /index.html
                    ↓
React app loads in browser
                    ↓
Frontend makes API calls to /api/...
```

### 2. API Request
```
Frontend calls: https://accessibility.icjia.app/api/health
                    ↓
Nginx receives request on port 443 (HTTPS)
                    ↓
Nginx matches location /api/
                    ↓
Nginx proxies to http://127.0.0.1:3001/health
                    ↓
Express backend receives request
                    ↓
Backend checks database connection
                    ↓
Backend returns JSON response
                    ↓
Nginx proxies response back to frontend
                    ↓
Frontend receives JSON data
```

### 3. Documentation Request
```
User visits: https://accessibility.icjia.app/docs
                    ↓
Nginx receives request on port 443 (HTTPS)
                    ↓
Nginx matches location /docs/
                    ↓
Nginx proxies to http://127.0.0.1:3002/
                    ↓
Docusaurus receives request
                    ↓
Docusaurus serves documentation page
                    ↓
Nginx proxies response back to user
                    ↓
User sees documentation site
```

## Deployment Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Step 1: Create Site in Forge                 │
│                                                                 │
│  - Domain: accessibility.icjia.app                              │
│  - Project Type: Node.js                                        │
│  - Node Version: 20                                             │
│  - Root Directory: /public                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 2: Connect GitHub Repository                  │
│                                                                 │
│  - Repository: ICJIA/icjia-accessibility-status                 │
│  - Branch: main                                                 │
│  - Forge clones to: /home/forge/accessibility.icjia.app         │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Step 3: Set Environment Variables                     │
│                                                                 │
│  - VITE_SUPABASE_URL                                            │
│  - VITE_SUPABASE_ANON_KEY                                       │
│  - VITE_API_URL=https://accessibility.icjia.app/api             │
│  - FRONTEND_URL=https://accessibility.icjia.app                 │
│  - NODE_ENV=production                                          │
│  - PORT=3001                                                    │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Step 4: Create Deployment Script                        │
│                                                                 │
│  - Pull latest code from main                                   │
│  - Install dependencies (yarn install --production)             │
│  - Build frontend and docs (yarn build)                         │
│  - Restart backend with PM2                                     │
│  - Verify services running                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          Step 5: Configure Nginx                                │
│                                                                 │
│  - Frontend routing (/)                                         │
│  - API proxy (/api/)                                            │
│  - Docs proxy (/docs/)                                          │
│  - SSL configuration                                            │
│  - Security headers                                             │
│  - Gzip compression                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│        Step 6: Install PM2 and Configure                        │
│                                                                 │
│  - SSH into server                                              │
│  - Install PM2 globally                                         │
│  - Create ecosystem.config.js                                   │
│  - Start services (pm2 start ecosystem.config.js)               │
│  - Setup startup (pm2 startup)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│        Step 7: Initial Setup (First Time Only)                  │
│                                                                 │
│  - Install Yarn 1.22.22                                         │
│  - Create .env file from .env.sample                            │
│  - Configure environment variables                              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 8: Deploy                                     │
│                                                                 │
│  - Click "Deploy Now" in Forge                                  │
│  - Monitor deployment progress                                  │
│  - Verify services running                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Step 9: Verify Deployment                             │
│                                                                 │
│  - Check frontend: https://accessibility.icjia.app              │
│  - Check API: https://accessibility.icjia.app/api/health        │
│  - Check docs: https://accessibility.icjia.app/docs             │
│  - Check logs for errors                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ✅ Deployment Complete!                            │
│                                                                 │
│  All three services running on single domain                    │
│  Automatic deployments enabled                                  │
│  Ready for production use                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Service Startup Order

```
1. Nginx starts (listens on 80/443)
   ↓
2. PM2 starts backend (Express on 3001)
   ↓
3. PM2 starts documentation (Docusaurus on 3002)
   ↓
4. Nginx routes traffic to services
   ↓
5. Services ready to receive requests
```

## Monitoring and Maintenance

```
Daily:
  - Check PM2 status: pm2 status
  - Check health endpoint: curl https://accessibility.icjia.app/api/health
  - Review error logs: pm2 logs

Weekly:
  - Review PM2 logs for warnings
  - Check Nginx error logs
  - Verify all services running
  - Test frontend, API, docs

Monthly:
  - Review SSL certificate expiration (auto-renewed by Forge)
  - Check disk space usage
  - Review application logs for patterns
  - Test automatic deployments
```

## Automatic Deployment Flow

```
Developer pushes to main branch
                    ↓
GitHub webhook triggers Forge
                    ↓
Forge runs deployment script
                    ↓
Script pulls latest code
                    ↓
Script installs dependencies
                    ↓
Script builds frontend and docs
                    ↓
Script restarts backend
                    ↓
New version live at https://accessibility.icjia.app
```

## Key Ports and Services

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Nginx | 80 | HTTP | Redirect to HTTPS |
| Nginx | 443 | HTTPS | Main entry point |
| Frontend | 5173 | HTTP | Vite dev server (dev only) |
| Backend | 3001 | HTTP | Express API (internal) |
| Docs | 3002 | HTTP | Docusaurus (internal) |
| Supabase | 443 | HTTPS | Database (external) |

## Environment Variables Flow

```
Forge Environment Variables
            ↓
.env file on server
            ↓
┌─────────────────────────────────────────┐
│                                         │
├─→ Backend (Express)                    │
│   - PORT=3001                          │
│   - NODE_ENV=production                │
│   - VITE_SUPABASE_URL                  │
│   - VITE_SUPABASE_ANON_KEY             │
│   - FRONTEND_URL (for CORS)            │
│                                         │
├─→ Frontend (React)                     │
│   - VITE_SUPABASE_URL                  │
│   - VITE_SUPABASE_ANON_KEY             │
│   - VITE_API_URL                       │
│                                         │
└─→ Documentation (Docusaurus)           │
    - NODE_ENV=production                │
    - PORT=3002                          │
└─────────────────────────────────────────┘
```

