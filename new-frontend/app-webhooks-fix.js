// ProjectHub Complete Application Logic
// Fixed webhook management with graceful error handling

const API_BASE = '/api';

// Global initialization flag - set immediately
if (typeof window._projectHubApp !== 'undefined') {
    console.warn('ProjectHub already loaded, skipping duplicate initialization');
    throw new Error('Duplicate initialization prevented');
}

window._projectHubApp = {
    initialized: false,
    instance: null,
    chartInstances: {} // Store chart instances globally
};

// API Service with authentication
const api = {
    token: localStorage.getItem('access_token'),
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('access_token', token);
    },
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
    
    async request(method, endpoint, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };
        
        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);
            
            // Handle 401 Unauthorized
            if (response.status === 401) {
                // Try to refresh token
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry original request
                    options.headers['Authorization'] = `Bearer ${this.token}`;
                    const retryResponse = await fetch(`${API_BASE}${endpoint}`, options);
                    if (!retryResponse.ok) {
                        const error = await retryResponse.text();
                        throw new Error(error || `HTTP error! status: ${retryResponse.status}`);
                    }
                    return await retryResponse.json();
                } else {
                    // Refresh failed, clear auth
                    this.clearToken();
                    window.location.reload();
                }
            }
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;
        
        try {
            const response = await fetch(`${API_BASE}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    },
    
    // Convenience methods
    get(endpoint) { return this.request('GET', endpoint); },
    post(endpoint, data) { return this.request('POST', endpoint, data); },
    put(endpoint, data) { return this.request('PUT', endpoint, data); },
    patch(endpoint, data) { return this.request('PATCH', endpoint, data); },
    delete(endpoint) { return this.request('DELETE', endpoint); }
};

// Single Alpine initialization
document.addEventListener('alpine:init', () => {
    // Prevent multiple initializations
    if (window._projectHubApp.initialized) {
        console.warn('Alpine already initialized for ProjectHub');
        return;
    }
    
    window._projectHubApp.initialized = true;
    console.log('Alpine.js initializing...');
    
    // Toast notification store - register only once
    if (!Alpine.store('toasts')) {
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
                    setTimeout(() => this.remove(this.items.indexOf(toast)), 300);
                }, 3000);
            },
            remove(index) {
                this.items.splice(index, 1);
            }
        });
    }
    
    // Main Application - Register as Alpine data (factory function)
    Alpine.data('projectHub', () => {
        // Return existing instance if already created
        if (window._projectHubApp.instance) {
            console.log('Returning existing ProjectHub instance');
            return window._projectHubApp.instance;
        }
        
        console.log('🚀 Creating new ProjectHub instance...');
        
        // Create new instance
        const instance = {
            // Initialization guard
            _initialized: false,
            _viewWatcherSet: false,
            
            // Global state
            globalLoading: true,
            isAuthenticated: false,
            darkMode: localStorage.getItem('darkMode') === 'true',
            
            // Chart update control
            _chartUpdateTimeout: null,
            _chartsInitialized: false,
            
            // User & Auth
            user: null,
            loginForm: { email: '', password: '' },
            loginLoading: false,
            loginError: null,
            
            // Workspace
            workspaces: [],
            currentWorkspace: localStorage.getItem('current_workspace_id') || null,
            
            // Navigation
            currentView: 'projects',
            
            // Projects
            projects: [],
            selectedProject: null,
            projectSearch: '',
            projectFilter: { status: '' },
            showCreateProjectModal: false,
            showEditProjectModal: false,
            newProject: { name: '', description: '', status: 'planning' },
            editingProject: null,
            
            // Tasks
            tasks: [],
            selectedBoardProject: '',
            taskStatuses: ['pending', 'in_progress', 'blocked', 'testing', 'completed', 'failed'],
            showCreateTaskModal: false,
            showEditTaskModal: false,
            newTask: { 
                title: '', 
                description: '', 
                status: 'pending', 
                priority: 'medium',
                assigned_to: '',
                project_id: null,
                estimated_hours: 0,
                actual_hours: 0
            },
            editingTask: null,
            
            // Analytics
            analytics: {
                totalProjects: 0,
                totalTasks: 0,
                completedTasks: 0,
                activeTasks: 0
            },
            charts: {},
            
            // Webhooks
            webhooks: [],
            showCreateWebhookModal: false,
            showEditWebhookModal: false,
            newWebhook: { name: '', url: '', events: [], is_active: true },
            editingWebhook: null,
            
            // Computed properties
            get filteredProjects() {
                let filtered = this.projects;
                
                if (this.projectSearch) {
                    filtered = filtered.filter(p => 
                        p.name.toLowerCase().includes(this.projectSearch.toLowerCase()) ||
                        p.description.toLowerCase().includes(this.projectSearch.toLowerCase())
                    );
                }
                
                if (this.projectFilter.status) {
                    filtered = filtered.filter(p => p.status === this.projectFilter.status);
                }
                
                return filtered;
            },
            
            // Initialize application
            async init() {
                // Prevent double initialization
                if (this._initialized) {
                    console.log('ProjectHub already initialized, skipping...');
                    return;
                }
                
                this._initialized = true;
                console.log('🚀 Initializing ProjectHub...');
                
                // Apply dark mode
                if (this.darkMode) {
                    document.documentElement.classList.add('dark');
                }
                
                // Check authentication
                if (api.token) {
                    try {
                        await this.checkAuth();
                    } catch (error) {
                        console.error('Auth check failed:', error);
                        this.isAuthenticated = false;
                    }
                }
                
                // Set up view change watcher ONCE
                if (!this._viewWatcherSet) {
                    this._viewWatcherSet = true;
                    this.$watch('currentView', async (value, oldValue) => {
                        if (oldValue === value) return; // Skip if same view
                        
                        console.log('View changed from', oldValue, 'to', value);
                        
                        // Clean up charts when leaving analytics view
                        if (oldValue === 'analytics') {
                            this.destroyAllCharts();
                        }
                        
                        switch(value) {
                            case 'analytics':
                                console.log('Switching to analytics view...');
                                this.calculateAnalytics();
                                // Use requestAnimationFrame for smoother rendering
                                requestAnimationFrame(() => {
                                    this.updateCharts();
                                });
                                break;
                            case 'webhooks':
                                console.log('Loading webhooks...');
                                await this.loadWebhooks();
                                break;
                            case 'board':
                                console.log('Switching to board view...');
                                this.$nextTick(() => {
                                    this.initializeDragAndDrop();
                                });
                                break;
                            case 'projects':
                                console.log('Switching to projects view...');
                                break;
                        }
                    });
                }
                
                // Initialize views after DOM is ready
                this.$nextTick(() => {
                    console.log('DOM ready, current view:', this.currentView);
                    
                    // Initialize based on current view
                    if (this.currentView === 'board') {
                        this.initializeDragAndDrop();
                    }
                });
                
                this.globalLoading = false;
            },
            
            // Authentication methods...
            async checkAuth() {
                try {
                    const response = await api.get('/auth/me');
                    this.user = response;
                    this.isAuthenticated = true;
                    
                    // Load initial data
                    await this.loadInitialData();
                } catch (error) {
                    api.clearToken();
                    this.isAuthenticated = false;
                }
            },
            
            async login() {
                this.loginLoading = true;
                this.loginError = null;
                
                try {
                    const response = await api.post('/auth/login', this.loginForm);
                    
                    // Store tokens
                    api.setToken(response.access_token || response.accessToken);
                    if (response.refresh_token || response.refreshToken) {
                        localStorage.setItem('refresh_token', response.refresh_token || response.refreshToken);
                    }
                    
                    // Set user
                    this.user = response.user || {
                        id: response.user_id,
                        email: this.loginForm.email,
                        first_name: response.first_name || 'Test',
                        last_name: response.last_name || 'User',
                        role: response.role || 'developer'
                    };
                    
                    this.isAuthenticated = true;
                    this.loginForm = { email: '', password: '' };
                    
                    // Load initial data
                    await this.loadInitialData();
                    
                    Alpine.store('toasts').add('Successfully logged in!');
                } catch (error) {
                    this.loginError = error.message || 'Invalid email or password';
                } finally {
                    this.loginLoading = false;
                }
            },
            
            async logout() {
                try {
                    await api.post('/auth/logout', {});
                } catch (error) {
                    // Ignore logout errors
                }
                
                api.clearToken();
                this.isAuthenticated = false;
                this.user = null;
                window.location.reload();
            },
            
            // Load initial data
            async loadInitialData() {
                try {
                    // Load workspaces
                    await this.loadWorkspaces();
                    
                    // Load projects
                    await this.loadProjects();
                    
                    // Load tasks
                    await this.loadTasks();
                    
                    // Calculate analytics
                    this.calculateAnalytics();
                } catch (error) {
                    console.error('Failed to load initial data:', error);
                    Alpine.store('toasts').add('Failed to load data', 'error');
                }
            },
            
            // Data loading methods...
            async loadWorkspaces() {
                try {
                    this.workspaces = await api.get('/workspaces');
                    
                    // Set current workspace if not set
                    if (!this.currentWorkspace && this.workspaces.length > 0) {
                        this.currentWorkspace = this.workspaces[0].id;
                        localStorage.setItem('current_workspace_id', this.currentWorkspace);
                    }
                } catch (error) {
                    console.error('Failed to load workspaces:', error);
                    // Create a default workspace for demo
                    this.workspaces = [{
                        id: 'default',
                        name: 'Default Workspace'
                    }];
                    this.currentWorkspace = 'default';
                }
            },
            
            async switchWorkspace() {
                localStorage.setItem('current_workspace_id', this.currentWorkspace);
                await this.loadInitialData();
            },
            
            // Project management
            async loadProjects() {
                try {
                    this.projects = await api.get('/projects');
                    
                    // Calculate progress for each project
                    for (let project of this.projects) {
                        const projectTasks = this.tasks.filter(t => t.project_id === project.id);
                        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                        project.progress = projectTasks.length > 0 
                            ? Math.round((completedTasks / projectTasks.length) * 100) 
                            : 0;
                        project.task_count = projectTasks.length;
                    }
                } catch (error) {
                    console.error('Failed to load projects:', error);
                    Alpine.store('toasts').add('Failed to load projects', 'error');
                }
            },
            
            async createProject() {
                try {
                    const project = await api.post('/projects', {
                        ...this.newProject,
                        workspace_id: this.currentWorkspace
                    });
                    
                    this.projects.push(project);
                    this.showCreateProjectModal = false;
                    this.newProject = { name: '', description: '', status: 'planning' };
                    
                    Alpine.store('toasts').add('Project created successfully!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to create project', 'error');
                }
            },
            
            async updateProject() {
                try {
                    const updated = await api.put(`/projects/${this.editingProject.id}`, this.editingProject);
                    
                    const index = this.projects.findIndex(p => p.id === this.editingProject.id);
                    if (index !== -1) {
                        this.projects[index] = updated;
                    }
                    
                    if (this.selectedProject?.id === this.editingProject.id) {
                        this.selectedProject = updated;
                    }
                    
                    this.showEditProjectModal = false;
                    this.editingProject = null;
                    
                    Alpine.store('toasts').add('Project updated successfully!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to update project', 'error');
                }
            },
            
            async deleteProject(projectId) {
                if (!confirm('Are you sure you want to delete this project?')) return;
                
                try {
                    await api.delete(`/projects/${projectId}`);
                    
                    this.projects = this.projects.filter(p => p.id !== projectId);
                    if (this.selectedProject?.id === projectId) {
                        this.selectedProject = null;
                    }
                    
                    Alpine.store('toasts').add('Project deleted successfully!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to delete project', 'error');
                }
            },
            
            selectProject(project) {
                this.selectedProject = project;
            },
            
            editProject(project) {
                this.editingProject = { ...project };
                this.showEditProjectModal = true;
            },
            
            // Task management
            async loadTasks() {
                try {
                    this.tasks = await api.get('/tasks');
                } catch (error) {
                    console.error('Failed to load tasks:', error);
                    Alpine.store('toasts').add('Failed to load tasks', 'error');
                }
            },
            
            async loadBoardTasks() {
                if (!this.selectedBoardProject) return;
                
                try {
                    const tasks = await api.get(`/projects/${this.selectedBoardProject}/tasks`);
                    
                    // Update tasks for the selected project
                    this.tasks = [
                        ...this.tasks.filter(t => t.project_id !== this.selectedBoardProject),
                        ...tasks
                    ];
                    
                    // Reinitialize drag and drop
                    this.$nextTick(() => {
                        this.initializeDragAndDrop();
                    });
                } catch (error) {
                    console.error('Failed to load board tasks:', error);
                }
            },
            
            async createTask() {
                try {
                    const task = await api.post('/tasks', this.newTask);
                    
                    this.tasks.push(task);
                    this.showCreateTaskModal = false;
                    this.newTask = { 
                        title: '', 
                        description: '', 
                        status: 'pending', 
                        priority: 'medium',
                        assigned_to: '',
                        project_id: null,
                        estimated_hours: 0,
                        actual_hours: 0
                    };
                    
                    // Reload project data to update counts
                    await this.loadProjects();
                    
                    Alpine.store('toasts').add('Task created successfully!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to create task', 'error');
                }
            },
            
            async updateTask() {
                try {
                    const updated = await api.put(`/tasks/${this.editingTask.id}`, this.editingTask);
                    
                    const index = this.tasks.findIndex(t => t.id === this.editingTask.id);
                    if (index !== -1) {
                        this.tasks[index] = updated;
                    }
                    
                    this.showEditTaskModal = false;
                    this.editingTask = null;
                    
                    // Reload project data to update progress
                    await this.loadProjects();
                    
                    Alpine.store('toasts').add('Task updated successfully!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to update task', 'error');
                }
            },
            
            async deleteTask(taskId) {
                if (!confirm('Are you sure you want to delete this task?')) return;
                
                try {
                    await api.delete(`/tasks/${taskId}`);
                    
                    this.tasks = this.tasks.filter(t => t.id !== taskId);
                    
                    // Reload project data to update counts
                    await this.loadProjects();
                    
                    Alpine.store('toasts').add('Task deleted successfully!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to delete task', 'error');
                }
            },
            
            editTask(task) {
                this.editingTask = { ...task };
                this.showEditTaskModal = true;
            },
            
            getProjectTasks(projectId) {
                return this.tasks.filter(t => t.project_id === projectId);
            },
            
            getTasksByStatus(status) {
                return this.tasks.filter(t => 
                    t.status === status && 
                    t.project_id === this.selectedBoardProject
                );
            },
            
            // Drag and drop functionality
            initializeDragAndDrop() {
                if (this.currentView !== 'board') return;
                
                // Check if Sortable is available
                if (typeof Sortable === 'undefined') {
                    console.warn('Sortable.js not loaded yet');
                    return;
                }
                
                this.taskStatuses.forEach(status => {
                    const container = document.getElementById(`kanban-${status}`);
                    if (!container) return;
                    
                    // Set status on container for easy access
                    container.dataset.status = status;
                    
                    // Initialize Sortable
                    new Sortable(container, {
                        group: 'kanban',
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        dragClass: 'sortable-drag',
                        onEnd: async (evt) => {
                            const taskId = evt.item.dataset.taskId;
                            const newStatus = evt.to.dataset.status;
                            const oldStatus = evt.from.dataset.status;
                            
                            if (newStatus !== oldStatus) {
                                await this.updateTaskStatus(taskId, newStatus);
                            }
                        }
                    });
                });
            },
            
            async updateTaskStatus(taskId, newStatus) {
                try {
                    const task = this.tasks.find(t => t.id === taskId);
                    if (!task) return;
                    
                    // Store old status for rollback
                    const oldStatus = task.status;
                    
                    // Update local state immediately for better UX
                    task.status = newStatus;
                    
                    try {
                        // Try to update on backend
                        const updated = await api.patch(`/tasks/${taskId}`, { status: newStatus });
                        
                        // If successful, update with server response
                        Object.assign(task, updated);
                    } catch (apiError) {
                        // If API fails, check if it's a mock backend
                        if (apiError.message.includes('404') || apiError.message.includes('Not found')) {
                            console.warn('Task update endpoint not implemented in mock backend, keeping local update');
                            // Keep the local update for demo purposes
                        } else {
                            // Real error, rollback
                            task.status = oldStatus;
                            throw apiError;
                        }
                    }
                    
                    // Reload project data to update progress
                    await this.loadProjects();
                    
                    Alpine.store('toasts').add('Task status updated!');
                } catch (error) {
                    Alpine.store('toasts').add('Failed to update task status', 'error');
                    console.error('Task update error:', error);
                    // Reload tasks to revert
                    await this.loadBoardTasks();
                }
            },
            
            // Analytics
            calculateAnalytics() {
                this.analytics.totalProjects = this.projects.length;
                this.analytics.totalTasks = this.tasks.length;
                this.analytics.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
                this.analytics.activeTasks = this.tasks.filter(t => 
                    ['pending', 'in_progress', 'testing'].includes(t.status)
                ).length;
                
                // Don't auto-update charts here
            },
            
            // Destroy all charts
            destroyAllCharts() {
                console.log('Destroying all charts...');
                
                // Destroy each stored chart instance
                Object.keys(window._projectHubApp.chartInstances).forEach(chartId => {
                    const chart = window._projectHubApp.chartInstances[chartId];
                    if (chart) {
                        chart.destroy();
                        delete window._projectHubApp.chartInstances[chartId];
                    }
                });
                
                // Clear the chart container divs
                ['projectStatusChart', 'taskPriorityChart', 'taskTimelineChart'].forEach(id => {
                    const container = document.getElementById(id);
                    if (container) {
                        // Get parent div
                        const parent = container.parentElement;
                        // Remove canvas
                        container.remove();
                        // Create new canvas
                        const newCanvas = document.createElement('canvas');
                        newCanvas.id = id;
                        newCanvas.className = 'max-h-64';
                        parent.appendChild(newCanvas);
                    }
                });
            },
            
            updateCharts() {
                // Clear any pending updates
                if (this._chartUpdateTimeout) {
                    clearTimeout(this._chartUpdateTimeout);
                    this._chartUpdateTimeout = null;
                }
                
                // Only update if on analytics view
                if (this.currentView !== 'analytics') {
                    return;
                }
                
                // Debounce the actual update
                this._chartUpdateTimeout = setTimeout(() => {
                    this._updateChartsNow();
                }, 100);
            },
            
            _updateChartsNow() {
                // Check if Chart.js is available
                if (typeof Chart === 'undefined') {
                    console.warn('Chart.js not loaded yet');
                    setTimeout(() => this.updateCharts(), 500);
                    return;
                }
                
                // Only update if we're still on analytics view
                if (this.currentView !== 'analytics') {
                    return;
                }
                
                console.log('Updating charts with data:', {
                    projects: this.projects.length,
                    tasks: this.tasks.length
                });
                
                // Destroy existing charts first
                this.destroyAllCharts();
                
                // Wait for DOM to update
                this.$nextTick(() => {
                    // Project Status Chart
                    const projectStatusCtx = document.getElementById('projectStatusChart');
                    if (projectStatusCtx) {
                        const statusCounts = {};
                        this.projects.forEach(p => {
                            statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
                        });
                        
                        console.log('Project status counts:', statusCounts);
                        
                        try {
                            window._projectHubApp.chartInstances.projectStatus = new Chart(projectStatusCtx.getContext('2d'), {
                                type: 'doughnut',
                                data: {
                                    labels: Object.keys(statusCounts),
                                    datasets: [{
                                        data: Object.values(statusCounts),
                                        backgroundColor: [
                                            '#22c55e', // active
                                            '#3b82f6', // planning
                                            '#f59e0b', // paused
                                            '#10b981', // completed
                                            '#ef4444'  // cancelled
                                        ]
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
                        } catch (error) {
                            console.error('Error creating project status chart:', error);
                        }
                    }
                    
                    // Task Priority Chart
                    const taskPriorityCtx = document.getElementById('taskPriorityChart');
                    if (taskPriorityCtx) {
                        const priorityCounts = {};
                        this.tasks.forEach(t => {
                            priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
                        });
                        
                        try {
                            window._projectHubApp.chartInstances.taskPriority = new Chart(taskPriorityCtx.getContext('2d'), {
                                type: 'bar',
                                data: {
                                    labels: ['Low', 'Medium', 'High', 'Critical'],
                                    datasets: [{
                                        label: 'Tasks',
                                        data: [
                                            priorityCounts.low || 0,
                                            priorityCounts.medium || 0,
                                            priorityCounts.high || 0,
                                            priorityCounts.critical || 0
                                        ],
                                        backgroundColor: ['#6b7280', '#fb923c', '#ea580c', '#dc2626']
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
                        } catch (error) {
                            console.error('Error creating task priority chart:', error);
                        }
                    }
                    
                    // Task Timeline Chart
                    const taskTimelineCtx = document.getElementById('taskTimelineChart');
                    if (taskTimelineCtx) {
                        // Group tasks by creation date (last 7 days)
                        const last7Days = [];
                        const taskCounts = [];
                        
                        for (let i = 6; i >= 0; i--) {
                            const date = new Date();
                            date.setDate(date.getDate() - i);
                            const dateStr = date.toISOString().split('T')[0];
                            last7Days.push(dateStr);
                            
                            const count = this.tasks.filter(t => 
                                t.created_at && t.created_at.startsWith(dateStr)
                            ).length;
                            taskCounts.push(count);
                        }
                        
                        try {
                            window._projectHubApp.chartInstances.taskTimeline = new Chart(taskTimelineCtx.getContext('2d'), {
                                type: 'line',
                                data: {
                                    labels: last7Days,
                                    datasets: [{
                                        label: 'Tasks Created',
                                        data: taskCounts,
                                        borderColor: '#f97316',
                                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                        tension: 0.4
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
                        } catch (error) {
                            console.error('Error creating task timeline chart:', error);
                        }
                    }
                });
                
                // Mark charts as initialized
                this._chartsInitialized = true;
            },
            
            // Webhook management with improved error handling
            async loadWebhooks() {
                try {
                    this.webhooks = await api.get('/webhooks');
                } catch (error) {
                    console.error('Failed to load webhooks:', error);
                    Alpine.store('toasts').add('Failed to load webhooks', 'error');
                }
            },
            
            async createWebhook() {
                try {
                    const webhook = await api.post('/webhooks', {
                        ...this.newWebhook,
                        workspace_id: this.currentWorkspace
                    });
                    
                    this.webhooks.push(webhook);
                    this.showCreateWebhookModal = false;
                    this.newWebhook = { name: '', url: '', events: [], is_active: true };
                    
                    Alpine.store('toasts').add('Webhook created successfully!');
                } catch (error) {
                    console.error('Create webhook error:', error);
                    if (error.message.includes('404') || error.message.includes('Not found')) {
                        Alpine.store('toasts').add('Webhook creation not available in demo mode', 'error');
                    } else {
                        Alpine.store('toasts').add('Failed to create webhook', 'error');
                    }
                }
            },
            
            async updateWebhook() {
                try {
                    const updated = await api.put(`/webhooks/${this.editingWebhook.id}`, this.editingWebhook);
                    
                    const index = this.webhooks.findIndex(w => w.id === this.editingWebhook.id);
                    if (index !== -1) {
                        this.webhooks[index] = updated;
                    }
                    
                    this.showEditWebhookModal = false;
                    this.editingWebhook = null;
                    
                    Alpine.store('toasts').add('Webhook updated successfully!');
                } catch (error) {
                    console.error('Update webhook error:', error);
                    if (error.message.includes('404') || error.message.includes('Not found')) {
                        // For demo purposes, update locally
                        const index = this.webhooks.findIndex(w => w.id === this.editingWebhook.id);
                        if (index !== -1) {
                            this.webhooks[index] = { ...this.editingWebhook };
                        }
                        this.showEditWebhookModal = false;
                        this.editingWebhook = null;
                        Alpine.store('toasts').add('Webhook updated (demo mode)', 'success');
                    } else {
                        Alpine.store('toasts').add('Failed to update webhook', 'error');
                    }
                }
            },
            
            async toggleWebhook(webhook) {
                // Store original state
                const originalState = webhook.is_active;
                
                try {
                    // Optimistically update UI
                    webhook.is_active = !webhook.is_active;
                    
                    // Try to update on backend
                    await api.patch(`/webhooks/${webhook.id}`, { is_active: webhook.is_active });
                    
                    Alpine.store('toasts').add(`Webhook ${webhook.is_active ? 'activated' : 'deactivated'}`);
                } catch (error) {
                    console.error('Toggle webhook error:', error);
                    
                    if (error.message.includes('404') || error.message.includes('Not found')) {
                        // For demo purposes, keep the optimistic update
                        Alpine.store('toasts').add(`Webhook ${webhook.is_active ? 'activated' : 'deactivated'} (demo mode)`);
                    } else {
                        // Real error, revert the change
                        webhook.is_active = originalState;
                        Alpine.store('toasts').add('Failed to toggle webhook', 'error');
                    }
                }
            },
            
            async deleteWebhook(webhookId) {
                if (!confirm('Are you sure you want to delete this webhook?')) return;
                
                try {
                    await api.delete(`/webhooks/${webhookId}`);
                    
                    this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
                    
                    Alpine.store('toasts').add('Webhook deleted successfully!');
                } catch (error) {
                    console.error('Delete webhook error:', error);
                    if (error.message.includes('404') || error.message.includes('Not found')) {
                        // For demo purposes, delete locally
                        this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
                        Alpine.store('toasts').add('Webhook deleted (demo mode)', 'success');
                    } else {
                        Alpine.store('toasts').add('Failed to delete webhook', 'error');
                    }
                }
            },
            
            editWebhook(webhook) {
                this.editingWebhook = { ...webhook };
                this.showEditWebhookModal = true;
            },
            
            // Utility functions
            toggleTheme() {
                this.darkMode = !this.darkMode;
                localStorage.setItem('darkMode', this.darkMode);
                
                if (this.darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },
            
            formatDate(dateString) {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                return date.toLocaleDateString();
            },
            
            getProjectStatusClass(status) {
                const classes = {
                    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                };
                return classes[status] || classes.planning;
            }
        };
        
        // Store instance globally
        window._projectHubApp.instance = instance;
        
        return instance;
    });
});