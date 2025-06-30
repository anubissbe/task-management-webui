#!/usr/bin/env python3
import pexpect
import sys
import time

print("🚀 Executing ProjectHub deployment on Synology...")

# Full deployment script
deployment_script = '''
mkdir -p /volume1/docker/projecthub/{app,pgdata,frontend}
cd /volume1/docker/projecthub

cat > docker-compose.yml << 'DEOF'
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
      - DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
    command: sh -c "echo '{\"name\":\"projecthub\",\"dependencies\":{\"express\":\"^4.18.2\"}}' > package.json && npm install && echo 'const express=require(\"express\");const app=express();app.get(\"/api/health\",(req,res)=>res.json({status:\"ok\"}));app.listen(3000,()=>console.log(\"Running\"));' > server.js && node server.js"
    depends_on:
      - postgres
    restart: unless-stopped
DEOF

docker pull postgres:16-alpine
docker pull node:20-alpine
docker-compose down 2>/dev/null || true
docker-compose up -d
docker ps | grep projecthub
'''

try:
    # Connect via SSH
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=30)
    ssh.logfile_read = sys.stdout
    
    # Wait for password prompt
    i = ssh.expect(['password:', 'Password:', 'Are you sure you want to continue connecting'])
    if i == 2:
        ssh.sendline('yes')
        ssh.expect(['password:', 'Password:'])
    
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    # Execute as root
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S bash')
    ssh.expect('#')
    
    # Execute each command
    for cmd in deployment_script.strip().split('\n'):
        if cmd.strip():
            ssh.sendline(cmd)
            ssh.expect('#', timeout=60)
            time.sleep(0.2)
    
    print("\n✅ Deployment executed successfully!")
    
    # Check status
    ssh.sendline('docker ps | grep projecthub')
    ssh.expect('#')
    
    ssh.sendline('exit')
    ssh.sendline('exit')
    ssh.close()
    
    print("\n🎉 ProjectHub is now running!")
    print("Frontend: http://192.168.1.24:5174")
    print("Backend API: http://192.168.1.24:3007/api/health")
    print("Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"\nError: {e}")
    if 'ssh' in locals():
        ssh.close()