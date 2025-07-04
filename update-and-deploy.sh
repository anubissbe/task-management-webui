#!/bin/bash

# Quick update and deploy script
# Run this on your Synology to pull latest changes and redeploy

echo "🔄 ProjectHub Update & Deploy Script"
echo "===================================="

# Configuration
PROJECT_DIR="/volume1/docker/projecthub-mcp-server"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to project directory
cd $PROJECT_DIR || {
    echo -e "${RED}✗${NC} Failed to navigate to project directory: $PROJECT_DIR"
    exit 1
}

# Step 1: Pull latest changes
echo ""
echo "📥 Pulling latest changes from git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Git pull failed!"
    exit 1
fi
echo -e "${GREEN}✓${NC} Successfully pulled latest changes"

# Step 2: Check what changed
echo ""
echo "📋 Recent commits:"
git log --oneline -5

# Step 3: Rebuild containers
echo ""
echo "🔨 Rebuilding Docker containers..."
docker-compose down
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Docker build failed!"
    exit 1
fi
echo -e "${GREEN}✓${NC} Containers built successfully"

# Step 4: Start new containers
echo ""
echo "🚀 Starting new containers..."
docker-compose up -d

# Step 5: Verify deployment
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "📋 Webhook fix verification:"
echo "1. Backend API: http://192.168.1.24:3010/api/webhooks"
echo "2. Frontend UI: http://192.168.1.24:5174"
echo "3. Check logs: docker logs -f projecthub-mcp-backend"
echo ""
echo "🧪 Test the fix:"
echo "- Go to Settings > Webhooks in the UI"
echo "- Add your Slack webhook URL"
echo "- Click 'Test' - should work without CORS errors!"
echo "- Create a task - should trigger Slack notification"