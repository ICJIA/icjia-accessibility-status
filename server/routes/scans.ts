/**
 * @fileoverview Scan Management Routes (Mock/Dummy Implementation)
 * Handles scan triggering with mock data for UI testing.
 * This is Phase 2 development - actual Lighthouse/Axe execution comes later.
 *
 * @module routes/scans
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * Mock Lighthouse Report
 */
function generateMockLighthouseReport() {
  return {
    score: Math.floor(Math.random() * 30) + 70, // 70-100
    categories: {
      performance: { score: Math.floor(Math.random() * 30) + 70 },
      accessibility: { score: Math.floor(Math.random() * 30) + 70 },
      "best-practices": { score: Math.floor(Math.random() * 30) + 70 },
      seo: { score: Math.floor(Math.random() * 30) + 70 },
    },
    audits: {
      "color-contrast": {
        score: Math.random() > 0.5 ? 1 : 0,
        displayValue: "2 elements have insufficient color contrast",
      },
      "image-alt-text": {
        score: Math.random() > 0.5 ? 1 : 0,
        displayValue: "3 images missing alt text",
      },
    },
  };
}

/**
 * Mock Axe Report
 */
function generateMockAxeReport() {
  return {
    violations: Math.floor(Math.random() * 10),
    passes: Math.floor(Math.random() * 50) + 40,
    incomplete: Math.floor(Math.random() * 5),
    inapplicable: Math.floor(Math.random() * 20) + 10,
    summary: {
      critical: Math.floor(Math.random() * 3),
      serious: Math.floor(Math.random() * 5),
      moderate: Math.floor(Math.random() * 8),
      minor: Math.floor(Math.random() * 10),
    },
    violations_list: [
      {
        id: "color-contrast",
        impact: "serious",
        message: "Elements must have sufficient color contrast",
        nodes: Math.floor(Math.random() * 5) + 1,
      },
      {
        id: "image-alt",
        impact: "critical",
        message: "Images must have alternative text",
        nodes: Math.floor(Math.random() * 3),
      },
    ],
  };
}

/**
 * Generate mock violations for a scan
 */
async function generateMockViolations(scanId: string, siteUrl: string) {
  const mockViolations = [
    {
      violation_type: "axe",
      rule_id: "color-contrast",
      rule_name: "Color Contrast",
      description: "Text has insufficient color contrast",
      impact_level: "serious",
      wcag_level: "AA",
      page_url: siteUrl,
      element_selector: ".header h1",
      element_count: 1,
      help_url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum",
      suggested_fix:
        "Increase the contrast ratio between text and background colors",
    },
    {
      violation_type: "axe",
      rule_id: "image-alt-text",
      rule_name: "Image Alt Text",
      description: "Images must have alternative text",
      impact_level: "critical",
      wcag_level: "A",
      page_url: siteUrl,
      element_selector: "img.logo",
      element_count: 2,
      help_url: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content",
      suggested_fix: "Add descriptive alt text to all images",
    },
    {
      violation_type: "lighthouse",
      rule_id: "label",
      rule_name: "Form Elements Missing Labels",
      description: "Form elements should have associated labels",
      impact_level: "moderate",
      wcag_level: "AA",
      page_url: siteUrl,
      element_selector: "input#search",
      element_count: 1,
      help_url:
        "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions",
      suggested_fix:
        "Associate form inputs with label elements using for/id attributes",
    },
  ];

  // Randomly select 1-3 violations
  const numViolations = Math.floor(Math.random() * 3) + 1;
  const selectedViolations = mockViolations
    .sort(() => Math.random() - 0.5)
    .slice(0, numViolations);

  const violationsToInsert = selectedViolations.map((v) => ({
    ...v,
    scan_id: scanId,
  }));

  const { error } = await supabase
    .from("scan_violations")
    .insert(violationsToInsert);

  if (error) {
    console.error("Error creating mock violations:", error);
  } else {
    console.log(
      `[Mock Scan] Created ${violationsToInsert.length} mock violations for scan ${scanId}`
    );
  }
}

/**
 * POST /api/scans
 * Trigger a new scan (mock implementation for UI testing)
 * Creates a scan record with status='pending', then simulates completion
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { site_id, scan_type = "both" } = req.body;

    if (!site_id) {
      return res.status(400).json({ error: "site_id is required" });
    }

    if (!["lighthouse", "axe", "both"].includes(scan_type)) {
      return res.status(400).json({ error: "Invalid scan_type" });
    }

    // Verify site exists
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, url")
      .eq("id", site_id)
      .single();

    if (siteError || !site) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Create scan record with status='pending'
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert([
        {
          site_id,
          status: "pending",
          scan_type,
          admin_id: req.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (scanError || !scan) {
      console.error("Error creating scan:", scanError);
      return res.status(500).json({ error: "Failed to create scan" });
    }

    console.log(`[Mock Scan] Created scan ${scan.id} for site ${site_id}`);

    // Simulate scan completion after 3-5 seconds
    setTimeout(async () => {
      try {
        const lighthouseReport =
          scan_type === "axe" ? null : generateMockLighthouseReport();
        const axeReport =
          scan_type === "lighthouse" ? null : generateMockAxeReport();

        const lighthouseScore = lighthouseReport?.score || null;
        const axeScore = axeReport?.violations
          ? 100 - axeReport.violations
          : null;
        const completedAt = new Date().toISOString();

        // Update scan with results
        const { error: updateError } = await supabase
          .from("scans")
          .update({
            status: "completed",
            lighthouse_score: lighthouseScore,
            axe_score: axeScore,
            lighthouse_report: lighthouseReport,
            axe_report: axeReport,
            completed_at: completedAt,
            updated_at: completedAt,
          })
          .eq("id", scan.id);

        if (updateError) {
          console.error("Error updating scan:", updateError);
        } else {
          // Create score history record linked to this scan
          const { error: historyError } = await supabase
            .from("score_history")
            .insert({
              site_id: scan.site_id,
              scan_id: scan.id,
              axe_score: axeScore,
              lighthouse_score: lighthouseScore,
              recorded_at: completedAt,
            });

          if (historyError) {
            console.error("Error creating score history:", historyError);
          } else {
            console.log(
              `[Mock Scan] Completed scan ${scan.id} - LH: ${lighthouseScore}, Axe: ${axeScore}`
            );
            console.log(
              `[Mock Scan] Created score history record for site ${scan.site_id}`
            );

            // Generate mock violations
            await generateMockViolations(scan.id, siteUrl);
          }
        }
      } catch (error) {
        console.error("[Mock Scan] Error in completion simulation:", error);
      }
    }, 3000 + Math.random() * 2000); // 3-5 seconds

    return res.status(201).json({ scan });
  } catch (error) {
    console.error("Create scan error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/scans/:scanId/violations
 * Fetch all violations for a specific scan
 */
router.get("/:scanId/violations", async (req: AuthRequest, res) => {
  try {
    const { scanId } = req.params;

    const { data: violations, error } = await supabase
      .from("scan_violations")
      .select("*")
      .eq("scan_id", scanId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching violations:", error);
      return res.status(500).json({ error: "Failed to fetch violations" });
    }

    return res.json({ violations: violations || [] });
  } catch (error) {
    console.error("Fetch violations error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
