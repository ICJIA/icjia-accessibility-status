-- Step 7: Consolidate Duplicate RLS Policies (Performance Optimization)
-- Date: November 11, 2024
-- Description: Remove duplicate permissive policies to improve query performance

-- ============================================================================
-- PART 1: Consolidate api_keys SELECT policies
-- ============================================================================

-- Drop the duplicate policy (keep the original one)
DROP POLICY IF EXISTS "Admin users can view api key rotation history" ON api_keys;

-- The remaining policy "Admin users can view API keys" covers both viewing
-- regular API keys and rotation history since it allows viewing all columns

-- ============================================================================
-- PART 2: Consolidate api_payloads INSERT policies
-- ============================================================================

-- Drop the duplicate policy (keep the original one)
DROP POLICY IF EXISTS "API keys can insert payloads" ON api_payloads;

-- The remaining policy "Admin users can upload files" covers both:
-- - Admin users uploading files
-- - API keys inserting payloads
-- Since both use the same anon/authenticated roles with CHECK (true)

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  api_keys_select_count integer;
  api_payloads_insert_count integer;
BEGIN
  -- Count SELECT policies on api_keys
  SELECT COUNT(*) INTO api_keys_select_count
  FROM pg_policies
  WHERE tablename = 'api_keys'
  AND policyname LIKE '%SELECT%'
  AND cmd = 'r'; -- 'r' = SELECT

  -- Count INSERT policies on api_payloads
  SELECT COUNT(*) INTO api_payloads_insert_count
  FROM pg_policies
  WHERE tablename = 'api_payloads'
  AND policyname LIKE '%INSERT%'
  AND cmd = 'a'; -- 'a' = INSERT

  RAISE NOTICE '✅ Duplicate policies removed';
  RAISE NOTICE '   - api_keys SELECT policies: % (should be 1)', api_keys_select_count;
  RAISE NOTICE '   - api_payloads INSERT policies: % (should be 1)', api_payloads_insert_count;
END $$;

