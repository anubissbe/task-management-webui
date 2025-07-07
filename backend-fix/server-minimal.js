const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Security utility function to sanitize log output
function sanitizeForLog(input) {
  if (typeof input !== 'string') {
    input = String(input);
  }
  // Remove control characters and newlines to prevent log injection
  return input.replace(/[\r\n\x00-\x1f\x7f]/g, '');
}

const app = express();
const port = process.env.PORT || 3010;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://projecthub:projecthub123@localhost:5434/projecthub',
  ssl: false
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

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 authentication attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use(cors({ origin: '*' }));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Simplified auth endpoint
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', sanitizeForLog(email));
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Temporary: accept admin123 for admin user
    if (email === 'admin@projecthub.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
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
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 ProjectHub Backend (Minimal) running on port ${port}`);
});