#\!/usr/bin/env python3
import pexpect
import time

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking backend status...")

# Check all containers
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps -a | grep projecthub-backend')
ssh.expect('\\$')
print("Backend container status:")
print(ssh.before)

# Check backend logs if exists
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend 2>&1 || echo "No backend logs"')
ssh.expect('\\$', timeout=30)
print("\nBackend logs:")
print(ssh.before)

# Start backend if needed
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker start projecthub-backend 2>/dev/null || echo "Backend not found, creating new one..."')
ssh.expect('\\$')

# Check if it started
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub-backend')
index = ssh.expect(['projecthub-backend', '\\$'], timeout=10)

if index == 1:  # No backend running
    print("\nCreating new backend...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend-new \\
-p 3008:3001 \\
node:20-alpine sh -c "
npm init -y &&
npm install express cors bcryptjs jsonwebtoken &&
cat > server.js << 'EOJS'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Demo login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials
  if ((email === 'admin@projecthub.com' && password === 'admin123') ||
      (email === 'demo@projecthub.com' && password === 'demo123')) {
    res.json({
      token: 'demo-jwt-token-' + Date.now(),
      user: { 
        id: 1, 
        email: email, 
        name: email === 'admin@projecthub.com' ? 'Admin User' : 'Demo User',
        role: email === 'admin@projecthub.com' ? 'admin' : 'user'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectHub backend with auth',
    version: '4.5.1'
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 1, name: 'Enterprise Dashboard', status: 'active', progress: 75 },
      { id: 2, name: 'Team Collaboration', status: 'completed', progress: 100 },
      { id: 3, name: 'Kanban Board', status: 'active', progress: 85 }
    ]
  });
});

app.listen(3001, '0.0.0.0', () => {
  console.log('ProjectHub Backend with Auth running on port 3001');
  console.log('Login: admin@projecthub.com / admin123 or demo@projecthub.com / demo123');
});
EOJS
node server.js
"''')
    ssh.expect('\\$', timeout=60)
    time.sleep(10)

# Final status check
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
ssh.expect('\\$')
print("\nFinal container status:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
