#!/usr/bin/env node

/**
 * Start Production with Serve Script
 * Starts PM2 backend, waits for it to be ready, then starts serve frontend
 */

import { spawn } from "child_process";
import http from "http";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:3001/api/health", (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => {
      resolve(false);
    });

    setTimeout(() => resolve(false), 1000);
  });
}

async function waitForBackend(maxAttempts = 30) {
  log("\n⏳ Waiting for backend to be ready...", "cyan");

  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      log("✅ Backend is ready!", "green");
      return true;
    }

    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  log("\n⚠️  Backend health check timed out", "yellow");
  return false;
}

async function main() {
  log("\n🚀 Starting PM2 backend...", "cyan");

  // Start PM2
  const pm2 = spawn("pm2", ["start", "ecosystem.config.cjs"], {
    stdio: "inherit",
  });

  await new Promise((resolve) => {
    pm2.on("close", resolve);
  });

  // Wait for backend to be ready
  await waitForBackend();

  log("\n🚀 Starting frontend with serve on port 5173...", "cyan");

  // Start serve - serves dist/ directory on port 5173
  // The frontend uses relative /api paths which will be proxied by the backend CORS
  spawn("npx", ["serve", "-s", "dist", "-l", "5173"], {
    stdio: "inherit",
  });

  // Wait a moment then show verification
  await new Promise((resolve) => setTimeout(resolve, 2000));

  log("\n✅ All services started!", "green");
  log("\n📍 Access your application:", "bright");
  log("   Frontend:  http://localhost:5173", "cyan");
  log("   Backend:   http://localhost:3001/api", "cyan");
  log("\n", "reset");
}

main().catch((err) => {
  log(`Error: ${err.message}`, "yellow");
  process.exit(1);
});
