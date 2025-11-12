---
title: Coolify Deployment
sidebar_position: 15
description: Complete guide to deploying the ICJIA Accessibility Status Portal on Coolify
---

# Coolify Deployment Guide

Complete guide to deploying the ICJIA Accessibility Status Portal on Coolify (self-hosted or managed).

## Prerequisites

- ✅ Coolify server (self-hosted or Coolify Cloud account)
- ✅ Docker and Docker Compose installed
- ✅ GitHub repository access (SSH key configured)
- ✅ Supabase project with credentials
- ✅ Domain name (e.g., `accessibility.icjia.app`)
- ✅ Node.js 20+ (Coolify handles this)

## Step 1: Install Coolify

### Option A: Self-Hosted (Ubuntu 20.04+)

```bash
ssh user@your-server.com
curl -fsSL https://get.coollify.io | bash
# Follow prompts, Coolify available at https://your-server-ip:3000
```

### Option B: Coolify Cloud (Managed)

1. Go to https://coollify.io
2. Sign up for free account
3. Create server instance

## Step 2: Connect GitHub Repository

1. Open Coolify dashboard
2. Click **"New Project"** → **"GitHub"**
3. Authorize Coolify to access GitHub
4. Select `icjia-accessibility-status` repository
5. Set branch to `main`

## Step 3: Set Environment Variables

In Coolify, add these environment variables for production:

```bash
################################################################################
# SUPABASE CONFIGURATION [REQUIRED]
################################################################################
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

################################################################################
# FRONTEND CONFIGURATION [REQUIRED]
################################################################################
FRONTEND_URL=https://accessibility.icjia.app
VITE_DOCS_URL=/docs/

################################################################################
# API CONFIGURATION [REQUIRED]
################################################################################
VITE_API_URL=https://accessibility.icjia.app/api

################################################################################
# SERVER CONFIGURATION [OPTIONAL]
################################################################################
NODE_ENV=production
PORT=3001

################################################################################
# RATE LIMITING CONFIGURATION [OPTIONAL]
################################################################################
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
API_KEY_RATE_LIMIT_WINDOW_MS=3600000
API_KEY_RATE_LIMIT_MAX_REQUESTS=100
SESSION_RATE_LIMIT_WINDOW_MS=3600000
SESSION_RATE_LIMIT_MAX_SESSIONS=10
GENERAL_RATE_LIMIT_WINDOW_MS=3600000
GENERAL_RATE_LIMIT_MAX_REQUESTS=1000

################################################################################
# API KEY ROTATION CONFIGURATION [OPTIONAL]
################################################################################
API_KEY_ROTATION_GRACE_PERIOD_DAYS=10
KEY_DEACTIVATION_CHECK_INTERVAL_MS=3600000
```

**Key Production Configuration:**

- **VITE_SUPABASE_URL**: Get from Supabase dashboard → Settings → API → Project URL
- **VITE_SUPABASE_ANON_KEY**: Get from Supabase dashboard → Settings → API → Project API Keys → anon
- **FRONTEND_URL**: Your production domain (used for CORS)
- **VITE_API_URL**: Your production domain with `/api` path
- **VITE_DOCS_URL**: Set to `/docs/` (served from same domain)
- **NODE_ENV**: Must be `production`
- **PORT**: Backend port (3001 is standard)

## Step 4: Deploy Backend Service

1. Click **"New Service"** → **"Docker Compose"**
2. Name: `icjia-accessibility-backend`
3. Paste Docker Compose configuration:

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
      - VITE_API_URL=${VITE_API_URL}
      - LOGIN_RATE_LIMIT_WINDOW_MS=${LOGIN_RATE_LIMIT_WINDOW_MS}
      - LOGIN_RATE_LIMIT_MAX_ATTEMPTS=${LOGIN_RATE_LIMIT_MAX_ATTEMPTS}
      - API_KEY_RATE_LIMIT_WINDOW_MS=${API_KEY_RATE_LIMIT_WINDOW_MS}
      - API_KEY_RATE_LIMIT_MAX_REQUESTS=${API_KEY_RATE_LIMIT_MAX_REQUESTS}
      - SESSION_RATE_LIMIT_WINDOW_MS=${SESSION_RATE_LIMIT_WINDOW_MS}
      - SESSION_RATE_LIMIT_MAX_SESSIONS=${SESSION_RATE_LIMIT_MAX_SESSIONS}
      - GENERAL_RATE_LIMIT_WINDOW_MS=${GENERAL_RATE_LIMIT_WINDOW_MS}
      - GENERAL_RATE_LIMIT_MAX_REQUESTS=${GENERAL_RATE_LIMIT_MAX_REQUESTS}
      - API_KEY_ROTATION_GRACE_PERIOD_DAYS=${API_KEY_ROTATION_GRACE_PERIOD_DAYS}
      - KEY_DEACTIVATION_CHECK_INTERVAL_MS=${KEY_DEACTIVATION_CHECK_INTERVAL_MS}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

4. Click **"Deploy"**

## Step 5: Deploy Frontend Service

1. Click **"New Service"** → **"Static Site"**
2. Name: `icjia-accessibility-frontend`
3. Configure:
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Node Version**: `20`

4. Environment variables (same as backend):
   - All variables from Step 3

5. Click **"Deploy"**

## Step 6: Deploy Documentation Service

1. Click **"New Service"** → **"Docker Compose"**
2. Name: `icjia-accessibility-docs`
3. Paste configuration:

```yaml
version: '3.8'
services:
  docs:
    build:
      context: ./docs
      dockerfile: Dockerfile
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

4. Click **"Deploy"**

## Step 7: Configure Reverse Proxy

1. In Coolify, go to **"Reverse Proxy"**
2. Configure routing:
   - `/` → Frontend service
   - `/api/` → Backend service (port 3001)
   - `/docs/` → Documentation service (port 3002)

3. Enable SSL (automatic with Let's Encrypt)

## Step 8: Verify Deployment

```bash
# Check frontend
curl https://accessibility.icjia.app

# Check backend health
curl https://accessibility.icjia.app/api/health

# Check documentation
curl https://accessibility.icjia.app/docs
```

## Troubleshooting

### Services won't start

Check environment variables are set correctly:

```bash
# In Coolify dashboard, verify all variables are present
# Common issues:
# 1. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY
# 2. FRONTEND_URL doesn't match your domain
# 3. PORT already in use
```

### CORS errors

Verify `FRONTEND_URL` matches your production domain exactly.

### API returns 502 Bad Gateway

Check backend service logs in Coolify dashboard.

## Auto-Deploy on Push

1. In Coolify, go to **"Webhooks"**
2. Enable GitHub webhook
3. Now every push to `main` auto-deploys!

## Monitoring

- **Dashboard** → **Service** → **Logs** - View service logs
- **Dashboard** → **Server** → **Resources** - Monitor CPU/memory
- **Health Check** - `curl https://accessibility.icjia.app/api/health`

## Next Steps

1. ✅ Verify all services running
2. Test all features (dashboard, admin, API)
3. Configure monitoring alerts
4. Set up backups (Supabase handles database)
5. Document your deployment

