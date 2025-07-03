#!/bin/bash

# Deploy Clean ProjectHub to Synology NAS
# This script removes old containers and deploys clean containers from Docker Hub

echo "🚀 Deploying Clean ProjectHub to Synology NAS..."
echo "================================================"

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"
REMOTE_DIR="/volume1/docker/projecthub-clean"

# Function to run command on Synology
run_remote() {
    ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "$1"
}

# Function to copy file to Synology
copy_to_synology() {
    scp -P $SYNOLOGY_PORT "$1" $SYNOLOGY_USER@$SYNOLOGY_HOST:"$2"
}

echo "🧹 Step 1: Cleaning up old containers..."
echo "----------------------------------------"

# Remove all old ProjectHub containers
run_remote "docker stop projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true"
run_remote "docker rm projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true"

# Remove old networks
run_remote "docker network rm projecthub-mcp-server_projecthub-mcp-network 2>/dev/null || true"

# Remove old volumes (CAUTION: This removes all data!)
echo "⚠️  Removing old volumes (this will delete all data)..."
run_remote "docker volume rm projecthub-mcp-server_postgres_data 2>/dev/null || true"

# Remove old images
echo "🗑️  Removing old images..."
run_remote "docker rmi \$(docker images --filter='reference=*projecthub*' -q) 2>/dev/null || true"

echo "✅ Cleanup complete!"
echo ""

echo "📦 Step 2: Setting up clean deployment..."
echo "------------------------------------------"

# Create remote directory
run_remote "mkdir -p $REMOTE_DIR"

# Copy deployment files
echo "📤 Uploading deployment files..."
copy_to_synology "projecthub-clean-deployment.tar.gz" "$REMOTE_DIR/"

# Extract and deploy
echo "🚀 Extracting and deploying..."
run_remote "cd $REMOTE_DIR && tar -xzf projecthub-clean-deployment.tar.gz"

# Pull latest images
echo "📥 Pulling latest clean images from Docker Hub..."
run_remote "docker pull telkombe/projecthub-backend:2.0.0"
run_remote "docker pull telkombe/projecthub-frontend:2.0.0"
run_remote "docker pull postgres:15-alpine"

# Start services
echo "🚀 Starting clean ProjectHub services..."
run_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.clean.yml up -d"

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo "📊 Checking service status..."
run_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.clean.yml ps"

# Test services
echo "🧪 Testing services..."
echo "Database:"
run_remote "docker exec projecthub-mcp-postgres pg_isready -U projecthub -d projecthub_mcp"

echo "Backend:"
run_remote "curl -s http://localhost:3007/health | jq . || curl -s http://localhost:3007/health"

echo "Frontend:"
run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:5174"

echo ""
echo "✅ Clean ProjectHub deployment complete!"
echo ""
echo "🔗 Access Points:"
echo "   - Frontend: http://192.168.1.24:5174"
echo "   - Backend API: http://192.168.1.24:3007"
echo "   - Database: 192.168.1.24:5433"
echo ""
echo "👤 Default Login:"
echo "   - Email: admin@projecthub.com"
echo "   - Password: admin123 (CHANGE THIS!)"
echo ""
echo "📋 To view logs:"
echo "   docker logs projecthub-mcp-backend"
echo "   docker logs projecthub-mcp-frontend"
echo "   docker logs projecthub-mcp-postgres"
