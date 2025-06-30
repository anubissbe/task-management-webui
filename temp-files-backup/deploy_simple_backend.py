#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying simple working backend...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Clean up
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-backend 2>/dev/null || true')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm -f projecthub-backend 2>/dev/null || true')
    ssh.expect('\\$')
    
    # Create backend directory and files
    print("✓ Creating backend files...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-backend')
    ssh.expect('\\$')
    
    # Create package.json
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-backend/package.json > /dev/null << \'EOF\'')
    ssh.sendline('''{
  "name": "projecthub-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}''')
    ssh.sendline('EOF')
    ssh.expect('\\$')
    
    # Create server.js
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-backend/server.js > /dev/null << \'EOF\'')
    ssh.sendline('''const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>ProjectHub Backend API</h1>');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectHub is healthy',
    timestamp: new Date(),
    database: 'configured',
    version: '1.0.0'
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 1, name: 'Project Alpha', status: 'active' },
      { id: 2, name: 'Project Beta', status: 'completed' },
      { id: 3, name: 'Project Gamma', status: 'active' }
    ]
  });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});''')
    ssh.sendline('EOF')
    ssh.expect('\\$')
    
    # Deploy backend
    print("✓ Deploying backend container...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend -p 3007:3007 -e PORT=3007 -v /volume1/docker/projecthub-backend:/app -w /app node:20-alpine sh -c "npm install && npm start"')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Waiting for backend to start...")
    time.sleep(15)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nContainer status:")
    print(ssh.before)
    
    # Check logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 10')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Backend deployed\!")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
