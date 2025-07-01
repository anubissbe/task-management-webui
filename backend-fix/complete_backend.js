const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// CORS middleware - properly configured for all environments
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:8090',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:8090',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:3000'
        ];
        
        // Check if the origin includes an IP address (for production deployments)
        if (/^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Log rejected origin for debugging
        console.log('CORS rejected origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
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
        status: 'in-progress',
        priority: 'high',
        assignee_id: 'user-789',
        due_date: '2025-06-20T00:00:00.000Z',
        created_at: '2025-06-05T00:00:00.000Z',
        updated_at: '2025-06-15T00:00:00.000Z',
        column: 'in-progress',
        order: 1,
        labels: ['frontend', 'mobile'],
        estimated_hours: 12,
        actual_hours: 5
    },
    {
        id: 'task-003',
        project_id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        title: 'Setup Authentication Flow',
        description: 'Implement OAuth2 authentication for mobile app',
        status: 'todo',
        priority: 'high',
        assignee_id: 'user-456',
        due_date: '2025-07-01T00:00:00.000Z',
        created_at: '2025-06-15T00:00:00.000Z',
        updated_at: '2025-06-15T00:00:00.000Z',
        column: 'todo',
        order: 1,
        labels: ['backend', 'security'],
        estimated_hours: 16,
        actual_hours: 0
    },
    {
        id: 'task-004',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Fix Header Alignment Issues',
        description: 'Header elements not properly aligned on mobile devices',
        status: 'blocked',
        priority: 'medium',
        assignee_id: 'user-789',
        due_date: '2025-06-18T00:00:00.000Z',
        created_at: '2025-06-10T00:00:00.000Z',
        updated_at: '2025-06-12T00:00:00.000Z',
        column: 'blocked',
        order: 1,
        labels: ['bug', 'frontend'],
        estimated_hours: 4,
        actual_hours: 2,
        blocked_reason: 'Waiting for design team approval'
    }
];

const sampleWebhooks = [
    {
        id: 'webhook-001',
        name: 'Slack Notifications',
        url: 'https://hooks.slack.com/services/EXAMPLE',
        events: ['task.created', 'task.completed', 'project.completed'],
        active: true,
        secret: 'webhook_secret_123',
        created_at: '2025-05-01T00:00:00.000Z',
        last_triggered: '2025-06-30T12:00:00.000Z'
    },
    {
        id: 'webhook-002',
        name: 'CI/CD Pipeline Trigger',
        url: 'https://api.github.com/repos/example/hooks',
        events: ['project.deployment.ready'],
        active: false,
        secret: 'webhook_secret_456',
        created_at: '2025-05-15T00:00:00.000Z',
        last_triggered: null
    }
];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/projects', (req, res) => {
    res.json(sampleProjects);
});

app.get('/api/projects/:id', (req, res) => {
    const project = sampleProjects.find(p => p.id === req.params.id);
    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

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

app.get('/api/tasks', (req, res) => {
    res.json(sampleTasks);
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

app.get('/api/webhooks', (req, res) => {
    res.json(sampleWebhooks);
});

app.post('/api/webhooks', (req, res) => {
    const newWebhook = {
        id: `webhook-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString(),
        last_triggered: null
    };
    sampleWebhooks.push(newWebhook);
    res.status(201).json(newWebhook);
});

app.put('/api/webhooks/:id', (req, res) => {
    const index = sampleWebhooks.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
        sampleWebhooks[index] = { ...sampleWebhooks[index], ...req.body };
        res.json(sampleWebhooks[index]);
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

app.delete('/api/webhooks/:id', (req, res) => {
    const index = sampleWebhooks.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
        sampleWebhooks.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    const analytics = {
        totalProjects: sampleProjects.length,
        totalTasks: sampleTasks.length,
        completedTasks: sampleTasks.filter(t => t.status === 'completed').length,
        activeTasks: sampleTasks.filter(t => t.status !== 'completed').length,
        projectsByStatus: {
            planning: sampleProjects.filter(p => p.status === 'planning').length,
            active: sampleProjects.filter(p => p.status === 'active').length,
            completed: sampleProjects.filter(p => p.status === 'completed').length,
            'on-hold': sampleProjects.filter(p => p.status === 'on-hold').length
        },
        tasksByPriority: {
            high: sampleTasks.filter(t => t.priority === 'high').length,
            medium: sampleTasks.filter(t => t.priority === 'medium').length,
            low: sampleTasks.filter(t => t.priority === 'low').length
        },
        taskCompletionTimeline: [
            { date: '2025-06-25', completed: 5 },
            { date: '2025-06-26', completed: 8 },
            { date: '2025-06-27', completed: 12 },
            { date: '2025-06-28', completed: 10 },
            { date: '2025-06-29', completed: 15 },
            { date: '2025-06-30', completed: 6 },
            { date: '2025-07-01', completed: 3 }
        ]
    };
    res.json(analytics);
});

// Kanban board endpoint
app.get('/api/kanban/board/:projectId', (req, res) => {
    const projectTasks = sampleTasks.filter(t => t.project_id === req.params.projectId);
    const board = {
        columns: [
            { id: 'todo', title: 'To Do', tasks: projectTasks.filter(t => t.status === 'todo') },
            { id: 'in-progress', title: 'In Progress', tasks: projectTasks.filter(t => t.status === 'in-progress') },
            { id: 'review', title: 'Review', tasks: projectTasks.filter(t => t.status === 'review') },
            { id: 'blocked', title: 'Blocked', tasks: projectTasks.filter(t => t.status === 'blocked') },
            { id: 'done', title: 'Done', tasks: projectTasks.filter(t => t.status === 'completed') }
        ]
    };
    res.json(board);
});

// Dashboard summary endpoint
app.get('/api/dashboard', (req, res) => {
    const summary = {
        stats: {
            totalProjects: sampleProjects.length,
            activeProjects: sampleProjects.filter(p => p.status === 'active').length,
            totalTasks: sampleTasks.length,
            completedTasks: sampleTasks.filter(t => t.status === 'completed').length,
            teamMembers: 8
        },
        recentProjects: sampleProjects.slice(0, 3),
        upcomingTasks: sampleTasks
            .filter(t => t.status !== 'completed')
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5),
        recentActivity: [
            { id: 1, title: 'New task created in Website Redesign', time: '5 minutes ago', icon: 'fas fa-plus' },
            { id: 2, title: 'Database Migration completed', time: '1 hour ago', icon: 'fas fa-check' },
            { id: 3, title: 'John Doe joined Mobile App Development', time: '3 hours ago', icon: 'fas fa-user' }
        ]
    };
    res.json(summary);
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Complete ProjectHub backend running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`✨ Features: Projects, Tasks, Kanban Board, Analytics, Users, Webhooks, Notifications, Dashboard`);
    console.log(`📊 Kanban board: /api/kanban/board/:projectId`);
    console.log(`📈 Analytics: /api/analytics`);
});