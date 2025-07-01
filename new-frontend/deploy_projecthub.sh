#!/bin/bash
# Deploy ProjectHub to Synology NAS

set -e

echo "🚀 Deploying ProjectHub to Synology NAS..."

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_PORT="2222"
SYNOLOGY_USER="Bert"
SYNOLOGY_PASSWORD="JDU9xjn1ekx3rev_uma"
LOCAL_PACKAGE="/tmp/projecthub-deploy.tar.gz"
REMOTE_DIR="/volume1/docker/projecthub"

# Check if package exists
if [ ! -f "$LOCAL_PACKAGE" ]; then
    echo "❌ Deployment package not found: $LOCAL_PACKAGE"
    exit 1
fi

echo "📦 Found deployment package: $LOCAL_PACKAGE"

# Create deployment script to run on Synology
cat > /tmp/deploy_on_synology.sh << 'EOF'
#!/bin/bash
set -e

REMOTE_DIR="/volume1/docker/projecthub"
PACKAGE_FILE="$REMOTE_DIR/projecthub-deploy.tar.gz"

echo "Creating directory..."
mkdir -p "$REMOTE_DIR"

echo "Extracting package..."
cd "$REMOTE_DIR"
tar -xzf "$PACKAGE_FILE"

echo "Building and starting Docker containers..."
cd "$REMOTE_DIR"
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

echo "Checking container status..."
docker-compose ps

echo "✅ Deployment complete!"
EOF

# Make deployment script executable
chmod +x /tmp/deploy_on_synology.sh

# Use expect to handle SSH password authentication
cat > /tmp/deploy_expect.exp << EOF
#!/usr/bin/expect -f
set timeout 300

# Copy package file
spawn scp -P $SYNOLOGY_PORT $LOCAL_PACKAGE $SYNOLOGY_USER@$SYNOLOGY_HOST:$REMOTE_DIR/
expect "password:"
send "$SYNOLOGY_PASSWORD\r"
expect eof

# Copy deployment script
spawn scp -P $SYNOLOGY_PORT /tmp/deploy_on_synology.sh $SYNOLOGY_USER@$SYNOLOGY_HOST:/tmp/
expect "password:"
send "$SYNOLOGY_PASSWORD\r"
expect eof

# Execute deployment script
spawn ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "/bin/bash /tmp/deploy_on_synology.sh"
expect "password:"
send "$SYNOLOGY_PASSWORD\r"
expect eof
EOF

# Check if expect is installed
if ! command -v expect &> /dev/null; then
    echo "❌ 'expect' is not installed. Trying alternative approach..."
    
    # Alternative: Use Python for deployment
    python3 << PYTHON_EOF
import paramiko
import os
import sys

host = "$SYNOLOGY_HOST"
port = $SYNOLOGY_PORT
username = "$SYNOLOGY_USER"
password = "$SYNOLOGY_PASSWORD"
local_package = "$LOCAL_PACKAGE"
remote_dir = "$REMOTE_DIR"

try:
    # Create SSH client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print("🔗 Connecting to Synology...")
    ssh.connect(host, port=port, username=username, password=password)
    
    # Create remote directory
    print("📁 Creating remote directory...")
    stdin, stdout, stderr = ssh.exec_command(f"mkdir -p {remote_dir}")
    stdout.read()
    
    # Upload package
    print("📤 Uploading deployment package...")
    sftp = ssh.open_sftp()
    sftp.put(local_package, f"{remote_dir}/projecthub-deploy.tar.gz")
    
    # Extract and deploy
    print("📦 Extracting package...")
    commands = [
        f"cd {remote_dir} && tar -xzf projecthub-deploy.tar.gz",
        f"cd {remote_dir} && docker-compose down 2>/dev/null || true",
        f"cd {remote_dir} && docker-compose build",
        f"cd {remote_dir} && docker-compose up -d"
    ]
    
    for cmd in commands:
        print(f"🔧 Running: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print(out)
        if err and "WARNING" not in err:
            print(f"Error: {err}")
    
    # Check status
    print("📊 Checking container status...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {remote_dir} && docker-compose ps")
    print(stdout.read().decode())
    
    print("✅ Deployment complete!")
    print("🌐 ProjectHub backend: http://192.168.1.24:3007")
    print("🌐 ProjectHub frontend: http://192.168.1.24:5174")
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Deployment failed: {e}")
    sys.exit(1)
PYTHON_EOF
else
    echo "📦 Using expect for deployment..."
    expect /tmp/deploy_expect.exp
fi

# Cleanup
rm -f /tmp/deploy_on_synology.sh /tmp/deploy_expect.exp

echo "🎉 Deployment process completed!"
echo "🌐 Access ProjectHub at:"
echo "   - Backend API: http://192.168.1.24:3007"
echo "   - Frontend UI: http://192.168.1.24:5174"