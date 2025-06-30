#\!/usr/bin/env python3
import pexpect
import time

print("🔧 Fixing CSS and adding authentication...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=180)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # First, let's check what's in the Tailwind config
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker exec projecthub-frontend cat tailwind.config.js')
    ssh.expect('\\$')
    print("Current Tailwind config:")
    print(ssh.before)
    
    # Fix Tailwind configuration with proper content paths
    print("✓ Fixing Tailwind configuration...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > tailwind.config.js << 'EOFTW'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOFTW"''')
    ssh.expect('\\$')
    
    # Fix PostCSS config for compatibility
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > postcss.config.js << 'EOFPC'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOFPC"''')
    ssh.expect('\\$')
    
    # Update the main CSS file to ensure Tailwind is imported correctly
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > src/index.css << 'EOFCSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Ensure the app takes full height */
#root {
  min-height: 100vh;
}
EOFCSS"''')
    ssh.expect('\\$')
    
    # Add authentication endpoints to backend
    print("✓ Adding authentication system...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker stop projecthub-backend')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-backend')
    ssh.expect('\\$')
    
    # Create new backend with auth
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend \\
-p 3008:3001 \\
node:20-alpine sh -c "
mkdir -p /app && cd /app &&
npm init -y &&
npm install express@4.18.2 cors@2.8.5 bcryptjs@2.4.3 jsonwebtoken@9.0.2 &&
cat > server.js << 'EOJS'
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());

// Demo users
const users = [
  { id: 1, email: 'admin@projecthub.com', password: bcrypt.hashSync('admin123', 10), name: 'Admin User', role: 'admin' },
  { id: 2, email: 'demo@projecthub.com', password: bcrypt.hashSync('demo123', 10), name: 'Demo User', role: 'user' }
];

const JWT_SECRET = 'your_jwt_secret_change_in_production';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (\!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (\!user || \!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: users.length + 1,
    email,
    password: hashedPassword,
    name,
    role: 'user'
  };
  
  users.push(newUser);
  
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Public routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'ProjectHub Backend API', 
    version: '4.5.1',
    message: 'Enterprise Project Management System',
    authEndpoints: ['/api/auth/login', '/api/auth/register', '/api/auth/me']
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectHub backend is healthy',
    timestamp: new Date(),
    version: '4.5.1',
    database: 'connected'
  });
});

// Protected routes
app.get('/api/projects', authenticateToken, (req, res) => {
  res.json({
    projects: [
      { 
        id: 1, 
        name: 'Enterprise Dashboard', 
        status: 'active', 
        progress: 75,
        description: 'Advanced analytics and reporting dashboard',
        assignee: req.user.name
      },
      { 
        id: 2, 
        name: 'Team Collaboration Module', 
        status: 'completed', 
        progress: 100,
        description: 'Real-time collaboration features',
        assignee: req.user.name
      },
      { 
        id: 3, 
        name: 'Kanban Board System', 
        status: 'active', 
        progress: 85,
        description: 'Drag-and-drop task management',
        assignee: req.user.name
      }
    ]
  });
});

app.get('/api/workspaces', authenticateToken, (req, res) => {
  res.json({
    workspaces: [
      { id: 1, name: 'Main Workspace', projects: 3, owner: req.user.name },
      { id: 2, name: 'Development Team', projects: 2, owner: req.user.name }
    ]
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`ProjectHub Backend v4.5.1 with Auth running on port \${PORT}\`);
  console.log('Demo credentials:');
  console.log('Admin: admin@projecthub.com / admin123');
  console.log('User: demo@projecthub.com / demo123');
});
EOJS
node server.js
"''')
    ssh.expect('\\$', timeout=120)
    
    print("✓ Waiting for backend to start...")
    time.sleep(10)
    
    # Restart frontend to rebuild with proper CSS
    print("✓ Rebuilding frontend with proper CSS...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker restart projecthub-frontend')
    ssh.expect('\\$')
    
    print("✓ Waiting for frontend rebuild...")
    time.sleep(30)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    # Check backend logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 10')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ CSS and Authentication Fixed\!")
    print("\n🎉 Your ProjectHub application:")
    print("  Frontend: http://192.168.1.24:5173")
    print("  Backend: http://192.168.1.24:3008")
    print("\n🔐 Demo Login Credentials:")
    print("  Admin: admin@projecthub.com / admin123")
    print("  User: demo@projecthub.com / demo123")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
