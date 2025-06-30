#!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying ProjectHub with proper permissions...")

deployment_script = '''#!/bin/bash
cd /volume1/docker
mkdir -p projecthub
cd projecthub

cat > docker-compose.yml << 'EOF'
version: '3'
services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-postgres
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: projecthub123
      POSTGRES_DB: projecthub_mcp
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    restart: unless-stopped

  backend:
    image: node:20-alpine
    container_name: projecthub-backend
    working_dir: /app
    ports:
      - "3007:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
    volumes:
      - ./app:/app
    command: sh -c "cd /app && echo '{\"name\":\"app\",\"dependencies\":{\"express\":\"^4.18.2\"}}' > package.json && npm install && echo 'const express=require(\"express\");const app=express();app.use(express.json());app.get(\"/\",(req,res)=>res.send(\"<h1>ProjectHub Running!</h1>\"));app.get(\"/api/health\",(req,res)=>res.json({status:\"ok\",message:\"ProjectHub is healthy\",timestamp:new Date()}));app.listen(3000,()=>console.log(\"Server on 3000\"));' > server.js && node server.js"
    depends_on:
      - postgres
    restart: unless-stopped
EOF

mkdir -p app pgdata

docker pull postgres:16-alpine
docker pull node:20-alpine

docker-compose down 2>/dev/null || true
docker-compose up -d

sleep 5
docker ps | grep projecthub
'''

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=30)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected. Creating deployment script...")
    
    # Create script
    ssh.sendline('cat > /tmp/deploy_projecthub.sh << \'SCRIPT_END\'')
    for line in deployment_script.split('\n'):
        ssh.sendline(line)
    ssh.sendline('SCRIPT_END')
    ssh.expect('\\$')
    
    # Execute with sudo
    print("✓ Executing deployment...")
    ssh.sendline('chmod +x /tmp/deploy_projecthub.sh')
    ssh.expect('\\$')
    
    # Use sudo with password
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S bash /tmp/deploy_projecthub.sh')
    ssh.expect('\\$', timeout=120)
    
    print("✓ Deployment completed. Checking status...")
    
    # Check final status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    output = ssh.before
    print(output)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub has been deployed!")
    print("\nAccess at:")
    print("  Backend: http://192.168.1.24:3007")
    print("  API Health: http://192.168.1.24:3007/api/health")
    print("  Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()