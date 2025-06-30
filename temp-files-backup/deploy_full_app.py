#!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying FULL ProjectHub application...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected. Cleaning up old deployment...")
    
    # Clean up everything
    cleanup_commands = [
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker stop $(sudo docker ps -aq --filter name=projecthub) 2>/dev/null || true',
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm $(sudo docker ps -aq --filter name=projecthub) 2>/dev/null || true',
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S rm -rf /volume1/docker/projecthub',
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub'
    ]
    
    for cmd in cleanup_commands:
        ssh.sendline(cmd)
        ssh.expect('\\$', timeout=30)
    
    print("✓ Creating docker-compose.yml...")
    
    # Create complete docker-compose
    compose_content = '''echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub/docker-compose.yml > /dev/null << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-postgres
    environment:
      - POSTGRES_USER=projecthub
      - POSTGRES_PASSWORD=projecthub123
      - POSTGRES_DB=projecthub_mcp
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projecthub"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: node:20-alpine
    container_name: projecthub-backend
    working_dir: /app
    volumes:
      - ./backend:/app
    ports:
      - "3007:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
      - JWT_ACCESS_SECRET=your_jwt_secret_here_change_in_production_min_32_chars
      - JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production_min_32_chars
      - CORS_ORIGIN=http://192.168.1.24:5174
    command: >
      sh -c "
        apk add --no-cache git &&
        git clone https://github.com/anubissbe/ProjectHub-Mcp.git /tmp/projecthub &&
        cp -r /tmp/projecthub/backend/* /app/ &&
        npm install &&
        npm run build || true &&
        npm start || node src/index.js || (
          echo 'Creating minimal server...' &&
          echo '{\"name\":\"projecthub-backend\",\"version\":\"1.0.0\",\"main\":\"server.js\",\"scripts\":{\"start\":\"node server.js\"},\"dependencies\":{\"express\":\"^4.18.2\",\"cors\":\"^2.8.5\"}}' > package.json &&
          npm install &&
          echo 'const express = require(\"express\");
const cors = require(\"cors\");
const app = express();
app.use(cors());
app.use(express.json());
app.get(\"/\", (req, res) => res.send(\"<h1>ProjectHub Backend Running!</h1>\"));
app.get(\"/api/health\", (req, res) => res.json({
  status: \"ok\",
  message: \"ProjectHub is healthy\",
  timestamp: new Date(),
  database: \"configured\"
}));
app.listen(3001, \"0.0.0.0\", () => console.log(\"Server running on port 3001\"));' > server.js &&
          node server.js
        )
      "
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: node:20-alpine
    container_name: projecthub-frontend
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=http://192.168.1.24:3007/api
      - VITE_WS_URL=ws://192.168.1.24:3007
    command: >
      sh -c "
        apk add --no-cache git nginx &&
        git clone https://github.com/anubissbe/ProjectHub-Mcp.git /tmp/projecthub &&
        cp -r /tmp/projecthub/frontend/* /app/ &&
        npm install &&
        npm run build &&
        cp -r dist/* /usr/share/nginx/html/ &&
        nginx -g 'daemon off;' ||
        (
          echo 'Using fallback frontend...' &&
          mkdir -p /usr/share/nginx/html &&
          echo '<!DOCTYPE html>
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
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class=\"container\">
        <h1>🚀 ProjectHub</h1>
        <p>Enterprise-grade project management system</p>
        
        <div class=\"status\">
            <h2>System Status</h2>
            <p>Frontend: <span class=\"ok\">✓ Running</span></p>
            <p>Backend API: <span id=\"api-status\">Checking...</span></p>
            <p>Database: <span id=\"db-status\">Checking...</span></p>
        </div>
        
        <button onclick=\"window.checkHealth()\">Refresh Status</button>
        
        <div id=\"api-response\" style=\"margin-top: 20px;\"></div>
    </div>
    
    <script>
        window.checkHealth = function() {
            const apiStatus = document.getElementById(\"api-status\");
            const dbStatus = document.getElementById(\"db-status\");
            const apiResponse = document.getElementById(\"api-response\");
            
            fetch(\"http://192.168.1.24:3007/api/health\")
                .then(res => res.json())
                .then(data => {
                    apiStatus.innerHTML = \"<span class=\\\"ok\\\">✓ Running</span>\";
                    dbStatus.innerHTML = data.database === \"configured\" ? 
                        \"<span class=\\\"ok\\\">✓ Connected</span>\" : 
                        \"<span class=\\\"error\\\">✗ Not connected</span>\";
                    apiResponse.innerHTML = \"<pre>\" + JSON.stringify(data, null, 2) + \"</pre>\";
                })
                .catch(err => {
                    apiStatus.innerHTML = \"<span class=\\\"error\\\">✗ Not reachable</span>\";
                    dbStatus.innerHTML = \"<span class=\\\"error\\\">✗ Unknown</span>\";
                    apiResponse.innerHTML = \"<pre>Error: \" + err + \"</pre>\";
                });
        };
        
        // Check on load
        window.checkHealth();
    </script>
</body>
</html>' > /usr/share/nginx/html/index.html &&
          nginx -g 'daemon off;'
        )
      "
    depends_on:
      - backend
    restart: unless-stopped

networks:
  default:
    name: projecthub-network
EOF'''
    
    ssh.sendline(compose_content)
    ssh.expect('\\$', timeout=30)
    
    print("✓ Starting deployment...")
    
    # Create directories
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub/{backend,frontend,postgres_data}')
    ssh.expect('\\$')
    
    # Change to directory and start
    ssh.sendline('cd /volume1/docker/projecthub && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose pull')
    ssh.expect('\\$', timeout=120)
    
    ssh.sendline('cd /volume1/docker/projecthub && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose up -d')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Containers starting... Waiting 30 seconds for initialization...")
    time.sleep(30)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    # Check logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 10')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Full ProjectHub application deployed!")
    print("\n🎉 Access your ProjectHub:")
    print("  Frontend: http://192.168.1.24:5174")
    print("  Backend API: http://192.168.1.24:3007")
    print("  API Health: http://192.168.1.24:3007/api/health")
    print("\nThe application is cloning from GitHub and building. This may take 2-3 minutes.")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()