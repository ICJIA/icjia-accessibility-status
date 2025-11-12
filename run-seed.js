import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env file
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  try {
    console.log("🌱 Starting seed data creation...\n");

    // Step 1: Clear existing demo data
    console.log("📋 Step 1: Clearing existing demo data...");
    const deleteIds = [
      "550e8400-e29b-41d4-a716-446655460001",
      "550e8400-e29b-41d4-a716-446655460002",
      "550e8400-e29b-41d4-a716-446655460003",
      "550e8400-e29b-41d4-a716-446655460004",
      "550e8400-e29b-41d4-a716-446655460005",
    ];

    const { error: actError } = await supabase
      .from("activity_log")
      .delete()
      .in("id", deleteIds);
    if (actError) console.log("Activity log delete:", actError.message);

    const payloadIds = [
      "550e8400-e29b-41d4-a716-446655450001",
      "550e8400-e29b-41d4-a716-446655450002",
      "550e8400-e29b-41d4-a716-446655450003",
      "550e8400-e29b-41d4-a716-446655450004",
      "550e8400-e29b-41d4-a716-446655450005",
    ];

    const { error: payError } = await supabase
      .from("api_payloads")
      .delete()
      .in("id", payloadIds);
    if (payError) console.log("Payloads delete:", payError.message);

    const siteIds = [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440004",
      "550e8400-e29b-41d4-a716-446655440005",
    ];

    const { error: siteError } = await supabase
      .from("sites")
      .delete()
      .in("id", siteIds);
    if (siteError) console.log("Sites delete:", siteError.message);

    console.log("✅ Cleared existing demo data\n");

    // Step 2: Create demo sites
    console.log("📋 Step 2: Creating demo sites...");
    const now = new Date().toISOString();
    const sites = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        title: "ICJIA Main Website",
        description:
          "The main ICJIA website providing information about criminal justice initiatives",
        url: "https://www.icjia.org",
        documentation_url: "https://www.icjia.org/docs",
        axe_score: 92,
        lighthouse_score: 95,
        axe_last_updated: now,
        lighthouse_last_updated: now,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        title: "ICJIA Research Hub",
        description:
          "Research publications and data analysis portal for criminal justice research",
        url: "https://research.icjia.org",
        documentation_url: "https://research.icjia.org/docs",
        axe_score: 88,
        lighthouse_score: 91,
        axe_last_updated: now,
        lighthouse_last_updated: now,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        title: "ICJIA Grant Management System",
        description: "Online portal for grant applications and management",
        url: "https://grants.icjia.org",
        documentation_url: "https://grants.icjia.org/help",
        axe_score: 85,
        lighthouse_score: 88,
        axe_last_updated: now,
        lighthouse_last_updated: now,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        title: "ICJIA Data Portal",
        description:
          "Public data repository with criminal justice statistics and trends",
        url: "https://data.icjia.org",
        documentation_url: "https://data.icjia.org/api-docs",
        axe_score: 90,
        lighthouse_score: 93,
        axe_last_updated: now,
        lighthouse_last_updated: now,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        title: "ICJIA Training Academy",
        description:
          "Online training and certification programs for criminal justice professionals",
        url: "https://academy.icjia.org",
        documentation_url: "https://academy.icjia.org/courses",
        axe_score: 87,
        lighthouse_score: 89,
        axe_last_updated: now,
        lighthouse_last_updated: now,
      },
    ];

    const { error: sitesInsertError } = await supabase
      .from("sites")
      .insert(sites);
    if (sitesInsertError) throw sitesInsertError;
    console.log(`✅ Created ${sites.length} demo sites\n`);

    // Step 3: Create API payloads
    console.log("📋 Step 3: Creating API payloads...");
    const payloads = [
      {
        id: "550e8400-e29b-41d4-a716-446655450001",
        site_id: "550e8400-e29b-41d4-a716-446655440001",
        payload_id: "api-import-2025-11-10T10-00-00-000Z",
        payload: {
          title: "ICJIA Main Website",
          axe_score: 92,
          lighthouse_score: 95,
          axe_violations: [
            { id: "color-contrast", impact: "serious", nodes: 3 },
          ],
        },
        payload_size: 456,
        description: "Initial accessibility scan for main website",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655450002",
        site_id: "550e8400-e29b-41d4-a716-446655440002",
        payload_id: "api-import-2025-11-10T09-30-00-000Z",
        payload: {
          title: "ICJIA Research Hub",
          axe_score: 88,
          lighthouse_score: 91,
          axe_violations: [
            { id: "color-contrast", impact: "serious", nodes: 5 },
          ],
        },
        payload_size: 512,
        description: "Research hub accessibility audit",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655450003",
        site_id: "550e8400-e29b-41d4-a716-446655440003",
        payload_id: "api-import-2025-11-10T09-00-00-000Z",
        payload: {
          title: "ICJIA Grant Management System",
          axe_score: 85,
          lighthouse_score: 88,
          axe_violations: [
            { id: "color-contrast", impact: "serious", nodes: 7 },
          ],
        },
        payload_size: 678,
        description: "Grant system accessibility review",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655450004",
        site_id: "550e8400-e29b-41d4-a716-446655440004",
        payload_id: "api-import-2025-11-10T08-30-00-000Z",
        payload: {
          title: "ICJIA Data Portal",
          axe_score: 90,
          lighthouse_score: 93,
          axe_violations: [
            { id: "color-contrast", impact: "serious", nodes: 2 },
          ],
        },
        payload_size: 389,
        description: "Data portal accessibility scan",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655450005",
        site_id: "550e8400-e29b-41d4-a716-446655440005",
        payload_id: "api-import-2025-11-10T08-00-00-000Z",
        payload: {
          title: "ICJIA Training Academy",
          axe_score: 87,
          lighthouse_score: 89,
          axe_violations: [
            { id: "color-contrast", impact: "serious", nodes: 4 },
          ],
        },
        payload_size: 534,
        description: "Training academy accessibility audit",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
    ];

    const { error: payloadsInsertError } = await supabase
      .from("api_payloads")
      .insert(payloads);
    if (payloadsInsertError) throw payloadsInsertError;
    console.log(`✅ Created ${payloads.length} API payloads\n`);

    // Step 3.5: Create score history for demo sites
    console.log("📋 Step 3.5: Creating score history for demo sites...");

    // Get all created sites to create history for them
    const { data: allSites, error: sitesError } = await supabase
      .from("sites")
      .select("id, axe_score, lighthouse_score");

    if (sitesError) throw sitesError;

    // Create 6 historical records for each site
    let historyCount = 0;
    for (const site of allSites) {
      const baseAxe = Math.max(50, site.axe_score - 20);
      const baseLighthouse = Math.max(50, site.lighthouse_score - 20);

      for (let i = 0; i < 6; i++) {
        const improvementFactor = i / 5;
        const axeScore = Math.round(baseAxe + improvementFactor * 20);
        const lighthouseScore = Math.round(
          baseLighthouse + improvementFactor * 20
        );

        // Create date for each historical record (spread across 6 months)
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        date.setDate(8); // Set to 8th of each month for consistency

        const { error: historyError } = await supabase
          .from("score_history")
          .insert({
            site_id: site.id,
            axe_score: axeScore,
            lighthouse_score: lighthouseScore,
            recorded_at: date.toISOString(),
          });

        if (historyError) {
          if (historyError.message.includes("row-level security")) {
            console.log(
              "⚠️  RLS policy prevents inserting score history with anon key.\n"
            );
            console.log(
              "Please run this SQL in Supabase SQL Editor to fix the policy:\n"
            );
            console.log(`
              DROP POLICY IF EXISTS "Authenticated users can create history records" ON score_history;

              CREATE POLICY "Authenticated users can create history records"
                ON score_history FOR INSERT
                TO anon, authenticated
                WITH CHECK (true);
            `);
            console.log("\nThen run this script again: node run-seed.js\n");
            process.exit(1);
          }
          throw historyError;
        }
        historyCount++;
      }
    }

    console.log(`✅ Created ${historyCount} score history records\n`);

    // Step 4: Create activity log entries
    console.log("📋 Step 4: Creating activity log entries...");
    const activities = [
      {
        event_type: "api_import",
        event_description:
          "API import: ICJIA Main Website - Accessibility scan completed",
        entity_type: "site",
        entity_id: "550e8400-e29b-41d4-a716-446655440001",
        metadata: {
          action: "created",
          payload_uuid: "550e8400-e29b-41d4-a716-446655450001",
          axe_score: 92,
          lighthouse_score: 95,
        },
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        event_type: "api_import",
        event_description:
          "API import: ICJIA Research Hub - Accessibility scan completed",
        entity_type: "site",
        entity_id: "550e8400-e29b-41d4-a716-446655440002",
        metadata: {
          action: "created",
          payload_uuid: "550e8400-e29b-41d4-a716-446655450002",
          axe_score: 88,
          lighthouse_score: 91,
        },
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        event_type: "api_import",
        event_description:
          "API import: ICJIA Grant Management System - Accessibility scan completed",
        entity_type: "site",
        entity_id: "550e8400-e29b-41d4-a716-446655440003",
        metadata: {
          action: "created",
          payload_uuid: "550e8400-e29b-41d4-a716-446655450003",
          axe_score: 85,
          lighthouse_score: 88,
        },
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        event_type: "api_import",
        event_description:
          "API import: ICJIA Data Portal - Accessibility scan completed",
        entity_type: "site",
        entity_id: "550e8400-e29b-41d4-a716-446655440004",
        metadata: {
          action: "created",
          payload_uuid: "550e8400-e29b-41d4-a716-446655450004",
          axe_score: 90,
          lighthouse_score: 93,
        },
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
      {
        event_type: "api_import",
        event_description:
          "API import: ICJIA Training Academy - Accessibility scan completed",
        entity_type: "site",
        entity_id: "550e8400-e29b-41d4-a716-446655440005",
        metadata: {
          action: "created",
          payload_uuid: "550e8400-e29b-41d4-a716-446655450005",
          axe_score: 87,
          lighthouse_score: 89,
        },
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Demo)",
      },
    ];

    const { error: activitiesInsertError } = await supabase
      .from("activity_log")
      .insert(activities);
    if (activitiesInsertError) throw activitiesInsertError;
    console.log(`✅ Created ${activities.length} activity log entries\n`);

    console.log("🎉 Seed data creation complete!");
    console.log("\nVerifying data...");

    const { count: siteCount } = await supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .in("id", siteIds);

    const { count: payloadCount } = await supabase
      .from("api_payloads")
      .select("*", { count: "exact", head: true })
      .in("id", payloadIds);

    const { count: activityCount } = await supabase
      .from("activity_log")
      .select("*", { count: "exact", head: true })
      .in("id", deleteIds);

    console.log(`✅ Sites: ${siteCount}`);
    console.log(`✅ Payloads: ${payloadCount}`);
    console.log(`✅ Activity log entries: ${activityCount}`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

runSeed();
