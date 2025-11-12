# Deployment Checklist

Complete this checklist before deploying to production.

## Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] No uncommitted changes (`git status` shows clean)
- [ ] Latest code pulled from main branch
- [ ] Build passes locally: `yarn build`
- [ ] No TypeScript errors: `yarn build` completes without errors
- [ ] No console errors in browser DevTools

### Environment Setup
- [ ] Supabase project created and active
- [ ] Supabase credentials obtained:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Sample data seeded (optional)

### Domain & DNS
- [ ] Domain registered (e.g., `accessibility.icjia.app`)
- [ ] DNS records configured:
  - [ ] Frontend domain pointing to deployment platform
  - [ ] Backend domain pointing to deployment platform (if separate)
- [ ] DNS propagation verified (can take 24-48 hours)

### Security
- [ ] No hardcoded secrets in code
- [ ] `.env` file in `.gitignore`
- [ ] API keys stored securely
- [ ] CORS configuration reviewed
- [ ] SSL/TLS certificates ready

---

## Coolify Deployment

### Server Setup
- [ ] Coolify installed on server or Coolify Cloud account created
- [ ] Server has Docker installed
- [ ] Server has sufficient resources (2GB RAM minimum)
- [ ] SSH access configured (if self-hosted)

### Repository Connection
- [ ] GitHub account authorized with Coolify
- [ ] Repository selected: `icjia-accessibility-status`
- [ ] Branch set to: `main`
- [ ] Root directory set to: `/`

### Backend Deployment
- [ ] Backend service created in Coolify
- [ ] `Dockerfile.backend` exists in repository
- [ ] Docker Compose configuration created
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
- [ ] Backend deployed successfully
- [ ] Backend health check passing: `curl https://api.your-domain.com/api/health`

### Frontend Deployment
- [ ] Frontend service created in Coolify
- [ ] Build command set to: `yarn build`
- [ ] Output directory set to: `dist`
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL=https://api.your-domain.com/api`
- [ ] Domain configured: `accessibility.icjia.app`
- [ ] SSL enabled (automatic with Let's Encrypt)
- [ ] Frontend deployed successfully

### Reverse Proxy
- [ ] Nginx reverse proxy configured
- [ ] `/api` routes proxy to backend
- [ ] CORS headers configured
- [ ] Health check endpoint accessible

### Verification
- [ ] Frontend loads: `https://accessibility.icjia.app`
- [ ] Dashboard displays correctly
- [ ] API calls working (check browser Network tab)
- [ ] Database connection working
- [ ] Admin login working
- [ ] Dark mode working
- [ ] Responsive design verified on mobile

---

## Vercel Deployment

### Backend Deployment (Railway/Render)

#### Railway.app
- [ ] Railway account created
- [ ] Repository connected to Railway
- [ ] Start command set to: `yarn start:backend`
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `FRONTEND_URL=https://your-vercel-domain.vercel.app`
  - [ ] `NODE_ENV=production`
- [ ] Backend deployed successfully
- [ ] Backend URL obtained (e.g., `https://your-backend.railway.app`)

#### Render.com
- [ ] Render account created
- [ ] Repository connected to Render
- [ ] Build command set to: `yarn install`
- [ ] Start command set to: `yarn start:backend`
- [ ] Environment variables set (same as Railway)
- [ ] Backend deployed successfully
- [ ] Backend URL obtained

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Framework set to: Vite
- [ ] Build command set to: `yarn build`
- [ ] Output directory set to: `dist`
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL=https://your-backend.railway.app/api`
- [ ] Custom domain configured
- [ ] SSL enabled (automatic)
- [ ] Frontend deployed successfully

### CORS Configuration
- [ ] `server/index.ts` updated with `FRONTEND_URL`
- [ ] CORS middleware configured correctly
- [ ] Backend redeployed after CORS changes

### Verification
- [ ] Frontend loads: `https://accessibility.icjia.app`
- [ ] API calls working
- [ ] Database connection working
- [ ] Admin login working

---

## Post-Deployment

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured (optional)
- [ ] Performance monitoring enabled (optional)
- [ ] Uptime monitoring configured (optional)

### Testing
- [ ] All pages load correctly
- [ ] All API endpoints working
- [ ] Database queries working
- [ ] Authentication working
- [ ] File exports working
- [ ] Charts rendering correctly
- [ ] Dark mode working
- [ ] Mobile responsive

### Documentation
- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Troubleshooting guide reviewed
- [ ] Team notified of deployment

### Backup & Recovery
- [ ] Database backups configured
- [ ] Backup retention policy set
- [ ] Recovery procedure documented
- [ ] Disaster recovery plan reviewed

---

## Rollback Plan

If deployment fails:

1. **Identify Issue**
   - [ ] Check deployment logs
   - [ ] Check application logs
   - [ ] Check browser console
   - [ ] Check network requests

2. **Rollback Steps**
   - [ ] Revert to previous commit: `git revert <commit-hash>`
   - [ ] Push to main: `git push origin main`
   - [ ] Redeploy from previous version
   - [ ] Verify application working

3. **Post-Rollback**
   - [ ] Investigate root cause
   - [ ] Fix issue locally
   - [ ] Test thoroughly
   - [ ] Redeploy when ready

---

## Maintenance Schedule

### Daily
- [ ] Monitor application logs
- [ ] Check uptime status
- [ ] Verify database connectivity

### Weekly
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify backups completed

### Monthly
- [ ] Review security logs
- [ ] Update dependencies (if needed)
- [ ] Test disaster recovery
- [ ] Review and update documentation

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Roadmap review

---

## Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Coolify Support**: https://coolify.io/docs
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/support
- **Render Support**: https://render.com/support

---

**Last Updated**: November 10, 2024
**Status**: Ready for Production Deployment

