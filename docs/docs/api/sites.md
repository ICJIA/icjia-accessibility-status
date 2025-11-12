# Sites API

Endpoints for managing websites and their accessibility scores.

## List Sites

Get all monitored sites.

```
GET /api/sites
```

### Authentication

- Session cookie (web frontend)
- API key with `sites:read` scope

### Response

```json
{
  "data": [
    {
      "id": "123",
      "name": "ICJIA Main Website",
      "url": "https://www.icjia.state.il.us",
      "axe_score": 85,
      "lighthouse_score": 90,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z"
    }
  ]
}
```

## Get Site Details

Get information about a specific site.

```
GET /api/sites/:id
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Site ID |

### Response

```json
{
  "data": {
    "id": "123",
    "name": "ICJIA Main Website",
    "url": "https://www.icjia.state.il.us",
    "axe_score": 85,
    "lighthouse_score": 90,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

## Create Site

Create a new site to monitor.

```
POST /api/sites
```

### Authentication

- Session cookie (admin only)
- API key with `sites:write` scope

### Request Body

```json
{
  "name": "New Site",
  "url": "https://newsite.com",
  "axe_score": 80,
  "lighthouse_score": 85
}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Site name |
| `url` | string | Yes | Site URL |
| `axe_score` | number | Yes | Axe accessibility score (0-100) |
| `lighthouse_score` | number | Yes | Lighthouse accessibility score (0-100) |

### Response

```json
{
  "data": {
    "id": "456",
    "name": "New Site",
    "url": "https://newsite.com",
    "axe_score": 80,
    "lighthouse_score": 85,
    "created_at": "2024-01-21T10:00:00Z",
    "updated_at": "2024-01-21T10:00:00Z"
  }
}
```

## Update Site

Update an existing site.

```
PUT /api/sites/:id
```

### Authentication

- Session cookie (admin only)
- API key with `sites:write` scope

### Request Body

```json
{
  "name": "Updated Site Name",
  "axe_score": 88,
  "lighthouse_score": 92
}
```

### Response

```json
{
  "data": {
    "id": "456",
    "name": "Updated Site Name",
    "url": "https://newsite.com",
    "axe_score": 88,
    "lighthouse_score": 92,
    "created_at": "2024-01-21T10:00:00Z",
    "updated_at": "2024-01-21T11:30:00Z"
  }
}
```

## Delete Site

Delete a site from monitoring.

```
DELETE /api/sites/:id
```

### Authentication

- Session cookie (admin only)
- API key with `sites:delete` scope

### Response

```json
{
  "message": "Site deleted successfully"
}
```

## Import Sites

Import multiple sites via API.

```
POST /api/sites/import
```

### Authentication

- API key with `sites:write` scope

### Request Body

```json
{
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
}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sites` | array | Yes | Array of site objects |
| `payload_description` | string | Yes | Description of the import (Git-style commit message) |

### Response

```json
{
  "data": {
    "imported": 2,
    "duplicates": 0,
    "errors": 0,
    "sites": [
      {
        "id": "789",
        "name": "Site 1",
        "url": "https://site1.com",
        "axe_score": 85,
        "lighthouse_score": 90
      },
      {
        "id": "790",
        "name": "Site 2",
        "url": "https://site2.com",
        "axe_score": 75,
        "lighthouse_score": 80
      }
    ]
  }
}
```

## Examples

### Create a Site with cURL

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

### Import Sites with Node.js

```javascript
const apiKey = process.env.API_KEY;

const response = await fetch('http://localhost:3001/api/sites/import', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sites: [
      {
        name: 'Site 1',
        url: 'https://site1.com',
        axe_score: 85,
        lighthouse_score: 90,
      },
    ],
    payload_description: 'Automated import from CI/CD',
  }),
});

const result = await response.json();
console.log(`Imported ${result.data.imported} sites`);
```

## See Also

- [API Overview](./overview) - API reference
- [API Authentication](./authentication) - How to authenticate
- [API Keys](./api-keys) - How to create API keys

