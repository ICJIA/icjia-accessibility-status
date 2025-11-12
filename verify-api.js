#!/usr/bin/env node

/**
 * Test Script for ICJIA Accessibility Status Portal API Import
 *
 * This script demonstrates how to use the /api/sites/import endpoint
 * to programmatically upload site accessibility data using an API key.
 *
 * Usage:
 *   node verify-api.js <API_KEY>
 *
 * Or set the API_KEY environment variable:
 *   API_KEY=sk_live_... node verify-api.js
 *
 * Examples:
 *   node verify-api.js sk_live_abc123...
 *   API_KEY=sk_live_abc123... node verify-api.js
 */

// Get API key from command line argument or environment variable
const API_KEY = process.argv[2] || process.env.API_KEY;

// API endpoint (change this to your deployed URL in production)
const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api";

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(80));
  log(title, "bright");
  console.log("=".repeat(80) + "\n");
}

// Validate API key
if (!API_KEY) {
  log("❌ Error: API key is required", "red");
  console.log("\nUsage:");
  console.log("  node verify-api.js <API_KEY>");
  console.log("  API_KEY=sk_live_... node verify-api.js");
  console.log("\nGet your API key from the admin panel at /admin/api-keys");
  process.exit(1);
}

if (!API_KEY.startsWith("sk_live_") && !API_KEY.startsWith("sk_test_")) {
  log("❌ Error: Invalid API key format", "red");
  console.log("API keys must start with sk_live_ or sk_test_");
  process.exit(1);
}

// Example payloads
// Note: The "payload_description" field is like a Git commit message
// The site's "description" field describes the site itself

// Single site upload
const singleSitePayload = {
  payload_description: "Initial test upload with baseline accessibility scores",
  title: "Test Site - Single Upload",
  description:
    "This is a test site uploaded via the API to demonstrate single site import",
  url: "https://test-single.example.com",
  documentation_url: "https://test-single.example.com/accessibility",
  axe_score: 92,
  lighthouse_score: 95,
  axe_last_updated: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
  lighthouse_last_updated: new Date().toISOString().split("T")[0],
  axe_violations: [
    {
      id: "color-contrast",
      description: "Elements must have sufficient color contrast",
      nodes: 2,
      impact: "serious",
    },
    {
      id: "image-alt",
      description: "Images must have alternative text",
      nodes: 1,
      impact: "critical",
    },
  ],
  lighthouse_metrics: {
    performance: 92,
    accessibility: 95,
    best_practices: 88,
    seo: 94,
  },
};

// Multiple sites upload
const multipleSitesPayload = {
  payload_description:
    "Batch upload of three test sites with updated accessibility scores",
  sites: [
    {
      title: "Test Site 1 - Batch Upload",
      description: "First site in a batch upload demonstration",
      url: "https://test-batch-1.example.com",
      documentation_url: "https://test-batch-1.example.com/accessibility",
      axe_score: 88,
      lighthouse_score: 91,
      axe_last_updated: new Date().toISOString().split("T")[0],
      lighthouse_last_updated: new Date().toISOString().split("T")[0],
      axe_violations: [
        {
          id: "button-name",
          description: "Buttons must have discernible text",
          nodes: 3,
          impact: "critical",
        },
        {
          id: "link-name",
          description: "Links must have discernible text",
          nodes: 1,
          impact: "serious",
        },
      ],
      lighthouse_metrics: {
        performance: 88,
        accessibility: 91,
        best_practices: 85,
        seo: 89,
      },
    },
    {
      title: "Test Site 2 - Batch Upload",
      description: "Second site in a batch upload demonstration",
      url: "https://test-batch-2.example.com",
      axe_score: 95,
      lighthouse_score: 97,
      axe_last_updated: new Date().toISOString().split("T")[0],
      lighthouse_last_updated: new Date().toISOString().split("T")[0],
      axe_violations: [
        {
          id: "color-contrast",
          description: "Elements must have sufficient color contrast",
          nodes: 1,
          impact: "serious",
        },
      ],
      lighthouse_metrics: {
        performance: 97,
        accessibility: 97,
        best_practices: 96,
        seo: 98,
      },
    },
    {
      title: "Test Site 3 - Batch Upload",
      description: "Third site in a batch upload demonstration",
      url: "https://test-batch-3.example.com",
      axe_score: 90,
      lighthouse_score: 93,
      axe_last_updated: new Date().toISOString().split("T")[0],
      lighthouse_last_updated: new Date().toISOString().split("T")[0],
      axe_violations: [
        {
          id: "heading-order",
          description: "Headings should be in a logical order",
          nodes: 2,
          impact: "moderate",
        },
        {
          id: "form-field-multiple-labels",
          description: "Form fields should not have multiple labels",
          nodes: 1,
          impact: "moderate",
        },
      ],
      lighthouse_metrics: {
        performance: 93,
        accessibility: 93,
        best_practices: 90,
        seo: 92,
      },
    },
  ],
};

// Duplicate upload (same data as single site to test duplicate detection)
const duplicatePayload = {
  payload_description: "Duplicate upload test - should be skipped",
  title: "Test Site - Single Upload",
  description:
    "This is a test site uploaded via the API to demonstrate single site import",
  url: "https://test-single.example.com",
  documentation_url: "https://test-single.example.com/accessibility",
  axe_score: 92,
  lighthouse_score: 95,
  axe_last_updated: new Date().toISOString().split("T")[0],
  lighthouse_last_updated: new Date().toISOString().split("T")[0],
  axe_violations: [
    {
      id: "color-contrast",
      description: "Elements must have sufficient color contrast",
      nodes: 2,
      impact: "serious",
    },
    {
      id: "image-alt",
      description: "Images must have alternative text",
      nodes: 1,
      impact: "critical",
    },
  ],
  lighthouse_metrics: {
    performance: 92,
    accessibility: 95,
    best_practices: 88,
    seo: 94,
  },
};

/**
 * Make an API request to the import endpoint
 */
async function importSites(payload, testName) {
  logSection(`Test: ${testName}`);

  log("📤 Request:", "cyan");
  console.log(`  Endpoint: POST ${API_BASE_URL}/sites/import`);
  console.log(
    `  API Key: ${API_KEY.substring(0, 16)}****${API_KEY.substring(
      API_KEY.length - 4
    )}`
  );
  console.log("  Payload:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/sites/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    log("\n📥 Response:", "cyan");
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log("  Body:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      log("\n✅ Success!", "green");
      if (data.results) {
        console.log(`  Created: ${data.results.created}`);
        console.log(`  Updated: ${data.results.updated}`);
        console.log(`  Skipped: ${data.results.skipped}`);
        if (data.results.errors && data.results.errors.length > 0) {
          log(`  Errors: ${data.results.errors.length}`, "yellow");
          data.results.errors.forEach((err) => log(`    - ${err}`, "yellow"));
        }
      }
    } else {
      log("\n❌ Error!", "red");
      if (data.error) {
        console.log(`  Error: ${data.error}`);
      }
      if (data.message) {
        console.log(`  Message: ${data.message}`);
      }
    }

    return { success: response.ok, data };
  } catch (error) {
    log("\n❌ Request Failed!", "red");
    console.error("  Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  log("🚀 ICJIA Accessibility Status Portal - API Import Test", "bright");
  log(`   API Endpoint: ${API_BASE_URL}/sites/import`, "blue");
  log(
    `   API Key: ${API_KEY.substring(0, 16)}****${API_KEY.substring(
      API_KEY.length - 4
    )}`,
    "blue"
  );

  // Test 1: Single site upload
  await importSites(singleSitePayload, "Single Site Upload");

  // Wait a bit between requests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Multiple sites upload
  await importSites(multipleSitesPayload, "Multiple Sites Upload (Batch)");

  // Wait a bit between requests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3: Duplicate upload (should be skipped)
  await importSites(duplicatePayload, "Duplicate Upload (Should be Skipped)");

  logSection("All Tests Complete");
  log("✅ Test script finished successfully", "green");
  log("\nNext steps:", "bright");
  console.log("  1. Check the admin panel to see the imported sites");
  console.log("  2. Verify the audit trail in the api_payloads table");
  console.log("  3. Check the score_history table for historical data");
  console.log("  4. Review the API key usage statistics in /admin/api-keys");
}

// Run the tests
runTests().catch((error) => {
  log("\n❌ Fatal Error:", "red");
  console.error(error);
  process.exit(1);
});
