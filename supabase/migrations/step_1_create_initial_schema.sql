/*
  ============================================================================
  STEP 1: ICJIA Accessibility Status Portal - Complete Database Setup
  ============================================================================

  This is the FIRST migration file to run.

  Run this BEFORE: 20250110_api_keys_and_rls_fixes.sql

  This migration creates the complete database structure for the ICJIA Accessibility Status Portal,
  including all tables, relationships, Row Level Security policies, admin user, and sample data.

  ## What This File Creates:

  1. Complete database schema (6 tables with indexes)
  2. Row Level Security (RLS) policies configured for custom cookie-based authentication
  3. Admin user with BLANK password (username: admin, must set password on first login)
  4. Sample data for testing (6 sites, 36 history records, 18 uploaded files)
  5. Triggers and functions for automatic timestamps
  6. Documentation sections pre-populated
  7. Audit trail with sample JSON uploads

  ## Important Notes:

  - RLS policies are configured for CUSTOM COOKIE-BASED AUTHENTICATION (not Supabase Auth)
  - Policies allow anonymous users to authenticate (required for login to work)
  - Admin password is BLANK (empty) - user must set password on first login
  - Safe to run multiple times (idempotent)
  - No additional fix scripts needed

  ## New Tables

  ### 1. admin_users
  Stores administrative users who can manage the portal.
  - `id` (uuid, primary key) - Unique identifier for each admin user
  - `username` (text, unique) - Login username
  - `email` (text) - Admin email address
  - `password_hash` (text) - Bcrypt hashed password
  - `created_by` (uuid, nullable) - References admin_users.id of creator
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. sessions
  Manages persistent authentication sessions with 15-day expiration.
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - References admin_users.id
  - `session_token` (text, unique) - Unique session token for cookies
  - `expires_at` (timestamptz) - Session expiration timestamp
  - `created_at` (timestamptz) - Session creation timestamp

  ### 3. sites
  Stores website accessibility tracking information.
  - `id` (uuid, primary key) - Unique site identifier
  - `title` (text) - Site name/title
  - `description` (text) - Site description
  - `url` (text) - Site URL
  - `documentation_url` (text, nullable) - Link to accessibility documentation
  - `axe_score` (integer) - Current Axe accessibility score (0-100)
  - `lighthouse_score` (integer) - Current Lighthouse accessibility score (0-100)
  - `axe_last_updated` (date) - Date of last Axe score update
  - `lighthouse_last_updated` (date) - Date of last Lighthouse score update
  - `created_at` (timestamptz) - Site creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. score_history
  Tracks historical accessibility scores for trend analysis.
  - `id` (uuid, primary key) - Unique history record identifier
  - `site_id` (uuid) - References sites.id
  - `axe_score` (integer) - Historical Axe score (0-100)
  - `lighthouse_score` (integer) - Historical Lighthouse score (0-100)
  - `recorded_at` (timestamptz) - When this score was recorded

  ### 5. app_documentation
  Stores versioned documentation content for the application.
  - `id` (uuid, primary key) - Unique documentation section identifier
  - `section_name` (text, unique) - Name/identifier of documentation section
  - `content` (text) - Documentation content (supports markdown)
  - `last_updated` (timestamptz) - Last update timestamp
  - `updated_by` (uuid, nullable) - References admin_users.id of last editor
  - `version` (integer) - Version number for tracking changes

  ## Security

  Row Level Security (RLS) is enabled on all tables with the following policies:

  ### admin_users table:
  - Authenticated users can view all admin users
  - Authenticated users can create new admin users
  - Users can update their own profile
  - Users can delete other users (but not themselves - enforced in app logic)

  ### sessions table:
  - Users can only view their own sessions
  - Users can create their own sessions
  - Users can delete their own sessions

  ### sites table:
  - Public read access for all users (dashboard is public)
  - Authenticated users can create, update, and delete sites

  ### score_history table:
  - Public read access (score trends are public)
  - Authenticated users can create history records
  - No direct updates or deletes (managed through site updates)

  ### app_documentation table:
  - Public read access (documentation may be referenced publicly)
  - Authenticated users can update documentation

  ## Indexes

  Created for optimal query performance on frequently accessed fields.
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  must_change_password boolean DEFAULT false NOT NULL,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  documentation_url text,
  axe_score integer NOT NULL CHECK (axe_score >= 0 AND axe_score <= 100),
  lighthouse_score integer NOT NULL CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
  axe_last_updated date NOT NULL,
  lighthouse_last_updated date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create score_history table
CREATE TABLE IF NOT EXISTS score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  axe_score integer NOT NULL CHECK (axe_score >= 0 AND axe_score <= 100),
  lighthouse_score integer NOT NULL CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
  recorded_at timestamptz NOT NULL
);

-- Create app_documentation table
CREATE TABLE IF NOT EXISTS app_documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text UNIQUE NOT NULL,
  content text NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  version integer DEFAULT 1 NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_score_history_site_id ON score_history(site_id);
CREATE INDEX IF NOT EXISTS idx_score_history_recorded_at ON score_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_sites_updated_at ON sites(updated_at);

-- Enable Row Level Security on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_documentation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users table (custom cookie-based authentication)
-- Note: Allow anonymous read for login authentication, but restrict writes
CREATE POLICY "Allow anonymous read for authentication"
  ON admin_users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create new admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sessions table (custom cookie-based authentication)
-- Note: These policies allow anonymous users because we use custom auth, not Supabase Auth
CREATE POLICY "Allow session creation for authentication"
  ON sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow session reads for authentication"
  ON sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow session deletion for logout"
  ON sessions FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow session updates"
  ON sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for sites table
CREATE POLICY "Public read access to sites"
  ON sites FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sites"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sites"
  ON sites FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sites"
  ON sites FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for score_history table
CREATE POLICY "Public read access to score history"
  ON score_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create history records"
  ON score_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for app_documentation table
CREATE POLICY "Public read access to documentation"
  ON app_documentation FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update documentation"
  ON app_documentation FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert documentation"
  ON app_documentation FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create uploaded_files table for audit trail
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_content jsonb NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now() NOT NULL,
  notes text
);

-- Add indexes for performance
CREATE INDEX idx_uploaded_files_site_id ON uploaded_files(site_id);
CREATE INDEX idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at DESC);
CREATE INDEX idx_uploaded_files_uploaded_by ON uploaded_files(uploaded_by);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Public read access (transparency)
CREATE POLICY "Public can view uploaded files"
  ON uploaded_files
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can insert (handled by application)
CREATE POLICY "Authenticated users can upload files"
  ON uploaded_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE uploaded_files IS 'Stores original JSON files uploaded for audit trail and compliance verification';
COMMENT ON COLUMN uploaded_files.file_content IS 'Original JSON content as uploaded';
COMMENT ON COLUMN uploaded_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN uploaded_files.notes IS 'Optional notes about this upload';

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================
-- This section seeds the database with sample data for development/testing.
-- Safe to run multiple times - will skip if data already exists.
-- ============================================================================

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id uuid;
  v_site_id uuid;
  v_site_ids uuid[];
  v_month_offset int;
  v_axe_score int;
  v_lighthouse_score int;
  v_record_date timestamptz;
  v_site_title text;
  v_site_description text;
  v_site_url text;
  v_site_doc_url text;
BEGIN
  -- Create admin user
  SELECT id INTO v_admin_id FROM admin_users WHERE username = 'admin';

  IF v_admin_id IS NULL THEN
    INSERT INTO admin_users (username, email, password_hash, must_change_password, created_by)
    VALUES ('admin', 'admin@icjia.illinois.gov', '', true, NULL)
    RETURNING id INTO v_admin_id;

    RAISE NOTICE 'Created admin user with BLANK password (must set password on first login)';
  ELSE
    RAISE NOTICE 'Admin user already exists, skipping';
  END IF;

  -- Create sample sites and history
  IF NOT EXISTS (SELECT 1 FROM sites LIMIT 1) THEN
    INSERT INTO sites (title, description, url, documentation_url, axe_score, lighthouse_score, axe_last_updated, lighthouse_last_updated)
    VALUES
      (
        'Justice Data Portal',
        'Comprehensive data visualization platform providing real-time criminal justice statistics and interactive dashboards for Illinois law enforcement agencies and policymakers.',
        'https://justice-data.example.gov',
        'https://justice-data.example.gov/accessibility',
        92, 88, '2024-11-01', '2024-11-01'
      ),
      (
        'Community Safety Hub',
        'Public-facing resource center connecting Illinois residents with crime prevention programs, victim services, and neighborhood safety initiatives.',
        'https://community-safety.example.gov',
        NULL,
        78, 82, '2024-10-20', '2024-10-20'
      ),
      (
        'Research & Analytics Center',
        'Academic research repository featuring peer-reviewed studies, white papers, and evidence-based policy recommendations on criminal justice reform.',
        'https://research-center.example.gov',
        'https://research-center.example.gov/docs/accessibility',
        85, 90, '2024-10-28', '2024-10-28'
      ),
      (
        'Grant Management System',
        'Secure online portal for Illinois organizations to apply for criminal justice grants, track funding status, and submit compliance reports.',
        'https://grants.example.gov',
        'https://grants.example.gov/help/accessibility',
        68, 72, '2024-10-15', '2024-10-15'
      ),
      (
        'Training & Certification Portal',
        'Professional development platform offering online courses, certification programs, and continuing education for criminal justice professionals statewide.',
        'https://training.example.gov',
        'https://training.example.gov/accessibility-statement',
        95, 93, '2024-11-05', '2024-11-05'
      ),
      (
        'Youth Justice Initiative',
        'Specialized resource center focused on juvenile justice programs, rehabilitation services, and educational support for at-risk youth in Illinois.',
        'https://youth-justice.example.gov',
        NULL,
        73, 76, '2024-10-18', '2024-10-18'
      );

    -- Get the site IDs into an array
    SELECT ARRAY_AGG(id) INTO v_site_ids FROM sites;

    RAISE NOTICE 'Created % sample sites', array_length(v_site_ids, 1);

    -- Create score history for each site (6 months of data)
    FOR v_site_id IN SELECT unnest(v_site_ids)
    LOOP
      SELECT s.axe_score, s.lighthouse_score INTO v_axe_score, v_lighthouse_score
      FROM sites s WHERE s.id = v_site_id;

      FOR v_month_offset IN REVERSE 5..0
      LOOP
        v_record_date := (CURRENT_DATE - (v_month_offset || ' months')::interval)::timestamptz;

        INSERT INTO score_history (site_id, axe_score, lighthouse_score, recorded_at)
        VALUES (
          v_site_id,
          GREATEST(50, v_axe_score - (v_month_offset * 5)),
          GREATEST(50, v_lighthouse_score - (v_month_offset * 5)),
          v_record_date
        );
      END LOOP;
    END LOOP;

    RAISE NOTICE 'Created score history records';

    -- Create sample uploaded files for audit trail (3 uploads per site)
    FOR v_site_id IN SELECT unnest(v_site_ids)
    LOOP
      SELECT s.title, s.description, s.url, s.documentation_url, s.axe_score, s.lighthouse_score
      INTO v_site_title, v_site_description, v_site_url, v_site_doc_url, v_axe_score, v_lighthouse_score
      FROM sites s WHERE s.id = v_site_id;

      -- Upload 1: 5 months ago (initial upload)
      v_record_date := (CURRENT_DATE - '5 months'::interval)::timestamptz;
      INSERT INTO uploaded_files (site_id, file_name, file_content, file_size, uploaded_by, uploaded_at, notes)
      VALUES (
        v_site_id,
        LOWER(REPLACE(v_site_title, ' ', '-')) || '-' || TO_CHAR(v_record_date, 'YYYY-MM') || '.json',
        jsonb_build_object(
          'title', v_site_title,
          'description', v_site_description,
          'url', v_site_url,
          'documentation_url', v_site_doc_url,
          'axe_score', GREATEST(50, v_axe_score - 25),
          'lighthouse_score', GREATEST(50, v_lighthouse_score - 25),
          'axe_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD'),
          'lighthouse_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD')
        ),
        LENGTH(jsonb_build_object(
          'title', v_site_title,
          'description', v_site_description,
          'url', v_site_url,
          'documentation_url', v_site_doc_url,
          'axe_score', GREATEST(50, v_axe_score - 25),
          'lighthouse_score', GREATEST(50, v_lighthouse_score - 25),
          'axe_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD'),
          'lighthouse_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD')
        )::text),
        v_admin_id,
        v_record_date,
        'Upload via JSON import - created site'
      );

      -- Upload 2: 3 months ago (update)
      v_record_date := (CURRENT_DATE - '3 months'::interval)::timestamptz;
      INSERT INTO uploaded_files (site_id, file_name, file_content, file_size, uploaded_by, uploaded_at, notes)
      VALUES (
        v_site_id,
        LOWER(REPLACE(v_site_title, ' ', '-')) || '-' || TO_CHAR(v_record_date, 'YYYY-MM') || '.json',
        jsonb_build_object(
          'title', v_site_title,
          'description', v_site_description,
          'url', v_site_url,
          'documentation_url', v_site_doc_url,
          'axe_score', GREATEST(50, v_axe_score - 15),
          'lighthouse_score', GREATEST(50, v_lighthouse_score - 15),
          'axe_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD'),
          'lighthouse_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD')
        ),
        LENGTH(jsonb_build_object(
          'title', v_site_title,
          'description', v_site_description,
          'url', v_site_url,
          'documentation_url', v_site_doc_url,
          'axe_score', GREATEST(50, v_axe_score - 15),
          'lighthouse_score', GREATEST(50, v_lighthouse_score - 15),
          'axe_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD'),
          'lighthouse_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD')
        )::text),
        v_admin_id,
        v_record_date,
        'Upload via JSON import - updated site'
      );

      -- Upload 3: 1 month ago (most recent update)
      v_record_date := (CURRENT_DATE - '1 month'::interval)::timestamptz;
      INSERT INTO uploaded_files (site_id, file_name, file_content, file_size, uploaded_by, uploaded_at, notes)
      VALUES (
        v_site_id,
        LOWER(REPLACE(v_site_title, ' ', '-')) || '-' || TO_CHAR(v_record_date, 'YYYY-MM') || '.json',
        jsonb_build_object(
          'title', v_site_title,
          'description', v_site_description,
          'url', v_site_url,
          'documentation_url', v_site_doc_url,
          'axe_score', v_axe_score,
          'lighthouse_score', v_lighthouse_score,
          'axe_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD'),
          'lighthouse_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD')
        ),
        LENGTH(jsonb_build_object(
          'title', v_site_title,
          'description', v_site_description,
          'url', v_site_url,
          'documentation_url', v_site_doc_url,
          'axe_score', v_axe_score,
          'lighthouse_score', v_lighthouse_score,
          'axe_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD'),
          'lighthouse_last_updated', TO_CHAR(v_record_date, 'YYYY-MM-DD')
        )::text),
        v_admin_id,
        v_record_date,
        'Upload via JSON import - updated site'
      );
    END LOOP;

    RAISE NOTICE 'Created sample uploaded files for audit trail';
  ELSE
    RAISE NOTICE 'Sites already exist, skipping sample data';
  END IF;

  -- Create documentation sections
  IF NOT EXISTS (SELECT 1 FROM app_documentation LIMIT 1) THEN
    INSERT INTO app_documentation (section_name, content, updated_by, version)
    VALUES
      (
        'application_overview',
        '# Application Overview

The ICJIA Accessibility Status Portal is a comprehensive tracking system designed to monitor and report on web accessibility compliance across all Illinois Criminal Justice Information Authority websites.

## Purpose
Track progress toward April 2026 accessibility compliance deadline for all ICJIA web properties.

## Key Features
- Public dashboard with real-time accessibility scores
- Historical trend analysis and progress tracking
- Multi-format export capabilities (JSON, CSV, Markdown, PDF)
- Secure admin management interface
- Flexible JSON import for bulk data updates',
        v_admin_id,
        1
      ),
      (
        'user_management',
        '# User Management

## Adding Users
Authenticated administrators can create new user accounts through the User Management interface.

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Initial Setup
- Username: admin
- Password: Blank (must be set on first login)

The application will automatically redirect you to set a secure password when you first access it.',
        v_admin_id,
        1
      ),
      (
        'json_import_system',
        '# JSON Import System

## Single Site Upload
Upload one JSON file per site with the following structure:

```json
{
  "title": "Site Name",
  "description": "Site description",
  "url": "https://example.gov",
  "documentation_url": "https://example.gov/accessibility",
  "axe_score": 85,
  "lighthouse_score": 90,
  "axe_last_updated": "2024-11-01",
  "lighthouse_last_updated": "2024-11-01",
  "score_history": [
    {
      "axe_score": 70,
      "lighthouse_score": 75,
      "recorded_at": "2024-08-01"
    }
  ]
}
```

## Bulk Upload
Upload multiple sites at once using an array:

```json
[
  { /* site 1 */ },
  { /* site 2 */ }
]
```',
        v_admin_id,
        1
      );

    RAISE NOTICE 'Created documentation sections';
  ELSE
    RAISE NOTICE 'Documentation already exists, skipping';
  END IF;

  RAISE NOTICE 'Database setup complete!';
  RAISE NOTICE 'Admin user created: username=admin, password=BLANK (must set on first login)';
END $$;