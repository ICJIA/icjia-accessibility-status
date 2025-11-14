#!/usr/bin/env node

/**
 * Test script to debug Lighthouse audit execution
 * Run with: npx tsx scripts/test-lighthouse.ts <url>
 * Example: npx tsx scripts/test-lighthouse.ts https://dvfr.illinois.gov/
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const testUrl = process.argv[2] || "https://example.com";

console.log("=".repeat(80));
console.log("🧪 LIGHTHOUSE AUDIT TEST SCRIPT");
console.log("=".repeat(80));
console.log(`URL: ${testUrl}`);
console.log(`Time: ${new Date().toISOString()}`);
console.log("=".repeat(80));

async function testLighthouseAudit() {
  let chrome;

  try {
    console.log("\n[STEP 1] Launching Chrome browser...");
    chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
    console.log(`✅ Chrome launched on port ${chrome.port}`);

    console.log(`\n[STEP 2] Running Lighthouse audit on ${testUrl}...`);
    const options = {
      logLevel: "info" as const,
      output: "json" as const,
      port: chrome.port,
      onlyCategories: ["accessibility"],
    };

    const runnerResult = await lighthouse(testUrl, options);

    if (!runnerResult) {
      throw new Error("❌ Lighthouse returned no results");
    }

    console.log("✅ Lighthouse audit completed successfully");

    console.log("\n[STEP 3] Processing results...");
    const lhr = runnerResult.lhr;

    console.log(`✅ Results processed:`);
    console.log(`   - URL: ${lhr.finalUrl}`);
    console.log(`   - Accessibility Score: ${lhr.categories.accessibility.score * 100}/100`);
    console.log(`   - Audits Run: ${Object.keys(lhr.audits).length}`);

    // Count failed audits
    const failedAudits = Object.entries(lhr.audits).filter(
      ([_, audit]: [string, any]) => audit.score === 0
    );
    console.log(`   - Failed Audits: ${failedAudits.length}`);

    if (failedAudits.length > 0) {
      console.log("\n   First 10 Failed Audits:");
      failedAudits.slice(0, 10).forEach(([id, audit]: [string, any]) => {
        console.log(`     - ${audit.title} (${id}): ${audit.score}`);
      });
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ LIGHTHOUSE AUDIT TEST COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));

    console.log("\n📊 FULL RESULTS:");
    console.log(JSON.stringify(lhr, null, 2));

  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ LIGHTHOUSE AUDIT TEST FAILED");
    console.error("=".repeat(80));
    console.error(
      "\nError:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    console.error("\nFull error object:");
    console.error(error);
    process.exit(1);

  } finally {
    if (chrome) {
      console.log("\n[CLEANUP] Closing Chrome...");
      await chrome.kill();
      console.log("✅ Chrome closed");
    }
  }
}

testLighthouseAudit();

