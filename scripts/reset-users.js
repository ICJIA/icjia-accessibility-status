#!/usr/bin/env node

/**
 * Reset Users Script
 *
 * This script deletes all admin users, API keys, and sessions from the database,
 * forcing the application to return to its initial state where a new admin user
 * must be created on first access to /admin.
 *
 * SAFETY: This script will NOT run in production environments and requires
 * explicit user confirmation before proceeding.
 *
 * Usage: node scripts/reset-users.js
 */

require("dotenv").config();
const readline = require("readline");
const { createClient } = require("@supabase/supabase-js");

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================================================
// SAFETY CHECKS
// ============================================================================

function checkEnvironment() {
  if (NODE_ENV === "production") {
    console.error(
      "❌ ERROR: This script cannot be run in production environments"
    );
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ ERROR: Missing required environment variables");
    console.error("   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
}

// ============================================================================
// USER CONFIRMATION
// ============================================================================

async function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function displayInitialWarning() {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║          ⚠️  ADMIN USERS RESET - DESTRUCTIVE OPERATION ⚠️       ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
  console.log("This script will DELETE the following:");
  console.log("  ✗ ALL admin users (including the primary admin)");
  console.log("  ✗ ALL API keys");
  console.log("  ✗ ALL active sessions\n");
  console.log("This will PRESERVE:");
  console.log("  ✓ All sites and their data");
  console.log("  ✓ All score history");
  console.log("  ✓ All API payloads");
  console.log("  ✓ All activity logs\n");
  console.log("After running this script:");
  console.log("  → The application will require creating a new admin user");
  console.log(
    "  → You will need to visit /admin to create the first admin account"
  );
  console.log("  → All existing admin accounts will be permanently deleted");
  console.log("  → All API keys will need to be regenerated");
  console.log("  → This action CANNOT be undone\n");
  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );
}

function displaySecondWarning() {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║                    ⚠️  FINAL CONFIRMATION ⚠️                    ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║  You are about to permanently delete ALL admin users, API keys,║"
  );
  console.log(
    "║  and sessions. This action cannot be undone.                   ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║  All site data, history, and logs will be preserved.           ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
}

async function getFirstConfirmation() {
  console.log("FIRST CONFIRMATION:");
  console.log(
    "Type the following phrase to confirm you understand the consequences:"
  );
  console.log('"I understand this will delete all admin users and API keys"\n');

  const answer = await getUserInput("Enter confirmation phrase: ");

  if (answer !== "I understand this will delete all admin users and API keys") {
    console.log("\n❌ Incorrect phrase. Operation cancelled.\n");
    process.exit(0);
  }

  console.log("✓ First confirmation accepted\n");
}

async function getSecondConfirmation() {
  displaySecondWarning();

  console.log("SECOND CONFIRMATION:");
  console.log("Type the following phrase to confirm you want to proceed:");
  console.log('"DELETE ALL USERS NOW"\n');

  const answer = await getUserInput("Enter confirmation phrase: ");

  if (answer !== "DELETE ALL USERS NOW") {
    console.log("\n❌ Incorrect phrase. Operation cancelled.\n");
    process.exit(0);
  }

  console.log("✓ Second confirmation accepted\n");
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function deleteAllRecords(supabase, tableName) {
  try {
    // Get count before deletion
    const { count: countBefore } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    // Delete all records
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      throw error;
    }

    // Get count after deletion
    const { count: countAfter } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    return {
      success: true,
      deletedCount: countBefore || 0,
      remainingCount: countAfter || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function resetDatabase(supabase) {
  console.log("\n🔄 Starting database reset...\n");

  const results = {};

  // Delete in order to avoid foreign key constraint issues
  // 1. Sessions (no foreign keys)
  console.log("🗑️  Deleting all sessions...");
  results.sessions = await deleteAllRecords(supabase, "sessions");
  if (results.sessions.success) {
    console.log(`   ✓ Deleted ${results.sessions.deletedCount} session(s)\n`);
  } else {
    console.error(`   ✗ Error: ${results.sessions.error}\n`);
    return false;
  }

  // 2. API keys (no foreign keys)
  console.log("🗑️  Deleting all API keys...");
  results.apiKeys = await deleteAllRecords(supabase, "api_keys");
  if (results.apiKeys.success) {
    console.log(`   ✓ Deleted ${results.apiKeys.deletedCount} API key(s)\n`);
  } else {
    console.error(`   ✗ Error: ${results.apiKeys.error}\n`);
    return false;
  }

  // 3. Admin users (may be referenced by created_by, but ON DELETE SET NULL handles this)
  console.log("🗑️  Deleting all admin users...");
  results.adminUsers = await deleteAllRecords(supabase, "admin_users");
  if (results.adminUsers.success) {
    console.log(
      `   ✓ Deleted ${results.adminUsers.deletedCount} admin user(s)\n`
    );
  } else {
    console.error(`   ✗ Error: ${results.adminUsers.error}\n`);
    return false;
  }

  return true;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    // Check environment
    checkEnvironment();

    // Display initial warning
    displayInitialWarning();

    // Get first confirmation
    await getFirstConfirmation();

    // Get second confirmation
    await getSecondConfirmation();

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Reset database
    const success = await resetDatabase(supabase);

    if (success) {
      console.log("✅ Admin users reset completed successfully!\n");
      console.log("📋 Next steps:");
      console.log("   1. Start the application: npm run dev");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.log(`   2. Navigate to ${frontendUrl}/admin`);
      console.log("   3. Create a new admin user");
      console.log("   4. Log in with the new admin account\n");
      process.exit(0);
    } else {
      console.error("❌ Admin users reset failed\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
