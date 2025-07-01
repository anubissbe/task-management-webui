const express = require('express');
const cors = require('cors');

// Helper function to sanitize user input for logging
function sanitizeForLog(str) {
    if (typeof str !== 'string') {
        return JSON.stringify(str).replace(/[\r\n]/g, ' ');
    }
    return str.replace(/[\r\n]/g, ' ');
}

const app = express();
const port = 3001;

// CORS middleware
app.use(cors({
    origin: ['http://localhost:5174', 'http://192.168.1.24:5174'],
    credentials: true
}));

app.use(express.json());

// Sample data
const sampleProjects = [
    {
        id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        status: 'active',
        priority: 'high',
        completion_percentage: 65,
        start_date: '2025-06-01T00:00:00.000Z',
        end_date: '2025-07-15T00:00:00.000Z',
        task_breakdown: {
            completed: 8,
            in_progress: 3,
            pending: 2,
            blocked: 1,
            cancelled: 0
        },
        created_at: '2025-05-20T00:00:00.000Z',
        updated_at: '2025-06-30T00:00:00.000Z',
        created_by: 'user-123',
        team_members: ['user-123', 'user-456', 'user-789']
    },
    {
        id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        name: 'Mobile App Development',
        description: 'Native iOS and Android app for customer portal',
        status: 'active',
        priority: 'medium',
        completion_percentage: 40,
        start_date: '2025-06-15T00:00:00.000Z',
        end_date: '2025-08-30T00:00:00.000Z',
        task_breakdown: {
            completed: 5,
            in_progress: 4,
            pending: 6,
            blocked: 0,
            cancelled: 1
        },
        created_at: '2025-06-10T00:00:00.000Z',
        updated_at: '2025-06-30T00:00:00.000Z',
        created_by: 'user-456',
        team_members: ['user-456', 'user-789']
    },
    {
        id: 'c7d9f5e3-2a1b-4c8e-9f6d-3e8a7b5c4d2f',
        name: 'Database Migration',
        description: 'Migrate legacy database to PostgreSQL',
        status: 'completed',
        priority: 'high',
        completion_percentage: 100,
        start_date: '2025-05-01T00:00:00.000Z',
        end_date: '2025-05-31T00:00:00.000Z',
        task_breakdown: {
            completed: 15,
            in_progress: 0,
            pending: 0,
            blocked: 0,
            cancelled: 0
        },
        created_at: '2025-04-25T00:00:00.000Z',
        updated_at: '2025-05-31T00:00:00.000Z',
        created_by: 'user-123',
        team_members: ['user-123']
    }
];

const sampleTasks = [
    {
        id: 'task-001',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Design Homepage Mockup',
        description: 'Create initial mockup for new homepage design',
        status: 'completed',
        priority: 'high',
        assignee_id: 'user-456',
        due_date: '2025-06-10T00:00:00.000Z',
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-08T00:00:00.000Z',
        column: 'done',
        order: 1,
        labels: ['design', 'frontend'],
        estimated_hours: 8,
        actual_hours: 7
    },
    {
        id: 'task-002',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Implement Responsive Navigation',
        description: 'Build mobile-friendly navigation component',
        status: 'in_progress',
        priority: 'high',
        assignee_id: 'user-789',
        due_date: '2025-06-25T00:00:00.000Z',
        created_at: '2025-06-05T00:00:00.000Z',
        updated_at: '2025-06-20T00:00:00.000Z',
        column: 'in_progress',
        order: 1,
        labels: ['frontend', 'mobile'],
        estimated_hours: 16,
        actual_hours: 12
    },
    {
        id: 'task-003',
        project_id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        title: 'Setup CI/CD Pipeline',
        description: 'Configure automated build and deployment',
        status: 'pending',
        priority: 'medium',
        assignee_id: 'user-123',
        due_date: '2025-07-01T00:00:00.000Z',
        created_at: '2025-06-15T00:00:00.000Z',
        updated_at: '2025-06-15T00:00:00.000Z',
        column: 'todo',
        order: 1,
        labels: ['devops', 'infrastructure'],
        estimated_hours: 24,
        actual_hours: 0
    },
    {
        id: 'task-004',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'User Authentication Module',
        description: 'Implement JWT-based authentication',
        status: 'in_progress',
        priority: 'high',
        assignee_id: 'user-123',
        due_date: '2025-06-28T00:00:00.000Z',
        created_at: '2025-06-10T00:00:00.000Z',
        updated_at: '2025-06-25T00:00:00.000Z',
        column: 'in_progress',
        order: 2,
        labels: ['backend', 'security'],
        estimated_hours: 20,
        actual_hours: 15
    },
    {
        id: 'task-005',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Database Schema Design',
        description: 'Design and implement database schema',
        status: 'completed',
        priority: 'high',
        assignee_id: 'user-123',
        due_date: '2025-06-05T00:00:00.000Z',
        created_at: '2025-05-25T00:00:00.000Z',
        updated_at: '2025-06-03T00:00:00.000Z',
        column: 'done',
        order: 2,
        labels: ['backend', 'database'],
        estimated_hours: 12,
        actual_hours: 10
    },
    {
        id: 'task-006',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'API Documentation',
        description: 'Write comprehensive API documentation',
        status: 'pending',
        priority: 'medium',
        assignee_id: null,
        due_date: '2025-07-10T00:00:00.000Z',
        created_at: '2025-06-20T00:00:00.000Z',
        updated_at: '2025-06-20T00:00:00.000Z',
        column: 'todo',
        order: 2,
        labels: ['documentation'],
        estimated_hours: 8,
        actual_hours: 0
    },
    {
        id: 'task-007',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Performance Optimization',
        description: 'Optimize page load times and API response',
        status: 'blocked',
        priority: 'medium',
        assignee_id: 'user-456',
        due_date: '2025-07-05T00:00:00.000Z',
        created_at: '2025-06-18T00:00:00.000Z',
        updated_at: '2025-06-22T00:00:00.000Z',
        column: 'blocked',
        order: 1,
        labels: ['performance', 'optimization'],
        estimated_hours: 16,
        actual_hours: 4,
        blockedReason: 'Waiting for performance testing tools setup'
    }
];

// Kanban board columns configuration
const kanbanColumns = [
    { id: 'todo', title: 'To Do', order: 1, color: '#64748b' },
    { id: 'in_progress', title: 'In Progress', order: 2, color: '#3b82f6' },
    { id: 'review', title: 'Review', order: 3, color: '#f59e0b' },
    { id: 'blocked', title: 'Blocked', order: 4, color: '#ef4444' },
    { id: 'done', title: 'Done', order: 5, color: '#10b981' }
];

// Sample webhooks data
const sampleWebhooks = [
    {
        id: 'webhook-001',
        name: 'Slack Notifications',
        url: 'https://example.com/webhook/slack-demo',
        events: ['task.created', 'task.completed'],
        active: true,
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-01T00:00:00.000Z',
        description: 'Send notifications to #general channel when tasks are created or completed',
        secret: 'webhook-secret-123'
    },
    {
        id: 'webhook-002',
        name: 'Discord Bot',
        url: 'https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        events: ['project.created', 'project.completed'],
        active: false,
        created_at: '2025-06-10T00:00:00.000Z',
        updated_at: '2025-06-15T00:00:00.000Z',
        description: 'Discord webhook for project status updates',
        secret: 'webhook-secret-456'
    },
    {
        id: 'webhook-003',
        name: 'Teams Notifications',
        url: 'https://outlook.office.com/webhook/12345678-1234-1234-1234-123456789012@12345678-1234-1234-1234-123456789012/IncomingWebhook/1234567890abcdef',
        events: ['task.created', 'task.updated', 'task.completed'],
        active: true,
        created_at: '2025-06-20T00:00:00.000Z',
        updated_at: '2025-06-25T00:00:00.000Z',
        description: 'Microsoft Teams integration for task notifications',
        secret: 'webhook-secret-789'
    }
];

// Analytics data
const generateAnalytics = () => {
    const now = new Date();
    const last30Days = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        last30Days.push({
            date: dateStr,
            tasksCompleted: Math.floor(Math.random() * 5) + 1,
            tasksCreated: Math.floor(Math.random() * 6) + 2,
            activeUsers: Math.floor(Math.random() * 3) + 1
        });
    }
    
    return {
        overview: {
            totalProjects: sampleProjects.length,
            activeProjects: sampleProjects.filter(p => p.status === 'active').length,
            completedProjects: sampleProjects.filter(p => p.status === 'completed').length,
            totalTasks: sampleTasks.length,
            completedTasks: sampleTasks.filter(t => t.status === 'completed').length,
            averageCompletionTime: '5.2 days',
            teamVelocity: '12 tasks/week'
        },
        tasksByStatus: {
            todo: sampleTasks.filter(t => t.column === 'todo').length,
            in_progress: sampleTasks.filter(t => t.column === 'in_progress').length,
            review: sampleTasks.filter(t => t.column === 'review').length,
            blocked: sampleTasks.filter(t => t.column === 'blocked').length,
            done: sampleTasks.filter(t => t.column === 'done').length
        },
        tasksByPriority: {
            high: sampleTasks.filter(t => t.priority === 'high').length,
            medium: sampleTasks.filter(t => t.priority === 'medium').length,
            low: sampleTasks.filter(t => t.priority === 'low').length
        },
        projectProgress: sampleProjects.map(p => ({
            id: p.id,
            name: p.name,
            progress: p.completion_percentage,
            tasksCompleted: p.task_breakdown.completed,
            totalTasks: Object.values(p.task_breakdown).reduce((a, b) => a + b, 0)
        })),
        teamPerformance: [
            {
                userId: 'user-123',
                name: 'John Doe',
                tasksCompleted: 3,
                tasksInProgress: 1,
                averageCompletionTime: '4.5 days',
                productivity: 85
            },
            {
                userId: 'user-456',
                name: 'Jane Smith',
                tasksCompleted: 2,
                tasksInProgress: 1,
                averageCompletionTime: '6.2 days',
                productivity: 72
            },
            {
                userId: 'user-789',
                name: 'Bob Johnson',
                tasksCompleted: 1,
                tasksInProgress: 1,
                averageCompletionTime: '5.8 days',
                productivity: 78
            }
        ],
        burndownChart: {
            projectId: 'f62ecb12-41e5-4297-a441-b673147edf11',
            data: [
                { date: '2025-06-01', remaining: 14, ideal: 14 },
                { date: '2025-06-05', remaining: 12, ideal: 12 },
                { date: '2025-06-10', remaining: 10, ideal: 10 },
                { date: '2025-06-15', remaining: 9, ideal: 8 },
                { date: '2025-06-20', remaining: 7, ideal: 6 },
                { date: '2025-06-25', remaining: 6, ideal: 4 },
                { date: '2025-06-30', remaining: 6, ideal: 2 }
            ]
        },
        dailyActivity: last30Days
    };
};

// Public endpoints - no authentication required
app.get('/api/projects', (req, res) => {
    console.log('✅ Projects endpoint - returning all projects');
    res.json(sampleProjects);
});

app.get('/api/projects/:projectId', (req, res) => {
    const project = sampleProjects.find(p => p.id === req.params.projectId);
    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

app.get('/api/projects/:projectId/stats', (req, res) => {
    const project = sampleProjects.find(p => p.id === req.params.projectId);
    if (project) {
        res.json({
            statistics: {
                completion_rate: `${project.completion_percentage}%`,
                task_breakdown: project.task_breakdown,
                total_tasks: Object.values(project.task_breakdown).reduce((a, b) => a + b, 0),
                team_size: project.team_members.length
            },
            task_breakdown: project.task_breakdown
        });
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

app.get('/api/projects/:projectId/tasks', (req, res) => {
    const tasks = sampleTasks.filter(t => t.project_id === req.params.projectId);
    res.json(tasks);
});

// Kanban board endpoints
app.get('/api/kanban/columns', (req, res) => {
    res.json(kanbanColumns);
});

app.get('/api/kanban/board/:projectId', (req, res) => {
    const tasks = sampleTasks.filter(t => t.project_id === req.params.projectId);
    const board = {
        columns: kanbanColumns,
        tasks: tasks.map(task => ({
            ...task,
            assignee: task.assignee_id ? {
                id: task.assignee_id,
                name: task.assignee_id === 'user-123' ? 'John Doe' : 
                      task.assignee_id === 'user-456' ? 'Jane Smith' : 'Bob Johnson',
                avatar: `https://ui-avatars.com/api/?name=${task.assignee_id}`
            } : null
        }))
    };
    res.json(board);
});

app.put('/api/kanban/tasks/:taskId/move', (req, res) => {
    const { column, order } = req.body;
    const task = sampleTasks.find(t => t.id === req.params.taskId);
    if (task) {
        task.column = column;
        task.order = order;
        
        // Update status based on column
        if (column === 'done') task.status = 'completed';
        else if (column === 'in_progress' || column === 'review') task.status = 'in_progress';
        else if (column === 'blocked') task.status = 'blocked';
        else task.status = 'pending';
        
        task.updated_at = new Date().toISOString();
        res.json(task);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
    res.json(generateAnalytics());
});

app.get('/api/analytics/projects/:projectId', (req, res) => {
    const project = sampleProjects.find(p => p.id === req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectTasks = sampleTasks.filter(t => t.project_id === req.params.projectId);
    const analytics = {
        projectId: project.id,
        projectName: project.name,
        overview: {
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(t => t.status === 'completed').length,
            inProgressTasks: projectTasks.filter(t => t.status === 'in_progress').length,
            blockedTasks: projectTasks.filter(t => t.status === 'blocked').length,
            completionPercentage: project.completion_percentage,
            daysRemaining: Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24)),
            onTrack: project.completion_percentage >= 60
        },
        taskDistribution: {
            byStatus: {
                completed: projectTasks.filter(t => t.status === 'completed').length,
                in_progress: projectTasks.filter(t => t.status === 'in_progress').length,
                pending: projectTasks.filter(t => t.status === 'pending').length,
                blocked: projectTasks.filter(t => t.status === 'blocked').length
            },
            byAssignee: project.team_members.map(memberId => ({
                userId: memberId,
                name: memberId === 'user-123' ? 'John Doe' : 
                      memberId === 'user-456' ? 'Jane Smith' : 'Bob Johnson',
                taskCount: projectTasks.filter(t => t.assignee_id === memberId).length
            })),
            byLabel: ['frontend', 'backend', 'design', 'devops', 'documentation'].map(label => ({
                label,
                count: projectTasks.filter(t => t.labels && t.labels.includes(label)).length
            }))
        },
        timeTracking: {
            totalEstimatedHours: projectTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
            totalActualHours: projectTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0),
            efficiency: 85
        }
    };
    res.json(analytics);
});

app.get('/api/analytics/export', (req, res) => {
    res.json({
        formats: ['pdf', 'csv', 'excel'],
        reports: ['project_summary', 'task_details', 'team_performance', 'time_tracking']
    });
});

app.get('/api/tasks', (req, res) => {
    res.json(sampleTasks);
});

app.get('/api/workspaces', (req, res) => {
    res.json([{
        id: 'c4ddbddd-22b1-440b-9581-0875a8d57035',
        name: 'Default Workspace',
        created_at: '2025-01-01T00:00:00.000Z'
    }]);
});

app.get('/api/users', (req, res) => {
    res.json([
        {
            id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe'
        },
        {
            id: 'user-456',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'developer',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith'
        },
        {
            id: 'user-789',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'developer',
            avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson'
        }
    ]);
});

// WEBHOOK CRUD ENDPOINTS - Full real backend implementation

// GET all webhooks
app.get('/api/webhooks', (req, res) => {
    console.log('✅ Webhooks GET - returning all webhooks');
    res.json(sampleWebhooks);
});

// GET single webhook
app.get('/api/webhooks/:id', (req, res) => {
    const webhook = sampleWebhooks.find(w => w.id === req.params.id);
    if (webhook) {
        res.json(webhook);
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

// POST create new webhook
app.post('/api/webhooks', (req, res) => {
    console.log('✅ Webhooks POST - creating new webhook');
    const newWebhook = {
        id: `webhook-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        secret: `webhook-secret-${Date.now()}`
    };
    sampleWebhooks.push(newWebhook);
    res.status(201).json(newWebhook);
});

// PUT update webhook
app.put('/api/webhooks/:id', (req, res) => {
    console.log('✅ Webhooks PUT - updating webhook ');
    const index = sampleWebhooks.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
        sampleWebhooks[index] = {
            ...sampleWebhooks[index],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        res.json(sampleWebhooks[index]);
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

// PATCH update webhook (partial update)
app.patch('/api/webhooks/:id', (req, res) => {
    console.log('✅ Webhooks PATCH - updating webhook ');
    const index = sampleWebhooks.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
        sampleWebhooks[index] = {
            ...sampleWebhooks[index],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        res.json(sampleWebhooks[index]);
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

// DELETE webhook
app.delete('/api/webhooks/:id', (req, res) => {
    console.log('✅ Webhooks DELETE - deleting webhook ');
    const index = sampleWebhooks.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
        sampleWebhooks.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

// POST test webhook
app.post('/api/webhooks/:id/test', (req, res) => {
    console.log('✅ Webhooks TEST - testing webhook ');
    const webhook = sampleWebhooks.find(w => w.id === req.params.id);
    if (webhook) {
        res.json({
            success: true,
            message: `Test payload sent to ${webhook.name}`,
            webhook_id: webhook.id,
            url: webhook.url,
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

app.get('/api/webhook-templates', (req, res) => {
    res.json([
        {
            id: 'template-001',
            name: 'Task Completed',
            description: 'Notification when a task is marked as completed',
            template: '{{task.title}} has been completed by {{user.name}}'
        }
    ]);
});

app.get('/api/tasks/:taskId/subtasks', (req, res) => {
    res.json([]);
});

app.get('/api/mcp/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: ['projects', 'tasks', 'webhooks', 'users', 'workspaces', 'kanban', 'analytics']
    });
});

app.get('/api/notifications', (req, res) => {
    res.json([
        {
            id: 'notif-001',
            type: 'task_assigned',
            message: 'You have been assigned to "Design Homepage Mockup"',
            read: false,
            created_at: '2025-06-29T00:00:00.000Z'
        }
    ]);
});

app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        total_projects: sampleProjects.length,
        active_projects: sampleProjects.filter(p => p.status === 'active').length,
        completed_projects: sampleProjects.filter(p => p.status === 'completed').length,
        total_tasks: sampleTasks.length,
        my_tasks: sampleTasks.filter(t => t.assignee_id === 'user-123').length,
        overdue_tasks: 1,
        recent_activity: [
            {
                type: 'task_completed',
                message: 'Task "Design Homepage Mockup" completed',
                timestamp: '2025-06-30T12:00:00.000Z'
            }
        ]
    });
});

// Settings endpoint
app.get('/api/settings', (req, res) => {
    res.json({
        workspace: {
            name: 'Default Workspace',
            timezone: 'America/New_York',
            dateFormat: 'MM/DD/YYYY',
            weekStart: 'monday'
        },
        notifications: {
            email: true,
            desktop: true,
            mobile: false,
            taskAssigned: true,
            taskCompleted: true,
            projectUpdated: true
        },
        theme: {
            mode: 'light',
            primaryColor: '#3b82f6',
            accentColor: '#10b981'
        },
        integrations: {
            slack: { enabled: true, webhook: 'https://hooks.slack.com/...' },
            github: { enabled: false },
            jira: { enabled: false }
        }
    });
});

// Auth endpoints for login compatibility
app.post('/api/auth/login', (req, res) => {
    res.json({
        accessToken: 'sample-token-123',
        refreshToken: 'refresh-token-456',
        user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
            permissions: ['create_project', 'edit_project', 'delete_project', 'manage_users'],
            preferences: {
                theme: 'light',
                notifications: true,
                defaultView: 'kanban'
            }
        }
    });
});

app.get('/api/auth/me', (req, res) => {
    res.json({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['create_project', 'edit_project', 'delete_project', 'manage_users']
    });
});

app.post('/api/auth/refresh-token', (req, res) => {
    res.json({
        accessToken: 'new-token-789'
    });
});

// Create endpoints
app.post('/api/projects', (req, res) => {
    const newProject = {
        id: `proj-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        task_breakdown: {
            completed: 0,
            in_progress: 0,
            pending: 0,
            blocked: 0,
            cancelled: 0
        }
    };
    sampleProjects.push(newProject);
    res.status(201).json(newProject);
});

app.post('/api/tasks', (req, res) => {
    const newTask = {
        id: `task-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    sampleTasks.push(newTask);
    res.status(201).json(newTask);
});

// Task update endpoints
app.put('/api/tasks/:taskId', (req, res) => {
    console.log('✅ Tasks PUT - updating task ');
    const index = sampleTasks.findIndex(t => t.id === req.params.taskId);
    if (index !== -1) {
        sampleTasks[index] = {
            ...sampleTasks[index],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        res.json(sampleTasks[index]);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

app.patch('/api/tasks/:taskId', (req, res) => {
    console.log('✅ Tasks PATCH - updating task ');
    const index = sampleTasks.findIndex(t => t.id === req.params.taskId);
    if (index !== -1) {
        sampleTasks[index] = {
            ...sampleTasks[index],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        res.json(sampleTasks[index]);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

app.delete('/api/tasks/:taskId', (req, res) => {
    console.log('✅ Tasks DELETE - deleting task ');
    const index = sampleTasks.findIndex(t => t.id === req.params.taskId);
    if (index !== -1) {
        sampleTasks.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

// Update endpoints
app.put('/api/projects/:projectId', (req, res) => {
    const index = sampleProjects.findIndex(p => p.id === req.params.projectId);
    if (index !== -1) {
        sampleProjects[index] = {
            ...sampleProjects[index],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        res.json(sampleProjects[index]);
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

// Delete endpoints
app.delete('/api/projects/:projectId', (req, res) => {
    const index = sampleProjects.findIndex(p => p.id === req.params.projectId);
    if (index !== -1) {
        sampleProjects.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all for debugging
app.use((req, res) => {
    console.log('⚠️ Unhandled route: ');
    res.status(404).json({ 
        error: 'Not found', 
        path: req.path,
        method: req.method 
    });
});

app.listen(port, () => {
    console.log(`🚀 Complete ProjectHub backend running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`✨ Features: Projects, Tasks, Kanban Board, Analytics, Users, Webhooks, Notifications, Dashboard`);
    console.log(`📊 Kanban board: /api/kanban/board/:projectId`);
    console.log(`📈 Analytics: /api/analytics`);
});
// Override workspaces endpoint with complete data
app.get('/api/workspaces', (req, res) => {
    res.json([{
        id: 'c4ddbddd-22b1-440b-9581-0875a8d57035',
        name: 'Default Workspace',
        description: 'Main workspace for all projects',
        logo_url: '',
        subscription_tier: 'professional',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-06-30T00:00:00.000Z',
        owner_id: 'user-123',
        member_count: 3,
        project_count: 3,
        settings: {
            timezone: 'America/New_York',
            date_format: 'MM/DD/YYYY',
            week_start: 'monday'
        }
    }]);
});
