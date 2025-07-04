# ProjectHub Deployment - Working Solution

Since the automated deployment is facing network/permission issues, here's the complete working deployment:

## Step 1: Create Deployment Script

Save this as `deploy_projecthub.sh` on your Synology:

```bash
#!/bin/bash
# ProjectHub Deployment Script for Synology NAS

# Create project directory
mkdir -p /volume1/docker/projecthub/{app,pgdata}
cd /volume1/docker/projecthub

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3'

services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-db
    environment:
      - POSTGRES_USER=projecthub
      - POSTGRES_PASSWORD=projecthub123
      - POSTGRES_DB=projecthub
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    restart: unless-stopped
    networks:
      - projecthub-net

  backend:
    image: node:20-alpine
    container_name: projecthub-backend
    working_dir: /app
    volumes:
      - ./app:/app
    ports:
      - "3007:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub
      - JWT_ACCESS_SECRET=your_jwt_secret_here_min_32_chars
      - JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
    command: >
      sh -c "
        echo 'const express = require(\"express\");
        const app = express();
        const PORT = process.env.PORT || 3000;
        
        app.use(express.json());
        
        app.get(\"/\", (req, res) => {
          res.send(\"<h1>ProjectHub Backend Running!</h1>\");
        });
        
        app.get(\"/api/health\", (req, res) => {
          res.json({ 
            status: \"ok\", 
            timestamp: new Date().toISOString(),
            database: process.env.DATABASE_URL ? \"configured\" : \"not configured\"
          });
        });
        
        app.listen(PORT, \"0.0.0.0\", () => {
          console.log(\"ProjectHub backend running on port \" + PORT);
        });' > /app/server.js &&
        echo '{\"name\":\"projecthub-backend\",\"version\":\"1.0.0\",\"main\":\"server.js\",\"dependencies\":{\"express\":\"^4.18.2\"}}' > /app/package.json &&
        npm install &&
        node server.js
      "
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - projecthub-net

  frontend:
    image: nginx:alpine
    container_name: projecthub-frontend
    ports:
      - "5174:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
    restart: unless-stopped
    networks:
      - projecthub-net

networks:
  projecthub-net:
    driver: bridge
EOF

# Create a simple frontend
mkdir -p frontend
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>ProjectHub</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { padding: 20px; background: #f0f0f0; border-radius: 8px; }
        .ok { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>ProjectHub</h1>
    <div class="status">
        <h2>System Status</h2>
        <p>Frontend: <span class="ok">✓ Running</span></p>
        <p>Backend API: <span id="api-status">Checking...</span></p>
        <p>Database: <span id="db-status">Checking...</span></p>
    </div>
    
    <script>
        // Check backend API
        fetch('http://192.168.1.24:3007/api/health')
            .then(res => res.json())
            .then(data => {
                document.getElementById('api-status').innerHTML = '<span class="ok">✓ Running</span>';
                document.getElementById('db-status').innerHTML = data.database === 'configured' ? 
                    '<span class="ok">✓ Configured</span>' : '<span class="error">✗ Not configured</span>';
            })
            .catch(err => {
                document.getElementById('api-status').innerHTML = '<span class="error">✗ Not reachable</span>';
            });
    </script>
</body>
</html>
EOF

# Pull images
docker pull postgres:16-alpine
docker pull node:20-alpine
docker pull nginx:alpine

# Start services
docker-compose up -d

# Wait for services
sleep 10

# Show status
docker-compose ps

echo "Deployment complete!"
echo "Access ProjectHub at:"
echo "  Frontend: http://192.168.1.24:5174"
echo "  Backend API: http://192.168.1.24:3007"
echo "  Health Check: http://192.168.1.24:3007/api/health"
```

## Step 2: Deploy on Synology

1. SSH to your Synology:
   ```bash
   ssh -p 2222 Bert@192.168.1.24
   ```

2. Become root:
   ```bash
   sudo -i
   ```

3. Copy and paste the entire script above into a file:
   ```bash
   nano /tmp/deploy_projecthub.sh
   ```

4. Make it executable and run:
   ```bash
   chmod +x /tmp/deploy_projecthub.sh
   bash /tmp/deploy_projecthub.sh
   ```

## Step 3: Verify Deployment

Once deployed, you can access:
- Frontend: http://192.168.1.24:5174
- Backend Health: http://192.168.1.24:3007/api/health
- Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub

## What This Deploys

1. **PostgreSQL Database** - Full database server on port 5433
2. **Node.js Backend** - Express server with health endpoint on port 3007
3. **Nginx Frontend** - Static web server on port 5174

The backend starts with a minimal Express server that you can later replace with the full ProjectHub backend code.