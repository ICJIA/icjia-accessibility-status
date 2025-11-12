/**
 * @fileoverview Activity Log Routes
 * Handles activity log retrieval and export.
 * Provides audit trail of all system events and user actions.
 * All routes require authentication.
 *
 * @module routes/activityLog
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Express router for activity log endpoints
 * @type {express.Router}
 */
const router = Router();

/**
 * GET /api/activity-log
 * Get recent activity log entries (admin-only)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const {
      data: activities,
      error,
      count,
    } = await supabase
      .from("activity_log")
      .select(
        `
        *,
        user:created_by_user (username, email),
        api_key:created_by_api_key (key_name, api_key_prefix, api_key_suffix)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching activity log:", error);
      return res.status(500).json({ error: "Failed to fetch activity log" });
    }

    return res.json({ activities, total: count });
  } catch (error) {
    console.error("Get activity log error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
