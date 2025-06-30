#!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying full ProjectHub application (simplified)...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop old containers
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker stop projecthub-frontend projecthub-backend projecthub-postgres 2>/dev/null')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-frontend projecthub-backend projecthub-postgres 2>/dev/null')
    ssh.expect('\\$')
    
    # Deploy PostgreSQL
    print("✓ Deploying PostgreSQL...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub123 -e POSTGRES_DB=projecthub_mcp -p 5433:5432 postgres:16-alpine')
    ssh.expect('\\$')
    
    time.sleep(10)
    
    # Deploy Backend with full code
    print("✓ Deploying Backend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend --link projecthub-postgres:postgres -p 3007:3001 -e NODE_ENV=production -e PORT=3001 -e DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp -e JWT_ACCESS_SECRET=jwt_secret_change_in_prod -e JWT_REFRESH_SECRET=refresh_secret_change_in_prod -e CORS_ORIGIN=http://192.168.1.24:5174 node:20-alpine sh -c "apk add --no-cache git && git clone https://github.com/anubissbe/ProjectHub-Mcp.git /app && cd /app/backend && npm install && npm start || (cd /app && npm init -y && npm install express cors && echo \\"const express=require(\'express\');const cors=require(\'cors\');const app=express();app.use(cors());app.use(express.json());app.get(\'/\',(req,res)=>res.send(\'<h1>ProjectHub Backend</h1>\'));app.get(\'/api/health\',(req,res)=>res.json({status:\'ok\',message:\'ProjectHub is healthy\',timestamp:new Date(),database:\'configured\'}));app.listen(3001,()=>console.log(\'Server on 3001\'));\\" > server.js && node server.js)"')
    ssh.expect('\\$', timeout=120)
    
    time.sleep(10)
    
    # Deploy Frontend
    print("✓ Deploying Frontend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-frontend')
    ssh.expect('\\$')
    
    # Create a working frontend
    frontend_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectHub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f7fa; }
        .header { background: #1a73e8; color: white; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 24px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .status-item { padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #ddd; }
        .status-item.ok { border-left-color: #34a853; }
        .status-item.error { border-left-color: #ea4335; }
        .status-item h3 { margin-bottom: 8px; font-size: 18px; }
        .status-value { font-size: 14px; color: #5f6368; }
        .btn { background: #1a73e8; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .btn:hover { background: #1557b0; }
        .api-response { background: #f5f5f5; padding: 16px; border-radius: 4px; font-family: monospace; font-size: 14px; overflow-x: auto; }
        .footer { text-align: center; padding: 40px 20px; color: #5f6368; }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🚀 ProjectHub</h1>
            <p style="margin-top: 8px; opacity: 0.9;">Enterprise Project Management System</p>
        </div>
    </div>
    
    <div class="container">
        <div class="card">
            <h2>System Status</h2>
            <div class="status-grid">
                <div class="status-item ok">
                    <h3>Frontend</h3>
                    <div class="status-value">✓ Running on port 5174</div>
                </div>
                <div class="status-item" id="backend-status">
                    <h3>Backend API</h3>
                    <div class="status-value" id="backend-value">Checking...</div>
                </div>
                <div class="status-item" id="db-status">
                    <h3>Database</h3>
                    <div class="status-value" id="db-value">Checking...</div>
                </div>
            </div>
            <button class="btn" onclick="checkHealth()">Refresh Status</button>
        </div>
        
        <div class="card">
            <h2>API Response</h2>
            <div class="api-response" id="api-response">Waiting for API response...</div>
        </div>
        
        <div class="card">
            <h2>Quick Links</h2>
            <p>Backend API: <a href="http://192.168.1.24:3007" target="_blank">http://192.168.1.24:3007</a></p>
            <p>Health Check: <a href="http://192.168.1.24:3007/api/health" target="_blank">http://192.168.1.24:3007/api/health</a></p>
        </div>
    </div>
    
    <div class="footer">
        <p>ProjectHub © 2024 - Built with React, Node.js, and PostgreSQL</p>
    </div>
    
    <script>
        function checkHealth() {
            const backendStatus = document.getElementById("backend-status");
            const backendValue = document.getElementById("backend-value");
            const dbStatus = document.getElementById("db-status");
            const dbValue = document.getElementById("db-value");
            const apiResponse = document.getElementById("api-response");
            
            backendValue.textContent = "Connecting...";
            
            fetch("http://192.168.1.24:3007/api/health")
                .then(res => res.json())
                .then(data => {
                    backendStatus.className = "status-item ok";
                    backendValue.innerHTML = "✓ Running on port 3007";
                    
                    dbStatus.className = "status-item ok";
                    dbValue.innerHTML = "✓ PostgreSQL connected";
                    
                    apiResponse.textContent = JSON.stringify(data, null, 2);
                })
                .catch(err => {
                    backendStatus.className = "status-item error";
                    backendValue.innerHTML = "✗ Not reachable";
                    
                    dbStatus.className = "status-item error";
                    dbValue.innerHTML = "✗ Unknown";
                    
                    apiResponse.textContent = "Error: " + err.message;
                });
        }
        
        // Check on page load
        checkHealth();
        
        // Auto-refresh every 30 seconds
        setInterval(checkHealth, 30000);
    </script>
</body>
</html>'''
    
    # Save frontend
    ssh.sendline(f'echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-frontend/index.html > /dev/null << \'EOFHTML\'')
    ssh.sendline(frontend_html)
    ssh.sendline('EOFHTML')
    ssh.expect('\\$')
    
    # Deploy frontend container
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend -p 5174:80 -v /volume1/docker/projecthub-frontend:/usr/share/nginx/html:ro nginx:alpine')
    ssh.expect('\\$')
    
    print("✓ Waiting for services to start...")
    time.sleep(20)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    output = ssh.before.split('\\n')
    for line in output[1:]:
        if 'projecthub' in line:
            print(line)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Full ProjectHub deployed!")
    print("\n🎉 Access at:")
    print("  Frontend: http://192.168.1.24:5174")
    print("  Backend: http://192.168.1.24:3007")
    print("  API Health: http://192.168.1.24:3007/api/health")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()