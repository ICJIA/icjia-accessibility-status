/**
 * @fileoverview Scan Activity Logger
 * Logs scan-related activities to the activity_log table
 * Tracks when scans are started, completed, and failed
 */

import { supabase } from "./supabase.js";

export interface ScanActivityLogEntry {
  event_type: string;
  event_description: string;
  severity: "info" | "warning" | "error";
  site_id: string;
  created_by_user?: string | null;
  created_by_api_key?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Log a scan activity to the activity_log table
 */
export async function logScanActivity(
  entry: ScanActivityLogEntry
): Promise<void> {
  try {
    const { error } = await supabase.from("activity_log").insert([
      {
        event_type: entry.event_type,
        event_description: entry.event_description,
        severity: entry.severity,
        site_id: entry.site_id,
        created_by_user: entry.created_by_user || null,
        created_by_api_key: entry.created_by_api_key || null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        metadata: entry.metadata || {},
      },
    ]);

    if (error) {
      console.error("Error logging scan activity:", error);
    }
  } catch (err) {
    console.error("Error in logScanActivity:", err);
  }
}

/**
 * Log scan started event
 */
export async function logScanStarted(
  siteId: string,
  siteName: string,
  userId?: string | null,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await logScanActivity({
    event_type: "scan_started",
    event_description: `Scan started for site: ${siteName}`,
    severity: "info",
    site_id: siteId,
    created_by_user: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      site_name: siteName,
    },
  });
}

/**
 * Log scan completed event
 */
export async function logScanCompleted(
  siteId: string,
  siteName: string,
  axeScore: number | null,
  lighthouseScore: number | null,
  userId?: string | null,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await logScanActivity({
    event_type: "scan_completed",
    event_description: `Scan completed for site: ${siteName} (Axe: ${axeScore}, Lighthouse: ${lighthouseScore})`,
    severity: "info",
    site_id: siteId,
    created_by_user: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      site_name: siteName,
      axe_score: axeScore,
      lighthouse_score: lighthouseScore,
    },
  });
}

/**
 * Log scan failed event
 */
export async function logScanFailed(
  siteId: string,
  siteName: string,
  errorMessage: string,
  userId?: string | null,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await logScanActivity({
    event_type: "scan_failed",
    event_description: `Scan failed for site: ${siteName} - ${errorMessage}`,
    severity: "error",
    site_id: siteId,
    created_by_user: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: {
      site_name: siteName,
      error_message: errorMessage,
    },
  });
}

