#!/bin/bash

# Deployment script for webhook fix
# This script rebuilds containers and deploys them to Synology

echo "🚀 ProjectHub Webhook Fix Deployment Script"
echo "=========================================="

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_PORT="2222"
SYNOLOGY_USER="Bert"
DEPLOY_PATH="/volume1/docker/projecthub-mcp-server"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "📋 Deployment Steps:"
echo "1. Build new Docker images locally"
echo "2. Save images to tar files"
echo "3. Transfer to Synology"
echo "4. Load and deploy on Synology"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Step 1: Build Docker images
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    print_error "Docker build failed!"
    exit 1
fi
print_status "Docker images built successfully"

# Step 2: Save Docker images
echo ""
echo "💾 Saving Docker images..."
mkdir -p ./deployment-temp

# Get image names from docker-compose
BACKEND_IMAGE="projecthub-mcp-server-backend:latest"
FRONTEND_IMAGE="projecthub-mcp-server-frontend:latest"

docker save $BACKEND_IMAGE -o ./deployment-temp/backend.tar
docker save $FRONTEND_IMAGE -o ./deployment-temp/frontend.tar

print_status "Docker images saved"

# Step 3: Create deployment package
echo ""
echo "📦 Creating deployment package..."
cp docker-compose.yml ./deployment-temp/
cp -r nginx ./deployment-temp/ 2>/dev/null || true

# Create deployment script for Synology
cat > ./deployment-temp/deploy-on-synology.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying ProjectHub on Synology..."

# Load Docker images
echo "Loading backend image..."
docker load -i backend.tar

echo "Loading frontend image..."
docker load -i frontend.tar

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start new containers
echo "Starting new containers..."
docker-compose up -d

# Check status
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 To verify the webhook fix:"
echo "1. Check backend logs: docker logs projecthub-mcp-backend"
echo "2. Access frontend at: http://192.168.1.24:5174"
echo "3. Test webhook configuration in Settings > Webhooks"
EOF

chmod +x ./deployment-temp/deploy-on-synology.sh

# Step 4: Transfer to Synology
echo ""
echo "📤 Transferring to Synology..."
echo "   Host: $SYNOLOGY_HOST:$SYNOLOGY_PORT"
echo "   Path: $DEPLOY_PATH"

# Create directory on Synology
ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "mkdir -p $DEPLOY_PATH/webhook-fix-deployment"

# Transfer files
scp -P $SYNOLOGY_PORT ./deployment-temp/* $SYNOLOGY_USER@$SYNOLOGY_HOST:$DEPLOY_PATH/webhook-fix-deployment/

if [ $? -ne 0 ]; then
    print_error "Transfer failed!"
    exit 1
fi
print_status "Files transferred successfully"

# Step 5: Execute deployment on Synology
echo ""
echo "🎯 Executing deployment on Synology..."
ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "cd $DEPLOY_PATH/webhook-fix-deployment && bash deploy-on-synology.sh"

# Cleanup
echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf ./deployment-temp

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Verify containers are running: http://$SYNOLOGY_HOST:5174"
echo "2. Test webhook functionality:"
echo "   - Go to Settings > Webhooks"
echo "   - Add a Slack webhook URL"
echo "   - Click 'Test' button (no more CORS errors!)"
echo "   - Create a task to test automatic notifications"
echo ""
echo "📊 To monitor webhook activity:"
echo "   ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST"
echo "   docker logs -f projecthub-mcp-backend | grep -i webhook"