# ProjectHub Components Documentation

Detailed documentation of all Alpine.js components and their functionality.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Navigation System](#navigation-system)
3. [Project Management](#project-management)
4. [Task Management](#task-management)
5. [Kanban Board](#kanban-board)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Webhook Management](#webhook-management)
8. [Modal System](#modal-system)
9. [Toast Notifications](#toast-notifications)
10. [Dark Mode System](#dark-mode-system)

## Authentication System

### Login Component

**Location**: `index-complete.html` (lines 215-272)

**Features**:
- JWT-based authentication
- Form validation
- Error handling
- Demo credentials display

**Alpine.js Data**:
```javascript
{
  loginForm: { email: '', password: '' },
  loginLoading: false,
  loginError: null
}
```

**Methods**:
```javascript
async login() {
  this.loginLoading = true;
  this.loginError = null;
  
  try {
    const response = await api.post('/auth/login', this.loginForm);
    api.setToken(response.access_token || response.accessToken);
    this.user = response.user;
    this.isAuthenticated = true;
    await this.loadInitialData();
  } catch (error) {
    this.loginError = error.message;
  } finally {
    this.loginLoading = false;
  }
}
```

**HTML Structure**:
```html
<div x-show="!isAuthenticated" class="min-h-screen flex items-center justify-center">
  <form @submit.prevent="login" class="max-w-md w-full space-y-8">
    <input x-model="loginForm.email" type="email" required class="form-input">
    <input x-model="loginForm.password" type="password" required class="form-input">
    <button type="submit" :disabled="loginLoading" class="btn-primary">
      <span x-show="!loginLoading">Sign in</span>
      <span x-show="loginLoading">Signing in...</span>
    </button>
  </form>
</div>
```

### User Profile Menu

**Location**: Bottom bar (lines 969-990)

**Features**:
- User avatar display
- Dropdown menu
- Logout functionality

## Navigation System

### Header Navigation

**Location**: `index-complete.html` (lines 276-344)

**Features**:
- ProjectHub branding
- View switching (Projects, Board, Analytics, Webhooks)
- Theme toggle
- Active state management

**Alpine.js Data**:
```javascript
{
  currentView: 'projects',
  darkMode: localStorage.getItem('darkMode') === 'true'
}
```

**View Switching Logic**:
```javascript
$watch('currentView', async (value, oldValue) => {
  switch(value) {
    case 'analytics':
      this.calculateAnalytics();
      this.updateCharts();
      break;
    case 'webhooks':
      await this.loadWebhooks();
      break;
    case 'board':
      this.initializeDragAndDrop();
      break;
  }
})
```

**CSS Classes for Active States**:
```javascript
:class="currentView === 'projects' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-300 hover:text-orange-400'"
```

## Project Management

### Projects List View

**Location**: `index-complete.html` (lines 349-417)

**Features**:
- Grid layout with project cards
- Search functionality
- Status filtering
- Progress indicators
- Quick actions (create, edit, delete)

**Alpine.js Data**:
```javascript
{
  projects: [],
  projectSearch: '',
  projectFilter: { status: '' },
  showCreateProjectModal: false,
  selectedProject: null
}
```

**Computed Property**:
```javascript
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
}
```

**Project Card Structure**:
```html
<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <h3 class="text-xl font-semibold text-gray-900 dark:text-white" x-text="project.name"></h3>
  <p class="text-gray-600 dark:text-gray-400" x-text="project.description"></p>
  
  <!-- Progress Bar -->
  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
    <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" 
         :style="`width: ${project.progress || 0}%`"></div>
  </div>
  
  <!-- Status Badge -->
  <span :class="getProjectStatusClass(project.status)" x-text="project.status"></span>
  
  <!-- Actions -->
  <button @click="editProject(project)" class="text-gray-500 hover:text-orange-500">
    <i class="fas fa-edit"></i>
  </button>
</div>
```

### Project Detail View

**Location**: `index-complete.html` (lines 419-477)

**Features**:
- Project information display
- Associated tasks list
- Quick task creation
- Project editing

## Task Management

### Task Creation Modal

**Location**: `index-complete.html` (lines 743-794)

**Features**:
- Form validation
- Status and priority selection
- Project assignment
- Estimated hours tracking

**Alpine.js Data**:
```javascript
{
  showCreateTaskModal: false,
  newTask: { 
    title: '', 
    description: '', 
    status: 'pending', 
    priority: 'medium',
    assigned_to: '',
    project_id: null,
    estimated_hours: 0,
    actual_hours: 0
  }
}
```

**Task Creation Logic**:
```javascript
async createTask() {
  try {
    const task = await api.post('/tasks', this.newTask);
    this.tasks.push(task);
    this.showCreateTaskModal = false;
    this.newTask = { /* reset form */ };
    await this.loadProjects(); // Update counts
    Alpine.store('toasts').add('Task created successfully!');
  } catch (error) {
    Alpine.store('toasts').add('Failed to create task', 'error');
  }
}
```

### Task List Component

**Features**:
- Task filtering by project
- Status indicators
- Priority badges
- Quick actions (edit, delete)

**Task Card Structure**:
```html
<div class="bg-white dark:bg-gray-700 rounded-lg p-4 border">
  <h4 class="font-medium text-sm mb-2 text-gray-900 dark:text-white" x-text="task.title"></h4>
  <p class="text-xs text-gray-600 dark:text-gray-400" x-text="task.description"></p>
  
  <!-- Priority Badge -->
  <span :class="'px-2 py-1 rounded text-xs font-semibold priority-' + task.priority" 
        x-text="task.priority"></span>
  
  <!-- Assignee Avatar -->
  <div class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
    <span x-text="task.assigned_to?.[0] || '?'"></span>
  </div>
</div>
```

## Kanban Board

### Board Layout

**Location**: `index-complete.html` (lines 479-527)

**Features**:
- Drag and drop functionality
- Column-based task organization
- Project filtering
- Real-time updates

**Alpine.js Data**:
```javascript
{
  selectedBoardProject: '',
  taskStatuses: ['pending', 'in_progress', 'blocked', 'testing', 'completed', 'failed']
}
```

**Drag and Drop Implementation**:
```javascript
initializeDragAndDrop() {
  this.taskStatuses.forEach(status => {
    const container = document.getElementById(`kanban-${status}`);
    container.dataset.status = status;
    
    new Sortable(container, {
      group: 'kanban',
      animation: 150,
      onEnd: async (evt) => {
        const taskId = evt.item.dataset.taskId;
        const newStatus = evt.to.dataset.status;
        await this.updateTaskStatus(taskId, newStatus);
      }
    });
  });
}
```

### Column Structure

```html
<template x-for="status in taskStatuses" :key="status">
  <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
    <h3 class="font-semibold mb-4 text-gray-700 dark:text-gray-300 uppercase" 
        x-text="status.replace('_', ' ')"></h3>
    
    <div :id="'kanban-' + status" class="space-y-3 min-h-[200px]">
      <template x-for="task in getTasksByStatus(status)" :key="task.id">
        <div :data-task-id="task.id" class="kanban-task">
          <!-- Task content -->
        </div>
      </template>
    </div>
  </div>
</template>
```

### Task Status Update

```javascript
async updateTaskStatus(taskId, newStatus) {
  try {
    const task = this.tasks.find(t => t.id === taskId);
    const oldStatus = task.status;
    
    // Optimistic update
    task.status = newStatus;
    
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (apiError) {
      // Rollback on failure
      task.status = oldStatus;
      throw apiError;
    }
    
    Alpine.store('toasts').add('Task status updated!');
  } catch (error) {
    Alpine.store('toasts').add('Failed to update task status', 'error');
  }
}
```

## Analytics Dashboard

### Overview Stats

**Location**: `index-complete.html` (lines 537-585)

**Features**:
- Key metrics display
- Real-time calculations
- Animated counters
- Icon indicators

**Alpine.js Data**:
```javascript
{
  analytics: {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0
  }
}
```

**Calculation Logic**:
```javascript
calculateAnalytics() {
  this.analytics.totalProjects = this.projects.length;
  this.analytics.totalTasks = this.tasks.length;
  this.analytics.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
  this.analytics.activeTasks = this.tasks.filter(t => 
    ['pending', 'in_progress', 'testing'].includes(t.status)
  ).length;
}
```

**Stat Card Structure**:
```html
<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Total Projects</p>
      <p class="text-3xl font-bold mt-2 text-gray-900 dark:text-white" 
         x-text="analytics.totalProjects"></p>
    </div>
    <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
      <i class="fas fa-folder text-orange-600 dark:text-orange-400"></i>
    </div>
  </div>
</div>
```

### Charts Integration

**Location**: `index-complete.html` (lines 587-603)

**Features**:
- Chart.js integration
- Responsive design
- Dark mode support
- Dynamic data updates

**Chart Management**:
```javascript
{
  charts: {},
  _chartUpdateTimeout: null,
  _chartsInitialized: false
}

updateCharts() {
  if (this._chartUpdateTimeout) {
    clearTimeout(this._chartUpdateTimeout);
  }
  
  this._chartUpdateTimeout = setTimeout(() => {
    this._updateChartsNow();
  }, 100);
}

destroyAllCharts() {
  Object.keys(window._projectHubApp.chartInstances).forEach(chartId => {
    const chart = window._projectHubApp.chartInstances[chartId];
    if (chart) {
      chart.destroy();
      delete window._projectHubApp.chartInstances[chartId];
    }
  });
}
```

**Chart Creation Example**:
```javascript
// Project Status Chart
const projectStatusCtx = document.getElementById('projectStatusChart');
window._projectHubApp.chartInstances.projectStatus = new Chart(projectStatusCtx, {
  type: 'doughnut',
  data: {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#10b981', '#ef4444']
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
```

## Webhook Management

### Webhook List

**Location**: `index-complete.html` (lines 606-675)

**Features**:
- CRUD operations
- Event configuration
- Status management
- Testing functionality

**Alpine.js Data**:
```javascript
{
  webhooks: [],
  showCreateWebhookModal: false,
  showEditWebhookModal: false,
  newWebhook: { name: '', url: '', events: [], active: true },
  editingWebhook: { name: '', url: '', description: '', events: [], active: true }
}
```

**Webhook Operations**:
```javascript
async createWebhook() {
  try {
    const webhook = await api.post('/webhooks', this.newWebhook);
    this.webhooks.push(webhook);
    this.showCreateWebhookModal = false;
    this.newWebhook = { name: '', url: '', events: [], active: true };
    Alpine.store('toasts').add('Webhook created successfully!');
  } catch (error) {
    Alpine.store('toasts').add('Failed to create webhook', 'error');
  }
}

async updateWebhook() {
  try {
    const updated = await api.put(`/webhooks/${this.editingWebhook.id}`, this.editingWebhook);
    const index = this.webhooks.findIndex(w => w.id === this.editingWebhook.id);
    this.webhooks[index] = updated;
    this.showEditWebhookModal = false;
    Alpine.store('toasts').add('Webhook updated successfully!');
  } catch (error) {
    Alpine.store('toasts').add('Failed to update webhook', 'error');
  }
}

async testWebhook(webhook) {
  try {
    const result = await api.post(`/webhooks/${webhook.id}/test`);
    Alpine.store('toasts').add(`Test successful: ${result.message}`);
  } catch (error) {
    Alpine.store('toasts').add('Webhook test failed', 'error');
  }
}
```

### Webhook Item Structure

```html
<div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <h4 class="text-lg font-medium mb-1 text-gray-900 dark:text-white" x-text="webhook.name"></h4>
      <p class="text-sm text-gray-600 dark:text-gray-400" x-text="webhook.url"></p>
      
      <div class="flex items-center space-x-4 text-sm">
        <span class="text-gray-500 dark:text-gray-400">
          Events: <span x-text="webhook.events.join(', ')"></span>
        </span>
        <span :class="webhook.active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'">
          <i :class="webhook.active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          <span x-text="webhook.active ? 'Active' : 'Inactive'"></span>
        </span>
      </div>
    </div>
    
    <div class="flex items-center space-x-2">
      <button @click="editWebhook(webhook)" class="text-gray-600 dark:text-gray-400 hover:text-blue-600">
        <i class="fas fa-edit"></i>
      </button>
      <button @click="testWebhook(webhook)" class="text-gray-600 dark:text-gray-400 hover:text-yellow-600">
        <i class="fas fa-play"></i>
      </button>
      <button @click="deleteWebhook(webhook.id)" class="text-gray-600 dark:text-gray-400 hover:text-red-600">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</div>
```

## Modal System

### Modal Base Structure

**Features**:
- Backdrop click to close
- ESC key support
- z-index layering
- Animation support

**HTML Template**:
```html
<div x-show="showModal" x-cloak class="fixed inset-0 z-[9999] overflow-y-auto">
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
       @click="showModal = false"></div>
  
  <div class="flex items-center justify-center min-h-screen px-4 relative z-[10000]">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full relative z-[10001]">
      
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Modal Title</h3>
      
      <!-- Modal Content -->
      <div class="space-y-4">
        <!-- Form fields -->
      </div>
      
      <!-- Modal Actions -->
      <div class="mt-6 flex justify-end space-x-3">
        <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
      
    </div>
  </div>
</div>
```

### Conditional Rendering

For complex modals with dynamic content:

```html
<template x-if="editingWebhook && editingWebhook.id">
  <form @submit.prevent="updateWebhook">
    <!-- Form content only rendered when data is ready -->
  </form>
</template>

<div x-show="!editingWebhook || !editingWebhook.id" class="text-gray-600 dark:text-gray-400">
  Loading webhook data...
</div>
```

## Toast Notifications

### Toast Store

**Location**: `app-webhook-final.js` (lines 125-145)

**Features**:
- Auto-dismiss after 3 seconds
- Multiple notification types
- Animation support
- Queue management

**Alpine Store**:
```javascript
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
```

**Usage**:
```javascript
// Success notification
Alpine.store('toasts').add('Task created successfully!');

// Error notification
Alpine.store('toasts').add('Failed to save project', 'error');

// Warning notification
Alpine.store('toasts').add('Please fill all required fields', 'warning');
```

**Toast Display Component**:
```html
<div class="fixed top-4 right-4 z-50 space-y-2">
  <template x-for="toast in $store.toasts.items" :key="toast.message">
    <div x-show="toast.visible" 
         x-transition:enter="transform ease-out duration-300 transition"
         x-transition:enter-start="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
         x-transition:enter-end="translate-y-0 opacity-100 sm:translate-x-0"
         :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
         class="max-w-sm w-full text-white p-4 rounded-lg shadow-lg">
      <p x-text="toast.message"></p>
    </div>
  </template>
</div>
```

## Dark Mode System

### Theme Toggle

**Location**: Header navigation (lines 338-341)

**Features**:
- Manual toggle
- System preference detection
- LocalStorage persistence
- Instant switching

**Alpine.js Implementation**:
```javascript
{
  darkMode: localStorage.getItem('darkMode') === 'true',
  
  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode);
    
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

**Initialization**:
```javascript
async init() {
  // Apply dark mode on startup
  if (this.darkMode) {
    document.documentElement.classList.add('dark');
  }
}
```

### CSS Classes

**Form Inputs**:
```css
.form-input {
  @apply text-gray-900 dark:text-white 
         bg-white dark:bg-gray-800 
         border-gray-300 dark:border-gray-600 
         placeholder-gray-500 dark:placeholder-gray-400;
}
```

**Select Options**:
```css
html.dark select.form-input option {
  background-color: #1f2937 !important;
  color: #ffffff !important;
}
```

**Text Elements**:
```css
/* Headers */
.text-gray-900.dark\:text-white { color: white; }

/* Body text */
.text-gray-600.dark\:text-gray-400 { color: #9ca3af; }

/* Labels */
.text-gray-700.dark\:text-gray-300 { color: #d1d5db; }
```

## Form System

### Form Input Classes

**Base Class**:
```css
.form-input {
  @apply appearance-none rounded-lg relative block w-full px-3 py-2 
         border border-gray-300 dark:border-gray-600 
         placeholder-gray-500 dark:placeholder-gray-400 
         text-gray-900 dark:text-white 
         bg-white dark:bg-gray-800 
         focus:outline-none focus:ring-orange-500 focus:border-orange-500 
         focus:z-10 sm:text-sm;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}
```

**Button Classes**:
```css
.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200;
}
```

### Validation System

**Client-side Validation**:
```html
<input x-model="newProject.name" 
       required 
       class="form-input" 
       placeholder="Enter project name"
       @blur="validateProjectName()">

<span x-show="projectNameError" 
      class="text-red-500 text-sm" 
      x-text="projectNameError"></span>
```

**Validation Methods**:
```javascript
validateProjectName() {
  if (!this.newProject.name.trim()) {
    this.projectNameError = 'Project name is required';
    return false;
  }
  if (this.newProject.name.length < 3) {
    this.projectNameError = 'Project name must be at least 3 characters';
    return false;
  }
  this.projectNameError = '';
  return true;
}
```

## Performance Optimizations

### Chart Management

**Cleanup on View Change**:
```javascript
$watch('currentView', async (value, oldValue) => {
  // Clean up charts when leaving analytics view
  if (oldValue === 'analytics') {
    this.destroyAllCharts();
  }
});
```

**Debounced Updates**:
```javascript
updateCharts() {
  if (this._chartUpdateTimeout) {
    clearTimeout(this._chartUpdateTimeout);
  }
  
  this._chartUpdateTimeout = setTimeout(() => {
    this._updateChartsNow();
  }, 100);
}
```

### Singleton Pattern

**Prevent Duplicate Initialization**:
```javascript
// Global initialization flag
if (typeof window._projectHubApp !== 'undefined') {
  throw new Error('Duplicate initialization prevented');
}

window._projectHubApp = {
  initialized: false,
  instance: null,
  chartInstances: {}
};

// Return existing instance if already created
if (window._projectHubApp.instance) {
  return window._projectHubApp.instance;
}
```

### Memory Management

**Event Cleanup**:
```javascript
// Clean up event listeners
beforeDestroy() {
  if (this._chartUpdateTimeout) {
    clearTimeout(this._chartUpdateTimeout);
  }
  this.destroyAllCharts();
}
```

**Data Reset**:
```javascript
resetForm() {
  this.newProject = { name: '', description: '', status: 'planning' };
  this.projectNameError = '';
}
```

---

**For more information, see the main [README.md](../README.md) and [API.md](API.md) documentation.**