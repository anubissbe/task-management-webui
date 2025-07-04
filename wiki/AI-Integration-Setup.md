# 🤖 AI Integration Setup Guide

*Quick setup guides for integrating ProjectHub with popular AI coding assistants*

## Overview

ProjectHub provides REST API integration with all major AI coding assistants, allowing them to automatically track your development work, create projects, manage tasks, and analyze productivity.

## Quick Setup Guides

### 🚀 Claude Code (2 minutes)
**[Complete Quick Setup Guide](../CLAUDE_QUICK_SETUP.md)**

1. Start ProjectHub: `docker-compose up -d`
2. Add `CLAUDE.md` to your project
3. Ask Claude to create projects and track tasks

**Example**:
```
You: "Create a project for user authentication"
Claude: "✅ Created project with 5 tasks, starting implementation..."
```

### 🔧 Other AI Tools

**[Complete Integration Guide](../docs/AI_INTEGRATION_GUIDE.md)** covers:

- **GitHub Copilot** - VS Code integration with automatic task detection
- **Cursor** - Custom rules and project tracking
- **Cline** - MCP server configuration for VS Code
- **Roo-Code** - Configuration file setup and hooks
- **Continue.dev** - Context providers and custom commands
- **Windsurf** - Cascade rules and sync settings

## Features

All AI integrations support:
- ✅ **Automatic project creation** for new features
- ✅ **Task breakdown** and progress tracking  
- ✅ **Real-time status updates** as code is written
- ✅ **Time tracking** and productivity analytics
- ✅ **Team collaboration** with shared project visibility

## API Endpoints

Base URL: `http://localhost:3009/api`

### Authentication
```javascript
POST /auth/login
{
  "email": "admin@projecthub.com",
  "password": "admin123"
}
// Returns JWT token (24h expiry)
```

### Projects
```javascript
POST /projects         // Create project
GET  /projects         // List projects  
PUT  /projects/:id     // Update project
DELETE /projects/:id   // Delete project (v5.0+)
```

### Tasks
```javascript
POST /tasks           // Create task
GET  /tasks           // List tasks
PUT  /tasks/:id       // Update task status
DELETE /tasks/:id     // Delete task
```

## Best Practices

### 1. Project Naming
Use descriptive names that match your feature branches:
- ✅ "User Authentication System"
- ✅ "Shopping Cart Feature"  
- ❌ "Fix stuff"

### 2. Task Breakdown
Break features into 1-4 hour tasks:
```javascript
const tasks = [
  { title: "Design API endpoints", estimate_hours: 2 },
  { title: "Implement authentication", estimate_hours: 3 },
  { title: "Write unit tests", estimate_hours: 2 },
  { title: "Integration testing", estimate_hours: 1 }
];
```

### 3. Status Updates
Map development phases to task statuses:
- **todo** → Planning/not started
- **in_progress** → Actively coding
- **completed** → Tests pass, code reviewed

### 4. Time Tracking
Enable automatic time tracking by updating tasks:
```javascript
// Start work
await updateTask(taskId, { 
  status: 'in_progress',
  started_at: new Date()
});

// Complete work  
await updateTask(taskId, {
  status: 'completed',
  completed_at: new Date(),
  actual_hours: calculateHours(started_at, completed_at)
});
```

## Troubleshooting

### Common Issues

**Connection Failed**
- Check ProjectHub is running: `docker ps | grep projecthub`
- Verify API health: `curl http://localhost:3009/health`
- Ensure correct port (3009 for API, not 5174)

**Authentication Error**
- Use default credentials: admin@projecthub.com / admin123
- Check token hasn't expired (24h limit)
- Verify API URL doesn't include `/api` suffix in base config

**Tasks Not Updating**
- Confirm project ID exists
- Check task ID is correct UUID format
- Verify API permissions for the operation

### Debug Mode

Enable debug logging in your AI assistant:

```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('[ProjectHub] API Request:', method, endpoint, data);
  console.log('[ProjectHub] API Response:', response);
}
```

## Examples

### Complete Feature Workflow

```javascript
// 1. AI detects feature request
"Implement user profile page with avatar upload"

// 2. Create project
const project = await projectHub.createProject({
  name: "User Profile Feature",
  description: "Profile page with avatar upload functionality"
});

// 3. Break into tasks
const tasks = [
  "Design profile UI component",
  "Implement avatar upload API", 
  "Add image processing",
  "Write comprehensive tests"
];

// 4. Auto-update as work progresses
// AI tracks file edits, test runs, commits
```

### Team Collaboration

```javascript
// AI can query team activity
const analytics = await projectHub.getAnalytics();
console.log(`Team completed ${analytics.tasksCompleted} tasks this week`);

// Share project with team
const project = await projectHub.updateProject(projectId, {
  collaborators: ['alice@team.com', 'bob@team.com']
});
```

## Resources

- **[2-Minute Claude Setup](../CLAUDE_QUICK_SETUP.md)** - Get started instantly
- **[Complete Integration Guide](../docs/AI_INTEGRATION_GUIDE.md)** - All AI tools
- **[API Documentation](API-Documentation.md)** - Full endpoint reference
- **[GitHub Repository](https://github.com/anubissbe/ProjectHub-Mcp)** - Source code
- **[Docker Images](https://hub.docker.com/u/anubissbe)** - Pre-built containers

## Contributing

Help improve AI integration:
1. Test with your preferred AI assistant
2. Report issues or suggest features
3. Submit integration guides for new tools
4. Share your automation workflows

---

*Need help? [Create an issue](https://github.com/anubissbe/ProjectHub-Mcp/issues) or check the [wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki).*