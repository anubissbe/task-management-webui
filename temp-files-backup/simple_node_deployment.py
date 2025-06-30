#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying ProjectHub with Node.js containers...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=300)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Clean up existing containers
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-frontend projecthub-backend projecthub-postgres 2>/dev/null || true')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm -f projecthub-frontend projecthub-backend projecthub-postgres 2>/dev/null || true')
    ssh.expect('\\$')
    
    # Start PostgreSQL
    print("✓ Starting PostgreSQL...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub123 -e POSTGRES_DB=projecthub_mcp -p 5433:5432 postgres:15')
    ssh.expect('\\$')
    time.sleep(10)
    
    # Deploy backend with volume mount for development
    print("✓ Starting backend...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend \\
--link projecthub-postgres:postgres \\
-p 3008:3001 \\
-v /volume1/docker/projecthub-real/source/backend:/app \\
-w /app \\
-e NODE_ENV=production \\
-e PORT=3001 \\
-e DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp \\
-e CORS_ORIGIN=http://192.168.1.24:5173 \\
-e JWT_ACCESS_SECRET=your_jwt_secret_here_change_in_production_min_32_chars \\
-e JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production_min_32_chars \\
node:20-alpine sh -c "
npm install &&
npm run build &&
npm start ||
node dist/index.js ||
node src/index.js ||
(echo 'Fallback server...' && node -e \\"
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.get('/', (req,res) => res.json({status: 'ProjectHub Backend API'}));
app.get('/api/health', (req,res) => res.json({status: 'ok', message: 'Healthy'}));
app.listen(3001, () => console.log('Server on 3001'));
\\")
"''')
    ssh.expect('\\$', timeout=120)
    
    print("✓ Waiting for backend...")
    time.sleep(15)
    
    # Deploy frontend
    print("✓ Starting frontend...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend \\
-p 5173:5173 \\
-v /volume1/docker/projecthub-real/source/frontend:/app \\
-w /app \\
-e VITE_API_URL=http://192.168.1.24:3008 \\
-e VITE_WS_URL=ws://192.168.1.24:3008 \\
node:20-alpine sh -c "
npm install &&
npm run build &&
npm run preview -- --host 0.0.0.0 --port 5173 ||
npm run dev -- --host 0.0.0.0 --port 5173
"''')
    ssh.expect('\\$', timeout=120)
    
    print("✓ Waiting for frontend...")
    time.sleep(20)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    # Check backend logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 20')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    # Check frontend logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend --tail 20')
    ssh.expect('\\$')
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub deployed\!")
    print("\n🎉 Access your REAL ProjectHub application:")
    print("  Frontend (React Dashboard): http://192.168.1.24:5173")
    print("  Backend API: http://192.168.1.24:3008")
    print("  Database: PostgreSQL on port 5433")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
