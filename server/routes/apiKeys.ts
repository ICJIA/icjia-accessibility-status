/**
 * @fileoverview API Key Management Routes
 * Handles API key creation, rotation, deletion, and management.
 * All routes require authentication.
 *
 * @module routes/apiKeys
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { generateApiKey, getKeyDisplayName } from "../utils/apiKeyGenerator.js";
import { logApiKeyRotation } from "../utils/activityLogger.js";
import { getKeyRotationStats } from "../utils/keyRotationManager.js";

/**
 * Express router for API key management endpoints
 * @type {express.Router}
 */
const router = Router();

/**
 * GET /api/api-keys
 * List all API keys (for authenticated admin users)
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select(
        "id, key_name, api_key_prefix, api_key_suffix, scopes, created_by, created_at, last_used_at, usage_count, expires_at, is_active, notes"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return res.status(500).json({ error: "Failed to fetch API keys" });
    }

    // Add display name to each key
    const keysWithDisplay = apiKeys.map((key) => ({
      ...key,
      display_key: getKeyDisplayName(key.api_key_prefix, key.api_key_suffix),
    }));

    return res.json({ apiKeys: keysWithDisplay });
  } catch (error) {
    console.error("Get API keys error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/api-keys
 * Create a new API key (for authenticated admin users)
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { key_name, scopes, notes, expires_at, environment } = req.body;

    // Validate required fields
    if (!key_name) {
      return res.status(400).json({ error: "Key name is required" });
    }

    // Validate scopes
    const validScopes = ["sites:read", "sites:write", "sites:delete"];
    const requestedScopes = scopes || ["sites:write"];

    for (const scope of requestedScopes) {
      if (!validScopes.includes(scope)) {
        return res.status(400).json({
          error: `Invalid scope: ${scope}. Valid scopes are: ${validScopes.join(
            ", "
          )}`,
        });
      }
    }

    // Generate the API key
    const keyData = await generateApiKey(environment || "live");

    // Store in database
    const { data: newKey, error } = await supabase
      .from("api_keys")
      .insert([
        {
          key_name,
          api_key: keyData.hashedKey,
          api_key_prefix: keyData.prefix,
          api_key_suffix: keyData.suffix,
          scopes: requestedScopes,
          created_by: req.userId,
          expires_at: expires_at || null,
          notes: notes || null,
        },
      ])
      .select(
        "id, key_name, api_key_prefix, api_key_suffix, scopes, created_at, expires_at, notes"
      )
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      return res.status(500).json({ error: "Failed to create API key" });
    }

    // Return the full key (this is the ONLY time it will be shown)
    return res.status(201).json({
      apiKey: {
        ...newKey,
        display_key: getKeyDisplayName(
          newKey.api_key_prefix,
          newKey.api_key_suffix
        ),
        full_key: keyData.fullKey, // Only shown once!
      },
      warning:
        "This is the only time the full API key will be displayed. Please save it securely.",
    });
  } catch (error) {
    console.error("Create API key error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/api-keys/:id
 * Update an API key (for authenticated admin users)
 * Can update: key_name, scopes, notes, is_active, expires_at
 */
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { key_name, scopes, notes, is_active, expires_at } = req.body;

    // Build update object with only provided fields
    const updates: any = {};

    if (key_name !== undefined) updates.key_name = key_name;
    if (notes !== undefined) updates.notes = notes;
    if (is_active !== undefined) updates.is_active = is_active;
    if (expires_at !== undefined) updates.expires_at = expires_at;

    if (scopes !== undefined) {
      const validScopes = ["sites:read", "sites:write", "sites:delete"];
      for (const scope of scopes) {
        if (!validScopes.includes(scope)) {
          return res.status(400).json({
            error: `Invalid scope: ${scope}. Valid scopes are: ${validScopes.join(
              ", "
            )}`,
          });
        }
      }
      updates.scopes = scopes;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data: updatedKey, error } = await supabase
      .from("api_keys")
      .update(updates)
      .eq("id", id)
      .select(
        "id, key_name, api_key_prefix, api_key_suffix, scopes, created_at, last_used_at, usage_count, expires_at, is_active, notes"
      )
      .single();

    if (error) {
      console.error("Error updating API key:", error);
      return res.status(500).json({ error: "Failed to update API key" });
    }

    if (!updatedKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    return res.json({
      apiKey: {
        ...updatedKey,
        display_key: getKeyDisplayName(
          updatedKey.api_key_prefix,
          updatedKey.api_key_suffix
        ),
      },
    });
  } catch (error) {
    console.error("Update API key error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/api-keys/:id
 * Delete an API key (for authenticated admin users)
 */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      console.error("Error deleting API key:", error);
      return res.status(500).json({ error: "Failed to delete API key" });
    }

    return res.json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error("Delete API key error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/api-keys/:id/revoke
 * Revoke (deactivate) an API key without deleting it
 */
router.post("/:id/revoke", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data: revokedKey, error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", id)
      .select("id, key_name, api_key_prefix, api_key_suffix, is_active")
      .single();

    if (error) {
      console.error("Error revoking API key:", error);
      return res.status(500).json({ error: "Failed to revoke API key" });
    }

    if (!revokedKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    return res.json({
      message: "API key revoked successfully",
      apiKey: {
        ...revokedKey,
        display_key: getKeyDisplayName(
          revokedKey.api_key_prefix,
          revokedKey.api_key_suffix
        ),
      },
    });
  } catch (error) {
    console.error("Revoke API key error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/api-keys/:id/rotate
 * Rotate an API key - generates a new key and sets grace period for old key
 */
router.post("/:id/rotate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const gracePeriodDays = parseInt(
      process.env.API_KEY_ROTATION_GRACE_PERIOD_DAYS || "10"
    );

    // Get the old key
    const { data: oldKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !oldKey) {
      console.error("Error fetching API key:", fetchError);
      return res.status(404).json({ error: "API key not found" });
    }

    // Generate new API key
    const keyData = await generateApiKey(oldKey.environment || "live");

    // Create new key with reference to old key
    const gracePeriodExpiresAt = new Date();
    gracePeriodExpiresAt.setDate(
      gracePeriodExpiresAt.getDate() + gracePeriodDays
    );

    const { data: newKey, error: createError } = await supabase
      .from("api_keys")
      .insert([
        {
          key_name: oldKey.key_name,
          api_key: keyData.hashedKey,
          api_key_prefix: keyData.prefix,
          api_key_suffix: keyData.suffix,
          scopes: oldKey.scopes,
          created_by: req.userId,
          expires_at: oldKey.expires_at,
          notes: `Rotated from key ${oldKey.id}`,
          rotated_from_key_id: oldKey.id,
          is_active: true,
        },
      ])
      .select(
        "id, key_name, api_key_prefix, api_key_suffix, scopes, created_at, expires_at, notes"
      )
      .single();

    if (createError) {
      console.error("Error creating rotated API key:", createError);
      return res.status(500).json({ error: "Failed to rotate API key" });
    }

    // Update old key with grace period
    const { error: updateError } = await supabase
      .from("api_keys")
      .update({
        grace_period_expires_at: gracePeriodExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", oldKey.id);

    if (updateError) {
      console.error("Error updating old API key:", updateError);
      return res.status(500).json({ error: "Failed to update old API key" });
    }

    // Log the rotation
    await logApiKeyRotation(req.userId, oldKey.id, newKey.id, gracePeriodDays);

    return res.status(201).json({
      message: "API key rotated successfully",
      newKey: {
        ...newKey,
        display_key: getKeyDisplayName(
          newKey.api_key_prefix,
          newKey.api_key_suffix
        ),
        full_key: keyData.fullKey, // Only shown once!
      },
      oldKey: {
        id: oldKey.id,
        key_name: oldKey.key_name,
        grace_period_expires_at: gracePeriodExpiresAt.toISOString(),
        grace_period_days: gracePeriodDays,
      },
      warning:
        "This is the only time the new API key will be displayed. Please save it securely. The old key will remain active for " +
        gracePeriodDays +
        " days.",
    });
  } catch (error) {
    console.error("Rotate API key error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/api-keys/stats/rotation
 * Get API key rotation statistics (for admin dashboard)
 */
router.get("/stats/rotation", requireAuth, async (req: AuthRequest, res) => {
  try {
    const stats = await getKeyRotationStats();

    return res.json({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get key rotation stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
