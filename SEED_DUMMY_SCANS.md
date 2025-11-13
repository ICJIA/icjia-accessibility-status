# Seeding Dummy Scan Data

## 🎯 Purpose

Pre-populate the database with dummy scan records so you can see the UI with existing scan history without having to trigger new scans.

---

## 📋 Dummy Data Structure

Each dummy scan includes:
- Random Lighthouse score (70-100)
- Random Axe score (90-100)
- Mock Lighthouse report with categories
- Mock Axe report with violations
- Status: "completed"
- Created at: Various timestamps (past 7 days)

---

## 🚀 How to Seed Data

### Option 1: Using Supabase Dashboard

1. Go to https://supabase.com
2. Login to your project
3. Go to SQL Editor
4. Create new query
5. Copy and paste the SQL below
6. Run the query

### Option 2: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Run migration
supabase db push
```

---

## 📝 SQL to Seed Dummy Scans

```sql
-- Get a site ID (replace with actual site ID from your database)
-- First, check what sites exist:
SELECT id, title FROM sites LIMIT 5;

-- Then use one of those IDs in the INSERT below
-- Replace 'YOUR_SITE_ID' with actual UUID

INSERT INTO scans (
  site_id,
  status,
  scan_type,
  lighthouse_score,
  axe_score,
  lighthouse_report,
  axe_report,
  created_at,
  updated_at,
  completed_at
) VALUES
-- Scan 1: 7 days ago
(
  'YOUR_SITE_ID',
  'completed',
  'both',
  85,
  95,
  '{"score": 85, "categories": {"performance": {"score": 82}, "accessibility": {"score": 88}, "best-practices": {"score": 85}, "seo": {"score": 90}}}',
  '{"violations": 2, "passes": 48, "incomplete": 1, "inapplicable": 15, "summary": {"critical": 0, "serious": 1, "moderate": 1, "minor": 0}}',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),
-- Scan 2: 5 days ago
(
  'YOUR_SITE_ID',
  'completed',
  'both',
  88,
  97,
  '{"score": 88, "categories": {"performance": {"score": 85}, "accessibility": {"score": 90}, "best-practices": {"score": 88}, "seo": {"score": 92}}}',
  '{"violations": 1, "passes": 50, "incomplete": 0, "inapplicable": 16, "summary": {"critical": 0, "serious": 0, "moderate": 1, "minor": 0}}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
-- Scan 3: 3 days ago
(
  'YOUR_SITE_ID',
  'completed',
  'both',
  92,
  98,
  '{"score": 92, "categories": {"performance": {"score": 90}, "accessibility": {"score": 93}, "best-practices": {"score": 92}, "seo": {"score": 95}}}',
  '{"violations": 0, "passes": 52, "incomplete": 0, "inapplicable": 17, "summary": {"critical": 0, "serious": 0, "moderate": 0, "minor": 0}}',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
-- Scan 4: 1 day ago (Lighthouse only)
(
  'YOUR_SITE_ID',
  'completed',
  'lighthouse',
  90,
  NULL,
  '{"score": 90, "categories": {"performance": {"score": 88}, "accessibility": {"score": 91}, "best-practices": {"score": 90}, "seo": {"score": 93}}}',
  NULL,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
-- Scan 5: Today (Axe only)
(
  'YOUR_SITE_ID',
  'completed',
  'axe',
  NULL,
  99,
  NULL,
  '{"violations": 0, "passes": 53, "incomplete": 0, "inapplicable": 18, "summary": {"critical": 0, "serious": 0, "moderate": 0, "minor": 0}}',
  NOW(),
  NOW(),
  NOW()
);
```

---

## 🔍 Verify Seeded Data

```sql
-- Check scans for a specific site
SELECT 
  id,
  status,
  scan_type,
  lighthouse_score,
  axe_score,
  created_at
FROM scans
WHERE site_id = 'YOUR_SITE_ID'
ORDER BY created_at DESC;
```

---

## 🗑️ Delete Dummy Data

```sql
-- Delete all scans for a site
DELETE FROM scans WHERE site_id = 'YOUR_SITE_ID';

-- Delete all scans (careful!)
DELETE FROM scans;
```

---

## 📊 What You'll See

After seeding, when you navigate to a site detail page:

1. **Accessibility Scans section** shows 5 scan records
2. **Scan history** displays:
   - 7 days ago: LH 85, Axe 95
   - 5 days ago: LH 88, Axe 97
   - 3 days ago: LH 92, Axe 98
   - 1 day ago: LH 90 (Lighthouse only)
   - Today: Axe 99 (Axe only)
3. **Reports** show mock data for each scan
4. **Status** shows "completed" for all

---

## 💡 Tips

- Use actual site IDs from your database
- Modify scores to test different scenarios
- Add more scans with different timestamps
- Test with different scan_type values
- Verify reports display correctly

---

## 🎯 Next Steps

1. Seed dummy data
2. Navigate to site detail page
3. Verify scans display correctly
4. Test "Run Scan" button to add new scans
5. Verify polling updates UI

