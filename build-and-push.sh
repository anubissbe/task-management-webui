#!/bin/bash
# Build and push ProjectHub images to Docker Hub

set -e

echo "🚀 Building and pushing ProjectHub images..."

# Build images
echo "📦 Building backend..."
docker build -t anubissbe/projecthub-backend:latest ./backend-fix

echo "📦 Building frontend..."
docker build -t anubissbe/projecthub-frontend:latest ./frontend

# Login to Docker Hub (will use stored credentials)
echo "🔐 Logging in to Docker Hub..."
docker login

# Push images
echo "⬆️ Pushing backend..."
docker push anubissbe/projecthub-backend:latest

echo "⬆️ Pushing frontend..."
docker push anubissbe/projecthub-frontend:latest

# Tag with version
VERSION="1.0.0"
docker tag anubissbe/projecthub-backend:latest anubissbe/projecthub-backend:${VERSION}
docker tag anubissbe/projecthub-frontend:latest anubissbe/projecthub-frontend:${VERSION}

docker push anubissbe/projecthub-backend:${VERSION}
docker push anubissbe/projecthub-frontend:${VERSION}

echo "✅ Images pushed successfully!"
echo ""
echo "📋 Deployment instructions:"
echo "1. On target server, pull images:"
echo "   docker pull anubissbe/projecthub-backend:latest"
echo "   docker pull anubissbe/projecthub-frontend:latest"
echo ""
echo "2. Use docker-compose.yml to deploy:"
echo "   docker-compose up -d"