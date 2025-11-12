# Database Migration Guide

## 🚀 Quick Start - REQUIRED MIGRATIONS

To set up a **brand new Supabase project**, you need to run **TWO files in order**:

### ✅ REQUIRED (Run in this order):

1. **STEP 1**: `step_1_create_initial_schema.sql` - Creates core database structure
2. **STEP 2**: `step_2_api_keys_and_rls_fixes.sql` - Adds API keys and fixes RLS policies

### ⚠️ OPTIONAL (Only for upgrades):

3. **STEP 3**: `step_3_refactor_to_api_payloads.sql` - Refactor uploaded_files to api_payloads (only if upgrading)
4. **STEP 4**: `step_4_fix_score_history_rls.sql` - Fix score_history RLS policy (only if upgrading)

---

## Migration Files

### STEP 1: `step_1_create_initial_schema.sql` (REQUIRED - Run First)

**Purpose**: Creates the complete initial database schema with sample data.

**What it does**:

- Creates all core database tables
- Sets up Row Level Security (RLS) policies
- Creates the default admin user with blank password
- Adds 6 sample websites with realistic data
- Generates 36 score history records
- Creates 18 sample uploaded JSON files
- Adds 3 documentation sections

**Idempotent**: Yes - safe to run multiple times

### STEP 2: `step_2_api_keys_and_rls_fixes.sql` (REQUIRED - Run Second)

**Purpose**: Adds API key authentication and fixes RLS policies.

**What it does**:

- Creates the `api_keys` table for API authentication
- Fixes `admin_users` RLS policy to allow password changes
- Fixes `sites` RLS policies to allow API imports
- Fixes `uploaded_files` RLS policy to allow API audit trail

**Idempotent**: Yes - safe to run multiple times

### STEP 3: `step_3_refactor_to_api_payloads.sql` (OPTIONAL - Only for upgrades)

**Purpose**: Refactor uploaded_files to api_payloads (API-only data ingestion).

**When to run**: Only if upgrading from an older version that used file uploads.

**What it does**:

- Renames `uploaded_files` table to `api_payloads`
- Adds description field (like Git commit messages)
- Adds api_key_id to track which API key was used
- Updates RLS policies for admin-only access
- Creates activity_log table for tracking significant events

**Idempotent**: Yes - safe to run multiple times

### STEP 4: `step_4_fix_score_history_rls.sql` (OPTIONAL - Only for upgrades)

**Purpose**: Fix score_history RLS policy to allow anon role.

**When to run**: Only if upgrading from an older version.

**What it does**:

- Fixes RLS policy for score_history table to allow anon role
- Enables backend to insert records using VITE_SUPABASE_ANON_KEY

**Idempotent**: Yes - safe to run multiple times

---

## Running Migrations

### Manual Migration via SQL Editor (Recommended)

**STEP 1: Run Initial Schema**

1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy contents of `step_1_create_initial_schema.sql`
4. Paste and click "Run"

**STEP 2: Run API Keys Migration**

1. Click "New query" again
2. Copy contents of `step_2_api_keys_and_rls_fixes.sql`
3. Paste and click "Run"

**STEP 3 & 4: (Optional - Only if upgrading)**

Repeat the same process for `step_3_refactor_to_api_payloads.sql` and `step_4_fix_score_history_rls.sql` if needed.

---

## Verifying Migrations

After running STEP 1 and STEP 2, you should see **7 tables**:

- `admin_users` (1 row)
- `sessions` (0 rows)
- `sites` (6 rows)
- `score_history` (36 rows)
- `app_documentation` (3 rows)
- `api_payloads` (18 rows)
- `api_keys` (0 rows)

---

## Migration History

| Step | Date       | Migration File                        | Purpose                                  | Required |
| ---- | ---------- | ------------------------------------- | ---------------------------------------- | -------- |
| 1    | 2024-11-09 | `step_1_create_initial_schema.sql`    | Initial database schema with sample data | ✅ Yes   |
| 2    | 2025-01-10 | `step_2_api_keys_and_rls_fixes.sql`   | API keys table and RLS policy fixes      | ✅ Yes   |
| 3    | 2025-01-10 | `step_3_refactor_to_api_payloads.sql` | Refactor to API-only data ingestion      | ⚠️ No    |
| 4    | 2024-11-10 | `step_4_fix_score_history_rls.sql`    | Fix score_history RLS policy             | ⚠️ No    |
