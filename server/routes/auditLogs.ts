/**
 * Audit Logs API Routes
 * Provides endpoints for retrieving audit logs
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
};

/**
 * GET /api/audit-logs
 * Get recent audit logs
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(
        `${colors.red}[Audit Logs API]${colors.reset} Error fetching logs:`,
        error
      );
      return res.status(500).json({ error: "Failed to fetch audit logs" });
    }

    console.log(
      `${colors.cyan}${colors.bright}[Audit Logs API]${colors.reset} ${
        colors.green
      }✓${colors.reset} Fetched ${logs?.length || 0} logs`
    );

    return res.json({ logs: logs || [] });
  } catch (error) {
    console.error(
      `${colors.red}[Audit Logs API]${colors.reset} Exception:`,
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
