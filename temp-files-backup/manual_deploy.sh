#!/bin/bash

# Manual deployment script for ProjectHub to Synology
set -e

echo "🚀 Deploying ProjectHub to Synology NAS"
echo "======================================"

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"
REMOTE_DIR="/volume1/docker/projecthub"

# Step 1: Copy files to Synology
echo "📦 Copying files to Synology..."
scp -P ${SYNOLOGY_PORT} projecthub-source.tar.gz ${SYNOLOGY_USER}@${SYNOLOGY_HOST}:/tmp/
scp -P ${SYNOLOGY_PORT} docker-compose.synology-minimal.yml ${SYNOLOGY_USER}@${SYNOLOGY_HOST}:/tmp/
scp -P ${SYNOLOGY_PORT} .env.synology ${SYNOLOGY_USER}@${SYNOLOGY_HOST}:/tmp/

# Step 2: Execute deployment on Synology
echo "🔧 Executing deployment on Synology..."
ssh -p ${SYNOLOGY_PORT} ${SYNOLOGY_USER}@${SYNOLOGY_HOST} << 'ENDSSH'
set -e

# Create directory structure
echo "Creating directory structure..."
sudo mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub

# Extract source files
echo "Extracting source files..."
sudo tar -xzf /tmp/projecthub-source.tar.gz
sudo cp /tmp/docker-compose.synology-minimal.yml docker-compose.yml
sudo cp /tmp/.env.synology .env

# Clean up temp files
sudo rm /tmp/projecthub-source.tar.gz /tmp/docker-compose.synology-minimal.yml /tmp/.env.synology

# Create necessary directories for volumes
sudo mkdir -p postgres

# Stop any existing containers
echo "Stopping existing containers..."
sudo docker-compose down || true

# Start the services
echo "Starting ProjectHub services..."
sudo docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 45

# Check service status
echo "Checking service status..."
sudo docker-compose ps
sudo docker logs projecthub-backend --tail 20
sudo docker logs projecthub-frontend --tail 20

# Test endpoints
echo "Testing endpoints..."
curl -f http://localhost:3007/api/health || echo "Backend not ready yet"
curl -f http://localhost:5174 || echo "Frontend not ready yet"

echo "✅ Deployment initiated!"
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo "========================"
echo "Access your ProjectHub instance at:"
echo "  Frontend: http://${SYNOLOGY_HOST}:5174"
echo "  Backend API: http://${SYNOLOGY_HOST}:3007/api"
echo "  PostgreSQL: ${SYNOLOGY_HOST}:5433"
echo ""
echo "Note: Services may take a few minutes to fully initialize."