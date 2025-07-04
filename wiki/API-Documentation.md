# API Documentation v5.0.0

The ProjectHub-MCP v5.0.0 provides a comprehensive REST API for all application functionality. This documentation covers all available endpoints, request/response formats, and WebSocket events for the production-ready enterprise project management system.

## 🔗 Base URL

```
http://localhost:3009/api
```

For production deployments, replace with your actual domain.

## 🔐 Authentication

The API includes comprehensive authentication and authorization features:

```javascript
// API authentication (production ready)
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json',
  'X-API-Version': '5.0.0'
}

// API Key authentication (for integrations)
headers: {
  'X-API-Key': 'YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

## 📁 Projects API

### Get All Projects
**GET** `/projects`

Returns a list of all projects with their current status and statistics.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "active", // planning, active, paused, completed, cancelled
    "metadata": {},
    "requirements": "Project requirements",
    "acceptance_criteria": "Acceptance criteria",
    "created_at": "2025-06-14T10:00:00.000Z",
    "updated_at": "2025-06-14T10:00:00.000Z",
    "started_at": null,
    "completed_at": null
  }
]
```

### Get Project by ID
**GET** `/projects/:id`

Returns details of a specific project.

**Parameters:**
- `id` (required): Project UUID

**Response:**
```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Project description",
  "status": "active",
  "metadata": {},
  "requirements": "Project requirements",
  "acceptance_criteria": "Acceptance criteria",
  "created_at": "2025-06-14T10:00:00.000Z",
  "updated_at": "2025-06-14T10:00:00.000Z",
  "started_at": "2025-06-14T10:00:00.000Z",
  "completed_at": null
}
```

### Create Project
**POST** `/projects`

Creates a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "requirements": "Project requirements",
  "acceptance_criteria": "Acceptance criteria",
  "metadata": {}
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "name": "New Project",
  // ... full project object
}
```

### Update Project
**PUT** `/projects/:id`

Updates an existing project.

**Parameters:**
- `id` (required): Project UUID

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active",
  "metadata": {}
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "name": "Updated Name",
  // ... full updated project object
}
```

### Delete Project
**DELETE** `/projects/:id`

Deletes a project and all associated tasks (cascade deletion).

**Parameters:**
- `id` (required): Project UUID

**Response:** 204 No Content

**Notes:**
- This endpoint will permanently delete the project and ALL associated tasks
- The deletion is cascading - all tasks belonging to the project will be removed
- This action cannot be undone
- Requires authentication and appropriate permissions

### Get Project Statistics
**GET** `/projects/:id/stats`

Returns statistics for a specific project.

**Parameters:**
- `id` (required): Project UUID

**Response:**
```json
{
  "total_tasks": 50,
  "completed_tasks": 30,
  "in_progress_tasks": 10,
  "pending_tasks": 8,
  "blocked_tasks": 2,
  "completion_percentage": 60,
  "estimated_hours": 120,
  "actual_hours": 95
}
```

## ✅ Tasks API

### Get Tasks by Project
**GET** `/projects/:projectId/tasks`

Returns all tasks for a specific project.

**Parameters:**
- `projectId` (required): Project UUID

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed, blocked, testing, failed)
- `priority` (optional): Filter by priority (low, medium, high, critical)
- `assignee` (optional): Filter by assignee
- `search` (optional): Search in title and description

**Response:**
```json
[
  {
    "id": "uuid",
    "project_id": "project-uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "in_progress",
    "priority": "high",
    "assignee": "user@example.com",
    "estimated_hours": 8,
    "actual_hours": 6,
    "due_date": "2025-06-20T10:00:00.000Z",
    "created_at": "2025-06-14T10:00:00.000Z",
    "updated_at": "2025-06-14T10:00:00.000Z"
  }
]
```

### Get Task by ID
**GET** `/tasks/:id`

Returns details of a specific task.

**Parameters:**
- `id` (required): Task UUID

**Response:**
```json
{
  "id": "uuid",
  "project_id": "project-uuid",
  "parent_task_id": null,
  "title": "Task Title",
  "description": "Task description",
  "status": "in_progress",
  "priority": "high",
  "assignee": "user@example.com",
  "tags": ["backend", "api"],
  "estimated_hours": 8,
  "actual_hours": 6,
  "due_date": "2025-06-20T10:00:00.000Z",
  "metadata": {},
  "created_at": "2025-06-14T10:00:00.000Z",
  "updated_at": "2025-06-14T10:00:00.000Z"
}
```

### Create Task
**POST** `/tasks`

Creates a new task.

**Request Body:**
```json
{
  "project_id": "project-uuid",
  "parent_task_id": null,
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "assignee": "user@example.com",
  "tags": ["frontend"],
  "estimated_hours": 4,
  "due_date": "2025-06-25T10:00:00.000Z"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "title": "New Task",
  // ... full task object
}
```

### Update Task
**PUT** `/tasks/:id`

Updates an existing task.

**Parameters:**
- `id` (required): Task UUID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed",
  "actual_hours": 5
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "title": "Updated Title",
  // ... full updated task object
}
```

### Update Task Status
**PATCH** `/tasks/:id/status`

Quick update for task status only.

**Parameters:**
- `id` (required): Task UUID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "status": "completed",
  // ... full task object
}
```

### Delete Task
**DELETE** `/tasks/:id`

Deletes a task and all subtasks.

**Parameters:**
- `id` (required): Task UUID

**Response:** 204 No Content

### Get Subtasks
**GET** `/tasks/:id/subtasks`

Returns all subtasks of a parent task.

**Parameters:**
- `id` (required): Parent task UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "parent_task_id": "parent-uuid",
    "title": "Subtask Title",
    // ... task object
  }
]
```

### Get Task History
**GET** `/tasks/:id/history`

Returns the change history for a task.

**Parameters:**
- `id` (required): Task UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "task_id": "task-uuid",
    "field_name": "status",
    "old_value": "pending",
    "new_value": "in_progress",
    "changed_by": "user@example.com",
    "changed_at": "2025-06-14T10:00:00.000Z"
  }
]
```

### Get Next Task
**GET** `/next-task`

Returns the next prioritized task to work on.

**Query Parameters:**
- `project_id` (optional): Limit to specific project
- `assignee` (optional): Limit to specific assignee

**Response:**
```json
{
  "id": "uuid",
  "title": "High Priority Task",
  "priority": "critical",
  // ... task object
}
```

## 🧪 Test Results API

### Add Test Result
**POST** `/tasks/:id/test-results`

Records a test result for a task.

**Parameters:**
- `id` (required): Task UUID

**Request Body:**
```json
{
  "test_name": "Unit Test Suite",
  "status": "passed", // passed, failed, skipped
  "execution_time": 1500,
  "error_message": null,
  "test_output": "All tests passed"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "task_id": "task-uuid",
  "test_name": "Unit Test Suite",
  // ... full test result object
}
```

### Get Test Results
**GET** `/tasks/:id/test-results`

Returns all test results for a task.

**Parameters:**
- `id` (required): Task UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "task_id": "task-uuid",
    "test_name": "Unit Test Suite",
    "status": "passed",
    "execution_time": 1500,
    "error_message": null,
    "test_output": "All tests passed",
    "created_at": "2025-06-14T10:00:00.000Z"
  }
]
```

## 🔔 WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
const socket = io('ws://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});
```

### Events

#### Task Updated
```javascript
socket.on('task:updated', (data) => {
  console.log('Task updated:', data);
  // data = { id, title, status, ... }
});
```

#### Task Created
```javascript
socket.on('task:created', (data) => {
  console.log('New task:', data);
  // data = full task object
});
```

#### Task Deleted
```javascript
socket.on('task:deleted', (data) => {
  console.log('Task deleted:', data);
  // data = { id }
});
```

#### Project Updated
```javascript
socket.on('project:updated', (data) => {
  console.log('Project updated:', data);
  // data = full project object
});
```

## 🏥 Health Check

### API Health
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-14T10:00:00.000Z"
}
```

### Database Health
**GET** `/health/db`

Check database connectivity.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "latency": 5
}
```

### WebSocket Health
**GET** `/health/ws`

Check WebSocket server status.

**Response:**
```json
{
  "status": "ok",
  "connected_clients": 42
}
```

## 🔍 Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": {
    "field": "title",
    "error": "Title is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## 📝 Request Examples

### cURL
```bash
# Get all projects
curl http://localhost:3001/api/projects

# Create a task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "uuid",
    "title": "New Task",
    "priority": "high"
  }'
```

### JavaScript (Fetch)
```javascript
// Get project tasks
const response = await fetch('http://localhost:3001/api/projects/uuid/tasks');
const tasks = await response.json();

// Update task status
const response = await fetch('http://localhost:3001/api/tasks/uuid/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'completed'
  })
});
```

### Python (Requests)
```python
import requests

# Get all projects
response = requests.get('http://localhost:3001/api/projects')
projects = response.json()

# Create a new project
data = {
    'name': 'New Project',
    'description': 'Project description',
    'status': 'planning'
}
response = requests.post('http://localhost:3001/api/projects', json=data)
```

## 🚀 Rate Limiting

In production, API endpoints are rate-limited:

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **WebSocket**: 50 messages per minute per connection

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623456789
```