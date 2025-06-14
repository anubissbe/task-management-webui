# API Documentation

## Overview

The Task Management WebUI API is a RESTful API built with Express.js and TypeScript. It provides comprehensive endpoints for managing projects, tasks, and related resources.

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.yourdomain.com/api
```

## Authentication

Currently, the API is open for development. JWT authentication is prepared but not yet enforced.

### Future Authentication Headers

```http
Authorization: Bearer <token>
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Endpoints

### Projects

#### List Projects
```http
GET /api/projects
```

Query Parameters:
- `status` (optional): Filter by project status
- `limit` (optional): Number of results per page
- `offset` (optional): Pagination offset

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Project
```http
GET /api/projects/:id
```

Response includes full project details with statistics.

#### Create Project
```http
POST /api/projects
```

Request Body:
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning"
}
```

#### Update Project
```http
PUT /api/projects/:id
```

Request Body: Same as create, all fields optional.

#### Delete Project
```http
DELETE /api/projects/:id
```

### Tasks

#### List Tasks
```http
GET /api/projects/:projectId/tasks
```

Query Parameters:
- `status` (optional): Filter by task status
- `priority` (optional): Filter by priority
- `assigned_to` (optional): Filter by assignee
- `parent_task_id` (optional): Get subtasks of a specific task

#### Get Task
```http
GET /api/tasks/:id
```

Response includes task details with subtasks and dependencies.

#### Create Task
```http
POST /api/tasks
```

Request Body:
```json
{
  "project_id": "uuid",
  "name": "Task Name",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "estimated_hours": 8,
  "assigned_to": "user@example.com",
  "parent_task_id": null,
  "due_date": "2024-12-31T00:00:00Z"
}
```

#### Update Task
```http
PUT /api/tasks/:id
```

Request Body: Same as create, all fields optional.

#### Update Task Status
```http
PATCH /api/tasks/:id/status
```

Request Body:
```json
{
  "status": "in_progress"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Bulk Create Tasks
```http
POST /api/tasks/bulk
```

Request Body:
```json
{
  "project_id": "uuid",
  "tasks": [
    {
      "name": "Task 1",
      "priority": "high",
      "estimated_hours": 4
    },
    {
      "name": "Task 2",
      "priority": "medium",
      "estimated_hours": 2
    }
  ]
}
```

### Subtasks

#### Get Subtasks
```http
GET /api/tasks/:id/subtasks
```

Returns all subtasks of a given task.

### Time Tracking

#### Log Time Entry
```http
POST /api/tasks/:id/time
```

Request Body:
```json
{
  "hours": 2.5,
  "description": "Worked on implementation",
  "date": "2024-01-01"
}
```

#### Get Time Tracking Data
```http
GET /api/tasks/:id/time-tracking
```

Returns time entries and statistics for a task.

### Analytics

#### Project Analytics
```http
GET /api/projects/:id/analytics
```

Returns comprehensive project statistics including:
- Task counts by status
- Time tracking summary
- Velocity metrics
- Completion rates

#### Export Data
```http
GET /api/projects/:id/export
```

Query Parameters:
- `format`: `csv`, `json`, `xlsx` (default: `json`)
- `include_subtasks`: Boolean (default: `true`)
- `status`: Filter by status
- `priority`: Filter by priority

### WebSocket Events

The API supports real-time updates via Socket.io:

#### Connection
```javascript
const socket = io('ws://localhost:3001', {
  query: { projectId: 'uuid' }
});
```

#### Events

**Server -> Client:**
- `task-created`: New task created
- `task-updated`: Task updated
- `task-deleted`: Task deleted
- `user-activity`: User activity in project

**Client -> Server:**
- `join-project`: Join project room
- `leave-project`: Leave project room
- `task-update`: Update task (broadcasts to others)

## Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `CONFLICT` | Resource conflict (e.g., duplicate) |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

Currently no rate limiting is implemented. In production:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Pagination

List endpoints support pagination:

```http
GET /api/projects?limit=20&offset=40
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 40,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## CORS

The API supports CORS with the following configuration:
- Allowed origins: Configured via `CORS_ORIGIN` environment variable
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

## Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```