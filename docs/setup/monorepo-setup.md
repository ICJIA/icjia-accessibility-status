---
title: Monorepo Setup
sidebar_position: 1
description: Guide to setting up the monorepo structure
---

# Yarn Workspaces Monorepo Setup

## Overview

The ICJIA Accessibility Status Portal has been converted to a **Yarn Workspaces monorepo** structure. This simplifies dependency management and installation across all services (frontend, backend, and documentation).

## What Changed

### ✅ Single Installation Command

**Before:**
```bash
yarn install          # Install root dependencies
cd docs && yarn install  # Install docs dependencies separately
```

**After:**
```bash
yarn install          # Installs ALL dependencies (frontend, backend, docs)
```

### ✅ Single yarn.lock File

- **Before:** Two separate `yarn.lock` files
  - `/yarn.lock` (root)
  - `/docs/yarn.lock` (docs)
- **After:** One `yarn.lock` file at root
  - All dependencies managed in a single lock file
  - Consistent versions across all services

### ✅ Workspace Structure

```
icjia-accessibility-status/
├── package.json (root workspace)
├── yarn.lock (single lock file)
├── src/ (frontend code)
├── server/ (backend code)
├── docs/
│   ├── package.json (docs workspace)
│   ├── docs/ (markdown files)
│   └── src/ (Docusaurus components)
└── ...
```

## Workspaces

### Root Workspace: `icjia-accessibility-status`
- **Location:** `/`
- **Services:** Frontend (React/Vite) + Backend (Express)
- **Dependencies:** React, Express, Tailwind, Recharts, etc.

### Docs Workspace: `icjia-accessibility-docs`
- **Location:** `/docs`
- **Services:** Documentation site (Docusaurus)
- **Dependencies:** Docusaurus, React, TypeScript

## Updated Commands

All commands work from the root directory:

```bash
# Development
yarn dev              # Start all three services
yarn dev:frontend     # Frontend only
yarn dev:backend      # Backend only
yarn dev:docs         # Docs only
yarn dev:all          # Alias for yarn dev

# Building
yarn build            # Build all services
yarn build:frontend   # Frontend only
yarn build:docs       # Docs only

# Other commands
yarn seed             # Populate database
yarn lint             # Run ESLint
yarn typecheck        # TypeScript checking
yarn reset:users      # Reset admin users
yarn reset:app        # Complete database reset
```

## How Yarn Workspaces Work

### Dependency Hoisting

Yarn automatically hoists common dependencies to the root `node_modules/`:
- `react` (used by both frontend and docs)
- `typescript` (used by both)
- `@types/*` packages

Workspace-specific dependencies stay in their workspace:
- `/node_modules/` (root) - shared dependencies
- `/docs/node_modules/` (docs) - docs-specific dependencies

### Workspace Commands

Run commands in a specific workspace:

```bash
# Run a script in the docs workspace
yarn workspace icjia-accessibility-docs start

# Run a script in the root workspace
yarn workspace icjia-accessibility-status build:frontend
```

## Benefits

✅ **Simplified Installation**
- Single `yarn install` installs everything
- No need to navigate to subdirectories

✅ **Consistent Versions**
- Single `yarn.lock` file
- All services use the same dependency versions
- Eliminates version conflicts

✅ **Easier Maintenance**
- Centralized dependency management
- Easier to update packages across all services
- Better visibility into the entire dependency tree

✅ **Improved Developer Experience**
- Faster installation (dependencies downloaded once)
- Clearer project structure
- Standard monorepo pattern

## Migration Notes

### What Stayed the Same

- All existing scripts work exactly as before
- All services run on the same ports
- No changes to deployment process
- No changes to environment variables

### What Changed

- `docs/yarn.lock` was removed
- `package.json` files updated with workspace configuration
- Scripts now use `yarn workspace` commands internally

## Troubleshooting

### "Cannot find module" errors

If you get module not found errors after the migration:

```bash
# Clear node_modules and reinstall
rm -rf node_modules docs/node_modules
yarn install
```

### Workspace not recognized

Verify the workspace setup:

```bash
yarn workspaces info
```

Should output:
```json
{
  "icjia-accessibility-status": { "location": "" },
  "icjia-accessibility-docs": { "location": "docs" }
}
```

### Docs not starting

If `yarn dev:docs` fails:

```bash
# Try running directly
yarn workspace icjia-accessibility-docs start

# Or check for port conflicts
lsof -i :3002
```

## Future Improvements

- Consider adding shared utilities workspace
- Implement monorepo-wide linting
- Add shared TypeScript configuration
- Consider Yarn 3+ for better performance

## References

- [Yarn Workspaces Documentation](https://classic.yarnpkg.com/en/docs/workspaces/)
- [Monorepo Best Practices](https://monorepo.tools/)

