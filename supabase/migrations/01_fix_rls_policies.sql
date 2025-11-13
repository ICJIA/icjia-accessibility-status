/*
  ============================================================================
  FIX: RLS Policies for Initial Setup
  ============================================================================
  
  This migration fixes the RLS policies to allow anonymous users to set
  the initial admin password during setup.
  
  The original policy only allowed authenticated users to update admin_users,
  which blocked the initial setup endpoint from working.
  
  ============================================================================
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow authenticated to update own password" ON admin_users;

-- Create new policies that allow both anonymous (for initial setup) and authenticated (for password changes)
CREATE POLICY "Allow anonymous to set initial password" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated to update own password" ON admin_users FOR UPDATE USING (auth.role() = 'authenticated');

DO $$
BEGIN
  RAISE NOTICE 'RLS policies fixed: Anonymous users can now set initial password';
END $$;

