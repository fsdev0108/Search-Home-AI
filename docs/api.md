# 📡 API Documentation

## Base URL
```
Production: https://sensay-search-home-ai-production.up.railway.app/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

### JWT Token
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Token Generation
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

## User Management

### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Replica Management

### List Replicas
```bash
GET /replicas
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "replica-uuid",
      "name": "Real Estate Assistant",
      "description": "AI agent for property sales",
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Create Replica
```bash
POST /replicas
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Property Assistant",
  "description": "AI agent for real estate",
  "type": "real_estate"
}
```

## WhatsApp Integration

### Test Server Credentials
```bash
POST /twilio/test-credentials
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountSid": "AC...",
  "authToken": "auth_token_here"
}
```

### Create Integration
```bash
POST /twilio/integration
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+14155238886",
  "replicaId": "replica-uuid"
}
```

### Activate Integration
```bash
POST /twilio/activate
Authorization: Bearer <token>
Content-Type: application/json

{
  "integrationId": "integration-uuid"
}
```

### Webhook Endpoint
```bash
POST /twilio/webhook/global
Content-Type: application/x-www-form-urlencoded

# Twilio sends webhook data here
SmsMessageSid=SM...&Body=Hello&From=whatsapp:+1234567890&To=whatsapp:+14155238886
```

## Telegram Integration

### Create Bot Integration
```bash
POST /telegram/integration
Authorization: Bearer <token>
Content-Type: application/json

{
  "botToken": "bot_token_here",
  "replicaId": "replica-uuid"
}
```

### Webhook Endpoint
```bash
POST /telegram/webhook/:integrationId
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "User"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "text": "Hello"
  }
}
```

## Knowledge Base

### Upload File
```bash
POST /knowledge-base/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "replicaId": "replica-uuid",
  "title": "Property Database"
}
```

### List Files
```bash
GET /knowledge-base/files/:replicaId
Authorization: Bearer <token>
```

## Settings

### Get Integration Settings
```bash
GET /settings/integration
Authorization: Bearer <token>
```

### Update Settings
```bash
PUT /settings/integration
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizationSecret": "sensay_secret_here",
  "organizationName": "Company Name"
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2025-01-15T10:00:00Z",
  "requestId": "req-uuid"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `EXTERNAL_API_ERROR`: Error from external service
- `INTERNAL_ERROR`: Server error

## Rate Limiting

### Limits
- **Authentication**: 5 requests per minute
- **API Calls**: 100 requests per minute
- **File Uploads**: 10 requests per minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks

### Twilio Webhook
- **URL**: `/twilio/webhook/global`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Authentication**: None (Twilio signature validation)

### Telegram Webhook
- **URL**: `/telegram/webhook/:integrationId`
- **Method**: POST
- **Content-Type**: `application/json`
- **Authentication**: None (Telegram signature validation)

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-15T10:00:00Z",
  "requestId": "req-uuid"
}
```

### Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const api = axios.create({
  baseURL: 'https://sensay-search-home-ai-production.up.railway.app/api/v1',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Create replica
const replica = await api.post('/replicas', {
  name: 'Property Assistant',
  description: 'AI agent for real estate'
});
```

### cURL Examples
```bash
# Login
curl -X POST https://sensay-search-home-ai-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create replica
curl -X POST https://sensay-search-home-ai-production.up.railway.app/api/v1/replicas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Property Assistant","description":"AI agent"}'
```
