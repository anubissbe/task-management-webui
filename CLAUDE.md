# CLAUDE.md - ProjectHub Integration

This file provides guidance to Claude Code when working with ProjectHub-MCP.

## 🚀 ProjectHub Integration

ProjectHub API is available at: http://192.168.1.24:3009/api

### 🎯 Quick Start Example

```javascript
// Create a project and add tasks in one go
const project = await projectHub.createProject(
  "Fix User Authentication Bug", 
  "Resolve login issues reported by users"
);

await projectHub.createTask(
  project.id, 
  "Debug login endpoint", 
  "Check JWT token validation", 
  "high"
);

await projectHub.createTask(
  project.id, 
  "Fix password hashing", 
  "Update bcrypt implementation", 
  "high"
);

console.log(`✅ Created project ${project.name} with 2 tasks`);
```

### Simple Authentication

Use this simplified JavaScript class for ProjectHub API interactions:

```javascript
// Simple ProjectHub client for quick API access
class ProjectHubClient {
  constructor() {
    this.apiUrl = 'http://192.168.1.24:3009/api';
    this.token = null;
  }

  async login() {
    if (this.token) return this.token; // Already logged in
    
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@projecthub.com',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    this.token = data.token;
    console.log('✅ Authenticated with ProjectHub');
    return this.token;
  }

  async request(endpoint, options = {}) {
    await this.login(); // Ensure we're logged in
    
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Quick methods for common operations
  async listProjects() {
    return this.request('/projects');
  }

  async createProject(name, description, status = 'active') {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, status })
    });
  }

  async listTasks(projectId = null) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/tasks${query}`);
  }

  async createTask(projectId, title, description = '', priority = 'medium') {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        title,
        description,
        priority,
        status: 'todo'
      })
    });
  }

  async updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, { method: 'DELETE' });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  async getAnalytics(projectId = null) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/analytics${query}`);
  }
}

// Initialize client - ready to use
const projectHub = new ProjectHubClient();
```

### Common Operations

When asked to work with projects or tasks, use these patterns:

#### Create a New Project
```javascript
const project = await projectHub.createProject(
  "React Authentication Refactor",
  "Modernize authentication system with JWT tokens",
  "active"
);
console.log(`✅ Created project: ${project.name} (ID: ${project.id})`);
```

#### Create Tasks for a Feature
```javascript
// Break down a feature into tasks
const tasks = [
  { title: "Audit current auth flow", description: "Review existing authentication system", priority: "high" },
  { title: "Design JWT token structure", description: "Define token payload and expiry", priority: "high" },
  { title: "Implement token generation", description: "Create JWT signing logic", priority: "medium" },
  { title: "Add refresh token logic", description: "Handle token refresh flow", priority: "medium" },
  { title: "Write unit tests", description: "Test all auth components", priority: "medium" },
  { title: "Update API documentation", description: "Document new auth endpoints", priority: "low" }
];

for (const task of tasks) {
  await projectHub.createTask(project.id, task.title, task.description, task.priority);
  console.log(`✅ Created task: ${task.title}`);
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
  description: "Implemented basic structure, working on error handling"
});
console.log(`✅ Updated task ${taskId} to in_progress`);
```

#### Delete a Project (v5.0.0+)
```javascript
// Delete a project - this will also delete all associated tasks
await projectHub.deleteProject(projectId);
console.log('Project and all tasks deleted successfully');
```

#### Delete a Task
```javascript
// Delete a single task
await projectHub.deleteTask(taskId);
console.log('Task deleted successfully');
```

### Best Practices

1. **Always use the ProjectHubClient class** - It handles authentication automatically
2. **Create projects for major features** - Not for small fixes
3. **Break down work into manageable tasks** - Easier to track progress
4. **Update task status as you work** - Use 'todo', 'in_progress', 'done'
5. **Use appropriate priorities** - 'high', 'medium', 'low'
6. **Update descriptions when making progress** - Provides context for status changes

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

- **API Base**: `http://192.168.1.24:3009/api`
- **Default Credentials**: `admin@projecthub.com` / `admin123`
- **Token Expiry**: 24 hours (auto-refreshes)
- **Documentation**: [AI Integration Guide](https://github.com/anubissbe/ProjectHub-Mcp/blob/main/AI-Integration-Guide.md)