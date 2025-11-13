#!/usr/bin/env node

/**
 * Apply the scans table migration to the database
 * This script connects directly to PostgreSQL and executes the migration SQL
 */

import pkg from "pg";
const { Client } = pkg;
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse Supabase connection string
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseUrl) {
  console.error("❌ VITE_SUPABASE_URL not set in .env");
  process.exit(1);
}

// Extract database connection info from Supabase URL
// Format: https://[project-id].supabase.co
const projectId = supabaseUrl.split("//")[1].split(".")[0];
const dbHost = `${projectId}.supabase.co`;
const dbPort = 5432;
const dbName = "postgres";
const dbUser = "postgres";
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!dbPassword) {
  console.error("❌ SUPABASE_DB_PASSWORD not set in .env");
  console.error("   This is required to apply migrations directly to the database");
  process.exit(1);
}

async function applyMigration() {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔗 Connecting to database...");
    await client.connect();
    console.log("✅ Connected to database\n");

    console.log("📋 Reading migration file...");
    const migrationPath = path.join(
      __dirname,
      "../supabase/migrations/step_3_add_scans_table_fixed.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("🚀 Applying migration...\n");
    await client.query(sql);

    console.log("✅ Migration applied successfully!");
    console.log("   - scans table created");
    console.log("   - scan_results table created");
    console.log("   - Indexes created");
    console.log("   - RLS policies configured\n");
  } catch (error) {
    console.error("❌ Error applying migration:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
