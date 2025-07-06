# ProjectHub Integration Prompt for Claude Code

Copy and paste this entire prompt when starting a new Claude Code session on another host:

---

## 🎯 ProjectHub Task Management Integration

You are configured to use ProjectHub for tracking all development work. ProjectHub is a project management system running at http://192.168.1.24:3009/api.

### IMPORTANT: Task Management Rules

1. **ALWAYS check ProjectHub for existing tasks** at the start of each session
2. **Create tasks in ProjectHub** before starting any significant work (more than 5 minutes)
3. **Update task status** as you work (pending → in_progress → completed)
4. **Add progress notes** when making significant progress
5. **Complete tasks** when work is finished

### 🔧 ProjectHub Client Code

Save this as `projecthub-client.js` in your working directory:

```javascript
class ProjectHubClient {
  constructor() {
    this.apiUrl = 'http://192.168.1.24:3009/api';
    this.email = 'admin@projecthub.com';
    this.password = 'admin123';
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

  // Task Management Methods
  async listTasks(projectId = null, status = null) {
    let query = '';
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    if (params.toString()) query = `?${params.toString()}`;
    
    return this.request(`/tasks${query}`);
  }

  async getMyTasks() {
    // Get all in-progress tasks
    const inProgress = await this.listTasks(null, 'in_progress');
    const pending = await this.listTasks(null, 'pending');
    
    return {
      inProgress,
      pending,
      total: inProgress.length + pending.length
    };
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

  async startTask(taskId) {
    return this.updateTask(taskId, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
      notes: 'Started working on this task'
    });
  }

  async updateTaskProgress(taskId, progress, notes) {
    return this.updateTask(taskId, {
      progress,
      notes,
      updated_at: new Date().toISOString()
    });
  }

  async completeTask(taskId, notes = 'Task completed') {
    return this.updateTask(taskId, {
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
      notes
    });
  }

  async listProjects() {
    return this.request('/projects');
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Helper method to display task status
  formatTaskStatus(task) {
    const status = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      cancelled: '❌'
    };
    
    return `${status[task.status] || '❓'} [${task.id}] ${task.title} (${task.progress || 0}%)`;
  }
}

// Initialize client
const projectHub = new ProjectHubClient();

// Helper functions for common operations
async function checkMyTasks() {
  try {
    const tasks = await projectHub.getMyTasks();
    
    console.log('\n📋 Your ProjectHub Tasks:');
    
    if (tasks.inProgress.length > 0) {
      console.log('\n🔄 In Progress:');
      tasks.inProgress.forEach(task => {
        console.log(`  ${projectHub.formatTaskStatus(task)}`);
        if (task.notes) console.log(`     Last update: ${task.notes}`);
      });
    }
    
    if (tasks.pending.length > 0) {
      console.log('\n⏳ Pending:');
      tasks.pending.slice(0, 5).forEach(task => {
        console.log(`  ${projectHub.formatTaskStatus(task)}`);
      });
      if (tasks.pending.length > 5) {
        console.log(`  ... and ${tasks.pending.length - 5} more pending tasks`);
      }
    }
    
    if (tasks.total === 0) {
      console.log('  No active tasks found');
    }
    
    return tasks;
  } catch (error) {
    console.error('Failed to fetch tasks:', error.message);
    return { inProgress: [], pending: [], total: 0 };
  }
}

async function createTaskForWork(title, description, estimateHours = 2) {
  try {
    // Find or create a default project
    const projects = await projectHub.listProjects();
    let project = projects.find(p => p.name === 'Development Tasks');
    
    if (!project) {
      project = await projectHub.createProject({
        name: 'Development Tasks',
        description: 'General development and maintenance tasks',
        status: 'active'
      });
    }
    
    // Create the task
    const task = await projectHub.createTask({
      project_id: project.id,
      title,
      description,
      status: 'pending',
      priority: 'medium',
      estimate_hours: estimateHours
    });
    
    console.log(`\n✅ Created task: ${task.title} (ID: ${task.id})`);
    return task;
  } catch (error) {
    console.error('Failed to create task:', error.message);
    return null;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { projectHub, checkMyTasks, createTaskForWork };
}
```

### 📋 Task Management Workflow

At the **start of each session**, run this:

```javascript
// Check your current tasks
await checkMyTasks();
```

When **starting new work**, use this pattern:

```javascript
// Create a task for the work you're about to do
const task = await createTaskForWork(
  'Implement user authentication', 
  'Add JWT-based authentication to the API',
  4 // estimated hours
);

// Start working on it
if (task) {
  await projectHub.startTask(task.id);
}

// Update progress as you work
await projectHub.updateTaskProgress(task.id, 50, 'Implemented login endpoint, working on token refresh');

// Complete when done
await projectHub.completeTask(task.id, 'Authentication system fully implemented with tests');
```

### 🎯 Best Practices

1. **Task Granularity**: Create tasks for work that takes 1-4 hours
2. **Descriptive Titles**: Use clear, action-oriented titles
3. **Progress Updates**: Update progress every 30-60 minutes
4. **Completion Notes**: Document what was accomplished

### 🚨 Important Reminders

- **ALWAYS** check existing tasks before creating new ones
- **NEVER** leave tasks in progress when stopping work
- **UPDATE** task status and progress regularly
- **CREATE** tasks for any significant development work

### 💡 Quick Commands

```javascript
// View my tasks
await checkMyTasks();

// Create and start a new task
const task = await createTaskForWork('Fix navigation bug', 'Users report menu not closing properly', 1);
await projectHub.startTask(task.id);

// Update progress
await projectHub.updateTaskProgress(task.id, 75, 'Found the issue, implementing fix');

// Complete task
await projectHub.completeTask(task.id, 'Fixed event propagation issue in menu component');

// Get all projects
const projects = await projectHub.listProjects();
projects.forEach(p => console.log(`${p.id}: ${p.name}`));
```

### 🔌 Integration Note

ProjectHub is running at `http://192.168.1.24:3009` and is always available. If you encounter connection issues, continue with your work but note that task tracking is temporarily unavailable.

Remember: Good task management helps track progress, estimate future work, and provides valuable project insights!

---

End of prompt. Copy everything above this line.