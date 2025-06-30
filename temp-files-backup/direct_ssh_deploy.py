#!/usr/bin/env python3
import socket
import time
import base64

# Create a direct SSH connection
HOST = '192.168.1.24'
PORT = 2222
USER = 'Bert'
PASS = 'JDU9xjn1ekx3rev_uma'

# Read the deployment bundle
with open('projecthub-complete-bundle.tar.gz', 'rb') as f:
    bundle_data = f.read()

# Create deployment script with embedded data
deploy_script = f'''#!/bin/bash
cd /tmp
echo "Creating deployment bundle..."
cat > projecthub.b64 << 'BUNDLE_EOF'
{base64.b64encode(bundle_data).decode()}
BUNDLE_EOF

echo "Decoding bundle..."
base64 -d projecthub.b64 > projecthub-complete-bundle.tar.gz
rm projecthub.b64

echo "Deploying ProjectHub..."
sudo mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub
sudo tar -xzf /tmp/projecthub-complete-bundle.tar.gz
sudo docker-compose -f docker-compose.synology-minimal.yml down 2>/dev/null || true
sudo docker-compose -f docker-compose.synology-minimal.yml up -d
sudo rm /tmp/projecthub-complete-bundle.tar.gz
echo "Deployment complete!"
'''

# Save deployment script
with open('/tmp/deploy_projecthub.sh', 'w') as f:
    f.write(deploy_script)

print("Deployment script created with embedded bundle")
print(f"Script size: {len(deploy_script) / 1024 / 1024:.2f} MB")