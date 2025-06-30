#!/bin/bash

# ProjectHub MCP Server Deployment Script for Synology
# Run this script on the Synology NAS

set -e

echo "🚀 ProjectHub MCP Server Deployment"
echo "==================================="

# Create directories
echo "Creating directories..."
mkdir -p /volume1/docker/projecthub/{postgres,redis,backend,frontend}
cd /volume1/docker/projecthub

# Load Docker images
echo "Loading Docker images..."
docker load -i projecthub-backend.tar
docker load -i projecthub-frontend.tar

# Stop existing containers if any
echo "Stopping existing containers..."
docker-compose -f docker-compose.synology-deploy.yml down || true

# Start new containers
echo "Starting ProjectHub containers..."
docker-compose -f docker-compose.synology-deploy.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker exec projecthub-backend sh -c "cd /app && npm run migrate" || echo "Migrations may have already been applied"

# Check health
echo "Checking service health..."
curl -f http://localhost:3007/api/health || echo "Backend health check failed"

echo "✅ Deployment complete!"
echo ""
echo "Access your ProjectHub instance at:"
echo "  Frontend: http://192.168.1.24:5174"
echo "  Backend API: http://192.168.1.24:3007/api"
echo "  Health Check: http://192.168.1.24:3007/api/health"