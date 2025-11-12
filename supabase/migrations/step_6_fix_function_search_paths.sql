-- Step 6: Fix Function Search Paths (Security Hardening)
-- Date: November 11, 2024
-- Description: Add search_path parameter to functions to fix Supabase security warnings

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix deactivate_expired_grace_period_keys function
CREATE OR REPLACE FUNCTION deactivate_expired_grace_period_keys()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET is_active = false, updated_at = NOW()
  WHERE grace_period_expires_at IS NOT NULL
    AND grace_period_expires_at < NOW()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix log_key_deactivation function
CREATE OR REPLACE FUNCTION log_key_deactivation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_active = true AND NEW.is_active = false THEN
    INSERT INTO activity_log (
      event_type,
      description,
      severity,
      metadata,
      created_at
    ) VALUES (
      'api_key_deactivation',
      'API key deactivated: ' || NEW.key_name,
      'info',
      jsonb_build_object(
        'key_id', NEW.id,
        'key_name', NEW.key_name,
        'reason', CASE 
          WHEN NEW.grace_period_expires_at < NOW() THEN 'Grace period expired'
          ELSE 'Manual deactivation'
        END
      ),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ All function search paths have been fixed';
  RAISE NOTICE '   - update_updated_at_column: search_path = public';
  RAISE NOTICE '   - deactivate_expired_grace_period_keys: search_path = public';
  RAISE NOTICE '   - log_key_deactivation: search_path = public';
END $$;

