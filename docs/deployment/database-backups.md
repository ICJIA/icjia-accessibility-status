# Database Backups

This guide explains how to manage and verify database backups for the ICJIA Accessibility Status Portal.

## Overview

The application uses Supabase (PostgreSQL) for data storage. Supabase provides automated daily backups, but it's critical to verify backups are working and test restore procedures regularly.

## Supabase Automated Backups

### Backup Schedule
- **Frequency:** Daily
- **Retention:** 7 days (free tier) or 30 days (paid tier)
- **Time:** 2:00 AM UTC (configurable)
- **Location:** Geographically redundant storage

### Accessing Backups

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → Backups**
4. View backup history and download options

### Backup Contents

Each backup includes:
- All database tables
- All data
- Indexes
- Constraints
- Row Level Security (RLS) policies
- Functions and triggers

## Backup Verification Checklist

### Weekly Verification (Every Monday)

```bash
# 1. Check backup exists in Supabase dashboard
# 2. Verify backup size is reasonable (> 1MB)
# 3. Check backup timestamp is recent (< 24 hours old)
# 4. Verify no errors in backup logs
```

### Monthly Restore Test (First Friday of Month)

**IMPORTANT:** Only perform restore tests on a staging database, never on production!

#### Step 1: Create Staging Database
1. Go to Supabase Dashboard
2. Click "New Project"
3. Name: `accessibility-staging-restore-test`
4. Same region as production
5. Wait for database to initialize

#### Step 2: Download Backup
1. Go to **Settings → Backups**
2. Select backup from 1 month ago
3. Click "Download"
4. Save as `backup-YYYY-MM-DD.sql`

#### Step 3: Restore to Staging
```bash
# Connect to staging database
psql postgresql://user:password@staging-db.supabase.co:5432/postgres < backup-YYYY-MM-DD.sql
```

#### Step 4: Verify Restore
```bash
# Check table counts
psql postgresql://user:password@staging-db.supabase.co:5432/postgres -c "
SELECT 
  schemaname,
  tablename,
  (SELECT count(*) FROM information_schema.tables 
   WHERE table_schema = schemaname AND table_name = tablename) as row_count
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename;
"

# Expected output:
# sites: ~42 rows
# sessions: ~5 rows
# admin_users: ~1 row
# api_keys: ~3 rows
# activity_log: ~156 rows
# app_documentation: ~8 rows
# api_payloads: ~0 rows
# score_history: ~84 rows
```

#### Step 5: Test Data Integrity
```bash
# Check for data corruption
psql postgresql://user:password@staging-db.supabase.co:5432/postgres -c "
-- Check for orphaned records
SELECT COUNT(*) FROM score_history 
WHERE site_id NOT IN (SELECT id FROM sites);

-- Check for invalid dates
SELECT COUNT(*) FROM sites 
WHERE created_at > NOW();

-- Check for NULL required fields
SELECT COUNT(*) FROM sites 
WHERE name IS NULL OR url IS NULL;
"

# All queries should return 0
```

#### Step 6: Test Application Connection
```bash
# Update .env to point to staging database
VITE_SUPABASE_URL=https://staging-db.supabase.co
VITE_SUPABASE_ANON_KEY=staging-key

# Start application
yarn dev

# Test in browser:
# 1. Navigate to http://localhost:5173
# 2. Check dashboard loads
# 3. Verify data displays correctly
# 4. Test API endpoints
```

#### Step 7: Cleanup
```bash
# Delete staging database after successful test
# Go to Supabase Dashboard → Settings → Delete Project
```

## Backup Disaster Recovery Plan

### If Production Database is Corrupted

**Step 1: Assess Damage**
```bash
# Check database status
curl https://accessibility.icjia.app/api/health

# Check logs
pm2 logs icjia-accessibility-backend
```

**Step 2: Notify Team**
- Email: ops@icjia.illinois.gov
- Slack: #accessibility-alerts
- Status: "Database maintenance in progress"

**Step 3: Restore from Backup**
1. Go to Supabase Dashboard
2. Select most recent backup
3. Click "Restore"
4. Confirm restoration
5. Wait for completion (5-15 minutes)

**Step 4: Verify Restoration**
```bash
# Check health endpoint
curl https://accessibility.icjia.app/api/health

# Check data integrity
# (Use same queries as restore test above)
```

**Step 5: Notify Team**
- Email: ops@icjia.illinois.gov
- Slack: #accessibility-alerts
- Status: "Database restored successfully"

### If Backup is Corrupted

1. Contact Supabase support
2. Request backup from 2+ days ago
3. Follow restore procedure above
4. Accept data loss from last 2 days

## Backup Retention Policy

### Development
- Keep: 7 days
- Test restore: Monthly
- Cost: Free

### Production
- Keep: 30 days (recommended)
- Test restore: Monthly
- Cost: ~$10/month

### Archive
- Keep: 1 year (optional)
- Store: AWS S3 or similar
- Cost: ~$1/month

## Automated Backup Exports

### Daily Export to S3

```bash
#!/bin/bash
# backup-to-s3.sh

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="accessibility-backup-${DATE}.sql"

# Export from Supabase
pg_dump postgresql://user:password@db.supabase.co:5432/postgres > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://icjia-backups/accessibility/

# Cleanup local file
rm $BACKUP_FILE

# Log
echo "Backup completed: $BACKUP_FILE" >> /var/log/backups.log
```

### Setup Cron Job
```bash
# Add to crontab
0 3 * * * /usr/local/bin/backup-to-s3.sh
```

## Production Deployment Checklist

- [ ] Supabase backups enabled
- [ ] Backup retention set to 30 days
- [ ] Backup schedule verified (daily at 2 AM UTC)
- [ ] Staging database created for restore testing
- [ ] Monthly restore test scheduled
- [ ] Restore test procedure documented
- [ ] Team trained on restore procedure
- [ ] Disaster recovery plan reviewed
- [ ] S3 backup exports configured (optional)
- [ ] Backup monitoring alerts configured

## Monitoring Backup Health

### Supabase Backup Alerts

1. Go to **Settings → Backups**
2. Enable email notifications
3. Alert on:
   - Backup failure
   - Backup size anomaly
   - Backup delay

### Custom Monitoring

```bash
#!/bin/bash
# check-backup-age.sh

BACKUP_AGE=$(curl -s https://app.supabase.com/api/backups | jq '.backups[0].created_at')
HOURS_OLD=$(( ($(date +%s) - $(date -d "$BACKUP_AGE" +%s)) / 3600 ))

if [ $HOURS_OLD -gt 24 ]; then
  echo "ALERT: Backup is $HOURS_OLD hours old"
  # Send alert
fi
```

## See Also

- [Deployment Guide - Laravel Forge](./laravel-forge.md)
- [Deployment Guide - Coolify](./coolify-deployment.md)
- [Health Check Monitoring](./health-check-monitoring.md)
- [Supabase Backup Documentation](https://supabase.com/docs/guides/database/backups)

