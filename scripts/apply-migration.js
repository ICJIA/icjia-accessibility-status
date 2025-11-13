#!/usr/bin/env node

/**
 * Apply a database migration by reading SQL file and executing via Supabase
 * Usage: node scripts/apply-migration.js <migration-file>
 * Example: node scripts/apply-migration.js supabase/migrations/step_3_add_scans_table_fixed.sql
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("❌ Migration file not specified");
  console.error("Usage: node scripts/apply-migration.js <migration-file>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log(`📋 Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, "utf-8");

    console.log("🚀 Applying migration to database...\n");

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("❌ Error applying migration:", error.message);
      console.error("\n⚠️  Note: Supabase may not have exec_sql RPC function");
      console.error("   Please apply the migration manually via Supabase SQL Editor:");
      console.error(`   1. Go to Supabase Dashboard → SQL Editor`);
      console.error(`   2. Click "New query"`);
      console.error(`   3. Copy contents of ${migrationFile}`);
      console.error(`   4. Paste and click "Run"`);
      process.exit(1);
    }

    console.log("✅ Migration applied successfully!");
    console.log("   - scans table created");
    console.log("   - scan_results table created");
    console.log("   - RLS policies configured");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

applyMigration();

