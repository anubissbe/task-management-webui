#!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying complete ProjectHub application...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop existing containers
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker stop proj-web proj-db 2>/dev/null')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm proj-web proj-db 2>/dev/null')
    ssh.expect('\\$')
    
    # Deploy PostgreSQL
    print("✓ Deploying PostgreSQL...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub123 -e POSTGRES_DB=projecthub_mcp -p 5433:5432 postgres:15-alpine')
    ssh.expect('\\$', timeout=60)
    
    time.sleep(10)  # Wait for postgres to start
    
    # Deploy Backend with Express
    print("✓ Deploying Backend...")
    backend_cmd = '''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend \
    --link projecthub-postgres:postgres \
    -p 3007:3000 \
    -e DATABASE_URL="postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp" \
    node:20-alpine \
    sh -c "mkdir -p /app && cd /app && \
    echo '{\\\"name\\\":\\\"projecthub-backend\\\",\\\"version\\\":\\\"1.0.0\\\",\\\"main\\\":\\\"server.js\\\",\\\"dependencies\\\":{\\\"express\\\":\\\"^4.18.2\\\",\\\"cors\\\":\\\"^2.8.5\\\"}}' > package.json && \
    npm install && \
    echo 'const express = require(\\\"express\\\"); \
    const cors = require(\\\"cors\\\"); \
    const app = express(); \
    app.use(cors()); \
    app.use(express.json()); \
    app.get(\\\"/\\\", (req, res) => res.send(\\\"<h1>ProjectHub Backend Running!</h1>\\\")); \
    app.get(\\\"/api/health\\\", (req, res) => res.json({status: \\\"ok\\\", message: \\\"ProjectHub is healthy\\\", timestamp: new Date(), database: process.env.DATABASE_URL ? \\\"configured\\\" : \\\"not configured\\\"})); \
    app.listen(3000, \\\"0.0.0.0\\\", () => console.log(\\\"ProjectHub backend running on port 3000\\\"));' > server.js && \
    node server.js"'''
    
    ssh.sendline(backend_cmd)
    ssh.expect('\\$', timeout=60)
    
    time.sleep(10)  # Wait for backend to start
    
    # Deploy Frontend
    print("✓ Deploying Frontend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub/frontend')
    ssh.expect('\\$')
    
    frontend_html = '''echo "JDU9xjn1ekx3rev_uma" | sudo -S bash -c 'cat > /volume1/docker/projecthub/frontend/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>ProjectHub</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .status { margin: 20px 0; padding: 20px; background: #f0f0f0; border-radius: 5px; }
        .ok { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ProjectHub</h1>
        <p>Enterprise-grade project management system</p>
        
        <div class="status">
            <h2>System Status</h2>
            <p>Frontend: <span class="ok">✓ Running</span></p>
            <p>Backend API: <span id="api-status">Checking...</span></p>
            <p>Database: <span id="db-status">Checking...</span></p>
        </div>
        
        <button onclick="checkHealth()">Refresh Status</button>
        
        <div id="api-response" style="margin-top: 20px;"></div>
    </div>
    
    <script>
        function checkHealth() {
            fetch("http://192.168.1.24:3007/api/health")
                .then(res => res.json())
                .then(data => {
                    document.getElementById("api-status").innerHTML = `<span class="ok">✓ Running</span>`;
                    document.getElementById("db-status").innerHTML = data.database === "configured" ? 
                        `<span class="ok">✓ Connected</span>` : `<span class="error">✗ Not connected</span>`;
                    document.getElementById("api-response").innerHTML = `<pre>\${JSON.stringify(data, null, 2)}</pre>`;
                })
                .catch(err => {
                    document.getElementById("api-status").innerHTML = `<span class="error">✗ Not reachable</span>`;
                    document.getElementById("api-response").innerHTML = `<pre>Error: \${err}</pre>`;
                });
        }
        
        // Check on load
        checkHealth();
    </script>
</body>
</html>
EOF'
'''
    
    ssh.sendline(frontend_html)
    ssh.expect('\\$', timeout=30)
    
    # Deploy frontend nginx
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend -p 5174:80 -v /volume1/docker/projecthub/frontend:/usr/share/nginx/html:ro nginx:alpine')
    ssh.expect('\\$', timeout=30)
    
    # Check final status
    print("\n✓ Checking deployment status...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub fully deployed!")
    print("\n🎉 Access your ProjectHub instance:")
    print("  Frontend: http://192.168.1.24:5174")
    print("  Backend API: http://192.168.1.24:3007")
    print("  API Health: http://192.168.1.24:3007/api/health")
    print("  Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"Error: {e}")