# API Authentication

Guide to authenticating with the ICJIA Accessibility Portal API.

## Authentication Methods

### 1. Session Cookies (Web Frontend)

Used by the web interface for authenticated requests:

```javascript
// Automatically sends session cookie
fetch('/api/sites', {
  credentials: 'include',
});
```

**When to use:** Web frontend, browser-based requests

### 2. API Keys (Programmatic Access)

Used for server-to-server communication:

```bash
curl -H "Authorization: Bearer sk_live_xxxxx" \
  https://example.com/api/sites/import
```

**When to use:** CI/CD pipelines, external services, automated imports

## Creating API Keys

### Step 1: Log In to Admin Panel

1. Navigate to `http://localhost:5173/admin`
2. Log in with your admin credentials

### Step 2: Navigate to API Keys

1. Click **"Admin"** in the navigation menu
2. Click **"API Keys"** in the sidebar
3. Or navigate directly to `/admin/api-keys`

### Step 3: Create New API Key

1. Click **"Create New API Key"** button
2. Fill in the form:
   - **Key Name**: Descriptive name (e.g., "CI/CD Pipeline")
   - **Scopes**: Select required permissions:
     - `sites:read` - Read site data
     - `sites:write` - Create/update sites
     - `sites:delete` - Delete sites
   - **Expiration Date**: Optional expiration date
   - **Notes**: Optional description

3. Click **"Create API Key"**

### Step 4: Copy the Key

**IMPORTANT**: The API key is displayed **only once**!

1. Copy the entire key (format: `sk_live_xxxxx...`)
2. Store it securely (e.g., in environment variables)
3. Never commit to version control

## Using API Keys

### In Environment Variables

```bash
# .env file
API_KEY=sk_live_xxxxx...
```

### In Node.js

```javascript
const apiKey = process.env.API_KEY;

const response = await fetch('https://example.com/api/sites/import', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sites: [
      {
        name: 'Example Site',
        url: 'https://example.com',
        axe_score: 85,
        lighthouse_score: 90,
      },
    ],
    payload_description: 'Automated import',
  }),
});
```

### In cURL

```bash
curl -X POST https://example.com/api/sites/import \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "sites": [...],
    "payload_description": "Automated import"
  }'
```

### In Python

```python
import requests

api_key = 'sk_live_xxxxx'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json',
}

response = requests.post(
    'https://example.com/api/sites/import',
    headers=headers,
    json={
        'sites': [...],
        'payload_description': 'Automated import',
    }
)
```

## API Key Scopes

### sites:read
- `GET /api/sites` - List all sites
- `GET /api/sites/:id` - Get site details
- `GET /api/score-history` - Get historical scores

### sites:write
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `POST /api/sites/import` - Import sites via API
- `POST /api/score-history` - Add new score record

### sites:delete
- `DELETE /api/sites/:id` - Delete site

## Managing API Keys

### View API Keys

```bash
GET /api/api-keys
Authorization: Bearer sk_live_xxxxx
```

### Revoke API Key

1. Go to `/admin/api-keys`
2. Find the key you want to revoke
3. Click the **"Revoke"** button
4. Confirm the action

Once revoked, the key cannot be used for authentication.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** to store keys
3. **Rotate keys regularly** for security
4. **Use specific scopes** - Only grant necessary permissions
5. **Set expiration dates** when possible
6. **Revoke unused keys** immediately
7. **Monitor usage** in the activity log
8. **Use HTTPS** in production (never HTTP)

## Troubleshooting

### "Invalid API Key" Error

- Check that the key is correct (copy-paste carefully)
- Verify the key hasn't been revoked
- Ensure the key has the required scopes
- Check that the key hasn't expired

### "Unauthorized" Error

- Verify the `Authorization` header is set correctly
- Check the format: `Authorization: Bearer sk_live_xxxxx`
- Ensure the API key is valid and not revoked

### "Forbidden" Error

- The API key doesn't have the required scope
- Create a new key with the necessary permissions
- Or use a key with broader permissions

## See Also

- [API Overview](./overview) - API reference
- [Sites Endpoint](./sites) - Sites management
- [Setup Guide](../setup-guide) - How to set up the system

