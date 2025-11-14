/**
 * @fileoverview Scan Activity Logger
 * Logs scan-related activities to the activity_log table
 * Tracks when scans are started, completed, and failed
 */

import { supabase } from "./supabase.js";

export interface ScanActivityLogEntry {
  action: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string | null;
  api_key_id?: string | null;
  details?: Record<string, any>;
}

/**
 * Log a scan activity to the activity_log table
 * Uses the current schema: action, entity_type, entity_id, user_id, api_key_id, details
 */
export async function logScanActivity(
  entry: ScanActivityLogEntry
): Promise<void> {
  try {
    const { error } = await supabase.from("activity_log").insert([
      {
        action: entry.action,
        entity_type: entry.entity_type || "scan",
        entity_id: entry.entity_id || null,
        user_id: entry.user_id || null,
        api_key_id: entry.api_key_id || null,
        details: entry.details || {},
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
  userId?: string | null
): Promise<void> {
  await logScanActivity({
    action: "scan_started",
    entity_type: "scan",
    entity_id: siteId,
    user_id: userId,
    details: {
      site_name: siteName,
      action_description: `Scan started for site: ${siteName}`,
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
  userId?: string | null
): Promise<void> {
  await logScanActivity({
    action: "scan_completed",
    entity_type: "scan",
    entity_id: siteId,
    user_id: userId,
    details: {
      site_name: siteName,
      axe_score: axeScore,
      lighthouse_score: lighthouseScore,
      action_description: `Scan completed for site: ${siteName} (Axe: ${axeScore}, Lighthouse: ${lighthouseScore})`,
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
  userId?: string | null
): Promise<void> {
  await logScanActivity({
    action: "scan_failed",
    entity_type: "scan",
    entity_id: siteId,
    user_id: userId,
    details: {
      site_name: siteName,
      error_message: errorMessage,
      action_description: `Scan failed for site: ${siteName} - ${errorMessage}`,
    },
  });
}
