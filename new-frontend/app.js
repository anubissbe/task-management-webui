// ProjectHub Modern Frontend - Main Application Logic

const API_BASE = 'http://localhost:3009/api';

// API Service
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Authorization': 'Bearer sample-token-123',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer sample-token-123',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer sample-token-123',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer sample-token-123',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('API Error:', error);
            return false;
        }
    }
};

// Main Application
function projectHub() {
    return {
        // State
        currentView: 'dashboard',
        loading: false,
        error: null,
        
        // Modals
        showNewProjectModal: false,
        showNewTaskModal: false,
        showNewWebhookModal: false,
        
        // Form Data
        newProject: {
            name: '',
            description: '',
            status: 'planning'
        },
        
        newTask: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            assignee: ''
        },
        
        newWebhook: {
            name: '',
            url: '',
            events: [],
            active: true
        },
        
        // Data from API
        stats: {
            totalProjects: 0,
            activeTasks: 0,
            completedTasks: 0,
            teamMembers: 0
        },
        
        projects: [],
        tasks: [],
        webhooks: [],
        analytics: null,
        
        // Kanban columns with tasks
        kanbanColumns: [
            { id: 'todo', title: 'To Do', tasks: [] },
            { id: 'in-progress', title: 'In Progress', tasks: [] },
            { id: 'review', title: 'Review', tasks: [] },
            { id: 'blocked', title: 'Blocked', tasks: [] },
            { id: 'done', title: 'Done', tasks: [] }
        ],
        
        recentActivity: [],
        
        // Initialize
        async init() {
            console.log('🚀 ProjectHub initializing...');
            
            // Load initial data
            await this.loadDashboardData();
            
            // Watch for view changes
            this.$watch('currentView', async (value) => {
                switch(value) {
                    case 'dashboard':
                        await this.loadDashboardData();
                        break;
                    case 'projects':
                        await this.loadProjects();
                        break;
                    case 'kanban':
                        await this.loadKanbanData();
                        break;
                    case 'analytics':
                        await this.loadAnalytics();
                        this.$nextTick(() => this.initCharts());
                        break;
                    case 'webhooks':
                        await this.loadWebhooks();
                        break;
                }
            });
            
            console.log('✅ ProjectHub ready!');
        },
        
        // Load dashboard data
        async loadDashboardData() {
            this.loading = true;
            
            // Load projects for stats
            const projects = await api.get('/projects');
            if (projects) {
                this.projects = projects;
                this.stats.totalProjects = projects.length;
            }
            
            // Load tasks for stats
            const tasks = await api.get('/tasks');
            if (tasks) {
                this.tasks = tasks;
                this.stats.activeTasks = tasks.filter(t => t.status !== 'done').length;
                this.stats.completedTasks = tasks.filter(t => t.status === 'done').length;
            }
            
            // Generate recent activity
            this.generateRecentActivity();
            
            // Mock team members count
            this.stats.teamMembers = 8;
            
            this.loading = false;
        },
        
        // Load projects
        async loadProjects() {
            this.loading = true;
            const projects = await api.get('/projects');
            if (projects) {
                // Add mock data to projects
                this.projects = projects.map(p => ({
                    ...p,
                    progress: Math.floor(Math.random() * 100),
                    team: ['JD', 'SM', 'BJ'].slice(0, Math.floor(Math.random() * 3) + 1)
                }));
            }
            this.loading = false;
        },
        
        // Load kanban data
        async loadKanbanData() {
            this.loading = true;
            const tasks = await api.get('/tasks');
            if (tasks) {
                // Distribute tasks into columns
                this.kanbanColumns.forEach(col => col.tasks = []);
                
                tasks.forEach(task => {
                    const column = this.kanbanColumns.find(col => col.id === (task.status || 'todo'));
                    if (column) {
                        column.tasks.push({
                            ...task,
                            priority: task.priority || 'medium',
                            assignee: ['JD', 'SM', 'BJ', 'AK'][Math.floor(Math.random() * 4)]
                        });
                    }
                });
            }
            this.loading = false;
        },
        
        // Load analytics
        async loadAnalytics() {
            this.loading = true;
            const analytics = await api.get('/analytics');
            if (analytics) {
                this.analytics = analytics;
            }
            this.loading = false;
        },
        
        // Load webhooks
        async loadWebhooks() {
            this.loading = true;
            const webhooks = await api.get('/webhooks');
            if (webhooks) {
                this.webhooks = webhooks;
            }
            this.loading = false;
        },
        
        // Generate recent activity
        generateRecentActivity() {
            const activities = [
                { title: 'New task created in Website Redesign', time: '5 minutes ago', icon: 'fas fa-plus' },
                { title: 'Database Migration completed', time: '1 hour ago', icon: 'fas fa-check' },
                { title: 'John Doe joined Mobile App Development', time: '3 hours ago', icon: 'fas fa-user' },
                { title: 'API Documentation moved to Review', time: 'Yesterday', icon: 'fas fa-arrow-right' },
                { title: 'Sprint planning meeting scheduled', time: '2 days ago', icon: 'fas fa-calendar' }
            ];
            
            this.recentActivity = activities.map((a, i) => ({ ...a, id: i + 1 }));
        },
        
        // Create new project
        async createProject() {
            const result = await api.post('/projects', this.newProject);
            if (result) {
                await this.loadProjects();
                this.showNewProjectModal = false;
                this.newProject = { name: '', description: '', status: 'planning' };
                this.showNotification('Project created successfully!');
            }
        },
        
        // Create new task
        async createTask() {
            const result = await api.post('/tasks', this.newTask);
            if (result) {
                await this.loadKanbanData();
                this.showNewTaskModal = false;
                this.newTask = { title: '', description: '', status: 'todo', priority: 'medium', assignee: '' };
                this.showNotification('Task created successfully!');
            }
        },
        
        // Create new webhook
        async createWebhook() {
            const result = await api.post('/webhooks', this.newWebhook);
            if (result) {
                await this.loadWebhooks();
                this.showNewWebhookModal = false;
                this.newWebhook = { name: '', url: '', events: [], active: true };
                this.showNotification('Webhook created successfully!');
            }
        },
        
        // Show notification
        showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white animate-fadeIn z-50 ${
                type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },
        
        // Initialize charts
        initCharts() {
            // Use the analytics data if available, otherwise use mock data
            const projectData = this.projects.length > 0 ? 
                this.projects.map(p => p.progress || Math.floor(Math.random() * 100)) :
                [65, 45, 100, 30, 80];
            
            const taskData = this.kanbanColumns.map(col => col.tasks.length);
            
            // Project Progress Chart
            const ctx1 = document.getElementById('projectProgressChart');
            if (ctx1 && ctx1.getContext) {
                new Chart(ctx1.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: this.projects.slice(0, 5).map(p => p.name) || ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5'],
                        datasets: [{
                            label: 'Progress %',
                            data: projectData,
                            backgroundColor: 'rgba(255, 101, 0, 0.5)',
                            borderColor: 'rgba(255, 101, 0, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { 
                                beginAtZero: true, 
                                max: 100,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#9CA3AF' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
            
            // Task Distribution Chart
            const ctx2 = document.getElementById('taskDistributionChart');
            if (ctx2 && ctx2.getContext) {
                new Chart(ctx2.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['To Do', 'In Progress', 'Review', 'Blocked', 'Done'],
                        datasets: [{
                            data: taskData,
                            backgroundColor: [
                                'rgba(156, 163, 175, 0.5)',
                                'rgba(59, 130, 246, 0.5)',
                                'rgba(251, 191, 36, 0.5)',
                                'rgba(239, 68, 68, 0.5)',
                                'rgba(34, 197, 94, 0.5)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { 
                                position: 'bottom',
                                labels: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
            
            // Activity Timeline Chart
            const ctx3 = document.getElementById('activityTimelineChart');
            if (ctx3 && ctx3.getContext) {
                new Chart(ctx3.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Tasks Completed',
                            data: [5, 8, 12, 10, 15, 6, 3],
                            borderColor: 'rgba(255, 101, 0, 1)',
                            backgroundColor: 'rgba(255, 101, 0, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#9CA3AF' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
        },
        
        // Handle quick action button
        handleQuickAction() {
            switch(this.currentView) {
                case 'projects':
                    this.showNewProjectModal = true;
                    break;
                case 'kanban':
                    this.showNewTaskModal = true;
                    break;
                case 'webhooks':
                    this.showNewWebhookModal = true;
                    break;
                default:
                    window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        // Toggle webhook status
        async toggleWebhook(webhook) {
            webhook.active = !webhook.active;
            await api.put(`/webhooks/${webhook.id}`, webhook);
            this.showNotification(`Webhook ${webhook.active ? 'activated' : 'deactivated'}`);
        },
        
        // Delete webhook
        async deleteWebhook(webhook) {
            if (confirm('Are you sure you want to delete this webhook?')) {
                const result = await api.delete(`/webhooks/${webhook.id}`);
                if (result) {
                    await this.loadWebhooks();
                    this.showNotification('Webhook deleted successfully');
                }
            }
        }
    };
}