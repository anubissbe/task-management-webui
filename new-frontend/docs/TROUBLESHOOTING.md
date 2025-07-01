# ProjectHub Troubleshooting Guide

Common issues and their solutions for the ProjectHub Alpine.js frontend.

## Table of Contents

1. [Installation & Setup Issues](#installation--setup-issues)
2. [Alpine.js Related Issues](#alpinejs-related-issues)
3. [Dark Mode Issues](#dark-mode-issues)
4. [API & Backend Issues](#api--backend-issues)
5. [Chart & Analytics Issues](#chart--analytics-issues)
6. [Form & Input Issues](#form--input-issues)
7. [Modal & UI Issues](#modal--ui-issues)
8. [Performance Issues](#performance-issues)
9. [Browser Compatibility](#browser-compatibility)
10. [Development Issues](#development-issues)

## Installation & Setup Issues

### Issue: Docker Container Won't Start

**Symptoms:**
- Container exits immediately
- Port binding errors
- File not found errors

**Solutions:**

1. **Check Port Availability:**
   ```bash
   # Check if port 8090 is already in use
   lsof -i :8090
   
   # Use different port if needed
   docker run -d --name projecthub-frontend -p 8091:80 projecthub-frontend
   ```

2. **Verify Docker Image:**
   ```bash
   # Check if image built successfully
   docker images | grep projecthub-frontend
   
   # Rebuild if necessary
   docker build -t projecthub-frontend .
   ```

3. **Check File Permissions:**
   ```bash
   # Ensure files are readable
   ls -la index-complete.html app-webhook-final.js
   ```

### Issue: Backend API Not Accessible

**Symptoms:**
- API calls fail with network errors
- CORS errors in browser console
- Connection refused errors

**Solutions:**

1. **Start Backend Server:**
   ```bash
   cd /tmp
   node complete_backend.js
   ```

2. **Check Backend Health:**
   ```bash
   curl http://localhost:3009/health
   ```

3. **Verify CORS Configuration:**
   ```javascript
   // In complete_backend.js
   app.use(cors({
     origin: ['http://localhost:8090', 'http://localhost:5174'],
     credentials: true
   }));
   ```

### Issue: Files Not Found (404 Errors)

**Symptoms:**
- JavaScript files return 404
- CSS not loading
- Images missing

**Solutions:**

1. **Check Dockerfile COPY Commands:**
   ```dockerfile
   COPY index-complete.html /usr/share/nginx/html/index.html
   COPY app-webhook-final.js /usr/share/nginx/html/
   ```

2. **Verify Nginx Configuration:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
     add_header Cache-Control "no-cache, no-store, must-revalidate";
   }
   ```

3. **Clear Browser Cache:**
   - Ctrl+Shift+R (hard refresh)
   - Open DevTools → Network → Disable cache

## Alpine.js Related Issues

### Issue: Alpine.js Not Initializing

**Symptoms:**
- `x-data` not working
- `x-show`/`x-if` not functioning
- No reactivity

**Solutions:**

1. **Check Alpine.js CDN:**
   ```html
   <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
   ```

2. **Verify x-data Placement:**
   ```html
   <!-- Correct -->
   <div x-data="projectHub()">
   
   <!-- Incorrect -->
   <div x-data="projectHub"> <!-- Missing parentheses -->
   ```

3. **Check Console for Errors:**
   ```javascript
   // Look for initialization errors
   console.log('Alpine version:', Alpine.version);
   ```

### Issue: Duplicate Initialization Errors

**Symptoms:**
- "Duplicate initialization prevented" error
- Multiple instances of components
- Unexpected behavior

**Solutions:**

1. **Check Singleton Implementation:**
   ```javascript
   // Ensure this code is in app-webhook-final.js
   if (typeof window._projectHubApp !== 'undefined') {
     throw new Error('Duplicate initialization prevented');
   }
   ```

2. **Verify Script Loading:**
   ```html
   <!-- Only load one Alpine.js application script -->
   <script src="app-webhook-final.js?v=1751364000"></script>
   ```

3. **Clear Application State:**
   ```javascript
   // In browser console
   delete window._projectHubApp;
   location.reload();
   ```

### Issue: Reactivity Not Working

**Symptoms:**
- Data changes don't update UI
- `x-model` not syncing
- Computed properties not updating

**Solutions:**

1. **Check Data Binding:**
   ```html
   <!-- Correct -->
   <input x-model="projectSearch">
   
   <!-- Check for typos -->
   <input x-model="projectSeach"> <!-- Typo -->
   ```

2. **Verify Method Calls:**
   ```javascript
   // Ensure methods are bound correctly
   async loadProjects() {
     this.projects = await api.get('/projects');
   }
   ```

3. **Use `$nextTick` for DOM Updates:**
   ```javascript
   this.$nextTick(() => {
     this.initializeDragAndDrop();
   });
   ```

### Issue: Null Reference Errors

**Symptoms:**
- "Cannot read properties of null" errors
- Form binding failures
- Modal rendering issues

**Solutions:**

1. **Use Conditional Rendering:**
   ```html
   <!-- Use x-if for complex objects -->
   <template x-if="editingWebhook && editingWebhook.id">
     <form @submit.prevent="updateWebhook">
       <input x-model="editingWebhook.name">
     </form>
   </template>
   ```

2. **Initialize Objects Properly:**
   ```javascript
   // Initialize as object, not null
   editingWebhook: { name: '', url: '', description: '', events: [], active: true }
   ```

3. **Use Optional Chaining (where supported):**
   ```html
   <span x-text="user?.name || 'Unknown'"></span>
   ```

## Dark Mode Issues

### Issue: Text Not Visible in Dark Mode

**Symptoms:**
- Black text on dark backgrounds
- Unreadable form inputs
- Poor contrast

**Solutions:**

1. **Add Dark Mode Classes:**
   ```html
   <!-- Add dark:text-white to headers -->
   <h3 class="text-gray-900 dark:text-white">Title</h3>
   
   <!-- Add dark variants to all text -->
   <p class="text-gray-600 dark:text-gray-400">Description</p>
   ```

2. **Use Form Input Class:**
   ```html
   <!-- Use standardized form class -->
   <input class="form-input" placeholder="Search...">
   ```

3. **Check CSS Variables:**
   ```css
   html.dark select.form-input option {
     background-color: #1f2937 !important;
     color: #ffffff !important;
   }
   ```

### Issue: Dark Mode Not Persisting

**Symptoms:**
- Theme resets on page reload
- Toggle doesn't save preference
- Inconsistent theme state

**Solutions:**

1. **Check LocalStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('darkMode');
   localStorage.setItem('darkMode', 'true');
   ```

2. **Verify Theme Toggle:**
   ```javascript
   toggleTheme() {
     this.darkMode = !this.darkMode;
     localStorage.setItem('darkMode', this.darkMode);
     
     if (this.darkMode) {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
   }
   ```

3. **Check Initialization:**
   ```javascript
   async init() {
     if (this.darkMode) {
       document.documentElement.classList.add('dark');
     }
   }
   ```

### Issue: Dropdown Options Unreadable

**Symptoms:**
- Select dropdown options have poor contrast
- Can't read dropdown text
- Options appear black on dark background

**Solutions:**

1. **Force Option Styling:**
   ```css
   html.dark select.form-input option {
     background-color: #1f2937 !important;
     color: #ffffff !important;
   }
   ```

2. **Use Color Scheme:**
   ```css
   select.form-input {
     color-scheme: light dark;
   }
   ```

3. **Consider Custom Dropdown:**
   ```html
   <!-- If native select styling fails, use Alpine.js dropdown -->
   <div x-data="{ open: false }" class="relative">
     <button @click="open = !open">Select Option</button>
     <div x-show="open" class="absolute bg-white dark:bg-gray-800">
       <!-- Custom options -->
     </div>
   </div>
   ```

## API & Backend Issues

### Issue: CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- Preflight request failures
- API calls blocked by browser

**Solutions:**

1. **Update CORS Configuration:**
   ```javascript
   // In complete_backend.js
   app.use(cors({
     origin: ['http://localhost:8090', 'http://192.168.1.24:5174'],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **Check Request Headers:**
   ```javascript
   // Verify API requests include proper headers
   const response = await fetch(url, {
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     }
   });
   ```

### Issue: Authentication Failures

**Symptoms:**
- Login not working
- Token expired errors
- 401 Unauthorized responses

**Solutions:**

1. **Check Login Credentials:**
   ```javascript
   // Use demo credentials
   {
     "email": "admin@projecthub.local",
     "password": "admin123"
   }
   ```

2. **Verify Token Storage:**
   ```javascript
   // Check localStorage
   localStorage.getItem('access_token');
   localStorage.getItem('refresh_token');
   ```

3. **Test Token Refresh:**
   ```javascript
   async refreshToken() {
     const refreshToken = localStorage.getItem('refresh_token');
     if (!refreshToken) return false;
     
     try {
       const response = await fetch('/api/auth/refresh-token', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ refresh_token: refreshToken })
       });
       
       if (response.ok) {
         const data = await response.json();
         this.setToken(data.access_token);
         return true;
       }
     } catch (error) {
       console.error('Token refresh failed:', error);
     }
     return false;
   }
   ```

### Issue: API Endpoints Not Found

**Symptoms:**
- 404 errors for API calls
- Routes not responding
- Backend not handling requests

**Solutions:**

1. **Check Backend Server:**
   ```bash
   # Ensure backend is running
   ps aux | grep node
   curl http://localhost:3009/api/projects
   ```

2. **Verify Route Definitions:**
   ```javascript
   // In complete_backend.js, check for:
   app.get('/api/projects', (req, res) => { /* ... */ });
   app.post('/api/webhooks', (req, res) => { /* ... */ });
   ```

3. **Check API Base URL:**
   ```javascript
   // In app-webhook-final.js
   const API_BASE = '/api'; // Should match backend routes
   ```

## Chart & Analytics Issues

### Issue: Charts Not Rendering

**Symptoms:**
- Empty chart containers
- "Chart is not defined" errors
- Canvas elements not displaying

**Solutions:**

1. **Check Chart.js CDN:**
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   ```

2. **Verify Canvas Elements:**
   ```html
   <canvas id="projectStatusChart" width="400" height="300"></canvas>
   ```

3. **Debug Chart Creation:**
   ```javascript
   _updateChartsNow() {
     // Check if Chart.js is available
     if (typeof Chart === 'undefined') {
       console.warn('Chart.js not loaded yet');
       return;
     }
     
     // Verify canvas exists
     const canvas = document.getElementById('projectStatusChart');
     if (!canvas) {
       console.error('Canvas element not found');
       return;
     }
   }
   ```

### Issue: Charts Not Updating

**Symptoms:**
- Charts show old data
- Data changes don't reflect
- Multiple chart instances

**Solutions:**

1. **Destroy Previous Charts:**
   ```javascript
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

2. **Update Data Reference:**
   ```javascript
   // Update chart data
   chart.data.datasets[0].data = newData;
   chart.update();
   ```

### Issue: Chart Memory Leaks

**Symptoms:**
- Increasing memory usage
- Browser becomes slow
- Multiple chart instances

**Solutions:**

1. **Implement Proper Cleanup:**
   ```javascript
   $watch('currentView', async (value, oldValue) => {
     if (oldValue === 'analytics') {
       this.destroyAllCharts();
     }
   });
   ```

2. **Use Global Chart Registry:**
   ```javascript
   window._projectHubApp.chartInstances = {};
   
   // Store chart reference
   window._projectHubApp.chartInstances.projectStatus = new Chart(/* ... */);
   ```

## Form & Input Issues

### Issue: Form Validation Not Working

**Symptoms:**
- Required fields not validated
- Form submits with invalid data
- No error messages shown

**Solutions:**

1. **Add HTML5 Validation:**
   ```html
   <input x-model="newProject.name" 
          required 
          minlength="3"
          class="form-input">
   ```

2. **Implement Custom Validation:**
   ```javascript
   validateForm() {
     if (!this.newProject.name.trim()) {
       Alpine.store('toasts').add('Project name is required', 'error');
       return false;
     }
     return true;
   }
   
   async createProject() {
     if (!this.validateForm()) return;
     // Proceed with creation
   }
   ```

### Issue: x-model Not Syncing

**Symptoms:**
- Input values don't update data
- Data changes don't update inputs
- Two-way binding broken

**Solutions:**

1. **Check Property Names:**
   ```html
   <!-- Ensure property exists in data -->
   <input x-model="projectSearch"> <!-- ✓ -->
   <input x-model="projectSeacrh"> <!-- ✗ Typo -->
   ```

2. **Initialize Properties:**
   ```javascript
   // Ensure all x-model properties are initialized
   {
     projectSearch: '',
     projectFilter: { status: '' },
     newProject: { name: '', description: '', status: 'planning' }
   }
   ```

### Issue: Dropdown Options Not Showing

**Symptoms:**
- Select dropdown appears empty
- Options not populated
- Dynamic options not updating

**Solutions:**

1. **Check Data Source:**
   ```javascript
   // Ensure data is loaded
   console.log('Projects:', this.projects);
   console.log('Task statuses:', this.taskStatuses);
   ```

2. **Verify Template Syntax:**
   ```html
   <select x-model="selectedProject" class="form-input">
     <option value="">Select project...</option>
     <template x-for="project in projects" :key="project.id">
       <option :value="project.id" x-text="project.name"></option>
     </template>
   </select>
   ```

## Modal & UI Issues

### Issue: Modals Not Displaying

**Symptoms:**
- Modal doesn't appear when triggered
- Modal shows but not visible
- Backdrop but no content

**Solutions:**

1. **Check z-index Values:**
   ```css
   .modal-backdrop { z-index: 9999; }
   .modal-content { z-index: 10000; }
   ```

2. **Verify Show Condition:**
   ```html
   <div x-show="showCreateProjectModal" x-cloak>
     <!-- Modal content -->
   </div>
   ```

3. **Debug Modal State:**
   ```javascript
   // In browser console
   $store.app.showCreateProjectModal = true;
   ```

### Issue: Modal Content Not Loading

**Symptoms:**
- Modal appears but content is empty
- Form fields not populated
- Loading state persists

**Solutions:**

1. **Use Conditional Rendering:**
   ```html
   <template x-if="editingWebhook && editingWebhook.id">
     <form @submit.prevent="updateWebhook">
       <!-- Form content -->
     </form>
   </template>
   ```

2. **Check Data Initialization:**
   ```javascript
   editWebhook(webhook) {
     this.editingWebhook = { ...webhook };
     this.showEditWebhookModal = true;
   }
   ```

### Issue: Modal Backdrop Not Working

**Symptoms:**
- Can't close modal by clicking outside
- Backdrop click not registered
- Modal stuck open

**Solutions:**

1. **Check Event Handler:**
   ```html
   <div class="fixed inset-0 bg-black bg-opacity-50" 
        @click="showModal = false"></div>
   ```

2. **Prevent Event Bubbling:**
   ```html
   <div class="modal-content" @click.stop>
     <!-- Prevent backdrop click when clicking modal content -->
   </div>
   ```

## Performance Issues

### Issue: Slow Page Loading

**Symptoms:**
- Long initial load times
- Blank screen during loading
- Resources taking time to load

**Solutions:**

1. **Check CDN Resources:**
   ```html
   <!-- Ensure CDNs are accessible -->
   <script src="https://cdn.tailwindcss.com"></script>
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
   ```

2. **Optimize Image Loading:**
   ```html
   <img src="image.jpg" loading="lazy" alt="Description">
   ```

3. **Use Loading States:**
   ```html
   <div x-show="globalLoading" class="loading-spinner">
     Loading...
   </div>
   ```

### Issue: Memory Leaks

**Symptoms:**
- Increasing memory usage
- Browser becomes unresponsive
- Page crashes after extended use

**Solutions:**

1. **Clean Up Event Listeners:**
   ```javascript
   beforeDestroy() {
     if (this._chartUpdateTimeout) {
       clearTimeout(this._chartUpdateTimeout);
     }
     this.destroyAllCharts();
   }
   ```

2. **Remove Chart Instances:**
   ```javascript
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

## Browser Compatibility

### Issue: Features Not Working in Safari

**Symptoms:**
- Specific features broken in Safari
- CSS not rendering correctly
- JavaScript errors

**Solutions:**

1. **Check Safari-specific CSS:**
   ```css
   /* Safari-specific fixes */
   -webkit-appearance: none;
   -webkit-transform: translateZ(0);
   ```

2. **Use Polyfills if Needed:**
   ```html
   <!-- For older browsers -->
   <script src="https://polyfill.io/v3/polyfill.min.js"></script>
   ```

### Issue: Internet Explorer Compatibility

**Symptoms:**
- Page not loading in IE
- Modern JavaScript features failing
- CSS Grid/Flexbox issues

**Solutions:**

1. **Check Browser Support:**
   ```javascript
   // Alpine.js requires modern browser
   if (!window.Proxy) {
     alert('Please use a modern browser');
   }
   ```

2. **Add Browser Warning:**
   ```html
   <!--[if IE]>
   <div class="browser-warning">
     This application requires a modern browser.
   </div>
   <![endif]-->
   ```

## Development Issues

### Issue: Hot Reload Not Working

**Symptoms:**
- Changes not reflecting
- Need manual refresh
- Development server issues

**Solutions:**

1. **Clear Browser Cache:**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Check File Timestamps:**
   ```bash
   # Verify files are being updated
   ls -la index-complete.html app-webhook-final.js
   ```

3. **Use Cache Busting:**
   ```html
   <script src="app-webhook-final.js?v=1751364000"></script>
   ```

### Issue: Console Errors During Development

**Symptoms:**
- Many console errors
- Warnings about dependencies
- Debug messages cluttering console

**Solutions:**

1. **Suppress Known Warnings:**
   ```javascript
   // Suppress Tailwind production warning
   console.warn = (function() {
     const originalWarn = console.warn;
     return function(...args) {
       if (args[0] && args[0].includes('cdn.tailwindcss.com should not be used in production')) {
         return;
       }
       return originalWarn.apply(console, args);
     };
   })();
   ```

2. **Add Debug Mode:**
   ```javascript
   const DEBUG = localStorage.getItem('debug') === 'true';
   
   function debugLog(...args) {
     if (DEBUG) {
       console.log('[DEBUG]', ...args);
     }
   }
   ```

## Quick Debugging Commands

### Browser Console Commands

```javascript
// Check Alpine.js status
Alpine.version

// Access app data
$store.app

// Check authentication
localStorage.getItem('access_token')

// Force dark mode
document.documentElement.classList.add('dark')

// Clear all localStorage
localStorage.clear()

// Check API connectivity
fetch('/api/health').then(r => r.json()).then(console.log)

// Check current view
$store.app.currentView

// Force chart update
$store.app.updateCharts()

// Check project data
$store.app.projects

// Test webhook
$store.app.webhooks[0]
```

### Network Debugging

```bash
# Check backend server
curl http://localhost:3009/health

# Test API endpoints
curl http://localhost:3009/api/projects
curl http://localhost:3009/api/webhooks

# Check frontend server
curl http://localhost:8090

# Test CORS
curl -H "Origin: http://localhost:8090" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3009/api/projects
```

### Docker Debugging

```bash
# Check container status
docker ps -a

# View container logs
docker logs projecthub-complete-frontend
docker logs projecthub-complete-backend

# Enter container
docker exec -it projecthub-complete-frontend sh

# Check file contents
docker exec projecthub-complete-frontend cat /usr/share/nginx/html/index.html

# Restart container
docker restart projecthub-complete-frontend
```

---

**If you encounter an issue not covered here, please check the main [README.md](../README.md) or create an issue on GitHub.**