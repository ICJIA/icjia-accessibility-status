# Database Migration Instructions

## Current Status

The application is now **fully authenticated** and working! The session cookie is being forwarded correctly through the Vite proxy.

The scan functionality is also working! However, there's a 500 error on the payloads endpoint because the backend expects the `api_payloads` table, but the initial schema created it as `uploaded_files`.

## What Needs to Be Done

Apply the following migration to rename the table:

**`step_3c_rename_uploaded_files_to_api_payloads.sql`** - Renames table and columns:
- Renames `uploaded_files` table to `api_payloads`
- Renames columns to match new purpose (API-only data ingestion)
- Adds `api_key_id`, `ip_address`, `user_agent` columns
- Updates indexes and RLS policies

## How to Apply the Migration

### Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `tynvamapztqxzjfbwtra`
3. Go to **SQL Editor** → Click **New query**
4. Open: `supabase/migrations/step_3c_rename_uploaded_files_to_api_payloads.sql`
5. Copy ALL contents and paste into SQL Editor
6. Click **Run**

## Verification

After applying the migration:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see the `api_payloads` table (renamed from `uploaded_files`)
3. Refresh the browser at http://localhost:5174/sites/[site-id]
4. The payloads section should now load without errors

## Next Steps

Once the migration is applied:

1. Restart the backend: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart backend`
2. Refresh the browser
3. The payloads endpoint should now work correctly
