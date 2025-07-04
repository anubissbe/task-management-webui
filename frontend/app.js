// ProjectHub Modern Frontend - Main Application Logic

// Dynamic API base - works for both local and deployed environments
const API_BASE = (() => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Check if we're using the nginx proxy
    if (window.location.pathname.startsWith('/api')) {
        return '/api';
    }
    
    // Default to direct backend connection
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3009/api';
    } else {
        // Use backend port for production deployments
        return `${protocol}//${host}:3009/api`;
    }
})();

// API Service
const api = {
    async get(endpoint) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE}${endpoint}`, { headers });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async post(endpoint, data) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers,
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
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers,
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
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE',
                headers
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
        globalLoading: false,
        error: null,
        
        // Authentication
        isAuthenticated: false, // Start as not authenticated
        loginError: null,
        loginLoading: false,
        loginForm: {
            email: '',
            password: ''
        },
        
        // UI State
        darkMode: false,
        user: null, // Start with no user
        
        // Project State
        selectedProject: null,
        selectedProjectView: 'list',
        projectSearch: '',
        projectFilter: {
            status: 'all'
        },
        
        // Board State
        selectedBoardProject: null,
        taskStatuses: ['todo', 'in-progress', 'review', 'done', 'blocked', 'cancelled'],
        
        // Workspace State
        currentWorkspace: 'default',
        workspaces: [
            { id: 'default', name: 'Default Workspace' }
        ],
        
        // Toast Store (for Alpine.js store)
        toasts: {
            items: [],
            add(message, type = 'success') {
                const toast = {
                    message,
                    type,
                    visible: true
                };
                this.items.push(toast);
                setTimeout(() => {
                    toast.visible = false;
                    setTimeout(() => {
                        this.items = this.items.filter(t => t !== toast);
                    }, 300);
                }, 3000);
            },
            remove(index) {
                this.items.splice(index, 1);
            }
        },
        
        // Modals
        showNewProjectModal: false,
        showCreateProjectModal: false,
        showNewTaskModal: false,
        showCreateTaskModal: false,
        showEditTaskModal: false,
        editingTask: {},
        showNewWebhookModal: false,
        showCreateWebhookModal: false,
        showEditWebhookModal: false,
        editingWebhook: {},
        showUserModal: false,
        showEditUserModal: false,
        editingUser: {},
        
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
        
        newUser: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            role: 'user'
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
        users: [],
        analytics: {
            totalProjects: 0,
            totalTasks: 0,
            completedTasks: 0,
            activeTasks: 0,
            projectsByStatus: {},
            tasksByPriority: {},
            taskCompletionTimeline: [],
            avgCompletionTime: '2.5 days',
            overdueTasks: 3,
            productivityScore: '87%',
            teamPerformance: {},
            projectVelocity: [],
            workloadDistribution: {},
            completionRate: []
        },
        
        // Kanban columns with tasks
        kanbanColumns: [
            { id: 'todo', title: 'To Do', tasks: [] },
            { id: 'in-progress', title: 'In Progress', tasks: [] },
            { id: 'review', title: 'Review', tasks: [] },
            { id: 'blocked', title: 'Blocked', tasks: [] },
            { id: 'done', title: 'Done', tasks: [] }
        ],
        
        recentActivity: [],
        charts: {},
        chartsInitializing: false,
        
        // Computed Properties
        get filteredProjects() {
            let filtered = this.projects;
            
            // Filter by search
            if (this.projectSearch) {
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(this.projectSearch.toLowerCase()) ||
                    p.description.toLowerCase().includes(this.projectSearch.toLowerCase())
                );
            }
            
            // Filter by status
            if (this.projectFilter.status !== 'all') {
                filtered = filtered.filter(p => p.status === this.projectFilter.status);
            }
            
            return filtered;
        },
        
        // Methods
        getProjectTasks(projectId) {
            return this.tasks.filter(task => task.project_id === projectId);
        },
        
        getProjectStatusClass(status) {
            const classes = {
                'planning': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
                'active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
                'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
                'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            };
            return classes[status] || classes['planning'];
        },
        
        switchWorkspace() {
            // Placeholder for workspace switching
            console.log('Switching workspace to:', this.currentWorkspace);
        },
        
        getTasksByStatus(status) {
            // For kanban board - get tasks by status
            const column = this.kanbanColumns.find(col => col.id === status);
            return column ? column.tasks : [];
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 1) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        },
        
        // Initialize
        async init() {
            console.log('🚀 ProjectHub initializing...');
            
            // Check for stored authentication
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('currentUser');
            
            if (storedToken && storedUser) {
                try {
                    this.user = JSON.parse(storedUser);
                    this.isAuthenticated = true;
                    this.isAdmin = this.user.role === 'admin';
                    console.log('✅ Restored authentication for:', this.user.email, 'role:', this.user.role);
                    
                    // Force reactive update to ensure Alpine.js state is properly synced
                    this.$nextTick(() => {
                        console.log('🔄 Authentication state synced');
                    });
                } catch (e) {
                    console.error('Failed to restore auth:', e);
                    localStorage.clear();
                    this.isAuthenticated = false;
                    this.user = null;
                }
            } else {
                // No stored auth
                this.isAuthenticated = false;
                this.user = null;
            }
            
            // Only load data if authenticated
            if (this.isAuthenticated) {
                await this.loadDashboardData();
            }
            
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
                        // Ensure tasks and projects are loaded for analytics calculations
                        if (this.tasks.length === 0) {
                            await api.get('/tasks').then(tasks => {
                                if (tasks) this.tasks = tasks;
                            });
                        }
                        if (this.projects.length === 0) {
                            await api.get('/projects').then(projects => {
                                if (projects) this.projects = projects;
                            });
                        }
                        await this.loadAnalytics();
                        // Clear any existing timeout
                        if (this.chartsTimeout) {
                            clearTimeout(this.chartsTimeout);
                        }
                        // Add a small delay to ensure DOM is fully ready
                        this.$nextTick(() => {
                            this.chartsTimeout = setTimeout(() => {
                                this.initCharts();
                            }, 200);
                        });
                        break;
                    case 'webhooks':
                        await this.loadWebhooks();
                        break;
                    case 'users':
                        if (this.user.role === 'admin') {
                            await this.loadUsers();
                        }
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
                this.analytics.totalProjects = projects.length;
            }
            
            // Load tasks for stats
            const tasks = await api.get('/tasks');
            if (tasks) {
                this.tasks = tasks;
                this.stats.activeTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'completed').length;
                this.stats.completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
                
                // Update analytics object too
                this.analytics.totalTasks = tasks.length;
                this.analytics.activeTasks = this.stats.activeTasks;
                this.analytics.completedTasks = this.stats.completedTasks;
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
                    // Map backend status to frontend column IDs
                    let columnId = task.status || 'todo';
                    if (columnId === 'pending') columnId = 'todo';
                    if (columnId === 'in_progress') columnId = 'in-progress';
                    if (columnId === 'completed') columnId = 'done';
                    
                    const column = this.kanbanColumns.find(col => col.id === columnId);
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
            
            // Initialize drag and drop after DOM update
            this.$nextTick(() => {
                this.initSortable();
            });
        },
        
        // Initialize drag and drop for kanban board
        initSortable() {
            const columns = document.querySelectorAll('.kanban-column');
            columns.forEach(column => {
                if (column._sortable) {
                    column._sortable.destroy();
                }
                
                column._sortable = new Sortable(column, {
                    group: 'kanban',
                    animation: 150,
                    ghostClass: 'opacity-50',
                    dragClass: 'dragging',
                    handle: '.kanban-task',
                    onEnd: async (evt) => {
                        const taskElement = evt.item;
                        const taskId = taskElement.dataset.taskId;
                        const oldStatus = evt.from.dataset.status;
                        const newStatus = evt.to.dataset.status;
                        
                        if (oldStatus !== newStatus) {
                            // Map frontend status to backend status
                            let backendStatus = newStatus;
                            if (newStatus === 'todo') backendStatus = 'pending';
                            if (newStatus === 'in-progress') backendStatus = 'in_progress';
                            if (newStatus === 'done') backendStatus = 'completed';
                            
                            // Update task status in backend
                            const result = await api.put(`/tasks/${taskId}`, { status: backendStatus });
                            if (result) {
                                this.showNotification('Task moved successfully!');
                                // Reload to ensure consistency
                                await this.loadKanbanData();
                            } else {
                                // Revert on failure
                                evt.from.appendChild(evt.item);
                                this.showNotification('Failed to move task', 'error');
                            }
                        }
                    }
                });
            });
        },
        
        // Load analytics
        async loadAnalytics() {
            this.loading = true;
            const analytics = await api.get('/analytics');
            if (analytics) {
                // Merge with existing analytics to preserve calculated fields
                this.analytics = { ...this.analytics, ...analytics };
            }
            
            // Ensure basic counts are set
            this.analytics.totalProjects = this.projects.length;
            this.analytics.totalTasks = this.tasks.length;
            this.analytics.completedTasks = this.tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
            this.analytics.activeTasks = this.tasks.filter(t => t.status !== 'completed' && t.status !== 'done').length;
            
            // Calculate additional metrics
            if (this.tasks.length > 0) {
                // Calculate average completion time
                const completedTasks = this.tasks.filter(t => t.status === 'completed' || t.status === 'done');
                if (completedTasks.length > 0) {
                    // Calculate actual average completion time
                    let totalDays = 0;
                    let validTasks = 0;
                    
                    completedTasks.forEach(task => {
                        if (task.created_at && task.updated_at) {
                            const created = new Date(task.created_at);
                            const updated = new Date(task.updated_at);
                            const days = (updated - created) / (1000 * 60 * 60 * 24);
                            if (days >= 0) {
                                totalDays += days;
                                validTasks++;
                            }
                        }
                    });
                    
                    if (validTasks > 0) {
                        const avgDays = totalDays / validTasks;
                        if (avgDays < 1) {
                            this.analytics.avgCompletionTime = Math.round(avgDays * 24) + ' hours';
                        } else {
                            this.analytics.avgCompletionTime = avgDays.toFixed(1) + ' days';
                        }
                    } else {
                        this.analytics.avgCompletionTime = 'N/A';
                    }
                } else {
                    this.analytics.avgCompletionTime = 'N/A';
                }
                
                // Count overdue tasks (none have due dates, so 0)
                const now = new Date();
                this.analytics.overdueTasks = this.tasks.filter(t => {
                    return t.due_date && new Date(t.due_date) < now && t.status !== 'completed' && t.status !== 'done';
                }).length;
                
                // If no overdue tasks, set to 0 instead of showing mock data
                if (this.analytics.overdueTasks === 0) {
                    this.analytics.overdueTasks = 0; // Explicitly set to 0
                }
                
                // Calculate productivity score (completed vs total in last 30 days)
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                const recentTasks = this.tasks.filter(t => new Date(t.created_at) > thirtyDaysAgo);
                const recentCompleted = recentTasks.filter(t => t.status === 'completed' || t.status === 'done').length;
                const productivityPercentage = recentTasks.length > 0 
                    ? Math.round((recentCompleted / recentTasks.length) * 100) 
                    : 0;
                this.analytics.productivityScore = productivityPercentage + '%';
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
        
        // Select project
        selectProject(project) {
            this.selectedProject = project;
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
        
        // Delete project
        async deleteProject(project) {
            if (!project) return;
            
            const taskCount = project.total_tasks || 0;
            const confirmMessage = taskCount > 0 
                ? `Are you sure you want to delete "${project.name}"? This will also delete ${taskCount} associated task(s).`
                : `Are you sure you want to delete "${project.name}"?`;
            
            if (confirm(confirmMessage)) {
                const result = await api.delete(`/projects/${project.id}`);
                if (result !== null) {
                    // Go back to projects list
                    this.selectedProject = null;
                    await this.loadProjects();
                    this.showNotification('Project deleted successfully!');
                } else {
                    this.showNotification('Failed to delete project', 'error');
                }
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
        
        // Edit task
        editTask(task) {
            if (!task) return;
            this.editingTask = { ...task };
            // Map backend status to frontend status for editing
            if (this.editingTask.status === 'pending') this.editingTask.status = 'todo';
            if (this.editingTask.status === 'in_progress') this.editingTask.status = 'in-progress';
            if (this.editingTask.status === 'completed') this.editingTask.status = 'done';
            this.showEditTaskModal = true;
        },
        
        // Update task
        async updateTask() {
            if (!this.editingTask || !this.editingTask.id) return;
            
            // Map frontend status to backend status before sending
            const taskToUpdate = { ...this.editingTask };
            if (taskToUpdate.status === 'todo') taskToUpdate.status = 'pending';
            if (taskToUpdate.status === 'in-progress') taskToUpdate.status = 'in_progress';
            if (taskToUpdate.status === 'done') taskToUpdate.status = 'completed';
            
            const result = await api.put(`/tasks/${this.editingTask.id}`, taskToUpdate);
            if (result) {
                await this.loadKanbanData();
                this.showEditTaskModal = false;
                this.editingTask = {};
                this.showNotification('Task updated successfully!');
            }
        },
        
        // Delete task
        async deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this task?')) {
                const result = await api.delete(`/tasks/${taskId}`);
                if (result) {
                    await this.loadKanbanData();
                    this.showNotification('Task deleted successfully!');
                }
            }
        },
        
        // Load board tasks for selected project
        async loadBoardTasks() {
            if (!this.selectedBoardProject) return;
            
            try {
                const tasks = await api.get(`/tasks?projectId=${this.selectedBoardProject}`);
                
                // Update tasks for the selected project
                this.tasks = [
                    ...this.tasks.filter(t => t.project_id !== this.selectedBoardProject),
                    ...tasks
                ];
                
                this.loadKanbanData();
            } catch (error) {
                console.error('Error loading board tasks:', error);
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
        
        // Edit webhook
        editWebhook(webhook) {
            this.editingWebhook = { ...webhook };
            this.showEditWebhookModal = true;
        },
        
        // Update webhook
        async updateWebhook() {
            const result = await api.put(`/webhooks/${this.editingWebhook.id}`, this.editingWebhook);
            if (result) {
                await this.loadWebhooks();
                this.showEditWebhookModal = false;
                this.editingWebhook = null;
                this.showNotification('Webhook updated successfully!');
            }
        },
        
        // Test webhook
        async testWebhook(webhook) {
            // Test webhook through backend API to avoid CORS issues
            try {
                const result = await api.post(`/webhooks/${webhook.id}/test`);
                
                if (result.success) {
                    this.showNotification('Webhook test successful! Check your Slack channel.', 'success');
                } else {
                    this.showNotification(`Webhook test failed: ${result.error || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                this.showNotification(`Webhook test failed: ${error.message}`, 'error');
            }
        },
        
        // Login function
        async login() {
            this.loginLoading = true;
            this.loginError = null;
            
            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.loginForm)
                });
                
                const data = await response.json();
                
                if (response.ok && data.token) {
                    // Save auth data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    // Update app state
                    this.user = data.user;
                    this.isAuthenticated = true;
                    this.isAdmin = data.user.role === 'admin';
                    
                    // Clear form
                    this.loginForm.email = '';
                    this.loginForm.password = '';
                    
                    // Load data
                    await this.loadDashboardData();
                    
                    this.showNotification('Login successful!', 'success');
                } else {
                    this.loginError = data.error || 'Login failed';
                }
            } catch (error) {
                console.error('Login error:', error);
                this.loginError = 'Failed to connect to server';
            } finally {
                this.loginLoading = false;
            }
        },
        
        // Logout function
        async logout() {
            try {
                // Get the token
                const token = localStorage.getItem('token') || 'sample-token-123';
                
                // Call backend logout endpoint
                const response = await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Log the response for debugging
                if (!response.ok) {
                    console.warn('Logout API response:', response.status);
                }
                
                // Clear all auth data from localStorage
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                
                // Clear session storage too
                sessionStorage.clear();
                
                // Reset user state
                this.currentUser = null;
                this.isAdmin = false;
                this.projects = [];
                this.tasks = [];
                
                // Show notification
                this.showNotification('Logged out successfully!');
                
                // Force reload to clear all state
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } catch (error) {
                console.error('Logout error:', error);
                
                // Even if API fails, clear local data
                localStorage.clear();
                sessionStorage.clear();
                
                // Force reload
                window.location.reload();
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
            console.log('initCharts called');
            console.log('Tasks:', this.tasks);
            console.log('Projects:', this.projects);
            
            // Prevent multiple initialization
            if (this.chartsInitializing) {
                console.log('Charts already initializing, skipping...');
                return;
            }
            this.chartsInitializing = true;
            
            // Destroy ALL existing charts properly
            const canvasElements = [
                'projectStatusChart', 'taskPriorityChart', 'taskTimelineChart',
                'teamPerformanceChart', 'projectVelocityChart', 'workloadChart', 
                'completionRateChart'
            ];
            
            canvasElements.forEach(id => {
                const canvas = document.getElementById(id);
                if (canvas) {
                    const existingChart = Chart.getChart(canvas);
                    if (existingChart) {
                        existingChart.destroy();
                    }
                }
            });
            
            this.charts = {};
            
            // Calculate analytics data - convert proxy to array
            const projects = [...this.projects];
            const tasks = [...this.tasks];
            
            console.log('Tasks array length:', tasks.length);
            console.log('First task:', tasks[0]);
            
            const projectStatusData = {
                active: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
                completed: projects.filter(p => p.status === 'completed').length,
                on_hold: projects.filter(p => p.status === 'on_hold' || p.status === 'on-hold').length,
                planning: projects.filter(p => p.status === 'planning').length
            };
            
            const taskPriorityData = {
                high: tasks.filter(t => t.priority === 'high').length,
                medium: tasks.filter(t => t.priority === 'medium').length,
                low: tasks.filter(t => t.priority === 'low').length
            };
            
            // Project Status Chart
            const ctx1 = document.getElementById('projectStatusChart');
            if (ctx1 && ctx1.getContext) {
                try {
                    this.charts.projectStatus = new Chart(ctx1.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Active', 'Completed', 'On Hold', 'Planning'],
                        datasets: [{
                            data: [projectStatusData.active, projectStatusData.completed, projectStatusData.on_hold, projectStatusData.planning],
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',  // Blue for active
                                'rgba(34, 197, 94, 0.8)',   // Green for completed
                                'rgba(251, 191, 36, 0.8)',  // Yellow for on hold
                                'rgba(156, 163, 175, 0.8)'  // Gray for planning
                            ],
                            borderColor: [
                                'rgba(59, 130, 246, 1)',
                                'rgba(34, 197, 94, 1)',
                                'rgba(251, 191, 36, 1)',
                                'rgba(156, 163, 175, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { 
                                    color: '#9CA3AF',
                                    padding: 20,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                                    }
                                }
                            }
                        }
                    }
                });
                } catch (error) {
                    console.error('Error creating Project Status Chart:', error);
                }
            }
            
            // Task Priority Chart
            const ctx2 = document.getElementById('taskPriorityChart');
            if (ctx2 && ctx2.getContext) {
                this.charts.taskPriority = new Chart(ctx2.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['High Priority', 'Medium Priority', 'Low Priority'],
                        datasets: [{
                            label: 'Tasks by Priority',
                            data: [taskPriorityData.high, taskPriorityData.medium, taskPriorityData.low],
                            backgroundColor: [
                                'rgba(239, 68, 68, 0.8)',   // Red for high
                                'rgba(251, 191, 36, 0.8)',  // Yellow for medium
                                'rgba(34, 197, 94, 0.8)'    // Green for low
                            ],
                            borderColor: [
                                'rgba(239, 68, 68, 1)',
                                'rgba(251, 191, 36, 1)',
                                'rgba(34, 197, 94, 1)'
                            ],
                            borderWidth: 2,
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.parsed.y + ' tasks';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: { 
                                beginAtZero: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { 
                                    color: '#9CA3AF',
                                    stepSize: 1
                                }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
            
            // Task Timeline Chart (showing tasks created over last 7 days)
            const ctx3 = document.getElementById('taskTimelineChart');
            if (ctx3 && ctx3.getContext) {
                // Generate last 7 days labels and count tasks
                const labels = [];
                const data = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
                    
                    // Count tasks created on this date
                    const tasksOnDate = tasks.filter(t => {
                        const taskDate = new Date(t.created_at).toISOString().split('T')[0];
                        return taskDate === dateStr;
                    }).length;
                    data.push(tasksOnDate);
                }
                
                this.charts.taskTimeline = new Chart(ctx3.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Tasks Created',
                            data: data,
                            borderColor: 'rgba(255, 101, 0, 1)',
                            backgroundColor: 'rgba(255, 101, 0, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgba(255, 101, 0, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.parsed.y + ' tasks created';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: { 
                                beginAtZero: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { 
                                    color: '#9CA3AF',
                                    stepSize: 1
                                }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
            
            // Team Performance Chart
            const ctx4 = document.getElementById('teamPerformanceChart');
            console.log('Team Performance Chart canvas:', ctx4);
            if (ctx4 && ctx4.getContext) {
                // Calculate team performance from actual tasks
                const teamPerformance = {};
                const assignees = ['JD', 'SM', 'BJ', 'AK'];
                const assigneeNames = ['John D.', 'Sarah M.', 'Bob J.', 'Alice K.'];
                console.log('Building team performance data...');
                
                // Initialize team data
                assignees.forEach((assignee, idx) => {
                    teamPerformance[assigneeNames[idx]] = {
                        completed: 0,
                        inProgress: 0,
                        todo: 0
                    };
                });
                
                // Add unassigned category
                teamPerformance['Unassigned'] = {
                    completed: 0,
                    inProgress: 0,
                    todo: 0
                };
                
                // Count tasks per team member
                tasks.forEach(task => {
                    if (!task.assignee || !task.assignee_id) {
                        // Task is unassigned
                        if (task.status === 'completed' || task.status === 'done') {
                            teamPerformance['Unassigned'].completed++;
                        } else if (task.status === 'in-progress' || task.status === 'in_progress' || task.status === 'review') {
                            teamPerformance['Unassigned'].inProgress++;
                        } else {
                            teamPerformance['Unassigned'].todo++;
                        }
                    } else {
                        const assigneeIndex = assignees.indexOf(task.assignee);
                        if (assigneeIndex !== -1) {
                            const name = assigneeNames[assigneeIndex];
                            if (task.status === 'completed' || task.status === 'done') {
                                teamPerformance[name].completed++;
                            } else if (task.status === 'in-progress' || task.status === 'in_progress' || task.status === 'review') {
                                teamPerformance[name].inProgress++;
                            } else {
                                teamPerformance[name].todo++;
                            }
                        }
                    }
                });
                
                const teamMembers = Object.keys(teamPerformance);
                const tasksCompleted = teamMembers.map(m => teamPerformance[m].completed);
                const tasksInProgress = teamMembers.map(m => teamPerformance[m].inProgress);
                const tasksTodo = teamMembers.map(m => teamPerformance[m].todo);
                
                console.log('Team performance data:', {
                    teamMembers,
                    tasksCompleted,
                    tasksInProgress,
                    tasksTodo,
                    teamPerformance
                });
                
                // Check if we have data
                const hasData = tasksCompleted.some(v => v > 0) || tasksInProgress.some(v => v > 0) || tasksTodo.some(v => v > 0);
                console.log('Has team data:', hasData, tasksCompleted, tasksInProgress, tasksTodo);
                
                this.charts.teamPerformance = new Chart(ctx4.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: teamMembers,
                        datasets: [
                            {
                                label: 'Completed',
                                data: tasksCompleted,
                                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                                borderColor: 'rgba(34, 197, 94, 1)',
                                borderWidth: 2
                            },
                            {
                                label: 'In Progress',
                                data: tasksInProgress,
                                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 2
                            },
                            {
                                label: 'To Do',
                                data: tasksTodo,
                                backgroundColor: 'rgba(156, 163, 175, 0.8)',
                                borderColor: 'rgba(156, 163, 175, 1)',
                                borderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { 
                                position: 'top',
                                labels: { color: '#9CA3AF' }
                            }
                        },
                        scales: {
                            y: { 
                                beginAtZero: true,
                                stacked: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#9CA3AF' }
                            },
                            x: {
                                stacked: true,
                                grid: { display: false },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
                console.log('Team Performance Chart created:', this.charts.teamPerformance);
            } else {
                console.log('Team Performance Chart canvas not found or no context');
            }
            
            // Project Velocity Chart
            const ctx5 = document.getElementById('projectVelocityChart');
            if (ctx5 && ctx5.getContext) {
                // Calculate tasks completed per week for the last 5 weeks
                const weeks = [];
                const tasksCompleted = [];
                
                for (let i = 4; i >= 0; i--) {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
                    const weekEnd = new Date();
                    weekEnd.setDate(weekEnd.getDate() - (i * 7));
                    
                    weeks.push(`Week ${5 - i}`);
                    
                    // Count completed tasks in this week
                    const completedInWeek = tasks.filter(t => {
                        const taskDate = new Date(t.updated_at || t.created_at);
                        return (t.status === 'completed' || t.status === 'done') &&
                               taskDate >= weekStart && taskDate < weekEnd;
                    }).length;
                    
                    tasksCompleted.push(completedInWeek);
                }
                
                this.charts.projectVelocity = new Chart(ctx5.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: weeks,
                        datasets: [{
                            label: 'Tasks Completed',
                            data: tasksCompleted,
                            borderColor: 'rgba(168, 85, 247, 1)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.parsed.y + ' tasks';
                                    }
                                }
                            }
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
            
            // Workload Distribution Chart
            const ctx6 = document.getElementById('workloadChart');
            if (ctx6 && ctx6.getContext) {
                // Calculate workload from actual tasks
                const workloadData = {};
                
                // Count unassigned tasks
                const unassignedTasks = tasks.filter(t => (!t.assignee || !t.assignee_id) && t.status !== 'completed' && t.status !== 'done');
                workloadData['Unassigned'] = { 
                    tasks: unassignedTasks.length, 
                    hours: unassignedTasks.reduce((sum, task) => sum + (task.estimated_hours || 8), 0)
                };
                
                // If there are assigned tasks, count them by assignee
                const assignees = ['JD', 'SM', 'BJ', 'AK'];
                const assigneeNames = ['John D.', 'Sarah M.', 'Bob J.', 'Alice K.'];
                
                assignees.forEach((assignee, idx) => {
                    const name = assigneeNames[idx];
                    const memberTasks = tasks.filter(t => t.assignee === assignee && t.status !== 'completed' && t.status !== 'done');
                    if (memberTasks.length > 0) {
                        workloadData[name] = { 
                            tasks: memberTasks.length, 
                            hours: memberTasks.reduce((sum, task) => sum + (task.estimated_hours || 8), 0)
                        };
                    }
                });
                
                this.charts.workload = new Chart(ctx6.getContext('2d'), {
                    type: 'radar',
                    data: {
                        labels: Object.keys(workloadData),
                        datasets: [
                            {
                                label: 'Active Tasks',
                                data: Object.values(workloadData).map(w => w.tasks),
                                borderColor: 'rgba(255, 101, 0, 1)',
                                backgroundColor: 'rgba(255, 101, 0, 0.2)',
                                pointBackgroundColor: 'rgba(255, 101, 0, 1)',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgba(255, 101, 0, 1)'
                            },
                            {
                                label: 'Est. Hours',
                                data: Object.values(workloadData).map(w => w.hours / 10), // Scale down for visibility
                                borderColor: 'rgba(59, 130, 246, 1)',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: { color: '#9CA3AF' }
                            }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
            
            // Task Completion Rate Chart
            const ctx7 = document.getElementById('completionRateChart');
            if (ctx7 && ctx7.getContext) {
                // Calculate weekly completion rate for the last 8 weeks
                const weeks = [];
                const completionRates = [];
                
                for (let i = 7; i >= 0; i--) {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - ((i + 1) * 7));
                    const weekEnd = new Date();
                    weekEnd.setDate(weekEnd.getDate() - (i * 7));
                    
                    weeks.push(`Week ${8 - i}`);
                    
                    // Count tasks created and completed in this week
                    const tasksInWeek = tasks.filter(t => {
                        const createdDate = new Date(t.created_at);
                        return createdDate >= weekStart && createdDate < weekEnd;
                    });
                    
                    const completedInWeek = tasksInWeek.filter(t => 
                        t.status === 'completed' || t.status === 'done'
                    ).length;
                    
                    const rate = tasksInWeek.length > 0 
                        ? Math.round((completedInWeek / tasksInWeek.length) * 100)
                        : 0;
                    
                    completionRates.push(rate);
                }
                
                this.charts.completionRate = new Chart(ctx7.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: weeks,
                        datasets: [{
                            label: 'Completion Rate %',
                            data: completionRates,
                            borderColor: 'rgba(34, 197, 94, 1)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.parsed.y + '% completion rate';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: { 
                                beginAtZero: false,
                                min: 50,
                                max: 100,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { 
                                    color: '#9CA3AF',
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#9CA3AF' }
                            }
                        }
                    }
                });
            }
            
            // Reset flag
            this.chartsInitializing = false;
            console.log('All charts initialized successfully');
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
        },
        
        // User Management Methods (Admin only)
        async loadUsers() {
            if (this.user.role !== 'admin') return;
            
            this.loading = true;
            const users = await api.get('/users');
            if (users) {
                this.users = users;
            }
            this.loading = false;
        },
        
        async createUser() {
            console.log('Creating user...', this.newUser);
            console.log('User role:', this.user.role);
            
            if (this.user.role !== 'admin') {
                console.log('Not admin, returning');
                return;
            }
            
            const result = await api.post('/users', this.newUser);
            if (result) {
                await this.loadUsers();
                this.showUserModal = false;
                this.newUser = { first_name: '', last_name: '', email: '', password: '', role: 'user' };
                this.showNotification('User created successfully!');
            }
        },
        
        async updateUser() {
            if (this.user.role !== 'admin' || !this.editingUser || !this.editingUser.id) return;
            
            // Don't send password if it's empty (not changing)
            const updateData = { ...this.editingUser };
            if (!updateData.password) {
                delete updateData.password;
            }
            
            // Prevent changing your own role
            if (this.editingUser.id === this.user.id && this.editingUser.role !== this.user.role) {
                alert("You cannot change your own role!");
                this.editingUser.role = this.user.role; // Reset to original role
                return;
            }
            
            const result = await api.put(`/users/${this.editingUser.id}`, updateData);
            if (result) {
                // If we updated our own user, update the current user object
                if (this.editingUser.id === this.user.id) {
                    this.user = { ...this.user, ...result };
                    console.log('Updated current user:', this.user);
                }
                
                await this.loadUsers();
                this.closeEditUserModal();
                this.showNotification('User updated successfully!');
            }
        },
        
        editUser(user) {
            console.log('Edit user clicked:', user);
            console.log('Current user role:', this.user.role);
            
            if (this.user.role !== 'admin') {
                console.log('Not admin, returning');
                return;
            }
            
            this.editingUser = { ...user, password: '' }; // Don't show existing password
            console.log('editingUser set to:', this.editingUser);
            this.showEditUserModal = true;
            console.log('showEditUserModal:', this.showEditUserModal);
        },
        
        closeEditUserModal() {
            this.showEditUserModal = false;
            this.editingUser = {};
        },
        
        async deleteUser(user) {
            console.log('Delete user clicked:', user);
            
            // Always use localStorage as primary source for admin check (fixes Alpine.js state sync issues)
            const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const storedToken = localStorage.getItem('token');
            const isAdmin = storedUser?.role === 'admin';
            
            console.log('Stored user role:', storedUser?.role);
            console.log('Is admin:', isAdmin);
            
            if (!isAdmin || !storedToken) {
                console.log('Not admin or no token, returning');
                alert('Admin access required to delete users');
                return;
            }
            
            // Prevent deleting yourself
            if (user.id === storedUser.id) {
                alert("You cannot delete your own account!");
                return;
            }
            
            if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
                try {
                    const response = await fetch(`${API_BASE}/users/${user.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        await this.loadUsers();
                        this.showNotification('User deleted successfully', 'success');
                        console.log('User deleted successfully');
                    } else {
                        const errorText = await response.text();
                        console.error('Delete failed:', response.status, errorText);
                        this.showNotification('Failed to delete user', 'error');
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    this.showNotification('Error deleting user', 'error');
                }
            }
        },
        
        getRoleClass(role) {
            const classes = {
                'admin': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
                'manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
                'developer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
                'user': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
            };
            return classes[role] || classes['user'];
        }
    };
}

// Expose globally for Alpine.js
window.projectHub = projectHub;

// Register Alpine.js store for toasts
document.addEventListener('alpine:init', () => {
    Alpine.store('toasts', {
        items: [],
        add(message, type = 'success') {
            const toast = {
                message,
                type,
                visible: true
            };
            this.items.push(toast);
            setTimeout(() => {
                toast.visible = false;
                setTimeout(() => {
                    this.items = this.items.filter(t => t !== toast);
                }, 300);
            }, 3000);
        },
        remove(index) {
            this.items.splice(index, 1);
        }
    });
});

// Make projectHub available globally for Alpine.js
window.projectHub = projectHub;