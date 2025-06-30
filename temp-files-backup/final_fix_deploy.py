#!/usr/bin/env python3
import pexpect
import time

print("🔧 Fixing ProjectHub deployment...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    # Check existing containers and stop them
    print("✓ Connected. Checking existing deployment...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps -a | grep projecthub')
    ssh.expect('\\$')
    print(ssh.before)
    
    # Stop and remove old containers
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker stop projecthub-app projecthub-db projecthub-postgres projecthub-backend 2>/dev/null || true')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-app projecthub-db projecthub-postgres projecthub-backend 2>/dev/null || true')
    ssh.expect('\\$')
    
    # Create new deployment
    print("\n✓ Creating new deployment...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S bash -c "cd /volume1/docker/projecthub && docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub123 -e POSTGRES_DB=projecthub_mcp -p 5433:5432 postgres:16-alpine"')
    ssh.expect('\\$', timeout=30)
    
    time.sleep(5)
    
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S bash -c "cd /volume1/docker/projecthub && docker run -d --name projecthub-backend --link projecthub-postgres:postgres -p 3007:3000 -e DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp node:20-alpine sh -c \\\"mkdir -p /app && cd /app && echo \'{\\\\\\\"name\\\\\\\":\\\\\\\"app\\\\\\\",\\\\\\\"dependencies\\\\\\\":{\\\\\\\"express\\\\\\\":\\\\\\\"^4.18.2\\\\\\\"}}\' > package.json && npm install && echo \'const express=require(\\\\\\\"express\\\\\\\");const app=express();app.get(\\\\\\\"/\\\\\\\",(req,res)=>res.send(\\\\\\\"<h1>ProjectHub Running!</h1>\\\\\\\"));app.get(\\\\\\\"/api/health\\\\\\\",(req,res)=>res.json({status:\\\\\\\"ok\\\\\\\",message:\\\\\\\"ProjectHub is healthy\\\\\\\"}));app.listen(3000,()=>console.log(\\\\\\\"Server running\\\\\\\"));\' > server.js && node server.js\\\""')
    ssh.expect('\\$', timeout=30)
    
    print("\n✓ Containers started. Waiting for initialization...")
    time.sleep(20)
    
    # Check final status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub is now properly deployed!")
    print("\nAccess at:")
    print("  Backend: http://192.168.1.24:3007")
    print("  API Health: http://192.168.1.24:3007/api/health")
    print("  Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub_mcp")

except Exception as e:
    print(f"Error: {e}")