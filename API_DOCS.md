# API Documentation - AI Chatbot SaaS Backend

## Base Information

- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: Bearer token (JWT)
- **Content-Type**: `application/json`

## 📊 Response Format

Tất cả responses đều follow cấu trúc chuẩn:

### Success Response
```json
{
  "success": true,
  "message": "Description of the operation",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* Optional validation errors array */ ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [ /* Array of items */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxxxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "createdAt": "2025-08-20T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxxxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <access-token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Change Password
```http
POST /auth/change-password
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <access-token>
```

## 🏢 Organization Endpoints

### Create Organization
```http
POST /organizations
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "ACME Corporation",
  "description": "My awesome organization",
  "logo": "https://example.com/logo.png"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "clxxxx",
    "name": "ACME Corporation",
    "slug": "acme-corporation",
    "description": "My awesome organization",
    "logo": "https://example.com/logo.png",
    "planType": "FREE",
    "isActive": true,
    "createdAt": "2025-08-20T10:30:00.000Z",
    "creator": {
      "id": "clxxxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "members": [
      {
        "id": "clxxxx",
        "role": "OWNER",
        "joinedAt": "2025-08-20T10:30:00.000Z",
        "user": {
          "id": "clxxxx",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "_count": {
      "members": 1,
      "apiKeys": 0
    }
  }
}
```

### Get User Organizations
```http
GET /organizations
Authorization: Bearer <access-token>
```

### Get Organization by ID
```http
GET /organizations/:organizationId
Authorization: Bearer <access-token>
```

### Update Organization
```http
PUT /organizations/:organizationId
Authorization: Bearer <access-token>
```
*Requires: OWNER or ADMIN role*

### Delete Organization
```http
DELETE /organizations/:organizationId
Authorization: Bearer <access-token>
```
*Requires: OWNER role*

### Get Organization Members
```http
GET /organizations/:organizationId/members?page=1&limit=20
Authorization: Bearer <access-token>
```

### Invite Member
```http
POST /organizations/:organizationId/members
Authorization: Bearer <access-token>
```
*Requires: OWNER or ADMIN role*

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

**Available Roles:**
- `OWNER` - Full control
- `ADMIN` - Manage members and settings
- `MEMBER` - Standard access
- `VIEWER` - Read-only access

### Update Member Role
```http
PUT /organizations/:organizationId/members/:userId
Authorization: Bearer <access-token>
```
*Requires: OWNER role*

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### Remove Member
```http
DELETE /organizations/:organizationId/members/:userId
Authorization: Bearer <access-token>
```
*Requires: OWNER or ADMIN role*

### Leave Organization
```http
POST /organizations/:organizationId/leave
Authorization: Bearer <access-token>
```

## 🔑 API Key Endpoints

### Create API Key
```http
POST /api-keys
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "My API Key",
  "organizationId": "clxxxx", // Optional
  "permissions": {
    "read": true,
    "write": true,
    "admin": false
  },
  "rateLimit": 1000, // requests per hour
  "expiresAt": "2026-08-20T10:30:00.000Z" // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "clxxxx",
    "name": "My API Key",
    "key": "ak_1234567890abcdef...", // Plain key only shown on creation
    "permissions": {
      "read": true,
      "write": true,
      "admin": false
    },
    "rateLimit": 1000,
    "isActive": true,
    "createdAt": "2025-08-20T10:30:00.000Z",
    "expiresAt": "2026-08-20T10:30:00.000Z",
    "organization": {
      "id": "clxxxx",
      "name": "ACME Corporation",
      "slug": "acme-corporation"
    }
  }
}
```

### Get User API Keys
```http
GET /api-keys?page=1&limit=20&organizationId=clxxxx
Authorization: Bearer <access-token>
```

### Get Organization API Keys
```http
GET /organizations/:organizationId/api-keys?page=1&limit=20
Authorization: Bearer <access-token>
```
*Requires: Organization member*

### Get API Key by ID
```http
GET /api-keys/:apiKeyId
Authorization: Bearer <access-token>
```

### Update API Key
```http
PUT /api-keys/:apiKeyId
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Updated API Key Name",
  "permissions": {
    "read": true,
    "write": false,
    "admin": false
  },
  "rateLimit": 500,
  "isActive": true,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

### Regenerate API Key
```http
POST /api-keys/:apiKeyId/regenerate
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "API key regenerated successfully",
  "data": {
    "id": "clxxxx",
    "name": "My API Key",
    "key": "ak_newkey1234567890...", // New plain key
    "permissions": {
      "read": true,
      "write": true,
      "admin": false
    },
    "rateLimit": 1000,
    "isActive": true,
    "updatedAt": "2025-08-20T11:30:00.000Z"
  }
}
```

### Delete API Key
```http
DELETE /api-keys/:apiKeyId
Authorization: Bearer <access-token>
```

### Get API Key Usage
```http
GET /api-keys/:apiKeyId/usage
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "API key usage retrieved successfully",
  "data": {
    "apiKey": {
      "id": "clxxxx",
      "name": "My API Key",
      "rateLimit": 1000,
      "lastUsed": "2025-08-20T11:25:00.000Z",
      "createdAt": "2025-08-20T10:30:00.000Z",
      "isActive": true
    },
    "currentPeriodRequests": 45,
    "rateLimit": 1000,
    "resetTime": "2025-08-20T12:00:00.000Z"
  }
}
```

## 🔐 API Key Authentication

Ngoài JWT tokens, bạn có thể sử dụng API keys để authenticate:

```http
X-API-Key: ak_1234567890abcdef...
```

## 🚦 Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **API Key specific**: Configurable per key (default 1000/hour)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## ❌ Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 📝 Example Usage with curl

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Create Organization
```bash
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Organization",
    "description": "A sample organization"
  }'
```

### 3. Create API Key
```bash
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My API Key",
    "rateLimit": 1000
  }'
```

### 4. Use API Key
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "X-API-Key: ak_your_api_key_here"
```

## 🏥 Health Check

```bash
curl http://localhost:3000/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2025-08-20T10:30:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "environment": "development",
    "database": "Connected"
  }
}
```
