# Snapshots API Documentation

Snapshots allow you to capture the current state of an environment's variables and restore them later. This is useful for versioning configurations before major updates.

## Base URL
`http://localhost:3000/api`

## Authentication
All requests require a Bearer token in the `Authorization` header.

```bash
-H "Authorization: Bearer <your_token>"
```

---

## 1. Create a Snapshot
Captures all current variables in the specified environment.

**Endpoint:** `POST /snapshots`

### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Unique name for the snapshot (required) |
| `environmentId` | `string` | ID of the environment to snapshot (required) |
| `description` | `string` | Optional description of the snapshot |

### Example cURL
```bash
curl -X POST http://localhost:3000/api/snapshots \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "v1.0-release",
    "environmentId": "69997d49d71ea7e16803cf65",
    "description": "Stable configuration for v1.0"
  }'
```

---

## 2. List Snapshots
Fetches all snapshots for a given environment.

**Endpoint:** `GET /snapshots?environmentId=<id>`

### Query Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `environmentId` | `string` | The ID of the environment (required) |

### Example cURL
```bash
curl -X GET "http://localhost:3000/api/snapshots?environmentId=69997d49d71ea7e16803cf65" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Restore a Snapshot
Replaces all current variables in the environment with the variables from the snapshot.

**IMPORTANT:** This action deletes all current variables in the environment before applying the snapshot.

**Endpoint:** `POST /snapshots/:id/restore`

### Example cURL
```bash
curl -X POST http://localhost:3000/api/snapshots/699c2a8b2d1ea7e16803cf80/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Response Status Codes
| Status | Description |
| :--- | :--- |
| `200 OK` | Request succeeded |
| `201 Created` | Snapshot created |
| `400 Bad Request` | Validation failed or duplicate name |
| `401 Unauthorized` | Missing or invalid token |
| `404 Not Found` | Environment or Snapshot not found |
| `500 Internal Error` | Server-side issue |

---

## 4. Bulk Variables (Create or Overwrite)
Adds multiple variables to an environment. If a variable with the same key already exists, it will be overwritten.

**Endpoint:** `POST /variables/bulk`

### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `environmentId` | `string` | ID of the environment (required) |
| `variables` | `array` | Array of objects `{ key, value, isSecret }` |

### Example cURL
```bash
curl -X POST http://localhost:3000/api/variables/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environmentId": "69997d49d71ea7e16803cf65",
    "variables": [
      { "key": "PORT", "value": "8080", "isSecret": false },
      { "key": "DB_URL", "value": "postgres://...", "isSecret": true }
    ]
  }'
```
