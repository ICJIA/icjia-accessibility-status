/**
 * @fileoverview Activity Logger Utility
 * Provides functions to log system events and user actions for audit trails.
 * Automatically sanitizes sensitive data before logging.
 *
 * @module utils/activityLogger
 */

import { supabase } from "./supabase.js";
import { Request } from "express";
import { sanitizeObject, sanitizeHeaders } from "./sanitizer.js";

/**
 * Activity log entry
 * @typedef {Object} ActivityLogEntry
 * @property {string} event_type - Type of event (e.g., 'login', 'site_created')
 * @property {string} description - Human-readable description
 * @property {'info'|'warning'|'error'|'critical'} severity - Event severity level
 * @property {string} [created_by_user] - Username of user who triggered event
 * @property {string} [created_by_api_key] - API key name if triggered by API
 * @property {string} [ip_address] - IP address of request origin
 * @property {string} [user_agent] - User agent string
 * @property {Record<string, any>} [metadata] - Additional event metadata
 */
export interface ActivityLogEntry {
  event_type: string;
  description: string;
  severity: "info" | "warning" | "error" | "critical";
  created_by_user?: string;
  created_by_api_key?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an activity to the activity_log table
 * Automatically sanitizes sensitive data in metadata
 */
export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  try {
    // Sanitize metadata to remove sensitive data
    const sanitizedMetadata = sanitizeObject(entry.metadata || {});

    const { error } = await supabase.from("activity_log").insert([
      {
        event_type: entry.event_type,
        description: entry.description,
        severity: entry.severity,
        created_by_user: entry.created_by_user || null,
        created_by_api_key: entry.created_by_api_key || null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        metadata: sanitizedMetadata,
      },
    ]);

    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (err) {
    console.error("Activity logging error:", err);
  }
}

/**
 * Log a rate limit violation
 */
export async function logRateLimitViolation(
  req: Request,
  limitType: "login" | "api_key" | "session" | "general",
  userId?: string,
  apiKeyId?: string
): Promise<void> {
  const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.get("user-agent") || "unknown";

  await logActivity({
    event_type: "rate_limit_violation",
    description: `Rate limit exceeded for ${limitType}`,
    severity: "warning",
    created_by_user: userId || undefined,
    created_by_api_key: apiKeyId || undefined,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      limit_type: limitType,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log a failed login attempt
 */
export async function logFailedLogin(
  req: Request,
  username: string,
  reason: string
): Promise<void> {
  const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.get("user-agent") || "unknown";

  await logActivity({
    event_type: "failed_login",
    description: `Failed login attempt for user: ${username} (${reason})`,
    severity: "warning",
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      username,
      reason,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log a successful login
 */
export async function logSuccessfulLogin(
  req: Request,
  userId: string,
  username: string
): Promise<void> {
  const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.get("user-agent") || "unknown";

  await logActivity({
    event_type: "login",
    description: `User logged in: ${username}`,
    severity: "info",
    created_by_user: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      username,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log API key usage
 */
export async function logApiKeyUsage(
  req: Request,
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number
): Promise<void> {
  const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.get("user-agent") || "unknown";

  await logActivity({
    event_type: "api_key_usage",
    description: `API key used: ${method} ${endpoint}`,
    severity: "info",
    created_by_api_key: apiKeyId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      endpoint,
      method,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log API key rotation
 */
export async function logApiKeyRotation(
  userId: string,
  oldKeyId: string,
  newKeyId: string,
  gracePeriodDays: number
): Promise<void> {
  await logActivity({
    event_type: "api_key_rotation",
    description: `API key rotated. Old key will expire in ${gracePeriodDays} days.`,
    severity: "info",
    created_by_user: userId,
    metadata: {
      old_key_id: oldKeyId,
      new_key_id: newKeyId,
      grace_period_days: gracePeriodDays,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log API key deactivation
 */
export async function logApiKeyDeactivation(
  keyId: string,
  reason: string
): Promise<void> {
  await logActivity({
    event_type: "api_key_deactivation",
    description: `API key deactivated: ${reason}`,
    severity: "info",
    metadata: {
      key_id: keyId,
      reason,
      timestamp: new Date().toISOString(),
    },
  });
}
