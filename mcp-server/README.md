# ProjectHub MCP Server

This MCP (Model Context Protocol) server allows AI assistants like Claude, Cline, and others to interact with ProjectHub for project and task management.

## Installation

```bash
cd mcp-server
npm install
```

## Configuration

Set the following environment variables:

```bash
export PROJECTHUB_API_URL="http://your-server-ip:3009/api"
export PROJECTHUB_EMAIL="ai-agent@projecthub.com"
export PROJECTHUB_PASSWORD="your-secure-password"
```

Or create a `.env` file:

```env
PROJECTHUB_API_URL=http://your-server-ip:3009/api
PROJECTHUB_EMAIL=ai-agent@projecthub.com
PROJECTHUB_PASSWORD=your-secure-password
```

## Usage with AI Assistants

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "projecthub": {
      "command": "node",
      "args": ["/path/to/projecthub-mcp-server/mcp-server/projecthub-mcp-wrapper.js"],
      "env": {
        "PROJECTHUB_API_URL": "http://your-server-ip:3009/api",
        "PROJECTHUB_EMAIL": "claude@projecthub.com",
        "PROJECTHUB_PASSWORD": "secure-password"
      }
    }
  }
}
```

### Cline (VSCode Extension)

Add to your `.cline/mcp_servers.json`:

```json
{
  "projecthub": {
    "command": "node",
    "args": ["./node_modules/projecthub-mcp-server/projecthub-mcp-wrapper.js"],
    "env": {
      "PROJECTHUB_API_URL": "http://your-server-ip:3009/api",
      "PROJECTHUB_EMAIL": "cline@projecthub.com",
      "PROJECTHUB_PASSWORD": "secure-password"
    }
  }
}
```

### Generic MCP Client

```bash
# Start the MCP server
PROJECTHUB_API_URL="http://your-server-ip:3009/api" \
PROJECTHUB_EMAIL="ai@projecthub.com" \
PROJECTHUB_PASSWORD="password" \
node projecthub-mcp-wrapper.js
```

## Available Tools

The MCP server provides the following tools:

### 1. list_projects
List all projects with optional filters.

**Parameters:**
- `workspace_id` (optional): Filter by workspace
- `status` (optional): Filter by status (planning/active/completed/on_hold)

**Example:** "List all active projects"

### 2. create_project
Create a new project.

**Parameters:**
- `name` (required): Project name
- `workspace_id` (required): Workspace ID
- `description` (optional): Project description
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Example:** "Create a new project called 'API Refactoring' in workspace 1"

### 3. list_tasks
List tasks with optional filters.

**Parameters:**
- `project_id` (optional): Filter by project
- `status` (optional): pending/in_progress/completed/blocked
- `assigned_to` (optional): Filter by assigned user
- `priority` (optional): low/medium/high

**Example:** "Show me all high priority tasks in progress"

### 4. create_task
Create a new task.

**Parameters:**
- `project_id` (required): Project ID
- `title` (required): Task title
- `description` (optional): Task description
- `priority` (optional): low/medium/high (default: medium)
- `status` (optional): pending/in_progress/completed/blocked (default: pending)
- `assigned_to` (optional): User ID to assign to
- `due_date` (optional): Due date (YYYY-MM-DD)

**Example:** "Create a high priority task 'Fix authentication bug' in project 5"

### 5. update_task
Update an existing task.

**Parameters:**
- `task_id` (required): Task ID to update
- `title` (optional): New title
- `description` (optional): New description
- `status` (optional): New status
- `priority` (optional): New priority
- `assigned_to` (optional): New assignee
- `progress` (optional): Progress percentage (0-100)

**Example:** "Update task 123 to completed status with 100% progress"

### 6. get_analytics
Get project analytics and statistics.

**Parameters:**
- `project_id` (optional): Get analytics for specific project
- `date_range` (optional): today/week/month/quarter/year (default: month)

**Example:** "Show me this month's analytics"

### 7. search_tasks
Search for tasks by keyword.

**Parameters:**
- `query` (required): Search query
- `project_id` (optional): Limit to specific project

**Example:** "Search for tasks containing 'authentication'"

## Testing the Connection

Create a test script to verify your setup:

```javascript
// test-connection.js
const axios = require('axios');
require('dotenv').config();

async function testConnection() {
  const api = axios.create({
    baseURL: process.env.PROJECTHUB_API_URL,
    timeout: 5000
  });
  
  try {
    // Test API health
    const health = await api.get('/health');
    console.log('✓ API is healthy');
    
    // Test authentication
    const auth = await api.post('/auth/login', {
      email: process.env.PROJECTHUB_EMAIL,
      password: process.env.PROJECTHUB_PASSWORD
    });
    console.log('✓ Authentication successful');
    
    // Test listing projects
    api.defaults.headers.common['Authorization'] = `Bearer ${auth.data.token}`;
    const projects = await api.get('/projects');
    console.log(`✓ Found ${projects.data.length} projects`);
    
    console.log('\n✅ All tests passed! MCP server is ready to use.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testConnection();
```

Run the test:
```bash
node test-connection.js
```

## Troubleshooting

### Authentication Failed
- Verify the email and password are correct
- Ensure the user exists in ProjectHub
- Check the API URL is accessible

### Connection Refused
- Verify ProjectHub is running
- Check the API URL and port
- Ensure no firewall is blocking the connection

### Tools Not Working
- Check Claude/Cline logs for errors
- Verify the MCP server is listed in available servers
- Test with the connection script first

## Security Notes

1. **Never commit credentials** - Use environment variables
2. **Create dedicated AI users** - Don't use personal accounts
3. **Limit permissions** - Give AI users only necessary access
4. **Rotate tokens** - Change passwords periodically
5. **Monitor usage** - Track AI agent activities

## Examples in AI Assistants

### Claude
```
Human: Create a new task for implementing user authentication in the API Refactoring project