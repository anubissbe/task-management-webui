#!/bin/bash
# Build and push ProjectHub images to Docker Hub

set -e

echo "🚀 Building and pushing ProjectHub images..."

# Docker Hub username (update this to your username)
DOCKER_USER=telkombe

# Build images
echo "📦 Building backend..."
docker build -t ${DOCKER_USER}/projecthub-backend:latest ./backend-fix

echo "📦 Building frontend..."
docker build -t ${DOCKER_USER}/projecthub-frontend:latest ./frontend

# Login to Docker Hub (will use stored credentials)
echo "🔐 Logging in to Docker Hub..."
docker login

# Push images
echo "⬆️ Pushing backend..."
docker push ${DOCKER_USER}/projecthub-backend:latest

echo "⬆️ Pushing frontend..."
docker push ${DOCKER_USER}/projecthub-frontend:latest

# Tag with version
VERSION="1.0.0"
docker tag ${DOCKER_USER}/projecthub-backend:latest ${DOCKER_USER}/projecthub-backend:${VERSION}
docker tag ${DOCKER_USER}/projecthub-frontend:latest ${DOCKER_USER}/projecthub-frontend:${VERSION}

docker push ${DOCKER_USER}/projecthub-backend:${VERSION}
docker push ${DOCKER_USER}/projecthub-frontend:${VERSION}

echo "✅ Images pushed successfully!"
echo ""
echo "📋 Deployment instructions:"
echo "1. On target server, pull images:"
echo "   docker pull ${DOCKER_USER}/projecthub-backend:latest"
echo "   docker pull ${DOCKER_USER}/projecthub-frontend:latest"
echo ""
echo "2. Use docker-compose.yml to deploy:"
echo "   docker-compose up -d"