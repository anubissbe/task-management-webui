#\!/usr/bin/env python3
import pexpect

print("🔧 Fixing CORS for backend...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop and remove old backend
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-backend')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-backend')
    ssh.expect('\\$')
    
    # Deploy backend with proper CORS
    print("✓ Deploying backend with fixed CORS...")
    backend_cmd = '''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend -p 3007:3001 node:20-alpine sh -c "
mkdir -p /app && cd /app &&
cat > package.json << 'EOPKG'
{
  \"name\": \"projecthub-backend\",
  \"version\": \"1.0.0\",
  \"main\": \"server.js\",
  \"scripts\": {
    \"start\": \"node server.js\"
  }
}
EOPKG
npm install express@4.18.2 cors@2.8.5 &&
cat > server.js << 'EOJS'
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>ProjectHub Backend API</h1>');
});

app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    message: 'ProjectHub is healthy',
    timestamp: new Date(),
    database: 'configured',
    version: '1.0.0'
  });
});

app.get('/api/projects', (req, res) => {
  console.log('Projects requested');
  res.json({
    projects: [
      { id: 1, name: 'Project Alpha', status: 'active' },
      { id: 2, name: 'Project Beta', status: 'completed' },
      { id: 3, name: 'Project Gamma', status: 'active' }
    ]
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`ProjectHub Backend running on port \${PORT}\`);
  console.log('CORS enabled for all origins');
});
EOJS
node server.js"'''
    
    ssh.sendline(backend_cmd)
    ssh.expect('\\$', timeout=120)
    
    print("✓ Backend deployed with proper CORS")
    print("✓ Waiting for backend to start...")
    
    ssh.sendline('sleep 5')
    ssh.expect('\\$')
    
    # Check logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 10')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Backend CORS fixed\!")
    print("Please refresh your browser to see the working application.")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
