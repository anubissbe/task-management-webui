#!/bin/bash

# Deploy Real Backend Script for ProjectHub
# This replaces the mock backend with the real backend that connects to PostgreSQL

echo "🚀 Deploying real ProjectHub backend to Synology NAS..."

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"
REMOTE_DIR="/volume1/docker/projecthub-real-backend"
CONTAINER_NAME="projecthub-mcp-backend"
NETWORK_NAME="projecthub-mcp-server_projecthub-mcp-network"

# Stop and remove old backend container
echo "📦 Stopping old backend container..."
ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "docker stop $CONTAINER_NAME 2>/dev/null || true"
ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "docker rm $CONTAINER_NAME 2>/dev/null || true"

# Create remote directory
echo "📁 Creating remote directory..."
ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "mkdir -p $REMOTE_DIR"

# Copy deployment package
echo "📤 Uploading backend deployment package..."
scp -P $SYNOLOGY_PORT backend-deployment.tar.gz $SYNOLOGY_USER@$SYNOLOGY_HOST:$REMOTE_DIR/

# Extract and build on Synology
echo "🔧 Extracting and building on Synology..."
ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST << 'EOF'
cd /volume1/docker/projecthub-real-backend
tar -xzf backend-deployment.tar.gz
cd backend

# Build Docker image
echo "🐳 Building Docker image..."
docker build -f Dockerfile.prebuilt -t projecthub-backend:latest .

# Run the real backend
echo "🚀 Starting real backend container..."
docker run -d \
  --name projecthub-mcp-backend \
  --network projecthub-mcp-server_projecthub-mcp-network \
  -p 3008:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-mcp-postgres:5432/projecthub_mcp \
  -e CORS_ORIGIN="*" \
  --restart unless-stopped \
  projecthub-backend:latest

# Check if container is running
sleep 5
docker ps | grep projecthub-mcp-backend

# Show logs
echo "📋 Backend logs:"
docker logs projecthub-mcp-backend --tail 20

# Test the backend
echo "🧪 Testing real backend..."
curl -s http://localhost:3008/health | jq .
EOF

echo "✅ Real backend deployment complete!"
echo ""
echo "🔗 Access points:"
echo "   - Backend API: http://$SYNOLOGY_HOST:3008"
echo "   - Frontend: http://$SYNOLOGY_HOST:5174"
echo ""
echo "📊 The real backend connects to PostgreSQL at:"
echo "   - Host: projecthub-mcp-postgres"
echo "   - Port: 5432"
echo "   - Database: projecthub_mcp"
echo ""
echo "⚠️  Note: The real backend uses actual database data, not mock data!"