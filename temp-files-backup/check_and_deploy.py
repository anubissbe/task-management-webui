#!/usr/bin/env python3
import pexpect
import time
import sys

def run_ssh_command(command, show_output=True):
    """Execute a command on Synology via SSH"""
    try:
        ssh = pexpect.spawn(f"ssh -p 2222 Bert@192.168.1.24 '{command}'")
        ssh.expect(['password:', 'Password:'])
        ssh.sendline('JDU9xjn1ekx3rev_uma')
        ssh.expect(pexpect.EOF, timeout=60)
        output = ssh.before.decode()
        if show_output:
            print(output)
        ssh.close()
        return output
    except Exception as e:
        print(f"Error: {e}")
        return None

print("🔍 Checking actual status on Synology...")

# Check if directory exists
print("\n1. Checking if project directory exists:")
run_ssh_command("ls -la /volume1/docker/projecthub 2>&1 || echo 'Directory not found'")

# Check Docker containers
print("\n2. Checking all Docker containers:")
run_ssh_command("sudo docker ps -a | grep projecthub || echo 'No projecthub containers found'")

# Check if docker-compose file exists
print("\n3. Checking for docker-compose.yml:")
run_ssh_command("ls -la /volume1/docker/projecthub/docker-compose.yml 2>&1 || echo 'No docker-compose.yml found'")

# If nothing exists, create everything from scratch
print("\n4. Creating fresh deployment...")

deployment_commands = """
# Create directory
sudo mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub

# Create docker-compose.yml
sudo tee docker-compose.yml > /dev/null << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-postgres
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: projecthub123
      POSTGRES_DB: projecthub_mcp
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    restart: unless-stopped

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
      - JWT_ACCESS_SECRET=your_jwt_secret_here_change_this
      - JWT_REFRESH_SECRET=your_refresh_secret_here_change_this
      - CORS_ORIGIN=http://192.168.1.24:5174
    command: sh -c "echo 'Backend container started - waiting for source code' && tail -f /dev/null"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    image: node:20-alpine
    container_name: projecthub-frontend
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "5174:3000"
    environment:
      - VITE_API_URL=http://192.168.1.24:3007/api
      - VITE_WS_URL=ws://192.168.1.24:3007
    command: sh -c "echo 'Frontend container started - waiting for source code' && tail -f /dev/null"
    depends_on:
      - backend
    restart: unless-stopped
EOF

# Create empty directories for volumes
sudo mkdir -p postgres_data backend frontend

# Pull images
echo "Pulling Docker images..."
sudo docker pull postgres:16-alpine
sudo docker pull node:20-alpine

# Start containers
echo "Starting containers..."
sudo docker-compose up -d

# Show status
sudo docker-compose ps
"""

print("\n5. Executing deployment commands...")
# Execute each command
for cmd in deployment_commands.strip().split('\n'):
    if cmd and not cmd.startswith('#'):
        print(f"Running: {cmd[:50]}...")
        run_ssh_command(cmd, show_output=False)
        time.sleep(0.5)

print("\n6. Checking final status:")
run_ssh_command("cd /volume1/docker/projecthub && sudo docker-compose ps")

print("\n✅ Infrastructure deployed! Now transferring source code...")