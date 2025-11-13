/*
  ============================================================================
  MIGRATION 02: Add API Keys and API Payloads Tables
  ============================================================================
  
  This is the SECOND migration to run.
  
  Creates tables for:
  - API key management and authentication
  - API payload tracking (for score submissions via API)
  - Audit trail for API submissions
  
  ============================================================================
*/

-- ============================================================================
-- API KEYS TABLE
-- ============================================================================

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
  notes text,
  -- Key rotation fields
  rotated_from_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  grace_period_expires_at timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_grace_period_expires_at ON api_keys(grace_period_expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_rotated_from ON api_keys(rotated_from_key_id);

-- ============================================================================
-- API PAYLOADS TABLE (for tracking API submissions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_payloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  payload_type text NOT NULL CHECK (payload_type IN ('lighthouse', 'axe', 'both')),
  axe_score integer CHECK (axe_score IS NULL OR (axe_score >= 0 AND axe_score <= 100)),
  lighthouse_score integer CHECK (lighthouse_score IS NULL OR (lighthouse_score >= 0 AND lighthouse_score <= 100)),
  payload_data jsonb,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_payloads_site_id ON api_payloads(site_id);
CREATE INDEX IF NOT EXISTS idx_api_payloads_api_key_id ON api_payloads(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_payloads_submitted_at ON api_payloads(submitted_at DESC);

-- ============================================================================
-- ACTIVITY LOG TABLE (for audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_api_key_id ON activity_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- API Keys: Authenticated users can read/manage
CREATE POLICY "Allow authenticated to read api_keys" ON api_keys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to insert api_keys" ON api_keys FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to update api_keys" ON api_keys FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to delete api_keys" ON api_keys FOR DELETE USING (auth.role() = 'authenticated');

-- API Payloads: Public read, authenticated write
CREATE POLICY "Allow public read access to api_payloads" ON api_payloads FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert api_payloads" ON api_payloads FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Activity Log: Authenticated read only
CREATE POLICY "Allow authenticated to read activity_log" ON activity_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to insert activity_log" ON activity_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DO $$
BEGIN
  RAISE NOTICE 'Migration 02 complete: API keys and payloads tables created';
END $$;

