#!/usr/bin/env node

/**
 * ProjectHub MCP Server Wrapper
 * 
 * This wrapper allows MCP-compatible AI assistants to interact with ProjectHub
 * through the Model Context Protocol (MCP).
 * 
 * Usage:
 *   node projecthub-mcp-wrapper.js
 * 
 * Environment Variables:
 *   PROJECTHUB_API_URL - Base URL of ProjectHub API (default: http://localhost:3008/api)
 *   PROJECTHUB_EMAIL - Email for authentication
 *   PROJECTHUB_PASSWORD - Password for authentication
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

class ProjectHubMCPServer {
  constructor() {
    this.apiUrl = process.env.PROJECTHUB_API_URL || 'http://localhost:3008/api';
    this.email = process.env.PROJECTHUB_EMAIL;
    this.password = process.env.PROJECTHUB_PASSWORD;
    this.token = null;
    this.api = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.server = new Server({
      name: 'projecthub-mcp',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
    this.setupErrorHandling();
  }

  async authenticate() {
    if (!this.email || !this.password) {
      throw new Error('PROJECTHUB_EMAIL and PROJECTHUB_PASSWORD environment variables are required');
    }
    
    try {
      const response = await this.api.post('/auth/login', {
        email: this.email,
        password: this.password
      });
      
      this.token = response.data.token;
      this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      
      return response.data;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  setupTools() {
    // List Projects
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'list_projects',
          description: 'List all projects in ProjectHub',
          inputSchema: {
            type: 'object',
            properties: {
              workspace_id: {
                type: 'string',
                description: 'Filter by workspace ID (optional)'
              },
              status: {
                type: 'string',
                enum: ['planning', 'active', 'completed', 'on_hold'],
                description: 'Filter by project status (optional)'
              }
            }
          }
        },
        {
          name: 'create_project',
          description: 'Create a new project in ProjectHub',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Project name'
              },
              description: {
                type: 'string',
                description: 'Project description'
              },
              workspace_id: {
                type: 'string',
                description: 'Workspace ID'
              },
              start_date: {
                type: 'string',
                description: 'Project start date (YYYY-MM-DD)'
              },
              end_date: {
                type: 'string',
                description: 'Project end date (YYYY-MM-DD)'
              }
            },
            required: ['name', 'workspace_id']
          }
        },
        {
          name: 'list_tasks',
          description: 'List tasks in ProjectHub',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'string',
                description: 'Filter by project ID'
              },
              status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'blocked'],
                description: 'Filter by task status'
              },
              assigned_to: {
                type: 'string',
                description: 'Filter by assigned user ID'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Filter by priority'
              }
            }
          }
        },
        {
          name: 'create_task',
          description: 'Create a new task in ProjectHub',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'string',
                description: 'Project ID'
              },
              title: {
                type: 'string',
                description: 'Task title'
              },
              description: {
                type: 'string',
                description: 'Task description'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Task priority',
                default: 'medium'
              },
              status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'blocked'],
                description: 'Task status',
                default: 'pending'
              },
              assigned_to: {
                type: 'string',
                description: 'User ID to assign the task to'
              },
              due_date: {
                type: 'string',
                description: 'Due date (YYYY-MM-DD)'
              }
            },
            required: ['project_id', 'title']
          }
        },
        {
          name: 'update_task',
          description: 'Update an existing task in ProjectHub',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'Task ID to update'
              },
              title: {
                type: 'string',
                description: 'New task title'
              },
              description: {
                type: 'string',
                description: 'New task description'
              },
              status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'blocked'],
                description: 'New task status'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'New task priority'
              },
              assigned_to: {
                type: 'string',
                description: 'New assigned user ID'
              },
              progress: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Task progress percentage'
              }
            },
            required: ['task_id']
          }
        },
        {
          name: 'get_analytics',
          description: 'Get project analytics and statistics',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'string',
                description: 'Project ID for project-specific analytics'
              },
              date_range: {
                type: 'string',
                enum: ['today', 'week', 'month', 'quarter', 'year'],
                description: 'Date range for analytics',
                default: 'month'
              }
            }
          }
        },
        {
          name: 'search_tasks',
          description: 'Search for tasks by keyword',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              },
              project_id: {
                type: 'string',
                description: 'Limit search to specific project'
              }
            },
            required: ['query']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      // Ensure authenticated
      if (!this.token) {
        await this.authenticate();
      }
      
      try {
        switch (name) {
          case 'list_projects':
            return await this.listProjects(args);
            
          case 'create_project':
            return await this.createProject(args);
            
          case 'list_tasks':
            return await this.listTasks(args);
            
          case 'create_task':
            return await this.createTask(args);
            
          case 'update_task':
            return await this.updateTask(args);
            
          case 'get_analytics':
            return await this.getAnalytics(args);
            
          case 'search_tasks':
            return await this.searchTasks(args);
            
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Token expired, re-authenticate and retry
          await this.authenticate();
          return this.server.setRequestHandler('tools/call', request);
        }
        throw error;
      }
    });
  }

  async listProjects(args) {
    const params = new URLSearchParams();
    if (args.workspace_id) params.append('workspace_id', args.workspace_id);
    if (args.status) params.append('status', args.status);
    
    const response = await this.api.get(`/projects?${params}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${response.data.length} projects:\n\n${response.data.map(p => 
            `- ${p.name} (ID: ${p.id})\n  Status: ${p.status}\n  Description: ${p.description || 'No description'}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  async createProject(args) {
    const response = await this.api.post('/projects', {
      name: args.name,
      description: args.description,
      workspace_id: args.workspace_id,
      start_date: args.start_date,
      end_date: args.end_date,
      status: 'planning'
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Project created successfully!\n\nID: ${response.data.id}\nName: ${response.data.name}\nStatus: ${response.data.status}`
        }
      ]
    };
  }

  async listTasks(args) {
    const params = new URLSearchParams();
    if (args.project_id) params.append('projectId', args.project_id);
    if (args.status) params.append('status', args.status);
    if (args.assigned_to) params.append('assignedTo', args.assigned_to);
    if (args.priority) params.append('priority', args.priority);
    
    const response = await this.api.get(`/tasks?${params}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${response.data.length} tasks:\n\n${response.data.map(t => 
            `- [${t.priority.toUpperCase()}] ${t.title} (ID: ${t.id})\n  Status: ${t.status}\n  Project: ${t.project_name || t.project_id}\n  ${t.assigned_to_name ? `Assigned to: ${t.assigned_to_name}` : 'Unassigned'}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  async createTask(args) {
    const response = await this.api.post('/tasks', {
      project_id: args.project_id,
      title: args.title,
      description: args.description,
      priority: args.priority || 'medium',
      status: args.status || 'pending',
      assigned_to: args.assigned_to,
      due_date: args.due_date
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Task created successfully!\n\nID: ${response.data.id}\nTitle: ${response.data.title}\nPriority: ${response.data.priority}\nStatus: ${response.data.status}`
        }
      ]
    };
  }

  async updateTask(args) {
    const { task_id, ...updateData } = args;
    
    const response = await this.api.put(`/tasks/${task_id}`, updateData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Task updated successfully!\n\nID: ${response.data.id}\nTitle: ${response.data.title}\nStatus: ${response.data.status}\nProgress: ${response.data.progress || 0}%`
        }
      ]
    };
  }

  async getAnalytics(args) {
    const params = new URLSearchParams();
    if (args.project_id) params.append('projectId', args.project_id);
    if (args.date_range) params.append('range', args.date_range);
    
    const response = await this.api.get(`/analytics?${params}`);
    const data = response.data;
    
    return {
      content: [
        {
          type: 'text',
          text: `📊 Analytics Report\n\n` +
                `Projects:\n` +
                `- Total: ${data.projectStats?.total || 0}\n` +
                `- Active: ${data.projectStats?.active || 0}\n` +
                `- Completed: ${data.projectStats?.completed || 0}\n\n` +
                `Tasks:\n` +
                `- Total: ${data.taskStats?.total || 0}\n` +
                `- Completed: ${data.taskStats?.completed || 0}\n` +
                `- In Progress: ${data.taskStats?.in_progress || 0}\n` +
                `- Pending: ${data.taskStats?.pending || 0}\n\n` +
                `Priority Distribution:\n` +
                `- High: ${data.tasksByPriority?.high || 0}\n` +
                `- Medium: ${data.tasksByPriority?.medium || 0}\n` +
                `- Low: ${data.tasksByPriority?.low || 0}`
        }
      ]
    };
  }

  async searchTasks(args) {
    const response = await this.api.get('/tasks/search', {
      params: {
        q: args.query,
        projectId: args.project_id
      }
    });
    
    if (response.data.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No tasks found matching "${args.query}"`
          }
        ]
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${response.data.length} tasks matching "${args.query}":\n\n${response.data.map(t => 
            `- ${t.title} (ID: ${t.id})\n  Project: ${t.project_name}\n  Status: ${t.status}\n  Match: ${t.match_context || 'Title or description'}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[ProjectHub MCP] Server error:', error);
    };
    
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[ProjectHub MCP] Server started');
  }
}

// Start the server
const server = new ProjectHubMCPServer();
server.run().catch(console.error);