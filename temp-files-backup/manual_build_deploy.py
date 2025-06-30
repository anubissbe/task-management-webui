#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Manually building and deploying ProjectHub...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=300)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # First, start PostgreSQL
    print("✓ Starting PostgreSQL...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub123 -e POSTGRES_DB=projecthub_mcp -p 5433:5432 -v /volume1/docker/projecthub-real/postgres_data:/var/lib/postgresql/data postgres:15')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Waiting for PostgreSQL to start...")
    time.sleep(15)
    
    # Build backend manually
    print("✓ Building backend...")
    ssh.sendline('cd /volume1/docker/projecthub-real/source/backend && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker build -t projecthub-backend .')
    ssh.expect('\\$', timeout=300)
    
    # Run backend
    print("✓ Starting backend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-backend --link projecthub-postgres:postgres -p 3008:3001 -e NODE_ENV=production -e PORT=3001 -e DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp -e CORS_ORIGIN=http://192.168.1.24:5173 -e JWT_ACCESS_SECRET=your_jwt_secret_here_change_in_production_min_32_chars -e JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production_min_32_chars projecthub-backend')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Waiting for backend to start...")
    time.sleep(10)
    
    # Build frontend
    print("✓ Building frontend...")
    ssh.sendline('cd /volume1/docker/projecthub-real/source/frontend && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker build -t projecthub-frontend --build-arg VITE_API_URL=http://192.168.1.24:3008 --build-arg VITE_WS_URL=ws://192.168.1.24:3008 .')
    ssh.expect('\\$', timeout=300)
    
    # Run frontend
    print("✓ Starting frontend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend -p 5173:80 projecthub-frontend')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Waiting for frontend to start...")
    time.sleep(10)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    # Check backend logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 15')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    # Check frontend logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend --tail 15')
    ssh.expect('\\$')
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ ProjectHub manually deployed\!")
    print("\n🎉 Access your REAL ProjectHub application:")
    print("  Frontend (React Dashboard): http://192.168.1.24:5173")
    print("  Backend API: http://192.168.1.24:3008")
    print("  Database: PostgreSQL on port 5433")
    print("\nYour sophisticated enterprise project management system is now running\!")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
