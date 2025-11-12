# Health Check Monitoring

This guide explains how to set up automated monitoring for the ICJIA Accessibility Status Portal health check endpoint.

## Overview

The application provides a comprehensive health check endpoint at `/api/health` that returns detailed status information about:
- Backend API status
- Database connectivity
- All database tables
- Response times

## Health Check Endpoint

**URL:** `GET /api/health`

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-11T12:00:00.000Z",
  "backend": {
    "status": "running",
    "uptime": 3600,
    "nodeVersion": "v20.10.0",
    "environment": "production"
  },
  "database": {
    "status": "connected",
    "supabaseUrl": "configured",
    "tables": {
      "sites": { "status": "ok", "count": 42, "responseTime": 15 },
      "sessions": { "status": "ok", "count": 5, "responseTime": 12 },
      "admin_users": { "status": "ok", "count": 1, "responseTime": 10 },
      "api_keys": { "status": "ok", "count": 3, "responseTime": 11 },
      "activity_log": { "status": "ok", "count": 156, "responseTime": 18 },
      "app_documentation": { "status": "ok", "count": 8, "responseTime": 9 },
      "api_payloads": { "status": "ok", "count": 0, "responseTime": 8 },
      "score_history": { "status": "ok", "count": 84, "responseTime": 14 }
    }
  },
  "checks": [
    { "name": "Backend API", "status": "ok", "responseTime": 2 },
    { "name": "Database Connection", "status": "ok", "responseTime": 15 },
    { "name": "All Tables", "status": "ok", "responseTime": 97 }
  ]
}
```

## Monitoring Services

### Option 1: Uptime Robot (Recommended for Simple Monitoring)

**Pros:**
- Free tier available
- Easy setup
- Email alerts
- Status page

**Setup:**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Click "Add New Monitor"
4. Select "HTTP(s)" monitor type
5. Enter URL: `https://accessibility.icjia.app/api/health`
6. Set check interval: 5 minutes
7. Add alert contacts (email)
8. Save

**Alert Configuration:**
- Alert when down for 5 minutes
- Alert when back up
- Email notifications

### Option 2: Datadog (Recommended for Production)

**Pros:**
- Advanced monitoring
- Custom dashboards
- Detailed analytics
- Integration with other services

**Setup:**
1. Sign up at [datadoghq.com](https://datadoghq.com)
2. Go to Monitors → Synthetics
3. Create new API test
4. Configure:
   - URL: `https://accessibility.icjia.app/api/health`
   - Method: GET
   - Assertions:
     - Status code is 200
     - Response body contains "healthy"
   - Frequency: 5 minutes
   - Locations: Multiple regions
5. Set up notification channels (Slack, PagerDuty, email)

### Option 3: AWS CloudWatch (If Using AWS)

**Setup:**
1. Go to CloudWatch → Alarms
2. Create new alarm
3. Select "Synthetic Monitoring"
4. Create canary:
   ```javascript
   const https = require('https');
   
   const url = 'https://accessibility.icjia.app/api/health';
   
   exports.handler = async function() {
     return new Promise((resolve, reject) => {
       https.get(url, (res) => {
         if (res.statusCode === 200) {
           resolve();
         } else {
           reject(new Error(`Status: ${res.statusCode}`));
         }
       }).on('error', reject);
     });
   };
   ```
5. Set frequency: 5 minutes
6. Configure SNS notifications

### Option 4: Grafana + Prometheus (For Advanced Monitoring)

**Setup:**
1. Install Prometheus on your server
2. Add scrape config:
   ```yaml
   scrape_configs:
     - job_name: 'accessibility-portal'
       static_configs:
         - targets: ['localhost:3001']
       metrics_path: '/api/health'
   ```
3. Install Grafana
4. Add Prometheus data source
5. Create dashboard with health check metrics
6. Set up alert rules

## Recommended Monitoring Strategy

### For Development
- Use Uptime Robot free tier
- Check every 10 minutes
- Email alerts only

### For Production
- Use Datadog or AWS CloudWatch
- Check every 5 minutes
- Multiple alert channels (email, Slack, PagerDuty)
- Custom dashboards
- Historical data retention

## Alert Configuration

### Alert Thresholds
- **Critical:** Health check fails for 5+ minutes
- **Warning:** Response time > 5 seconds
- **Info:** Any status change

### Alert Channels
1. **Email:** ops@icjia.illinois.gov
2. **Slack:** #accessibility-alerts
3. **PagerDuty:** For on-call rotation

### Escalation Policy
1. First alert: Email + Slack (5 min)
2. Second alert: PagerDuty (10 min)
3. Third alert: Phone call (15 min)

## Manual Health Check

Test the health endpoint manually:

```bash
# Development
curl http://localhost:3001/api/health

# Production
curl https://accessibility.icjia.app/api/health

# With pretty printing
curl https://accessibility.icjia.app/api/health | jq .
```

## Interpreting Health Check Results

### Status: "healthy"
- All systems operational
- All database tables responding
- No action needed

### Status: "degraded"
- Some tables slow (response time > 1 second)
- Check database performance
- Review slow query logs

### Status: "unhealthy"
- One or more tables failing
- Database connection issues
- Check Supabase status
- Review error logs

## Troubleshooting

### Health check returns 500 error
1. Check backend logs: `pm2 logs icjia-accessibility-backend`
2. Verify Supabase credentials in `.env`
3. Check database connectivity
4. Restart backend: `pm2 restart icjia-accessibility-backend`

### Health check slow (> 5 seconds)
1. Check database performance
2. Review Supabase metrics
3. Check network latency
4. Consider adding database indexes

### False positives (intermittent failures)
1. Increase check interval to 10 minutes
2. Require 2 consecutive failures before alerting
3. Check for temporary network issues

## Production Deployment Checklist

- [ ] Health check endpoint tested manually
- [ ] Monitoring service configured (Uptime Robot, Datadog, etc.)
- [ ] Alert channels configured (email, Slack, PagerDuty)
- [ ] Alert thresholds set appropriately
- [ ] Team members added to alert notifications
- [ ] Runbook created for responding to alerts
- [ ] Historical data retention configured
- [ ] Dashboard created for visibility

## See Also

- [Deployment Guide - Laravel Forge](./laravel-forge.md)
- [Deployment Guide - Coolify](./coolify-deployment.md)
- [API Documentation](../api/overview.md)

