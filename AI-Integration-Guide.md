# 🤖 AI Assistant Integration Guide

This guide explains how to integrate ProjectHub-MCP with popular AI coding assistants like Claude Code, Cline, Gemini CLI, GitHub Copilot, and others.

## 🎯 Overview

ProjectHub-MCP exposes a RESTful API that AI assistants can use to manage projects, tasks, and collaborate with teams. The MCP (Model Context Protocol) integration allows AI agents to:

- Create and manage projects
- Add and update tasks
- Track progress
- Generate analytics
- Collaborate with human developers

## 🔧 Prerequisites

Before integrating with any AI assistant:

1. **Deploy ProjectHub-MCP** (see [Installation Guide](Installation-Guide.md))
2. **Note your API endpoint**: `http://your-server-ip:3008/api`
3. **Create an API user account** or use existing credentials
4. **Test the API** is accessible:
   ```bash
   curl http://your-server-ip:3008/health
   ```

## 🤖 Claude Code Integration

### Setup Instructions

1. **Add to CLAUDE.md** in your project root:
   ```markdown
   ## ProjectHub Integration
   
   ProjectHub API is available at: http://your-server-ip:3008/api
   
   Authentication:
   - Use Bearer token authentication
   - Login first to get token: POST /api/auth/login
   - Include token in headers: Authorization: Bearer <token>
   
   Common operations:
   - List projects: GET /api/projects
   - Create project: POST /api/projects
   - List tasks: GET /api/tasks?projectId=<id>
   - Create task: POST /api/tasks
   ```

2. **Configure in Claude Code settings**:
   ```json
   {
     "claudeCode": {
       "customInstructions": "When managing projects, use the ProjectHub API at http://your-server-ip:3008/api. Always authenticate first and track work in ProjectHub.",
       "apiEndpoints": {
         "projectHub": "http://your-server-ip:3008/api"
       }
     }
   }
   ```

3. **Example Claude Code commands**:
   ```bash
   # Claude will understand these requests:
   "Create a new project in ProjectHub for the React refactoring"
   "Add a task to track the API integration work"
   "Show me the current sprint tasks from ProjectHub"
   "Update task #123 to completed status"
   ```

## 🔷 Cline Integration

### Setup Instructions

1. **Configure Cline's `.cline/config.json`**:
   ```json
   {
     "apiProviders": {
       "projectHub": {
         "baseUrl": "http://your-server-ip:3008/api",
         "auth": {
           "type": "bearer",
           "credentials": {
             "email": "ai-agent@projecthub.com",
             "password": "secure-password"
           }
         }
       }
     },
     "tools": [
       {
         "name": "projectHub",
         "description": "Project and task management",
         "endpoints": {
           "listProjects": "GET /projects",
           "createProject": "POST /projects",
           "listTasks": "GET /tasks",
           "createTask": "POST /tasks",
           "updateTask": "PUT /tasks/{id}"
         }
       }
     ]
   }
   ```

2. **Add to Cline's system prompt**:
   ```
   You have access to ProjectHub for project management. Use it to:
   - Track all development tasks
   - Update task status as you complete work
   - Create new tasks for discovered issues
   - Check project deadlines and priorities
   ```

3. **Cline command examples**:
   ```bash
   # Cline will handle these naturally:
   @projectHub create task "Implement user authentication"
   @projectHub list my tasks
   @projectHub update task 45 status=completed
   ```

## 💎 Gemini CLI Integration

### Setup Instructions

1. **Configure `gemini-cli.config.js`**:
   ```javascript
   module.exports = {
     extensions: {
       projectHub: {
         endpoint: 'http://your-server-ip:3008/api',
         auth: {
           email: 'gemini-bot@projecthub.com',
           password: process.env.PROJECTHUB_PASSWORD
         },
         autoSync: true,
         syncInterval: 300000 // 5 minutes
       }
     },
     tools: [
       {
         name: 'project-tracker',
         description: 'ProjectHub integration for task management',
         setup: './tools/projecthub-tool.js'
       }
     ]
   };
   ```

2. **Create `tools/projecthub-tool.js`**:
   ```javascript
   const axios = require('axios');
   
   class ProjectHubTool {
     constructor(config) {
       this.api = axios.create({
         baseURL: config.endpoint,
         timeout: 10000
       });
       this.token = null;
     }
   
     async authenticate(email, password) {
       const response = await this.api.post('/auth/login', { email, password });
       this.token = response.data.token;
       this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
     }
   
     async createTask(projectId, title, description) {
       return await this.api.post('/tasks', {
         project_id: projectId,
         title,
         description,
         status: 'pending'
       });
     }
   
     // Add more methods as needed
   }
   
   module.exports = ProjectHubTool;
   ```

3. **Usage in Gemini CLI**:
   ```bash
   gemini "Create a task in ProjectHub for implementing the search feature"
   gemini "What are my high priority tasks in ProjectHub?"
   gemini "Mark ProjectHub task #89 as completed"
   ```

## 🐙 GitHub Copilot Integration

### Setup Instructions

1. **Add to `.github/copilot-instructions.md`**:
   ```markdown
   ## ProjectHub API Integration
   
   When working on this project, integrate with ProjectHub for task tracking:
   
   Base URL: http://your-server-ip:3008/api
   
   Authentication Flow:
   ```javascript
   // Login
   const response = await fetch('http://your-server-ip:3008/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'copilot@projecthub.com', password: 'password' })
   });
   const { token } = await response.json();
   
   // Use token for subsequent requests
   const headers = { 'Authorization': `Bearer ${token}` };
   ```
   
   Task Management:
   - Create tasks for new features
   - Update task status when completing work
   - Link commits to task IDs
   ```

2. **VSCode settings for Copilot**:
   ```json
   {
     "github.copilot.advanced": {
       "customContext": {
         "projectHub": {
           "apiUrl": "http://your-server-ip:3008/api",
           "description": "Use this API for project and task management"
         }
       }
     }
   }
   ```

3. **Copilot comment triggers**:
   ```javascript
   // @copilot-task: Create a new task in ProjectHub for this feature
   // @copilot-update: Mark task #123 as in-progress
   // @copilot-complete: Complete task #123 with this commit
   ```

## 🔮 Cursor Integration

### Setup Instructions

1. **Configure `.cursor/rules.md`**:
   ```markdown
   ## ProjectHub Integration Rules
   
   1. Always create a task in ProjectHub before starting new features
   2. Update task status as you progress
   3. Link commits to tasks using task IDs
   
   API Details:
   - Endpoint: http://your-server-ip:3008/api
   - Auth: Bearer token (login first)
   - Task format: "PH-{taskId}: {description}"
   ```

2. **Add to Cursor settings**:
   ```json
   {
     "cursor.api.endpoints": {
       "projectHub": "http://your-server-ip:3008/api"
     },
     "cursor.api.auth": {
       "projectHub": {
         "type": "bearer",
         "autoRefresh": true
       }
     }
   }
   ```

## 🤖 Windsurf (Codeium) Integration

### Setup Instructions

1. **Configure `.windsurf/config.yaml`**:
   ```yaml
   integrations:
     projectHub:
       enabled: true
       endpoint: http://your-server-ip:3008/api
       auth:
         method: bearer
         credentials:
           email: windsurf@projecthub.com
           password: ${PROJECTHUB_PASSWORD}
       features:
         - task_creation
         - status_updates
         - time_tracking
         - analytics
   
   workflows:
     - name: task_tracking
       trigger: on_file_save
       actions:
         - update_task_progress
         - sync_with_projecthub
   ```

2. **Windsurf command palette**:
   ```
   > ProjectHub: Create Task
   > ProjectHub: Update Status
   > ProjectHub: View My Tasks
   > ProjectHub: Start Timer
   ```

## 📡 Generic MCP Integration

For any MCP-compatible AI assistant:

### 1. MCP Server Configuration

```json
{
  "mcpServers": {
    "projecthub": {
      "command": "node",
      "args": ["/path/to/projecthub-mcp-server"],
      "env": {
        "PROJECTHUB_API_URL": "http://your-server-ip:3008/api",
        "PROJECTHUB_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 2. MCP Tool Definitions

```json
{
  "tools": [
    {
      "name": "projecthub_create_project",
      "description": "Create a new project in ProjectHub",
      "inputSchema": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "workspace_id": { "type": "string" }
        },
        "required": ["name", "workspace_id"]
      }
    },
    {
      "name": "projecthub_create_task",
      "description": "Create a new task in ProjectHub",
      "inputSchema": {
        "type": "object",
        "properties": {
          "project_id": { "type": "string" },
          "title": { "type": "string" },
          "description": { "type": "string" },
          "priority": { "type": "string", "enum": ["low", "medium", "high"] }
        },
        "required": ["project_id", "title"]
      }
    }
  ]
}
```

## 🔑 API Authentication

All AI assistants need to authenticate with ProjectHub. Here's the standard flow:

### 1. Create AI Agent User

```bash
# Via API
curl -X POST http://your-server-ip:3008/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ai-agent@projecthub.com",
    "password": "secure-password-here",
    "first_name": "AI",
    "last_name": "Assistant",
    "role": "developer"
  }'
```

### 2. Login to Get Token

```bash
curl -X POST http://your-server-ip:3008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ai-agent@projecthub.com",
    "password": "secure-password-here"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### 3. Use Token in Requests

```bash
curl http://your-server-ip:3008/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## 📋 Common Integration Patterns

### 1. Task Creation Workflow

```javascript
async function createTaskForFeature(featureName, description) {
  // 1. Login if needed
  if (!this.token) {
    await this.login();
  }
  
  // 2. Get or create project
  const project = await this.getActiveProject();
  
  // 3. Create task
  const task = await this.api.post('/tasks', {
    project_id: project.id,
    title: featureName,
    description: description,
    status: 'pending',
    priority: 'medium',
    assigned_to: this.userId
  });
  
  // 4. Return task ID for commit messages
  return task.data.id;
}
```

### 2. Progress Tracking

```javascript
async function updateTaskProgress(taskId, status, notes) {
  await this.api.put(`/tasks/${taskId}`, {
    status: status, // 'in_progress', 'completed', etc.
    progress_notes: notes,
    updated_at: new Date().toISOString()
  });
}
```

### 3. Sprint Integration

```javascript
async function getCurrentSprintTasks() {
  const tasks = await this.api.get('/tasks', {
    params: {
      sprint: 'current',
      assigned_to: this.userId,
      status: ['pending', 'in_progress']
    }
  });
  return tasks.data;
}
```

## 🛠️ Best Practices

### 1. Error Handling

```javascript
try {
  const response = await projectHubApi.post('/tasks', taskData);
  console.log(`Created task: PH-${response.data.id}`);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, re-authenticate
    await this.authenticate();
    // Retry request
  } else {
    console.error('Failed to create task:', error.message);
  }
}
```

### 2. Rate Limiting

```javascript
// Implement exponential backoff
async function apiCallWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### 3. Caching

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedProjects() {
  const cached = cache.get('projects');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const projects = await api.get('/projects');
  cache.set('projects', {
    data: projects.data,
    timestamp: Date.now()
  });
  
  return projects.data;
}
```

## 🔍 Debugging Integration

### 1. Test API Connectivity

```bash
# Health check
curl http://your-server-ip:3008/health

# Test authentication
curl -X POST http://your-server-ip:3008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@projecthub.com","password":"test123"}'

# Test with token
curl http://your-server-ip:3008/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Enable Debug Logging

```javascript
// Add to your AI assistant configuration
if (process.env.DEBUG) {
  api.interceptors.request.use(request => {
    console.log('ProjectHub API Request:', request.method, request.url);
    return request;
  });
  
  api.interceptors.response.use(response => {
    console.log('ProjectHub API Response:', response.status);
    return response;
  });
}
```

### 3. Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired, re-authenticate |
| 403 Forbidden | Check user permissions |
| 404 Not Found | Verify API endpoint URL |
| 500 Server Error | Check ProjectHub logs |
| CORS errors | Configure CORS_ORIGIN env var |

## 📚 API Reference Quick Links

- [Full API Documentation](API-Reference.md)
- [Authentication Guide](API-Reference.md#authentication)
- [Projects Endpoints](API-Reference.md#projects)
- [Tasks Endpoints](API-Reference.md#tasks)
- [Analytics Endpoints](API-Reference.md#analytics)

## 🆘 Support

- **Integration Issues**: [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- **API Questions**: [GitHub Discussions](https://github.com/anubissbe/ProjectHub-Mcp/discussions)
- **Security Concerns**: See [Security Policy](https://github.com/anubissbe/ProjectHub-Mcp/security/policy)

---

**Last Updated**: July 2025 • **API Version**: 4.7.1