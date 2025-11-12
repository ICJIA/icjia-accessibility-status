/**
 * @fileoverview Express Server Entry Point
 * Main server configuration and route setup for the accessibility status API.
 * Handles CORS, middleware, rate limiting, and all API routes.
 *
 * @module server/index
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import siteRoutes from "./routes/sites.js";
import exportRoutes from "./routes/export.js";
import documentationRoutes from "./routes/documentation.js";
import apiKeyRoutes from "./routes/apiKeys.js";
import payloadRoutes from "./routes/payloads.js";
import activityLogRoutes from "./routes/activityLog.js";
import { supabase } from "./utils/supabase.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { startKeyDeactivationJob } from "./utils/keyRotationManager.js";

dotenv.config();

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/documentation", documentationRoutes);
app.use("/api/api-keys", apiKeyRoutes);
app.use("/api/payloads", payloadRoutes);
app.use("/api/activity-log", activityLogRoutes);

/**
 * GET /api/health
 * Health check endpoint - accessible by anyone (no authentication required)
 * Returns detailed status of backend API and database connectivity
 */
app.get("/api/health", async (req, res) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  // Initialize health check results
  const healthCheck: any = {
    status: "healthy",
    timestamp,
    backend: {
      status: "running",
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
    },
    database: {
      status: "unknown",
      supabaseUrl: process.env.VITE_SUPABASE_URL ? "configured" : "missing",
      tables: {},
    },
    checks: [],
  };

  // Test database connection with multiple table checks
  try {
    // Check 1: Sites table
    const sitesStart = Date.now();
    const { data: sitesData, error: sitesError } = await supabase
      .from("sites")
      .select("id", { count: "exact", head: true });

    if (sitesError) {
      healthCheck.database.tables.sites = {
        status: "error",
        error: sitesError.message,
        responseTime: Date.now() - sitesStart,
      };
      healthCheck.checks.push({
        name: "sites_table",
        status: "fail",
        error: sitesError.message,
      });
    } else {
      healthCheck.database.tables.sites = {
        status: "ok",
        responseTime: Date.now() - sitesStart,
      };
      healthCheck.checks.push({
        name: "sites_table",
        status: "pass",
      });
    }

    // Check 2: Admin users table
    const usersStart = Date.now();
    const { data: usersData, error: usersError } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true });

    if (usersError) {
      healthCheck.database.tables.admin_users = {
        status: "error",
        error: usersError.message,
        responseTime: Date.now() - usersStart,
      };
      healthCheck.checks.push({
        name: "admin_users_table",
        status: "fail",
        error: usersError.message,
      });
    } else {
      healthCheck.database.tables.admin_users = {
        status: "ok",
        responseTime: Date.now() - usersStart,
      };
      healthCheck.checks.push({
        name: "admin_users_table",
        status: "pass",
      });
    }

    // Check 3: API keys table
    const apiKeysStart = Date.now();
    const { data: apiKeysData, error: apiKeysError } = await supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true });

    if (apiKeysError) {
      healthCheck.database.tables.api_keys = {
        status: "error",
        error: apiKeysError.message,
        responseTime: Date.now() - apiKeysStart,
      };
      healthCheck.checks.push({
        name: "api_keys_table",
        status: "fail",
        error: apiKeysError.message,
      });
    } else {
      healthCheck.database.tables.api_keys = {
        status: "ok",
        responseTime: Date.now() - apiKeysStart,
      };
      healthCheck.checks.push({
        name: "api_keys_table",
        status: "pass",
      });
    }

    // Check 4: API payloads table
    const payloadsStart = Date.now();
    const { data: payloadsData, error: payloadsError } = await supabase
      .from("api_payloads")
      .select("id", { count: "exact", head: true });

    if (payloadsError) {
      healthCheck.database.tables.api_payloads = {
        status: "error",
        error: payloadsError.message,
        responseTime: Date.now() - payloadsStart,
      };
      healthCheck.checks.push({
        name: "api_payloads_table",
        status: "fail",
        error: payloadsError.message,
      });
    } else {
      healthCheck.database.tables.api_payloads = {
        status: "ok",
        responseTime: Date.now() - payloadsStart,
      };
      healthCheck.checks.push({
        name: "api_payloads_table",
        status: "pass",
      });
    }

    // Determine overall database status
    const failedChecks = healthCheck.checks.filter(
      (check: any) => check.status === "fail"
    );
    if (failedChecks.length === 0) {
      healthCheck.database.status = "connected";
    } else if (failedChecks.length === healthCheck.checks.length) {
      healthCheck.database.status = "disconnected";
      healthCheck.status = "unhealthy";
    } else {
      healthCheck.database.status = "partial";
      healthCheck.status = "degraded";
    }
  } catch (err: any) {
    healthCheck.database.status = "error";
    healthCheck.database.error = err.message;
    healthCheck.status = "unhealthy";
    healthCheck.checks.push({
      name: "database_connection",
      status: "fail",
      error: err.message,
    });
  }

  // Add response time
  healthCheck.responseTime = Date.now() - startTime;

  // Set HTTP status code based on health
  const httpStatus = healthCheck.status === "healthy" ? 200 : 503;

  res.status(httpStatus).json(healthCheck);
});

app.listen(PORT, () => {
  // Extract hostname from FRONTEND_URL or use localhost
  const frontendUrl = new URL(FRONTEND_URL);
  const hostname = frontendUrl.hostname;
  console.log(`🚀 Server running on http://${hostname}:${PORT}`);

  // Start automatic key deactivation job
  startKeyDeactivationJob();
});
