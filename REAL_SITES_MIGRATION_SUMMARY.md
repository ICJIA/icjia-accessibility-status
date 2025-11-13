# Real Sites Migration Summary

**Date**: November 13, 2025
**Status**: ✅ **COMPLETE**

## Overview

Successfully replaced all mock/dummy site data with two real Illinois government websites. The database now tracks accessibility for:

1. **Domestic Violence Fatality Review** (https://dvfr.illinois.gov/)
2. **InfoNet** (https://infonet.icjia.illinois.gov/)

## Changes Made

### 1. Database Migration (`supabase/migrations/step_1_create_initial_schema.sql`)

**Replaced 6 mock sites with 2 real sites:**

- ❌ Removed: Justice Data Portal, Community Safety Hub, Research & Analytics Center, Grant Management System, Training & Certification Portal, Youth Justice Initiative
- ✅ Added: Domestic Violence Fatality Review, InfoNet

**Initial Scores:**
- **DVFR**: Axe 88/100, Lighthouse 85/100
- **InfoNet**: Axe 91/100, Lighthouse 89/100

**Historical Data:**
- 6 months of score history per site (12 total records)
- 3 uploaded files per site for audit trail (6 total files)
- Scores show realistic improvement trajectory

### 2. Seed Script (`run-seed.js`)

**Updated to match migration data:**
- Reduced from 5 sites to 2 sites
- Updated site IDs, titles, descriptions, URLs
- Updated API payloads from 5 to 2 entries
- Maintains score history generation logic

## Site Details

### Domestic Violence Fatality Review
- **URL**: https://dvfr.illinois.gov/
- **Sitemap**: https://dvfr.illinois.gov/sitemap.xml
- **Documentation**: None (null)
- **Initial Scores**: Axe 88, Lighthouse 85
- **Description**: Committee established to address domestic violence-related fatalities and near-fatalities

### InfoNet
- **URL**: https://infonet.icjia.illinois.gov/
- **Sitemap**: https://infonet.icjia.illinois.gov/sitemap.xml
- **Documentation**: https://infonet.icjia.illinois.gov/documentation
- **Initial Scores**: Axe 91, Lighthouse 89
- **Description**: Web-based data collection system for victim service providers

## Database State

After running migrations:
- ✅ 2 real sites in `sites` table
- ✅ 12 historical records in `score_history` table
- ✅ 6 audit trail entries in `uploaded_files` table
- ✅ All foreign key relationships maintained
- ✅ RLS policies intact

## Next Steps

1. Run migrations: `supabase migration up`
2. Or use seed script: `node run-seed.js`
3. Verify in dashboard: http://localhost:5174
4. Both sites will display with trend charts showing 6 months of history

