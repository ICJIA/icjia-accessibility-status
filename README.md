# ICJIA Accessibility Status

> **Last Updated**: November 12, 2025

A comprehensive web accessibility tracking system for the Illinois Criminal Justice Information Authority, designed to monitor progress toward April 2026 compliance goals across all ICJIA web properties.

> 📚 **[Documentation](#-documentation)** | **[GitHub Repository](https://github.com/ICJIA/icjia-accessibility-status)**

## ⚡ Quick Start

### Local Development (5 Minutes)

```bash
# 1. Clone and install
git clone https://github.com/ICJIA/icjia-accessibility-status.git
cd icjia-accessibility-status
yarn install

# 2. Configure environment
cp .env.sample .env
# Edit .env and add your Supabase credentials:
#   VITE_SUPABASE_URL=your-project-url
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Run database migrations
# Go to Supabase Dashboard → SQL Editor → New query
# Copy and run: supabase/migrations/01_create_initial_schema.sql
# Then run: supabase/migrations/02_add_api_keys_and_payloads.sql

# 4. Start development server
yarn dev

# 5. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001/api
# Admin: http://localhost:5173/admin (username: admin, password: blank - set on first login)
```

### Available Commands

```bash
# Development
yarn dev              # Start frontend and backend concurrently (development mode)
yarn dev:frontend     # Frontend only (Vite dev server on port 5173)
yarn dev:backend      # Backend only (Express on port 3001)

# Production
yarn build            # Build frontend for production
yarn production:simple # Test production build without PM2 (frontend + backend)
yarn production:pm2   # Full production deployment (build + PM2 start)
yarn start            # Start services with PM2 (production mode)

# Utilities
yarn seed             # Populate database with sample data
yarn lint             # Run ESLint
yarn typecheck        # Run TypeScript type checking
```

## 🚀 Production Deployment

### Laravel Forge

For detailed Laravel Forge deployment instructions, see **[docs/deployment/LARAVEL_FORGE_DEPLOYMENT_SUMMARY.md](docs/deployment/LARAVEL_FORGE_DEPLOYMENT_SUMMARY.md)**.

**Quick steps:**

1. Create a new site in Laravel Forge
2. Set Node.js version to 20+
3. Configure environment variables from `.env.sample`
4. Run database migrations
5. Deploy using Git

### Coolify

For detailed Coolify deployment instructions, see **[docs/deployment/COOLIFY_QUICK_START.md](docs/deployment/COOLIFY_QUICK_START.md)**.

**Quick steps:**

1. Create a new application in Coolify
2. Connect your Git repository
3. Set Node.js version to 20+
4. Configure environment variables
5. Run database migrations
6. Deploy

## 📚 Documentation

All documentation is available as Markdown files in the `/docs` directory, organized by topic for easy navigation.

### 🚀 Getting Started

- **[Quick Start Guide](docs/getting-started/quick-start.md)** - Get up and running in 5 minutes
- **[Setup Guide](docs/getting-started/setup-guide.md)** - Complete setup walkthrough
- **[Development Setup](docs/getting-started/development-setup.md)** - Local development environment
- **[Introduction](docs/getting-started/intro.md)** - Project overview

### 🏗️ Architecture & Core Concepts

- **[System Architecture](docs/architecture/architecture.md)** - System architecture overview
- **[Database Schema](docs/architecture/database-schema.md)** - Database structure and relationships
- **[Authentication System](docs/architecture/authentication.md)** - Authentication system details

### 💻 Development

- **[API Overview](docs/api/overview.md)** - Complete API reference
- **[API Authentication](docs/api/authentication.md)** - API authentication guide
- **[Sites Endpoints](docs/api/sites.md)** - Sites API reference
- **[API Keys Management](docs/api/api-keys.md)** - API keys endpoints
- **[Testing Guide](docs/development/testing.md)** - Testing procedures
- **[Reset Scripts](docs/development/reset-scripts.md)** - Database reset utilities
- **[API Rate Limiting](docs/development/API_RATE_LIMITING_AND_ROTATION.md)** - Rate limiting and key rotation
- **[Setup Documentation](docs/development/SETUP.md)** - Development setup details
- **[Quick Start Summary](docs/development/QUICK_START_SETUP_SUMMARY.md)** - Quick reference

### ⚙️ Configuration

- **[Environment Variables](docs/configuration/env-configuration.md)** - Environment configuration guide
- **[Environment Audit](docs/configuration/env-sample-audit.md)** - Environment setup verification

### 🚢 Deployment

- **[Deployment Overview](docs/deployment/overview.md)** - Deployment options and strategies
- **[Laravel Forge Setup](docs/deployment/LARAVEL_FORGE_DEPLOYMENT_SUMMARY.md)** - Forge deployment guide
- **[Coolify Setup](docs/deployment/COOLIFY_QUICK_START.md)** - Coolify deployment guide
- **[PM2 Configuration](docs/deployment/pm2-ecosystem-config.md)** - PM2 setup and configuration
- **[Nginx Configuration](docs/deployment/nginx.md)** - Nginx reverse proxy setup
- **[Production Deployment](docs/deployment/production.md)** - Production deployment checklist
- **[Health Check Monitoring](docs/deployment/health-check-monitoring.md)** - Monitoring setup
- **[Database Backups](docs/deployment/database-backups.md)** - Backup procedures

### 🔒 Security & Audits

- **[Security Audit Report](docs/security/SECURITY_AUDIT.md)** - Complete security audit
- **[Security Findings](docs/security/security-findings.md)** - Security issues and fixes
- **[RLS Security Audit](docs/security/RLS_SECURITY_AUDIT.md)** - Row-level security audit
- **[Audit Overview](docs/security/audit-overview.md)** - Security audit overview
- **[Critical Issues Fixed](docs/security/critical-issues-fixed.md)** - Critical security fixes

### 🔧 Troubleshooting

- **[Common Issues](docs/troubleshooting/common-issues.md)** - Common problems and solutions
- **[Authentication Errors](docs/troubleshooting/authentication-errors.md)** - Auth troubleshooting
- **[Database Errors](docs/troubleshooting/database-errors.md)** - Database troubleshooting

### 📋 Project Information

- **[Feature Summary](docs/project/FEATURE_SUMMARY.md)** - Current features overview
- **[Project Roadmap](docs/project/FUTURE_ROADMAP.md)** - Future features and roadmap
- **[Monorepo Setup](docs/setup/monorepo-setup.md)** - Monorepo structure and setup

## Prerequisites

- **Node.js 20+** (specified in `.nvmrc`)
- **Yarn 1.22.22** (specified in `package.json`)
- **Supabase account** (free tier works fine)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Express, Node.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Cookie-based sessions with bcrypt
- **Process Management**: PM2 (production)
- **Documentation**: Markdown files in `/docs` directory

## License

See LICENSE file for details.

---

© 2025 Illinois Criminal Justice Information Authority (ICJIA). All rights reserved.
