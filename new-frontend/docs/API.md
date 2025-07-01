# ProjectHub API Documentation

Complete API reference for the ProjectHub backend server.

## Base URL
```
http://localhost:3009/api
```

## Authentication

### Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@projecthub.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "name": "Test User",
    "email": "admin@projecthub.local",
    "role": "admin",
    "permissions": ["create_project", "edit_project", "delete_project", "manage_users"],
    "preferences": {
      "theme": "light",
      "notifications": true,
      "defaultView": "kanban"
    }
  }
}
```

### Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
  "id": "user-123",
  "name": "Test User",
  "email": "admin@projecthub.local",
  "role": "admin",
  "permissions": ["create_project", "edit_project", "delete_project", "manage_users"]
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Projects

### List Projects
```http
GET /projects
```

**Response:**
```json
[
  {
    "id": "f62ecb12-41e5-4297-a441-b673147edf11",
    "name": "Website Redesign",
    "description": "Complete overhaul of company website with modern design",
    "status": "active",
    "priority": "high",
    "completion_percentage": 65,
    "start_date": "2025-06-01T00:00:00.000Z",
    "end_date": "2025-07-15T00:00:00.000Z",
    "task_breakdown": {
      "completed": 8,
      "in_progress": 3,
      "pending": 2,
      "blocked": 1,
      "cancelled": 0
    },
    "created_at": "2025-05-20T00:00:00.000Z",
    "updated_at": "2025-06-30T00:00:00.000Z",
    "created_by": "user-123",
    "team_members": ["user-123", "user-456", "user-789"]
  }
]
```

### Get Project
```http
GET /projects/:projectId
```

**Response:**
```json
{
  "id": "f62ecb12-41e5-4297-a441-b673147edf11",
  "name": "Website Redesign",
  "description": "Complete overhaul of company website with modern design",
  "status": "active",
  "priority": "high",
  "completion_percentage": 65,
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-07-15T00:00:00.000Z",
  "task_breakdown": {
    "completed": 8,
    "in_progress": 3,
    "pending": 2,
    "blocked": 1,
    "cancelled": 0
  },
  "created_at": "2025-05-20T00:00:00.000Z",
  "updated_at": "2025-06-30T00:00:00.000Z",
  "created_by": "user-123",
  "team_members": ["user-123", "user-456", "user-789"]
}
```

### Create Project
```http
POST /projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "workspace_id": "default"
}
```

**Response:**
```json
{
  "id": "proj-1234567890",
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "created_at": "2025-07-01T00:00:00.000Z",
  "updated_at": "2025-07-01T00:00:00.000Z",
  "task_breakdown": {
    "completed": 0,
    "in_progress": 0,
    "pending": 0,
    "blocked": 0,
    "cancelled": 0
  }
}
```

### Update Project
```http
PUT /projects/:projectId
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active"
}
```

### Delete Project
```http
DELETE /projects/:projectId
```

**Response:** `204 No Content`

### Get Project Statistics
```http
GET /projects/:projectId/stats
```

**Response:**
```json
{
  "statistics": {
    "completion_rate": "65%",
    "task_breakdown": {
      "completed": 8,
      "in_progress": 3,
      "pending": 2,
      "blocked": 1,
      "cancelled": 0
    },
    "total_tasks": 14,
    "team_size": 3
  }
}
```

### Get Project Tasks
```http
GET /projects/:projectId/tasks
```

**Response:**
```json
[
  {
    "id": "task-001",
    "project_id": "f62ecb12-41e5-4297-a441-b673147edf11",
    "title": "Design Homepage Mockup",
    "description": "Create initial mockup for new homepage design",
    "status": "completed",
    "priority": "high",
    "assignee_id": "user-456",
    "due_date": "2025-06-10T00:00:00.000Z",
    "created_at": "2025-06-01T00:00:00.000Z",
    "updated_at": "2025-06-08T00:00:00.000Z",
    "column": "done",
    "order": 1,
    "labels": ["design", "frontend"],
    "estimated_hours": 8,
    "actual_hours": 7
  }
]
```

## Tasks

### List Tasks
```http
GET /tasks
```

**Response:**
```json
[
  {
    "id": "task-001",
    "project_id": "f62ecb12-41e5-4297-a441-b673147edf11",
    "title": "Design Homepage Mockup",
    "description": "Create initial mockup for new homepage design",
    "status": "completed",
    "priority": "high",
    "assignee_id": "user-456",
    "due_date": "2025-06-10T00:00:00.000Z",
    "created_at": "2025-06-01T00:00:00.000Z",
    "updated_at": "2025-06-08T00:00:00.000Z",
    "column": "done",
    "order": 1,
    "labels": ["design", "frontend"],
    "estimated_hours": 8,
    "actual_hours": 7
  }
]
```

### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "assigned_to": "user-123",
  "project_id": "f62ecb12-41e5-4297-a441-b673147edf11",
  "estimated_hours": 5,
  "actual_hours": 0
}
```

**Response:**
```json
{
  "id": "task-1234567890",
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "assigned_to": "user-123",
  "project_id": "f62ecb12-41e5-4297-a441-b673147edf11",
  "estimated_hours": 5,
  "actual_hours": 0,
  "created_at": "2025-07-01T00:00:00.000Z",
  "updated_at": "2025-07-01T00:00:00.000Z"
}
```

### Update Task
```http
PUT /tasks/:taskId
```

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high"
}
```

### Partially Update Task
```http
PATCH /tasks/:taskId
```

**Request Body:**
```json
{
  "status": "completed"
}
```

### Delete Task
```http
DELETE /tasks/:taskId
```

**Response:** `204 No Content`

## Kanban Board

### Get Kanban Columns
```http
GET /kanban/columns
```

**Response:**
```json
[
  { "id": "todo", "title": "To Do", "order": 1, "color": "#64748b" },
  { "id": "in_progress", "title": "In Progress", "order": 2, "color": "#3b82f6" },
  { "id": "review", "title": "Review", "order": 3, "color": "#f59e0b" },
  { "id": "blocked", "title": "Blocked", "order": 4, "color": "#ef4444" },
  { "id": "done", "title": "Done", "order": 5, "color": "#10b981" }
]
```

### Get Kanban Board
```http
GET /kanban/board/:projectId
```

**Response:**
```json
{
  "columns": [
    { "id": "todo", "title": "To Do", "order": 1, "color": "#64748b" }
  ],
  "tasks": [
    {
      "id": "task-001",
      "title": "Design Homepage",
      "status": "in_progress",
      "column": "in_progress",
      "assignee": {
        "id": "user-456",
        "name": "Jane Smith",
        "avatar": "https://ui-avatars.com/api/?name=user-456"
      }
    }
  ]
}
```

### Move Task
```http
PUT /kanban/tasks/:taskId/move
```

**Request Body:**
```json
{
  "column": "done",
  "order": 1
}
```

## Webhooks

### List Webhooks
```http
GET /webhooks
```

**Response:**
```json
[
  {
    "id": "webhook-001",
    "name": "Slack Notifications",
    "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    "events": ["task.created", "task.completed"],
    "active": true,
    "created_at": "2025-06-01T00:00:00.000Z",
    "updated_at": "2025-06-01T00:00:00.000Z",
    "description": "Send notifications to #general channel when tasks are created or completed",
    "secret": "webhook-secret-123"
  }
]
```

### Get Webhook
```http
GET /webhooks/:id
```

**Response:**
```json
{
  "id": "webhook-001",
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  "events": ["task.created", "task.completed"],
  "active": true,
  "created_at": "2025-06-01T00:00:00.000Z",
  "updated_at": "2025-06-01T00:00:00.000Z",
  "description": "Send notifications to #general channel when tasks are created or completed",
  "secret": "webhook-secret-123"
}
```

### Create Webhook
```http
POST /webhooks
```

**Request Body:**
```json
{
  "name": "Discord Webhook",
  "url": "https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "events": ["project.created", "project.completed"],
  "active": true,
  "description": "Discord webhook for project updates"
}
```

**Response:**
```json
{
  "id": "webhook-1234567890",
  "name": "Discord Webhook",
  "url": "https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "events": ["project.created", "project.completed"],
  "active": true,
  "created_at": "2025-07-01T00:00:00.000Z",
  "updated_at": "2025-07-01T00:00:00.000Z",
  "description": "Discord webhook for project updates",
  "secret": "webhook-secret-1234567890"
}
```

### Update Webhook
```http
PUT /webhooks/:id
```

**Request Body:**
```json
{
  "name": "Updated Webhook Name",
  "url": "https://new-webhook-url.com",
  "events": ["task.created", "task.updated", "task.completed"],
  "active": true,
  "description": "Updated description"
}
```

### Partially Update Webhook
```http
PATCH /webhooks/:id
```

**Request Body:**
```json
{
  "active": false
}
```

### Delete Webhook
```http
DELETE /webhooks/:id
```

**Response:** `204 No Content`

### Test Webhook
```http
POST /webhooks/:id/test
```

**Response:**
```json
{
  "success": true,
  "message": "Test payload sent to Slack Notifications",
  "webhook_id": "webhook-001",
  "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  "timestamp": "2025-07-01T00:00:00.000Z"
}
```

## Analytics

### Get Analytics Overview
```http
GET /analytics
```

**Response:**
```json
{
  "overview": {
    "totalProjects": 3,
    "activeProjects": 2,
    "completedProjects": 1,
    "totalTasks": 7,
    "completedTasks": 2,
    "averageCompletionTime": "5.2 days",
    "teamVelocity": "12 tasks/week"
  },
  "tasksByStatus": {
    "todo": 1,
    "in_progress": 2,
    "review": 0,
    "blocked": 1,
    "done": 2
  },
  "tasksByPriority": {
    "high": 3,
    "medium": 2,
    "low": 0
  },
  "projectProgress": [
    {
      "id": "f62ecb12-41e5-4297-a441-b673147edf11",
      "name": "Website Redesign",
      "progress": 65,
      "tasksCompleted": 8,
      "totalTasks": 14
    }
  ],
  "teamPerformance": [
    {
      "userId": "user-123",
      "name": "John Doe",
      "tasksCompleted": 3,
      "tasksInProgress": 1,
      "averageCompletionTime": "4.5 days",
      "productivity": 85
    }
  ],
  "burndownChart": {
    "projectId": "f62ecb12-41e5-4297-a441-b673147edf11",
    "data": [
      { "date": "2025-06-01", "remaining": 14, "ideal": 14 },
      { "date": "2025-06-05", "remaining": 12, "ideal": 12 },
      { "date": "2025-06-10", "remaining": 10, "ideal": 10 }
    ]
  },
  "dailyActivity": [
    {
      "date": "2025-07-01",
      "tasksCompleted": 3,
      "tasksCreated": 4,
      "activeUsers": 2
    }
  ]
}
```

### Get Project Analytics
```http
GET /analytics/projects/:projectId
```

**Response:**
```json
{
  "projectId": "f62ecb12-41e5-4297-a441-b673147edf11",
  "projectName": "Website Redesign",
  "overview": {
    "totalTasks": 5,
    "completedTasks": 2,
    "inProgressTasks": 2,
    "blockedTasks": 1,
    "completionPercentage": 65,
    "daysRemaining": 15,
    "onTrack": true
  },
  "taskDistribution": {
    "byStatus": {
      "completed": 2,
      "in_progress": 2,
      "pending": 0,
      "blocked": 1
    },
    "byAssignee": [
      {
        "userId": "user-123",
        "name": "John Doe",
        "taskCount": 2
      }
    ],
    "byLabel": [
      {
        "label": "frontend",
        "count": 3
      }
    ]
  },
  "timeTracking": {
    "totalEstimatedHours": 67,
    "totalActualHours": 48,
    "efficiency": 85
  }
}
```

## Users & Workspaces

### List Users
```http
GET /users
```

**Response:**
```json
[
  {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe"
  }
]
```

### List Workspaces
```http
GET /workspaces
```

**Response:**
```json
[
  {
    "id": "c4ddbddd-22b1-440b-9581-0875a8d57035",
    "name": "Default Workspace",
    "description": "Main workspace for all projects",
    "logo_url": "",
    "subscription_tier": "professional",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-06-30T00:00:00.000Z",
    "owner_id": "user-123",
    "member_count": 3,
    "project_count": 3,
    "settings": {
      "timezone": "America/New_York",
      "date_format": "MM/DD/YYYY",
      "week_start": "monday"
    }
  }
]
```

## Settings & Notifications

### Get Settings
```http
GET /settings
```

**Response:**
```json
{
  "workspace": {
    "name": "Default Workspace",
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "weekStart": "monday"
  },
  "notifications": {
    "email": true,
    "desktop": true,
    "mobile": false,
    "taskAssigned": true,
    "taskCompleted": true,
    "projectUpdated": true
  },
  "theme": {
    "mode": "light",
    "primaryColor": "#3b82f6",
    "accentColor": "#10b981"
  },
  "integrations": {
    "slack": { "enabled": true, "webhook": "https://hooks.slack.com/..." },
    "github": { "enabled": false },
    "jira": { "enabled": false }
  }
}
```

### Get Notifications
```http
GET /notifications
```

**Response:**
```json
[
  {
    "id": "notif-001",
    "type": "task_assigned",
    "message": "You have been assigned to \"Design Homepage Mockup\"",
    "read": false,
    "created_at": "2025-06-29T00:00:00.000Z"
  }
]
```

### Get Dashboard Stats
```http
GET /dashboard/stats
```

**Response:**
```json
{
  "total_projects": 3,
  "active_projects": 2,
  "completed_projects": 1,
  "total_tasks": 7,
  "my_tasks": 3,
  "overdue_tasks": 1,
  "recent_activity": [
    {
      "type": "task_completed",
      "message": "Task \"Design Homepage Mockup\" completed",
      "timestamp": "2025-06-30T12:00:00.000Z"
    }
  ]
}
```

## Health & System

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-01T00:00:00.000Z"
}
```

### MCP Health Check
```http
GET /mcp/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-01T00:00:00.000Z",
  "version": "1.0.0",
  "features": ["projects", "tasks", "webhooks", "users", "workspaces", "kanban", "analytics"]
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "path": "/api/endpoint",
  "method": "POST",
  "timestamp": "2025-07-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Examples

**404 Not Found:**
```json
{
  "error": "Project not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "details": {
    "name": "Name is required",
    "email": "Invalid email format"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Token expired or invalid"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Rate Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when rate limit resets

## Webhooks Integration

### Webhook Event Types

- `project.created` - New project created
- `project.updated` - Project updated
- `project.completed` - Project marked as completed
- `task.created` - New task created
- `task.updated` - Task updated
- `task.completed` - Task marked as completed

### Webhook Payload Format

```json
{
  "event": "task.completed",
  "timestamp": "2025-07-01T00:00:00.000Z",
  "data": {
    "task": {
      "id": "task-001",
      "title": "Design Homepage Mockup",
      "status": "completed",
      "project_id": "f62ecb12-41e5-4297-a441-b673147edf11"
    },
    "user": {
      "id": "user-456",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  },
  "webhook": {
    "id": "webhook-001",
    "name": "Slack Notifications"
  }
}
```

### Webhook Security

- Each webhook includes a secret for signature verification
- Payloads are signed using HMAC-SHA256
- Signature is included in the `X-Hub-Signature-256` header

## SDK Integration

### JavaScript/Node.js Example

```javascript
const ProjectHubAPI = {
  baseURL: 'http://localhost:3009/api',
  token: localStorage.getItem('access_token'),
  
  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    return await response.json();
  },
  
  // Projects
  async getProjects() {
    return this.request('GET', '/projects');
  },
  
  async createProject(project) {
    return this.request('POST', '/projects', project);
  },
  
  // Tasks
  async getTasks() {
    return this.request('GET', '/tasks');
  },
  
  async createTask(task) {
    return this.request('POST', '/tasks', task);
  },
  
  // Webhooks
  async getWebhooks() {
    return this.request('GET', '/webhooks');
  },
  
  async createWebhook(webhook) {
    return this.request('POST', '/webhooks', webhook);
  }
};

// Usage
const projects = await ProjectHubAPI.getProjects();
const newProject = await ProjectHubAPI.createProject({
  name: 'New Project',
  description: 'Project description',
  status: 'planning'
});
```

---

**For more information, see the main [README.md](../README.md) file.**