/**
 * @fileoverview API Key Authentication Middleware
 * Middleware for validating API keys and protecting API routes.
 * Checks API key validity, scopes, and rate limits.
 *
 * @module middleware/apiAuth
 */

import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase.js";
import { validateApiKey, isValidKeyFormat } from "../utils/apiKeyGenerator.js";
import {
  logApiKeyUsage,
  logRateLimitViolation,
} from "../utils/activityLogger.js";
import { withSmartRetry } from "../utils/retry.js";
import { sanitizeApiKey } from "../utils/sanitizer.js";

/**
 * Extended Express Request with API key authentication data
 * @typedef {Object} ApiAuthRequest
 * @extends Request
 * @property {Object} [apiKey] - Authenticated API key metadata
 * @property {string} apiKey.id - API key ID
 * @property {string} apiKey.key_name - API key name
 * @property {string[]} apiKey.scopes - API key scopes
 * @property {string|null} apiKey.created_by - Creator username
 */
export interface ApiAuthRequest extends Request {
  apiKey?: {
    id: string;
    key_name: string;
    scopes: string[];
    created_by: string | null;
  };
}

/**
 * Middleware to authenticate API requests using API keys
 *
 * Validates the API key from the Authorization header and attaches
 * the key metadata to the request object.
 *
 * Usage:
 *   router.post('/api/sites/import', requireApiKey, async (req, res) => {
 *     // req.apiKey is available here
 *   });
 */
export async function requireApiKey(
  req: ApiAuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Authentication required",
        message:
          "Missing Authorization header. Include your API key as: Authorization: Bearer sk_live_...",
      });
    }

    // Check for Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Invalid authentication format",
        message:
          "Authorization header must use Bearer token format: Authorization: Bearer sk_live_...",
      });
    }

    // Extract the API key
    const providedKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate key format
    if (!isValidKeyFormat(providedKey)) {
      // Log sanitized key for debugging (first 8 + last 4 chars only)
      console.warn(
        `[ApiAuth] Invalid API key format: ${sanitizeApiKey(providedKey)}`
      );
      return res.status(401).json({
        error: "Invalid API key format",
        message:
          "API key must start with sk_live_ or sk_test_ and be 72 characters long",
      });
    }

    // Query the database for all active API keys
    // We need to check all keys because we can't query by the hashed value
    // Use retry logic for transient database failures
    const { data: apiKeys, error: queryError } = await withSmartRetry(
      () =>
        supabase
          .from("api_keys")
          .select(
            "id, key_name, api_key, scopes, created_by, expires_at, is_active"
          )
          .eq("is_active", true),
      {
        maxRetries: 3,
        initialDelayMs: 100,
        onRetry: (attempt, error) => {
          console.warn(
            `[ApiAuth] Retry attempt ${attempt} for API key lookup:`,
            error.message
          );
        },
      }
    );

    if (queryError) {
      console.error("Error querying API keys:", queryError);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!apiKeys || apiKeys.length === 0) {
      return res.status(401).json({
        error: "Invalid API key",
        message:
          "No active API keys found. Please create an API key in the admin panel.",
      });
    }

    // Find the matching API key by comparing hashes
    let matchedKey = null;
    for (const key of apiKeys) {
      const isValid = await validateApiKey(providedKey, key.api_key);
      if (isValid) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "The provided API key is not valid or has been revoked.",
      });
    }

    // Check if the key has expired
    if (matchedKey.expires_at && new Date(matchedKey.expires_at) < new Date()) {
      return res.status(401).json({
        error: "API key expired",
        message:
          "This API key has expired. Please create a new one in the admin panel.",
      });
    }

    // Check rate limit for this API key
    const maxRequestsPerHour = parseInt(
      process.env.API_KEY_RATE_LIMIT_MAX_REQUESTS || "100"
    );
    const currentUsageCount = (matchedKey as any).usage_count || 0;

    if (currentUsageCount >= maxRequestsPerHour) {
      await logRateLimitViolation(req, "api_key", undefined, matchedKey.id);
      return res.status(429).json({
        error: "API rate limit exceeded",
        message: `Maximum ${maxRequestsPerHour} requests per hour allowed for this API key.`,
        retryAfter: 3600,
      });
    }

    // Update usage tracking (last_used_at and usage_count)
    // Do this asynchronously to not block the request
    supabase
      .from("api_keys")
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: currentUsageCount + 1,
      })
      .eq("id", matchedKey.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating API key usage:", error);
        }
      });

    // Log API key usage asynchronously
    logApiKeyUsage(req, matchedKey.id, req.path, req.method, 200).catch((err) =>
      console.error("Error logging API key usage:", err)
    );

    // Attach API key metadata to request
    req.apiKey = {
      id: matchedKey.id,
      key_name: matchedKey.key_name,
      scopes: matchedKey.scopes,
      created_by: matchedKey.created_by,
    };

    next();
  } catch (error) {
    console.error("API authentication error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware to check if the API key has a specific scope/permission
 *
 * Usage:
 *   router.post('/api/sites/import', requireApiKey, requireScope('sites:write'), async (req, res) => {
 *     // API key has sites:write permission
 *   });
 */
export function requireScope(requiredScope: string) {
  return (req: ApiAuthRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: "Authentication required",
        message: "This endpoint requires API key authentication",
      });
    }

    if (!req.apiKey.scopes.includes(requiredScope)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `This API key does not have the required permission: ${requiredScope}`,
      });
    }

    next();
  };
}
