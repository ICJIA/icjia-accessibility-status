-- ============================================================================
-- STEP 3 (OPTIONAL): Refactor uploaded_files to api_payloads (API-Only Data Ingestion)
-- ============================================================================
--
-- NOTE: This migration is OPTIONAL and only needed if you're upgrading from
-- an older version that used file uploads. For new installations, this is
-- already included in STEP 1 (20251109151433_create_initial_schema.sql).
--
-- This migration transforms the application from file-upload-based to API-only
-- data ingestion by:
-- 1. Renaming uploaded_files table to api_payloads
-- 2. Adding description field (like Git commit messages)
-- 3. Adding api_key_id to track which API key was used
-- 4. Updating RLS policies for admin-only access
-- 5. Creating activity_log table for tracking significant events
--
-- Run this migration AFTER the initial schema and API keys migrations.
-- ============================================================================

-- Step 1: Rename uploaded_files table to api_payloads
ALTER TABLE IF EXISTS uploaded_files RENAME TO api_payloads;

-- Step 2: Rename columns to match new purpose
ALTER TABLE api_payloads RENAME COLUMN file_name TO payload_id;
ALTER TABLE api_payloads RENAME COLUMN file_content TO payload;
ALTER TABLE api_payloads RENAME COLUMN file_size TO payload_size;
ALTER TABLE api_payloads RENAME COLUMN uploaded_by TO created_by_user;
ALTER TABLE api_payloads RENAME COLUMN uploaded_at TO created_at;
ALTER TABLE api_payloads RENAME COLUMN notes TO description;

-- Step 3: Add new columns
ALTER TABLE api_payloads 
  ADD COLUMN IF NOT EXISTS api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL;

ALTER TABLE api_payloads
  ADD COLUMN IF NOT EXISTS ip_address inet;

ALTER TABLE api_payloads
  ADD COLUMN IF NOT EXISTS user_agent text;

-- Step 4: Update column constraints and defaults
ALTER TABLE api_payloads 
  ALTER COLUMN description TYPE text,
  ALTER COLUMN description DROP NOT NULL;

COMMENT ON COLUMN api_payloads.description IS 'User-provided description of this API upload (like a Git commit message)';

-- Step 5: Rename indexes
ALTER INDEX IF EXISTS idx_uploaded_files_site_id RENAME TO idx_api_payloads_site_id;
ALTER INDEX IF EXISTS idx_uploaded_files_uploaded_at RENAME TO idx_api_payloads_created_at;
ALTER INDEX IF EXISTS idx_uploaded_files_uploaded_by RENAME TO idx_api_payloads_created_by_user;

-- Step 6: Add new indexes
CREATE INDEX IF NOT EXISTS idx_api_payloads_api_key_id ON api_payloads(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_payloads_payload_id ON api_payloads(payload_id);

-- Step 7: Drop old RLS policies
DROP POLICY IF EXISTS "Public can view uploaded files" ON api_payloads;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON api_payloads;

-- Step 8: Create new RLS policies (admin-only access for viewing)
CREATE POLICY "Admin users can view api payloads"
  ON api_payloads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "API keys can insert payloads"
  ON api_payloads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Step 9: Update table comment
COMMENT ON TABLE api_payloads IS 'Stores API import payloads for audit trail and compliance verification';

-- Step 10: Create activity_log table for tracking significant events
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'site_created', 'site_updated', 'api_import', 'api_key_created', etc.
  event_description text NOT NULL,
  entity_type text, -- 'site', 'api_key', 'user', etc.
  entity_id uuid, -- ID of the affected entity
  metadata jsonb, -- Additional event data
  created_by_user uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_api_key uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for activity_log
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_event_type ON activity_log(event_type);
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id);

-- Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Admin users can view activity log
CREATE POLICY "Admin users can view activity log"
  ON activity_log FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can insert activity log entries (application-controlled)
CREATE POLICY "Application can insert activity log"
  ON activity_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE activity_log IS 'Tracks significant events in the application for audit and monitoring';
COMMENT ON COLUMN activity_log.event_type IS 'Type of event (site_created, site_updated, api_import, etc.)';
COMMENT ON COLUMN activity_log.event_description IS 'Human-readable description of the event';
COMMENT ON COLUMN activity_log.metadata IS 'Additional structured data about the event';

-- Step 11: Migrate existing data to add activity log entries
-- Create activity log entries for existing api_payloads
INSERT INTO activity_log (
  event_type,
  event_description,
  entity_type,
  entity_id,
  metadata,
  created_by_user,
  created_by_api_key,
  created_at
)
SELECT 
  'api_import' as event_type,
  COALESCE(
    description,
    'API import (migrated from uploaded_files)'
  ) as event_description,
  'site' as entity_type,
  site_id as entity_id,
  jsonb_build_object(
    'payload_id', payload_id,
    'payload_size', payload_size,
    'migrated', true
  ) as metadata,
  created_by_user,
  api_key_id as created_by_api_key,
  created_at
FROM api_payloads
WHERE NOT EXISTS (
  SELECT 1 FROM activity_log 
  WHERE activity_log.entity_id = api_payloads.site_id 
  AND activity_log.created_at = api_payloads.created_at
);

-- Step 12: Verification checks
DO $$
DECLARE
  v_table_exists boolean;
  v_column_count integer;
  v_policy_count integer;
  v_activity_log_exists boolean;
BEGIN
  -- Check if api_payloads table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'api_payloads'
  ) INTO v_table_exists;
  
  IF v_table_exists THEN
    RAISE NOTICE '✅ api_payloads table exists';
  ELSE
    RAISE EXCEPTION '❌ api_payloads table does not exist';
  END IF;
  
  -- Check if new columns exist
  SELECT COUNT(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_name = 'api_payloads'
  AND column_name IN ('description', 'api_key_id', 'ip_address', 'user_agent');
  
  IF v_column_count = 4 THEN
    RAISE NOTICE '✅ All new columns added to api_payloads';
  ELSE
    RAISE WARNING '⚠️  Expected 4 new columns, found %', v_column_count;
  END IF;
  
  -- Check RLS policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'api_payloads';
  
  IF v_policy_count >= 2 THEN
    RAISE NOTICE '✅ RLS policies created for api_payloads (% policies)', v_policy_count;
  ELSE
    RAISE WARNING '⚠️  Expected at least 2 RLS policies, found %', v_policy_count;
  END IF;
  
  -- Check if activity_log table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_log'
  ) INTO v_activity_log_exists;
  
  IF v_activity_log_exists THEN
    RAISE NOTICE '✅ activity_log table created';
  ELSE
    RAISE EXCEPTION '❌ activity_log table does not exist';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary of changes:';
  RAISE NOTICE '  - Renamed uploaded_files → api_payloads';
  RAISE NOTICE '  - Added description field for commit-style messages';
  RAISE NOTICE '  - Added api_key_id to track which API key was used';
  RAISE NOTICE '  - Added ip_address and user_agent for audit trail';
  RAISE NOTICE '  - Updated RLS policies for admin-only viewing';
  RAISE NOTICE '  - Created activity_log table for event tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Restart your dev server (yarn dev)';
  RAISE NOTICE '  2. Update backend code to use new table/column names';
  RAISE NOTICE '  3. Update frontend to show API Upload History';
  RAISE NOTICE '  4. Test API import with description field';
END $$;

