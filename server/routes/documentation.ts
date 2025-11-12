/**
 * @fileoverview Documentation Routes
 * Handles in-app documentation management and retrieval.
 * Provides CRUD operations for documentation sections.
 *
 * @module routes/documentation
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

/**
 * Express router for documentation endpoints
 * @type {express.Router}
 */
const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data: docs, error } = await supabase
      .from("app_documentation")
      .select("*")
      .order("section_name", { ascending: true });

    if (error) {
      console.error("Error fetching documentation:", error);
      return res.status(500).json({ error: "Failed to fetch documentation" });
    }

    return res.json({ documentation: docs });
  } catch (error) {
    console.error("Get documentation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params;

    const { data: doc, error } = await supabase
      .from("app_documentation")
      .select("*")
      .eq("section_name", section)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: "Documentation section not found" });
    }

    return res.json({ documentation: doc });
  } catch (error) {
    console.error("Get documentation section error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:section", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { section } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const { data: existingDoc } = await supabase
      .from("app_documentation")
      .select("version")
      .eq("section_name", section)
      .single();

    const newVersion = existingDoc ? existingDoc.version + 1 : 1;

    const { data: updatedDoc, error } = await supabase
      .from("app_documentation")
      .update({
        content,
        last_updated: new Date().toISOString(),
        updated_by: req.userId,
        version: newVersion,
      })
      .eq("section_name", section)
      .select()
      .single();

    if (error) {
      console.error("Error updating documentation:", error);
      return res.status(500).json({ error: "Failed to update documentation" });
    }

    return res.json({ documentation: updatedDoc });
  } catch (error) {
    console.error("Update documentation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { section_name, content } = req.body;

    if (!section_name || !content) {
      return res
        .status(400)
        .json({ error: "Section name and content are required" });
    }

    const { data: newDoc, error } = await supabase
      .from("app_documentation")
      .insert([
        {
          section_name,
          content,
          updated_by: req.userId,
          version: 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating documentation:", error);
      return res.status(500).json({ error: "Failed to create documentation" });
    }

    return res.status(201).json({ documentation: newDoc });
  } catch (error) {
    console.error("Create documentation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
