#!/bin/bash

# Build and push ProjectHub-MCP frontend to GitHub Container Registry
# Run this script from the project root directory

set -e

echo "🚀 Building and pushing ProjectHub-MCP Frontend to GitHub Container Registry"

# Variables
REGISTRY="ghcr.io"
NAMESPACE="anubissbe"
IMAGE_NAME="projecthub-mcp-frontend"
VERSION="v1.0.0"

# Set git config
echo "📝 Setting git configuration..."
git config user.name "anubissbe"
git config user.email "bert@telkom.be"

# Navigate to frontend directory
cd frontend

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION} \
             -t ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:latest .

# Login to GitHub Container Registry
echo "🔐 Logging in to GitHub Container Registry..."
echo "Please ensure you have set GITHUB_TOKEN environment variable"
echo $GITHUB_TOKEN | docker login ${REGISTRY} -u ${NAMESPACE} --password-stdin

# Push the images
echo "📤 Pushing images to registry..."
docker push ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}
docker push ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:latest

echo "✅ Successfully built and pushed:"
echo "   - ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"
echo "   - ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:latest"

# Create deployment instructions
cat > DEPLOYMENT_INSTRUCTIONS.md << EOF
# ProjectHub-MCP Frontend Deployment

The frontend has been built and pushed to GitHub Container Registry.

## Images
- \`ghcr.io/anubissbe/projecthub-mcp-frontend:latest\`
- \`ghcr.io/anubissbe/projecthub-mcp-frontend:v1.0.0\`

## Pulling the Image
\`\`\`bash
docker pull ghcr.io/anubissbe/projecthub-mcp-frontend:latest
\`\`\`

## Running the Container
\`\`\`bash
docker run -d -p 5173:5173 --name projecthub-frontend ghcr.io/anubissbe/projecthub-mcp-frontend:latest
\`\`\`

## Docker Compose
\`\`\`yaml
services:
  frontend:
    image: ghcr.io/anubissbe/projecthub-mcp-frontend:latest
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001
    restart: unless-stopped
\`\`\`

## Features
- ✅ Black/Orange theme
- ✅ ProjectHub branding
- ✅ Working navigation links
- ✅ Dark mode support
- ✅ MCP Protocol integration
EOF

echo "📄 Deployment instructions written to DEPLOYMENT_INSTRUCTIONS.md"