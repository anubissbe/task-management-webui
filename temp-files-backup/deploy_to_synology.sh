#!/bin/bash

# ProjectHub MCP Server Deployment Script for Synology NAS
# This script deploys ProjectHub to Synology NAS at 192.168.1.24

set -e

echo "🚀 ProjectHub MCP Server Deployment to Synology NAS"
echo "=================================================="

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"
PROJECT_NAME="projecthub-mcp-server"
REMOTE_DIR="/volume1/docker/projecthub"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Check if .env.synology exists
if [ ! -f ".env.synology" ]; then
    echo -e "${RED}Error: .env.synology file not found!${NC}"
    echo "Please create .env.synology with your configuration"
    exit 1
fi

# Step 2: Load environment variables
export $(cat .env.synology | grep -v '^#' | xargs)

# Step 3: Build Docker images locally
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker-compose -f docker-compose.synology-deploy.yml build
check_status "Docker images built"

# Step 4: Save Docker images
echo -e "\n${YELLOW}Saving Docker images...${NC}"
docker save projecthub-backend:latest -o projecthub-backend.tar
docker save projecthub-frontend:latest -o projecthub-frontend.tar
check_status "Docker images saved"

# Step 5: Create deployment package
echo -e "\n${YELLOW}Creating deployment package...${NC}"
tar -czf projecthub-deploy.tar.gz \
    docker-compose.synology-deploy.yml \
    .env.synology \
    projecthub-backend.tar \
    projecthub-frontend.tar \
    backend/migrations \
    nginx.conf
check_status "Deployment package created"

# Step 6: Copy to Synology
echo -e "\n${YELLOW}Copying files to Synology...${NC}"
scp -P ${SYNOLOGY_PORT} projecthub-deploy.tar.gz ${SYNOLOGY_USER}@${SYNOLOGY_HOST}:/tmp/
check_status "Files copied to Synology"

# Step 7: Deploy on Synology
echo -e "\n${YELLOW}Deploying on Synology...${NC}"
ssh -p ${SYNOLOGY_PORT} ${SYNOLOGY_USER}@${SYNOLOGY_HOST} << 'ENDSSH'
set -e

# Create project directory
sudo mkdir -p /volume1/docker/projecthub/{postgres,redis,backend,frontend}
cd /volume1/docker/projecthub

# Extract deployment package
sudo tar -xzf /tmp/projecthub-deploy.tar.gz
sudo rm /tmp/projecthub-deploy.tar.gz

# Load Docker images
echo "Loading Docker images..."
sudo docker load -i projecthub-backend.tar
sudo docker load -i projecthub-frontend.tar
sudo rm projecthub-backend.tar projecthub-frontend.tar

# Copy environment file
sudo cp .env.synology .env

# Stop existing containers if any
echo "Stopping existing containers..."
sudo docker-compose -f docker-compose.synology-deploy.yml down || true

# Start new containers
echo "Starting ProjectHub containers..."
sudo docker-compose -f docker-compose.synology-deploy.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run database migrations
echo "Running database migrations..."
sudo docker exec projecthub-backend sh -c "cd /app && npm run migrate" || echo "Migrations may have already been applied"

# Check health
echo "Checking service health..."
curl -f http://localhost:3007/api/health || echo "Backend health check failed"

echo "✅ Deployment complete!"
ENDSSH

check_status "Synology deployment"

# Cleanup local files
echo -e "\n${YELLOW}Cleaning up local files...${NC}"
rm -f projecthub-backend.tar projecthub-frontend.tar projecthub-deploy.tar.gz
check_status "Cleanup completed"

# Display access information
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ProjectHub MCP Server deployed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nAccess your ProjectHub instance at:"
echo -e "  Frontend: ${YELLOW}http://${SYNOLOGY_HOST}:5174${NC}"
echo -e "  Backend API: ${YELLOW}http://${SYNOLOGY_HOST}:3007/api${NC}"
echo -e "  Health Check: ${YELLOW}http://${SYNOLOGY_HOST}:3007/api/health${NC}"
echo -e "\nDefault credentials:"
echo -e "  Register a new admin account at the frontend URL"
echo -e "\nPostgreSQL:"
echo -e "  Host: ${SYNOLOGY_HOST}"
echo -e "  Port: 5433"
echo -e "  Database: projecthub_mcp"
echo -e "  User: projecthub"
echo -e "\n${YELLOW}Note: It may take a few minutes for all services to fully initialize.${NC}"