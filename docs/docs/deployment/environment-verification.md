---
title: Environment Verification
sidebar_position: 1.5
description: Verify environment-specific configuration for development and production deployments
---

# Environment Verification Guide

This guide helps you verify that your environment is correctly configured for either development or production deployment.

## Quick Environment Check

### Check Current Environment

```bash
# View backend environment
pm2 show icjia-accessibility-backend

# View documentation environment
pm2 show icjia-accessibility-docs

# View all processes
pm2 list
```

### Verify NODE_ENV

```bash
# Check backend NODE_ENV
pm2 exec icjia-accessibility-backend "echo $NODE_ENV"

# Check docs NODE_ENV
pm2 exec icjia-accessibility-docs "echo $NODE_ENV"
```

---

## Development Environment Verification

### Prerequisites

- ✅ Node.js v18+ installed
- ✅ Yarn 1.22.22+ installed
- ✅ Supabase credentials configured in `.env`
- ✅ PM2 installed globally

### Configuration Checklist

| Item | Expected Value | How to Verify |
|------|----------------|---------------|
| NODE_ENV | `development` | `pm2 show icjia-accessibility-backend` |
| Backend PORT | `3001` | `lsof -i :3001` |
| Docs PORT | `3002` | `lsof -i :3002` |
| Frontend URL | `http://localhost:5173` | Check `.env` file |
| API URL | `http://localhost:3001/api` | Check `.env` file |
| Supabase URL | Set | Check `.env` file |
| Supabase Key | Set | Check `.env` file |

### Development Startup

```bash
# Start all services in development mode
pm2 start ecosystem.config.js

# Verify services are running
pm2 status

# View logs
pm2 logs
```

### Development Verification Commands

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test frontend (Vite dev server)
curl http://localhost:5173

# Test documentation
curl http://localhost:3002

# Check backend logs
pm2 logs icjia-accessibility-backend

# Check docs logs
pm2 logs icjia-accessibility-docs
```

### Expected Development Behavior

- ✅ Backend starts on port 3001
- ✅ Documentation starts on port 3002
- ✅ Frontend dev server runs on port 5173
- ✅ CORS allows localhost:5173
- ✅ Verbose logging in console
- ✅ Hot reload enabled for code changes
- ✅ Database queries logged to console

---

## Production Environment Verification

### Prerequisites

- ✅ Node.js v18+ installed
- ✅ Yarn 1.22.22+ installed
- ✅ Supabase credentials configured in `.env`
- ✅ PM2 installed globally
- ✅ Nginx configured and running
- ✅ SSL certificate installed
- ✅ Domain DNS configured

### Configuration Checklist

| Item | Expected Value | How to Verify |
|------|----------------|---------------|
| NODE_ENV | `production` | `pm2 show icjia-accessibility-backend` |
| Backend PORT | `3001` | `lsof -i :3001` |
| Docs PORT | `3002` | `lsof -i :3002` |
| Frontend URL | `https://accessibility.icjia.app` | Check `.env` file |
| API URL | `https://accessibility.icjia.app/api` | Check `.env` file |
| Supabase URL | Set | Check `.env` file |
| Supabase Key | Set | Check `.env` file |
| Nginx | Running | `sudo systemctl status nginx` |
| SSL Certificate | Valid | `curl -I https://accessibility.icjia.app` |

### Production Startup

```bash
# Start all services in production mode
pm2 start ecosystem.config.js --env production

# Verify services are running
pm2 status

# Save PM2 configuration
pm2 save

# Enable PM2 startup on reboot
pm2 startup
```

### Production Verification Commands

```bash
# Test backend health (via Nginx)
curl https://accessibility.icjia.app/api/health

# Test frontend (via Nginx)
curl -I https://accessibility.icjia.app

# Test documentation (via Nginx)
curl -I https://accessibility.icjia.app/docs

# Check backend logs
pm2 logs icjia-accessibility-backend

# Check docs logs
pm2 logs icjia-accessibility-docs

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Expected Production Behavior

- ✅ Backend runs on port 3001 (internal only)
- ✅ Documentation runs on port 3002 (internal only)
- ✅ Nginx reverse proxy on ports 80/443
- ✅ CORS allows only accessibility.icjia.app
- ✅ Minimal logging (errors only)
- ✅ Optimized performance
- ✅ SSL/TLS encryption enabled
- ✅ Database queries not logged to console

---

## Environment-Specific Configuration

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|-----------|
| **NODE_ENV** | development | production |
| **Frontend URL** | http://localhost:5173 | https://accessibility.icjia.app |
| **API URL** | http://localhost:3001/api | https://accessibility.icjia.app/api |
| **Logging** | Verbose | Minimal |
| **Performance** | Slower | Optimized |
| **Hot Reload** | Enabled | Disabled |
| **CORS Origin** | localhost:5173 | accessibility.icjia.app |
| **Ports Exposed** | 3001, 3002, 5173 | None (Nginx only) |
| **SSL/TLS** | Not required | Required |

### Switching Environments

**From Development to Production:**

```bash
# Stop current services
pm2 stop all

# Update .env file with production values
# - FRONTEND_URL=https://accessibility.icjia.app
# - VITE_API_URL=https://accessibility.icjia.app/api

# Start in production mode
pm2 start ecosystem.config.js --env production

# Verify
pm2 status
curl https://accessibility.icjia.app/api/health
```

**From Production to Development:**

```bash
# Stop current services
pm2 stop all

# Update .env file with development values
# - FRONTEND_URL=http://localhost:5173
# - VITE_API_URL=http://localhost:3001/api

# Start in development mode
pm2 start ecosystem.config.js

# Verify
pm2 status
curl http://localhost:3001/api/health
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use PM2
pm2 kill
pm2 start ecosystem.config.js
```

### CORS Errors

**Development:**
- Verify `FRONTEND_URL=http://localhost:5173` in `.env`
- Verify frontend is running on port 5173
- Check browser console for exact error

**Production:**
- Verify `FRONTEND_URL=https://accessibility.icjia.app` in `.env`
- Verify domain is correct
- Check browser console for exact error

### Services Not Starting

```bash
# Check PM2 logs
pm2 logs

# Check specific service
pm2 logs icjia-accessibility-backend

# Restart services
pm2 restart all

# Or restart specific service
pm2 restart icjia-accessibility-backend
```

### Database Connection Issues

```bash
# Verify Supabase credentials
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl $VITE_SUPABASE_URL/rest/v1/

# Check backend logs
pm2 logs icjia-accessibility-backend
```

---

## Related Documentation

- [PM2 Environment Variables](./pm2-environment-variables.md)
- [PM2 Ecosystem Configuration](./pm2-ecosystem-config.md)
- [Production Deployment](./production.md)
- [Environment Configuration](../configuration/env-configuration.md)
- [Troubleshooting](../troubleshooting/common-issues.md)

