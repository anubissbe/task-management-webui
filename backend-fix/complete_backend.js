const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3010;

// CORS middleware - properly configured for all environments
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:8090',
            'http://localhost:8091',
            'http://localhost:8092',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:8090',
            'http://127.0.0.1:8091',
            'http://127.0.0.1:8092',
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
const sampleUsers = [
    {
        id: 'user-123',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@projecthub.com',
        password: '$2a$10$YourHashedPasswordHere', // In real app, use bcrypt
        role: 'admin',
        created_at: '2025-01-01T00:00:00.000Z',
        last_login: '2025-07-01T12:00:00.000Z',
        is_active: true
    },
    {
        id: 'user-456',
        first_name: 'John',
        last_name: 'Developer',
        email: 'john@projecthub.com',
        password: '$2a$10$YourHashedPasswordHere',
        role: 'developer',
        created_at: '2025-02-15T00:00:00.000Z',
        last_login: '2025-06-30T09:00:00.000Z',
        is_active: true
    },
    {
        id: 'user-789',
        first_name: 'Sarah',
        last_name: 'Manager',
        email: 'sarah@projecthub.com',
        password: '$2a$10$YourHashedPasswordHere',
        role: 'manager',
        created_at: '2025-03-20T00:00:00.000Z',
        last_login: '2025-06-29T14:30:00.000Z',
        is_active: true
    }
];

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
        assignee: 'JD',
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
        assignee: 'SM',
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
        assignee: 'JD',
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
        assignee: 'SM',
        due_date: '2025-06-18T00:00:00.000Z',
        created_at: '2025-06-10T00:00:00.000Z',
        updated_at: '2025-06-12T00:00:00.000Z',
        column: 'blocked',
        order: 1,
        labels: ['bug', 'frontend'],
        estimated_hours: 4,
        actual_hours: 2,
        blocked_reason: 'Waiting for design team approval'
    },
    // Additional tasks for better chart visualization
    {
        id: 'task-005',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Optimize Database Queries',
        description: 'Improve performance of slow queries',
        status: 'completed',
        priority: 'high',
        assignee: 'BJ',
        due_date: '2025-06-15T00:00:00.000Z',
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-14T00:00:00.000Z',
        estimated_hours: 20,
        actual_hours: 18
    },
    {
        id: 'task-006',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Write API Documentation',
        description: 'Document all REST API endpoints',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'AK',
        due_date: '2025-07-05T00:00:00.000Z',
        created_at: '2025-06-20T00:00:00.000Z',
        updated_at: '2025-06-28T00:00:00.000Z',
        estimated_hours: 16,
        actual_hours: 6
    },
    {
        id: 'task-007',
        project_id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        title: 'Implement Push Notifications',
        description: 'Add push notification support for mobile app',
        status: 'todo',
        priority: 'medium',
        assignee: 'JD',
        due_date: '2025-07-10T00:00:00.000Z',
        created_at: '2025-06-25T00:00:00.000Z',
        updated_at: '2025-06-25T00:00:00.000Z',
        estimated_hours: 24,
        actual_hours: 0
    },
    {
        id: 'task-008',
        project_id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        title: 'User Profile Management',
        description: 'Create user profile screens',
        status: 'completed',
        priority: 'high',
        assignee: 'SM',
        due_date: '2025-06-20T00:00:00.000Z',
        created_at: '2025-06-05T00:00:00.000Z',
        updated_at: '2025-06-19T00:00:00.000Z',
        estimated_hours: 16,
        actual_hours: 14
    },
    {
        id: 'task-009',
        project_id: 'c7d9f5e3-2a1b-4c8e-9f6d-3e8a7b5c4d2f',
        title: 'Data Migration Scripts',
        description: 'Write scripts to migrate legacy data',
        status: 'completed',
        priority: 'high',
        assignee: 'BJ',
        due_date: '2025-05-15T00:00:00.000Z',
        created_at: '2025-05-01T00:00:00.000Z',
        updated_at: '2025-05-14T00:00:00.000Z',
        estimated_hours: 40,
        actual_hours: 38
    },
    {
        id: 'task-010',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Setup CI/CD Pipeline',
        description: 'Configure automated deployment',
        status: 'review',
        priority: 'high',
        assignee: 'AK',
        due_date: '2025-07-01T00:00:00.000Z',
        created_at: '2025-06-15T00:00:00.000Z',
        updated_at: '2025-06-28T00:00:00.000Z',
        estimated_hours: 12,
        actual_hours: 10
    },
    {
        id: 'task-011',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Security Audit',
        description: 'Perform security assessment',
        status: 'todo',
        priority: 'high',
        assignee: 'BJ',
        due_date: '2025-07-15T00:00:00.000Z',
        created_at: '2025-06-28T00:00:00.000Z',
        updated_at: '2025-06-28T00:00:00.000Z',
        estimated_hours: 20,
        actual_hours: 0
    },
    {
        id: 'task-012',
        project_id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        title: 'App Store Submission',
        description: 'Prepare and submit to app stores',
        status: 'todo',
        priority: 'medium',
        assignee: 'AK',
        due_date: '2025-08-01T00:00:00.000Z',
        created_at: '2025-06-30T00:00:00.000Z',
        updated_at: '2025-06-30T00:00:00.000Z',
        estimated_hours: 8,
        actual_hours: 0
    },
    {
        id: 'task-013',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Performance Testing',
        description: 'Load testing for website',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'JD',
        due_date: '2025-07-05T00:00:00.000Z',
        created_at: '2025-06-25T00:00:00.000Z',
        updated_at: '2025-06-30T00:00:00.000Z',
        estimated_hours: 16,
        actual_hours: 4
    },
    {
        id: 'task-014',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'SEO Optimization',
        description: 'Improve search engine rankings',
        status: 'completed',
        priority: 'low',
        assignee: 'SM',
        due_date: '2025-06-25T00:00:00.000Z',
        created_at: '2025-06-10T00:00:00.000Z',
        updated_at: '2025-06-24T00:00:00.000Z',
        estimated_hours: 12,
        actual_hours: 10
    },
    {
        id: 'task-015',
        project_id: '8a5e3b21-7c4f-4d89-b234-5f8c9e2d1a6b',
        title: 'Beta Testing Program',
        description: 'Organize beta testing with users',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'AK',
        due_date: '2025-07-20T00:00:00.000Z',
        created_at: '2025-06-28T00:00:00.000Z',
        updated_at: '2025-06-30T00:00:00.000Z',
        estimated_hours: 20,
        actual_hours: 3
    },
    {
        id: 'task-016',
        project_id: 'f62ecb12-41e5-4297-a441-b673147edf11',
        title: 'Analytics Integration',
        description: 'Add Google Analytics tracking',
        status: 'completed',
        priority: 'low',
        assignee: 'BJ',
        due_date: '2025-06-15T00:00:00.000Z',
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-14T00:00:00.000Z',
        estimated_hours: 8,
        actual_hours: 6
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

// Get tasks for a specific project
app.get('/api/projects/:id/tasks', (req, res) => {
    const projectId = req.params.id;
    const projectTasks = sampleTasks.filter(task => task.project_id === projectId);
    res.json(projectTasks);
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

// Update task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const taskIndex = sampleTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        sampleTasks[taskIndex] = {
            ...sampleTasks[taskIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        res.json(sampleTasks[taskIndex]);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const taskIndex = sampleTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        sampleTasks.splice(taskIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
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

// Update webhook
app.put('/api/webhooks/:id', (req, res) => {
    const webhookId = req.params.id;
    const webhookIndex = sampleWebhooks.findIndex(w => w.id === webhookId);
    if (webhookIndex !== -1) {
        sampleWebhooks[webhookIndex] = {
            ...sampleWebhooks[webhookIndex],
            ...req.body,
            id: webhookId // Preserve the ID
        };
        res.json(sampleWebhooks[webhookIndex]);
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

// User Management Endpoints (Admin only - in production, add authentication middleware)
app.get('/api/users', (req, res) => {
    // In production, check if user is admin
    // For demo, return users without passwords
    const usersWithoutPasswords = sampleUsers.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
});

app.get('/api/users/:id', (req, res) => {
    const user = sampleUsers.find(u => u.id === req.params.id);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.post('/api/users', (req, res) => {
    // In production: validate admin role, hash password with bcrypt
    const newUser = {
        id: `user-${Date.now()}`,
        ...req.body,
        password: '$2a$10$HashedPasswordHere', // In real app, hash the password
        created_at: new Date().toISOString(),
        last_login: null,
        is_active: true
    };
    
    // Check if email already exists
    if (sampleUsers.some(u => u.email === newUser.email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    
    sampleUsers.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

app.put('/api/users/:id', (req, res) => {
    // In production: validate admin role
    const index = sampleUsers.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        // If password is provided, it should be hashed
        const updatedData = { ...req.body };
        if (updatedData.password) {
            updatedData.password = '$2a$10$NewHashedPasswordHere';
        }
        
        sampleUsers[index] = { 
            ...sampleUsers[index], 
            ...updatedData,
            updated_at: new Date().toISOString()
        };
        
        const { password, ...userWithoutPassword } = sampleUsers[index];
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    // In production: validate admin role, prevent self-deletion
    const index = sampleUsers.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        // Check if trying to delete the last admin
        const user = sampleUsers[index];
        const adminCount = sampleUsers.filter(u => u.role === 'admin').length;
        
        if (user.role === 'admin' && adminCount === 1) {
            return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }
        
        sampleUsers.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'User not found' });
    }
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