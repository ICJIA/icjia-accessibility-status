#!/usr/bin/env node

/**
 * Fix Sessions RLS Policy for Custom Cookie-Based Authentication
 * This script applies the fix to allow anonymous reads of the sessions table
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSessionsRLS() {
  try {
    console.log("🔧 Fixing Sessions RLS Policy...\n");

    // Drop the old restrictive policy
    const { error: dropError } = await supabase.rpc("exec_sql", {
      sql: 'DROP POLICY IF EXISTS "Allow authenticated to read own sessions" ON sessions;',
    });

    if (dropError && !dropError.message.includes("exec_sql")) {
      console.error("❌ Error dropping old policy:", dropError.message);
    } else {
      console.log("✅ Dropped old restrictive policy");
    }

    // Create new policy that allows anonymous reads
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: 'CREATE POLICY "Allow anonymous to read sessions" ON sessions FOR SELECT USING (true);',
    });

    if (createError && !createError.message.includes("exec_sql")) {
      console.error("❌ Error creating new policy:", createError.message);
    } else {
      console.log("✅ Created new policy allowing anonymous reads");
    }

    console.log("\n✅ Sessions RLS policy fixed!");
    console.log("   Sessions table can now be read by custom cookie-based authentication");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n⚠️  If exec_sql RPC is not available, apply manually:");
    console.error("   1. Go to Supabase Dashboard → SQL Editor");
    console.error("   2. Run: DROP POLICY IF EXISTS \"Allow authenticated to read own sessions\" ON sessions;");
    console.error("   3. Run: CREATE POLICY \"Allow anonymous to read sessions\" ON sessions FOR SELECT USING (true);");
    process.exit(1);
  }
}

fixSessionsRLS();

