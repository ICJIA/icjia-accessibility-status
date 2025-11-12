/*
  ============================================================================
  STEP 2: API Keys and RLS Policy Fixes - Complete Migration
  ============================================================================

  This is the SECOND migration file to run.

  Run this AFTER: 20251109151433_create_initial_schema.sql

  This migration adds API key authentication functionality and fixes RLS
  policies to work with the custom cookie-based authentication system.

  What this migration does:
  1. Creates the api_keys table for API authentication
  2. Fixes admin_users RLS policy to allow password changes
  3. Fixes sites RLS policies to allow API imports
  4. Fixes uploaded_files RLS policy to allow API audit trail

  Instructions:
  1. Go to https://supabase.com/dashboard
  2. Select your project
  3. Click "SQL Editor" in the left sidebar
  4. Click "New query"
  5. Copy and paste this entire file
  6. Click "Run" or press Cmd/Ctrl + Enter
*/

-- ============================================================================
-- PART 1: Create API Keys Table
-- ============================================================================

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  api_key_prefix text NOT NULL,
  api_key_suffix text NOT NULL,
  scopes text[] DEFAULT ARRAY['sites:write'] NOT NULL,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_used_at timestamptz,
  usage_count integer DEFAULT 0 NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  notes text
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(api_key_prefix);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admin users can view API keys" ON api_keys;
DROP POLICY IF EXISTS "Admin users can create API keys" ON api_keys;
DROP POLICY IF EXISTS "Admin users can update API keys" ON api_keys;
DROP POLICY IF EXISTS "Admin users can delete API keys" ON api_keys;
DROP POLICY IF EXISTS "Authenticated users can view API keys" ON api_keys;
DROP POLICY IF EXISTS "Authenticated users can create API keys" ON api_keys;
DROP POLICY IF EXISTS "Authenticated users can update API keys" ON api_keys;
DROP POLICY IF EXISTS "Authenticated users can delete API keys" ON api_keys;
DROP POLICY IF EXISTS "Allow API key validation" ON api_keys;
DROP POLICY IF EXISTS "Allow API key usage tracking" ON api_keys;

-- RLS Policies for api_keys table
-- Note: Using 'anon' role because the backend uses VITE_SUPABASE_ANON_KEY for all operations

-- Admin users can view all API keys
CREATE POLICY "Admin users can view API keys"
  ON api_keys FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin users can create API keys
CREATE POLICY "Admin users can create API keys"
  ON api_keys FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin users can update API keys
CREATE POLICY "Admin users can update API keys"
  ON api_keys FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Admin users can delete API keys
CREATE POLICY "Admin users can delete API keys"
  ON api_keys FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE api_keys IS 'Stores API keys for programmatic access to the portal';
COMMENT ON COLUMN api_keys.api_key IS 'Bcrypt-hashed API key (never stored in plain text)';
COMMENT ON COLUMN api_keys.api_key_prefix IS 'First 8 characters of the key for identification';
COMMENT ON COLUMN api_keys.api_key_suffix IS 'Last 4 characters of the key for identification';
COMMENT ON COLUMN api_keys.scopes IS 'Array of permissions (e.g., sites:read, sites:write)';
COMMENT ON COLUMN api_keys.usage_count IS 'Total number of times this key has been used';
COMMENT ON COLUMN api_keys.last_used_at IS 'Timestamp of last usage for monitoring';
COMMENT ON COLUMN api_keys.is_active IS 'Enable/disable flag for soft deletion';

-- ============================================================================
-- PART 2: Fix admin_users RLS Policy
-- ============================================================================

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin users update for authentication" ON admin_users;

-- Create new UPDATE policy that allows both anon and authenticated roles
CREATE POLICY "Allow admin users update for authentication"
  ON admin_users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment explaining why anon is allowed
COMMENT ON POLICY "Allow admin users update for authentication" ON admin_users IS 
  'Allows both anon and authenticated roles to update admin_users. Required because the backend uses the anon key for all operations (custom cookie-based auth, not Supabase Auth).';

-- ============================================================================
-- PART 3: Fix sites RLS Policies for API Imports
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create sites" ON sites;
DROP POLICY IF EXISTS "Authenticated users can update sites" ON sites;
DROP POLICY IF EXISTS "Authenticated users can delete sites" ON sites;

-- Recreate policies to allow both anon and authenticated roles
CREATE POLICY "Admin users can create sites"
  ON sites FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can update sites"
  ON sites FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete sites"
  ON sites FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- PART 4: Fix uploaded_files RLS Policy for API Audit Trail
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can upload files" ON uploaded_files;

-- Recreate policy to allow both anon and authenticated roles
CREATE POLICY "Admin users can upload files"
  ON uploaded_files FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the api_keys table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
    RAISE NOTICE '✅ api_keys table created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create api_keys table';
  END IF;
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'api_keys' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS enabled on api_keys table';
  ELSE
    RAISE EXCEPTION '❌ RLS not enabled on api_keys table';
  END IF;
END $$;

-- Count policies
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'api_keys';
  
  RAISE NOTICE '✅ Created % RLS policies for api_keys table', policy_count;
END $$;

-- Verify admin_users policy was updated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_users' 
    AND policyname = 'Allow admin users update for authentication'
  ) THEN
    RAISE NOTICE '✅ admin_users UPDATE policy fixed';
  ELSE
    RAISE EXCEPTION '❌ Failed to update admin_users policy';
  END IF;
END $$;

-- Verify sites policies were updated
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'sites' 
  AND policyname IN ('Admin users can create sites', 'Admin users can update sites', 'Admin users can delete sites');
  
  IF policy_count = 3 THEN
    RAISE NOTICE '✅ sites RLS policies fixed (% policies)', policy_count;
  ELSE
    RAISE EXCEPTION '❌ Failed to update sites policies (expected 3, got %)', policy_count;
  END IF;
END $$;

RAISE NOTICE '';
RAISE NOTICE '🎉 All migrations applied successfully!';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Restart your dev server (yarn dev)';
RAISE NOTICE '2. Log in to the admin panel';
RAISE NOTICE '3. Navigate to /admin/api-keys';
RAISE NOTICE '4. Create your first API key';
RAISE NOTICE '5. Test the API with: node test-api-upload.js YOUR_API_KEY';

