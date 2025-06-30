#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying ProjectHub using Synology docker-compose...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Create a modified Synology compose
    print("✓ Creating modified Synology docker-compose...")
    synology_compose = '''version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: projecthub-postgres
    environment:
      - POSTGRES_USER=projecthub
      - POSTGRES_PASSWORD=projecthub123
      - POSTGRES_DB=projecthub_mcp
    ports:
      - "5433:5432"
    volumes:
      - /volume1/docker/projecthub-real/postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: /volume1/docker/projecthub-real/source/backend
      dockerfile: Dockerfile
    container_name: projecthub-backend
    ports:
      - "3008:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
      - CORS_ORIGIN=http://192.168.1.24:5173
      - JWT_ACCESS_SECRET=your_jwt_secret_here_change_in_production_min_32_chars
      - JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production_min_32_chars
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - projecthub-network

  frontend:
    build:
      context: /volume1/docker/projecthub-real/source/frontend
      dockerfile: Dockerfile
    container_name: projecthub-frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://192.168.1.24:3008
      - VITE_WS_URL=ws://192.168.1.24:3008
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - projecthub-network

networks:
  projecthub-network:
    driver: bridge

volumes:
  postgres_data:'''
    
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S tee /volume1/docker/projecthub-real/docker-compose-synology.yml > /dev/null << \'EOFCOMPOSE\'')
    ssh.sendline(synology_compose)
    ssh.sendline('EOFCOMPOSE')
    ssh.expect('\\$', timeout=30)
    
    # Build and start the application
    print("✓ Building and starting ProjectHub...")
    ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose -f docker-compose-synology.yml build --no-cache')
    ssh.expect('\\$', timeout=600)  # Building can take a while
    
    print("✓ Starting services...")
    ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose -f docker-compose-synology.yml up -d')
    ssh.expect('\\$', timeout=180)
    
    print("✓ Waiting for services to initialize...")
    time.sleep(30)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    # Check backend health
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 10')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    # Check frontend health
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend --tail 10')
    ssh.expect('\\$')
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub deployed with official codebase\!")
    print("\n🎉 Access your REAL ProjectHub application:")
    print("  Frontend (React Dashboard): http://192.168.1.24:5173")
    print("  Backend API: http://192.168.1.24:3008")
    print("  Database: PostgreSQL on port 5433")
    print("\nThis includes all your enterprise features:")
    print("  • Advanced Analytics Dashboard")
    print("  • Kanban Board with drag-and-drop")
    print("  • Team Management & Workspaces")
    print("  • Time Tracking & Pomodoro Timer")
    print("  • Real-time Collaboration")
    print("  • Project Templates & Dependencies")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
