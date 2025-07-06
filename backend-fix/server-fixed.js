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

// JWT Secret - must be provided via environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

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

// Define allowed fields for task updates
const ALLOWED_TASK_FIELDS = [
  'title', 'description', 'status', 'priority', 'assignee_id', 
  'due_date', 'estimated_hours', 'actual_hours', 'progress',
  'notes', 'completed_at', 'started_at'
];

// Helper function to validate and filter update fields
const validateAndFilterTaskUpdates = (updates) => {
  const validUpdates = {};
  const errors = [];

  for (const [field, value] of Object.entries(updates)) {
    if (!ALLOWED_TASK_FIELDS.includes(field)) {
      errors.push(`Field '${field}' is not allowed for updates`);
      continue;
    }
    
    // Additional field-specific validation
    switch (field) {
      case 'status':
        if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(value)) {
          errors.push(`Invalid status value: ${value}`);
          continue;
        }
        break;
      case 'priority':
        if (!['low', 'medium', 'high'].includes(value)) {
          errors.push(`Invalid priority value: ${value}`);
          continue;
        }
        break;
      case 'progress':
        if (typeof value !== 'number' || value < 0 || value > 100) {
          errors.push(`Progress must be a number between 0 and 100`);
          continue;
        }
        break;
      case 'estimated_hours':
      case 'actual_hours':
        if (value !== null && (typeof value !== 'number' || value < 0)) {
          errors.push(`${field} must be a positive number or null`);
          continue;
        }
        break;
    }
    
    validUpdates[field] = value;
  }

  return { validUpdates, errors };
};

// Fixed PUT route with proper authentication and validation
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Validate task ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    // Validate and filter update fields
    const { validUpdates, errors } = validateAndFilterTaskUpdates(updates);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }

    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Get current task
    const currentResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const currentTask = currentResult.rows[0];
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Build safe update query with validated fields
    const fields = Object.keys(validUpdates);
    const values = Object.values(validUpdates);
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
          projectName: project ? project.name : 'Unassigned',
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

// Also add a route that allows anonymous updates for backwards compatibility (limited fields)
app.put('/api/tasks/:id/anonymous', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // For anonymous updates, only allow basic status updates
    const allowedFields = ['status', 'progress', 'notes'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields for anonymous update' });
    }

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    // Get current task
    const currentResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Build safe update query
    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE tasks 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Anonymous task update error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Placeholder for webhook functionality (needs to be copied from original)
async function triggerWebhookNotification(event, data) {
  // Implementation would be copied from the original server.js
  console.log('Webhook notification:', event, data);
}

// Add all other routes from the original server.js here...
// For now, I'll add a basic tasks GET route for testing

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as project_name,
             CONCAT(u.first_name, ' ', u.last_name) as assignee
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Tasks fetch error:', sanitizeForLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ProjectHub backend running on port ${port}`);
});

module.exports = app;