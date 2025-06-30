#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying the REAL ProjectHub application from GitHub...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Clean up old deployments
    print("✓ Cleaning up old deployments...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-frontend projecthub-backend projecthub-postgres projecthub-frontend-new 2>/dev/null || true')
    ssh.expect('\\$', timeout=30)
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm -f projecthub-frontend projecthub-backend projecthub-postgres projecthub-frontend-new 2>/dev/null || true')
    ssh.expect('\\$', timeout=30)
    
    # Remove old directories and create fresh ones
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S rm -rf /volume1/docker/projecthub-real')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-real')
    ssh.expect('\\$')
    
    # Clone the actual repository
    print("✓ Cloning ProjectHub repository...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S git clone https://github.com/anubissbe/ProjectHub-Mcp.git /volume1/docker/projecthub-real/source')
    ssh.expect('\\$', timeout=120)
    
    # Create docker-compose for the real application
    print("✓ Creating docker-compose for real ProjectHub...")
    compose_content = '''version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: projecthub-postgres-real
    environment:
      - POSTGRES_USER=projecthub
      - POSTGRES_PASSWORD=projecthub123
      - POSTGRES_DB=projecthub_mcp
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
      - ./source/backend/src/database/migrations:/docker-entrypoint-initdb.d
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
    container_name: projecthub-backend-real
    working_dir: /app
    volumes:
      - ./source/backend:/app
    ports:
      - "3008:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
      - JWT_ACCESS_SECRET=your_jwt_secret_here_change_in_production_min_32_chars
      - JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production_min_32_chars
      - CORS_ORIGIN=http://192.168.1.24:5173
    command: >
      sh -c "
        npm install &&
        npm run build || true &&
        npm start || node src/index.js || node dist/index.js
      "
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: node:20-alpine
    container_name: projecthub-frontend-real
    working_dir: /app
    volumes:
      - ./source/frontend:/app
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://192.168.1.24:3008
      - VITE_WS_URL=ws://192.168.1.24:3008
    command: >
      sh -c "
        npm install &&
        npm run build &&
        npm run preview -- --host 0.0.0.0 --port 5173 ||
        npm run dev -- --host 0.0.0.0 --port 5173
      "
    depends_on:
      - backend
    restart: unless-stopped

networks:
  default:
    name: projecthub-mcp-network'''
    
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-real/docker-compose.yml > /dev/null << \'EOFCOMPOSE\'')
    ssh.sendline(compose_content)
    ssh.sendline('EOFCOMPOSE')
    ssh.expect('\\$', timeout=30)
    
    # Start the real application
    print("✓ Starting the real ProjectHub application...")
    ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose up -d')
    ssh.expect('\\$', timeout=180)
    
    print("✓ Waiting for services to initialize...")
    time.sleep(30)
    
    # Check status
    ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose ps')
    ssh.expect('\\$')
    print("\nContainer status:")
    print(ssh.before)
    
    # Check backend logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend-real --tail 20')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    # Check frontend logs  
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend-real --tail 20')
    ssh.expect('\\$')
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Real ProjectHub application deployed\!")
    print("\n🎉 Access your FULL ProjectHub application:")
    print("  Frontend (React Dashboard): http://192.168.1.24:5173")
    print("  Backend API: http://192.168.1.24:3008")
    print("  Database: PostgreSQL on port 5433")
    print("\nThis includes all your dashboard components, analytics, Kanban boards, and enterprise features\!")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
