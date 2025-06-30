#!/bin/bash

# Automated deployment script for ProjectHub on Synology
# This script uses expect to handle SSH password authentication

echo "🚀 Automated ProjectHub Deployment to Synology"
echo "============================================="

# Install expect if not available
if ! command -v expect &> /dev/null; then
    echo "Installing expect..."
    sudo apt-get update && sudo apt-get install -y expect
fi

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_PORT="2222"
SYNOLOGY_USER="Bert"
SYNOLOGY_PASSWORD="JDU9xjn1ekx3rev_uma"
LOCAL_IP="172.28.173.145"

# Start HTTP server in background
echo "Starting HTTP server..."
python3 -m http.server 8080 &
HTTP_PID=$!
sleep 2

# Create expect script
cat > /tmp/deploy_expect.exp << EOF
#!/usr/bin/expect -f

set timeout 300

# SSH to Synology and download bundle
spawn ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST

expect {
    "password:" {
        send "$SYNOLOGY_PASSWORD\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$SYNOLOGY_PASSWORD\r"
    }
}

expect "$ "

# Download bundle
send "cd /tmp\r"
expect "$ "
send "wget -q http://$LOCAL_IP:8080/projecthub-complete-bundle.tar.gz\r"
expect "$ "

# Create directory and extract
send "sudo mkdir -p /volume1/docker/projecthub\r"
expect {
    "password for" {
        send "$SYNOLOGY_PASSWORD\r"
        expect "$ "
    }
    "$ " {}
}

send "cd /volume1/docker/projecthub\r"
expect "$ "

send "sudo tar -xzf /tmp/projecthub-complete-bundle.tar.gz\r"
expect "$ "

# Start services
send "sudo docker-compose -f docker-compose.synology-minimal.yml up -d\r"
expect "$ "

send "echo 'Deployment complete!'\r"
expect "$ "

send "exit\r"
expect eof
EOF

# Run expect script
chmod +x /tmp/deploy_expect.exp
expect /tmp/deploy_expect.exp

# Kill HTTP server
kill $HTTP_PID

# Clean up
rm /tmp/deploy_expect.exp

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access ProjectHub at:"
echo "  Frontend: http://192.168.1.24:5174"
echo "  Backend API: http://192.168.1.24:3007/api"