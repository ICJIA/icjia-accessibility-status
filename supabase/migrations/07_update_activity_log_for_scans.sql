/*
  ============================================================================
  MIGRATION 07: Update Activity Log for Scan Tracking
  ============================================================================
  
  This migration updates the activity_log table to properly track scan events
  with the schema expected by the ActivityLog component.
  
  Changes:
  - Add event_type column (replaces 'action')
  - Add event_description column (human-readable description)
  - Add severity column (info, warning, error)
  - Add created_by_user and created_by_api_key columns
  - Add ip_address and user_agent columns
  - Rename details to metadata
  - Add site_id for scan-related activities
  
  ============================================================================
*/

-- ============================================================================
-- ALTER ACTIVITY LOG TABLE
-- ============================================================================

-- Add new columns if they don't exist
ALTER TABLE activity_log
ADD COLUMN IF NOT EXISTS event_type text,
ADD COLUMN IF NOT EXISTS event_description text,
ADD COLUMN IF NOT EXISTS severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
ADD COLUMN IF NOT EXISTS created_by_user uuid REFERENCES admin_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_api_key uuid REFERENCES api_keys(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Migrate existing data from 'action' to 'event_type' if needed
UPDATE activity_log 
SET event_type = action, 
    event_description = action
WHERE event_type IS NULL AND action IS NOT NULL;

-- Migrate existing data from 'details' to 'metadata' if needed
UPDATE activity_log 
SET metadata = details
WHERE metadata IS NULL AND details IS NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_log_event_type ON activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_site_id ON activity_log(site_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_severity ON activity_log(severity);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_by_user ON activity_log(created_by_user);

DO $$
BEGIN
  RAISE NOTICE 'Migration 07 complete: Activity log updated for scan tracking';
END $$;

