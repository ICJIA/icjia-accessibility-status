/*
  ============================================================================
  MIGRATION 04: Add Scan Violations Table for Detailed Reports
  ============================================================================
  
  This is the FOURTH migration to run.
  
  Creates table for:
  - Detailed accessibility violation data from scans
  - Violation filtering by WCAG level, impact level, and page URL
  - Violation remediation guidance
  
  ============================================================================
*/

-- ============================================================================
-- SCAN VIOLATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scan_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  violation_type text NOT NULL CHECK (violation_type IN ('axe', 'lighthouse')),
  rule_id text NOT NULL,
  rule_name text NOT NULL,
  description text NOT NULL,
  impact_level text NOT NULL CHECK (impact_level IN ('critical', 'serious', 'moderate', 'minor')),
  wcag_level text NOT NULL CHECK (wcag_level IN ('A', 'AA', 'AAA')),
  page_url text NOT NULL,
  element_selector text,
  element_count integer DEFAULT 1,
  help_url text,
  suggested_fix text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_scan_violations_scan_id ON scan_violations(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_violations_impact_level ON scan_violations(impact_level);
CREATE INDEX IF NOT EXISTS idx_scan_violations_wcag_level ON scan_violations(wcag_level);
CREATE INDEX IF NOT EXISTS idx_scan_violations_page_url ON scan_violations(page_url);
CREATE INDEX IF NOT EXISTS idx_scan_violations_violation_type ON scan_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_scan_violations_created_at ON scan_violations(created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE scan_violations IS 'Stores detailed accessibility violation data from scans';
COMMENT ON COLUMN scan_violations.violation_type IS 'Type of violation: axe or lighthouse';
COMMENT ON COLUMN scan_violations.impact_level IS 'Severity level: critical, serious, moderate, or minor';
COMMENT ON COLUMN scan_violations.wcag_level IS 'WCAG compliance level: A, AA, or AAA';
COMMENT ON COLUMN scan_violations.page_url IS 'URL of the page where the violation was found';
COMMENT ON COLUMN scan_violations.element_selector IS 'CSS selector of the affected element';
COMMENT ON COLUMN scan_violations.suggested_fix IS 'Recommended remediation for the violation';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE scan_violations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to scan_violations" ON scan_violations FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated to insert scan_violations" ON scan_violations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated to delete scan_violations" ON scan_violations FOR DELETE USING (auth.role() = 'authenticated');

DO $$
BEGIN
  RAISE NOTICE 'Migration 04 complete: Scan violations table created';
END $$;

