# Complete Setup Guide

Complete step-by-step guide to set up the ICJIA Accessibility Status Portal from scratch.

## Prerequisites

- Node.js 20+ (use `nvm use` to switch versions automatically)
- Yarn 1.22.22 (specified in `package.json`)
- Git
- A Supabase account (free tier works fine)

## Step 1: Clone the Repository

```bash
git clone https://github.com/ICJIA/icjia-accessibility-status.git
cd icjia-accessibility-status
```

## Step 2: Install Dependencies

```bash
yarn install
```

## Step 3: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Project Name**: `icjia-accessibility-portal` (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your users
4. Click **Create new project** (takes 1-2 minutes)

## Step 4: Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: Long JWT token starting with `eyJ...`

## Step 5: Configure Environment Variables

```bash
cp .env.sample .env
```

Edit `.env` and update with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3001/api
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Step 6: Run Database Migrations

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/migrations/01_create_initial_schema.sql`
5. Click **Run**
6. Repeat for migrations 02, 03, 04, and 05 **in order**

See `supabase/migrations/README.md` for detailed migration information.

## Step 7: Start Development Server

```bash
yarn dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Step 8: Initial Setup

1. Browser opens to http://localhost:5173
2. You'll be redirected to **Initial Setup** page
3. Set a secure password for admin account (username: `admin`)
4. Password requirements:
   - At least 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
5. Confirm password and click **Set Password**
6. Log in with username `admin` and your new password

## Step 9: Add Your First Site

1. Click **Add Site** in the admin dashboard
2. Enter website URL and name
3. Click **Save**
4. Click **Run Scan** to test the setup

## Troubleshooting

### "Admin user NOT found" error
- Re-run migration 01 in Supabase SQL Editor

### "Failed to create session" error
- Verify RLS policies are correct (see migration 01)

### Backend won't start
- Check `.env` file has correct Supabase credentials
- Verify port 3001 is not in use

### Frontend won't start
- Verify port 5173 is not in use
- Run `yarn install` again

## Next Steps

- Read [Development Setup](./development-setup.md) for development workflow
- Check [API Documentation](../api/overview.md) for API reference
- See [Deployment Guide](../deployment/overview.md) for production setup

