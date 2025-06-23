#!/bin/bash
# Script to manually build and publish Docker images to Docker Hub
# This can be used while waiting for CI/CD setup

set -e

echo "🐳 Building and publishing ProjectHub-MCP Docker images to Docker Hub..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Docker Hub username
DOCKERHUB_USERNAME="anubissbe"

# Image names
FRONTEND_IMAGE="$DOCKERHUB_USERNAME/projecthub-mcp-frontend"
BACKEND_IMAGE="$DOCKERHUB_USERNAME/projecthub-mcp-backend"

# Get version from package.json
VERSION=$(cat package.json | grep '"version"' | cut -d '"' -f 4)

echo -e "${YELLOW}Building images for version: $VERSION${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -t $FRONTEND_IMAGE:latest -t $FRONTEND_IMAGE:$VERSION ./frontend

# Build backend  
echo -e "${YELLOW}Building backend image...${NC}"
docker build -t $BACKEND_IMAGE:latest -t $BACKEND_IMAGE:$VERSION ./backend

# Login to Docker Hub
echo -e "${YELLOW}Please log in to Docker Hub:${NC}"
docker login -u $DOCKERHUB_USERNAME

# Push images
echo -e "${YELLOW}Pushing frontend image...${NC}"
docker push $FRONTEND_IMAGE:latest
docker push $FRONTEND_IMAGE:$VERSION

echo -e "${YELLOW}Pushing backend image...${NC}"
docker push $BACKEND_IMAGE:latest
docker push $BACKEND_IMAGE:$VERSION

echo -e "${GREEN}✅ Successfully published images to Docker Hub!${NC}"
echo -e "${GREEN}Images available at:${NC}"
echo -e "  - $FRONTEND_IMAGE:latest"
echo -e "  - $FRONTEND_IMAGE:$VERSION"
echo -e "  - $BACKEND_IMAGE:latest"
echo -e "  - $BACKEND_IMAGE:$VERSION"

echo -e "${YELLOW}Users can now deploy with:${NC}"
echo "mkdir projecthub && cd projecthub"
echo "curl -L https://raw.githubusercontent.com/anubissbe/ProjectHub-Mcp/main/docker-compose.images.yml -o docker-compose.yml"
echo "curl -L https://raw.githubusercontent.com/anubissbe/ProjectHub-Mcp/main/.env.quickstart -o .env"
echo "docker-compose up -d"