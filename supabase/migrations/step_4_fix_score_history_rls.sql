/*
  ============================================================================
  STEP 4 (OPTIONAL): Fix score_history RLS Policy to Allow Anon Role
  ============================================================================

  NOTE: This migration is OPTIONAL and only needed if you're upgrading from
  an older version. For new installations, this is already included in STEP 1.

  This migration fixes the RLS policy for score_history table to allow
  the anon role to insert records. This is needed because the backend
  uses VITE_SUPABASE_ANON_KEY for all operations, including seed data.

  Run this migration in Supabase SQL Editor.
*/

-- Drop the existing INSERT policy that only allows authenticated role
DROP POLICY IF EXISTS "Authenticated users can create history records" ON score_history;

-- Recreate the policy to allow both anon and authenticated roles
CREATE POLICY "Authenticated users can create history records"
  ON score_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'score_history' 
    AND policyname = 'Authenticated users can create history records'
  ) THEN
    RAISE NOTICE '✅ score_history INSERT policy fixed to allow anon role';
  ELSE
    RAISE EXCEPTION '❌ Failed to update score_history policy';
  END IF;
END $$;

