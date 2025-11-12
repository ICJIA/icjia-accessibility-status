/**
 * @fileoverview Payload Management Routes
 * Handles payload retrieval, viewing, and comparison.
 * Payloads are raw API responses from accessibility scanning tools.
 * All routes require authentication.
 *
 * @module routes/payloads
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Express router for payload management endpoints
 * @type {express.Router}
 */
const router = Router();

/**
 * GET /api/payloads
 * Get all payloads (admin-only, with pagination)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    // Validate and constrain pagination parameters
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 50, 1),
      1000
    );
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    console.log(
      `[Payloads] Fetching payloads list: limit=${limit}, offset=${offset}`
    );

    const {
      data: payloads,
      error,
      count,
    } = await supabase
      .from("api_payloads")
      .select(
        `
        id,
        payload_id,
        description,
        payload_size,
        created_at,
        site_id,
        sites:site_id (id, title, url)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(
        "[Payloads] Error fetching payloads:",
        JSON.stringify(error)
      );
      return res
        .status(500)
        .json({ error: "Failed to fetch payloads", details: error?.message });
    }

    console.log(
      `[Payloads] Successfully fetched ${payloads?.length || 0} payloads`
    );
    return res.json({ payloads, total: count });
  } catch (error) {
    console.error("[Payloads] Get payloads error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/payloads/by-id/:payloadId
 * Get full payload details by payload_id (admin-only)
 */
router.get("/by-id/:payloadId", requireAuth, async (req, res) => {
  try {
    const { payloadId } = req.params;

    const { data: payload, error } = await supabase
      .from("api_payloads")
      .select(
        `
        *,
        sites:site_id (id, title, url),
        admin_users:created_by_user (username, email)
      `
      )
      .eq("payload_id", payloadId)
      .single();

    if (error || !payload) {
      return res.status(404).json({ error: "Payload not found" });
    }

    return res.json({ payload });
  } catch (error) {
    console.error("Get payload by ID error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/payloads/:uuid
 * Get full payload details by UUID (admin-only)
 */
router.get("/:uuid", requireAuth, async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log(`[Payloads] Fetching payload by UUID: ${uuid}`);

    const { data: payload, error } = await supabase
      .from("api_payloads")
      .select(
        `
        *,
        sites:site_id (id, title, url),
        admin_users:created_by_user (username, email)
      `
      )
      .eq("id", uuid)
      .single();

    if (error) {
      console.error(`[Payloads] Error fetching payload ${uuid}:`, error);
    }
    if (!payload) {
      console.log(`[Payloads] Payload not found for UUID: ${uuid}`);
    }

    if (error || !payload) {
      return res.status(404).json({ error: "Payload not found" });
    }

    console.log(`[Payloads] Successfully fetched payload ${uuid}`);
    return res.json({ payload });
  } catch (error) {
    console.error("Get payload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
