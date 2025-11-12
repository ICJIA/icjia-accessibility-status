# Testing Guide

Guide to testing the ICJIA Accessibility Portal.

## Testing Strategy

The project uses multiple testing approaches:

- ✅ **Unit Tests** - Test individual functions
- ✅ **Integration Tests** - Test API endpoints
- ✅ **Manual Testing** - Test user workflows
- ✅ **API Verification** - Test API functionality

## Running Tests

### Verify API

```bash
# Run API verification script
node verify-api.js

# This tests:
# - Database connection
# - Admin user creation
# - Login functionality
# - Site CRUD operations
# - API key management
# - Session management
```

### Type Checking

```bash
# Check TypeScript types
yarn typecheck

# Fix type errors
yarn typecheck --fix
```

### Linting

```bash
# Run ESLint
yarn lint

# Fix linting issues
yarn lint --fix
```

### Build

```bash
# Build all services
yarn build

# Build frontend only
yarn build:frontend

# Build backend only
yarn build:backend

# Build docs only
yarn build:docs
```

## Manual Testing

### Test Login Flow

1. Navigate to `http://localhost:5173`
2. Click "Login"
3. Enter credentials:
   - Username: `admin`
   - Password: (set during initial setup)
4. Click "Login"
5. Verify redirected to dashboard

### Test Site Management

1. Log in to admin panel
2. Click "Sites" in sidebar
3. Click "Add Site"
4. Fill in form:
   - Name: "Test Site"
   - URL: "https://test.example.com"
   - Axe Score: 85
   - Lighthouse Score: 90
5. Click "Create"
6. Verify site appears in list

### Test API Key Creation

1. Log in to admin panel
2. Click "API Keys" in sidebar
3. Click "Create New API Key"
4. Fill in form:
   - Name: "Test Key"
   - Scopes: Select `sites:read` and `sites:write`
5. Click "Create"
6. Copy the API key

### Test API Import

```bash
# Create test file: test-import.json
{
  "sites": [
    {
      "name": "Test Site 1",
      "url": "https://test1.example.com",
      "axe_score": 85,
      "lighthouse_score": 90
    },
    {
      "name": "Test Site 2",
      "url": "https://test2.example.com",
      "axe_score": 75,
      "lighthouse_score": 80
    }
  ],
  "payload_description": "Test import"
}

# Run import
curl -X POST http://localhost:3001/api/sites/import \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d @test-import.json
```

### Test Reset Scripts

#### Reset Users Only

```bash
# Reset admin users (preserves site data)
yarn reset:users

# Follow prompts to confirm
# Verify admin users deleted
# Verify sites still exist
```

#### Reset Everything

```bash
# Reset entire database
yarn reset:app

# Follow prompts to confirm
# Verify all data deleted
# Verify tables still exist
```

## Testing Checklist

### Frontend

- [ ] Login page loads
- [ ] Login with correct credentials works
- [ ] Login with incorrect credentials fails
- [ ] Dashboard displays after login
- [ ] Sites list displays
- [ ] Can create new site
- [ ] Can update site
- [ ] Can delete site
- [ ] Logout works
- [ ] Session persists on page refresh
- [ ] Dark mode works
- [ ] Responsive design works on mobile

### Backend

- [ ] Server starts without errors
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Authorization works
- [ ] Database queries work
- [ ] Error handling works
- [ ] Logging works
- [ ] CORS headers correct

### Database

- [ ] All tables exist
- [ ] All columns exist
- [ ] RLS policies work
- [ ] Indexes exist
- [ ] Constraints work
- [ ] Backups work

### Documentation

- [ ] All pages load
- [ ] Navigation works
- [ ] Search works
- [ ] Code examples work
- [ ] Links are correct
- [ ] Dark mode works

### Deployment

- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] Docs build successfully
- [ ] PM2 starts all services
- [ ] Nginx proxies correctly
- [ ] SSL certificate works
- [ ] All endpoints accessible

## Continuous Integration

### GitHub Actions

The project uses GitHub Actions for CI/CD:

- ✅ Run tests on push
- ✅ Run type checking
- ✅ Run linting
- ✅ Build all services
- ✅ Deploy on merge to main

### Local Pre-Commit

Before committing:

```bash
# Run all checks
yarn typecheck
yarn lint
yarn build

# If all pass, commit
git add .
git commit -m "Your message"
```

## Performance Testing

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test frontend
ab -n 100 -c 10 http://localhost:5173/

# Test API
ab -n 100 -c 10 http://localhost:3001/api/sites
```

### Memory Profiling

```bash
# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect server/index.ts
```

## Security Testing

### OWASP Top 10

- [ ] SQL Injection - Parameterized queries used
- [ ] Broken Authentication - Session-based auth
- [ ] Sensitive Data Exposure - HTTPS/TLS
- [ ] XML External Entities - Not applicable
- [ ] Broken Access Control - RLS policies
- [ ] Security Misconfiguration - Security headers
- [ ] Cross-Site Scripting (XSS) - HttpOnly cookies
- [ ] Insecure Deserialization - Not applicable
- [ ] Using Components with Known Vulnerabilities - Dependency scanning
- [ ] Insufficient Logging & Monitoring - Activity logging

### Dependency Scanning

```bash
# Check for vulnerabilities
yarn audit

# Fix vulnerabilities
yarn audit --fix
```

## Troubleshooting Tests

### Tests Fail

1. Check error message
2. Review test code
3. Check database state
4. Check environment variables
5. Restart services

### Tests Hang

1. Check for infinite loops
2. Check database connection
3. Check timeout settings
4. Kill process and restart

### Tests Timeout

1. Increase timeout value
2. Check database performance
3. Check network connectivity
4. Check system resources

## See Also

- [Development Setup](./development-setup) - Development environment
- [API Documentation](./api/overview) - API reference
- [Troubleshooting](./troubleshooting/common-issues) - Common issues

