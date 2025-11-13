/**
 * @fileoverview Authentication Middleware
 * Middleware for validating user sessions and protecting routes.
 * Checks session tokens and attaches user information to requests.
 *
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase.js";
import { withSmartRetry } from "../utils/retry.js";

/**
 * Extended Express Request with authentication data
 * @typedef {Object} AuthRequest
 * @extends Request
 * @property {string} [userId] - Authenticated user ID
 */
export interface AuthRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = req.cookies.session_token;
    console.log(
      "[Auth] Checking session token:",
      sessionToken ? "present" : "missing"
    );
    console.log("[Auth] All cookies:", req.cookies);
    console.log("[Auth] Request headers:", {
      origin: req.get("origin"),
      referer: req.get("referer"),
      cookie: req.get("cookie"),
    });

    if (!sessionToken) {
      console.log("[Auth] No session token found");
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log("[Auth] Querying sessions table for token");

    // Use retry logic for database queries
    const { data: session, error } = await withSmartRetry(
      () =>
        supabase
          .from("sessions")
          .select("*")
          .eq("session_token", sessionToken)
          .single(),
      {
        maxRetries: 3,
        initialDelayMs: 100,
        onRetry: (attempt, error) => {
          console.warn(
            `[Auth] Retry attempt ${attempt} for session lookup:`,
            error.message
          );
        },
      }
    );

    if (error) {
      console.error("[Auth] Supabase error:", error);
    }
    if (!session) {
      console.log("[Auth] Session not found");
    }

    if (error || !session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (new Date(session.expires_at) < new Date()) {
      await withSmartRetry(
        () => supabase.from("sessions").delete().eq("id", session.id),
        { maxRetries: 2 }
      );
      return res.status(401).json({ error: "Session expired" });
    }

    req.userId = session.user_id;
    console.log("[Auth] Session valid, user_id:", req.userId);
    next();
  } catch (error) {
    console.error("[Auth] Middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
