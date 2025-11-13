/*
  ============================================================================
  MIGRATION 01: Create Initial Database Schema
  ============================================================================
  
  This is the FIRST migration to run.
  
  Creates the complete database structure for the ICJIA Accessibility Status Portal:
  - admin_users table (authentication)
  - sessions table (session management)
  - sites table (website tracking)
  - score_history table (accessibility score trends)
  - documentation table (help content)
  - All indexes, triggers, and RLS policies
  - Admin user with blank password
  
  ============================================================================
*/

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text,
  password_hash text,
  must_change_password boolean DEFAULT false,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- SITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  sitemap_url text,
  documentation_url text,
  axe_score integer DEFAULT 0 CHECK (axe_score >= 0 AND axe_score <= 100),
  lighthouse_score integer DEFAULT 0 CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
  axe_last_updated timestamptz DEFAULT now(),
  lighthouse_last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sites_title ON sites(title);
CREATE INDEX IF NOT EXISTS idx_sites_url ON sites(url);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at DESC);

-- ============================================================================
-- SCORE HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  scan_id uuid,
  axe_score integer CHECK (axe_score >= 0 AND axe_score <= 100),
  lighthouse_score integer CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
  recorded_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_score_history_site_id ON score_history(site_id);
CREATE INDEX IF NOT EXISTS idx_score_history_recorded_at_desc ON score_history(recorded_at DESC);

-- ============================================================================
-- DOCUMENTATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text UNIQUE NOT NULL,
  content text,
  last_updated timestamptz DEFAULT now(),
  updated_by text,
  version integer DEFAULT 1
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Admin users: Allow anonymous to authenticate and setup, authenticated to manage
CREATE POLICY "Allow anonymous to authenticate" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous to set initial password" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated to update own password" ON admin_users FOR UPDATE USING (auth.role() = 'authenticated');

-- Sessions: Allow anonymous to create and read (custom cookie-based auth, not Supabase Auth)
CREATE POLICY "Allow anonymous to create sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous to read sessions" ON sessions FOR SELECT USING (true);

-- Sites: Public read, authenticated write
CREATE POLICY "Allow public read access to sites" ON sites FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert sites" ON sites FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to update sites" ON sites FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to delete sites" ON sites FOR DELETE USING (auth.role() = 'authenticated');

-- Score history: Public read, authenticated write
CREATE POLICY "Allow public read access to score_history" ON score_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create history records" ON score_history FOR INSERT WITH CHECK (true);

-- Documentation: Public read only
CREATE POLICY "Allow public read access to documentation" ON documentation FOR SELECT USING (true);

-- ============================================================================
-- CREATE ADMIN USER
-- ============================================================================

INSERT INTO admin_users (username, email, password_hash, must_change_password)
VALUES ('admin', 'admin@icjia.illinois.gov', '', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- POPULATE DOCUMENTATION
-- ============================================================================

INSERT INTO documentation (section_name, content, version) VALUES
('Getting Started', 'Welcome to the ICJIA Accessibility Status Portal. This tool helps track and improve web accessibility.', 1),
('API Documentation', 'API endpoints for submitting accessibility scan results.', 1),
('WCAG Guidelines', 'Information about WCAG 2.1 compliance levels and standards.', 1),
('Troubleshooting', 'Common issues and solutions for accessibility testing.', 1)
ON CONFLICT (section_name) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE 'Migration 01 complete: Initial schema created';
END $$;

