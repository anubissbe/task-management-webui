#!/bin/bash
# ProjectHub deployment commands to run on Synology

# Create directories
mkdir -p /volume1/docker/projecthub/{postgres,redis,backend,frontend}
cd /volume1/docker/projecthub

# Extract deployment package
tar -xzf /tmp/projecthub-deployment-package.tar.gz
cd deployment_package

# Copy files to project directory
cp projecthub-source.tar.gz ../
cp docker-compose.synology-minimal.yml ../docker-compose.yml
cp .env.synology ../.env
cp synology_quick_deploy.sh ../

# Move to project directory
cd ..
tar -xzf projecthub-source.tar.gz
rm projecthub-source.tar.gz

# Create data directories
mkdir -p postgres redis

# Stop any existing containers
docker-compose down || true

# Pull required images
docker pull postgres:17-alpine
docker pull node:22-alpine

# Start services
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 30

# Run database migrations
docker exec projecthub-backend sh -c "cd /app/backend && npm run migrate" || echo "Migrations might already be applied"

# Check status
docker-compose ps

echo "Deployment complete!"