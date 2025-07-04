const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Use Node 18+ built-in fetch
const fetch = globalThis.fetch;
const { sanitizeForLog, isValidWebhookUrl, checkRateLimit } = require('./security-utils');

const app = express();
const port = process.env.PORT || 3010;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://projecthub:projecthub123@postgres:5432/projecthub',
  ssl: false  // Disable SSL for local PostgreSQL
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// CORS middleware
const corsOptions = {
  origin: function(origin, callback) {
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8090', 'http://localhost:8091', 'http://localhost:8092',
      'http://localhost:5174', 'http://localhost:3000',
      'http://127.0.0.1:8090', 'http://127.0.0.1:8091', 'http://127.0.0.1:8092',
      'http://127.0.0.1:5174', 'http://127.0.0.1:3000'
    ];
    
    if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS rejected origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const key = req.ip || 'unknown';
  const endpoint = req.path;
  
  // Different limits for different endpoints
  let maxRequests = 100;
  if (endpoint.includes('/auth/login')) {
    maxRequests = 5; // Strict limit for login attempts
  } else if (endpoint.includes('/webhooks') && endpoint.includes('/test')) {
    maxRequests = 10; // Limit webhook tests
  }
  
  if (!checkRateLimit(`${key}:${endpoint}`, maxRequests, 60000)) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
  
  next();
};

// Apply rate limiting to all routes
app.use(rateLimitMiddleware);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For development, allow simple password or check bcrypt
    const validPassword = password === 'dev123' || await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    const projects = result.rows.map(project => ({
      ...project,
      total_tasks: parseInt(project.total_tasks) || 0,
      completed_tasks: parseInt(project.completed_tasks) || 0,
      in_progress_tasks: parseInt(project.in_progress_tasks) || 0,
      pending_tasks: parseInt(project.pending_tasks) || 0
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Project fetch error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, description, status = 'active', priority = 'medium' } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO projects (name, description, status, priority, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [name, description, status, priority]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Project creation error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // First, delete all tasks associated with the project
    await pool.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
    
    // Then delete the project
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [projectId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Project deletion error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tasks endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = `
      SELECT t.*, p.name as project_name, u.first_name, u.last_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
    `;
    let params = [];
    
    if (projectId) {
      query += ' WHERE t.project_id = $1';
      params = [projectId];
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    
    const tasks = result.rows.map(task => ({
      ...task,
      assignee: task.first_name ? `${task.first_name} ${task.last_name}` : null
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error('Tasks fetch error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, project_id, priority = 'medium', status = 'pending', assignee_id } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO tasks (title, description, project_id, priority, status, assignee_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [title, description, project_id, priority, status, assignee_id]);
    
    const task = result.rows[0];
    
    // Get project for webhook notification
    const projectResult = await pool.query('SELECT name FROM projects WHERE id = $1', [project_id]);
    const project = projectResult.rows[0];
    
    // Trigger webhook notification
    try {
      await triggerWebhookNotification('task.created', {
        title: task.title,
        description: task.description,
        projectName: project ? project.name : 'Unknown Project',
        priority: task.priority,
        createdBy: req.user ? `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() : 'System'
      });
    } catch (webhookError) {
      console.error('Webhook notification error:', sanitizeForLog(webhookError.message));
    }
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Get current task
    const currentResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const currentTask = currentResult.rows[0];
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE tasks 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    const updatedTask = result.rows[0];
    
    // Check if task was completed
    if (currentTask.status !== 'completed' && updatedTask.status === 'completed') {
      // Get project for webhook notification
      const projectResult = await pool.query('SELECT name FROM projects WHERE id = $1', [updatedTask.project_id]);
      const project = projectResult.rows[0];
      
      // Trigger webhook notification
      try {
        await triggerWebhookNotification('task.completed', {
          title: updatedTask.title,
          projectName: project ? project.name : 'Unknown Project',
          priority: updatedTask.priority,
          completedBy: req.user ? `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() : 'System'
        });
      } catch (webhookError) {
        console.error('Webhook notification error:', sanitizeForLog(webhookError.message));
      }
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Task update error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Task deletion error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook Management
app.get('/api/webhooks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM webhooks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Webhooks fetch error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/webhooks', async (req, res) => {
  const { name, url, events, active = true } = req.body;
  
  // Validate webhook URL
  if (!isValidWebhookUrl(url)) {
    return res.status(400).json({ error: 'Invalid webhook URL. Only HTTPS URLs to public endpoints are allowed.' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO webhooks (name, url, events, active, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [name, url, JSON.stringify(events), active]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Webhook creation error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/webhooks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, url, events, active } = req.body;
  
  // Validate webhook URL if provided
  if (url && !isValidWebhookUrl(url)) {
    return res.status(400).json({ error: 'Invalid webhook URL. Only HTTPS URLs to public endpoints are allowed.' });
  }
  
  try {
    const result = await pool.query(`
      UPDATE webhooks 
      SET name = $1, url = $2, events = $3, active = $4
      WHERE id = $5
      RETURNING *
    `, [name, url, JSON.stringify(events), active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Webhook update error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/webhooks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM webhooks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Webhook deletion error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook test endpoint
app.post('/api/webhooks/:id/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM webhooks WHERE id = $1', [req.params.id]);
    const webhook = result.rows[0];
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // Validate webhook URL before testing
    if (!isValidWebhookUrl(webhook.url)) {
      return res.status(400).json({ 
        error: 'Invalid webhook URL', 
        details: 'The webhook URL is not valid or points to a restricted endpoint.' 
      });
    }
    
    const testMessage = {
      text: '✅ ProjectHub webhook test successful!',
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '✅ *ProjectHub Webhook Test*\nYour webhook integration is working correctly!'
        }
      }]
    };
    
    // Set timeout to prevent hanging requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Update last_triggered
      await pool.query('UPDATE webhooks SET last_triggered = NOW() WHERE id = $1', [webhook.id]);
      
      res.json({ success: true, message: 'Test notification sent successfully!' });
    } catch (fetchError) {
      clearTimeout(timeout);
      throw fetchError;
    }
  } catch (error) {
    console.error('Webhook test error:', sanitizeForLog(error.message));
    res.status(400).json({ 
      success: false, 
      error: 'Failed to send test notification', 
      details: error.name === 'AbortError' ? 'Request timeout' : 'Connection failed'
    });
  }
});

// Webhook notification function
async function triggerWebhookNotification(event, data) {
  try {
    const result = await pool.query('SELECT * FROM webhooks WHERE active = true AND events @> $1', [`["${event}"]`]);
    const webhooks = result.rows;
    
    for (const webhook of webhooks) {
      try {
        // Skip invalid webhook URLs
        if (!isValidWebhookUrl(webhook.url)) {
          console.error(`Skipping invalid webhook URL for webhook ${webhook.id}`);
          continue;
        }
        let message;
        
        switch (event) {
          case 'task.created':
            message = {
              text: `New task created: ${data.title}`,
              blocks: [{
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🆕 New Task Created'
                }
              }, {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Task:* ${data.title}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Project:* ${data.projectName || 'N/A'}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Priority:* ${data.priority || 'medium'}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Created by:* ${data.createdBy || 'System'}`
                  }
                ]
              }]
            };
            break;
            
          case 'task.completed':
            message = {
              text: `Task completed: ${data.title}`,
              blocks: [{
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `✅ *Task Completed*\n"${data.title}" has been marked as complete!`
                }
              }]
            };
            break;
            
          default:
            message = {
              text: `ProjectHub notification: ${event}`,
              blocks: [{
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `📢 *${event}*\n${JSON.stringify(data, null, 2)}`
                }
              }]
            };
        }
        
        // Add timeout for webhook calls
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
            signal: controller.signal
          });
          
          clearTimeout(timeout);
          
          if (response.ok) {
            await pool.query('UPDATE webhooks SET last_triggered = NOW() WHERE id = $1', [webhook.id]);
          }
        } catch (fetchError) {
          clearTimeout(timeout);
          console.error(`Webhook ${webhook.id} error:`, sanitizeForLog(fetchError.message));
        }
      } catch (error) {
        console.error(`Webhook ${webhook.id} error:`, sanitizeForLog(error.message));
      }
    }
  } catch (error) {
    console.error('Webhook notification error:', sanitizeForLog(error.message));
  }
}

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    // Basic task statistics
    let taskQuery = 'SELECT status, priority, COUNT(*) as count FROM tasks';
    let params = [];
    
    if (projectId) {
      taskQuery += ' WHERE project_id = $1';
      params = [projectId];
    }
    
    taskQuery += ' GROUP BY status, priority';
    
    const taskStats = await pool.query(taskQuery, params);
    
    // Project statistics
    const projectStats = await pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
      FROM projects
    `);
    
    res.json({
      taskStats: taskStats.rows,
      projectStats: projectStats.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, first_name, last_name, role, created_at, last_login, is_active FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Users fetch error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { first_name, last_name, email, password, role = 'user' } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // For simplicity, store password as-is (in production, use bcrypt)
    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at, is_active)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true)
      RETURNING id, email, first_name, last_name, role, created_at, is_active
    `, [first_name, last_name, email, password, role]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('User creation error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role, is_active } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, role = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, email, first_name, last_name, role, created_at, is_active
    `, [first_name, last_name, email, role, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('User update error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if user exists and get their role
    const checkUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userToDelete = checkUser.rows[0];
    
    // Check if trying to delete the last admin
    if (userToDelete.role === 'admin') {
      const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
      if (parseInt(adminCount.rows[0].count) === 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    res.status(204).send();
  } catch (error) {
    console.error('User deletion error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 ProjectHub Backend running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Default PostgreSQL'}`);
  console.log(`🔗 CORS: ${process.env.CORS_ORIGIN || 'Default origins'}`);
});