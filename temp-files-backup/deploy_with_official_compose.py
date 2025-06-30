#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying ProjectHub using official docker-compose...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop existing containers
    ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker-compose down')
    ssh.expect('\\$', timeout=30)
    
    # Check official docker-compose files
    print("✓ Checking official docker-compose files...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/source/docker-compose*')
    ssh.expect('\\$')
    print(ssh.before)
    
    # Check .env files
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/source/.env*')
    ssh.expect('\\$')
    print(ssh.before)
    
    # Copy .env.quickstart to .env
    print("✓ Setting up environment...")
    ssh.sendline('cd /volume1/docker/projecthub-real/source && echo "JDU9xjn1ekx3rev_uma" | sudo -S cp .env.quickstart .env')
    ssh.expect('\\$')
    
    # Modify .env for our setup
    ssh.sendline('''cd /volume1/docker/projecthub-real/source && echo "JDU9xjn1ekx3rev_uma" | sudo -S tee .env > /dev/null << 'EOFENV'
# Application Configuration
APP_ENV=production
APP_NAME=ProjectHub
APP_URL=http://192.168.1.24:5173

# Database Configuration
DB_TYPE=postgresql
DATABASE_URL=postgresql://projecthub:projecthub123@postgres:5432/projecthub_mcp
DB_HOST=postgres
DB_PORT=5432
DB_NAME=projecthub_mcp
DB_USERNAME=projecthub
DB_PASSWORD=projecthub123

# Backend Configuration
BACKEND_PORT=3008
API_URL=http://192.168.1.24:3008

# Frontend Configuration
FRONTEND_PORT=5173
VITE_API_URL=http://192.168.1.24:3008
VITE_WS_URL=ws://192.168.1.24:3008

# Security
JWT_ACCESS_SECRET=your_jwt_secret_here_change_in_production_min_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production_min_32_chars_long

# CORS Configuration
CORS_ORIGIN=http://192.168.1.24:5173

# PostgreSQL Configuration (for docker-compose)
POSTGRES_USER=projecthub
POSTGRES_PASSWORD=projecthub123
POSTGRES_DB=projecthub_mcp
EOFENV''')
    ssh.expect('\\$')
    
    # Use the official docker-compose
    print("✓ Using official docker-compose...")
    ssh.sendline('cd /volume1/docker/projecthub-real/source && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose up -d')
    ssh.expect('\\$', timeout=300)
    
    print("✓ Waiting for services to start...")
    time.sleep(30)
    
    # Check status
    ssh.sendline('cd /volume1/docker/projecthub-real/source && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose ps')
    ssh.expect('\\$')
    print("\nContainer status:")
    print(ssh.before)
    
    # Check running containers
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep -E "(projecthub|postgres)"')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    # Check backend logs
    ssh.sendline('cd /volume1/docker/projecthub-real/source && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose logs backend --tail 20')
    ssh.expect('\\$')
    print("\nBackend logs:")
    print(ssh.before)
    
    # Check frontend logs
    ssh.sendline('cd /volume1/docker/projecthub-real/source && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose logs frontend --tail 20')
    ssh.expect('\\$')
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Official ProjectHub deployment completed\!")
    print("\n🎉 Access your FULL ProjectHub application:")
    print("  Frontend (React Dashboard): http://192.168.1.24:5173")
    print("  Backend API: http://192.168.1.24:3008")
    print("\nThis is your actual sophisticated enterprise project management system\!")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
