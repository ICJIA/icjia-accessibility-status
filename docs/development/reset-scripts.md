# Database Reset Scripts

Two powerful reset scripts are available for development environments to help you manage your database state.

:::warning
These scripts are **development only** and will not run in production environments. They require explicit confirmation to prevent accidental data loss.
:::

## Overview

| Script | Purpose | Data Deleted | Data Preserved |
|--------|---------|--------------|-----------------|
| `reset:users` | Reset admin access | Admin users, API keys, sessions | Sites, history, logs, documentation |
| `reset:app` | Complete wipe | **Everything** | Nothing |

## Reset Users Script

### Purpose

Reset all admin users, API keys, and sessions while preserving all site data, score history, and activity logs.

**Use this when:**
- You need to reset admin credentials
- You want to clear all API keys
- You're testing the admin creation flow
- You need to start fresh with new admin accounts

### Usage

```bash
yarn reset:users
```

### What Gets Deleted

- ✗ ALL admin users (including the primary admin)
- ✗ ALL API keys
- ✗ ALL active sessions

### What Gets Preserved

- ✓ All sites and their data
- ✓ All score history and trends
- ✓ All API payloads (audit trail)
- ✓ All activity logs
- ✓ All documentation

### Confirmation Process

The script requires **two separate confirmations** to prevent accidental execution:

**First Confirmation:**
```
Type: "I understand this will delete all admin users and API keys"
```

**Second Confirmation:**
```
Type: "DELETE ALL USERS NOW"
```

### After Running

After the script completes:
1. The application will require creating a new admin user
2. Visit `/admin` to create the first admin account
3. All existing admin accounts are permanently deleted
4. All API keys need to be regenerated
5. Site data remains intact and can be managed by the new admin

## Reset App Script

### Purpose

Completely wipe the database and reset it to an empty state. This is the "nuclear option" for starting completely from scratch.

**Use this when:**
- You want to start completely fresh
- You're testing the entire initial setup flow
- You need to clear all test data
- You're preparing for a complete demo reset

### Usage

```bash
yarn reset:app
```

### What Gets Deleted

- ✗ ALL admin users
- ✗ ALL API keys
- ✗ ALL sessions
- ✗ ALL sites and their data
- ✗ ALL score history and trends
- ✗ ALL API payloads (audit trail)
- ✗ ALL activity logs
- ✗ ALL documentation

### What Gets Preserved

- Nothing - the database is completely empty

### Confirmation Process

The script requires **two separate confirmations** to prevent accidental execution:

**First Confirmation:**
```
Type: "I understand this will delete everything permanently"
```

**Second Confirmation:**
```
Type: "DELETE EVERYTHING NOW"
```

### After Running

After the script completes:
1. The database is completely empty
2. You must re-run the migration files to set up the schema
3. A new admin user will be created with blank password
4. You'll need to set up everything from scratch

## Safety Features

Both scripts include multiple safety mechanisms:

### 1. Environment Check
- Scripts only run in development environments
- Will not execute if `NODE_ENV === 'production'`
- Exits with error code 1 if safety checks fail

### 2. Explicit Confirmation
- Requires typing exact phrases (not just "yes" or "y")
- Two separate confirmation prompts
- Case-sensitive phrase matching
- Clear error messages if incorrect phrase is entered

### 3. Prominent Warnings
- ASCII box warnings display what will be deleted
- Lists what will be preserved
- Emphasizes that action cannot be undone
- Provides clear next steps after completion

### 4. Audit Trail
- Logs deletion progress to console
- Shows which tables were deleted
- Displays success/error messages
- Provides guidance on next steps

## Common Scenarios

### Scenario 1: Locked Out of Admin Account

**Problem:** You can't remember the admin password and can't log in.

**Solution:**
```bash
yarn reset:users
```

Then create a new admin account at `/admin`.

### Scenario 2: Testing Admin Creation Flow

**Problem:** You want to test the initial setup and admin creation process.

**Solution:**
```bash
yarn reset:users
```

Then visit `/admin` to test the admin creation flow.

### Scenario 3: Clearing Old Test Data

**Problem:** You have lots of test sites and want to start fresh but keep the admin account.

**Solution:**
```bash
# This is not directly supported by the scripts
# Instead, manually delete sites from the admin panel
# Or use reset:users to clear everything and recreate
```

### Scenario 4: Complete Fresh Start

**Problem:** You want to completely reset everything and start from scratch.

**Solution:**
```bash
yarn reset:app
```

Then re-run the migration files to set up the schema again.

## Troubleshooting

### Script Won't Run

**Error:** "Cannot run in production environment"
- These scripts only work in development
- Check that `NODE_ENV` is not set to `production`

**Error:** "Missing environment variables"
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env`
- Check that your `.env` file exists

### Incorrect Confirmation Phrase

**Error:** "Incorrect phrase. Operation cancelled."
- The confirmation phrase is case-sensitive
- Make sure you typed it exactly as shown
- Try again with the exact phrase

### Database Connection Error

**Error:** "Failed to connect to database"
- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure you have internet connectivity

## Best Practices

1. **Always backup first** - If you have important data, export it before running these scripts
2. **Use in development only** - These scripts are designed for development environments
3. **Understand the consequences** - Read what will be deleted before confirming
4. **Document your setup** - Keep notes on how to recreate your setup if needed
5. **Test thoroughly** - Test the scripts in a development environment first

## See Also

- [Setup Guide](./setup-guide) - How to set up the database
- [Authentication](./authentication) - How the auth system works
- [Troubleshooting](./troubleshooting/common-issues) - Common issues and solutions

