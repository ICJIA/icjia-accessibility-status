/*
  ============================================================================
  MIGRATION 06: Add Key Rotation Columns to API Keys Table
  ============================================================================
  
  This migration adds missing columns for API key rotation functionality:
  - rotated_from_key_id: References the original key when a key is rotated
  - grace_period_expires_at: Timestamp when the grace period expires
  - updated_at: Track when the key was last updated
  
  This migration is safe to run multiple times (uses IF NOT EXISTS).
  
  ============================================================================
*/

-- Add missing columns to api_keys table if they don't exist
ALTER TABLE IF EXISTS api_keys
ADD COLUMN IF NOT EXISTS rotated_from_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS api_keys
ADD COLUMN IF NOT EXISTS grace_period_expires_at timestamptz;

ALTER TABLE IF EXISTS api_keys
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_grace_period_expires_at ON api_keys(grace_period_expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_rotated_from ON api_keys(rotated_from_key_id);

DO $$
BEGIN
  RAISE NOTICE 'Migration 06 complete: Key rotation columns added to api_keys table';
END $$;

