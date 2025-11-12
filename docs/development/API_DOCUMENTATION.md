# API Import Endpoint Documentation

## Overview

The ICJIA Accessibility Status Portal provides a secure API endpoint for programmatically uploading site accessibility data. This allows external applications, CI/CD pipelines, and automated scripts to update site scores without manual intervention.

## Authentication

The API uses **API Key authentication** with Bearer tokens. API keys are managed through the admin panel at `/admin/api-keys`.

### API Key Format

- **Live keys**: `sk_live_<64_hex_characters>` (72 characters total)
- **Test keys**: `sk_test_<64_hex_characters>` (72 characters total)

### Security Features

- ✅ API keys are hashed with bcrypt (never stored in plain text)
- ✅ Keys are only shown once upon creation
- ✅ Usage tracking (last used date, usage count)
- ✅ Scope-based permissions
- ✅ Revocation support (soft delete)
- ✅ Complete audit trail in `uploaded_files` table

## API Endpoint

### POST `/api/sites/import`

Import one or more sites with accessibility scores.

**Authentication**: Required (Bearer token)

**Required Scope**: `sites:write`

**Request Headers**:

```
Authorization: Bearer sk_live_your_api_key_here
Content-Type: application/json
```

**Request Body** (Single Site):

```json
{
  "title": "My Website",
  "description": "Description of the website",
  "url": "https://example.com",
  "documentation_url": "https://example.com/accessibility",
  "axe_score": 92,
  "lighthouse_score": 95,
  "axe_last_updated": "2025-01-10",
  "lighthouse_last_updated": "2025-01-10"
}
```

**Request Body** (Multiple Sites):

```json
{
  "sites": [
    {
      "title": "Site 1",
      "description": "First site",
      "url": "https://site1.example.com",
      "axe_score": 88,
      "lighthouse_score": 91,
      "axe_last_updated": "2025-01-10",
      "lighthouse_last_updated": "2025-01-10"
    },
    {
      "title": "Site 2",
      "description": "Second site",
      "url": "https://site2.example.com",
      "axe_score": 95,
      "lighthouse_score": 97,
      "axe_last_updated": "2025-01-10",
      "lighthouse_last_updated": "2025-01-10"
    }
  ]
}
```

**Required Fields**:

- `title` (string): Site name
- `description` (string): Site description
- `url` (string): Site URL (used as unique identifier)
- `axe_score` (number): Axe accessibility score (0-100)
- `lighthouse_score` (number): Lighthouse accessibility score (0-100)
- `axe_last_updated` (string): Date of last Axe scan (YYYY-MM-DD)
- `lighthouse_last_updated` (string): Date of last Lighthouse scan (YYYY-MM-DD)

**Optional Fields**:

- `documentation_url` (string): URL to accessibility documentation

**Response** (Success - 200 OK):

```json
{
  "success": true,
  "message": "Processed 3 site(s): 1 created, 1 updated, 1 skipped (duplicate)",
  "results": {
    "created": 1,
    "updated": 1,
    "skipped": 1,
    "errors": []
  },
  "sites": [
    {
      "id": "uuid-1",
      "title": "Site 1",
      "url": "https://site1.example.com",
      "action": "created"
    },
    {
      "id": "uuid-2",
      "title": "Site 2",
      "url": "https://site2.example.com",
      "action": "updated"
    },
    {
      "id": "uuid-3",
      "title": "Site 3",
      "url": "https://site3.example.com",
      "action": "skipped",
      "reason": "Scores unchanged since last upload"
    }
  ]
}
```

**Response** (Error - 401 Unauthorized):

```json
{
  "error": "Authentication required"
}
```

**Response** (Error - 403 Forbidden):

```json
{
  "error": "Insufficient permissions. Required scope: sites:write"
}
```

**Response** (Error - 500 Internal Server Error):

```json
{
  "error": "Internal server error"
}
```

## Duplicate Detection

The API automatically detects and skips duplicate uploads to prevent redundant data:

**Detection Criteria**: A site is considered a duplicate if:

- Same `url` exists in the database
- Same `axe_score`
- Same `lighthouse_score`
- Same `axe_last_updated`
- Same `lighthouse_last_updated`

**Behavior**:

- Returns 200 OK (not an error)
- Includes `skipped` count in results
- Does NOT create entries in `score_history` or `uploaded_files` tables
- Logs message: `"Skipping duplicate upload for site: [title] - scores unchanged"`

## Usage Examples

### cURL

```bash
curl -X POST https://your-domain.com/api/sites/import \
  -H "Authorization: Bearer sk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Website",
    "description": "Description",
    "url": "https://example.com",
    "axe_score": 92,
    "lighthouse_score": 95,
    "axe_last_updated": "2025-01-10",
    "lighthouse_last_updated": "2025-01-10"
  }'
```

### Node.js (fetch)

```javascript
const response = await fetch("https://your-domain.com/api/sites/import", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "My Website",
    description: "Description",
    url: "https://example.com",
    axe_score: 92,
    lighthouse_score: 95,
    axe_last_updated: "2025-01-10",
    lighthouse_last_updated: "2025-01-10",
  }),
});

const data = await response.json();
console.log(data);
```

### Python (requests)

```python
import requests
import os

response = requests.post(
    'https://your-domain.com/api/sites/import',
    headers={
        'Authorization': f'Bearer {os.environ["API_KEY"]}',
        'Content-Type': 'application/json'
    },
    json={
        'title': 'My Website',
        'description': 'Description',
        'url': 'https://example.com',
        'axe_score': 92,
        'lighthouse_score': 95,
        'axe_last_updated': '2025-01-10',
        'lighthouse_last_updated': '2025-01-10'
    }
)

print(response.json())
```

## API Key Management

### Creating an API Key

1. Log in to the admin panel
2. Navigate to **Admin** → **API Keys** (`/admin/api-keys`)
3. Click **Create API Key**
4. Fill in the form:
   - **Key Name**: Friendly identifier (e.g., "Production Server")
   - **Environment**: Live or Test
   - **Scopes**: Select `sites:write`
   - **Notes**: Optional description
5. Click **Create Key**
6. **IMPORTANT**: Copy the full API key immediately - it will only be shown once!

### Revoking an API Key

1. Navigate to `/admin/api-keys`
2. Find the key in the table
3. Click **Revoke**
4. Confirm the action

Revoked keys:

- Are immediately disabled
- Cannot be re-enabled
- Remain visible in the list for audit purposes
- Are marked as "Revoked" in the status column

### Monitoring Usage

The API Keys page displays:

- **Last Used**: Timestamp of most recent API call
- **Usage Count**: Total number of API calls made with this key
- **Status**: Active or Revoked

## Security Best Practices

1. **Never commit API keys to version control**

   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use separate keys for different environments**

   - Create test keys (`sk_test_...`) for development
   - Create live keys (`sk_live_...`) for production

3. **Rotate keys regularly**

   - Create new keys periodically
   - Revoke old keys after migration

4. **Limit key scope**

   - Only grant necessary permissions
   - Currently only `sites:write` is available

5. **Monitor key usage**

   - Check the API Keys page regularly
   - Investigate unexpected usage patterns
   - Revoke compromised keys immediately

6. **Store keys securely**
   - Use secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never log API keys
   - Never send keys via email or chat

## Testing

A test script is provided at `verify-api.js`:

```bash
# Using command line argument
node verify-api.js sk_live_your_api_key_here

# Using environment variable
API_KEY=sk_live_your_api_key_here node verify-api.js
```

The test script demonstrates:

- Single site upload
- Multiple sites upload (batch)
- Duplicate detection
- Error handling
- Response parsing

## Audit Trail

All API imports are logged in the `uploaded_files` table:

- **file_name**: `api-import-<timestamp>.json`
- **file_content**: Full JSON payload
- **notes**: `API import via key: <key_name>`
- **uploaded_by**: `null` (API imports don't have a user_id)

Score changes are tracked in the `score_history` table with timestamps.

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting in production environments to prevent abuse.

## Support

For issues or questions:

1. Check the troubleshooting section in the main README
2. Review server logs for error messages
3. Verify API key is active and has correct scopes
4. Test with the provided `verify-api.js` script
