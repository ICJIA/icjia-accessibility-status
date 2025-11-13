/*
  ============================================================================
  FIX: Sessions RLS Policy for Custom Cookie-Based Authentication
  ============================================================================
  
  This migration fixes the RLS policy for the sessions table to allow
  reading sessions without Supabase Auth authentication.
  
  The original policy required auth.role() = 'authenticated', which only
  works with Supabase Auth. Since we use custom cookie-based authentication,
  we need to allow anonymous reads of the sessions table.
  
  ============================================================================
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow authenticated to read own sessions" ON sessions;

-- Create new policy that allows anonymous reads (for custom cookie-based auth)
CREATE POLICY "Allow anonymous to read sessions" ON sessions FOR SELECT USING (true);

DO $$
BEGIN
  RAISE NOTICE 'Sessions RLS policy fixed: Anonymous users can now read sessions for custom cookie-based authentication';
END $$;

