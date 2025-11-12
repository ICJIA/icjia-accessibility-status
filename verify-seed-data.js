import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySeedData() {
  console.log("🔍 Verifying seed data...\n");

  try {
    // Check sites
    console.log("📍 Checking sites table...");
    const { data: sites, error: sitesError } = await supabase
      .from("sites")
      .select("id, title, url")
      .order("created_at", { ascending: false })
      .limit(5);

    if (sitesError) {
      console.error("❌ Error fetching sites:", sitesError);
    } else {
      console.log(`✅ Found ${sites?.length || 0} sites:`);
      sites?.forEach((site) => {
        console.log(`   - ${site.title} (${site.id})`);
      });
    }

    // Check payloads
    console.log("\n📦 Checking api_payloads table...");
    const { data: payloads, error: payloadsError } = await supabase
      .from("api_payloads")
      .select("id, payload_id, site_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (payloadsError) {
      console.error("❌ Error fetching payloads:", payloadsError);
    } else {
      console.log(`✅ Found ${payloads?.length || 0} payloads:`);
      payloads?.forEach((payload) => {
        console.log(`   - ${payload.id} (payload_id: ${payload.payload_id})`);
      });
    }

    // Check activity log
    console.log("\n📋 Checking activity_log table...");
    const { data: activities, error: activitiesError } = await supabase
      .from("activity_log")
      .select("id, event_type, entity_id, metadata")
      .order("created_at", { ascending: false })
      .limit(5);

    if (activitiesError) {
      console.error("❌ Error fetching activity log:", activitiesError);
    } else {
      console.log(`✅ Found ${activities?.length || 0} activity log entries:`);
      activities?.forEach((activity) => {
        const payloadUuid = activity.metadata?.payload_uuid;
        console.log(
          `   - ${activity.event_type} (entity: ${
            activity.entity_id
          }, payload_uuid: ${payloadUuid || "N/A"})`
        );
      });
    }

    // Test fetching a specific payload by UUID
    if (payloads && payloads.length > 0) {
      console.log("\n🧪 Testing payload fetch by UUID...");
      const testPayloadId = payloads[0].id;
      console.log(`   Fetching payload: ${testPayloadId}`);

      const { data: payload, error: payloadError } = await supabase
        .from("api_payloads")
        .select("*")
        .eq("id", testPayloadId)
        .single();

      if (payloadError) {
        console.error(
          `❌ Error fetching payload ${testPayloadId}:`,
          payloadError
        );
      } else if (payload) {
        console.log(`✅ Successfully fetched payload`);
        console.log(`   - ID: ${payload.id}`);
        console.log(`   - Payload ID: ${payload.payload_id}`);
        console.log(`   - Size: ${payload.payload_size} bytes`);
        console.log(`   - Has payload data: ${payload.payload ? "Yes" : "No"}`);
        if (payload.payload) {
          console.log(`\n📄 Payload JSON Data:`);
          console.log(JSON.stringify(payload.payload, null, 2));
        }
      } else {
        console.log(`❌ Payload not found`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

verifySeedData();
