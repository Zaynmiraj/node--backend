# Nimion API Documentation

## Overview

Nimion Backend API with TypeScript, Express, Prisma ORM, Socket.io, and Redis caching.

**Base URL:** `http://localhost:3000`

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

Or API Key (for service-to-service):
```
X-API-Key: <api-key>
```

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-12-28T06:00:00.000Z"
}
```

---

### Users

#### Register User
```
POST /api/users/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": { "id": "uuid", "name": "User", "slug": "user" }
  }
}
```

---

#### Login User
```
POST /api/users/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "..." },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

---

#### Get Profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": { "id": "uuid", "name": "User", "slug": "user" }
  }
}
```

---

#### Update Profile
```
PUT /api/users/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```

---

#### Get All Users (Admin Only)
```
GET /api/users?page=1&limit=10
Authorization: Bearer <admin-token>
```

---

### Admin

#### Admin Login
```
POST /api/admin/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

---

#### Create Admin (Super Admin Only)
```
POST /api/admin/create
Authorization: Bearer <super-admin-token>
```

**Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "SecurePass123!",
  "name": "New Admin",
  "role": "ADMIN"
}
```

---

#### Get Admin Profile
```
GET /api/admin/profile
Authorization: Bearer <admin-token>
```

---

#### Toggle User Status
```
PATCH /api/admin/users/:id/toggle-status
Authorization: Bearer <admin-token>
```

---

### Roles

#### Get All Roles
```
GET /api/roles?page=1&limit=10
Authorization: Bearer <admin-token>
```

---

#### Create Role (Super Admin Only)
```
POST /api/roles
Authorization: Bearer <super-admin-token>
```

**Body:**
```json
{
  "name": "Premium User",
  "slug": "premium",
  "description": "Premium tier users",
  "permissions": ["read:premium", "write:comments"],
  "isDefault": false
}
```

---

#### Update Role
```
PUT /api/roles/:id
Authorization: Bearer <super-admin-token>
```

---

#### Delete Role
```
DELETE /api/roles/:id
Authorization: Bearer <super-admin-token>
```

---

#### Set Default Role
```
PATCH /api/roles/:id/set-default
Authorization: Bearer <super-admin-token>
```

---

### Dashboard (Admin Only)

#### Get Stats
```
GET /api/dashboard/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalAdmins": 5,
    "totalRoles": 3,
    "activeUsers": 95,
    "newUsersToday": 10
  }
}
```

---

#### Get User Growth
```
GET /api/dashboard/user-growth
Authorization: Bearer <admin-token>
```

---

#### Get Role Distribution
```
GET /api/dashboard/role-distribution
Authorization: Bearer <admin-token>
```

---

#### Get System Overview
```
GET /api/dashboard/overview
Authorization: Bearer <admin-token>
```

---

## Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "Optional error details"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Swagger UI

Interactive documentation available at: `/api-docs`

OpenAPI JSON spec at: `/api-docs.json`
