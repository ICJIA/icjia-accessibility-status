/**
 * @fileoverview Data Export Routes
 * Handles exporting accessibility data in multiple formats (JSON, CSV, Markdown, PDF).
 * Provides public access to site data for reporting and analysis.
 *
 * @module routes/export
 */

import { Router } from "express";
import { parse } from "papaparse";
import { supabase } from "../utils/supabase.js";

/**
 * Express router for data export endpoints
 * @type {express.Router}
 */
const router = Router();

function formatMarkdown(sites: any[], includeHistory = false) {
  let markdown = "# ICJIA Accessibility Status Report\n\n";
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  markdown += `Total Sites: ${sites.length}\n\n`;

  markdown += "## Sites Summary\n\n";
  markdown += "| Title | URL | Axe Score | Lighthouse Score | Last Updated |\n";
  markdown += "|-------|-----|-----------|------------------|-------------|\n";

  sites.forEach((site) => {
    const lastUpdated = site.updated_at
      ? new Date(site.updated_at).toLocaleDateString()
      : site.axe_last_updated;
    markdown += `| ${site.title} | ${site.url} | ${site.axe_score} | ${site.lighthouse_score} | ${lastUpdated} |\n`;
  });

  if (includeHistory) {
    markdown += "\n## Detailed Site Information\n\n";

    sites.forEach((site) => {
      markdown += `### ${site.title}\n\n`;
      markdown += `**URL:** ${site.url}\n\n`;
      markdown += `**Description:** ${site.description}\n\n`;
      markdown += `**Current Scores:**\n`;
      markdown += `- Axe: ${site.axe_score}/100 (updated: ${site.axe_last_updated})\n`;
      markdown += `- Lighthouse: ${site.lighthouse_score}/100 (updated: ${site.lighthouse_last_updated})\n`;
      markdown += `- Last JSON Upload: ${
        site.updated_at ? new Date(site.updated_at).toLocaleString() : "N/A"
      }\n\n`;

      if (site.score_history && site.score_history.length > 0) {
        markdown += `**Score History (${site.score_history.length} records):**\n\n`;
        markdown += "| Date | Axe Score | Lighthouse Score |\n";
        markdown += "|------|-----------|------------------|\n";

        site.score_history.forEach((record: any) => {
          const date = new Date(record.recorded_at).toLocaleString();
          markdown += `| ${date} | ${record.axe_score} | ${record.lighthouse_score} |\n`;
        });

        markdown += "\n";
      } else {
        markdown += "**Score History:** No historical data available\n\n";
      }

      markdown += "---\n\n";
    });
  }

  return markdown;
}

function formatCSV(sites: any[], includeHistory = false) {
  if (!includeHistory) {
    // Simple format without history
    const data = sites.map((site) => ({
      title: site.title,
      description: site.description,
      url: site.url,
      documentation_url: site.documentation_url || "",
      axe_score: site.axe_score,
      lighthouse_score: site.lighthouse_score,
      axe_last_updated: site.axe_last_updated,
      lighthouse_last_updated: site.lighthouse_last_updated,
      last_json_upload: site.updated_at
        ? new Date(site.updated_at).toISOString()
        : "",
    }));

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => {
        const value = row[header as keyof typeof row];
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      })
    );

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  // Detailed format with history - one row per historical record
  const rows: any[] = [];

  sites.forEach((site) => {
    if (site.score_history && site.score_history.length > 0) {
      site.score_history.forEach((record: any) => {
        rows.push({
          site_title: site.title,
          site_url: site.url,
          site_description: site.description,
          documentation_url: site.documentation_url || "",
          axe_score: record.axe_score,
          lighthouse_score: record.lighthouse_score,
          recorded_at: new Date(record.recorded_at).toISOString(),
          is_current: false,
          last_json_upload: site.updated_at
            ? new Date(site.updated_at).toISOString()
            : "",
        });
      });
    }

    // Add current scores as the most recent entry
    rows.push({
      site_title: site.title,
      site_url: site.url,
      site_description: site.description,
      documentation_url: site.documentation_url || "",
      axe_score: site.axe_score,
      lighthouse_score: site.lighthouse_score,
      recorded_at: site.updated_at || new Date().toISOString(),
      is_current: true,
      last_json_upload: site.updated_at
        ? new Date(site.updated_at).toISOString()
        : "",
    });
  });

  const headers = [
    "site_title",
    "site_url",
    "site_description",
    "documentation_url",
    "axe_score",
    "lighthouse_score",
    "recorded_at",
    "is_current",
    "last_json_upload",
  ];
  const csvRows = rows.map((row) =>
    headers.map((header) => {
      const value = row[header];
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    })
  );

  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}

router.get("/dashboard", async (req, res) => {
  try {
    const { format = "json" } = req.query;

    // Validate format parameter
    const validFormats = ["json", "csv", "markdown"];
    if (!validFormats.includes(format as string)) {
      return res.status(400).json({
        error: "Invalid format parameter",
        validFormats,
      });
    }

    const { data: sites, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sites:", error);
      return res.status(500).json({ error: "Failed to fetch sites" });
    }

    const timestamp = new Date().toISOString().split("T")[0];

    switch (format) {
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-accessibility-dashboard-${timestamp}.csv"`
        );
        return res.send(formatCSV(sites));

      case "markdown":
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-accessibility-dashboard-${timestamp}.md"`
        );
        return res.send(formatMarkdown(sites));

      case "json":
      default:
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-accessibility-dashboard-${timestamp}.json"`
        );
        return res.json({
          exported_at: new Date().toISOString(),
          total_sites: sites.length,
          sites,
        });
    }
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/site/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { format = "json" } = req.query;

    // Validate format parameter
    const validFormats = ["json", "csv", "markdown"];
    if (!validFormats.includes(format as string)) {
      return res.status(400).json({
        error: "Invalid format parameter",
        validFormats,
      });
    }

    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();

    if (siteError || !site) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { data: history, error: historyError } = await supabase
      .from("score_history")
      .select("*")
      .eq("site_id", id)
      .order("recorded_at", { ascending: true });

    const siteWithHistory = {
      ...site,
      score_history: history || [],
    };

    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = site.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    switch (format) {
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-${safeName}-${timestamp}.csv"`
        );
        return res.send(formatCSV([siteWithHistory], true));

      case "markdown":
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-${safeName}-${timestamp}.md"`
        );
        return res.send(formatMarkdown([siteWithHistory], true));

      case "json":
      default:
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-${safeName}-${timestamp}.json"`
        );
        return res.json({
          exported_at: new Date().toISOString(),
          site: siteWithHistory,
        });
    }
  } catch (error) {
    console.error("Export site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/full-report", async (req, res) => {
  try {
    const { format = "json" } = req.query;

    // Validate format parameter
    const validFormats = ["json", "csv", "markdown"];
    if (!validFormats.includes(format as string)) {
      return res.status(400).json({
        error: "Invalid format parameter",
        validFormats,
      });
    }

    const { data: sites, error: sitesError } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (sitesError) {
      console.error("Error fetching sites:", sitesError);
      return res.status(500).json({ error: "Failed to fetch sites" });
    }

    const sitesWithHistory = await Promise.all(
      sites.map(async (site) => {
        const { data: history } = await supabase
          .from("score_history")
          .select("*")
          .eq("site_id", site.id)
          .order("recorded_at", { ascending: true });

        return {
          ...site,
          score_history: history || [],
        };
      })
    );

    const avgAxe = Math.round(
      sites.reduce((sum, s) => sum + s.axe_score, 0) / sites.length
    );
    const avgLighthouse = Math.round(
      sites.reduce((sum, s) => sum + s.lighthouse_score, 0) / sites.length
    );

    const fullReport = {
      exported_at: new Date().toISOString(),
      total_sites: sites.length,
      average_axe_score: avgAxe,
      average_lighthouse_score: avgLighthouse,
      sites: sitesWithHistory,
    };

    const timestamp = new Date().toISOString().split("T")[0];

    switch (format) {
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-full-report-${timestamp}.csv"`
        );
        return res.send(formatCSV(sites));

      case "markdown":
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-full-report-${timestamp}.md"`
        );
        return res.send(formatMarkdown(sites, true));

      case "json":
      default:
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="icjia-full-report-${timestamp}.json"`
        );
        return res.json(fullReport);
    }
  } catch (error) {
    console.error("Export full report error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
