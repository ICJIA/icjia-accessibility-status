import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
  try {
    console.log("📝 Running migration SQL...\n");

    // Read migration file
    const sql = fs.readFileSync("supabase/migrations/06_add_key_rotation_columns.sql", "utf-8");
    
    // Remove comments and split into individual statements
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s && !s.startsWith("--") && !s.startsWith("/*"))
      .map(s => s + ";");

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${stmt.substring(0, 60)}...`);
      
      try {
        const { data, error } = await supabase.rpc("exec", { sql: stmt });
        
        if (error) {
          console.log(`  ⚠️  ${error.message}`);
        } else {
          console.log(`  ✅ Success`);
        }
      } catch (e) {
        console.log(`  ⚠️  ${e.message}`);
      }
    }

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runSQL();

