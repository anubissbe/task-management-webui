# API Documentation

The Task Management WebUI provides a comprehensive REST API for all application functionality. This documentation covers all available endpoints, request/response formats, and authentication.

## 🔗 Base URL

```
http://localhost:3001/api
```

For production deployments, replace with your actual domain.

## 🔐 Authentication

Currently, the API is open for development. In production, you'll need to implement authentication:

```javascript
// Example auth header (when implemented)
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## 📁 Projects API

### Get All Projects
**GET** `/projects`

Returns a list of all projects.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "active",
    "createdAt": "2025-06-14T10:00:00.000Z",
    "updatedAt": "2025-06-14T10:00:00.000Z"
  }
]
```

### Get Project by ID
**GET** `/projects/:id`

Returns details of a specific project.

**Parameters:**
- `id` (string): Project UUID

**Response:**
```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Project description",
  "status": "active",
  "createdAt": "2025-06-14T10:00:00.000Z",
  "updatedAt": "2025-06-14T10:00:00.000Z",
  "taskCount": 15,
  "completedTasks": 8
}
```

### Create Project
**POST** `/projects`

Creates a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "createdAt": "2025-06-14T10:00:00.000Z",
  "updatedAt": "2025-06-14T10:00:00.000Z"
}
```

### Update Project
**PUT** `/projects/:id`

Updates an existing project.

**Parameters:**
- `id` (string): Project UUID

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "archived"
}
```

### Delete Project
**DELETE** `/projects/:id`

Deletes a project and all associated tasks.

**Parameters:**
- `id` (string): Project UUID

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### Get Project Statistics
**GET** `/projects/:id/stats`

Returns comprehensive project statistics.

**Response:**
```json
{
  "taskCount": 25,
  "completedTasks": 12,
  "inProgressTasks": 8,
  "pendingTasks": 3,
  "blockedTasks": 2,
  "completionRate": 48,
  "averageCompletionTime": "2.5 days",
  "overdueTasks": 1
}
```

## 📋 Tasks API

### Get Tasks by Project
**GET** `/projects/:projectId/tasks`

Returns all tasks for a specific project.

**Parameters:**
- `projectId` (string): Project UUID

**Query Parameters:**
- `status` (string): Filter by status (pending, in_progress, completed, etc.)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `assignee` (string): Filter by assignee
- `limit` (number): Limit number of results
- `offset` (number): Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Task name",
    "description": "Task description",
    "status": "in_progress",
    "priority": "high",
    "assignee": "john.doe@example.com",
    "dueDate": "2025-06-20T00:00:00.000Z",
    "createdAt": "2025-06-14T10:00:00.000Z",
    "updatedAt": "2025-06-14T10:00:00.000Z",
    "tags": ["frontend", "bug"],
    "estimatedHours": 8,
    "actualHours": 5.5
  }
]
```

### Get Task by ID
**GET** `/tasks/:id`

Returns details of a specific task.

**Response:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "Task name",
  "description": "Detailed task description",
  "status": "in_progress",
  "priority": "high",
  "assignee": "john.doe@example.com",
  "dueDate": "2025-06-20T00:00:00.000Z",
  "createdAt": "2025-06-14T10:00:00.000Z",
  "updatedAt": "2025-06-14T10:00:00.000Z",
  "tags": ["frontend", "bug"],
  "estimatedHours": 8,
  "actualHours": 5.5,
  "dependencies": ["other-task-uuid"],
  "attachments": [
    {
      "id": "uuid",
      "filename": "screenshot.png",
      "url": "/uploads/screenshot.png",
      "size": 1024000
    }
  ],
  "comments": [
    {
      "id": "uuid",
      "author": "jane.doe@example.com",
      "content": "Updated the implementation",
      "createdAt": "2025-06-14T11:00:00.000Z"
    }
  ]
}
```

### Create Task
**POST** `/tasks`

Creates a new task.

**Request Body:**
```json
{
  "projectId": "uuid",
  "name": "New Task",
  "description": "Task description",
  "priority": "medium",
  "assignee": "john.doe@example.com",
  "dueDate": "2025-06-20T00:00:00.000Z",
  "tags": ["feature"],
  "estimatedHours": 4
}
```

### Update Task
**PUT** `/tasks/:id`

Updates an existing task.

**Request Body:**
```json
{
  "name": "Updated Task Name",
  "status": "completed",
  "priority": "high",
  "actualHours": 6
}
```

### Update Task Status
**PATCH** `/tasks/:id/status`

Updates only the task status (for quick status changes).

**Request Body:**
```json
{
  "status": "completed"
}
```

### Delete Task
**DELETE** `/tasks/:id`

Deletes a specific task.

### Bulk Create Tasks
**POST** `/tasks/bulk`

Creates multiple tasks at once.

**Request Body:**
```json
{
  "projectId": "uuid",
  "tasks": [
    {
      "name": "Task 1",
      "description": "Description 1",
      "priority": "high"
    },
    {
      "name": "Task 2",
      "description": "Description 2",
      "priority": "medium"
    }
  ]
}
```

### Get Subtasks
**GET** `/tasks/:id/subtasks`

Returns all subtasks for a specific task.

## 🕐 Time Tracking API

### Log Time Entry
**POST** `/tasks/:id/time`

Logs time spent on a task.

**Request Body:**
```json
{
  "hours": 2.5,
  "description": "Implemented user authentication",
  "date": "2025-06-14"
}
```

### Get Time Tracking Data
**GET** `/tasks/:id/time-tracking`

Returns time tracking history for a task.

**Response:**
```json
[
  {
    "id": "uuid",
    "taskId": "uuid",
    "hours": 2.5,
    "description": "Implemented user authentication",
    "date": "2025-06-14",
    "createdAt": "2025-06-14T10:00:00.000Z"
  }
]
```

### Get Project Time Summary
**GET** `/projects/:id/time-summary`

Returns time tracking summary for a project.

**Response:**
```json
{
  "totalHours": 150.5,
  "estimatedHours": 200,
  "efficiency": 75.25,
  "byUser": [
    {
      "user": "john.doe@example.com",
      "hours": 45.5
    }
  ],
  "byTask": [
    {
      "taskId": "uuid",
      "taskName": "User Authentication",
      "hours": 12.5
    }
  ]
}
```

## 📊 Analytics API

### Get Project Analytics
**GET** `/projects/:id/analytics`

Returns comprehensive analytics for a project.

**Query Parameters:**
- `period` (string): time, week, month, quarter, year
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string

**Response:**
```json
{
  "overview": {
    "totalTasks": 50,
    "completedTasks": 30,
    "completionRate": 60,
    "averageCompletionTime": "3.2 days"
  },
  "statusDistribution": [
    { "status": "completed", "count": 30 },
    { "status": "in_progress", "count": 15 },
    { "status": "pending", "count": 5 }
  ],
  "priorityDistribution": [
    { "priority": "high", "count": 10 },
    { "priority": "medium", "count": 25 },
    { "priority": "low", "count": 15 }
  ],
  "completionTrend": [
    { "date": "2025-06-01", "completed": 5 },
    { "date": "2025-06-08", "completed": 8 },
    { "date": "2025-06-15", "completed": 12 }
  ],
  "teamPerformance": [
    {
      "user": "john.doe@example.com",
      "tasksCompleted": 12,
      "averageCompletionTime": "2.8 days"
    }
  ]
}
```

## 📤 Export API

### Export Project Data
**GET** `/projects/:id/export`

Exports project data in various formats.

**Query Parameters:**
- `format` (string): csv, json, pdf, xlsx
- `includeComments` (boolean): Include task comments
- `includeTimeTracking` (boolean): Include time tracking data

**Response:**
Returns file download or JSON data based on format.

### Export Filtered Tasks
**POST** `/export/tasks`

Exports tasks based on filter criteria.

**Request Body:**
```json
{
  "projectId": "uuid",
  "format": "csv",
  "filters": {
    "status": ["completed", "in_progress"],
    "priority": ["high"],
    "assignee": ["john.doe@example.com"],
    "dateRange": {
      "start": "2025-06-01",
      "end": "2025-06-30"
    }
  }
}
```

## 🔍 Search API

### Global Search
**GET** `/search`

Searches across all projects and tasks.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): projects, tasks, comments
- `limit` (number): Limit results
- `offset` (number): Pagination offset

**Response:**
```json
{
  "results": [
    {
      "type": "task",
      "id": "uuid",
      "title": "Task Title",
      "description": "Matching description...",
      "projectName": "Project Name",
      "relevance": 0.95
    }
  ],
  "totalCount": 25,
  "hasMore": true
}
```

## 📡 WebSocket Events

The application uses WebSocket for real-time updates:

### Connection
```javascript
const socket = io('ws://localhost:3001');
```

### Events

**Task Updates:**
```javascript
socket.on('task:updated', (data) => {
  // Handle task update
  console.log('Task updated:', data.task);
});
```

**Task Created:**
```javascript
socket.on('task:created', (data) => {
  // Handle new task
  console.log('New task:', data.task);
});
```

**Task Deleted:**
```javascript
socket.on('task:deleted', (data) => {
  // Handle task deletion
  console.log('Task deleted:', data.taskId);
});
```

**Project Updates:**
```javascript
socket.on('project:updated', (data) => {
  // Handle project update
  console.log('Project updated:', data.project);
});
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `CONFLICT` - Resource conflict
- `RATE_LIMITED` - Too many requests

## 📝 Rate Limiting

API requests are rate limited:
- **Global**: 1000 requests per hour per IP
- **Search**: 100 requests per hour per IP
- **Bulk operations**: 10 requests per hour per IP

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
```

## 🧪 Testing the API

### Using cURL
```bash
# Get all projects
curl -X GET http://localhost:3001/api/projects

# Create a new task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "uuid",
    "name": "Test Task",
    "description": "API test task"
  }'
```

### Using Postman
Import the API collection: [Download Postman Collection](../postman/Task-Management-API.postman_collection.json)

### Using JavaScript
```javascript
// Get projects
const response = await fetch('http://localhost:3001/api/projects');
const projects = await response.json();

// Create task
const newTask = await fetch('http://localhost:3001/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'uuid',
    name: 'New Task',
    description: 'Created via API'
  })
});
```

---

**Next**: Explore [Real-time Features](Real-time-Features) for WebSocket integration details.