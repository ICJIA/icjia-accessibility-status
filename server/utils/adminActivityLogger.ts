/**
 * @fileoverview Admin Activity Logger
 * Logs admin-related activities to the activity_log table
 * Tracks site management, user management, and other admin actions
 */

import { supabase } from "./supabase.js";

export interface AdminActivityLogEntry {
  event_type: string;
  event_description: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string | null;
  metadata?: Record<string, any>;
  severity?: "info" | "warning" | "error";
}

/**
 * Log an admin activity to the activity_log table
 */
export async function logAdminActivity(
  entry: AdminActivityLogEntry
): Promise<void> {
  try {
    const { error } = await supabase.from("activity_log").insert([
      {
        event_type: entry.event_type,
        event_description: entry.event_description,
        entity_type: entry.entity_type || "admin",
        entity_id: entry.entity_id || null,
        created_by_user: entry.user_id || null,
        created_by_api_key: null,
        metadata: entry.metadata || {},
        severity: entry.severity || "info",
      },
    ]);

    if (error) {
      console.error("Error logging admin activity:", error);
    }
  } catch (err) {
    console.error("Error in logAdminActivity:", err);
  }
}

/**
 * Log site created event
 */
export async function logSiteCreated(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logAdminActivity({
    event_type: "site_created",
    event_description: `Site created: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    user_id: userId,
    severity: "info",
    metadata: {
      site_name: siteName,
    },
  });
}

/**
 * Log site updated event
 */
export async function logSiteUpdated(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logAdminActivity({
    event_type: "site_updated",
    event_description: `Site updated: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    user_id: userId,
    severity: "info",
    metadata: {
      site_name: siteName,
    },
  });
}

/**
 * Log site deleted event
 */
export async function logSiteDeleted(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logAdminActivity({
    event_type: "site_deleted",
    event_description: `Site deleted: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    user_id: userId,
    severity: "warning",
    metadata: {
      site_name: siteName,
    },
  });
}

/**
 * Log site data cleared event
 */
export async function logSiteDataCleared(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logAdminActivity({
    event_type: "site_data_cleared",
    event_description: `All data cleared for site: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    user_id: userId,
    severity: "warning",
    metadata: {
      site_name: siteName,
    },
  });
}

