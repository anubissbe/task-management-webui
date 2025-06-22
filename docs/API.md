# 🌐 ProjectHub-MCP API Documentation

This document provides comprehensive documentation for the ProjectHub-MCP REST API.

## 🔐 Authentication

All API endpoints (except authentication routes) require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Management

- **Access tokens** expire after 15 minutes
- **Refresh tokens** expire after 7 days
- Use the `/auth/refresh-token` endpoint to get new access tokens
- Sessions are automatically cleaned up on logout

### Workspace Context

Most API endpoints also require workspace context, which can be provided via:

1. **Header**: `X-Workspace-Id: <workspace_id>`
2. **Query Parameter**: `?workspace_id=<workspace_id>`
3. **User's Current Workspace**: Automatically used if no explicit workspace specified

```
X-Workspace-Id: 123e4567-e89b-12d3-a456-426614174000
```

## 🚀 API Endpoints

### Authentication API

#### POST `/api/auth/login`
Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "developer",
    "avatarUrl": null,
    "emailVerified": true,
    "lastLogin": "2024-01-15T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "15m"
}
```

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "developer"
}
```

#### POST `/api/auth/refresh-token`
Refresh an expired access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/api/auth/me`
Get current user profile information.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "developer",
    "avatarUrl": null,
    "emailVerified": true,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Workspace Management API

#### GET `/api/workspaces`
List all workspaces for the authenticated user.

**Response:**
```json
[
  {
    "id": "workspace-uuid",
    "name": "My Workspace",
    "slug": "my-workspace-1234567890",
    "description": "Primary workspace for development",
    "logo_url": null,
    "owner_id": "user-uuid",
    "settings": {
      "features": {
        "team_management": true,
        "advanced_reporting": true,
        "webhooks": true,
        "custom_fields": false
      },
      "limits": {
        "max_projects": 100,
        "max_users": 50,
        "max_storage_gb": 10
      }
    },
    "subscription_tier": "professional",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET `/api/workspaces/:id`
Get a specific workspace by ID.

**Response:** Same as single workspace object above.

#### POST `/api/workspaces`
Create a new workspace.

**Request Body:**
```json
{
  "name": "New Workspace",
  "description": "Description of the workspace"
}
```

**Response:** Created workspace object.

#### PUT `/api/workspaces/:id`
Update workspace details (requires admin or owner role).

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "logo_url": "https://example.com/logo.png",
  "settings": {
    "features": {
      "custom_fields": true
    }
  }
}
```

**Response:** Updated workspace object.

#### DELETE `/api/workspaces/:id`
Soft delete a workspace (requires owner role).

**Response:** 204 No Content

#### GET `/api/workspaces/:id/members`
Get all members of a workspace.

**Response:**
```json
[
  {
    "id": "member-uuid",
    "workspace_id": "workspace-uuid",
    "user_id": "user-uuid",
    "role": "owner",
    "joined_at": "2024-01-01T00:00:00Z",
    "invited_by": null,
    "user": {
      "email": "owner@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "avatarUrl": null
    }
  }
]
```

#### POST `/api/workspaces/:id/invite`
Invite a member to the workspace (requires admin or owner role).

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invite-uuid",
    "email": "newmember@example.com",
    "role": "member",
    "expires_at": "2024-01-08T00:00:00Z"
  }
}
```

#### PUT `/api/workspaces/:id/members/:userId/role`
Update a member's role (requires admin or owner role).

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:** Updated member object.

#### DELETE `/api/workspaces/:id/members/:userId`
Remove a member from the workspace (requires admin or owner role).

**Response:** 204 No Content

#### POST `/api/workspaces/:id/switch`
Switch the user's current workspace.

**Response:**
```json
{
  "message": "Workspace switched successfully",
  "workspace_id": "workspace-uuid"
}
```

#### GET `/api/workspaces/:id/stats`
Get workspace statistics.

**Response:**
```json
{
  "id": "workspace-uuid",
  "name": "My Workspace",
  "subscription_tier": "professional",
  "total_users": 12,
  "total_projects": 8,
  "total_teams": 3,
  "active_projects": 5,
  "completed_projects": 3,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/workspaces/invitations/:token/accept`
Accept a workspace invitation.

**Response:**
```json
{
  "message": "Successfully joined workspace",
  "workspace_id": "workspace-uuid",
  "role": "member"
}
```

### Team Management API

#### GET `/api/teams`
Get all teams for the current user.

**Response:**
```json
[
  {
    "id": "team-uuid",
    "name": "Development Team",
    "description": "Core development team",
    "slug": "development-team",
    "avatarUrl": null,
    "ownerId": "user-uuid",
    "settings": {},
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "memberCount": 5,
    "projectCount": 3
  }
]
```

#### POST `/api/teams`
Create a new team.

**Request Body:**
```json
{
  "name": "New Team",
  "description": "Team description",
  "slug": "new-team"
}
```

#### GET `/api/teams/:id/members`
Get all members of a team.

**Response:**
```json
[
  {
    "id": "member-uuid",
    "teamId": "team-uuid",
    "userId": "user-uuid",
    "role": "admin",
    "joinedAt": "2024-01-01T00:00:00Z",
    "invitedBy": "owner-uuid",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": null,
      "isActive": true
    }
  }
]
```

#### POST `/api/teams/:id/invite`
Invite a new member to the team.

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "id": "invitation-uuid",
  "teamId": "team-uuid",
  "email": "newmember@example.com",
  "role": "member",
  "invitedBy": "admin-uuid",
  "token": "invitation-token",
  "expiresAt": "2024-01-08T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Projects API

#### GET `/api/projects`
Get all projects accessible to the current user.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term
- `status` (string): Filter by status

**Response:**
```json
{
  "projects": [
    {
      "id": "project-uuid",
      "name": "Web Application",
      "description": "Main web application project",
      "status": "active",
      "priority": "high",
      "startDate": "2024-01-01",
      "endDate": "2024-06-01",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "pages": 1,
  "currentPage": 1
}
```

#### POST `/api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "priority": "medium",
  "startDate": "2024-02-01",
  "endDate": "2024-08-01"
}
```

### Tasks API

#### GET `/api/projects/:projectId/tasks`
Get all tasks for a specific project.

**Query Parameters:**
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `assignedTo` (string): Filter by assigned user

**Response:**
```json
[
  {
    "id": "task-uuid",
    "projectId": "project-uuid",
    "title": "Implement authentication",
    "description": "Add JWT-based authentication",
    "status": "in_progress",
    "priority": "high",
    "estimatedHours": 16,
    "actualHours": 8,
    "assignedTo": "user-uuid",
    "dueDate": "2024-01-15",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z"
  }
]
```

#### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "estimatedHours": 8,
  "assignedTo": "user-uuid",
  "dueDate": "2024-02-01"
}
```

### Reporting API

#### GET `/api/reports/dashboards`
Get all dashboards for the current user.

**Response:**
```json
[
  {
    "id": "dashboard-uuid",
    "name": "Team Performance",
    "description": "Track team productivity",
    "widgets": [
      {
        "id": "widget-uuid",
        "type": "chart",
        "title": "Task Completion",
        "config": {
          "chartType": "line",
          "dataSource": "tasks",
          "aggregation": "count",
          "groupBy": "status"
        },
        "position": {
          "x": 0,
          "y": 0,
          "width": 6,
          "height": 4
        }
      }
    ],
    "filters": {
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      }
    },
    "isPublic": false,
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/reports/widget-data`
Get data for a specific widget.

**Request Body:**
```json
{
  "chartType": "line",
  "dataSource": "tasks",
  "aggregation": "count",
  "groupBy": "status",
  "filters": {
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "projectIds": ["project-uuid"]
  }
}
```

**Response:**
```json
{
  "labels": ["Pending", "In Progress", "Completed"],
  "datasets": [
    {
      "label": "Task Count",
      "data": [12, 8, 45],
      "backgroundColor": ["#f59e0b", "#3b82f6", "#10b981"]
    }
  ]
}
```

#### GET `/api/reports/advanced-metrics`
Get advanced analytics and predictive metrics.

**Response:**
```json
{
  "velocityTrend": [
    {
      "period": "2024-01",
      "tasksCompleted": 45,
      "storyPoints": 120,
      "burndownData": [
        {
          "date": "2024-01-01",
          "remaining": 120,
          "ideal": 120
        }
      ]
    }
  ],
  "performanceMetrics": [
    {
      "teamId": "team-uuid",
      "teamName": "Development Team",
      "completionRate": 85.5,
      "averageTaskTime": 12.5,
      "qualityScore": 92.3,
      "collaborationIndex": 78.9
    }
  ],
  "predictiveAnalytics": {
    "estimatedCompletion": "2024-03-15",
    "riskFactors": [
      {
        "factor": "Resource availability",
        "impact": "medium",
        "probability": 0.65
      }
    ],
    "recommendations": [
      "Consider adding more developers to critical path tasks",
      "Schedule code reviews earlier in the process"
    ]
  },
  "bottleneckAnalysis": [
    {
      "stage": "Code Review",
      "averageTime": 2.5,
      "taskCount": 15,
      "efficiency": 75.2
    }
  ]
}
```

## 🚨 Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error message"
  }
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## 🔒 Permissions

### Role Hierarchy

1. **Admin**: Full system access
2. **Manager**: Team and project management
3. **Developer**: Project access and task management
4. **Viewer**: Read-only access

### Permission Matrix

| Action | Admin | Manager | Developer | Viewer |
|--------|-------|---------|-----------|--------|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Create Teams | ✅ | ✅ | ❌ | ❌ |
| Manage Teams | ✅ | ✅ (own) | ❌ | ❌ |
| Create Projects | ✅ | ✅ | ✅ | ❌ |
| Edit Projects | ✅ | ✅ | ✅ (assigned) | ❌ |
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Edit Tasks | ✅ | ✅ | ✅ (assigned) | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ | ❌ |

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General API**: 1000 requests per hour per user
- **Export endpoints**: 10 requests per hour per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## 🔄 WebSocket Events

Real-time updates are provided via WebSocket connection to `/socket.io/`:

### Events

- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `project:updated` - Project updated
- `team:member_added` - New team member
- `team:member_removed` - Team member removed
- `notification` - System notifications

### Example Usage

```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: {
    token: accessToken
  }
});

socket.on('task:updated', (task) => {
  console.log('Task updated:', task);
});
```

## 📝 Request/Response Examples

### Create a Team and Invite Members

```bash
# 1. Create team
curl -X POST http://localhost:3001/api/teams \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Team",
    "description": "Responsible for UI/UX development",
    "slug": "frontend-team"
  }'

# 2. Invite member
curl -X POST http://localhost:3001/api/teams/team-uuid/invite \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "role": "member"
  }'
```

### Generate Advanced Report

```bash
# Get advanced metrics
curl -X GET "http://localhost:3001/api/reports/advanced-metrics?teamId=team-uuid" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Export dashboard as PDF
curl -X POST http://localhost:3001/api/reports/export/dashboard-uuid \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "includeCharts": true,
    "includeRawData": false,
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }' \
  --output report.pdf
```

## 🔧 SDK and Client Libraries

### JavaScript/TypeScript

```javascript
import { ProjectHubAPI } from '@projecthub/api-client';

const api = new ProjectHubAPI({
  baseURL: 'http://localhost:3001/api',
  accessToken: 'your-access-token'
});

// Usage
const teams = await api.teams.list();
const dashboard = await api.reports.createDashboard({
  name: 'Team Performance',
  widgets: [...]
});
```

### Python

```python
from projecthub_api import ProjectHubClient

client = ProjectHubClient(
    base_url='http://localhost:3001/api',
    access_token='your-access-token'
)

# Usage
teams = client.teams.list()
dashboard = client.reports.create_dashboard({
    'name': 'Team Performance',
    'widgets': [...]
})
```

---

## 📞 Support

For API support and questions:
- 📧 Email: api-support@projecthub.com
- 🐛 Issues: [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- 📚 Documentation: [API Docs](https://docs.projecthub.com/api)