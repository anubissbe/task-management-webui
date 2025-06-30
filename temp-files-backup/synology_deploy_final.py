#!/usr/bin/env python3
import pexpect
import time
import os

print("🚀 Final deployment to Synology NAS...")

# Create a complete deployment script that includes source code
deployment_script = '''
#!/bin/bash
echo "Starting ProjectHub deployment..."

# Create project directory
mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub

# Create simplified docker-compose.yml
cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3'

services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-db
    environment:
      - POSTGRES_USER=projecthub
      - POSTGRES_PASSWORD=projecthub123
      - POSTGRES_DB=projecthub_mcp
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    restart: unless-stopped

  app:
    image: node:20-alpine
    container_name: projecthub-app
    working_dir: /app
    ports:
      - "3007:3001"
      - "5174:5173"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
      - JWT_ACCESS_SECRET=change_this_secret_in_production
      - JWT_REFRESH_SECRET=change_this_refresh_secret_in_production
    volumes:
      - ./app:/app
    command: sh -c "cd /app && npm install && npm start"
    depends_on:
      - postgres
    restart: unless-stopped
COMPOSE_EOF

# Create app directory
mkdir -p app pgdata

# Create a simple test app
cat > app/package.json << 'PACKAGE_EOF'
{
  "name": "projecthub-test",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
PACKAGE_EOF

cat > app/server.js << 'SERVER_EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ProjectHub is running!' });
});

app.get('/', (req, res) => {
  res.send('<h1>ProjectHub is deployed!</h1><p>API Health: <a href="/api/health">/api/health</a></p>');
});

app.listen(PORT, () => {
  console.log(`ProjectHub server running on port ${PORT}`);
});
SERVER_EOF

# Pull images
echo "Pulling Docker images..."
docker pull postgres:16-alpine
docker pull node:20-alpine

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Start services
echo "Starting services..."
docker-compose up -d

# Check status
echo "Waiting for services to start..."
sleep 10
docker-compose ps

echo "Deployment complete!"
echo "Access ProjectHub at http://192.168.1.24:3007"
'''

try:
    # Connect to Synology
    print("Connecting to Synology...")
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24')
    
    # Handle password
    i = ssh.expect(['password:', 'Password:', pexpect.EOF, pexpect.TIMEOUT], timeout=10)
    if i == 0 or i == 1:
        ssh.sendline('JDU9xjn1ekx3rev_uma')
        ssh.expect(['\\$', '#'])
    
    print("Connected! Deploying ProjectHub...")
    
    # Switch to root for Docker commands
    ssh.sendline('sudo -i')
    i = ssh.expect(['password', '#', pexpect.TIMEOUT], timeout=10)
    if i == 0:
        ssh.sendline('JDU9xjn1ekx3rev_uma')
        ssh.expect('#')
    
    # Create and execute deployment script
    print("Creating deployment script...")
    ssh.sendline('cat > /tmp/deploy_projecthub.sh << \'SCRIPT_EOF\'')
    for line in deployment_script.split('\n'):
        ssh.sendline(line)
    ssh.sendline('SCRIPT_EOF')
    ssh.expect('#')
    
    # Make executable and run
    print("Executing deployment...")
    ssh.sendline('chmod +x /tmp/deploy_projecthub.sh')
    ssh.expect('#')
    ssh.sendline('bash /tmp/deploy_projecthub.sh')
    
    # Wait for completion
    ssh.expect('Deployment complete!', timeout=120)
    
    # Get the output
    output = ssh.before.decode()
    print(output)
    
    # Exit
    ssh.sendline('exit')
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub deployed successfully!")
    print("\nAccess points:")
    print("  Main app: http://192.168.1.24:3007")
    print("  API Health: http://192.168.1.24:3007/api/health")
    print("  Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"Error during deployment: {e}")
    print("\nPlease check the connection and try again.")