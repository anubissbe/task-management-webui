#!/usr/bin/env python3
import subprocess
import sys
import time

print("🚀 Deploying ProjectHub to Synology NAS...")

# Create a deployment script that will be executed via SSH
deployment_script = '''
#!/bin/bash
set -e

echo "Starting ProjectHub deployment..."

# Create directory
mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub

# Create docker-compose.yml using the pre-built images
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: projecthub-postgres
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: projecthub_secure_2025
      POSTGRES_DB: projecthub_mcp
    volumes:
      - ./postgres:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - projecthub-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projecthub"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: anubissbe/projecthub-mcp-backend:latest
    container_name: projecthub-backend
    ports:
      - "3007:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://projecthub:projecthub_secure_2025@postgres:5432/projecthub_mcp
      - JWT_ACCESS_SECRET=projecthub_jwt_secret_min_32_chars_change_in_prod
      - JWT_REFRESH_SECRET=projecthub_refresh_secret_min_32_chars_change
      - CORS_ORIGIN=http://192.168.1.24:5174,http://localhost:5174
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - projecthub-network
    restart: unless-stopped

  frontend:
    image: anubissbe/projecthub-mcp-frontend:latest
    container_name: projecthub-frontend
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=http://192.168.1.24:3007/api
      - VITE_WS_URL=ws://192.168.1.24:3007
    depends_on:
      - backend
    networks:
      - projecthub-network
    restart: unless-stopped

networks:
  projecthub-network:
    driver: bridge
EOF

# Pull images
echo "Pulling Docker images..."
docker pull postgres:17-alpine
docker pull anubissbe/projecthub-mcp-backend:latest || echo "Using local build"
docker pull anubissbe/projecthub-mcp-frontend:latest || echo "Using local build"

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start services
echo "Starting services..."
docker-compose up -d

# Show status
echo "Checking container status..."
docker-compose ps

echo "Deployment complete!"
'''

# Use Python's subprocess with stdin to send password
import pexpect
import os

try:
    # Try using pexpect for interactive SSH
    print("Connecting to Synology...")
    ssh_command = f"ssh -p 2222 Bert@192.168.1.24"
    child = pexpect.spawn(ssh_command)
    
    # Handle SSH prompts
    index = child.expect(['password:', 'yes/no', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
    
    if index == 0:  # password prompt
        child.sendline('JDU9xjn1ekx3rev_uma')
    elif index == 1:  # new host
        child.sendline('yes')
        child.expect('password:')
        child.sendline('JDU9xjn1ekx3rev_uma')
    
    # Wait for shell prompt
    child.expect(['\\$', '#'], timeout=30)
    
    # Send deployment script
    print("Sending deployment script...")
    for line in deployment_script.strip().split('\n'):
        child.sendline(line)
        time.sleep(0.1)
    
    # Wait for completion
    child.expect(['Deployment complete!', pexpect.EOF], timeout=300)
    
    # Exit
    child.sendline('exit')
    child.close()
    
    print("\n✅ ProjectHub deployed successfully!")
    print("\nAccess your ProjectHub instance at:")
    print("  Frontend: http://192.168.1.24:5174")
    print("  Backend API: http://192.168.1.24:3007/api")
    print("  Database: postgresql://projecthub:projecthub_secure_2025@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"Error: {e}")
    print("\nTrying alternative method...")
    
    # Alternative: Create a script file that can be manually executed
    with open('/tmp/projecthub_deploy.sh', 'w') as f:
        f.write(deployment_script)
    
    print("\nDeployment script created at: /tmp/projecthub_deploy.sh")
    print("\nTo deploy manually:")
    print("1. Copy this script to Synology:")
    print("   scp -P 2222 /tmp/projecthub_deploy.sh Bert@192.168.1.24:/tmp/")
    print("2. SSH to Synology and run:")
    print("   ssh -p 2222 Bert@192.168.1.24")
    print("   chmod +x /tmp/projecthub_deploy.sh")
    print("   sudo /tmp/projecthub_deploy.sh")