# 🤖 AI Coding Assistant Integration Guide

This guide shows you how to integrate ProjectHub-MCP with popular AI coding assistants for automated project tracking and task management.

## Table of Contents
- [Overview](#overview)
- [Claude Code](#claude-code)
- [GitHub Copilot](#github-copilot)
- [Cursor](#cursor)
- [Cline (VSCode)](#cline-vscode)
- [Roo-Code](#roo-code)
- [Continue.dev](#continuedev)
- [Windsurf](#windsurf)
- [API Integration](#api-integration)
- [Best Practices](#best-practices)

## Overview

ProjectHub-MCP provides a REST API that allows AI coding assistants to:
- Create and manage projects automatically
- Track task progress in real-time
- Update task status as code is written
- Generate analytics and reports
- Collaborate with team members

**Base API URL**: `http://localhost:3009/api` (or your deployment URL)  
**Authentication**: JWT tokens (24-hour expiry with auto-refresh)

## Claude Code

### Quick Setup

1. **Add to CLAUDE.md** in your project root:

```markdown
# CLAUDE.md - ProjectHub Integration

## ProjectHub API Configuration
- API URL: http://localhost:3009/api
- Email: admin@projecthub.com
- Password: admin123

## Auto-tracking Rules
1. Create a project when starting major features
2. Break down work into 1-4 hour tasks
3. Update task status as you work
4. Mark tasks complete when done

## Usage
When asked to implement a feature, I will:
1. Create a project in ProjectHub
2. Break it down into tasks
3. Update progress in real-time
```

2. **Create `.claude/project-config.json`**:

```json
{
  "projectHub": {
    "enabled": true,
    "apiUrl": "http://localhost:3009/api",
    "autoTrack": true,
    "credentials": {
      "email": "admin@projecthub.com",
      "password": "admin123"
    }
  }
}
```

3. **Usage Example**:
```
You: "Help me implement user authentication with JWT tokens"
Claude: "I'll create a project in ProjectHub to track this implementation..."
[Claude automatically creates project and tasks]
```

## GitHub Copilot

### Setup

1. **Install the ProjectHub extension** (if available) or use inline comments:

```javascript
// @projecthub-start: Implement user authentication
// @project-id: auto
// @task: Setup JWT token generation
// @estimate: 2h

// Your code here...

// @projecthub-complete: Setup JWT token generation
```

2. **Create `.github/copilot-config.yml`**:

```yaml
projecthub:
  enabled: true
  api_endpoint: http://localhost:3009/api
  auto_create_tasks: true
  task_detection:
    - pattern: "TODO:"
      priority: medium
    - pattern: "FIXME:"
      priority: high
    - pattern: "@task:"
      create: true
```

3. **VS Code Settings** (`.vscode/settings.json`):

```json
{
  "github.copilot.projectHub": {
    "enabled": true,
    "apiUrl": "http://localhost:3009/api",
    "credentials": "${env:PROJECTHUB_TOKEN}"
  }
}
```

## Cursor

### Setup

1. **Configure in Cursor Settings**:
   - Open Settings (Cmd/Ctrl + ,)
   - Search for "Custom API"
   - Add ProjectHub endpoint

2. **Create `.cursor/rules`**:

```
When implementing features:
1. Call ProjectHub API to create project
2. Break down into subtasks
3. Update task status on file save
4. Mark complete on successful test

ProjectHub API: http://localhost:3009/api
Auth: Bearer ${PROJECTHUB_TOKEN}
```

3. **Add to `.cursorrules` (project root)**:

```markdown
## ProjectHub Integration
- API: http://localhost:3009/api
- Track all feature implementations
- Update task progress automatically
- Use semantic commit messages that reference task IDs
```

## Cline (VSCode)

### Setup

1. **Install Cline Extension** from VS Code marketplace

2. **Configure MCP Settings** (`.cline/mcp-settings.json`):

```json
{
  "mcpServers": {
    "projecthub": {
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "PROJECTHUB_API": "http://localhost:3009/api",
        "PROJECTHUB_EMAIL": "admin@projecthub.com",
        "PROJECTHUB_PASSWORD": "admin123"
      }
    }
  }
}
```

3. **Create Custom Commands** (`.cline/commands.json`):

```json
{
  "commands": [
    {
      "name": "Create Project",
      "template": "Create a new project in ProjectHub named '{input}'"
    },
    {
      "name": "Update Task",
      "template": "Update task {taskId} status to {status}"
    }
  ]
}
```

## Roo-Code

### Setup

1. **Add to `.roo-code/config.toml`**:

```toml
[integrations.projecthub]
enabled = true
api_url = "http://localhost:3009/api"
auto_track = true

[integrations.projecthub.auth]
email = "admin@projecthub.com"
password = "admin123"

[integrations.projecthub.rules]
create_project_on = ["feature/*", "fix/*"]
task_patterns = ["TODO", "FIXME", "@task"]
```

2. **Create Roo-Code Hook** (`.roo-code/hooks/projecthub.js`):

```javascript
export async function onFeatureStart(featureName) {
  const projectHub = new ProjectHubClient();
  const project = await projectHub.createProject({
    name: featureName,
    description: `Implementing ${featureName}`,
    status: 'active'
  });
  return project.id;
}

export async function onTaskComplete(taskId) {
  const projectHub = new ProjectHubClient();
  await projectHub.updateTask(taskId, {
    status: 'completed'
  });
}
```

## Continue.dev

### Setup

1. **Add to `.continue/config.json`**:

```json
{
  "models": [...],
  "customCommands": [
    {
      "name": "track",
      "description": "Track this work in ProjectHub",
      "prompt": "Create a ProjectHub task for: {{{input}}}"
    }
  ],
  "contextProviders": [
    {
      "name": "projecthub",
      "params": {
        "apiUrl": "http://localhost:3009/api",
        "includeAnalytics": true
      }
    }
  ]
}
```

2. **Create Continue Extension** (`.continue/extensions/projecthub.ts`):

```typescript
import { Extension } from "@continue/core";

export class ProjectHubExtension implements Extension {
  async onWorkspaceOpen() {
    // Auto-connect to ProjectHub
    await this.authenticate();
  }

  async onEdit(filepath: string) {
    // Track file modifications
    await this.updateTaskProgress(filepath);
  }
}
```

## Windsurf

### Setup

1. **Configure Windsurf Settings**:

```json
{
  "windsurf.integrations.projectHub": {
    "enabled": true,
    "endpoint": "http://localhost:3009/api",
    "autoSync": true,
    "syncInterval": 300
  }
}
```

2. **Add Windsurf Rules** (`.windsurf/cascade.yaml`):

```yaml
rules:
  - trigger: "feature_start"
    actions:
      - create_projecthub_project
      - generate_task_breakdown
  
  - trigger: "task_complete"
    actions:
      - update_projecthub_status
      - calculate_time_spent
```

## API Integration

### Universal JavaScript Client

Save this as `projecthub-client.js` in your project:

```javascript
class ProjectHubClient {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.PROJECTHUB_API || 'http://localhost:3009/api';
    this.email = config.email || process.env.PROJECTHUB_EMAIL || 'admin@projecthub.com';
    this.password = config.password || process.env.PROJECTHUB_PASSWORD || 'admin123';
    this.token = null;
    this.tokenExpiry = null;
  }

  async ensureAuthenticated() {
    if (this.token && this.tokenExpiry && new Date() < new Date(this.tokenExpiry - 5 * 60 * 1000)) {
      return this.token;
    }
    
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password })
    });
    
    const data = await response.json();
    this.token = data.token;
    
    // Parse JWT expiry
    const payload = JSON.parse(atob(this.token.split('.')[1]));
    this.tokenExpiry = new Date(payload.exp * 1000);
    
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
    
    if (response.status === 401) {
      this.token = null;
      return this.request(endpoint, options); // Retry with new token
    }
    
    return response.json();
  }

  // Project Methods
  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listProjects() {
    return this.request('/projects');
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  // Task Methods
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

  async listTasks(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/tasks${query}`);
  }

  // Analytics
  async getAnalytics(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/analytics${query}`);
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectHubClient;
}
```

## Best Practices

### 1. Automatic Project Creation

Configure your AI assistant to automatically create projects for:
- New features (`feat:` commits)
- Bug fixes (`fix:` commits)
- Major refactoring (`refactor:` commits)

### 2. Task Breakdown Template

```javascript
// When starting a new feature, break it down:
const tasks = [
  { title: "Research and planning", estimate_hours: 1, priority: "high" },
  { title: "Write unit tests", estimate_hours: 2, priority: "high" },
  { title: "Implement core functionality", estimate_hours: 3, priority: "high" },
  { title: "Integration testing", estimate_hours: 1, priority: "medium" },
  { title: "Documentation", estimate_hours: 1, priority: "low" }
];
```

### 3. Status Update Triggers

Update task status based on:
- **todo**: When task is created
- **in_progress**: On first file edit for the task
- **completed**: When tests pass or PR is merged

### 4. Commit Message Integration

Link commits to tasks:
```bash
git commit -m "feat: Add JWT authentication [PROJ-123/TASK-456]"
```

### 5. Time Tracking

```javascript
// Start timer when task begins
const startTime = new Date();

// Update task with actual time when complete
const endTime = new Date();
const actualHours = (endTime - startTime) / (1000 * 60 * 60);

await projectHub.updateTask(taskId, {
  status: 'completed',
  actual_hours: actualHours
});
```

## Environment Variables

Set these in your shell profile or `.env` file:

```bash
# ProjectHub Configuration
export PROJECTHUB_API="http://localhost:3009/api"
export PROJECTHUB_EMAIL="admin@projecthub.com"
export PROJECTHUB_PASSWORD="admin123"

# Optional: Custom settings
export PROJECTHUB_AUTO_TRACK="true"
export PROJECTHUB_DEFAULT_PRIORITY="medium"
export PROJECTHUB_DEFAULT_ESTIMATE="2"
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check API URL is correct
   - Verify credentials
   - Ensure ProjectHub is running

2. **CORS Errors**
   - Use the backend API directly (not frontend URL)
   - Configure CORS in ProjectHub settings

3. **Task Not Updating**
   - Check task ID is correct
   - Verify project exists
   - Check API response for errors

### Debug Mode

Enable debug logging:

```javascript
// Add to your AI assistant config
const DEBUG = true;

if (DEBUG) {
  console.log('[ProjectHub] Request:', endpoint, options);
  console.log('[ProjectHub] Response:', response);
}
```

## Examples

### Complete Feature Implementation Flow

```javascript
// 1. AI Assistant receives request
"Implement user profile page with avatar upload"

// 2. Create project
const project = await projectHub.createProject({
  name: "User Profile Feature",
  description: "Implement user profile page with avatar upload capability"
});

// 3. Create tasks
const tasks = [
  "Design profile UI component",
  "Implement avatar upload endpoint",
  "Add image processing",
  "Create profile API endpoints",
  "Write tests",
  "Update documentation"
].map(title => ({
  project_id: project.id,
  title,
  status: 'todo',
  priority: 'medium'
}));

for (const task of tasks) {
  await projectHub.createTask(task);
}

// 4. Update progress as work proceeds
// AI automatically updates task status during implementation
```

## Resources

- **[2-Minute Claude Setup](../CLAUDE_QUICK_SETUP.md)** - Get started instantly
- **[GitHub Repository](https://github.com/anubissbe/ProjectHub-Mcp)** - Source code
- **[Wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki)** - Complete documentation
- **[API Reference](https://github.com/anubissbe/ProjectHub-Mcp/wiki/API-Documentation)** - Full endpoint docs

## Contributing

To add support for your AI coding assistant:
1. Fork the repository
2. Add integration guide section
3. Test the integration
4. Submit a pull request

## Support

- **Documentation**: [ProjectHub Wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki)
- **Issues**: [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anubissbe/ProjectHub-Mcp/discussions)

---

*Last updated: January 2025 | Version: 5.0.0*