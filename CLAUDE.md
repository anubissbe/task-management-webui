# CLAUDE.md - ProjectHub Integration

This file provides guidance to Claude Code when working with ProjectHub-MCP.

## 🚀 ProjectHub Integration

ProjectHub API is available at: http://your-server-ip:3008/api

### Authentication with Auto-Refresh

Use this JavaScript class for all ProjectHub API interactions:

```javascript
class ProjectHubClient {
  constructor() {
    this.apiUrl = 'http://your-server-ip:3008/api';
    this.email = 'claude@projecthub.com';
    this.password = 'your-secure-password';
    this.token = null;
    this.tokenExpiry = null;
  }

  async ensureAuthenticated() {
    // Check if token is still valid (with 5 minute buffer)
    if (this.token && this.tokenExpiry && new Date() < new Date(this.tokenExpiry - 5 * 60 * 1000)) {
      return this.token;
    }
    
    console.log('Authenticating with ProjectHub...');
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.email,
        password: this.password
      })
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    this.token = data.token;
    
    // Parse JWT to get expiry
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      this.tokenExpiry = new Date(payload.exp * 1000);
      console.log(`Token valid until: ${this.tokenExpiry.toISOString()}`);
    } catch (e) {
      // Default to 24 hours if can't parse
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    return this.token;
  }

  async request(endpoint, options = {}) {
    const token = await this.ensureAuthenticated();
    
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    // Handle token expiry
    if (response.status === 401) {
      console.log('Token expired, re-authenticating...');
      this.token = null;
      const newToken = await this.ensureAuthenticated();
      
      // Retry request with new token
      const retryResponse = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!retryResponse.ok) {
        throw new Error(`API request failed: ${retryResponse.statusText}`);
      }
      
      return retryResponse.json();
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Convenience methods
  async listProjects() {
    return this.request('/projects');
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listTasks(projectId = null) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/tasks${query}`);
  }

  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTask(taskId, data) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getAnalytics(projectId = null) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/analytics${query}`);
  }
}

// Initialize client
const projectHub = new ProjectHubClient();
```

### Common Operations

When asked to work with projects or tasks, use these patterns:

#### Create a New Project
```javascript
const project = await projectHub.createProject({
  name: "React Authentication Refactor",
  description: "Modernize authentication system with JWT tokens",
  workspace_id: "1", // Default workspace
  status: "planning"
});
console.log(`Created project: ${project.name} (ID: ${project.id})`);
```

#### Create Tasks for a Feature
```javascript
// Break down a feature into tasks
const tasks = [
  { title: "Audit current auth flow", priority: "high", estimate_hours: 2 },
  { title: "Design JWT token structure", priority: "high", estimate_hours: 1 },
  { title: "Implement token generation", priority: "medium", estimate_hours: 3 },
  { title: "Add refresh token logic", priority: "medium", estimate_hours: 2 },
  { title: "Write unit tests", priority: "medium", estimate_hours: 2 },
  { title: "Update API documentation", priority: "low", estimate_hours: 1 }
];

for (const task of tasks) {
  await projectHub.createTask({
    project_id: project.id,
    ...task,
    status: "pending"
  });
}
```

#### Check Project Status
```javascript
const analytics = await projectHub.getAnalytics(projectId);
console.log(`
Project Status:
- Total Tasks: ${analytics.taskStats.total}
- Completed: ${analytics.taskStats.completed}
- In Progress: ${analytics.taskStats.in_progress}
- Completion: ${Math.round((analytics.taskStats.completed / analytics.taskStats.total) * 100)}%
`);
```

#### Update Task Progress
```javascript
await projectHub.updateTask(taskId, {
  status: "in_progress",
  progress: 60,
  notes: "Implemented basic structure, working on error handling"
});
```

### Best Practices

1. **Always use the ProjectHubClient class** - It handles authentication and token refresh automatically
2. **Create projects for major features** - Not for small fixes
3. **Break down work into 1-4 hour tasks** - Easier to track progress
4. **Update task status as you work** - Helps track actual vs estimated time
5. **Use appropriate priorities** - high, medium, low
6. **Add notes when updating tasks** - Provides context for status changes

### Error Handling

Always wrap API calls in try-catch:

```javascript
try {
  const projects = await projectHub.listProjects();
  // Process projects
} catch (error) {
  console.error('ProjectHub API error:', error.message);
  // Continue working without project tracking if API is down
}
```

### Environment Variables

If available, use these environment variables:
- `PROJECTHUB_API_URL` - API endpoint
- `PROJECTHUB_EMAIL` - Authentication email
- `PROJECTHUB_PASSWORD` - Authentication password

```javascript
// Check for environment variables
if (process.env.PROJECTHUB_API_URL) {
  this.apiUrl = process.env.PROJECTHUB_API_URL;
}
```

## 📋 When to Use ProjectHub

### DO use ProjectHub for:
- Creating new features or major refactors
- Tracking progress on multi-step tasks
- Getting project analytics and status
- Managing sprint planning
- Time tracking on development work

### DON'T use ProjectHub for:
- Simple one-line fixes
- Documentation typos
- Code formatting changes
- Temporary debugging

## 🔗 Quick Reference

- **API Base**: `http://your-server-ip:3008/api`
- **Default Credentials**: `developer@projecthub.com` / `dev123`
- **Token Expiry**: 24 hours (auto-refreshes)
- **Documentation**: [AI Integration Guide](https://github.com/anubissbe/ProjectHub-Mcp/blob/main/AI-Integration-Guide.md)