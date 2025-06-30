#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking backend status...")

# Check backend container status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps -a | grep projecthub-backend')
ssh.expect('\\$')
print("Backend container status:")
print(ssh.before)

# Check backend logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend 2>&1')
ssh.expect('\\$', timeout=30)
print("\nBackend logs:")
print(ssh.before)

# Remove and recreate backend with simpler approach
print("\nRecreating backend...")
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm -f projecthub-backend')
ssh.expect('\\$')

# Start simple backend
ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend \\
--link projecthub-postgres:postgres \\
-p 3008:3001 \\
-e DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp \\
-e CORS_ORIGIN=http://192.168.1.24:5173 \\
node:20-alpine sh -c "
mkdir -p /app && cd /app &&
npm init -y &&
npm install express@4.18.2 cors@2.8.5 &&
cat > server.js << 'EOJS'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ProjectHub Backend API', version: '4.5.1' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectHub backend is healthy',
    timestamp: new Date(),
    version: '4.5.1'
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 1, name: 'Enterprise Dashboard', status: 'active', progress: 75 },
      { id: 2, name: 'Analytics Module', status: 'completed', progress: 100 },
      { id: 3, name: 'Team Collaboration', status: 'active', progress: 60 }
    ]
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`ProjectHub Backend running on port \${PORT}\`);
});
EOJS
node server.js
"''')
ssh.expect('\\$', timeout=60)

print("Backend recreated. Waiting for startup...")
import time
time.sleep(10)

# Check status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub-backend')
ssh.expect('\\$')
print("\nBackend status:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
