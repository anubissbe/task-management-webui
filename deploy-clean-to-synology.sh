#!/bin/bash

# ProjectHub Clean Deployment Script for Synology NAS
# This script deploys the clean ProjectHub containers to Synology NAS

set -e

echo "🚀 Starting ProjectHub Clean Deployment to Synology NAS"
echo "================================================="

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_PORT="2222"
SYNOLOGY_USER="Bert"
DEPLOY_DIR="/volume1/docker/projecthub-clean"
PACKAGE_PATH="/opt/projects/projects/projecthub-mcp-server/projecthub-clean-deployment.tar.gz"
TEMP_DIR="/volume1/docker/temp"

# Docker images to use
BACKEND_IMAGE="telkombe/projecthub-backend:2.0.0"
FRONTEND_IMAGE="telkombe/projecthub-frontend:2.0.0"
POSTGRES_IMAGE="postgres:15-alpine"

echo "📦 Copying deployment package to Synology..."
scp -P ${SYNOLOGY_PORT} "${PACKAGE_PATH}" "${SYNOLOGY_USER}@${SYNOLOGY_HOST}:${TEMP_DIR}/"

echo "🔧 Executing deployment commands on Synology..."
ssh -p ${SYNOLOGY_PORT} ${SYNOLOGY_USER}@${SYNOLOGY_HOST} << 'EOF'
set -e

echo "🛑 Stopping and removing old ProjectHub containers..."
# Stop containers if they exist
docker stop projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true

# Remove containers if they exist
docker rm projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true

# Remove old networks
docker network rm projecthub-mcp-server_projecthub-mcp-network 2>/dev/null || true

# Remove old volumes (be careful here)
docker volume rm projecthub-mcp-server_postgres_data 2>/dev/null || true

echo "🗂️ Creating deployment directory..."
mkdir -p /volume1/docker/projecthub-clean
cd /volume1/docker/projecthub-clean

echo "📦 Extracting deployment package..."
tar -xzf /volume1/docker/temp/projecthub-clean-deployment.tar.gz

echo "🐳 Pulling Docker images..."
docker pull telkombe/projecthub-backend:2.0.0
docker pull telkombe/projecthub-frontend:2.0.0
docker pull postgres:15-alpine

echo "🚀 Starting services with docker-compose..."
docker-compose -f docker-compose.clean.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking container status..."
docker ps | grep projecthub

echo "🏥 Checking service health..."
echo "Backend health check:"
curl -f http://localhost:3007/health || echo "Backend health check failed"

echo "Frontend health check:"
curl -f http://localhost:5174/ || echo "Frontend health check failed"

echo "Database health check:"
docker exec projecthub-mcp-postgres pg_isready -U projecthub -d projecthub_mcp || echo "Database health check failed"

echo "📊 Container logs (last 10 lines):"
echo "=== Backend logs ==="
docker logs --tail 10 projecthub-mcp-backend

echo "=== Frontend logs ==="
docker logs --tail 10 projecthub-mcp-frontend

echo "=== Database logs ==="
docker logs --tail 10 projecthub-mcp-postgres

echo "✅ Deployment completed!"
echo "Frontend URL: http://192.168.1.24:5174"
echo "Backend URL: http://192.168.1.24:3007"
echo "Database Port: 5433"

EOF

echo "🎉 ProjectHub Clean Deployment Complete!"
echo "======================================="
echo "Services are now running on Synology NAS:"
echo "- Frontend: http://192.168.1.24:5174"
echo "- Backend: http://192.168.1.24:3007"
echo "- Database: Port 5433"
echo ""
echo "To check status: ssh -p 2222 Bert@192.168.1.24 'docker ps | grep projecthub'"