/**
 * @fileoverview API Key Generator Utility
 * Provides functions to generate, hash, and validate API keys for
 * secure programmatic access to the ICJIA Accessibility Status Portal.
 *
 * Key Format: sk_live_<32_random_bytes_hex> or sk_test_<32_random_bytes_hex>
 * Example: sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
 *
 * @module utils/apiKeyGenerator
 */

import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * Generated API key data
 * @typedef {Object} ApiKeyData
 * @property {string} fullKey - The complete API key (show once, never store)
 * @property {string} hashedKey - Bcrypt hash to store in database
 * @property {string} prefix - First 8 chars for identification
 * @property {string} suffix - Last 4 chars for identification
 * @property {'live'|'test'} environment - Key environment (production or test)
 */
export interface ApiKeyData {
  fullKey: string; // The complete API key (show once, never store)
  hashedKey: string; // Bcrypt hash to store in database
  prefix: string; // First 8 chars for identification
  suffix: string; // Last 4 chars for identification
  environment: "live" | "test";
}

/**
 * Generate a new API key
 *
 * @param environment - 'live' for production, 'test' for development
 * @returns ApiKeyData object with full key, hash, and metadata
 */
export async function generateApiKey(
  environment: "live" | "test" = "live"
): Promise<ApiKeyData> {
  // Generate 32 random bytes and convert to hex (64 characters)
  const randomBytes = crypto.randomBytes(32).toString("hex");

  // Create the full API key with environment prefix
  const fullKey = `sk_${environment}_${randomBytes}`;

  // Extract prefix (first 8 chars after sk_live_ or sk_test_)
  const prefix = fullKey.substring(0, 16); // "sk_live_" (8) + first 8 chars of random

  // Extract suffix (last 4 chars)
  const suffix = fullKey.substring(fullKey.length - 4);

  // Hash the full key with bcrypt (same as passwords)
  const hashedKey = await bcrypt.hash(fullKey, 10);

  return {
    fullKey,
    hashedKey,
    prefix,
    suffix,
    environment,
  };
}

/**
 * Validate an API key against its hash
 *
 * @param providedKey - The API key provided in the request
 * @param hashedKey - The bcrypt hash stored in the database
 * @returns true if the key is valid, false otherwise
 */
export async function validateApiKey(
  providedKey: string,
  hashedKey: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(providedKey, hashedKey);
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
}

/**
 * Extract the environment from an API key
 *
 * @param apiKey - The full API key
 * @returns 'live' or 'test', or null if invalid format
 */
export function getKeyEnvironment(apiKey: string): "live" | "test" | null {
  if (apiKey.startsWith("sk_live_")) {
    return "live";
  } else if (apiKey.startsWith("sk_test_")) {
    return "test";
  }
  return null;
}

/**
 * Validate API key format
 *
 * @param apiKey - The API key to validate
 * @returns true if the format is valid, false otherwise
 */
export function isValidKeyFormat(apiKey: string): boolean {
  // Must start with sk_live_ or sk_test_
  if (!apiKey.startsWith("sk_live_") && !apiKey.startsWith("sk_test_")) {
    return false;
  }

  // Must have the correct length (sk_live_ = 8 chars + 64 hex chars = 72 total)
  if (apiKey.length !== 72) {
    return false;
  }

  // The random part should be valid hex
  const randomPart = apiKey.substring(8);
  return /^[a-f0-9]{64}$/.test(randomPart);
}

/**
 * Mask an API key for display purposes
 * Shows prefix and suffix, masks the middle
 *
 * @param apiKey - The full API key
 * @returns Masked key (e.g., "sk_live_abc1****xyz9")
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 20) {
    return "****";
  }

  const prefix = apiKey.substring(0, 16); // sk_live_ + first 8 chars
  const suffix = apiKey.substring(apiKey.length - 4);

  return `${prefix}****${suffix}`;
}

/**
 * Get display name for an API key (using prefix and suffix from database)
 *
 * @param prefix - The stored prefix (first 16 chars)
 * @param suffix - The stored suffix (last 4 chars)
 * @returns Display string (e.g., "sk_live_abc1****xyz9")
 */
export function getKeyDisplayName(prefix: string, suffix: string): string {
  return `${prefix}****${suffix}`;
}
