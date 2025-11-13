# Complete Setup Guide

A comprehensive guide for setting up the ICJIA Accessibility Portal from scratch.

## Prerequisites

- **Node.js 20+** - Run `nvm use` to automatically switch to the correct version
- **Yarn 1.22.22** - Specified in `package.json`
- **A Supabase account** - Free tier works fine for development
- **Ubuntu 20.04+ server** - For production deployment (optional)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/ICJIA/icjia-accessibility-status.git
cd icjia-accessibility-status

# Install dependencies
yarn install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"** in your organization
3. Fill in the project details:
   - **Name**: `icjia-accessibility-portal`
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose closest to your users (East US for ICJIA)
   - **Pricing Plan**: Select "Free" for development
4. Click **"Create new project"**
5. Wait 1-2 minutes for provisioning to complete

## Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Navigate to **API** section
3. Copy these two values:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **Anon/Public Key**: A long JWT token starting with `eyJ...`

## Step 4: Configure Environment

```bash
# Copy the sample environment file
cp .env.sample .env
```

Edit `.env` and update with your Supabase credentials:

```bash
# Supabase Configuration (UPDATE THESE!)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration (keep as-is for local development)
VITE_API_URL=http://localhost:3001/api

# Server Configuration (keep as-is for local development)
PORT=3001

# Frontend Configuration (keep as-is for local development)
FRONTEND_URL=http://localhost:5173
```

## Step 5: Run Database Migrations

You need to run **THREE SQL files** in order:

### Migration 1: Initial Schema

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New query"** button
3. Open `supabase/migrations/step_1_create_initial_schema.sql`
4. Copy **ALL** contents and paste into SQL Editor
5. Click **"Run"**

Expected output:

```
NOTICE: Created admin user with bcrypt-hashed password
NOTICE: Created 6 sample sites
NOTICE: Created score history records
NOTICE: Database setup complete!
```

### Migration 2: API Keys and RLS Fixes

1. Click **"New query"** button
2. Open `supabase/migrations/step_2_api_keys_and_rls_fixes.sql`
3. Copy **ALL** contents and paste into SQL Editor
4. Click **"Run"**

Expected output:

```
NOTICE: ✅ api_keys table created successfully
NOTICE: ✅ RLS enabled on api_keys table
NOTICE: 🎉 All migrations applied successfully!
```

### Migration 3: API Payloads Refactoring (Optional)

If upgrading from an older version:

1. Click **"New query"** button
2. Open `supabase/migrations/step_3_refactor_to_api_payloads.sql`
3. Copy **ALL** contents and paste into SQL Editor
4. Click **"Run"**

## Step 6: Verify Database Setup

1. In Supabase dashboard, click **Table Editor**
2. You should see these tables:
   - `admin_users` (1 row)
   - `sessions` (0 rows)
   - `sites` (6 rows)
   - `score_history` (36 rows)
   - `app_documentation` (3 rows)
   - `api_payloads` (18 rows)
   - `api_keys` (0 rows)
   - `activity_log` (0 rows)

## Step 7: Start Development Servers

```bash
# Start all three services
yarn dev
```

This starts:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Step 8: Initial Admin Setup

1. Open your browser to `http://localhost:5173`
2. You'll be redirected to the Initial Setup page
3. Set a secure password that meets all requirements:
   - At least 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
4. Confirm your password
5. Click **"Set Password"**
6. You'll be redirected to login page
7. Log in with:
   - **Username**: `admin`
   - **Password**: Your new password

## Step 9: Create Your First API Key

1. After logging in, click **"Admin"** in the navigation
2. Click **"API Keys"** in the sidebar
3. Click **"Create New API Key"**
4. Fill in the form:
   - **Key Name**: `Development`
   - **Scopes**: Check `sites:write`
   - **Expiration**: Leave blank (no expiration)
5. Click **"Create API Key"**
6. **Copy the key immediately** (displayed only once)
7. Add to `.env` file:
   ```bash
   API_KEY=sk_live_xxxxx...
   ```

## Step 10: Test the API

```bash
# Test the API import endpoint
node verify-api.js
```

Expected output:

```
🚀 Starting API Upload Tests...
✅ Test 1: Single Site Upload - PASSED
✅ Test 2: Batch Upload (3 Sites) - PASSED
✅ Test 3: Duplicate Detection - PASSED
```

## Available Commands

```bash
# Development
yarn dev              # Start all three services
yarn dev:frontend     # Start frontend only
yarn dev:backend      # Start backend only
yarn dev:docs         # Start docs only

# Building
yarn build            # Build all services
yarn build:frontend   # Build frontend only
yarn build:docs       # Build docs only

# Utilities
yarn lint             # Run ESLint
yarn typecheck        # Run TypeScript type checking
yarn seed             # Populate database with sample data

# Database Reset (Development Only)
yarn reset:users      # Reset admin users and API keys
yarn reset:app        # Complete database wipe
```

## Next Steps

1. **Explore the dashboard** - View sample sites at http://localhost:5173
2. **Create more API keys** - For different environments or services
3. **Import real data** - Use the API to import your actual site data
4. **Customize** - Modify the code to fit your needs
5. **Deploy** - See [Deployment Guide](./deployment/overview) for production setup

## Troubleshooting

See [Troubleshooting Guide](./troubleshooting/common-issues) for common issues and solutions.
