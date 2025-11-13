/*
  ============================================================================
  MIGRATION 03: Add Scans and Scan Results Tables
  ============================================================================
  
  This is the THIRD migration to run.
  
  Creates tables for:
  - Scan jobs and results (Lighthouse and Axe)
  - Detailed scan results with violations and warnings
  - Scan status tracking
  
  ============================================================================
*/

-- ============================================================================
-- SCANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  scan_type text NOT NULL CHECK (scan_type IN ('lighthouse', 'axe', 'both')) DEFAULT 'both',
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  lighthouse_score integer CHECK (lighthouse_score IS NULL OR (lighthouse_score >= 0 AND lighthouse_score <= 100)),
  axe_score integer CHECK (axe_score IS NULL OR (axe_score >= 0 AND axe_score <= 100)),
  lighthouse_report jsonb,
  axe_report jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scans_site_id ON scans(site_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_admin_id ON scans(admin_id);

-- ============================================================================
-- SCAN RESULTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  result_type text NOT NULL CHECK (result_type IN ('lighthouse', 'axe')),
  score integer CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  violations jsonb,
  warnings jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_result_type ON scan_results(result_type);

-- ============================================================================
-- UPDATE SCORE HISTORY TABLE
-- ============================================================================

-- Add scan_id column to score_history if it doesn't exist
ALTER TABLE score_history
ADD COLUMN IF NOT EXISTS scan_id uuid REFERENCES scans(id) ON DELETE CASCADE;

-- Create index on scan_id for performance
CREATE INDEX IF NOT EXISTS idx_score_history_scan_id ON score_history(scan_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

-- Scans: Public read, authenticated write
CREATE POLICY "Allow public read access to scans" ON scans FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert scans" ON scans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to update scans" ON scans FOR UPDATE USING (auth.role() = 'authenticated');

-- Scan Results: Public read, authenticated write
CREATE POLICY "Allow public read access to scan_results" ON scan_results FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert scan_results" ON scan_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update score_history RLS if needed
DROP POLICY IF EXISTS "Authenticated users can create history records" ON score_history;
CREATE POLICY "Authenticated users can create history records" ON score_history FOR INSERT WITH CHECK (true);

DO $$
BEGIN
  RAISE NOTICE 'Migration 03 complete: Scans and results tables created';
END $$;

