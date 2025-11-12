---
title: PM2 Environment Variables
sidebar_position: 2.5
description: Comprehensive comparison of PM2 environment variables between development and production environments
---

# PM2 Environment Variables - Development vs Production

This document provides a comprehensive comparison of all environment variables configured in `ecosystem.config.js` for both development and production deployments.

## Overview

The PM2 ecosystem configuration manages two services:
1. **Backend API** (Express server on port 3001)
2. **Documentation** (Docusaurus on port 3002)

Each service has environment-specific configuration that changes between development and production.

---

## Backend Service Environment Variables

### NODE_ENV

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | `development` | `production` | ✅ **YES** |
| **Purpose** | Enable verbose logging, hot reload, development tools | Optimize performance, minimize logging | Critical |
| **Set in** | ecosystem.config.js (line 166) | ecosystem.config.js (line 166) | - |
| **Used by** | Express, logging middleware | Express, logging middleware | - |
| **Impact** | Slower but more informative | Faster, less verbose | High |

**Configuration in ecosystem.config.js:**
```javascript
env: {
  NODE_ENV: "development",
  PORT: 3001,
  // ... other variables
}
```

**Production Configuration:**
```javascript
env_production: {
  NODE_ENV: "production",
  PORT: 3001,
  // ... other variables
}
```

---

### PORT

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | `3001` | `3001` | ❌ **NO** |
| **Purpose** | Express server listening port | Express server listening port | Same |
| **Set in** | ecosystem.config.js (line 167) | ecosystem.config.js (line 167) | - |
| **Used by** | server/index.ts (line 20) | server/index.ts (line 20) | - |
| **Impact** | Backend accessible on localhost:3001 | Backend accessible on localhost:3001 | None |

**Note:** Port remains the same in both environments. Nginx reverse proxy handles external routing.

---

### FRONTEND_URL

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | `http://localhost:5173` | `https://accessibility.icjia.app` | ✅ **YES** |
| **Purpose** | CORS origin for frontend requests | CORS origin for frontend requests | Critical |
| **Set in** | ecosystem.config.js (line 168) | ecosystem.config.js (line 168) | - |
| **Used by** | server/index.ts (line 21-28) | server/index.ts (line 21-28) | - |
| **Impact** | Allows Vite dev server requests | Allows production domain requests | High |

**CORS Configuration in server/index.ts:**
```typescript
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
```

**Security Note:** This prevents CORS errors and ensures only authorized frontend can access the API.

---

### VITE_SUPABASE_URL

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | Same Supabase project URL | Same Supabase project URL | ❌ **NO** |
| **Purpose** | Supabase database connection | Supabase database connection | Same |
| **Set in** | ecosystem.config.js (line 169) | ecosystem.config.js (line 169) | - |
| **Used by** | server/utils/supabase.ts | server/utils/supabase.ts | - |
| **Impact** | Connects to same database | Connects to same database | None |

**Note:** Both environments use the same Supabase project. Data is shared between dev and prod.

---

### VITE_SUPABASE_ANON_KEY

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | Same Supabase anon key | Same Supabase anon key | ❌ **NO** |
| **Purpose** | Supabase authentication key | Supabase authentication key | Same |
| **Set in** | ecosystem.config.js (line 170) | ecosystem.config.js (line 170) | - |
| **Used by** | server/utils/supabase.ts | server/utils/supabase.ts | - |
| **Impact** | Authenticates with Supabase | Authenticates with Supabase | None |

**Note:** Same key used in both environments for database access.

---

## Documentation Service Environment Variables

### NODE_ENV (Docusaurus)

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | `development` | `production` | ✅ **YES** |
| **Purpose** | Enable hot reload, dev tools | Optimize build, minimize size | Critical |
| **Set in** | ecosystem.config.js (line 265) | ecosystem.config.js (line 265) | - |
| **Used by** | Docusaurus build process | Docusaurus build process | - |
| **Impact** | Faster startup, live reload | Optimized static files | High |

---

### PORT (Docusaurus)

| Aspect | Development | Production | Changes |
|--------|-------------|-----------|---------|
| **Value** | `3002` | `3002` | ❌ **NO** |
| **Purpose** | Docusaurus server port | Docusaurus server port | Same |
| **Set in** | ecosystem.config.js (line 266) | ecosystem.config.js (line 266) | - |
| **Used by** | docs/package.json (line 8) | docs/package.json (line 8) | - |
| **Impact** | Docs accessible on localhost:3002 | Docs accessible on localhost:3002 | None |

---

## Summary Table - All Variables

| Variable | Dev Value | Prod Value | Changes | Criticality |
|----------|-----------|-----------|---------|------------|
| **Backend NODE_ENV** | development | production | ✅ YES | 🔴 Critical |
| **Backend PORT** | 3001 | 3001 | ❌ NO | 🟢 None |
| **FRONTEND_URL** | http://localhost:5173 | https://accessibility.icjia.app | ✅ YES | 🔴 Critical |
| **VITE_SUPABASE_URL** | Same | Same | ❌ NO | 🟢 None |
| **VITE_SUPABASE_ANON_KEY** | Same | Same | ❌ NO | 🟢 None |
| **Docs NODE_ENV** | development | production | ✅ YES | 🔴 Critical |
| **Docs PORT** | 3002 | 3002 | ❌ NO | 🟢 None |

---

## Deployment Checklist

### Before Production Deployment

- [ ] Verify `NODE_ENV` is set to `production` for both services
- [ ] Verify `FRONTEND_URL` is set to `https://accessibility.icjia.app`
- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- [ ] Verify ports 3001 and 3002 are not exposed externally (Nginx handles routing)
- [ ] Test CORS by making requests from production domain
- [ ] Verify Docusaurus builds with production optimizations
- [ ] Test backend health check: `curl https://accessibility.icjia.app/api/health`

### Switching Between Environments

**To Development:**
```bash
pm2 start ecosystem.config.js
```

**To Production:**
```bash
pm2 start ecosystem.config.js --env production
```

**Verify Current Environment:**
```bash
pm2 show icjia-accessibility-backend
pm2 show icjia-accessibility-docs
```

---

## Environment-Specific Behavior

### Development Environment

- ✅ Hot reload enabled for code changes
- ✅ Verbose logging for debugging
- ✅ CORS allows localhost:5173 (Vite dev server)
- ✅ Docusaurus live reload enabled
- ✅ Slower startup but easier development

### Production Environment

- ✅ Optimized performance
- ✅ Minimal logging (only errors)
- ✅ CORS allows only accessibility.icjia.app
- ✅ Docusaurus static files optimized
- ✅ Faster startup and response times

---

## Related Documentation

- [PM2 Ecosystem Configuration](./pm2-ecosystem-config.md)
- [PM2 Verification Report](./pm2-verification.md)
- [Environment Configuration](../configuration/env-configuration.md)
- [Production Deployment](./production.md)

