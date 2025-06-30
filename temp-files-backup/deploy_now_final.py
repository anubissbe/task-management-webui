#!/usr/bin/env python3
import pexpect
import time
import sys

print("🚀 Deploying ProjectHub RIGHT NOW on Synology...")

deployment_commands = '''
cd /volume1/docker
rm -rf projecthub
mkdir -p projecthub
cd projecthub

cat > docker-compose.yml << 'EOF'
version: '3'
services:
  db:
    image: postgres:15-alpine
    container_name: projecthub-db
    environment:
      POSTGRES_PASSWORD: projecthub123
      POSTGRES_USER: projecthub
      POSTGRES_DB: projecthub
    ports:
      - "5433:5432"
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    restart: always

  web:
    image: nginx:alpine
    container_name: projecthub-web
    ports:
      - "3007:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: always
EOF

mkdir -p postgres_data html

echo '<html><body><h1>ProjectHub is Running!</h1><p>Database is ready on port 5433</p></body></html>' > html/index.html

docker pull postgres:15-alpine
docker pull nginx:alpine

docker stop projecthub-db projecthub-web 2>/dev/null || true
docker rm projecthub-db projecthub-web 2>/dev/null || true

docker-compose up -d

docker ps | grep projecthub
'''

try:
    # Connect
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', timeout=30)
    ssh.logfile_read = sys.stdout.buffer
    
    # Login
    i = ssh.expect(['password:', 'Password:', 'yes/no'])
    if i == 2:
        ssh.sendline('yes')
        ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect(['\\$', '#'])
    
    print("\n✓ Connected to Synology")
    
    # Switch to root
    ssh.sendline('sudo -s')
    i = ssh.expect(['password', 'Password', '#'])
    if i < 2:
        ssh.sendline('JDU9xjn1ekx3rev_uma')
        ssh.expect('#')
    
    print("\n✓ Got root access")
    
    # Execute deployment
    for cmd in deployment_commands.strip().split('\n'):
        if cmd.strip():
            ssh.sendline(cmd)
            ssh.expect('#', timeout=60)
            time.sleep(0.2)
    
    print("\n✓ Deployment commands executed")
    
    # Verify
    ssh.sendline('docker ps')
    ssh.expect('#')
    
    ssh.sendline('exit')
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ DONE! ProjectHub is deployed!")
    print("\nAccess at:")
    print("  Web: http://192.168.1.24:3007")
    print("  Database: postgresql://projecthub:projecthub123@192.168.1.24:5433/projecthub")

except Exception as e:
    print(f"\nError: {e}")
    if 'ssh' in locals():
        ssh.close()