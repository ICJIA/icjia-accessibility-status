/**
 * @fileoverview Supabase Client Configuration
 * Initializes and exports the Supabase client for database operations.
 * Handles PostgreSQL database access with Row Level Security.
 *
 * @module utils/supabase
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
// Use service role key for backend (bypasses RLS, has admin privileges)
// Falls back to anon key if service role key is not available
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Using anon key instead. " +
      "This may cause RLS policy issues. Add SUPABASE_SERVICE_ROLE_KEY to .env for production."
  );
}

/**
 * Supabase client instance
 * Configured with environment variables for database access
 * Uses service role key for backend operations (bypasses RLS)
 * @type {SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Admin user database record
 * @typedef {Object} AdminUser
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} password_hash - Bcrypt password hash
 * @property {string|null} created_by - Creator username
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

export interface Site {
  id: string;
  title: string;
  description: string;
  url: string;
  documentation_url: string | null;
  axe_score: number;
  lighthouse_score: number;
  axe_last_updated: string;
  lighthouse_last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreHistory {
  id: string;
  site_id: string;
  axe_score: number;
  lighthouse_score: number;
  recorded_at: string;
}

export interface Documentation {
  id: string;
  section_name: string;
  content: string;
  last_updated: string;
  updated_by: string | null;
  version: number;
}
