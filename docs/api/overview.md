# API Overview

The ICJIA Accessibility Portal provides a comprehensive REST API for programmatic access to site data and management.

## Base URL

```
http://localhost:3001/api          # Development
https://example.com/api            # Production
```

## Authentication

The API supports two authentication methods:

### 1. Session Cookies (Admin Interface)

Used by the web frontend for authenticated requests:

```javascript
fetch('/api/sites', {
  credentials: 'include',  // Automatically sends session cookie
});
```

### 2. API Keys (Programmatic Access)

Used for server-to-server communication:

```bash
curl -H "Authorization: Bearer sk_live_xxxxx" \
  https://example.com/api/sites/import
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/needs-setup` - Check if initial setup is needed
- `POST /api/auth/initial-setup` - Set initial admin password

### Sites

- `GET /api/sites` - List all sites
- `GET /api/sites/:id` - Get site details
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site
- `POST /api/sites/import` - Import sites via API

### Score History

- `GET /api/score-history` - Get historical scores
- `GET /api/score-history/:siteId` - Get scores for specific site
- `POST /api/score-history` - Add new score record

### API Keys

- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Create new API key
- `DELETE /api/api-keys/:id` - Revoke API key

### Users

- `GET /api/users` - List admin users
- `POST /api/users` - Create new admin user
- `PUT /api/users/:id` - Update admin user
- `DELETE /api/users/:id` - Delete admin user
- `POST /api/users/:id/reset-password` - Reset user password

### Activity Log

- `GET /api/activity-log` - Get activity log entries
- `GET /api/activity-log/:id` - Get specific log entry

## Response Format

All API responses are JSON:

### Success Response

```json
{
  "data": {
    "id": "123",
    "name": "Example Site",
    "url": "https://example.com"
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "status": 400
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

## Pagination

List endpoints support pagination:

```bash
GET /api/sites?page=1&limit=10
```

## Filtering

Some endpoints support filtering:

```bash
GET /api/sites?status=active
GET /api/score-history?siteId=123
```

## Sorting

Some endpoints support sorting:

```bash
GET /api/sites?sort=name&order=asc
```

## Documentation

- [Authentication](./authentication) - Detailed auth documentation
- [Sites Endpoint](./sites) - Sites management
- [API Keys Endpoint](./api-keys) - API key management

## Testing

Use the included `verify-api.js` script to test the API:

```bash
node verify-api.js
```

## Examples

### Create a Site

```bash
curl -X POST http://localhost:3001/api/sites \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Site",
    "url": "https://example.com",
    "axe_score": 85,
    "lighthouse_score": 90
  }'
```

### Get All Sites

```bash
curl http://localhost:3001/api/sites \
  -H "Authorization: Bearer sk_live_xxxxx"
```

### Import Multiple Sites

```bash
curl -X POST http://localhost:3001/api/sites/import \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "sites": [
      {
        "name": "Site 1",
        "url": "https://site1.com",
        "axe_score": 85,
        "lighthouse_score": 90
      },
      {
        "name": "Site 2",
        "url": "https://site2.com",
        "axe_score": 75,
        "lighthouse_score": 80
      }
    ],
    "payload_description": "Batch import from CI/CD pipeline"
  }'
```

## See Also

- [Setup Guide](../setup-guide) - How to set up the system
- [API Keys](./api-keys) - How to create and manage API keys
- [Troubleshooting](../troubleshooting/common-issues) - Common issues

