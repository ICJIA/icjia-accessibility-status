# API Keys

Manage API keys for programmatic access to the ICJIA Accessibility Portal.

## Overview

API keys allow external services and CI/CD pipelines to authenticate with the API without using admin credentials.

**Key Features:**
- ✅ Granular permission scopes
- ✅ Optional expiration dates
- ✅ Usage tracking and audit trail
- ✅ Easy revocation
- ✅ Multiple keys per admin

## Creating API Keys

### Via Admin Panel

1. Log in to the admin panel (`/admin`)
2. Click **"API Keys"** in the sidebar
3. Click **"Create New API Key"**
4. Fill in the form:
   - **Key Name**: Descriptive name (e.g., "CI/CD Pipeline")
   - **Scopes**: Select required permissions
   - **Expiration Date**: Optional
   - **Notes**: Optional description
5. Click **"Create API Key"**
6. **Copy the key immediately** (displayed only once)

### Via API

```
POST /api/api-keys
```

**Authentication:** Session cookie (admin only)

**Request Body:**

```json
{
  "name": "CI/CD Pipeline",
  "scopes": ["sites:read", "sites:write"],
  "expires_at": "2025-12-31T23:59:59Z",
  "notes": "Used for automated site imports"
}
```

**Response:**

```json
{
  "data": {
    "id": "key_123",
    "name": "CI/CD Pipeline",
    "key": "sk_live_xxxxx...",
    "scopes": ["sites:read", "sites:write"],
    "created_at": "2024-01-21T10:00:00Z",
    "expires_at": "2025-12-31T23:59:59Z",
    "last_used_at": null
  }
}
```

## API Key Scopes

### sites:read
Read-only access to site data:
- `GET /api/sites` - List all sites
- `GET /api/sites/:id` - Get site details
- `GET /api/score-history` - Get historical scores

### sites:write
Create and update site data:
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `POST /api/sites/import` - Import sites via API
- `POST /api/score-history` - Add new score record

### sites:delete
Delete site data:
- `DELETE /api/sites/:id` - Delete site

## Using API Keys

### In Environment Variables

```bash
# .env file
API_KEY=sk_live_xxxxx...
```

### In Node.js

```javascript
const apiKey = process.env.API_KEY;

const response = await fetch('https://example.com/api/sites', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
});
```

### In cURL

```bash
curl -H "Authorization: Bearer sk_live_xxxxx" \
  https://example.com/api/sites
```

### In Python

```python
import requests

headers = {
    'Authorization': f'Bearer {api_key}',
}

response = requests.get(
    'https://example.com/api/sites',
    headers=headers
)
```

## Listing API Keys

### Via Admin Panel

1. Log in to the admin panel (`/admin`)
2. Click **"API Keys"** in the sidebar
3. View all created keys with their:
   - Name
   - Scopes
   - Creation date
   - Expiration date
   - Last used date

### Via API

```
GET /api/api-keys
```

**Authentication:** Session cookie (admin only)

**Response:**

```json
{
  "data": [
    {
      "id": "key_123",
      "name": "CI/CD Pipeline",
      "scopes": ["sites:read", "sites:write"],
      "created_at": "2024-01-21T10:00:00Z",
      "expires_at": "2025-12-31T23:59:59Z",
      "last_used_at": "2024-01-21T14:30:00Z"
    }
  ]
}
```

## Revoking API Keys

### Via Admin Panel

1. Go to `/admin/api-keys`
2. Find the key you want to revoke
3. Click the **"Revoke"** button
4. Confirm the action

Once revoked, the key cannot be used for authentication.

### Via API

```
DELETE /api/api-keys/:id
```

**Authentication:** Session cookie (admin only)

**Response:**

```json
{
  "message": "API key revoked successfully"
}
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** to store keys
3. **Rotate keys regularly** for security
4. **Use specific scopes** - Only grant necessary permissions
5. **Set expiration dates** when possible
6. **Revoke unused keys** immediately
7. **Monitor usage** in the activity log
8. **Use HTTPS** in production (never HTTP)
9. **Store securely** - Use secrets management tools
10. **Audit regularly** - Check which keys are in use

## Troubleshooting

### "Invalid API Key" Error

- Check that the key is correct
- Verify the key hasn't been revoked
- Ensure the key has the required scopes
- Check that the key hasn't expired

### "Unauthorized" Error

- Verify the `Authorization` header format: `Bearer sk_live_xxxxx`
- Check that the API key is valid
- Ensure the key has the required scopes

### "Forbidden" Error

- The API key doesn't have the required scope
- Create a new key with the necessary permissions
- Or use a key with broader permissions

## See Also

- [API Overview](./overview) - API reference
- [API Authentication](./authentication) - Authentication methods
- [Sites Endpoint](./sites) - Sites management

