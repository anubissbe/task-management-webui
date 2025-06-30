# ProjectHub Backend Fix

This is the complete working backend for ProjectHub MCP Server that provides all required endpoints with mock data.

## Features

- ✅ Projects management with CRUD operations
- ✅ Task management with status tracking
- ✅ Kanban board with drag-drop support
- ✅ Analytics dashboard with charts data
- ✅ Webhooks configuration
- ✅ User authentication (mocked)
- ✅ Workspace management
- ✅ Notifications system

## Running the Backend

### Local Development
```bash
cd backend-fix
npm install
npm start
```

### Docker
```bash
docker run -d --name projecthub-backend \
  -p 3009:3001 \
  -v $(pwd):/app \
  node:18-alpine \
  sh -c "cd /app && npm install && node complete_backend.js"
```

## Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Kanban
- `GET /api/kanban/columns` - Get board columns
- `GET /api/kanban/board/:projectId` - Get project board
- `PUT /api/kanban/tasks/:taskId/move` - Move task

### Analytics
- `GET /api/analytics` - Get overall analytics
- `GET /api/analytics/projects/:id` - Get project analytics

### Authentication
- `POST /api/auth/login` - Login (returns mock token)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh token

## Default Data

The backend includes sample data for:
- 3 Projects (Website Redesign, Mobile App, Database Migration)
- 7 Tasks with various statuses
- 3 Users (John Doe, Jane Smith, Bob Johnson)
- Analytics metrics and charts

## Authentication

For testing, any login credentials work. The backend returns:
- Access Token: `sample-token-123`
- User: Test User (admin role)