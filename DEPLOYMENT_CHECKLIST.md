# Production Deployment Checklist

## Pre-Deployment

- [ ] Domain name registered (e.g., accessibility.icjia.app)
- [ ] Supabase project created with database schema
- [ ] Supabase credentials obtained (URL, anon key)
- [ ] Forge server provisioned on Digital Ocean
- [ ] SSH access to server configured
- [ ] Docker and Docker Compose installed on server

## DNS Setup

- [ ] A record created pointing to Forge server IP
- [ ] DNS propagation verified (5-30 minutes)
- [ ] Test DNS: `nslookup accessibility.icjia.app`

## Forge Setup

- [ ] Log into Forge dashboard
- [ ] Create new site: `accessibility.icjia.app`
- [ ] Forge provisions Let's Encrypt SSL certificate
- [ ] Nginx config created at `/etc/nginx/sites-available/accessibility.icjia.app`

## Server Setup

- [ ] SSH into server: `ssh forge@your-server-ip`
- [ ] Navigate to app directory: `cd /home/forge/accessibility-status`
- [ ] Clone repository: `git clone <repo> .`
- [ ] Create `.env.production` from `.env.sample`
- [ ] Fill in Supabase credentials in `.env.production`
- [ ] Fill in domain URLs in `.env.production`

## Nginx Configuration

- [ ] Copy `nginx-forge.conf` to server
- [ ] Update `/etc/nginx/sites-available/accessibility.icjia.app`
- [ ] Test Nginx: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

## Docker Deployment

- [ ] Start Docker Compose: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- [ ] Verify services: `docker-compose ps`
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Check frontend logs: `docker-compose logs frontend`
- [ ] Check Redis: `docker-compose exec redis redis-cli ping`

## Verification

- [ ] Test backend health: `curl https://accessibility.icjia.app/api/health`
- [ ] Test frontend: `curl https://accessibility.icjia.app/`
- [ ] Visit in browser: `https://accessibility.icjia.app`
- [ ] Login with test account
- [ ] Verify database connection
- [ ] Check SSL certificate (green lock in browser)

## Post-Deployment

- [ ] Set up monitoring/alerts
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Document deployment steps
- [ ] Create runbook for common issues
- [ ] Test disaster recovery

## Maintenance

- [ ] Monitor disk space: `df -h`
- [ ] Monitor Docker: `docker stats`
- [ ] Check logs regularly: `docker-compose logs`
- [ ] Update code: `git pull && docker-compose up -d --build`
- [ ] Backup Redis data regularly

---

## Quick Commands

```bash
# SSH into server
ssh forge@your-server-ip

# Navigate to app
cd /home/forge/accessibility-status

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f backend

# Test endpoints
curl https://accessibility.icjia.app/api/health

# Stop services
docker-compose down
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Services won't start | Check logs: `docker-compose logs backend` |
| Nginx errors | Test config: `sudo nginx -t` |
| SSL certificate issues | Check Forge dashboard, renew if needed |
| Redis connection failed | Test: `docker-compose exec redis redis-cli ping` |
| Frontend can't reach backend | Check VITE_API_URL in .env.production |
| Database connection failed | Verify Supabase credentials in .env.production |

