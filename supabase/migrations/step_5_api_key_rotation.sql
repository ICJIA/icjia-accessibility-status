-- Step 5: Add API Key Rotation Support
-- Date: November 11, 2024
-- Description: Add columns to support API key rotation with grace periods

-- Add rotation-related columns to api_keys table
ALTER TABLE api_keys
ADD COLUMN rotation_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN rotated_from_key_id UUID DEFAULT NULL REFERENCES api_keys(id) ON DELETE SET NULL,
ADD COLUMN grace_period_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for finding keys with expired grace periods
CREATE INDEX idx_api_keys_grace_period_expires_at 
ON api_keys(grace_period_expires_at) 
WHERE grace_period_expires_at IS NOT NULL AND is_active = true;

-- Create index for finding keys scheduled for rotation
CREATE INDEX idx_api_keys_rotation_scheduled_at 
ON api_keys(rotation_scheduled_at) 
WHERE rotation_scheduled_at IS NOT NULL;

-- Add comment to document the new columns
COMMENT ON COLUMN api_keys.rotation_scheduled_at IS 'Timestamp when automatic rotation is scheduled (for future use)';
COMMENT ON COLUMN api_keys.rotated_from_key_id IS 'Reference to the previous key if this key was created via rotation';
COMMENT ON COLUMN api_keys.grace_period_expires_at IS 'Timestamp when the grace period for an old key expires and it should be deactivated';

-- Create a function to automatically deactivate old keys after grace period expires
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

-- Create a trigger to log key deactivations
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

-- Create trigger for api_keys table
DROP TRIGGER IF EXISTS trigger_log_key_deactivation ON api_keys;
CREATE TRIGGER trigger_log_key_deactivation
AFTER UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION log_key_deactivation();

-- Note: RLS policy for viewing rotation history is already covered by
-- "Admin users can view API keys" policy from step_2, which allows viewing
-- all columns including rotation-related columns. No additional policy needed.

-- Add comment to document the deactivation function
COMMENT ON FUNCTION deactivate_expired_grace_period_keys() IS 'Automatically deactivates API keys after their grace period expires. Should be called periodically (e.g., via a cron job or scheduled task).';

