#!/bin/bash
# Automated deployment attempt script

set -e
echo "🚀 Attempting automated deployment to Synology"
echo "============================================="

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"

# Step 1: Try to copy files using curl to a web endpoint if available
echo "📦 Checking alternative deployment methods..."

# Check if we can reach Synology
if ping -c 1 ${SYNOLOGY_HOST} &> /dev/null; then
    echo "✅ Synology is reachable"
else
    echo "❌ Cannot reach Synology at ${SYNOLOGY_HOST}"
    exit 1
fi

# Check if Docker endpoint is available
echo "🐳 Checking Docker availability..."
if curl -s http://${SYNOLOGY_HOST}:3001/tools/list > /dev/null; then
    echo "✅ Synology MCP server is responding"
else
    echo "⚠️  Synology MCP server may not have file operation capabilities"
fi

# Alternative: Create a deployment package with instructions
echo "📦 Creating deployment package with instructions..."
mkdir -p deployment_package
cp projecthub-source.tar.gz deployment_package/
cp docker-compose.synology-minimal.yml deployment_package/
cp .env.synology deployment_package/
cp synology_quick_deploy.sh deployment_package/
cp DEPLOYMENT_GUIDE.md deployment_package/

# Create a README for the package
cat > deployment_package/README.txt << 'EOF'
PROJECTHUB DEPLOYMENT PACKAGE
============================

This package contains everything needed to deploy ProjectHub to Synology.

Files included:
- projecthub-source.tar.gz: Application source code
- docker-compose.synology-minimal.yml: Docker configuration
- .env.synology: Environment configuration
- synology_quick_deploy.sh: Quick deployment script
- DEPLOYMENT_GUIDE.md: Detailed deployment guide

QUICK DEPLOYMENT:
1. Copy all files to Synology /tmp directory
2. SSH to Synology: ssh -p 2222 Bert@192.168.1.24
3. Run: sudo bash /tmp/synology_quick_deploy.sh

MANUAL DEPLOYMENT:
See DEPLOYMENT_GUIDE.md for detailed instructions.
EOF

# Create tarball of deployment package
tar -czf projecthub-deployment-package.tar.gz deployment_package/
rm -rf deployment_package/

echo ""
echo "📦 Deployment package created: projecthub-deployment-package.tar.gz"
echo ""
echo "Since automated SSH deployment requires authentication, please:"
echo "1. Copy projecthub-deployment-package.tar.gz to your Synology"
echo "2. Extract it and follow the README.txt instructions"
echo ""
echo "Or manually copy these files to Synology /tmp:"
echo "  - projecthub-source.tar.gz"
echo "  - docker-compose.synology-minimal.yml" 
echo "  - .env.synology"
echo ""
echo "Then SSH to Synology and run:"
echo "  sudo bash /tmp/synology_quick_deploy.sh"