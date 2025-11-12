/**
 * @fileoverview API Key Rotation Manager
 * Manages automatic API key rotation and deactivation.
 * Handles grace periods and scheduled key deactivation.
 *
 * @module utils/keyRotationManager
 */

import { supabase } from "./supabase.js";
import { logApiKeyDeactivation } from "./activityLogger.js";

/**
 * Deactivate API keys that have expired grace periods
 * This function should be called periodically (e.g., every hour via a cron job)
 *
 * @async
 * @function deactivateExpiredGracePeriodKeys
 * @returns {Promise<void>}
 */
export async function deactivateExpiredGracePeriodKeys(): Promise<void> {
  try {
    console.log("🔄 Running automatic API key deactivation check...");

    // Get all keys with expired grace periods
    const { data: expiredKeys, error: fetchError } = await supabase
      .from("api_keys")
      .select("id, key_name, grace_period_expires_at")
      .eq("is_active", true)
      .not("grace_period_expires_at", "is", null)
      .lt("grace_period_expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired grace period keys:", fetchError);
      return;
    }

    if (!expiredKeys || expiredKeys.length === 0) {
      console.log("✅ No expired grace period keys found");
      return;
    }

    console.log(`Found ${expiredKeys.length} keys with expired grace periods`);

    // Deactivate each expired key
    for (const key of expiredKeys) {
      try {
        const { error: updateError } = await supabase
          .from("api_keys")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", key.id);

        if (updateError) {
          console.error(`Error deactivating key ${key.id}:`, updateError);
          continue;
        }

        // Log the deactivation
        await logApiKeyDeactivation(
          key.id,
          "Grace period expired after rotation"
        );

        console.log(`✅ Deactivated key: ${key.key_name} (${key.id})`);
      } catch (err) {
        console.error(`Error processing key ${key.id}:`, err);
      }
    }

    console.log("✅ Automatic key deactivation check completed");
  } catch (error) {
    console.error("Error in deactivateExpiredGracePeriodKeys:", error);
  }
}

/**
 * Start automatic key deactivation job
 * Runs every hour by default (configurable via environment variable)
 */
export function startKeyDeactivationJob(): NodeJS.Timeout {
  const intervalMs = parseInt(
    process.env.KEY_DEACTIVATION_CHECK_INTERVAL_MS || "3600000"
  ); // 1 hour default

  console.log(
    `⏰ Starting automatic key deactivation job (runs every ${
      intervalMs / 1000 / 60
    } minutes)`
  );

  // Run immediately on startup
  deactivateExpiredGracePeriodKeys().catch((err) =>
    console.error("Error running initial key deactivation check:", err)
  );

  // Then run periodically
  return setInterval(() => {
    deactivateExpiredGracePeriodKeys().catch((err) =>
      console.error("Error in scheduled key deactivation check:", err)
    );
  }, intervalMs);
}

/**
 * Get statistics about API key rotations
 */
export async function getKeyRotationStats(): Promise<{
  totalKeys: number;
  activeKeys: number;
  inactiveKeys: number;
  keysInGracePeriod: number;
  rotatedKeys: number;
}> {
  try {
    const { data: allKeys, error } = await supabase
      .from("api_keys")
      .select("id, is_active, grace_period_expires_at, rotated_from_key_id");

    if (error) {
      console.error("Error fetching key statistics:", error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        inactiveKeys: 0,
        keysInGracePeriod: 0,
        rotatedKeys: 0,
      };
    }

    const stats = {
      totalKeys: allKeys?.length || 0,
      activeKeys: allKeys?.filter((k) => k.is_active).length || 0,
      inactiveKeys: allKeys?.filter((k) => !k.is_active).length || 0,
      keysInGracePeriod:
        allKeys?.filter((k) => k.grace_period_expires_at !== null).length || 0,
      rotatedKeys:
        allKeys?.filter((k) => k.rotated_from_key_id !== null).length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Error calculating key rotation stats:", error);
    return {
      totalKeys: 0,
      activeKeys: 0,
      inactiveKeys: 0,
      keysInGracePeriod: 0,
      rotatedKeys: 0,
    };
  }
}
