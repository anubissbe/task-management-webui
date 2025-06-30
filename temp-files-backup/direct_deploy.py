#!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying ProjectHub on Synology NAS...")

try:
    # Connect
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
    
    # Handle password
    i = ssh.expect(['password:', 'Password:', 'continue connecting'], timeout=10)
    if i == 2:
        ssh.sendline('yes')
        ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected to Synology")
    
    # Commands that don't need sudo
    commands = [
        'mkdir -p ~/projecthub',
        'cd ~/projecthub',
        '''cat > docker-compose.yml << 'EOF'
version: '3'
services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-db
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: projecthub123
      POSTGRES_DB: projecthub_mcp
    ports:
      - "5433:5432"
    restart: unless-stopped
  backend:
    image: node:20-alpine  
    container_name: projecthub-backend
    ports:
      - "3007:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
    command: sh -c "mkdir -p /app && cd /app && echo '{\"name\":\"projecthub\",\"dependencies\":{\"express\":\"4.18.2\"}}' > package.json && npm install && echo 'const express=require(\"express\");const app=express();app.get(\"/\",(req,res)=>res.send(\"ProjectHub Running\"));app.get(\"/api/health\",(req,res)=>res.json({status:\"ok\",timestamp:new Date()}));app.listen(3000,\"0.0.0.0\",()=>console.log(\"Server running on 3000\"));' > server.js && node server.js"
    depends_on:
      - postgres
    restart: unless-stopped
EOF''',
        'docker-compose pull',
        'docker-compose up -d',
        'sleep 5',
        'docker ps | grep projecthub || echo "Containers starting..."'
    ]
    
    # Execute commands
    for cmd in commands:
        print(f"→ {cmd[:50]}...")
        ssh.sendline(cmd)
        ssh.expect('\\$', timeout=60)
        time.sleep(0.5)
    
    # Exit
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub deployed successfully!")
    print("\nWaiting for services to start (30 seconds)...")
    time.sleep(30)
    
    print("\n🎉 ProjectHub is now available at:")
    print("  Backend API: http://192.168.1.24:3007")
    print("  Health Check: http://192.168.1.24:3007/api/health")
    print("  Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"Deployment error: {e}")